/*
  IKONEX — create the SQL Server login the app uses.
  Run once in SQL Server Management Studio (SSMS) connected to localhost\SQLEXPRESS
  with Windows Authentication. Change the password first!

  The database itself ("ikonex") and all tables are created automatically by
  `npm run db:setup` — this script only prepares the login.
*/

-- 1) Allow SQL logins (mixed mode). Needs a service restart afterwards:
--    Services → "SQL Server (SQLEXPRESS)" → Restart
EXEC xp_instance_regwrite
     N'HKEY_LOCAL_MACHINE',
     N'Software\Microsoft\MSSQLServer\MSSQLServer',
     N'LoginMode', REG_DWORD, 2;
GO

-- 2) Create the database now (so the login can own it)
IF DB_ID(N'ikonex') IS NULL CREATE DATABASE [ikonex];
GO

-- 3) The app's login
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'ikonex_app')
    CREATE LOGIN [ikonex_app] WITH PASSWORD = N'Change-This-Strong-Passw0rd!', CHECK_POLICY = ON;
GO

USE [ikonex];
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'ikonex_app')
    CREATE USER [ikonex_app] FOR LOGIN [ikonex_app];
ALTER ROLE db_owner ADD MEMBER [ikonex_app];
GO

-- Then put the same values in server/.env:
--   DB_SERVER=localhost
--   DB_INSTANCE=SQLEXPRESS
--   DB_NAME=ikonex
--   DB_USER=ikonex_app
--   DB_PASSWORD=Change-This-Strong-Passw0rd!
