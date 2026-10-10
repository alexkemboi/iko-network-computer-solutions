/*
  IKONEX — full database build for SQL Server Express (localhost\SQLEXPRESS)

  Run as sa (or any sysadmin):
    sqlcmd -S localhost\SQLEXPRESS -U sa -P "<sa password>" -i server\db\ikonex-database.sql
  or open in SSMS and press Execute.

  Safe to run again: every object is created only if it's missing.
  Matches server/lib/schema.mjs, so the app (`npm run db:setup` / `npm start`)
  finds everything it expects. Accounts are created by people signing up at
  /#/login — the first account becomes the Administrator.
*/

SET NOCOUNT ON;
GO

-- 1) Database --------------------------------------------------------------
IF DB_ID(N'ikonex') IS NULL
BEGIN
    CREATE DATABASE [ikonex];
    PRINT 'Created database ikonex';
END
ELSE PRINT 'Database ikonex already exists';
GO

USE [ikonex];
GO

-- 2) Users: people who sign up / log in ------------------------------------
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
CREATE TABLE dbo.Users (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    FullName      NVARCHAR(120) NOT NULL,
    Email         NVARCHAR(200) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,
    Phone         NVARCHAR(20)  NULL,
    PasswordHash  NVARCHAR(300) NOT NULL,           -- scrypt hash, never the plain password
    Role          NVARCHAR(20)  NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'customer',
    IsActive      BIT           NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
    CreatedAt     DATETIME2     NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    LastLoginAt   DATETIME2     NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Users_Role')
    ALTER TABLE dbo.Users ADD CONSTRAINT CK_Users_Role CHECK (Role IN (N'admin', N'staff', N'customer'));
GO

-- 3) Products & services catalogue -----------------------------------------
IF OBJECT_ID(N'dbo.CatalogItems', N'U') IS NULL
CREATE TABLE dbo.CatalogItems (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Kind         NVARCHAR(20)   NOT NULL,            -- product | service
    Name         NVARCHAR(160)  NOT NULL,
    Section      NVARCHAR(80)   NULL,
    Category     NVARCHAR(80)   NULL,
    Description  NVARCHAR(1000) NULL,
    Price        DECIMAL(12,2)  NULL,
    IsActive     BIT            NOT NULL CONSTRAINT DF_Catalog_IsActive DEFAULT 1,
    CreatedAt    DATETIME2      NOT NULL CONSTRAINT DF_Catalog_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2      NULL
);
GO

-- 4) Orders ------------------------------------------------------------------
IF OBJECT_ID(N'dbo.Orders', N'U') IS NULL
CREATE TABLE dbo.Orders (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    OrderNo       NVARCHAR(30)   NOT NULL CONSTRAINT UQ_Orders_OrderNo UNIQUE,
    UserId        INT            NULL CONSTRAINT FK_Orders_Users REFERENCES dbo.Users(Id),
    CustomerName  NVARCHAR(120)  NOT NULL,
    Phone         NVARCHAR(20)   NOT NULL,
    ItemName      NVARCHAR(160)  NOT NULL,
    Section       NVARCHAR(80)   NULL,
    Category      NVARCHAR(80)   NULL,
    Amount        DECIMAL(12,2)  NOT NULL,
    Status        NVARCHAR(20)   NOT NULL CONSTRAINT DF_Orders_Status DEFAULT N'pending',
    Notes         NVARCHAR(1000) NULL,
    CreatedAt     DATETIME2      NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2      NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Orders_UserId')
    CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);
GO

-- 5) M-Pesa payments (STK push) ------------------------------------------------
IF OBJECT_ID(N'dbo.Payments', N'U') IS NULL
CREATE TABLE dbo.Payments (
    Id                 INT IDENTITY(1,1) PRIMARY KEY,
    OrderId            INT           NULL CONSTRAINT FK_Payments_Orders REFERENCES dbo.Orders(Id),
    CheckoutRequestId  NVARCHAR(80)  NULL,
    MerchantRequestId  NVARCHAR(80)  NULL,
    Phone              NVARCHAR(20)  NOT NULL,
    Amount             DECIMAL(12,2) NOT NULL,
    Status             NVARCHAR(20)  NOT NULL CONSTRAINT DF_Payments_Status DEFAULT N'pending',
    ResultCode         NVARCHAR(20)  NULL,
    ResultDesc         NVARCHAR(300) NULL,
    MpesaReceipt       NVARCHAR(40)  NULL,
    CreatedAt          DATETIME2     NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt          DATETIME2     NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_Checkout')
    CREATE INDEX IX_Payments_Checkout ON dbo.Payments(CheckoutRequestId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_OrderId')
    CREATE INDEX IX_Payments_OrderId ON dbo.Payments(OrderId);
GO

-- 6) Bulk SMS ----------------------------------------------------------------
IF OBJECT_ID(N'dbo.SmsCampaigns', N'U') IS NULL
CREATE TABLE dbo.SmsCampaigns (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Message         NVARCHAR(1600) NOT NULL,
    SenderId        NVARCHAR(20)   NULL,
    Audience        NVARCHAR(40)   NULL,
    RecipientCount  INT NOT NULL CONSTRAINT DF_Sms_Recipients DEFAULT 0,
    SentCount       INT NOT NULL CONSTRAINT DF_Sms_Sent DEFAULT 0,
    FailedCount     INT NOT NULL CONSTRAINT DF_Sms_Failed DEFAULT 0,
    DeliveredCount  INT NOT NULL CONSTRAINT DF_Sms_Delivered DEFAULT 0,
    Cost            NVARCHAR(40)   NULL,
    Status          NVARCHAR(20)   NOT NULL CONSTRAINT DF_Sms_Status DEFAULT N'queued',
    CreatedBy       INT            NULL CONSTRAINT FK_Sms_Users REFERENCES dbo.Users(Id),
    CreatedAt       DATETIME2      NOT NULL CONSTRAINT DF_Sms_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID(N'dbo.SmsMessages', N'U') IS NULL
CREATE TABLE dbo.SmsMessages (
    Id                 INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId         INT           NOT NULL CONSTRAINT FK_SmsMsg_Campaign REFERENCES dbo.SmsCampaigns(Id),
    Phone              NVARCHAR(20)  NOT NULL,
    Status             NVARCHAR(40)  NOT NULL CONSTRAINT DF_SmsMsg_Status DEFAULT N'queued',
    ProviderMessageId  NVARCHAR(80)  NULL,
    Cost               NVARCHAR(40)  NULL,
    Error              NVARCHAR(300) NULL,
    UpdatedAt          DATETIME2     NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SmsMessages_Provider')
    CREATE INDEX IX_SmsMessages_Provider ON dbo.SmsMessages(ProviderMessageId);
GO

-- 7) Bulk payments (M-Pesa B2C) -----------------------------------------------
IF OBJECT_ID(N'dbo.PayoutBatches', N'U') IS NULL
CREATE TABLE dbo.PayoutBatches (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Title        NVARCHAR(160)  NOT NULL,
    CommandId    NVARCHAR(40)   NOT NULL,
    ItemCount    INT            NOT NULL,
    TotalAmount  DECIMAL(14,2)  NOT NULL,
    Status       NVARCHAR(30)   NOT NULL CONSTRAINT DF_Batch_Status DEFAULT N'draft',
    CreatedBy    INT            NULL CONSTRAINT FK_Batch_Creator  REFERENCES dbo.Users(Id),
    ApprovedBy   INT            NULL CONSTRAINT FK_Batch_Approver REFERENCES dbo.Users(Id),
    CreatedAt    DATETIME2      NOT NULL CONSTRAINT DF_Batch_CreatedAt DEFAULT SYSUTCDATETIME(),
    ApprovedAt   DATETIME2      NULL
);
GO
-- "completed_with_errors" needs 21 characters: widen tables built before this fix
IF COL_LENGTH(N'dbo.PayoutBatches', N'Status') < 60
    ALTER TABLE dbo.PayoutBatches ALTER COLUMN Status NVARCHAR(30) NOT NULL;
GO
IF OBJECT_ID(N'dbo.Payouts', N'U') IS NULL
CREATE TABLE dbo.Payouts (
    Id                        INT IDENTITY(1,1) PRIMARY KEY,
    BatchId                   INT           NOT NULL CONSTRAINT FK_Payouts_Batch REFERENCES dbo.PayoutBatches(Id),
    Phone                     NVARCHAR(20)  NOT NULL,
    Name                      NVARCHAR(120) NULL,
    Amount                    DECIMAL(12,2) NOT NULL,
    Status                    NVARCHAR(20)  NOT NULL CONSTRAINT DF_Payouts_Status DEFAULT N'pending',
    OriginatorConversationId  NVARCHAR(80)  NULL,
    ConversationId            NVARCHAR(80)  NULL,
    TransactionId             NVARCHAR(40)  NULL,
    ResultCode                NVARCHAR(20)  NULL,
    ResultDesc                NVARCHAR(300) NULL,
    UpdatedAt                 DATETIME2     NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payouts_Originator')
    CREATE INDEX IX_Payouts_Originator ON dbo.Payouts(OriginatorConversationId);
GO

-- 8) Settings & contact-form messages ------------------------------------------
IF OBJECT_ID(N'dbo.Settings', N'U') IS NULL
CREATE TABLE dbo.Settings (
    [Key]      NVARCHAR(80)   NOT NULL PRIMARY KEY,
    [Value]    NVARCHAR(1000) NULL,
    UpdatedAt  DATETIME2      NULL
);
GO
IF OBJECT_ID(N'dbo.ContactMessages', N'U') IS NULL
CREATE TABLE dbo.ContactMessages (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    Name       NVARCHAR(120) NOT NULL,
    Email      NVARCHAR(200) NULL,
    Phone      NVARCHAR(40)  NULL,
    Service    NVARCHAR(200) NULL,
    Message    NVARCHAR(MAX) NOT NULL,
    CreatedAt  DATETIME2     NOT NULL CONSTRAINT DF_Contact_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

-- 9) Summary -------------------------------------------------------------------
SELECT s.name AS [Schema], t.name AS [Table]
FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id
ORDER BY t.name;
GO
