import { useState, useCallback } from 'react';
import { searchNearbyPlaces } from '../api/googlePlacesApi';

export interface GooglePlace {
  id: string;
  displayName: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  primaryType?: string;
  location?: { latitude: number; longitude: number };
  photos?: { name: string; widthPx: number; heightPx: number; authorAttributions?: any[] }[];
  currentOpeningHours?: { openNow: boolean };
  priceLevel?: string;
  websiteUri?: string;
  menuUri?: string;
}

export const useGooglePlaces = () => {
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async (
    lat: number, 
    lng: number, 
    radiusMeters: number = 3000, 
    types: string[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchNearbyPlaces(lat, lng, radiusMeters, types);
      const fetchedPlaces = data.places || [];
      setPlaces(fetchedPlaces);
      return fetchedPlaces;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { places, loading, error, fetchPlaces };
};
