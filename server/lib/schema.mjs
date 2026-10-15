/*
 * Database schema for the IKONEX database. Idempotent: safe to run on every start.
 * T-SQL for SQL Server; an equivalent SQLite version is used only by the tests.
 */

const MSSQL_TABLES = [
  `IF OBJECT_ID(N'Users', N'U') IS NULL
   CREATE TABLE Users (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     FullName NVARCHAR(120) NOT NULL,
     Email NVARCHAR(200) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,
     Phone NVARCHAR(20) NULL,
     PasswordHash NVARCHAR(300) NOT NULL,
     Role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT N'customer',
     IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
     LastLoginAt DATETIME2 NULL
   )`,

  `IF OBJECT_ID(N'CatalogItems', N'U') IS NULL
   CREATE TABLE CatalogItems (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     Kind NVARCHAR(20) NOT NULL,              -- product | service
     Name NVARCHAR(160) NOT NULL,
     Section NVARCHAR(80) NULL,
     Category NVARCHAR(80) NULL,
     Description NVARCHAR(1000) NULL,
     Price DECIMAL(12,2) NULL,
     IsActive BIT NOT NULL CONSTRAINT DF_Catalog_IsActive DEFAULT 1,
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Catalog_CreatedAt DEFAULT SYSUTCDATETIME(),
     UpdatedAt DATETIME2 NULL
   )`,

  `IF OBJECT_ID(N'Orders', N'U') IS NULL
   CREATE TABLE Orders (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     OrderNo NVARCHAR(30) NOT NULL CONSTRAINT UQ_Orders_OrderNo UNIQUE,
     UserId INT NULL CONSTRAINT FK_Orders_Users REFERENCES Users(Id),
     CustomerName NVARCHAR(120) NOT NULL,
     Phone NVARCHAR(20) NOT NULL,
     ItemName NVARCHAR(160) NOT NULL,
     Section NVARCHAR(80) NULL,
     Category NVARCHAR(80) NULL,
     Amount DECIMAL(12,2) NOT NULL,
     Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Orders_Status DEFAULT N'pending',
     Notes NVARCHAR(1000) NULL,
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME(),
     UpdatedAt DATETIME2 NULL
   )`,

  `IF OBJECT_ID(N'Payments', N'U') IS NULL
   CREATE TABLE Payments (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     OrderId INT NULL CONSTRAINT FK_Payments_Orders REFERENCES Orders(Id),
     CheckoutRequestId NVARCHAR(80) NULL,
     MerchantRequestId NVARCHAR(80) NULL,
     Phone NVARCHAR(20) NOT NULL,
     Amount DECIMAL(12,2) NOT NULL,
     Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Payments_Status DEFAULT N'pending',
     ResultCode NVARCHAR(20) NULL,
     ResultDesc NVARCHAR(300) NULL,
     MpesaReceipt NVARCHAR(40) NULL,
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
     UpdatedAt DATETIME2 NULL
   )`,

  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_Checkout')
   CREATE INDEX IX_Payments_Checkout ON Payments(CheckoutRequestId)`,

  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_OrderId')
   CREATE INDEX IX_Payments_OrderId ON Payments(OrderId)`,

  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Orders_UserId')
   CREATE INDEX IX_Orders_UserId ON Orders(UserId)`,

  `IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Users_Role')
   ALTER TABLE Users ADD CONSTRAINT CK_Users_Role CHECK (Role IN (N'admin', N'staff', N'customer'))`,

  `IF OBJECT_ID(N'SmsCampaigns', N'U') IS NULL
   CREATE TABLE SmsCampaigns (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     Message NVARCHAR(1600) NOT NULL,
     SenderId NVARCHAR(20) NULL,
     Audience NVARCHAR(40) NULL,
     RecipientCount INT NOT NULL CONSTRAINT DF_Sms_Recipients DEFAULT 0,
     SentCount INT NOT NULL CONSTRAINT DF_Sms_Sent DEFAULT 0,
     FailedCount INT NOT NULL CONSTRAINT DF_Sms_Failed DEFAULT 0,
     DeliveredCount INT NOT NULL CONSTRAINT DF_Sms_Delivered DEFAULT 0,
     Cost NVARCHAR(40) NULL,
     Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Sms_Status DEFAULT N'queued',
     CreatedBy INT NULL CONSTRAINT FK_Sms_Users REFERENCES Users(Id),
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Sms_CreatedAt DEFAULT SYSUTCDATETIME()
   )`,

  `IF OBJECT_ID(N'SmsMessages', N'U') IS NULL
   CREATE TABLE SmsMessages (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     CampaignId INT NOT NULL CONSTRAINT FK_SmsMsg_Campaign REFERENCES SmsCampaigns(Id),
     Phone NVARCHAR(20) NOT NULL,
     Status NVARCHAR(40) NOT NULL CONSTRAINT DF_SmsMsg_Status DEFAULT N'queued',
     ProviderMessageId NVARCHAR(80) NULL,
     Cost NVARCHAR(40) NULL,
     Error NVARCHAR(300) NULL,
     UpdatedAt DATETIME2 NULL
   )`,

  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SmsMessages_Provider')
   CREATE INDEX IX_SmsMessages_Provider ON SmsMessages(ProviderMessageId)`,

  `IF OBJECT_ID(N'PayoutBatches', N'U') IS NULL
   CREATE TABLE PayoutBatches (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     Title NVARCHAR(160) NOT NULL,
     CommandId NVARCHAR(40) NOT NULL,
     ItemCount INT NOT NULL,
     TotalAmount DECIMAL(14,2) NOT NULL,
     Status NVARCHAR(30) NOT NULL CONSTRAINT DF_Batch_Status DEFAULT N'draft',
     CreatedBy INT NULL CONSTRAINT FK_Batch_Creator REFERENCES Users(Id),
     ApprovedBy INT NULL CONSTRAINT FK_Batch_Approver REFERENCES Users(Id),
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Batch_CreatedAt DEFAULT SYSUTCDATETIME(),
     ApprovedAt DATETIME2 NULL
   )`,

  // "completed_with_errors" is 21 characters: widen tables created before this fix
  `IF COL_LENGTH(N'PayoutBatches', N'Status') < 60
   ALTER TABLE PayoutBatches ALTER COLUMN Status NVARCHAR(30) NOT NULL`,

  `IF OBJECT_ID(N'Payouts', N'U') IS NULL
   CREATE TABLE Payouts (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     BatchId INT NOT NULL CONSTRAINT FK_Payouts_Batch REFERENCES PayoutBatches(Id),
     Phone NVARCHAR(20) NOT NULL,
     Name NVARCHAR(120) NULL,
     Amount DECIMAL(12,2) NOT NULL,
     Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Payouts_Status DEFAULT N'pending',
     OriginatorConversationId NVARCHAR(80) NULL,
     ConversationId NVARCHAR(80) NULL,
     TransactionId NVARCHAR(40) NULL,
     ResultCode NVARCHAR(20) NULL,
     ResultDesc NVARCHAR(300) NULL,
     UpdatedAt DATETIME2 NULL
   )`,

  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payouts_Originator')
   CREATE INDEX IX_Payouts_Originator ON Payouts(OriginatorConversationId)`,

  `IF OBJECT_ID(N'Settings', N'U') IS NULL
   CREATE TABLE Settings (
     [Key] NVARCHAR(80) NOT NULL PRIMARY KEY,
     [Value] NVARCHAR(1000) NULL,
     UpdatedAt DATETIME2 NULL
   )`,

  `IF OBJECT_ID(N'ContactMessages', N'U') IS NULL
   CREATE TABLE ContactMessages (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     Name NVARCHAR(120) NOT NULL,
     Email NVARCHAR(200) NULL,
     Phone NVARCHAR(40) NULL,
     Service NVARCHAR(200) NULL,
     Message NVARCHAR(MAX) NOT NULL,
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Contact_CreatedAt DEFAULT SYSUTCDATETIME()
   )`,

  // Email / SMS / M-Pesa settings managed in the portal. SecretsEnc is AES-256-GCM
  // ciphertext; the key lives outside the database (see lib/secret-box.mjs).
  `IF OBJECT_ID(N'IntegrationConfigs', N'U') IS NULL
   CREATE TABLE IntegrationConfigs (
     Integration NVARCHAR(20) NOT NULL PRIMARY KEY,
     ConfigJson NVARCHAR(MAX) NULL,
     SecretsEnc NVARCHAR(MAX) NULL,
     LastTestAt DATETIME2 NULL,
     LastTestOk INT NULL,
     LastTestMessage NVARCHAR(300) NULL,
     LastSuccessAt DATETIME2 NULL,
     UpdatedAt DATETIME2 NULL,
     UpdatedBy INT NULL CONSTRAINT FK_IntegrationConfigs_Users REFERENCES Users(Id)
   )`,

  `IF OBJECT_ID(N'IntegrationAudit', N'U') IS NULL
   CREATE TABLE IntegrationAudit (
     Id INT IDENTITY(1,1) PRIMARY KEY,
     Integration NVARCHAR(20) NOT NULL,
     EventType NVARCHAR(20) NOT NULL,          -- update | test
     Fields NVARCHAR(1000) NULL,               -- setting names only, never values
     Detail NVARCHAR(300) NULL,
     UserId INT NULL CONSTRAINT FK_IntegrationAudit_Users REFERENCES Users(Id),
     UserEmail NVARCHAR(200) NULL,
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_IntegrationAudit_CreatedAt DEFAULT SYSUTCDATETIME()
   )`,
];

/* SQLite equivalent (tests only) */
const SQLITE_TABLES = `
CREATE TABLE IF NOT EXISTS Users (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, FullName TEXT NOT NULL, Email TEXT NOT NULL UNIQUE,
  Phone TEXT, PasswordHash TEXT NOT NULL, Role TEXT NOT NULL DEFAULT 'customer',
  IsActive INTEGER NOT NULL DEFAULT 1,
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), LastLoginAt TEXT);
CREATE TABLE IF NOT EXISTS CatalogItems (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, Kind TEXT NOT NULL, Name TEXT NOT NULL, Section TEXT,
  Category TEXT, Description TEXT, Price REAL, IsActive INTEGER NOT NULL DEFAULT 1,
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), UpdatedAt TEXT);
CREATE TABLE IF NOT EXISTS Orders (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, OrderNo TEXT NOT NULL UNIQUE, UserId INTEGER REFERENCES Users(Id),
  CustomerName TEXT NOT NULL, Phone TEXT NOT NULL, ItemName TEXT NOT NULL, Section TEXT, Category TEXT,
  Amount REAL NOT NULL, Status TEXT NOT NULL DEFAULT 'pending', Notes TEXT,
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), UpdatedAt TEXT);
CREATE TABLE IF NOT EXISTS Payments (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, OrderId INTEGER REFERENCES Orders(Id), CheckoutRequestId TEXT,
  MerchantRequestId TEXT, Phone TEXT NOT NULL, Amount REAL NOT NULL, Status TEXT NOT NULL DEFAULT 'pending',
  ResultCode TEXT, ResultDesc TEXT, MpesaReceipt TEXT,
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), UpdatedAt TEXT);
CREATE TABLE IF NOT EXISTS SmsCampaigns (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, Message TEXT NOT NULL, SenderId TEXT, Audience TEXT,
  RecipientCount INTEGER NOT NULL DEFAULT 0, SentCount INTEGER NOT NULL DEFAULT 0,
  FailedCount INTEGER NOT NULL DEFAULT 0, DeliveredCount INTEGER NOT NULL DEFAULT 0, Cost TEXT,
  Status TEXT NOT NULL DEFAULT 'queued', CreatedBy INTEGER REFERENCES Users(Id),
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS SmsMessages (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, CampaignId INTEGER NOT NULL REFERENCES SmsCampaigns(Id),
  Phone TEXT NOT NULL, Status TEXT NOT NULL DEFAULT 'queued', ProviderMessageId TEXT, Cost TEXT,
  Error TEXT, UpdatedAt TEXT);
CREATE TABLE IF NOT EXISTS PayoutBatches (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT NOT NULL, CommandId TEXT NOT NULL,
  ItemCount INTEGER NOT NULL, TotalAmount REAL NOT NULL, Status TEXT NOT NULL DEFAULT 'draft',
  CreatedBy INTEGER REFERENCES Users(Id), ApprovedBy INTEGER REFERENCES Users(Id),
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), ApprovedAt TEXT);
CREATE TABLE IF NOT EXISTS Payouts (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, BatchId INTEGER NOT NULL REFERENCES PayoutBatches(Id),
  Phone TEXT NOT NULL, Name TEXT, Amount REAL NOT NULL, Status TEXT NOT NULL DEFAULT 'pending',
  OriginatorConversationId TEXT, ConversationId TEXT, TransactionId TEXT, ResultCode TEXT,
  ResultDesc TEXT, UpdatedAt TEXT);
CREATE TABLE IF NOT EXISTS Settings ([Key] TEXT PRIMARY KEY, [Value] TEXT, UpdatedAt TEXT);
CREATE TABLE IF NOT EXISTS ContactMessages (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Email TEXT, Phone TEXT, Service TEXT,
  Message TEXT NOT NULL, CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS IntegrationConfigs (
  Integration TEXT PRIMARY KEY, ConfigJson TEXT, SecretsEnc TEXT, LastTestAt TEXT, LastTestOk INTEGER,
  LastTestMessage TEXT, LastSuccessAt TEXT, UpdatedAt TEXT, UpdatedBy INTEGER REFERENCES Users(Id));
CREATE TABLE IF NOT EXISTS IntegrationAudit (
  Id INTEGER PRIMARY KEY AUTOINCREMENT, Integration TEXT NOT NULL, EventType TEXT NOT NULL, Fields TEXT,
  Detail TEXT, UserId INTEGER REFERENCES Users(Id), UserEmail TEXT,
  CreatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
`;


/* PostgreSQL. Names are written in PascalCase to match the app's SQL; Postgres
   stores them lower case (users.fullname) and the adapter maps results back. */
const NOW = "(now() AT TIME ZONE 'utc')";
const POSTGRES_TABLES = `
CREATE TABLE IF NOT EXISTS Users (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  FullName VARCHAR(120) NOT NULL,
  Email VARCHAR(200) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,
  Phone VARCHAR(20) NULL,
  PasswordHash VARCHAR(300) NOT NULL,
  Role VARCHAR(20) NOT NULL DEFAULT 'customer' CONSTRAINT CK_Users_Role CHECK (Role IN ('admin','staff','customer')),
  IsActive SMALLINT NOT NULL DEFAULT 1,
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW},
  LastLoginAt TIMESTAMP NULL
);
CREATE TABLE IF NOT EXISTS CatalogItems (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  Kind VARCHAR(20) NOT NULL,
  Name VARCHAR(160) NOT NULL,
  Section VARCHAR(80) NULL,
  Category VARCHAR(80) NULL,
  Description VARCHAR(1000) NULL,
  Price NUMERIC(12,2) NULL,
  IsActive SMALLINT NOT NULL DEFAULT 1,
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW},
  UpdatedAt TIMESTAMP NULL
);
CREATE TABLE IF NOT EXISTS Orders (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  OrderNo VARCHAR(30) NOT NULL CONSTRAINT UQ_Orders_OrderNo UNIQUE,
  UserId INT NULL CONSTRAINT FK_Orders_Users REFERENCES Users(Id),
  CustomerName VARCHAR(120) NOT NULL,
  Phone VARCHAR(20) NOT NULL,
  ItemName VARCHAR(160) NOT NULL,
  Section VARCHAR(80) NULL,
  Category VARCHAR(80) NULL,
  Amount NUMERIC(12,2) NOT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'pending',
  Notes VARCHAR(1000) NULL,
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW},
  UpdatedAt TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS IX_Orders_UserId ON Orders(UserId);
CREATE TABLE IF NOT EXISTS Payments (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  OrderId INT NULL CONSTRAINT FK_Payments_Orders REFERENCES Orders(Id),
  CheckoutRequestId VARCHAR(80) NULL,
  MerchantRequestId VARCHAR(80) NULL,
  Phone VARCHAR(20) NOT NULL,
  Amount NUMERIC(12,2) NOT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ResultCode VARCHAR(20) NULL,
  ResultDesc VARCHAR(300) NULL,
  MpesaReceipt VARCHAR(40) NULL,
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW},
  UpdatedAt TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS IX_Payments_Checkout ON Payments(CheckoutRequestId);
CREATE INDEX IF NOT EXISTS IX_Payments_OrderId ON Payments(OrderId);
CREATE TABLE IF NOT EXISTS SmsCampaigns (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  Message VARCHAR(1600) NOT NULL,
  SenderId VARCHAR(20) NULL,
  Audience VARCHAR(40) NULL,
  RecipientCount INT NOT NULL DEFAULT 0,
  SentCount INT NOT NULL DEFAULT 0,
  FailedCount INT NOT NULL DEFAULT 0,
  DeliveredCount INT NOT NULL DEFAULT 0,
  Cost VARCHAR(40) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'queued',
  CreatedBy INT NULL CONSTRAINT FK_Sms_Users REFERENCES Users(Id),
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW}
);
CREATE TABLE IF NOT EXISTS SmsMessages (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  CampaignId INT NOT NULL CONSTRAINT FK_SmsMsg_Campaign REFERENCES SmsCampaigns(Id),
  Phone VARCHAR(20) NOT NULL,
  Status VARCHAR(40) NOT NULL DEFAULT 'queued',
  ProviderMessageId VARCHAR(80) NULL,
  Cost VARCHAR(40) NULL,
  Error VARCHAR(300) NULL,
  UpdatedAt TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS IX_SmsMessages_Provider ON SmsMessages(ProviderMessageId);
CREATE TABLE IF NOT EXISTS PayoutBatches (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  Title VARCHAR(160) NOT NULL,
  CommandId VARCHAR(40) NOT NULL,
  ItemCount INT NOT NULL,
  TotalAmount NUMERIC(14,2) NOT NULL,
  Status VARCHAR(30) NOT NULL DEFAULT 'draft',
  CreatedBy INT NULL CONSTRAINT FK_Batch_Creator REFERENCES Users(Id),
  ApprovedBy INT NULL CONSTRAINT FK_Batch_Approver REFERENCES Users(Id),
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW},
  ApprovedAt TIMESTAMP NULL
);
ALTER TABLE PayoutBatches ALTER COLUMN Status TYPE VARCHAR(30);
CREATE TABLE IF NOT EXISTS Payouts (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  BatchId INT NOT NULL CONSTRAINT FK_Payouts_Batch REFERENCES PayoutBatches(Id),
  Phone VARCHAR(20) NOT NULL,
  Name VARCHAR(120) NULL,
  Amount NUMERIC(12,2) NOT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'pending',
  OriginatorConversationId VARCHAR(80) NULL,
  ConversationId VARCHAR(80) NULL,
  TransactionId VARCHAR(40) NULL,
  ResultCode VARCHAR(20) NULL,
  ResultDesc VARCHAR(300) NULL,
  UpdatedAt TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS IX_Payouts_Originator ON Payouts(OriginatorConversationId);
CREATE TABLE IF NOT EXISTS Settings (
  Key VARCHAR(80) NOT NULL PRIMARY KEY,
  Value VARCHAR(1000) NULL,
  UpdatedAt TIMESTAMP NULL
);
CREATE TABLE IF NOT EXISTS ContactMessages (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  Name VARCHAR(120) NOT NULL,
  Email VARCHAR(200) NULL,
  Phone VARCHAR(40) NULL,
  Service VARCHAR(200) NULL,
  Message TEXT NOT NULL,
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW}
);
CREATE TABLE IF NOT EXISTS IntegrationConfigs (
  Integration VARCHAR(20) NOT NULL PRIMARY KEY,
  ConfigJson TEXT NULL,
  SecretsEnc TEXT NULL,
  LastTestAt TIMESTAMP NULL,
  LastTestOk INT NULL,
  LastTestMessage VARCHAR(300) NULL,
  LastSuccessAt TIMESTAMP NULL,
  UpdatedAt TIMESTAMP NULL,
  UpdatedBy INT NULL REFERENCES Users(Id)
);
CREATE TABLE IF NOT EXISTS IntegrationAudit (
  Id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  Integration VARCHAR(20) NOT NULL,
  EventType VARCHAR(20) NOT NULL,
  Fields VARCHAR(1000) NULL,
  Detail VARCHAR(300) NULL,
  UserId INT NULL REFERENCES Users(Id),
  UserEmail VARCHAR(200) NULL,
  CreatedAt TIMESTAMP NOT NULL DEFAULT ${NOW}
);
`;

/** Table and column names in their PascalCase spelling (used by the Postgres adapter). */
export const PG_NAMES = POSTGRES_TABLES;

/** Tables in foreign-key order (parents first) — used by the migration script. */
export const TABLE_ORDER = [
  "Users", "CatalogItems", "Orders", "Payments", "SmsCampaigns", "SmsMessages",
  "PayoutBatches", "Payouts", "Settings", "ContactMessages", "IntegrationConfigs", "IntegrationAudit",
];

export async function ensureSchema(db) {
  if (db.d.name === "postgres") {
    await db.exec(POSTGRES_TABLES);
    return;
  }
  if (db.d.name === "sqlite") {
    await db.exec(SQLITE_TABLES);
    return;
  }
  for (const stmt of MSSQL_TABLES) await db.exec(stmt);
}
