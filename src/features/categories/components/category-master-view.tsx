"use client";

import { Card } from '@/components/ui/card';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CategoryColor, CategoryIcon } from '@/features/categories/constants';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { CategoryWithChildren } from '@/types/models';
import { ChevronRight, Tag } from 'lucide-react';

interface CategoryMasterViewProps {
  categories: CategoryWithChildren[];
  selectedCategoryId: string | null;
  onSelectCategory: (category: CategoryWithChildren) => void;
  isArchivedView: boolean;
}

export function CategoryMasterView({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isArchivedView,
}: CategoryMasterViewProps) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Tag className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
        <h3 className="text-lg font-semibold">
          {isArchivedView ? t('categories.noArchivedCategories') : t('categories.noCategoriesFound')}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          {isArchivedView ? t('categories.noArchivedDescription') : t('categories.noCategoriesDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="divide-y divide-border">
        {categories.map((parent) => {
          const isSelected = selectedCategoryId === parent.category_id;
          const IconComponent = CATEGORY_ICON_MAP[(parent.icon as CategoryIcon) || 'tag'] || Tag;
          const colorConfig = CATEGORY_COLOR_MAP[(parent.color as CategoryColor) || 'slate'] || CATEGORY_COLOR_MAP['slate'];
          const childCount = parent.children?.length || 0;

          return (
            <div
              key={parent.category_id}
              onClick={() => onSelectCategory(parent)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${colorConfig.bg} ${!parent.is_active ? 'opacity-50 grayscale' : ''}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className={`font-medium ${!parent.is_active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {parent.category_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {childCount} {childCount === 1 ? t('categories.subcategorySingular') : t('categories.subcategoryPlural')}
                  </span>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
