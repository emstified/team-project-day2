import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import healthHandler, { checkMcpAndServicesHealth } from "./api/health.js";
import mcpHandler from "./api/mcp.js";
import ramenHandler from "./api/ramen.js";
import {
  createSmitheryOAuthUrl,
  exchangeSmitheryOAuthCode,
  probeAndListMcpTools,
  clearActiveToken,
} from "./api/mcpClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 1. MCP Server Connection & Tool Invocation (/api/mcp.js, /.api/mcp.js, /api/mcp)
  app.all(
    ["/api/mcp", "/api/mcp.js", "/.api/mcp", "/.api/mcp.js"],
    (req, res) => {
      mcpHandler(req, res);
    }
  );

  // 2. MCP Health Monitor (/api/health, /api/health.js, /.api/health.js)
  app.get(
    ["/api/health", "/api/health.js", "/.api/health", "/.api/health.js"],
    (req, res) => {
      healthHandler(req, res);
    }
  );

  // 3. Smithery OAuth 2.0 PKCE Authorization URL Generator for https://server.smithery.ai/eng213035/gachi-ramen
  app.get("/api/mcp/oauth/url", async (req, res) => {
    try {
      const origin = String(
        req.query.origin || process.env.APP_URL || "http://localhost:3000"
      );
      const authData = await createSmitheryOAuthUrl(origin);
      res.json(authData);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initialize Smithery OAuth";
      res.status(500).json({ error: message });
    }
  });

  // 4. OAuth 2.0 Popup Callback Route (/auth/callback)
  const oauthCallbackHandler = async (
    req: express.Request,
    res: express.Response
  ) => {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    const errorParam = String(req.query.error || "");

    if (errorParam) {
      res.send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>gachi-ramen MCP Authorization Declined</h3>
    <p>${errorParam}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(
          errorParam
        )} }, '*');
        setTimeout(() => window.close(), 1200);
      }
    </script>
  </body>
</html>`);
      return;
    }

    try {
      await exchangeSmitheryOAuthCode(code, state);
      await probeAndListMcpTools();

      res.send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>gachi-ramen MCP Connected</h3>
    <p>Authenticated with https://server.smithery.ai/eng213035/gachi-ramen. Closing window...</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "OAuth token exchange failed";
      res.status(400).send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>Authentication Error</h3>
    <p>${msg}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(
          msg
        )} }, '*');
      }
    </script>
  </body>
</html>`);
    }
  };

  app.get(["/auth/callback", "/auth/callback/"], oauthCallbackHandler);

  // 5. Disconnect Smithery OAuth Session
  app.post("/api/mcp/disconnect", (_req, res) => {
    clearActiveToken();
    res.json({ disconnected: true });
  });

  // 6. Lightweight Status Endpoint
  app.get("/api/mcp/status", async (_req, res) => {
    const health = await checkMcpAndServicesHealth();
    res.json(health);
  });

  // 7. Gachi-Ramen Endpoint (search_ramen, get_ramen_shop, get_ramen_changes)
  app.get(
    ["/api/ramen", "/api/ramen.js", "/.api/ramen", "/.api/ramen.js"],
    (req, res) => {
      ramenHandler(req, res);
    }
  );

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GachiRamen server listening on http://localhost:${PORT}`);
  });
}

startServer();
