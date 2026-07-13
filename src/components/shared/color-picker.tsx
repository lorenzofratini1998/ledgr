'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: { value: string; bgClass: string }[];
  className?: string;
}

export function ColorPicker({ value, onValueChange, options, className }: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {options.map((opt) => {
        const isSelected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "flex-shrink-0 relative flex items-center justify-center w-8 h-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              opt.bgClass,
              isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md" : "hover:scale-110 opacity-90 hover:opacity-100"
            )}
            aria-label={`Select ${opt.value} color`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}
