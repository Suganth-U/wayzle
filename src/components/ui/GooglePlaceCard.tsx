import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { GooglePlace } from '../../hooks/useGooglePlaces';
import { getPlacePhotoUrl } from '../../api/googlePlacesApi';

interface GooglePlaceCardProps {
  place: GooglePlace;
  onPress: () => void;
  fullWidth?: boolean;
}

export const GooglePlaceCard: React.FC<GooglePlaceCardProps> = ({ place, onPress, fullWidth = false }) => {
  const photoUrl = place.photos && place.photos.length > 0
    ? getPlacePhotoUrl(place.photos[0].name, 400)
    : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'; // Fallback

  return (
    <TouchableOpacity
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${fullWidth ? 'w-full' : 'w-64'}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: photoUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' }}
        className="w-full h-32"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="font-bold text-base text-slate-900 mb-1" numberOfLines={1}>
          {place.displayName.text}
        </Text>
        
        <Text className="text-slate-500 text-xs mb-1.5 capitalize" numberOfLines={1}>
          {place.primaryType?.replace(/_/g, ' ') || 'Place'}
        </Text>
        
        <View className="flex-row items-center mb-2">
          <Text className="text-amber-400 mr-1 text-sm">★</Text>
          <Text className="text-slate-700 font-medium mr-1 text-sm">{place.rating || 'New'}</Text>
          {place.userRatingCount ? (
            <Text className="text-slate-400 text-xs">({place.userRatingCount})</Text>
          ) : null}
        </View>
        
        <View className="flex-row items-center justify-between mt-auto">
          <Text className={`text-xs font-semibold ${place.currentOpeningHours?.openNow ? 'text-green-600' : 'text-slate-400'}`}>
            {place.currentOpeningHours?.openNow ? 'Open Now' : 'Closed'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
