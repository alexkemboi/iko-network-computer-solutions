# IKONEX API — M-Pesa Express (STK push) & contact form

When a customer clicks **Order**, types their M-Pesa number and taps **Pay with M-Pesa**, this server asks Safaricom to send the **"Enter your M-Pesa PIN"** prompt to their phone. It then reports the result back to the website: paid, cancelled or failed, plus the M-Pesa receipt.

```
Website ──POST /api/mpesa/stkpush──▶ IKONEX API ──OAuth + STK Push──▶ Safaricom Daraja ──▶ 📱 PIN prompt
Website ◀─GET /api/mpesa/status/:id── IKONEX API ◀──callback (or STK Query)── Safaricom
```

It's a single file (`server/mpesa-server.mjs`) with no npm packages to install. It needs **Node.js 18+**.

## Quick setup on the VPS (one command)

```bash
cd ~/ikonexsystemswebsites/iko-network-computer-solutions
git pull origin main
nano server/.env            # paste the same contents as server/.env on your computer
sudo bash server/setup-vps.sh
```

The script checks Node and your M-Pesa settings, starts the API with pm2, and adds the `/api` forwarding to your nginx site. It keeps a backup of the nginx config and restores it if the config test fails. It finishes by testing `https://ikonexsystems.com/api/health`. It's safe to run again.

## Why you see "Online M-Pesa checkout isn't available right now"

This message means the website couldn't get a PIN prompt sent, so it kept the order safe instead. There are three causes:

1. **No keys yet.** `server/.env` doesn't exist or is missing values. Fix: step 1 below.
2. **The API isn't running on the VPS.** Fix: step 2 below. `pm2 status` should show `ikonex-api` online.
3. **nginx isn't forwarding `/api`.** Fix: step 3 below. `curl -s https://ikonexsystems.com/api/health` must return `{"ok":true,"mpesa":"production"}`.

The browser console (F12 → Console) shows the exact reason, starting with `[IKONEX] M-Pesa checkout unavailable:`.

## Check your setup in one command

```bash
npm run mpesa:check                  # checks server/.env and logs in to Daraja (no money moves)
npm run mpesa:check -- 0712345678    # also sends a real KES 1 PIN prompt to that phone
```

It prints each setting with the secrets masked, flags wrong or placeholder values (for example a passkey of `undefined`), and tells you exactly what Safaricom rejected.

**Common mistakes it catches:**

- `MPESA_PASSKEY` must be the long Lipa Na M-Pesa passkey from Safaricom's go-live email, usually 64 characters. It isn't your M-Pesa PIN or your consumer secret.
- **Till (Buy Goods):** `MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline`, `MPESA_SHORTCODE` = the Store/HO number the passkey was issued for, and `MPESA_PARTY_B` = your Till number.
- **Same setting twice:** if a setting appears twice in `server/.env`, the last one is used. Keep one of each.

## Test on your own computer first (optional)

`npm start` now runs the API inside the React dev server, so there's no second process to start:

1. Create `server/.env` from `server/.env.example` and add your keys.
2. Run `npm start`. The terminal prints `IKONEX API mounted at /api — M-Pesa Express: production ready`.
3. Order something with your phone number. The PIN prompt arrives on your phone.

On your own computer Safaricom can't reach the callback URL, so the confirmation comes from the automatic STK Query instead, about 15 to 20 seconds after you pay. On the live server with nginx, it appears instantly.

---

## One-time setup on your VPS

### 1. Put your Daraja production credentials in `server/.env`

```bash
cd ~/ikonexsystemswebsites/iko-network-computer-solutions
cp server/.env.example server/.env
nano server/.env
```

Fill in these values from your approved app on developer.safaricom.co.ke (M-Pesa Express, Lipa Na M-Pesa Production):

| Variable | What to put |
|---|---|
| `MPESA_CONSUMER_KEY` | Consumer Key |
| `MPESA_CONSUMER_SECRET` | Consumer Secret |
| `MPESA_PASSKEY` | Passkey |
| `MPESA_SHORTCODE` | Short Code |
| `MPESA_TRANSACTION_TYPE` | `CustomerPayBillOnline` for a **Paybill**, `CustomerBuyGoodsOnline` for a **Till** |
| `MPESA_PARTY_B` | Leave empty for Paybill. For Till: your **Till number**. `MPESA_SHORTCODE` is then the Store/HO number Safaricom gave you with the passkey. |
| `MPESA_CALLBACK_URL` | `https://ikonexsystems.com/api/mpesa/callback` (must be public HTTPS) |
| `MPESA_CALLBACK_SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` |

The production URLs you were given are already the defaults, and are listed in the example file:

- OAuth: `https://api.safaricom.co.ke/oauth/v1/generate`
- STK Push: `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
- STK Query: `https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query`

> `server/.env` is git-ignored. Your keys stay on the server and never reach GitHub or the browser.

### 2. Start the API and keep it running

```bash
node -v                                   # must be v18 or newer
sudo npm install -g pm2                   # once
pm2 start server/mpesa-server.mjs --name ikonex-api
pm2 save && pm2 startup                   # restart automatically after a reboot
curl -s http://127.0.0.1:5050/api/health  # → {"ok":true,"mpesa":"production"}
```

To restart it on every deploy, add this as the last line of the `script:` in `.github/workflows/deploy.yml`:

```bash
      if command -v pm2 >/dev/null 2>&1; then pm2 restart ikonex-api --update-env || pm2 start server/mpesa-server.mjs --name ikonex-api; fi
```

### 3. Forward `/api` from nginx to the API

Add this inside the `server { … }` block for ikonexsystems.com, then run `sudo nginx -t && sudo systemctl reload nginx`:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5050;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;          # realtime payment updates (Server-Sent Events)
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_read_timeout 300s;
}
```

### 4. Deploy the website

Production builds (`npm run build`, which your deploy runs) have live STK push switched on automatically. Nothing else needs to change on the website.

If the API is ever down or not configured, the checkout doesn't break. It tells the customer that no payment was taken and offers to email the order or call you instead.

---

## Test it

1. Open the site and choose any product or service, then click **Order**.
2. Enter your name, **your own Safaricom number** and a small amount (e.g. `1`), then tap **Pay with M-Pesa**.
3. Your phone should show the PIN prompt within a few seconds. Enter your PIN.
4. The website should show **Payment received** with the M-Pesa receipt number.

To watch it live, run `pm2 logs ikonex-api`. You'll see `STK push sent …` and then `Callback …: success receipt …`.

### If the prompt doesn't arrive

| Log / message | Fix |
|---|---|
| `M-Pesa authentication failed` | Consumer key or secret is wrong, or the app isn't approved for production |
| `Bad Request - Invalid PhoneNumber` | The number isn't a Safaricom M-Pesa line |
| `Bad Request - Invalid Password` / `Wrong credentials` | Shortcode and passkey don't match. Check Paybill vs Till settings. |
| `Merchant does not exist` | Wrong `MPESA_SHORTCODE`, or Till settings (`MPESA_PARTY_B`) are missing |
| Prompt arrives but the site stays on "Waiting…" | The callback URL isn't reachable. The site still confirms via STK Query after about 15 seconds. Check nginx and that the URL is HTTPS. |
| `Too many payment requests` | Built-in protection: at most 3 prompts per phone every 5 minutes |

---

## What's recorded

Every prompt, callback and status check is appended to `server/data/payments.jsonl`: item, customer name, phone, amount, receipt and result. The console logs mask the phone number. Contact-form messages go to `server/data/messages.jsonl`. Both are git-ignored. Use them together with your M-Pesa statement to fulfil orders.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/mpesa/stkpush` | `{ phone, amount, reference, description, customerName }` → sends the PIN prompt |
| POST | `/api/mpesa/callback/<secret>` | Safaricom posts the result here |
| GET | `/api/mpesa/events/:checkoutRequestId` | Realtime stream (Server-Sent Events): the result is pushed the moment Safaricom confirms |
| GET | `/api/mpesa/status/:checkoutRequestId` | `pending` / `success` / `failed` / `cancelled` (+ receipt). Backup polling that also triggers STK Query. |
| POST | `/api/contact` | Saves contact-form messages |
| GET | `/api/health` | Shows whether M-Pesa is configured |

## Security notes

- Keys and the passkey live **only** in `server/.env`, never in the React `.env` files, because everything there is public.
- Payment results are only accepted on the secret callback URL, and only for prompts this server sent. A successful payment is also checked against the amount that was requested.
- The amount comes from the customer's browser: either an item's `price` (optional field in the site data) or the amount they type as quoted. Always confirm the amount paid matches the agreed price before fulfilling an order.
- The API listens on `127.0.0.1` only, so it's reachable just through nginx.

---

# Business portal: login, dashboards, orders, payments, SMS and payouts

The website now has a portal at **`/#/login`**. The **Login** button in the navbar opens it.

- **Sign up and log in.** The **first account created becomes the Administrator**. Later sign-ups are Customers, who see only their own orders and payments.
- **Menus by role:**

  | Menu | Who sees it |
  |---|---|
  | Overview, Orders, Payments | Everyone (customers see only their own) |
  | Enquiries (contact form), Bulk SMS, Products, Services | Admin + Staff |
  | Bulk Payments, Users, Settings | Admin only |

- **Recorded automatically.** Every website checkout creates an **Order**. Every M-Pesa prompt creates a **Payment**. When Safaricom calls back, the payment gets its receipt and the order becomes *Paid*, *Cancelled* or *Failed*.
- **Fixed prices.** If you set a price on a product or service, checkout charges exactly that amount. The server enforces it too. Items without a price keep the "amount quoted to you" box.

## 1. SQL Server database (`localhost\SQLEXPRESS`, database `ikonex`)

Do this once on the PC that runs SQL Server Express:

1. **SQL Server Configuration Manager** → *SQL Server Network Configuration* → *Protocols for SQLEXPRESS* → enable **TCP/IP**.
2. In the same tool, under *SQL Server Services*:
   - Start **SQL Server Browser** and set it to *Automatic*. It lets the app find the named instance `SQLEXPRESS`.
   - Restart **SQL Server (SQLEXPRESS)**.
3. Open `server/db/create-login.sql` in **SSMS**, connected with Windows Authentication:
   - **Change the password** in it.
   - Run it. This turns on SQL logins, creates the `ikonex` database and creates the `ikonex_app` login.
   - Restart **SQL Server (SQLEXPRESS)** again.
4. Add to `server/.env`:
   ```
   DB_SERVER=localhost
   DB_INSTANCE=SQLEXPRESS
   DB_NAME=ikonex
   DB_USER=ikonex_app
   DB_PASSWORD=the password you set
   ```
   If SQL Server Browser can't run, leave `DB_INSTANCE` empty and set `DB_PORT` instead. Find the port in Configuration Manager → TCP/IP → *IP Addresses* → *IPAll* → *TCP Dynamic Ports*, or set a fixed 1433.
5. From the project folder:
   ```
   npm install
   npm run db:setup -- --admin you@ikonexsystems.com "Your Name" "YourStrongPassw0rd"
   ```
   This creates all tables (Users, Orders, Payments, CatalogItems, SmsCampaigns, SmsMessages, PayoutBatches, Payouts, Settings, ContactMessages). It also loads the products and services from the website and creates your admin login. You can run it again safely.
6. Run `npm start`, open http://localhost:3000/#/login, then log in.

If `db:setup` can't connect, it prints a checklist of the usual causes: TCP/IP off, Browser stopped, mixed mode not enabled, or a wrong password.

> **Live server (VPS):** the VPS needs its own SQL Server, with the same `DB_*` values in its `server/.env`. Until then the live API keeps taking M-Pesa payments exactly as before. Only the portal shows "database not configured".

## 2. Bulk SMS (Africa's Talking)

1. In your Africa's Talking dashboard, create an API key (*Settings → API Key*). Request a sender ID too if you want your name to show instead of a short code.
2. Add to `server/.env`:
   ```
   AT_USERNAME=your app username (not "sandbox" for live)
   AT_API_KEY=your key
   AT_SENDER_ID=IKONEX        # optional, must be approved
   ```
3. Set the delivery-report callback in Africa's Talking *SMS → Callback URLs → Delivery Reports* to:
   `https://ikonexsystems.com/api/sms/delivery/<your MPESA_CALLBACK_SECRET>`

## 3. Bulk payments (M-Pesa B2C)

Add your B2C details to `server/.env`: `MPESA_B2C_SHORTCODE`, `MPESA_B2C_INITIATOR`, `MPESA_B2C_SECURITY_CREDENTIAL` (the encrypted initiator password from the Daraja portal), and the result/timeout URLs shown in `.env.example`. If B2C sits on a different Daraja app, also set its own `MPESA_B2C_CONSUMER_KEY` and `MPESA_B2C_CONSUMER_SECRET`.

Safety built in:

- A batch is saved as a **draft** first.
- An admin must **type the exact total** to approve it.
- You can require a **second admin** to approve (Settings → Two-person approval).
- Every payee shows its M-Pesa reference or the reason it failed.
- There is a per-payee maximum (`MPESA_B2C_MAX_AMOUNT`).

Restart the API after editing `server/.env` (`pm2 restart ikonex-api --update-env` on the VPS).
