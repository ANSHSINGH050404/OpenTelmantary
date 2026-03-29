import express, { Request } from "express";
import httpProxy from "http-proxy";
import { IncomingMessage } from "http";

const app = express();
const proxy = httpProxy.createProxyServer({});

const TARGET = "http://localhost:5000";

app.use((req, res) => {
  proxy.web(req, res, { target: TARGET });
});

app.listen(3000, () => {
  console.log("Sidecar running on port 3000");
   
});

function getTraceHeader(req: IncomingMessage){
    return{
        traceparant:req.headers["traceparent"] || generateTraceparent(),
    }
}

function generateTraceparent() {
  return `00-${randomHex(32)}-${randomHex(16)}-01`;
}

function randomHex(size: number) {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

proxy.on("proxyReq", (proxyReq, req) => {
  const traceHeaders = getTraceHeader(req);
  Object.entries(traceHeaders).forEach(([k, v]) =>
    proxyReq.setHeader(k, v as string)
  );
});

const metrics: { rtt: number[]; failures: number } = {
  rtt: [],
  failures: 0,
};

proxy.on("proxyReq", (proxyReq, req: any) => {
  req.startTime = Date.now();
});

proxy.on("proxyRes", (proxyRes, req: any) => {
  const rtt = Date.now() - req.startTime;
  metrics.rtt.push(rtt);

  if (metrics.rtt.length > 100) metrics.rtt.shift();
});

let maxConcurrent = 50;
let current = 0;

function avgRTT() {
  if (!metrics.rtt.length) return 0;
  return metrics.rtt.reduce((a, b) => a + b, 0) / metrics.rtt.length;
}

app.use(async (req, res, next) => {
  if (current >= maxConcurrent) {
    return res.status(503).send("Backpressure: Too many requests");
  }

  current++;
  res.on("finish", () => current--);

  next();
});

setInterval(() => {
  const rtt = avgRTT();

  if (rtt > 500) {
    maxConcurrent = Math.max(10, maxConcurrent - 5);
  } else {
    maxConcurrent = Math.min(100, maxConcurrent + 5);
  }

  console.log("Adaptive limit:", maxConcurrent, "RTT:", rtt);
}, 2000);

proxy.on("error", (err: Error, req: IncomingMessage, res: any) => {
  metrics.failures++;

  if (!res.headersSent) {
    res.writeHead(502);
  }
  res.end("Bad Gateway");
});

if (metrics.failures > 50) {
  maxConcurrent = 5; // aggressive throttle
}