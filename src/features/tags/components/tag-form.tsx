"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { createTagAction, updateTagAction } from "../actions";
import { CreateTagPayload, createTagSchema } from "../schemas";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from '@/components/shared/color-picker';
import { IconPicker } from '@/components/shared/icon-picker';
import { TAG_COLOR_MAP, TAG_COLORS, TAG_ICON_MAP, TAG_ICONS } from "../constants";

const colorOptions = TAG_COLORS.map(key => ({
  value: key,
  bgClass: TAG_COLOR_MAP[key].bg,
}));

const iconOptions = TAG_ICONS.map(key => ({
  value: key,
  icon: TAG_ICON_MAP[key],
}));

interface TagFormProps {
  initialData?: {
    tag_id: string;
    tag_name: string;
    tag_description?: string | null;
    color?: string | null;
    icon?: string | null;
  };
  onSuccess?: () => void;
}

export function TagForm({ initialData, onSuccess }: TagFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateTagPayload>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      tag_name: initialData?.tag_name || "",
      tag_description: initialData?.tag_description || "",
      color: initialData?.color || "slate",
      icon: initialData?.icon || "tag",
    },
  });

  const onSubmit = (data: CreateTagPayload) => {
    startTransition(async () => {
      let res;
      if (initialData?.tag_id) {
        res = await updateTagAction(initialData.tag_id, data);
      } else {
        res = await createTagAction(data);
      }

      if (res.success) {
        toast.success(res.message);
        if (!initialData) {
          form.reset();
        }
        onSuccess?.();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tag_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Vacation 2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Optional details about this tag..." 
                  className="resize-none"
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value || ''}
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
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <IconPicker
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  options={iconOptions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {initialData ? 'Update Tag' : 'Create Tag'}
        </Button>
      </form>
    </Form>
  );
}
