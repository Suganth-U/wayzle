import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGooglePlaces, GooglePlace } from '../../src/hooks/useGooglePlaces';
import { useAppStore } from '../../src/store/useAppStore';
import { GooglePlaceCard } from '../../src/components/ui/GooglePlaceCard';
import { getPlacePhotoUrl } from '../../src/api/googlePlacesApi';

export default function DiscoverScreen() {
  const router = useRouter();
  const { currentLocation } = useAppStore();
  const { fetchPlaces, loading } = useGooglePlaces();
  const [places, setPlaces] = useState<GooglePlace[]>([]);

  useEffect(() => {
    const loadPlaces = async () => {
      const lat = currentLocation ? currentLocation.coords.latitude : 8.7514;
      const lng = currentLocation ? currentLocation.coords.longitude : 80.4971;

      try {
        const results = await fetchPlaces(lat, lng, 5000, ['restaurant', 'tourist_attraction', 'cafe', 'museum', 'park', 'shopping_mall']);
        setPlaces(results);
      } catch (err) {
        console.error('Error fetching discover places:', err);
      }
    };

    loadPlaces();
  }, [currentLocation, fetchPlaces]);

  // Trending: high number of reviews
  const trendingPlaces = [...places]
    .sort((a, b) => (b.userRatingCount || 0) - (a.userRatingCount || 0))
    .slice(0, 8);

  // Top Rated: high rating
  const topRated = [...places]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-primary text-sm font-semibold tracking-wider mb-1">DISCOVER</Text>
          <Text className="text-slate-900 text-3xl font-bold">For You</Text>
          <Text className="text-slate-500 text-base mt-1">
            Curated picks based on your vibe ✨
          </Text>
        </View>

        {loading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator size="large" color="#FF0055" />
            <Text className="text-slate-500 mt-4">Finding the best spots...</Text>
          </View>
        ) : (
          <>
            {/* Trending Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-slate-900 text-lg font-bold">🔥 Trending Now</Text>
                <Pressable onPress={() => router.push({ pathname: '/explore/see-all', params: { title: 'Trending Now', type: 'trending' } })}>
                  <Text className="text-primary text-sm font-semibold">See All</Text>
                </Pressable>
              </View>
              <FlatList
                data={trendingPlaces}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingLeft: 20 }}
                renderItem={({ item }) => {
                  const photoUrl = item.photos && item.photos.length > 0 
                    ? getPlacePhotoUrl(item.photos[0].name, 400) 
                    : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400';

                  return (
                    <Pressable
                      onPress={() => router.push(`/place/google/${item.id}`)}
                      className="mr-4 w-64 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                    >
                      <Image
                        source={{ uri: photoUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' }}
                        className="w-full h-36"
                        resizeMode="cover"
                      />
                      <View className="p-3">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-slate-900 font-bold text-base flex-1 mr-2" numberOfLines={1}>
                            {item.displayName?.text}
                          </Text>
                          <View className="bg-primary/10 px-2 py-0.5 rounded-full flex-row items-center">
                            <Text className="text-primary text-xs font-bold">★ {item.rating || 'New'}</Text>
                          </View>
                        </View>
                        <Text className="text-slate-500 text-sm mt-1 capitalize" numberOfLines={1}>
                          {item.primaryType?.replace(/_/g, ' ') || 'Place'}
                          {item.userRatingCount ? ` · ${item.userRatingCount} reviews` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            </View>

            {/* Top Rated Section */}
            <View className="px-5 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-900 text-lg font-bold">⭐ Top Rated</Text>
                <Pressable onPress={() => router.push({ pathname: '/explore/see-all', params: { title: 'Top Rated', type: 'top-rated' } })}>
                  <Text className="text-primary text-sm font-semibold">See All</Text>
                </Pressable>
              </View>
              <FlatList
                data={topRated}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View className="mr-4">
                    <GooglePlaceCard 
                      place={item} 
                      onPress={() => router.push(`/place/google/${item.id}`)} 
                    />
                  </View>
                )}
              />
            </View>
          </>
        )}

        {/* Bottom padding */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
