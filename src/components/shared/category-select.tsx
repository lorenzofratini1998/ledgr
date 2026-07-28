import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryOption {
  category_id: string;
  category_name: string;
}

interface CategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  categories: CategoryOption[];
  placeholder?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  categories,
  placeholder = "Select a category",
  disabled = false,
  allowEmpty = false,
  emptyLabel = "None / Uncategorized",
}: CategorySelectProps) {
  return (
    <Select value={value || ""} onValueChange={(val) => onValueChange(val || "")} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && (
          <SelectItem value="">{emptyLabel}</SelectItem>
        )}
        {categories.map((cat) => (
          <SelectItem key={cat.category_id} value={cat.category_id}>
            {cat.category_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
