'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCategoryAction, updateCategoryAction } from '@/features/categories/actions';
import { CreateCategoryPayload, CreateCategorySchema } from '@/features/categories/schemas';
import { useActionMutation } from '@/hooks/use-action-mutation';
import { CategoryWithChildren } from '@/types/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ColorPicker } from '@/components/shared/color-picker';
import { IconPicker } from '@/components/shared/icon-picker';
import { CATEGORY_COLOR_MAP, CATEGORY_COLORS, CATEGORY_ICON_MAP, CATEGORY_ICONS } from '@/features/categories/constants';
import { useDictionary } from '@/i18n/dictionary-provider';

const colorOptions = CATEGORY_COLORS.map(key => ({
  value: key,
  bgClass: CATEGORY_COLOR_MAP[key].bg,
}));

const iconOptions = CATEGORY_ICONS.map(key => ({
  value: key,
  icon: CATEGORY_ICON_MAP[key],
}));

interface CreateCategoryFormProps {
  parentCategories: CategoryWithChildren[];
  initialData?: CategoryWithChildren | null;
  initialParentId?: string;
  onSuccess?: () => void;
}

export function CreateCategoryForm({ parentCategories, initialData, initialParentId, onSuccess }: CreateCategoryFormProps) {
  const dictionary = useDictionary();

  const availableParentCategories = initialData
    ? parentCategories.filter(c => c.category_id !== initialData.category_id)
    : parentCategories;

  const form = useForm<z.input<typeof CreateCategorySchema>>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      category_name: initialData?.category_name || '',
      category_description: initialData?.category_description || '',
      parent_id: initialData?.parent_id || initialParentId || '',
      color: initialData?.color || 'slate',
      icon: initialData?.icon || 'tag',
    },
  });

  const { mutate, isPending: isSubmitting } = useActionMutation(form, {
    action: (data: CreateCategoryPayload) => {
      if (initialData) {
        return updateCategoryAction(initialData.category_id, data);
      }
      return createCategoryAction(data);
    },
    successMessage: (res) => initialData ? dictionary.categories.updatedSuccess : dictionary.categories.createdSuccess,
    errorMessage: (res) => res.message || (initialData ? dictionary.categories.failedUpdate : dictionary.categories.failedCreate),
    resetOnSuccess: !initialData,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  function onSubmit(data: z.input<typeof CreateCategorySchema>) {
    // Convert empty string back to null/undefined for parent_id
    if (data.parent_id === '') {
      data.parent_id = undefined;
    }
    mutate(data as CreateCategoryPayload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.name}</FormLabel>
              <FormControl>
                <Input placeholder={dictionary.categories.namePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.description} {dictionary.common.optional}</FormLabel>
              <FormControl>
                <Input placeholder={dictionary.categories.descriptionPlaceholder} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.categories.parentCategory} {dictionary.common.optional}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={dictionary.categories.selectParent}>
                      {field.value
                        ? availableParentCategories.find((c) => c.category_id === field.value)?.category_name || dictionary.categories.noneTopLevel
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">{dictionary.categories.noneTopLevel}</SelectItem>
                  {availableParentCategories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{dictionary.categories.parentHint}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.color}</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={colorOptions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.icon}</FormLabel>
              <FormControl>
                <IconPicker
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={iconOptions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (initialData ? dictionary.categories.updating : dictionary.categories.creating) : (initialData ? dictionary.common.saveChanges : dictionary.categories.createCategory)}
        </Button>
      </form>
    </Form>
  );
}
