import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { GooglePlaceCard } from './GooglePlaceCard';
import { GooglePlace } from '../../hooks/useGooglePlaces';

interface CategorySectionProps {
  title: string;
  places: GooglePlace[];
  onPlacePress: (place: GooglePlace) => void;
  onSeeAll?: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ title, places, onPlacePress, onSeeAll }) => {
  if (!places || places.length === 0) return null;
  
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center px-5 mb-3">
        <Text className="text-slate-900 text-lg font-bold">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text className="text-primary text-sm font-semibold">SEE ALL</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={places}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View className="w-4" />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GooglePlaceCard place={item} onPress={() => onPlacePress(item)} />
        )}
      />
    </View>
  );
};
