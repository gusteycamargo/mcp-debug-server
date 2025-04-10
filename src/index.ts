import "./tools.js";

async function startServer(transportType: "stdio" | "sse") {
  if (transportType === "stdio") {
    await import("./stdioServer.js");
  } else if (transportType === "sse") {
    await import("./sseServer.js");
  }
}

const transportType = process.argv[2] === "sse" ? "sse" : "stdio";
startServer(transportType);
