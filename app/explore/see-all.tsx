import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGooglePlaces, GooglePlace } from '../../src/hooks/useGooglePlaces';
import { useAppStore } from '../../src/store/useAppStore';
import { getPlacePhotoUrl } from '../../src/api/googlePlacesApi';

const PRICE_LEVELS = [
  { label: 'All', value: 'ALL' },
  { label: 'Free', value: 'PRICE_LEVEL_FREE' },
  { label: '$', value: 'PRICE_LEVEL_INEXPENSIVE' },
  { label: '$$', value: 'PRICE_LEVEL_MODERATE' },
  { label: '$$$', value: 'PRICE_LEVEL_EXPENSIVE' },
  { label: '$$$$', value: 'PRICE_LEVEL_VERY_EXPENSIVE' },
];

export default function SeeAllScreen() {
  const router = useRouter();
  const { title, type } = useLocalSearchParams<{ title: string; type: string }>();
  const { currentLocation } = useAppStore();
  const { fetchPlaces, loading } = useGooglePlaces();
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string>('ALL');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  useEffect(() => {
    const loadPlaces = async () => {
      const lat = currentLocation ? currentLocation.coords.latitude : 8.7514;
      const lng = currentLocation ? currentLocation.coords.longitude : 80.4971;

      try {
        const results = await fetchPlaces(lat, lng, 5000, ['restaurant', 'tourist_attraction', 'cafe', 'museum', 'park', 'shopping_mall']);
        let processedPlaces = results;

        if (type === 'trending') {
          processedPlaces = [...results].sort((a, b) => (b.userRatingCount || 0) - (a.userRatingCount || 0));
        } else if (type === 'top-rated') {
          processedPlaces = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        
        setPlaces(processedPlaces);
      } catch (err) {
        console.error('Error fetching places for see-all:', err);
      }
    };

    loadPlaces();
  }, [currentLocation, fetchPlaces, type]);

  const filteredPlaces = places.filter(place => {
    if (selectedPriceLevel === 'ALL') return true;
    return place.priceLevel === selectedPriceLevel;
  });

  const renderGridItem = ({ item }: { item: GooglePlace }) => {
    const photoUrl = item.photos && item.photos.length > 0
      ? getPlacePhotoUrl(item.photos[0].name, 400)
      : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400';

    const isRestaurant = item.primaryType === 'restaurant' || item.types?.includes('restaurant');
    const hasMenu = Boolean(item.menuUri || item.websiteUri);

    return (
      <TouchableOpacity
        className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden m-2 pb-2"
        onPress={() => router.push(`/place/google/${item.id}`)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: photoUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' }}
          className="w-full h-32"
          resizeMode="cover"
        />
        <View className="p-3">
          <Text className="font-bold text-sm text-slate-900 mb-1" numberOfLines={1}>
            {item.displayName?.text || 'Place'}
          </Text>
          
          <Text className="text-slate-500 text-xs mb-1.5 capitalize" numberOfLines={1}>
            {item.primaryType?.replace(/_/g, ' ') || 'Place'}
          </Text>
          
          <View className="flex-row items-center mb-1">
            <Text className="text-amber-400 mr-1 text-xs">★</Text>
            <Text className="text-slate-700 font-medium mr-1 text-xs">{item.rating || 'New'}</Text>
            {item.userRatingCount ? (
              <Text className="text-slate-400 text-[10px]">({item.userRatingCount})</Text>
            ) : null}
          </View>

          {isRestaurant && (
            <View className="mt-2">
              {hasMenu ? (
                <View className="bg-primary/10 py-1.5 px-2 rounded flex-row justify-center items-center">
                  <Ionicons name="restaurant-outline" size={12} color="#FF0055" />
                  <Text className="text-primary text-xs font-semibold ml-1">Menu</Text>
                </View>
              ) : (
                <View className="bg-slate-100 py-1.5 px-2 rounded flex-row justify-center items-center">
                  <Text className="text-slate-400 text-[10px] font-medium">Menu not available</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-slate-900 text-lg font-bold ml-4">{title || 'Discover'}</Text>
        </View>
        <TouchableOpacity 
          className="bg-slate-100 px-3 py-1.5 rounded-full flex-row items-center"
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={16} color="#0f172a" />
          <Text className="text-slate-900 text-xs font-semibold ml-1">Adjust Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Listing */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF0055" />
          <Text className="text-slate-500 mt-4">Loading places...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={renderGridItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="search-outline" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 mt-4 font-medium">No places found for this budget.</Text>
            </View>
          }
        />
      )}

      {/* Budget Filter Modal Overlay */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            className="bg-white rounded-t-3xl p-5 pb-10"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">Adjust Budget</Text>
              <TouchableOpacity 
                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row flex-wrap">
              {PRICE_LEVELS.map((item) => {
                const isSelected = selectedPriceLevel === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => {
                      setSelectedPriceLevel(item.value);
                      setIsFilterModalVisible(false);
                    }}
                    className={`px-5 py-2.5 rounded-full border mr-3 mb-3 ${
                      isSelected 
                        ? 'bg-primary border-primary' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text 
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
