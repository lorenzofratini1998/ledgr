import { LogLevel, LogPayload, LogTransport } from "./types";
import { ConsoleTransport } from "./transports/console-transport";
import { SentryTransport } from "./transports/sentry-transport";

class Logger {
  private transports: LogTransport[] = [];

  constructor(transports: LogTransport[]) {
    this.transports = transports;
  }

  private async buildPayload(
    level: LogLevel,
    message: string,
    error?: unknown,
    meta?: Record<string, any>
  ): Promise<LogPayload> {
    
    const correlationId = meta?.correlationId;
    
    const cleanMeta = { ...meta };
    if (cleanMeta.correlationId) {
      delete cleanMeta.correlationId;
    }

    const payload: LogPayload = {
      level,
      timestamp: new Date().toISOString(),
      message,
    };

    if (error !== undefined) {
      payload.error = error;
    }
    if (correlationId) {
      payload.correlationId = correlationId;
    }
    if (Object.keys(cleanMeta).length > 0) {
      payload.meta = cleanMeta;
    }

    return payload;
  }

  private async dispatch(payload: LogPayload) {
    for (const transport of this.transports) {
      try {
        await transport.log(payload);
      } catch (e) {
        console.error("Logger transport failed:", e);
      }
    }
  }

  async info(message: string, meta?: Record<string, any>) {
    const payload = await this.buildPayload("info", message, undefined, meta);
    await this.dispatch(payload);
  }

  async warn(message: string, meta?: Record<string, any>) {
    const payload = await this.buildPayload("warn", message, undefined, meta);
    await this.dispatch(payload);
  }

  async debug(message: string, meta?: Record<string, any>) {
    const payload = await this.buildPayload("debug", message, undefined, meta);
    await this.dispatch(payload);
  }

  async error(error: unknown, message?: string, meta?: Record<string, any>) {
    const msg = message || (error instanceof Error ? error.message : "An error occurred");
    const errObj = error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error;
    
    const payload = await this.buildPayload("error", msg, errObj, meta);
    await this.dispatch(payload);
  }
}

// Initialize transports based on environment
const transports: LogTransport[] = [new ConsoleTransport()];

if (process.env.NODE_ENV === "production") {
  transports.push(new SentryTransport());
}

export const logger = new Logger(transports);
