import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mcpServer } from "./mcpServer.js";

const transport = new StdioServerTransport();

await mcpServer.connect(transport);

console.log("MCP Server running with stdio transport");
