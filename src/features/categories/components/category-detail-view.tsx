"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryActions } from '@/features/categories/components/category-actions';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CategoryColor, CategoryIcon } from '@/features/categories/constants';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { CategoryWithChildren } from '@/types/models';
import { ArrowLeft, Plus, Tag } from 'lucide-react';

interface CategoryDetailViewProps {
  category: CategoryWithChildren | null;
  onBack: () => void;
  onEdit: (category: CategoryWithChildren) => void;
  onArchive: (category: CategoryWithChildren) => void;
  onDelete: (category: CategoryWithChildren) => void;
  onUnarchive: (id: string) => void;
  onAddSubcategory: (parentCategory: CategoryWithChildren) => void;
}

export function CategoryDetailView({
  category,
  onBack,
  onEdit,
  onArchive,
  onDelete,
  onUnarchive,
  onAddSubcategory,
}: CategoryDetailViewProps) {
  const { t } = useTranslation();

  if (!category) {
    return (
      <div className="hidden md:flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center px-4">
        <Tag className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">{t('categories.selectParent')}</h3>
        <p className="text-sm text-muted-foreground/70 max-w-sm mt-1">
          {t('categories.parentHint')}
        </p>
      </div>
    );
  }

  const ParentIcon = CATEGORY_ICON_MAP[(category.icon as CategoryIcon) || 'tag'] || Tag;
  const parentColorConfig = CATEGORY_COLOR_MAP[(category.color as CategoryColor) || 'slate'] || CATEGORY_COLOR_MAP['slate'];

  return (
    <div className="flex flex-col space-y-6">
      {/* Mobile Back Button & Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${parentColorConfig.bg} ${
              !category.is_active ? 'opacity-50 grayscale' : ''
            }`}
          >
            <ParentIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className={`text-lg font-semibold truncate ${!category.is_active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {category.category_name}
            </h2>
            {category.category_description && (
              <p className="text-sm text-muted-foreground truncate">{category.category_description}</p>
            )}
          </div>
        </div>
        <div className="shrink-0 ml-2">
          <CategoryActions
            isActive={category.is_active}
            onEdit={() => onEdit(category)}
            onArchive={() => onArchive(category)}
            onDelete={() => onDelete(category)}
            onUnarchive={() => onUnarchive(category.category_id)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 mb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('categories.subcategoriesOf')} {category.category_name}
        </h3>
      </div>

      {/* Subcategories List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {category.children && category.children.length > 0 ? (
            category.children.map((child) => {
              const ChildIcon = CATEGORY_ICON_MAP[(child.icon as CategoryIcon) || 'tag'] || Tag;
              const childColorConfig = CATEGORY_COLOR_MAP[(child.color as CategoryColor) || (category.color as CategoryColor) || 'slate'] || CATEGORY_COLOR_MAP['slate'];

              return (
                <div
                  key={child.category_id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-white ${childColorConfig.bg} ${
                        !child.is_active ? 'opacity-50 grayscale' : ''
                      }`}
                    >
                      <ChildIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${!child.is_active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {child.category_name}
                      </span>
                      {child.category_description && (
                        <span className="text-xs text-muted-foreground">{child.category_description}</span>
                      )}
                    </div>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <CategoryActions
                      isActive={child.is_active}
                      onEdit={() => onEdit(child)}
                      onArchive={() => onArchive(child)}
                      onDelete={() => onDelete(child)}
                      onUnarchive={() => onUnarchive(child.category_id)}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 px-4 text-center">
              <p className="text-sm text-muted-foreground">{t('categories.noSubcategories')}</p>
            </div>
          )}
          
          {/* Quick Add Subcategory Row */}
          {category.is_active && (
            <div
              onClick={() => onAddSubcategory(category)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-primary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{t('categories.addSubcategory')}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
