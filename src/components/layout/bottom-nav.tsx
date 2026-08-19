'use client';

import { BOTTOM_NAV_ITEMS } from '@/config/navigation';
import { useDictionary } from '@/i18n/dictionary-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const dictionary = useDictionary();
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full border-t border-border/80 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/85 pb-safe z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 px-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium tracking-tight">
                {dictionary.navigation[item.dictionaryKey as keyof typeof dictionary.navigation] || item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


