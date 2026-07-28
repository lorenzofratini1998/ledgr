import { ReactNode, ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  isPending?: boolean;
  loadingText?: ReactNode;
  children: ReactNode;
}

export function SubmitButton({
  isPending = false,
  loadingText,
  children,
  className,
  disabled,
  type = 'submit',
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled || isPending}
      className={cn("w-full", className)}
      {...props}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPending && loadingText ? loadingText : children}
    </Button>
  );
}
