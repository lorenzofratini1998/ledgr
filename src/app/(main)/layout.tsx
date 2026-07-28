import { Shell } from '@/components/layout/shell';
import { UpcomingList } from '@/components/layout/upcoming-list';
import { CalendarWidget } from '@/components/layout/calendar-widget';
import { ScheduleProvider } from '@/components/layout/schedule-context';
import { getUser } from '@/lib/supabase/server';
import { getRecurringPayments } from '@/features/recurring/queries';
import { getUserPreferences } from '@/features/preferences/queries';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

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

  // Fetch upcoming recurring payments and user preferences
  const [recurringResponse, preferences] = await Promise.all([
    getRecurringPayments(user.id, { status: 'active', pageSize: 50 }),
    getUserPreferences(user.id)
  ]);

  const activePayments = recurringResponse.data || [];
  
  // Sort payments by nearest next_execution_date
  const sortedPayments = [...activePayments].sort((a, b) => 
    new Date(a.next_execution_date).getTime() - new Date(b.next_execution_date).getTime()
  );

  // We only show the next 5 upcoming payments in the list
  const upcomingPaymentsList = sortedPayments.slice(0, 5);

  const dateFormat = preferences?.date_format || 'DD/MM/YYYY';

  const calendarSlot = (
    <CalendarWidget payments={sortedPayments} />
  );

  return (
    <ScheduleProvider>
      <Shell 
        user={userProfile} 
        calendarSlot={calendarSlot} 
        upcomingSlot={<UpcomingList payments={sortedPayments} dateFormatPreference={dateFormat} />}
      >
        {children}
      </Shell>
    </ScheduleProvider>
  );
}
