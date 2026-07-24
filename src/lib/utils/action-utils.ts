import { ZodError, z } from "zod";
import { getUser } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { User } from '@supabase/supabase-js';

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

/**
 * Safely executes a server action, handling authentication and error catching.
 */
export async function executeAction<T>(
  handler: (user: User) => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    return await handler(user);
  } catch (error) {
    console.error('Action error:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    };
  }
}

/**
 * Safely executes a server action with Zod payload validation.
 */
export async function executeValidatedAction<T, S extends z.ZodTypeAny>(
  schema: S,
  payload: unknown,
  handler: (user: User, data: z.infer<S>) => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  return executeAction(async (user) => {
    const result = schema.safeParse(payload);
    
    if (!result.success) {
      return {
        success: false,
        message: 'Invalid data',
        errors: formatZodErrors(result.error)
      };
    }
    
    return await handler(user, result.data);
  });
}

/**
 * Safely executes a public server action (no authentication required).
 */
export async function executePublicAction<T>(
  handler: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    return await handler();
  } catch (error) {
    console.error('Action error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Safely executes a public server action with Zod payload validation.
 */
export async function executePublicValidatedAction<T, S extends z.ZodTypeAny>(
  schema: S,
  payload: unknown,
  handler: (data: z.infer<S>) => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  return executePublicAction(async () => {
    const result = schema.safeParse(payload);
    
    if (!result.success) {
      return {
        success: false,
        message: 'Invalid data',
        errors: formatZodErrors(result.error)
      };
    }
    
    return await handler(result.data);
  });
}
