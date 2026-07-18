"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { CategoryActions } from '@/features/categories/components/category-actions';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CategoryColor, CategoryIcon } from '@/features/categories/constants';
import { useDictionary } from '@/i18n/dictionary-provider';
import { CategoryWithChildren } from '@/types/models';
import { Tag } from 'lucide-react';

interface CategoryListProps {
  categories: CategoryWithChildren[];
  isArchivedView: boolean;
  onEdit: (category: CategoryWithChildren) => void;
  onArchive: (category: CategoryWithChildren) => void;
  onDelete: (category: CategoryWithChildren) => void;
  onUnarchive: (id: string) => void;
}

export function CategoryList({
  categories,
  isArchivedView,
  onEdit,
  onArchive,
  onDelete,
  onUnarchive,
}: CategoryListProps) {
  const dictionary = useDictionary();

  if (categories.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 px-4 text-center mt-4">
        <Tag className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{isArchivedView ? dictionary.categories.noArchivedCategories : dictionary.categories.noCategoriesFound}</h3>
        <p className="text-sm text-muted-foreground">{isArchivedView ? dictionary.categories.noArchivedDescription : dictionary.categories.noCategoriesDescription}</p>
      </Card>
    );
  }

  return (
    <Accordion className="w-full space-y-4 mt-4">
      {categories.map((parent) => (
        <AccordionItem key={parent.category_id} value={parent.category_id} className="border-none">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
              <AccordionTrigger className="hover:no-underline flex-1 py-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${CATEGORY_COLOR_MAP[(parent.color as CategoryColor) || 'slate']?.bg || 'bg-slate-500'
                      } ${!parent.is_active ? 'opacity-50' : ''}`}
                  >
                    {(() => {
                      const IconComponent = CATEGORY_ICON_MAP[(parent.icon as CategoryIcon) || 'tag'] || Tag;
                      return <IconComponent className="h-5 w-5" />;
                    })()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`font-medium ${!parent.is_active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{parent.category_name}</span>
                    {parent.category_description && (
                      <span className="text-xs text-muted-foreground">{parent.category_description}</span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 px-2">
                <CategoryActions
                  isActive={parent.is_active}
                  onEdit={() => onEdit(parent)}
                  onArchive={() => onArchive(parent)}
                  onDelete={() => onDelete(parent)}
                  onUnarchive={() => onUnarchive(parent.category_id)}
                />
              </div>
            </div>
            {parent.children && parent.children.length > 0 && (
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="ml-12 mt-2 space-y-2 border-l-2 border-muted pl-4">
                  {parent.children.map((child) => (
                    <div key={child.category_id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50 group">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${CATEGORY_COLOR_MAP[(child.color as CategoryColor) || (parent.color as CategoryColor) || 'slate']?.bg || 'bg-slate-500'
                            } ${!child.is_active ? 'opacity-50' : ''}`}
                        />
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${!child.is_active ? 'text-muted-foreground line-through' : ''}`}>{child.category_name}</span>
                          {child.category_description && (
                            <span className="text-xs text-muted-foreground">{child.category_description}</span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <CategoryActions
                          isActive={child.is_active}
                          onEdit={() => onEdit(child)}
                          onArchive={() => onArchive(child)}
                          onDelete={() => onDelete(child)}
                          onUnarchive={() => onUnarchive(child.category_id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            )}
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
