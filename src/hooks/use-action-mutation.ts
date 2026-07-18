import { useState, useTransition } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

export interface ActionResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

interface UseActionMutationOptions<TData, TResult extends ActionResponse> {
  action: (data: TData) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (result: TResult) => void;
  successMessage?: string | ((result: TResult) => string);
  errorMessage?: string | ((result: TResult) => string);
  resetOnSuccess?: boolean;
}

export function useActionMutation<TData, TResult extends ActionResponse, TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  options: UseActionMutationOptions<TData, TResult>
) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutate = (data: TData) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await options.action(data);

        if (result.success) {
          const msg = typeof options.successMessage === 'function' ? options.successMessage(result) : (options.successMessage || result.message);
          if (msg) {
            toast.success(msg);
          }
          if (options.resetOnSuccess) {
            form.reset();
          }
          options.onSuccess?.(result);
        } else {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              form.setError(field as Path<TFieldValues>, {
                type: 'server',
                message: (messages as string[])[0],
              });
            });
          }
          const msg = typeof options.errorMessage === 'function' ? options.errorMessage(result) : (options.errorMessage || result.message || 'An error occurred');
          setServerError(msg);
          if (msg) {
            toast.error(msg);
          }
          options.onError?.(result);
        }
      } catch {
        const msg = typeof options.errorMessage === 'function' ? options.errorMessage({} as TResult) : (options.errorMessage || 'An unexpected error occurred. Please try again.');
        setServerError(msg);
        toast.error(msg);
      }
    });
  };

  return { mutate, isPending, serverError };
}
