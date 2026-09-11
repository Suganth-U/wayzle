import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export interface Place {
  id: number;
  osm_id: string;
  name: string;
  name_si: string | null;
  name_ta: string | null;
  type: string;
  lat: number;
  lng: number;
  district: string | null;
}

export const usePlacesSearch = (searchTerm: string) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const searchPlaces = async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        if (isMounted) setPlaces([]);
        return;
      }

      setLoading(true);
      
      const { data, error } = await supabase
        .from('sl_places')
        .select('*')
        .ilike('name', `%${searchTerm.trim()}%`)
        .order('type', { ascending: true }) // Prioritize cities over villages usually, though type is alphabetical (city, town, village)
        .limit(15);

      if (error) {
        console.error('Error fetching places:', error);
      } else if (isMounted) {
        setPlaces(data || []);
      }
      
      if (isMounted) setLoading(false);
    };

    // 300ms debounce to prevent spamming the database on every keystroke
    const delayDebounceFn = setTimeout(() => {
      searchPlaces();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchTerm]);

  return { places, loading };
};
