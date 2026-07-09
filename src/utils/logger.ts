import { headers } from "next/headers";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  timestamp: string;
  message: string;
  correlationId?: string;
  [key: string]: any;
}

/**
 * Extracts the correlation ID from Next.js headers in a Server context.
 * Gracefully degrades if called outside of a Server Component/Action/Handler.
 */
async function getCorrelationId(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    return headersList.get("x-correlation-id") || undefined;
  } catch (error) {
    return undefined;
  }
}

class Logger {
  private async buildPayload(level: LogLevel, message: string, meta?: Record<string, any>): Promise<LogPayload> {
    const correlationId = await getCorrelationId();
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...(correlationId && { correlationId }),
      ...meta,
    };
  }

  async info(message: string, meta?: Record<string, any>) {
    const payload = await this.buildPayload("info", message, meta);

    // TODO: Forward to Axiom here (e.g., axiom.ingestEvents('ledger', [payload]))
    console.log(JSON.stringify(payload));
  }

  async warn(message: string, meta?: Record<string, any>) {
    const payload = await this.buildPayload("warn", message, meta);

    // TODO: Forward to Axiom here
    console.warn(JSON.stringify(payload));
  }

  async debug(message: string, meta?: Record<string, any>) {
    const payload = await this.buildPayload("debug", message, meta);

    // TODO: Forward to Axiom here
    console.debug(JSON.stringify(payload));
  }

  async error(error: Error | unknown, message?: string, meta?: Record<string, any>) {
    const correlationId = await getCorrelationId();

    const errorPayload = {
      level: "error" as LogLevel,
      timestamp: new Date().toISOString(),
      message: message || "An error occurred",
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...(correlationId && { correlationId }),
      ...meta,
    };

    // TODO: Forward to Axiom here
    console.error(JSON.stringify(errorPayload));

    // TODO: Inject Sentry here
    // Example implementation:
    // Sentry.withScope((scope) => {
    //   if (correlationId) scope.setTag("correlationId", correlationId);
    //   if (meta) scope.setExtras(meta);
    //   Sentry.captureException(error);
    // });
  }
}

export const logger = new Logger();
