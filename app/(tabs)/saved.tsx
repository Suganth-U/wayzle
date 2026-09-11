import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavedPlaces } from '../../src/hooks/useSavedPlaces';
import { PlaceCard } from '../../src/components/ui/PlaceCard';

export default function SavedScreen() {
  const router = useRouter();
  const { savedPlaces, loading, fetchSavedPlaces } = useSavedPlaces();

  useEffect(() => {
    fetchSavedPlaces();
  }, []);

  // Extract the nested place data from the saved_places join
  const placesData = savedPlaces
    .filter((sp) => sp.place)
    .map((sp) => ({
      id: sp.place_id,
      name: sp.place?.name || 'Unknown',
      category: sp.place?.category || '',
      description: sp.place?.description,
      image_url: sp.place?.image_url,
      rating: sp.place?.rating,
      reviews_count: sp.place?.reviews_count,
      vibe_tags: sp.place?.vibe_tags,
      is_open_now: sp.place?.is_open_now,
      active_users_count: sp.place?.active_users_count,
      lat_out: 0,
      lng_out: 0,
    }));

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-6">
        <Text className="text-primary text-sm font-semibold tracking-wider mb-1">COLLECTION</Text>
        <Text className="text-slate-900 text-3xl font-bold">Saved Places</Text>
      </View>

      {placesData.length === 0 && !loading ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🔖</Text>
          <Text className="text-slate-900 text-xl font-bold text-center mb-2">
            No saved places yet
          </Text>
          <Text className="text-slate-500 text-center text-base">
            Tap the bookmark icon on any place to save it here for quick access.
          </Text>
        </View>
      ) : (
        <FlatList
          data={placesData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onPress={() => router.push(`/place/${item.id}`)}
            />
          )}
          refreshing={loading}
          onRefresh={fetchSavedPlaces}
        />
      )}
    </SafeAreaView>
  );
}
