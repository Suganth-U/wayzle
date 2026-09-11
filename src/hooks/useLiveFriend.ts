import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export const useLiveFriend = (sessionToken: string | null) => {
  const [friendLocation, setFriendLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (!sessionToken) return;

    const channel = supabase.channel(`tracking_${sessionToken}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_trips',
          filter: `session_token=eq.${sessionToken}`,
        },
        (payload) => {
          if (payload.new.current_location) {
             const match = /POINT\(([^ ]+) ([^ ]+)\)/.exec(payload.new.current_location);
             if (match) {
               setFriendLocation({ lat: parseFloat(match[2]), lng: parseFloat(match[1]) });
             }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionToken]);

  return { friendLocation };
};
