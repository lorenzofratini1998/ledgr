import { CategoryOption, CategoryWithChildren } from '@/types/models';

/**
 * Flattens a hierarchical category tree into a flat array suitable for Select dropdowns
 * preserving child hierarchy via metadata rather than mutating category names.
 */
export function flattenCategoriesForSelect(nestedCategories: CategoryWithChildren[]): CategoryOption[] {
  return (nestedCategories || []).reduce((acc, cat) => {
    acc.push({
      category_id: cat.category_id,
      category_name: cat.category_name,
      is_child: false,
      parent_id: cat.parent_id || null,
      icon: cat.icon || null,
      color: cat.color || null,
    });
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach((child) => {
        acc.push({
          category_id: child.category_id,
          category_name: child.category_name,
          is_child: true,
          parent_id: cat.category_id,
          icon: child.icon || null,
          color: child.color || null,
        });
      });
    }
    return acc;
  }, [] as CategoryOption[]);
}
