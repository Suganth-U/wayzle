import { useState, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { Place } from '../store/useAppStore';

export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNearbyPlaces = useCallback(async (lat: number, lng: number, radiusMeters: number = 5000, category?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_places_nearby', {
        lat,
        lng,
        radius_meters: radiusMeters,
        filter_category: category || null
      });

      if (error) {
        console.error('Error fetching places:', error);
        return;
      }

      setPlaces(data || []);
    } catch (err) {
      console.error('Unexpected error fetching places:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { places, loading, fetchNearbyPlaces };
};
