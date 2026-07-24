export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogPayload {
  level: LogLevel;
  timestamp: string;
  message: string;
  error?: unknown;
  meta?: Record<string, any>;
  correlationId?: string;
}

export interface LogTransport {
  log(payload: LogPayload): void | Promise<void>;
}
