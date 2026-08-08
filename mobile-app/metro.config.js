const https = require("https");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const TARGET_HOST = "tichisuraksha.veaglespace.com";

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware, server) => {
    return (req, res, next) => {
      if (req.url && (req.url === "/api" || req.url.startsWith("/api/"))) {
        const targetUrl = new URL(req.url, `https://${TARGET_HOST}`);

        const headers = { ...req.headers };
        headers.host = TARGET_HOST;
        headers.origin = `https://${TARGET_HOST}`;
        delete headers.referer;

        // Handle preflight OPTIONS immediately
        if (req.method === "OPTIONS") {
          res.writeHead(204, {
            "access-control-allow-origin": req.headers.origin || "*",
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma",
            "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          });
          res.end();
          return;
        }

        const proxyReq = https.request(
          targetUrl,
          {
            method: req.method,
            headers,
          },
          (proxyRes) => {
            // Forward headers to client with CORS enabled
            const resHeaders = { ...proxyRes.headers };
            resHeaders["access-control-allow-origin"] = req.headers.origin || "*";
            resHeaders["access-control-allow-credentials"] = "true";
            resHeaders["access-control-allow-headers"] = "Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma";
            resHeaders["access-control-allow-methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

            res.writeHead(proxyRes.statusCode, resHeaders);
            proxyRes.pipe(res, { end: true });
          }
        );

        proxyReq.on("error", (err) => {
          console.error("[Metro API Proxy Error]:", err.message);
          if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to connect to live API server: " + err.message }));
          }
        });

        req.pipe(proxyReq, { end: true });
        return;
      }

      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: "./src/global.css" });

