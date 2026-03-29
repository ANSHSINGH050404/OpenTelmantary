export interface Config {
  port: number;
  target: string;
  tls: TLSConfig;
  cache: CacheConfig;
  circuitBreaker: CircuitBreakerConfig;
  rateLimit: RateLimitConfig;
}

export interface TLSConfig {
  enabled: boolean;
  keyPath: string | undefined;
  certPath: string | undefined;
}

export interface CacheConfig {
  enabled: boolean;
  max: number;
  ttl: number;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  resetTimeout: number;
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  return value ? value === "true" : defaultValue;
}

export const config: Config = {
  port: getEnvNumber("PORT", 3000),
  target: process.env.TARGET || "http://localhost:5000",
  tls: {
    enabled: getEnvBool("TLS_ENABLED", false),
    keyPath: process.env.TLS_KEY_PATH,
    certPath: process.env.TLS_CERT_PATH,
  },
  cache: {
    enabled: getEnvBool("CACHE_ENABLED", true),
    max: getEnvNumber("CACHE_MAX", 1000),
    ttl: getEnvNumber("CACHE_TTL", 60000),
  },
  circuitBreaker: {
    enabled: getEnvBool("CIRCUIT_BREAKER_ENABLED", true),
    failureThreshold: getEnvNumber("CB_FAILURE_THRESHOLD", 5),
    successThreshold: getEnvNumber("CB_SUCCESS_THRESHOLD", 2),
    resetTimeout: getEnvNumber("CB_RESET_TIMEOUT", 30000),
  },
  rateLimit: {
    enabled: getEnvBool("RATE_LIMIT_ENABLED", true),
    windowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 60000),
    max: getEnvNumber("RATE_LIMIT_MAX", 100),
  },
};
