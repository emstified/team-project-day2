import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import healthHandler, { checkMcpAndServicesHealth } from "./api/health.js";
import mcpHandler from "./api/mcp.js";
import ramenHandler from "./api/ramen.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 1. MCP Server Connection & Tool Invocation (/api/mcp.js, /api/mcp)
  app.all(
    ["/api/mcp", "/api/mcp.js", "/.api/mcp", "/.api/mcp.js"],
    (req, res) => {
      mcpHandler(req, res);
    }
  );

  // 2. MCP Health Monitor (/api/health, /api/health.js)
  app.get(
    ["/api/health", "/api/health.js", "/.api/health", "/.api/health.js"],
    (req, res) => {
      healthHandler(req, res);
    }
  );

  // 3. Lightweight Status Endpoint
  app.get("/api/mcp/status", async (_req, res) => {
    const health = await checkMcpAndServicesHealth();
    res.json(health);
  });

  // 4. Gachi-Ramen Endpoint (search_ramen, get_ramen_shop, get_ramen_changes on https://ramen.gachi-tokusuru.com/mcp)
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
