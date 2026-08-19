'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Tag, FolderTree } from 'lucide-react';

export function TaxonomyNavTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isCategories = pathname.startsWith('/categories');
  const isTags = pathname.startsWith('/tags');

  return (
    <div className="flex items-center p-1 bg-muted/60 rounded-xl w-full sm:w-fit border">
      <Link
        href="/categories"
        className={cn(
          "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
          isCategories
            ? "bg-background text-foreground shadow-2xs"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <FolderTree className="w-4 h-4" />
        <span>{t('categories.title')}</span>
      </Link>
      <Link
        href="/tags"
        className={cn(
          "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
          isTags
            ? "bg-background text-foreground shadow-2xs"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Tag className="w-4 h-4" />
        <span>Tags</span>
      </Link>
    </div>
  );
}
