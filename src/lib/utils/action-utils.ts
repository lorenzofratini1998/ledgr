import { ZodError } from "zod";

/**
 * Formats a ZodError into a flat map of field paths to error messages.
 * This perfectly aligns with the `ActionResponse.errors` contract.
 *
 * @example
 * formatZodErrors(zodError) // => { "amount": ["Must be greater than 0"], "user.name": ["Required"] }
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return errors;
}
