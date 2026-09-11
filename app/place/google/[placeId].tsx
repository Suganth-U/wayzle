import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlaceDetails } from '../../../src/api/googlePlacesApi';
import { PhotoGallery } from '../../../src/components/ui/PhotoGallery';
import { StarRating } from '../../../src/components/ui/StarRating';
import { ReviewCard, ReviewProps } from '../../../src/components/ui/ReviewCard';
import { AnimatedActionBtn } from '../../../src/components/ui/AnimatedActionBtn';
import { useAppStore } from '../../../src/store/useAppStore';
import { useReviews } from '../../../src/hooks/useReviews';
import { AddReviewModal } from '../../../src/components/ui/AddReviewModal';
import { LocationSearchModal } from '../../../src/components/ui/LocationSearchModal';
import { getDistanceKm } from '../../../src/utils/distance';

export default function GooglePlaceDetailScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setDestination, searchLocation, searchLocationName, currentLocation } = useAppStore();
  
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const { reviews: appReviews, loading: reviewsLoading, fetchReviews, submitReview } = useReviews(placeId as string);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const data = await getPlaceDetails(placeId as string);
        setPlace(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (placeId) fetchPlace();
  }, [placeId]);

  const handleStartTrip = () => {
    if (place) {
      setDestination({
        id: place.id,
        name: place.displayName?.text || 'Destination',
        category: place.primaryType?.replace(/_/g, ' ') || 'Place',
        rating: place.rating || 0,
        reviews_count: place.userRatingCount || 0,
        lat_out: place.location?.latitude || 0,
        lng_out: place.location?.longitude || 0,
      });
      router.push('/route-planner');
    }
  };

  const startLat = searchLocation ? searchLocation.lat : currentLocation?.coords.latitude;
  const startLng = searchLocation ? searchLocation.lng : currentLocation?.coords.longitude;
  
  let distanceText = '';
  if (place && startLat && startLng) {
    distanceText = getDistanceKm(startLat, startLng, place.location?.latitude || 0, place.location?.longitude || 0);
  }

  const renderPriceLevel = (level: string) => {
    if (level === 'PRICE_LEVEL_INEXPENSIVE') return '💲 Inexpensive';
    if (level === 'PRICE_LEVEL_MODERATE') return '💲💲 Moderate';
    if (level === 'PRICE_LEVEL_EXPENSIVE') return '💲💲💲 Expensive';
    if (level === 'PRICE_LEVEL_VERY_EXPENSIVE') return '💲💲💲💲 Very Expensive';
    return '';
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-slate-500 font-medium">Loading details...</Text>
      </View>
    );
  }

  if (!place) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-500">Failed to load place details.</Text>
        <Pressable onPress={handleGoBack} className="mt-4 p-2">
          <Text className="text-primary font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View className="relative">
          <PhotoGallery photos={place.photos || []} />
          
          <Pressable
            onPress={handleGoBack}
            className="absolute top-14 left-5 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-lg">←</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-5 -mt-6 relative">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-900 text-2xl font-bold flex-1 mr-3" numberOfLines={2}>
                {place.displayName?.text}
              </Text>
              <View className="bg-slate-100 px-3 py-1.5 rounded-full">
                <Text className="text-slate-700 text-sm font-bold">★ {place.rating || 'New'}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2 flex-wrap">
              <Text className={`font-semibold text-sm mr-2 ${place.currentOpeningHours?.openNow ? 'text-green-500' : 'text-rose-500'}`}>
                ● {place.currentOpeningHours?.openNow ? 'Open Now' : 'Closed'}
              </Text>
              <Text className="text-slate-400 mr-2">·</Text>
              <Text className="text-slate-500 text-sm capitalize mr-2">{place.primaryType?.replace(/_/g, ' ')}</Text>
              
              {place.priceLevel && (
                <>
                  <Text className="text-slate-400 mr-2">·</Text>
                  <Text className="text-slate-700 text-sm font-medium">{renderPriceLevel(place.priceLevel)}</Text>
                </>
              )}
            </View>
            
            {/* Distance Section */}
            {distanceText ? (
              <View className="flex-row items-center mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Text className="text-slate-600 text-sm flex-1">
                  📍 {distanceText} away from {searchLocationName || 'Current Location'}
                </Text>
                <Pressable onPress={() => setSearchModalVisible(true)} className="bg-white px-3 py-1.5 rounded border border-slate-200">
                  <Text className="text-primary text-xs font-bold">Change</Text>
                </Pressable>
              </View>
            ) : null}
            
            <Text className="text-slate-600 text-sm mb-2">{place.formattedAddress}</Text>
            {place.internationalPhoneNumber && (
              <Text className="text-slate-600 text-sm mb-2">📞 {place.internationalPhoneNumber}</Text>
            )}
            {place.websiteUri && (
              <Text className="text-primary text-sm font-medium mb-4">🌐 Website</Text>
            )}
            
            <Pressable 
              onPress={handleStartTrip}
              className="bg-primary py-3 rounded-xl items-center mt-2"
            >
              <Text className="text-white font-bold text-base">Get Directions</Text>
            </Pressable>
          </View>

          {/* Editorial Summary */}
          {place.editorialSummary?.text && (
            <View className="mb-6">
              <Text className="text-slate-900 text-lg font-bold mb-3">About</Text>
              <Text className="text-slate-600 text-base leading-7">
                {place.editorialSummary.text}
              </Text>
            </View>
          )}

          {/* Google Reviews */}
          <View className="mb-6">
            <Text className="text-slate-900 text-lg font-bold mb-4">Google Reviews ({place.userRatingCount || 0})</Text>
            {place.reviews && place.reviews.length > 0 ? (
              place.reviews.slice(0, 3).map((r: any, i: number) => (
                <ReviewCard 
                  key={`google-${i}`} 
                  review={{
                    id: r.name || i.toString(),
                    authorName: r.authorAttribution?.displayName || 'Google User',
                    authorPhotoUrl: r.authorAttribution?.photoUri,
                    rating: r.rating,
                    text: r.text?.text || '',
                    relativeTimeDescription: r.relativePublishTimeDescription || 'Recently'
                  }} 
                />
              ))
            ) : (
              <Text className="text-slate-500 italic">No reviews yet.</Text>
            )}
          </View>

          {/* Wayzle Community Reviews */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 text-lg font-bold">Community Reviews</Text>
              <Pressable onPress={() => setReviewModalVisible(true)}>
                <Text className="text-primary font-bold">Write a Review</Text>
              </Pressable>
            </View>
            
            {reviewsLoading ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : appReviews.length > 0 ? (
              appReviews.map((r) => (
                <ReviewCard 
                  key={`app-${r.id}`} 
                  review={{
                    id: r.id,
                    authorName: 'Anonymous User',
                    rating: r.rating,
                    text: r.review_text,
                    relativeTimeDescription: new Date(r.created_at).toLocaleDateString(),
                    isAnonymous: true
                  }} 
                />
              ))
            ) : (
              <Text className="text-slate-500 italic">Be the first from the Wayzle community to review this place!</Text>
            )}
          </View>

          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Modals */}
      <AddReviewModal 
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        placeName={place.displayName?.text || 'this place'}
        onSubmit={submitReview}
      />

      <LocationSearchModal 
        visible={searchModalVisible} 
        onClose={() => setSearchModalVisible(false)} 
      />

    </View>
  );
}
