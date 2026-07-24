import { LogPayload, LogTransport } from "../types";

// NOTE: @sentry/nextjs is not installed yet.
// This transport uses dynamic imports or global objects to avoid crashes,
// pending Sentry configuration via the official wizard.

export class SentryTransport implements LogTransport {
  log(payload: LogPayload): void {
    const { level, error, meta, correlationId } = payload;
    
    // We primarily care about errors in Sentry
    if (level === "error") {
      try {
        // Fallback for client side if Sentry is global
        const Sentry = typeof window !== "undefined" ? (window as any).Sentry : null;
        
        if (Sentry) {
          Sentry.withScope((scope: any) => {
            if (correlationId) scope.setTag("correlationId", correlationId);
            if (meta) scope.setExtras(meta);
            Sentry.captureException(error || new Error(payload.message));
          });
        }
        // In a proper Next.js Sentry setup, we could use dynamic imports here
        // or rely on the SDK to intercept global errors
      } catch {
        // Silent fallback
      }
    }
  }
}
