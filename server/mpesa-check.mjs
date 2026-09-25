#!/usr/bin/env node
/*
 * M-Pesa Express self-test — run on the machine that has server/.env:
 *
 *   npm run mpesa:check                     → checks config + Daraja login (no money moves)
 *   npm run mpesa:check -- 0712345678       → also sends a real KES 1 PIN prompt to that phone
 *   npm run mpesa:check -- 0712345678 10    → same, KES 10
 *
 * Secrets are never printed in full.
 */
// Load the API module without starting its HTTP server
process.env.IKONEX_API_EMBEDDED = "1";
const {
  cfg,
  missing,
  configProblems,
  getToken,
  darajaPost,
  password,
  darajaTimestamp,
  normalisePhone,
} = await import("./mpesa-server.mjs");

const mask = (v) => (v ? `${v.slice(0, 3)}…${v.slice(-2)} (${v.length} chars)` : "(empty)");
const ok = (m) => console.log(`  ✔ ${m}`);
const bad = (m) => console.log(`  ✘ ${m}`);
const warn = (m) => console.log(`  ⚠ ${m}`);

const [phoneArg, amountArg] = process.argv.slice(2);

console.log("\nIKONEX · M-Pesa Express check\n");
console.log(`  Mode              ${cfg.mode}`);
console.log(`  OAuth URL         ${cfg.urls.oauth}`);
console.log(`  STK Push URL      ${cfg.urls.stkPush}`);
console.log(`  STK Query URL     ${cfg.urls.stkQuery}`);
console.log(`  Consumer key      ${mask(cfg.consumerKey)}`);
console.log(`  Consumer secret   ${mask(cfg.consumerSecret)}`);
console.log(`  Passkey           ${mask(cfg.passkey)}`);
console.log(`  Shortcode         ${cfg.shortcode || "(empty)"}`);
console.log(`  Transaction type  ${cfg.transactionType}`);
console.log(`  PartyB            ${cfg.partyB || "(empty)"}`);
console.log(`  Callback URL      ${cfg.callbackUrl || "(empty)"}${cfg.callbackSecret ? " + secret" : ""}\n`);

let failed = false;

if (missing.length) {
  bad(`Missing or placeholder values in server/.env: ${missing.join(", ")}`);
  failed = true;
}
for (const p of configProblems) warn(p);

// 1) Daraja login
try {
  await getToken();
  ok("Daraja login works (consumer key & secret accepted).");
} catch (e) {
  bad(`Daraja login failed: ${e.message}`);
  console.log("    → Check MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET are from the PRODUCTION app,");
  console.log("      and that this machine can reach api.safaricom.co.ke.\n");
  process.exit(1);
}

if (failed) {
  console.log("\nFix the values above in server/.env, then run this check again.\n");
  process.exit(1);
}

if (!phoneArg) {
  console.log("\nConfig looks good. To send a real test prompt:  npm run mpesa:check -- 07XXXXXXXX\n");
  process.exit(0);
}

// 2) Real STK push
const phone = normalisePhone(phoneArg);
const amount = Number(amountArg || 1);
if (!phone) {
  bad(`"${phoneArg}" is not a valid Safaricom number.`);
  process.exit(1);
}

let checkoutId;
try {
  const ts = darajaTimestamp();
  const res = await darajaPost(cfg.urls.stkPush, {
    BusinessShortCode: cfg.shortcode,
    Password: password(ts),
    Timestamp: ts,
    TransactionType: cfg.transactionType,
    Amount: amount,
    PartyA: phone,
    PartyB: cfg.partyB,
    PhoneNumber: phone,
    CallBackURL: cfg.callbackUrl,
    AccountReference: (cfg.accountReference || "IKONEX-TEST").slice(0, 12),
    TransactionDesc: "Test",
  });
  checkoutId = res.CheckoutRequestID;
  ok(`PIN prompt sent to ${phone} for KES ${amount}. (${res.CustomerMessage})`);
} catch (e) {
  bad(`STK push rejected: ${e.message}`);
  if (/credential|password|passkey/i.test(e.message))
    console.log("    → MPESA_PASSKEY or MPESA_SHORTCODE is wrong (for a Till, the shortcode is the Store/HO number the passkey was issued for).");
  if (/merchant|shortcode|party/i.test(e.message))
    console.log("    → Check MPESA_SHORTCODE, MPESA_TRANSACTION_TYPE and MPESA_PARTY_B (Till number).");
  process.exit(1);
}

// 3) Wait for the customer to act, using STK Query
console.log("  … enter your PIN on the phone (waiting up to 90s)");
const started = Date.now();
await new Promise((r) => setTimeout(r, 10000));
while (Date.now() - started < 90000) {
  try {
    const ts = darajaTimestamp();
    const q = await darajaPost(cfg.urls.stkQuery, {
      BusinessShortCode: cfg.shortcode,
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutId,
    });
    if (q.ResultCode !== undefined) {
      if (String(q.ResultCode) === "0") ok(`Payment completed: ${q.ResultDesc}`);
      else warn(`Result ${q.ResultCode}: ${q.ResultDesc}`);
      console.log("\nM-Pesa Express is working end-to-end.\n");
      process.exit(0);
    }
  } catch (e) {
    /* still processing */
  }
  await new Promise((r) => setTimeout(r, 6000));
}
warn("No result within 90s (prompt may have been ignored). The push itself worked.");
process.exit(0);
