import { useState, useCallback } from 'react';
import { supabase } from '../api/supabase';

export interface AppReview {
  id: string;
  google_place_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export const useReviews = (googlePlaceId: string) => {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!googlePlaceId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('google_place_id', googlePlaceId)
        .order('created_at', { ascending: false });

      if (error) {
        // If the table doesn't exist yet, just ignore instead of breaking the app
        if (error.code === '42P01') {
          console.warn("Reviews table doesn't exist yet.");
          setReviews([]);
          return;
        }
        throw error;
      }
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [googlePlaceId]);

  const submitReview = async (rating: number, reviewText: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{ google_place_id: googlePlaceId, rating, review_text: reviewText }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setReviews([data, ...reviews]);
      }
      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      return false;
    }
  };

  return { reviews, loading, fetchReviews, submitReview };
};
