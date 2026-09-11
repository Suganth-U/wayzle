import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, SafeAreaView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { CategorySection } from '../../src/components/ui/CategorySection';
import { GooglePlaceCard } from '../../src/components/ui/GooglePlaceCard';
import { useLocation } from '../../src/hooks/useLocation';
import { useGooglePlaces, GooglePlace } from '../../src/hooks/useGooglePlaces';
import { useAppStore } from '../../src/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const router = useRouter();
  const { currentLocation, searchLocation } = useAppStore();
  const { fetchPlaces, loading: googleLoading } = useGooglePlaces();
  
  const [categorizedPlaces, setCategorizedPlaces] = useState<Record<string, GooglePlace[]>>({});
  const [isFetchingSections, setIsFetchingSections] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCategories = async () => {
      setIsFetchingSections(true);
      const lat = searchLocation ? searchLocation.lat : (currentLocation ? currentLocation.coords.latitude : 8.7514);
      const lng = searchLocation ? searchLocation.lng : (currentLocation ? currentLocation.coords.longitude : 80.4971);

      try {
        const [restaurants, hotels, entertainment, parks, shopping] = await Promise.all([
          fetchPlaces(lat, lng, 3000, ['restaurant', 'cafe', 'bakery']),
          fetchPlaces(lat, lng, 3000, ['lodging', 'hotel', 'bed_and_breakfast']),
          fetchPlaces(lat, lng, 3000, ['movie_theater', 'amusement_park', 'bowling_alley', 'casino']),
          fetchPlaces(lat, lng, 3000, ['park', 'tourist_attraction', 'campground']),
          fetchPlaces(lat, lng, 3000, ['shopping_mall', 'store']),
        ]);

        setCategorizedPlaces({
          '🍽️ Restaurants & Cafes': restaurants,
          '🏨 Hotels & Stays': hotels,
          '🎮 Entertainment & Gaming': entertainment,
          '🌳 Parks & Leisure': parks,
          '🛍️ Shopping': shopping,
        });
      } catch (e) {
        console.error("Error fetching google places:", e);
      } finally {
        setIsFetchingSections(false);
      }
    };
    
    fetchAllCategories();
  }, [currentLocation, searchLocation, fetchPlaces]);

  const handlePlacePress = (place: GooglePlace) => {
    router.push(`/place/google/${place.id}`);
  };

  const handleGoBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }
    if (searchQuery) {
      setSearchQuery('');
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const allPlaces = Object.values(categorizedPlaces).flat();
  // Filter out duplicates by id
  const uniquePlaces = Array.from(new Map(allPlaces.map(p => [p.id, p])).values());
  
  const filteredPlaces = searchQuery.trim() !== ''
    ? uniquePlaces.filter(p => p.displayName.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 }}>
      <View className="flex-row items-center px-4 py-4 border-b border-slate-100 bg-white">
        <Pressable onPress={handleGoBack} className="mr-4 p-2 bg-slate-50 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900">
            {selectedCategory || (searchLocation ? 'Places in Marked Area' : 'Places Near You')}
          </Text>
          <Text className="text-sm text-slate-500">
            {selectedCategory ? 'Category View' : 'Discovery Feed'}
          </Text>
        </View>
      </View>

      {!selectedCategory && (
        <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row items-center">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-2 text-base text-slate-900"
            placeholder="Search places..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')} className="p-1">
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      )}

      {isFetchingSections ? (
        <View className="flex-1 items-center justify-center" style={{ flex: 1 }}>
          <ActivityIndicator size="large" color="#FF0055" />
          <Text className="text-slate-500 mt-4 font-medium">Discovering nearby places...</Text>
        </View>
      ) : searchQuery.trim() !== '' ? (
        <ScrollView style={{ flex: 1 }} className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map(place => (
              <Pressable 
                key={place.id}
                onPress={() => handlePlacePress(place)}
                className="flex-row items-center bg-white p-3 rounded-2xl mb-3 shadow-sm border border-slate-100"
              >
                <View className="flex-1">
                  <Text className="font-bold text-base text-slate-900">{place.displayName.text}</Text>
                  <Text className="text-slate-500 text-sm mt-0.5 capitalize">{place.primaryType?.replace(/_/g, ' ') || 'Place'}</Text>
                  <Text className="text-amber-500 text-sm font-semibold mt-1">★ {place.rating || 'New'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </Pressable>
            ))
          ) : (
            <View className="items-center py-10">
              <Text className="text-slate-500 text-base">No places found matching "{searchQuery}"</Text>
            </View>
          )}
        </ScrollView>
      ) : selectedCategory ? (
        <ScrollView style={{ flex: 1 }} className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row flex-wrap justify-between">
            {categorizedPlaces[selectedCategory]?.map(place => (
              <View key={place.id} className="w-[47%] mb-4">
                <GooglePlaceCard place={place} onPress={() => handlePlacePress(place)} fullWidth={true} />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : Object.keys(categorizedPlaces).length === 0 || Object.values(categorizedPlaces).every(arr => arr.length === 0) ? (
        <View className="flex-1 items-center justify-center px-8" style={{ flex: 1 }}>
          <Text className="text-4xl mb-4">📍</Text>
          <Text className="text-slate-600 text-center text-base">
            No places found here. Try exploring another area.
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}>
          {Object.entries(categorizedPlaces).map(([title, places]) => (
            <CategorySection 
              key={title}
              title={title}
              places={places}
              onPlacePress={handlePlacePress}
              onSeeAll={() => setSelectedCategory(title)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
