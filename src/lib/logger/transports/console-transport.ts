import { LogPayload, LogTransport } from "../types";

export class ConsoleTransport implements LogTransport {
  log(payload: LogPayload): void {
    const isDevelopment = process.env.NODE_ENV === "development";
    
    // Log as JSON in production for Datadog/Axiom ingestion
    if (!isDevelopment) {
      console.log(JSON.stringify(payload));
      return;
    }

    const { level, timestamp, message, error, meta, correlationId } = payload;
    
    const prefixes = {
      info: "🔵 [INFO]",
      warn: "🟠 [WARN]",
      error: "🔴 [ERROR]",
      debug: "⚪ [DEBUG]",
    };

    const formattedMessage = `${prefixes[level]} ${timestamp} - ${message}`;
    
    const extraArgs: any[] = [];
    if (correlationId) extraArgs.push(`[CorrID: ${correlationId}]`);
    if (meta && Object.keys(meta).length > 0) extraArgs.push(meta);
    
    switch (level) {
      case "error":
        console.error(formattedMessage, error || "", ...extraArgs);
        break;
      case "warn":
        console.warn(formattedMessage, ...extraArgs);
        break;
      case "debug":
        console.debug(formattedMessage, ...extraArgs);
        break;
      default:
        console.log(formattedMessage, ...extraArgs);
    }
  }
}
