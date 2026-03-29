import { Router, Request, Response } from "express";

const router = Router();

let isHealthy = true;
let lastHealthCheck = Date.now();

router.get("/health", (req: Request, res: Response) => {
  lastHealthCheck = Date.now();
  
  const health = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      server: isHealthy,
      lastCheck: lastHealthCheck,
    },
  };

  res.status(isHealthy ? 200 : 503).json(health);
});

router.get("/health/ready", (req: Request, res: Response) => {
  res.status(200).json({ ready: true });
});

router.get("/health/live", (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export function setHealthy(status: boolean) {
  isHealthy = status;
}

export default router;
