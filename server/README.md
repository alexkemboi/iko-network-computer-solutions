# IKONEX API — M-Pesa checkout & contact form

A zero-dependency Node.js (18+) server that powers the website's **Order → Pay with M-Pesa** buttons (Safaricom Daraja STK push) and the **contact form**.

Until this is running and the website knows its address, the site still works safely:

- **Order buttons** collect the customer's details and M-Pesa number, then offer to email the order to `info@ikonexsystems.com` or call. No payment is taken.
- **Contact form** opens the visitor's email app with the message pre-filled.

## 1. Get Daraja credentials

1. Create an app at <https://developer.safaricom.co.ke> with the *Lipa Na M-Pesa Online* product.
2. Note the **Consumer Key**, **Consumer Secret**, your **Shortcode** (Paybill or Till) and the **Passkey**.
3. Start in `sandbox`. Switch to `production` once Safaricom approves your go-live.

## 2. Configure

```bash
cp server/.env.example server/.env   # then fill it in
```

`MPESA_CALLBACK_URL` must be a public **HTTPS** URL that reaches this server, for example `https://ikonexsystems.com/api/mpesa/callback`.

## 3. Run it on the VPS

```bash
node server/mpesa-server.mjs          # listens on PORT (default 5050)
```

Keep it running with pm2 or systemd, for example `pm2 start server/mpesa-server.mjs --name ikonex-api`.

Add this to the nginx site that serves `/var/www/ikonexsystems`:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5050;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## 4. Point the website at it

Create `.env` in the project root on the server, next to `package.json`:

```
REACT_APP_API_BASE=https://ikonexsystems.com
```

Then run `npm run build`. Your deploy workflow already does this. The Order buttons will now send the M-Pesa PIN prompt to the customer's phone and confirm the payment on screen.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/mpesa/stkpush` | `{ phone, amount, reference, description, customerName }` → sends the PIN prompt |
| POST | `/api/mpesa/callback` | Safaricom posts the result here |
| GET | `/api/mpesa/status/:checkoutRequestId` | `pending` / `success` / `failed` / `cancelled` (+ receipt) |
| POST | `/api/contact` | Saves contact-form messages |
| GET | `/api/health` | Shows whether M-Pesa is configured |

Payments and messages are appended to `server/data/payments.jsonl` and `server/data/messages.jsonl`. That folder is git-ignored. Check these files, or your M-Pesa statement, to fulfil orders.

## Security notes

- Keys and the passkey live **only** in `server/.env`. Never put them in the React `.env`, because everything there is public.
- The amount comes from the customer's browser: either the price set on an item (optional `price` field) or the amount they type as quoted. The server only checks that it's a whole number between 1 and 250,000 KES. Always confirm the amount paid matches the agreed price before fulfilling an order.
- Set `ALLOWED_ORIGIN` to your site's URL in production.
