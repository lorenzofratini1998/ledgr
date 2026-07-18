'use client';

import { BOTTOM_NAV_ITEMS } from '@/config/navigation';
import { useDictionary } from '@/i18n/dictionary-provider';
import Link from 'next/link';

interface BottomNavProps {}

export function BottomNav({}: BottomNavProps) {
  const dictionary = useDictionary();

  return (
    <nav className="md:hidden w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe shrink-0">
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{dictionary.navigation[item.dictionaryKey as keyof typeof dictionary.navigation] || item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
