import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryOption } from '@/types/models';
import { cn } from '@/lib/utils';
import { CornerDownRight } from 'lucide-react';

interface CategorySelectProps {
  value?: string | null;
  onValueChange: (value: string) => void;
  categories: CategoryOption[];
  placeholder?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  categories,
  placeholder = "Select a category",
  disabled = false,
  allowEmpty = false,
  emptyLabel = "None / Uncategorized",
  className,
}: CategorySelectProps) {
  const selectedCategory = categories.find((c) => c.category_id === value);

  return (
    <Select value={value || ""} onValueChange={(val) => onValueChange(val || "")} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedCategory ? (
            <span className="truncate block text-left">
              {selectedCategory.category_name}
            </span>
          ) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && (
          <SelectItem value="">{emptyLabel}</SelectItem>
        )}
        {categories.map((cat) => (
          <SelectItem
            key={cat.category_id}
            value={cat.category_id}
            className={cn(
              cat.is_child && "pl-3 text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              {cat.is_child && (
                <CornerDownRight className="size-3 shrink-0 text-muted-foreground/60" />
              )}
              <span className={cn(cat.is_child ? "text-sm" : "font-medium text-foreground")}>
                {cat.category_name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
