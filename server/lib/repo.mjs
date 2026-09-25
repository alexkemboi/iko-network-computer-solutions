/*
 * Data access for the IKONEX database. All SQL lives here.
 * Works on SQL Server (production) and SQLite (tests) via db.d dialect helpers.
 */
import crypto from "node:crypto";

const one = (rows) => rows[0] || null;
const clampPage = (page, size) => {
  const limit = Math.min(Math.max(Number(size) || 20, 1), 200);
  const offset = Math.max((Number(page) || 1) - 1, 0) * limit;
  return { limit, offset };
};
const num = (v) => (v === null || v === undefined ? 0 : Number(v));
const iso = (v) => (v instanceof Date ? v.toISOString() : v);
const clean = (row) => {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.charAt(0).toLowerCase() + k.slice(1);
    out[key] = v instanceof Date ? v.toISOString() : v;
  }
  if ("isActive" in out) out.isActive = Boolean(out.isActive);
  if ("amount" in out) out.amount = num(out.amount);
  if ("price" in out && out.price !== null) out.price = num(out.price);
  if ("totalAmount" in out) out.totalAmount = num(out.totalAmount);
  delete out.passwordHash;
  return out;
};

export const makeRepo = (db) => {
  const { d } = db;
  const q = (sql, params) => db.query(sql, params);

  const repo = {
    // ------------------------------------------------------------------ users
    async countUsers() {
      return num(one(await q("SELECT COUNT(*) AS n FROM Users"))?.n);
    },
    async findUserByEmail(email) {
      return one(await q("SELECT * FROM Users WHERE Email = @email", { email: email.toLowerCase() }));
    },
    async findUserById(id) {
      return one(await q("SELECT * FROM Users WHERE Id = @id", { id }));
    },
    async createUser({ fullName, email, phone, passwordHash, role }) {
      const row = one(
        await q(d.insert("Users", ["FullName", "Email", "Phone", "PasswordHash", "Role"]), {
          FullName: fullName,
          Email: email.toLowerCase(),
          Phone: phone || null,
          PasswordHash: passwordHash,
          Role: role,
        })
      );
      return repo.findUserById(row.Id);
    },
    async updateUser(id, fields) {
      const allowed = { fullName: "FullName", phone: "Phone", role: "Role", isActive: "IsActive", passwordHash: "PasswordHash" };
      const sets = [];
      const params = { id };
      for (const [k, col] of Object.entries(allowed)) {
        if (fields[k] !== undefined) {
          sets.push(`${col} = @${k}`);
          params[k] = fields[k];
        }
      }
      if (sets.length) await q(`UPDATE Users SET ${sets.join(", ")} WHERE Id = @id`, params);
      return repo.findUserById(id);
    },
    async touchLogin(id) {
      await q(`UPDATE Users SET LastLoginAt = ${d.now} WHERE Id = @id`, { id });
    },
    async listUsers({ search, role, page, pageSize }) {
      const { limit, offset } = clampPage(page, pageSize);
      const where = ["1=1"];
      const params = { limit, offset };
      if (search) {
        where.push("(FullName LIKE @s OR Email LIKE @s OR Phone LIKE @s)");
        params.s = `%${search}%`;
      }
      if (role) {
        where.push("Role = @role");
        params.role = role;
      }
      const w = where.join(" AND ");
      const rows = await q(
        `SELECT Id, FullName, Email, Phone, Role, IsActive, CreatedAt, LastLoginAt FROM Users WHERE ${w} ${d.page("CreatedAt DESC, Id DESC")}`,
        params
      );
      const total = num(one(await q(`SELECT COUNT(*) AS n FROM Users WHERE ${w}`, params))?.n);
      return { rows: rows.map(clean), total };
    },
    async phonesForAudience(audience) {
      const role = audience === "customers" ? "AND Role = 'customer'" : audience === "staff" ? "AND Role IN ('admin','staff')" : "";
      const rows = await q(`SELECT Phone FROM Users WHERE IsActive = 1 AND Phone IS NOT NULL ${role}`);
      return rows.map((r) => r.Phone);
    },

    // --------------------------------------------------------------- catalogue
    async countCatalog() {
      return num(one(await q("SELECT COUNT(*) AS n FROM CatalogItems"))?.n);
    },
    async seedCatalog(items) {
      if ((await repo.countCatalog()) > 0) return 0;
      for (const it of items) {
        await q(d.insert("CatalogItems", ["Kind", "Name", "Section", "Category", "Description"]), {
          Kind: it.kind,
          Name: it.name,
          Section: it.section || null,
          Category: it.category || null,
          Description: it.description || null,
        });
      }
      return items.length;
    },
    async listCatalog({ kind, search, activeOnly }) {
      const where = ["1=1"];
      const params = {};
      if (kind) {
        where.push("Kind = @kind");
        params.kind = kind;
      }
      if (activeOnly) where.push("IsActive = 1");
      if (search) {
        where.push("(Name LIKE @s OR Section LIKE @s OR Category LIKE @s)");
        params.s = `%${search}%`;
      }
      const rows = await q(`SELECT * FROM CatalogItems WHERE ${where.join(" AND ")} ORDER BY Section, Name`, params);
      return rows.map(clean);
    },
    async getCatalog(id) {
      return clean(one(await q("SELECT * FROM CatalogItems WHERE Id = @id", { id })));
    },
    async createCatalog(it) {
      const row = one(
        await q(d.insert("CatalogItems", ["Kind", "Name", "Section", "Category", "Description", "Price", "IsActive"]), {
          Kind: it.kind,
          Name: it.name,
          Section: it.section || null,
          Category: it.category || null,
          Description: it.description || null,
          Price: it.price ?? null,
          IsActive: it.isActive !== false,
        })
      );
      return repo.getCatalog(row.Id);
    },
    async updateCatalog(id, it) {
      await q(
        `UPDATE CatalogItems SET Name=@name, Section=@section, Category=@category, Description=@description,
           Price=@price, IsActive=@isActive, UpdatedAt=${d.now} WHERE Id=@id`,
        {
          id,
          name: it.name,
          section: it.section || null,
          category: it.category || null,
          description: it.description || null,
          price: it.price ?? null,
          isActive: it.isActive !== false,
        }
      );
      return repo.getCatalog(id);
    },
    async deleteCatalog(id) {
      await q("DELETE FROM CatalogItems WHERE Id = @id", { id });
    },

    // ----------------------------------------------------------------- orders
    async createOrder({ userId, customerName, phone, itemName, section, category, amount, notes }) {
      const orderNo = `IKX-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;
      const row = one(
        await q(
          d.insert("Orders", ["OrderNo", "UserId", "CustomerName", "Phone", "ItemName", "Section", "Category", "Amount", "Status", "Notes"]),
          {
            OrderNo: orderNo,
            UserId: userId || null,
            CustomerName: customerName,
            Phone: phone,
            ItemName: itemName,
            Section: section || null,
            Category: category || null,
            Amount: amount,
            Status: "pending",
            Notes: notes || null,
          }
        )
      );
      return repo.getOrder(row.Id);
    },
    async getOrder(id) {
      const order = clean(one(await q("SELECT * FROM Orders WHERE Id = @id", { id })));
      if (!order) return null;
      order.payments = (await q("SELECT * FROM Payments WHERE OrderId = @id ORDER BY Id DESC", { id })).map(clean);
      return order;
    },
    async setOrderStatus(id, status, notes) {
      await q(
        `UPDATE Orders SET Status=@status, ${notes !== undefined ? "Notes=@notes," : ""} UpdatedAt=${d.now} WHERE Id=@id`,
        { id, status, notes }
      );
      return repo.getOrder(id);
    },
    async listOrders({ search, status, userId, page, pageSize }) {
      const { limit, offset } = clampPage(page, pageSize);
      const where = ["1=1"];
      const params = { limit, offset };
      if (search) {
        where.push("(OrderNo LIKE @s OR CustomerName LIKE @s OR Phone LIKE @s OR ItemName LIKE @s)");
        params.s = `%${search}%`;
      }
      if (status) {
        where.push("Status = @status");
        params.status = status;
      }
      if (userId) {
        where.push("UserId = @userId");
        params.userId = userId;
      }
      const w = where.join(" AND ");
      const rows = await q(`SELECT * FROM Orders WHERE ${w} ${d.page("CreatedAt DESC, Id DESC")}`, params);
      const total = num(one(await q(`SELECT COUNT(*) AS n FROM Orders WHERE ${w}`, params))?.n);
      return { rows: rows.map(clean), total };
    },

    // --------------------------------------------------------------- payments
    async createPayment({ orderId, checkoutRequestId, merchantRequestId, phone, amount, status, resultDesc }) {
      const row = one(
        await q(
          d.insert("Payments", ["OrderId", "CheckoutRequestId", "MerchantRequestId", "Phone", "Amount", "Status", "ResultDesc"]),
          {
            OrderId: orderId || null,
            CheckoutRequestId: checkoutRequestId || null,
            MerchantRequestId: merchantRequestId || null,
            Phone: phone,
            Amount: amount,
            Status: status || "pending",
            ResultDesc: resultDesc || null,
          }
        )
      );
      return row.Id;
    },
    /** Update a payment by CheckoutRequestID and mirror the result onto its order */
    async settlePayment(checkoutRequestId, { status, resultCode, resultDesc, receipt }) {
      const pay = one(await q("SELECT * FROM Payments WHERE CheckoutRequestId = @id", { id: checkoutRequestId }));
      if (!pay) return null;
      if (pay.Status === "success") return clean(pay); // never downgrade a confirmed payment
      await q(
        `UPDATE Payments SET Status=@status, ResultCode=@code, ResultDesc=@desc, MpesaReceipt=COALESCE(@receipt, MpesaReceipt),
           UpdatedAt=${d.now} WHERE Id=@pid`,
        { pid: pay.Id, status, code: resultCode != null ? String(resultCode) : null, desc: resultDesc || null, receipt: receipt || null }
      );
      if (pay.OrderId) {
        const orderStatus = status === "success" ? "paid" : status === "cancelled" ? "cancelled" : status === "failed" ? "failed" : "pending";
        await q(`UPDATE Orders SET Status=@st, UpdatedAt=${d.now} WHERE Id=@oid AND Status <> 'paid'`, {
          st: orderStatus,
          oid: pay.OrderId,
        });
      }
      return clean(one(await q("SELECT * FROM Payments WHERE Id = @id", { id: pay.Id })));
    },
    async listPayments({ search, status, userId, page, pageSize }) {
      const { limit, offset } = clampPage(page, pageSize);
      const where = ["1=1"];
      const params = { limit, offset };
      if (search) {
        where.push("(p.Phone LIKE @s OR p.MpesaReceipt LIKE @s OR o.OrderNo LIKE @s OR o.ItemName LIKE @s OR o.CustomerName LIKE @s)");
        params.s = `%${search}%`;
      }
      if (status) {
        where.push("p.Status = @status");
        params.status = status;
      }
      if (userId) {
        where.push("o.UserId = @userId");
        params.userId = userId;
      }
      const w = where.join(" AND ");
      const from = "FROM Payments p LEFT JOIN Orders o ON o.Id = p.OrderId";
      const rows = await q(
        `SELECT p.*, o.OrderNo, o.ItemName, o.CustomerName ${from} WHERE ${w} ${d.page("p.CreatedAt DESC, p.Id DESC")}`,
        params
      );
      const total = num(one(await q(`SELECT COUNT(*) AS n ${from} WHERE ${w}`, params))?.n);
      return { rows: rows.map(clean), total };
    },

    // --------------------------------------------------------------- overview
    async overview({ userId }) {
      const scope = userId ? "AND o.UserId = @userId" : "";
      const params = userId ? { userId } : {};
      const paid = `FROM Payments p LEFT JOIN Orders o ON o.Id = p.OrderId WHERE p.Status = 'success' ${scope}`;
      const money = async (extra) => num(one(await q(`SELECT SUM(p.Amount) AS v ${paid} ${extra}`, params))?.v);
      const [today, month, allTime] = await Promise.all([
        money(`AND p.CreatedAt >= ${d.today}`),
        money(`AND p.CreatedAt >= ${d.startOfMonth}`),
        money(""),
      ]);
      const orderScope = userId ? "WHERE UserId = @userId" : "";
      const byStatus = await q(`SELECT Status, COUNT(*) AS n FROM Orders ${orderScope} GROUP BY Status`, params);
      const orders = Object.fromEntries(byStatus.map((r) => [r.Status, num(r.n)]));
      const series = await q(
        `SELECT ${d.dateOnly("p.CreatedAt")} AS day, SUM(p.Amount) AS total, COUNT(*) AS n ${paid}
           AND p.CreatedAt >= ${d.daysAgo(13)} GROUP BY ${d.dateOnly("p.CreatedAt")}`,
        params
      );
      const byDay = new Map(series.map((r) => [String(iso(r.day)).slice(0, 10), { total: num(r.total), n: num(r.n) }]));
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
        days.push({ day, total: byDay.get(day)?.total || 0, count: byDay.get(day)?.n || 0 });
      }
      const recentOrders = await q(
        `SELECT ${d.top(6)} * FROM Orders ${orderScope} ORDER BY CreatedAt DESC, Id DESC ${d.limit(6)}`,
        params
      );
      const out = {
        revenue: { today, month, allTime },
        orders: { total: Object.values(orders).reduce((a, b) => a + b, 0), ...orders },
        series: days,
        recentOrders: recentOrders.map(clean),
      };
      if (!userId) {
        out.customers = num(one(await q("SELECT COUNT(*) AS n FROM Users WHERE Role = 'customer'"))?.n);
        out.smsThisMonth = num(
          one(await q(`SELECT SUM(SentCount) AS n FROM SmsCampaigns WHERE CreatedAt >= ${d.startOfMonth}`))?.n
        );
        out.payoutsThisMonth = num(
          one(
            await q(
              `SELECT SUM(p.Amount) AS v FROM Payouts p JOIN PayoutBatches b ON b.Id = p.BatchId
                 WHERE p.Status = 'success' AND b.ApprovedAt >= ${d.startOfMonth}`
            )
          )?.v
        );
      }
      return out;
    },

    // -------------------------------------------------------------------- SMS
    async createCampaign({ message, senderId, audience, phones, userId }) {
      const row = one(
        await q(d.insert("SmsCampaigns", ["Message", "SenderId", "Audience", "RecipientCount", "Status", "CreatedBy"]), {
          Message: message,
          SenderId: senderId || null,
          Audience: audience || "custom",
          RecipientCount: phones.length,
          Status: "sending",
          CreatedBy: userId || null,
        })
      );
      for (const phone of phones) {
        await q(d.insert("SmsMessages", ["CampaignId", "Phone", "Status"]), { CampaignId: row.Id, Phone: phone, Status: "queued" });
      }
      return row.Id;
    },
    async queuedSms(campaignId) {
      return (await q("SELECT Id, Phone FROM SmsMessages WHERE CampaignId=@id AND Status='queued'", { id: campaignId })).map(clean);
    },
    async updateSms(id, { status, providerMessageId, cost, error }) {
      await q(
        `UPDATE SmsMessages SET Status=@status, ProviderMessageId=COALESCE(@pid, ProviderMessageId), Cost=COALESCE(@cost, Cost),
           Error=@error, UpdatedAt=${d.now} WHERE Id=@id`,
        { id, status, pid: providerMessageId || null, cost: cost || null, error: error || null }
      );
    },
    async updateSmsByProviderId(providerMessageId, status, error) {
      const msg = one(await q("SELECT Id, CampaignId FROM SmsMessages WHERE ProviderMessageId=@pid", { pid: providerMessageId }));
      if (!msg) return null;
      await q(`UPDATE SmsMessages SET Status=@status, Error=@error, UpdatedAt=${d.now} WHERE Id=@id`, {
        id: msg.Id,
        status,
        error: error || null,
      });
      await repo.refreshCampaign(msg.CampaignId);
      return msg.CampaignId;
    },
    async refreshCampaign(id, finalStatus) {
      const counts = one(
        await q(
          `SELECT
             SUM(CASE WHEN Status IN ('Success','Sent','Submitted','Buffered','Delivered') THEN 1 ELSE 0 END) AS sent,
             SUM(CASE WHEN Status = 'Delivered' THEN 1 ELSE 0 END) AS delivered,
             SUM(CASE WHEN Status IN ('failed','Failed','Rejected','InvalidPhoneNumber','UserInBlacklist','InsufficientBalance','AbsentSubscriber') THEN 1 ELSE 0 END) AS failed
           FROM SmsMessages WHERE CampaignId=@id`,
          { id }
        )
      );
      await q(
        `UPDATE SmsCampaigns SET SentCount=@sent, DeliveredCount=@delivered, FailedCount=@failed
           ${finalStatus ? ", Status=@status" : ""} WHERE Id=@id`,
        { id, sent: num(counts?.sent), delivered: num(counts?.delivered), failed: num(counts?.failed), status: finalStatus }
      );
    },
    async setCampaignCost(id, cost) {
      await q("UPDATE SmsCampaigns SET Cost=@cost WHERE Id=@id", { id, cost });
    },
    async listCampaigns({ page, pageSize }) {
      const { limit, offset } = clampPage(page, pageSize);
      const rows = await q(
        `SELECT c.*, u.FullName AS CreatedByName FROM SmsCampaigns c LEFT JOIN Users u ON u.Id = c.CreatedBy ${d.page("c.CreatedAt DESC, c.Id DESC")}`,
        { limit, offset }
      );
      const total = num(one(await q("SELECT COUNT(*) AS n FROM SmsCampaigns"))?.n);
      return { rows: rows.map(clean), total };
    },
    async getCampaign(id) {
      const c = clean(one(await q("SELECT * FROM SmsCampaigns WHERE Id=@id", { id })));
      if (!c) return null;
      c.messages = (await q("SELECT * FROM SmsMessages WHERE CampaignId=@id ORDER BY Id", { id })).map(clean);
      return c;
    },

    // ---------------------------------------------------------------- payouts
    async createBatch({ title, commandId, items, userId }) {
      const total = items.reduce((a, i) => a + i.amount, 0);
      const row = one(
        await q(d.insert("PayoutBatches", ["Title", "CommandId", "ItemCount", "TotalAmount", "Status", "CreatedBy"]), {
          Title: title,
          CommandId: commandId,
          ItemCount: items.length,
          TotalAmount: total,
          Status: "draft",
          CreatedBy: userId || null,
        })
      );
      for (const it of items) {
        await q(d.insert("Payouts", ["BatchId", "Phone", "Name", "Amount", "Status"]), {
          BatchId: row.Id,
          Phone: it.phone,
          Name: it.name || null,
          Amount: it.amount,
          Status: "pending",
        });
      }
      return repo.getBatch(row.Id);
    },
    async listBatches({ page, pageSize }) {
      const { limit, offset } = clampPage(page, pageSize);
      const rows = await q(
        `SELECT b.*, c.FullName AS CreatedByName, a.FullName AS ApprovedByName,
           (SELECT COUNT(*) FROM Payouts p WHERE p.BatchId = b.Id AND p.Status = 'success') AS PaidCount,
           (SELECT COUNT(*) FROM Payouts p WHERE p.BatchId = b.Id AND p.Status = 'failed') AS FailedCount
         FROM PayoutBatches b
         LEFT JOIN Users c ON c.Id = b.CreatedBy LEFT JOIN Users a ON a.Id = b.ApprovedBy
         ${d.page("b.CreatedAt DESC, b.Id DESC")}`,
        { limit, offset }
      );
      const total = num(one(await q("SELECT COUNT(*) AS n FROM PayoutBatches"))?.n);
      return { rows: rows.map(clean), total };
    },
    async getBatch(id) {
      const b = clean(
        one(
          await q(
            `SELECT b.*, c.FullName AS CreatedByName, a.FullName AS ApprovedByName FROM PayoutBatches b
               LEFT JOIN Users c ON c.Id = b.CreatedBy LEFT JOIN Users a ON a.Id = b.ApprovedBy WHERE b.Id=@id`,
            { id }
          )
        )
      );
      if (!b) return null;
      b.items = (await q("SELECT * FROM Payouts WHERE BatchId=@id ORDER BY Id", { id })).map(clean);
      return b;
    },
    async setBatchStatus(id, status, approverId) {
      await q(
        `UPDATE PayoutBatches SET Status=@status ${approverId ? `, ApprovedBy=@approver, ApprovedAt=${d.now}` : ""} WHERE Id=@id`,
        { id, status, approver: approverId }
      );
    },
    async updatePayout(id, fields) {
      await q(
        `UPDATE Payouts SET Status=@status, OriginatorConversationId=COALESCE(@oc, OriginatorConversationId),
           ConversationId=COALESCE(@cid, ConversationId), TransactionId=COALESCE(@tx, TransactionId),
           ResultCode=COALESCE(@code, ResultCode), ResultDesc=COALESCE(@desc, ResultDesc), UpdatedAt=${d.now}
         WHERE Id=@id`,
        {
          id,
          status: fields.status,
          oc: fields.originatorConversationId || null,
          cid: fields.conversationId || null,
          tx: fields.transactionId || null,
          code: fields.resultCode != null ? String(fields.resultCode) : null,
          desc: fields.resultDesc || null,
        }
      );
    },
    async findPayoutByOriginator(oc) {
      return clean(one(await q("SELECT * FROM Payouts WHERE OriginatorConversationId=@oc", { oc })));
    },
    async refreshBatch(id) {
      const c = one(
        await q(
          `SELECT SUM(CASE WHEN Status IN ('pending','sent') THEN 1 ELSE 0 END) AS openCount,
                  SUM(CASE WHEN Status = 'failed' THEN 1 ELSE 0 END) AS failed,
                  COUNT(*) AS n FROM Payouts WHERE BatchId=@id`,
          { id }
        )
      );
      if (num(c?.openCount) === 0) {
        await q("UPDATE PayoutBatches SET Status=@s WHERE Id=@id AND Status='processing'", {
          id,
          s: num(c?.failed) === 0 ? "completed" : num(c?.failed) === num(c?.n) ? "failed" : "completed_with_errors",
        });
      }
    },

    // --------------------------------------------------------------- settings
    async getSettings() {
      const rows = await q("SELECT [Key], [Value] FROM Settings");
      return Object.fromEntries(rows.map((r) => [r.Key, r.Value]));
    },
    async setSetting(key, value) {
      await q("DELETE FROM Settings WHERE [Key]=@key", { key });
      await q(`INSERT INTO Settings ([Key], [Value], UpdatedAt) VALUES (@key, @value, ${d.now})`, { key, value });
    },

    // ---------------------------------------------------------------- contact
    async createContact(m) {
      await q(d.insert("ContactMessages", ["Name", "Email", "Phone", "Service", "Message"]), {
        Name: m.name,
        Email: m.email || null,
        Phone: m.phone || null,
        Service: m.service || null,
        Message: m.message,
      });
    },
    async listContacts({ page, pageSize }) {
      const { limit, offset } = clampPage(page, pageSize);
      const rows = await q(`SELECT * FROM ContactMessages ${d.page("CreatedAt DESC, Id DESC")}`, { limit, offset });
      const total = num(one(await q("SELECT COUNT(*) AS n FROM ContactMessages"))?.n);
      return { rows: rows.map(clean), total };
    },
  };
  return repo;
};
