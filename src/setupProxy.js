/*
 * Development only (used automatically by `npm start`).
 *
 * Serves the IKONEX API (server/mpesa-server.mjs) inside the React dev server,
 * so M-Pesa STK push and the contact form work locally without running a
 * second process. Keys are read from server/.env, exactly as in production.
 *
 * In production nginx forwards /api to the standalone API instead
 * (see server/README.md). This file is never included in the built site.
 */
const path = require("path");
const { pathToFileURL } = require("url");

module.exports = function setupProxy(app) {
  const modulePath = pathToFileURL(path.join(__dirname, "..", "server", "mpesa-server.mjs")).href;
  const apiReady = import(modulePath).then((api) => {
    // eslint-disable-next-line no-console
    console.log(`\n  IKONEX API mounted at /api — M-Pesa Express: ${api.mpesaReadiness()}\n`);
    return api;
  });

  app.use((req, res, next) => {
    if (!req.url.startsWith("/api/")) return next();
    apiReady
      .then((api) => api.handleRequest(req, res))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("IKONEX API failed to load:", err);
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Payment service failed to start." }));
      });
  });
};
