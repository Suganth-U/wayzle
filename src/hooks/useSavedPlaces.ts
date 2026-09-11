import { useState, useCallback } from 'react';
import { supabase } from '../api/supabase';

export interface SavedPlace {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
  place?: any;
}

export const useSavedPlaces = () => {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('saved_places')
        .select('*, place:places(*)')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedPlaces(data || []);
    } catch (error) {
      console.error('Error fetching saved places:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const isSaved = useCallback((placeId: string) => {
    return savedPlaces.some((p) => p.place_id === placeId);
  }, [savedPlaces]);

  const toggleSave = async (placeId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const isCurrentlySaved = isSaved(placeId);

      if (isCurrentlySaved) {
        const { error } = await supabase
          .from('saved_places')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('place_id', placeId);
        
        if (error) throw error;
        setSavedPlaces((prev) => prev.filter((p) => p.place_id !== placeId));
      } else {
        const { data, error } = await supabase
          .from('saved_places')
          .insert({
            user_id: userData.user.id,
            place_id: placeId,
          })
          .select('*, place:places(*)')
          .single();
        
        if (error) throw error;
        if (data) {
          setSavedPlaces((prev) => [data, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error toggling saved place:', error);
    }
  };

  return {
    savedPlaces,
    loading,
    fetchSavedPlaces,
    toggleSave,
    isSaved,
  };
};
