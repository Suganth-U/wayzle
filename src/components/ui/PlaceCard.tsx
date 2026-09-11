import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Place } from '../../store/useAppStore';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row bg-surface rounded-2xl border border-slate-100 p-3 shadow-sm mb-4"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: place.image_url || 'https://via.placeholder.com/120' }}
        className="w-[120px] h-[120px] rounded-xl mr-4"
        resizeMode="cover"
      />
      <View className="flex-1 justify-between py-1">
        <View>
          <Text className="font-bold text-lg text-slate-900 mb-1" numberOfLines={1}>
            {place.name}
          </Text>
          <Text className="text-slate-500 text-sm mb-1">
            {place.category} • {((place.distance_meters || 0) / 1000).toFixed(1)}km
          </Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-amber-400 mr-1">★</Text>
            <Text className="text-slate-700 font-medium mr-1">{place.rating}</Text>
            <Text className="text-slate-400 text-xs">({place.reviews_count})</Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between mt-auto">
          <Text className={`text-sm font-medium ${place.is_open_now ? 'text-green-600' : 'text-red-500'}`}>
            {place.is_open_now ? 'Open Now' : 'Closed'}
          </Text>
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-primary font-bold">→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
