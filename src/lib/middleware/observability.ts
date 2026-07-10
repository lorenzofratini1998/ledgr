import { NextRequest, NextResponse } from "next/server";

const X_CORRELATION_ID = 'x-correlation-id';
const X_MIDDLEWARE_REQUEST_X_CORRELATION_ID = 'x-middleware-request-x-correlation-id';

export function applyCorrelationId(request: NextRequest, response: NextResponse) {
  const correlationId = request.headers.get(X_CORRELATION_ID) || crypto.randomUUID();
  response.headers.set(X_CORRELATION_ID, correlationId);
  response.headers.set(X_MIDDLEWARE_REQUEST_X_CORRELATION_ID, correlationId);
}
