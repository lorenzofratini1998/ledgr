import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { logger } from "@/lib/logger";

export function useLogout() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const logout = async () => {
    try {
      setIsPending(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Clear local storage / session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Hard refresh to login page to guarantee pristine client state
      window.location.href = '/login';
    } catch (error) {
      logger.error(error, 'Logout failed');
      setIsPending(false);
    }
  };

  return { logout, isPending };
}
