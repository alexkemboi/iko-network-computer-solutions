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
     Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Batch_Status DEFAULT N'draft',
     CreatedBy INT NULL CONSTRAINT FK_Batch_Creator REFERENCES Users(Id),
     ApprovedBy INT NULL CONSTRAINT FK_Batch_Approver REFERENCES Users(Id),
     CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Batch_CreatedAt DEFAULT SYSUTCDATETIME(),
     ApprovedAt DATETIME2 NULL
   )`,

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
`;

export async function ensureSchema(db) {
  if (db.d.name === "sqlite") {
    await db.exec(SQLITE_TABLES);
    return;
  }
  for (const stmt of MSSQL_TABLES) await db.exec(stmt);
}
