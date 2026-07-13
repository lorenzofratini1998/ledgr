'use client';

import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: { value: string; icon: React.ElementType }[];
  className?: string;
}

export function IconPicker({ value, onValueChange, options, className }: IconPickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((opt) => {
        const IconComponent = opt.icon;
        const isSelected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              isSelected 
                ? "border-primary bg-primary text-primary-foreground shadow-sm" 
                : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label={`Select ${opt.value} icon`}
            aria-pressed={isSelected}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
