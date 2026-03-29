import express, { Request, Response, NextFunction } from "express";
import httpProxy from "http-proxy";
import { v4 as uuidv4 } from "uuid";

import { config } from "./config";
import healthRouter, { setHealthy } from "./health";
import { generalLimiter } from "./rate-limit";
import { getCached, setCache, cache } from "./cache";
import { circuitBreaker, CircuitState } from "./circuit-breaker";
import { createLogger } from "./logger";

const logger = createLogger();

const app = express();
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  timeout: 30000,
});

let metrics = {
  rtt: [] as number[],
  failures: 0,
  concurrent: 0,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers["x-correlation-id"] = req.headers["x-correlation-id"] || uuidv4();
  const correlationId = req.headers["x-correlation-id"] as string;
  
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    correlationId,
  });

  next();
});

app.use("/health", healthRouter);

if (config.rateLimit.enabled) {
  app.use(generalLimiter);
}

if (config.cache.enabled) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    
    const cached = getCached(req.path);
    if (cached) {
      logger.debug("Cache hit", { path: req.path });
      return res.status(200).json(cached);
    }
    next();
  });
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (config.circuitBreaker.enabled && circuitBreaker.getState() === CircuitState.OPEN) {
    logger.warn("Circuit breaker open, rejecting request");
    return res.status(503).json({ error: "Service temporarily unavailable" });
  }

  if (metrics.concurrent >= 100) {
    logger.warn("Backpressure: too many requests");
    return res.status(503).json({ error: "Backpressure: Too many requests" });
  }

  metrics.concurrent++;
  next();
});

app.use((req: Request, res: Response) => {
  const startTime = Date.now();
  const correlationId = req.headers["x-correlation-id"] as string;

  proxy.web(req, res, { target: config.target }, (err) => {
    metrics.concurrent--;
    metrics.failures++;
    
    if (config.circuitBreaker.enabled) {
      circuitBreaker.execute(() => Promise.resolve()).catch(() => {});
    }

    logger.error("Proxy error", { error: err?.message, correlationId });
    setHealthy(false);
    
    res.status(502).json({ error: "Bad Gateway" });
  });
});

proxy.on("proxyReq", (proxyReq: any, req: any) => {
  proxyReq.setHeader("X-Correlation-ID", req.headers["x-correlation-id"] || uuidv4());
  req.startTime = Date.now();
});

proxy.on("proxyRes", (proxyRes: any, req: any) => {
  const duration = Date.now() - req.startTime;
  metrics.rtt.push(duration);
  metrics.concurrent--;

  if (metrics.rtt.length > 1000) {
    metrics.rtt.shift();
  }

  if (config.circuitBreaker.enabled) {
    circuitBreaker.execute(() => Promise.resolve()).catch(() => {});
  }

  if (config.cache.enabled && req.method === "GET" && proxyRes.statusCode === 200) {
    let body = "";
    proxyRes.on("data", (chunk: string) => { body += chunk; });
    proxyRes.on("end", () => {
      try {
        setCache(req.url || "", JSON.parse(body));
      } catch {}
    });
  }

  logger.info("Response received", {
    statusCode: proxyRes.statusCode,
    duration,
    correlationId: req.headers["x-correlation-id"],
  });

  setHealthy(true);
});

proxy.on("error", (err: Error, req: any, res: any) => {
  metrics.concurrent--;
  metrics.failures++;
  
  logger.error("Proxy error", { error: err.message });
  setHealthy(false);
});

function startServer() {
  const server = app.listen(config.port, () => {
    logger.info("Sidecar server started", { port: config.port, target: config.target });
  });

  setInterval(() => {
    const avgRtt = metrics.rtt.length > 0 
      ? metrics.rtt.reduce((a, b) => a + b, 0) / metrics.rtt.length 
      : 0;

    logger.debug("Metrics", {
      concurrent: metrics.concurrent,
      failures: metrics.failures,
      avgRtt: Math.round(avgRtt),
      cacheSize: cache.size,
      circuitState: config.circuitBreaker.enabled ? circuitBreaker.getState() : "disabled",
    });
  }, 10000);

  return server;
}

export { app, startServer, metrics };

if (require.main === module) {
  startServer();
}
