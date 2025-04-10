import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import { mcpServer } from "./mcpServer.js";

const app = express();
let transport: SSEServerTransport | null = null;

app.get("/sse", async (_, res: Response) => {
  transport = new SSEServerTransport("/messages", res);
  await mcpServer.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  }
});

app.listen(8765, () => {
  console.log("MCP Server running with SSE on http://localhost:8765/sse");
});
