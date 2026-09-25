#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# IKONEX — one-time VPS setup for M-Pesa Express (STK push)
#
#   cd ~/ikonexsystemswebsites/iko-network-computer-solutions
#   git pull origin main
#   sudo bash server/setup-vps.sh
#
# Safe to run again: every step checks before it changes anything.
#   1. checks Node.js 18+ and server/.env
#   2. starts the API with pm2 (auto-restarts, survives reboots)
#   3. adds `location /api/` to the ikonexsystems.com nginx site (backup kept)
#   4. tests https://ikonexsystems.com/api/health
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${DOMAIN:-ikonexsystems.com}"
PORT="${PORT:-5050}"
APP_NAME="ikonex-api"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_USER="${SUDO_USER:-$(whoami)}"

green() { printf "\033[32m✔ %s\033[0m\n" "$*"; }
yellow() { printf "\033[33m⚠ %s\033[0m\n" "$*"; }
red() { printf "\033[31m✘ %s\033[0m\n" "$*"; }
as_user() { if [ "$RUN_USER" != "root" ] && [ "$(id -u)" = "0" ]; then sudo -u "$RUN_USER" -H bash -lc "$*"; else bash -lc "$*"; fi; }

echo "IKONEX API setup — project: $PROJECT_DIR (user: $RUN_USER)"
echo

# `sudo` resets PATH, which hides Node/pm2 installed with nvm — reuse the
# invoking user's login PATH so the same node/pm2 are found.
if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
  USER_PATH="$(sudo -u "$SUDO_USER" -H bash -lc 'echo $PATH' 2>/dev/null || true)"
  [ -n "$USER_PATH" ] && export PATH="$USER_PATH:$PATH"
fi

# ── 1. Node.js + server/.env ────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  red "Node.js is not installed. Install Node 18+ (e.g. https://github.com/nodesource/distributions) and re-run."
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  red "Node.js $(node -v) is too old — version 18 or newer is required."
  exit 1
fi
green "Node.js $(node -v)"

if [ ! -f "$PROJECT_DIR/server/.env" ]; then
  red "server/.env is missing on this server."
  echo "   It is not in git (it holds your keys). Copy it from your computer, e.g.:"
  echo "   scp server/.env ${RUN_USER}@<your-server>:$PROJECT_DIR/server/.env"
  exit 1
fi
chmod 600 "$PROJECT_DIR/server/.env" || true
green "server/.env found"

echo
echo "Checking M-Pesa settings and Daraja login…"
if ! as_user "cd '$PROJECT_DIR' && node server/mpesa-check.mjs"; then
  red "Fix the problems above in server/.env, then run this script again."
  exit 1
fi

# ── 2. pm2 ──────────────────────────────────────────────────────────────────
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing pm2…"
  npm install -g pm2 >/dev/null
fi
green "pm2 $(pm2 -v)"

NODE_BIN="$(command -v node)"

# Is something else already using the port?
PORT_OWNER="$(ss -ltnp 2>/dev/null | awk -v p=":$PORT" '$4 ~ p"$" {print $NF}' | head -1 || true)"
if [ -n "$PORT_OWNER" ] && ! echo "$PORT_OWNER" | grep -q "mpesa-server\|PM2\|node"; then
  red "Port $PORT is already used by another program: $PORT_OWNER"
  echo "   Pick a free port: set PORT=5051 in server/.env, then re-run: sudo PORT=5051 bash server/setup-vps.sh"
  exit 1
fi

# (Re)create the pm2 process so it always runs with the SAME Node that passed
# the checks above (pm2 installed under an older system Node is a common trap).
as_user "pm2 delete $APP_NAME >/dev/null 2>&1 || true"
as_user "cd '$PROJECT_DIR' && pm2 start server/mpesa-server.mjs --name $APP_NAME --interpreter '$NODE_BIN' --time" >/dev/null
green "Started $APP_NAME with $NODE_BIN ($(node -v))"

as_user "pm2 save" >/dev/null
if [ "$(id -u)" = "0" ] && [ "$RUN_USER" != "root" ]; then
  env PATH="$PATH" pm2 startup systemd -u "$RUN_USER" --hp "$(getent passwd "$RUN_USER" | cut -d: -f6)" >/dev/null 2>&1 || true
fi

# Wait up to 15s for the API to answer
STARTED=""
for i in $(seq 1 15); do
  if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then STARTED=1; break; fi
  sleep 1
done

if [ -n "$STARTED" ]; then
  green "API answering on 127.0.0.1:$PORT — $(curl -fsS "http://127.0.0.1:$PORT/api/health")"
else
  red "The API did not start. Here is why (last lines of its log):"
  echo "────────────────────────────────────────────────────────────"
  as_user "pm2 logs $APP_NAME --lines 30 --nostream" 2>&1 | tail -40 || true
  echo "────────────────────────────────────────────────────────────"
  echo "Trying to run it directly for a clearer error:"
  as_user "cd '$PROJECT_DIR' && timeout 5 '$NODE_BIN' server/mpesa-server.mjs" 2>&1 | tail -15 || true
  echo "────────────────────────────────────────────────────────────"
  echo "Copy everything above and send it over."
  exit 1
fi

# ── 3. nginx ────────────────────────────────────────────────────────────────
if [ "$(id -u)" != "0" ]; then
  yellow "Not running as root — skipping nginx. Re-run with: sudo bash server/setup-vps.sh"
  exit 0
fi

SNIPPET=/etc/nginx/snippets/ikonex-api.conf
mkdir -p /etc/nginx/snippets
cat > "$SNIPPET" <<NGINX
# IKONEX API (M-Pesa Express + contact form) — managed by server/setup-vps.sh
location /api/ {
    proxy_pass http://127.0.0.1:$PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Connection "";
    proxy_buffering off;          # realtime payment updates (Server-Sent Events)
    proxy_read_timeout 300s;
}
NGINX
green "Wrote $SNIPPET"

SITE_FILES="$(grep -rlE "server_name[^;]*\b${DOMAIN//./\\.}\b" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | sort -u || true)"
if [ -z "$SITE_FILES" ]; then
  red "Couldn't find an nginx site with server_name $DOMAIN."
  echo "   Add this line inside its server { } block (next to server_name) and reload nginx:"
  echo "   include snippets/ikonex-api.conf;"
  exit 1
fi

for f in $SITE_FILES; do
  real="$(readlink -f "$f")"
  if grep -q "snippets/ikonex-api.conf" "$real"; then
    green "nginx already includes the API in $real"
    continue
  fi
  cp "$real" "$real.bak.$(date +%Y%m%d%H%M%S)"
  # Add the include right after every server_name line for the domain
  python3 - "$real" "$DOMAIN" <<'PY'
import re, sys
path, domain = sys.argv[1], sys.argv[2]
src = open(path).read()
pat = re.compile(r"^([ \t]*)(server_name[^;]*\b" + re.escape(domain) + r"\b[^;]*;)[ \t]*$", re.M)
out = pat.sub(lambda m: f"{m.group(1)}{m.group(2)}\n{m.group(1)}include snippets/ikonex-api.conf;", src)
open(path, "w").write(out)
PY
  green "Added include to $real (backup saved next to it)"
done

if nginx -t 2>/dev/null; then
  systemctl reload nginx
  green "nginx reloaded"
else
  red "nginx config test failed — restoring backups."
  for f in $SITE_FILES; do
    real="$(readlink -f "$f")"; last="$(ls -t "$real".bak.* 2>/dev/null | head -1 || true)"
    [ -n "$last" ] && cp "$last" "$real"
  done
  nginx -t; exit 1
fi

# ── 4. Public test ──────────────────────────────────────────────────────────
sleep 1
RESULT="$(curl -fsS "https://$DOMAIN/api/health" 2>/dev/null || true)"
if echo "$RESULT" | grep -q '"ok":true'; then
  green "https://$DOMAIN/api/health → $RESULT"
  echo
  green "Done. Order something on https://$DOMAIN — the M-Pesa PIN prompt will be sent to the phone."
else
  red "https://$DOMAIN/api/health did not return the API (got: ${RESULT:0:80}…)"
  echo "   Check: sudo nginx -T | grep -n ikonex-api   and   pm2 logs $APP_NAME"
  exit 1
fi
