/**
 * /.api/mcp.js
 * Checks the connection of the Smithery MCP server (https://mcp.smithery.ai/linpeiyun-emily)
 * and pulls data from the 4 attached MCP tools:
 * - eng213035/gachi-ramen
 * - eng213035/tokyo-restroom
 * - haomingkoo/japan-seasons-mcp
 * - kakar-satoshi/japan-holiday-mcp
 */
export {
  checkMcpServerConnection,
  pullDataFromMcpServer,
  default,
} from "../api/mcp.js";
