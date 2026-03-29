import { v4 as uuidv4 } from "uuid";

export interface LogContext {
  correlationId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  correlationId: string;
  context?: LogContext;
}

function generateCorrelationId(): string {
  return uuidv4();
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export function createLogger(context: LogContext = {}) {
  return {
    info(message: string, ctx: LogContext = {}) {
      console.log(formatLog({
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        correlationId: context.correlationId || generateCorrelationId(),
        context: { ...context, ...ctx },
      }));
    },

    warn(message: string, ctx: LogContext = {}) {
      console.warn(formatLog({
        timestamp: new Date().toISOString(),
        level: "warn",
        message,
        correlationId: context.correlationId || generateCorrelationId(),
        context: { ...context, ...ctx },
      }));
    },

    error(message: string, ctx: LogContext = {}) {
      console.error(formatLog({
        timestamp: new Date().toISOString(),
        level: "error",
        message,
        correlationId: context.correlationId || generateCorrelationId(),
        context: { ...context, ...ctx },
      }));
    },

    debug(message: string, ctx: LogContext = {}) {
      console.debug(formatLog({
        timestamp: new Date().toISOString(),
        level: "debug",
        message,
        correlationId: context.correlationId || generateCorrelationId(),
        context: { ...context, ...ctx },
      }));
    },
  };
}

export const logger = createLogger();
