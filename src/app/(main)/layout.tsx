import { ReactNode } from 'react';
import { Shell } from '@/components/layout/shell';
import { UpcomingList } from '@/components/layout/upcoming-list';
import { createClient, getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/login');
  }

  const userProfile = {
    id: user.id,
    display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
    avatar_url: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`,
    email: user.email || '',
  };

  // Extract mock components to act as "Server Components" representing data fetching logic
  const calendarSlot = (
    <div className="bg-muted rounded-xl aspect-square flex items-center justify-center border border-border/50">
      <p className="text-muted-foreground text-sm">Calendar Widget</p>
    </div>
  );

  return (
    <Shell 
      user={userProfile} 
      calendarSlot={calendarSlot} 
      upcomingSlot={<UpcomingList />}
    >
      {children}
    </Shell>
  );
}
