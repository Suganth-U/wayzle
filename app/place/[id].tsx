import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/api/supabase';
import { useSavedPlaces } from '../../src/hooks/useSavedPlaces';
import { AnimatedActionBtn } from '../../src/components/ui/AnimatedActionBtn';
import { useAppStore } from '../../src/store/useAppStore';

interface PlaceDetail {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  vibe_tags: string[];
  is_open_now: boolean;
  active_users_count: number;
  address: string;
  phone: string;
  website: string;
  lat_out?: number;
  lng_out?: number;
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedPlaces();
  const { setDestination } = useAppStore();

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchPlace = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*, location')
      .eq('id', id)
      .single();

    if (data) {
      // Extract lat/lng from geography
      const match = /POINT\(([^ ]+) ([^ ]+)\)/.exec(data.location || '');
      setPlace({
        ...data,
        lat_out: match ? parseFloat(match[2]) : 0,
        lng_out: match ? parseFloat(match[1]) : 0,
      });
    }
    setLoading(false);
  };

  const handlePlanRoute = () => {
    if (place) {
      setDestination({
        id: place.id,
        name: place.name,
        category: place.category,
        rating: place.rating,
        reviews_count: place.reviews_count,
        lat_out: place.lat_out || 0,
        lng_out: place.lng_out || 0,
      });
      router.push('/route-planner');
    }
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
      </View>
    );
  }

  if (!place) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-500 mb-4">Place not found</Text>
        <Pressable onPress={handleGoBack}>
          <Text className="text-primary font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: place.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600' }}
            className="w-full h-64"
            resizeMode="cover"
          />
          {/* Back Button */}
          <Pressable
            onPress={handleGoBack}
            className="absolute top-14 left-5 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-lg">←</Text>
          </Pressable>
          {/* Save Button */}
          <Pressable
            onPress={() => toggleSave(place.id)}
            className="absolute top-14 right-5 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-lg">{isSaved(place.id) ? '🔖' : '🏷️'}</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-5 -mt-6 relative">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            {/* Name & Rating */}
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-900 text-2xl font-bold flex-1 mr-3">
                {place.name}
              </Text>
              <View className="bg-slate-100 px-3 py-1.5 rounded-full">
                <Text className="text-slate-700 text-sm font-bold">★ {place.rating}</Text>
              </View>
            </View>

            {/* Status & Category */}
            <View className="flex-row items-center mb-4">
              <Text className={`font-semibold text-sm ${place.is_open_now ? 'text-green-500' : 'text-red-500'}`}>
                ● {place.is_open_now ? 'Open Now' : 'Closed'}
              </Text>
              <Text className="text-slate-400 mx-2">·</Text>
              <Text className="text-slate-500 text-sm">{place.category}</Text>
              <Text className="text-slate-400 mx-2">·</Text>
              <Text className="text-slate-500 text-sm">0.8 mi</Text>
            </View>

            {/* Vibe & Active Users */}
            <View className="flex-row justify-between bg-slate-50 rounded-xl p-4 mb-4">
              <View>
                <Text className="text-slate-400 text-xs font-medium mb-1">Vibe</Text>
                <Text className="text-slate-800 font-semibold">
                  {(place.vibe_tags || []).join(', ') || 'Chill'}
                </Text>
              </View>
              <View>
                <Text className="text-slate-400 text-xs font-medium mb-1">Active Users</Text>
                <Text className="text-slate-800 font-semibold">
                  👥 {place.active_users_count || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View className="mt-6">
            <Text className="text-slate-900 text-lg font-bold mb-3">About</Text>
            <Text className="text-slate-600 text-base leading-7">
              {place.description || 'No description available.'}
            </Text>
          </View>

          {/* Community Vibes */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-900 text-lg font-bold">Community Vibes</Text>
              <Text className="text-primary text-sm font-semibold">SEE ALL</Text>
            </View>
            <View className="flex-row">
              <View className="flex-1 h-32 bg-slate-200 rounded-xl mr-3 overflow-hidden">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=300' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1 h-32 bg-slate-200 rounded-xl overflow-hidden">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-10 pt-4 bg-white border-t border-slate-100">
        <View className="flex-row">
          <AnimatedActionBtn
            title="Share to Friend"
            variant="secondary"
            onPress={() => Alert.alert('Share', 'Sharing feature coming soon!')}
          />
          <View className="w-3" />
          <View className="flex-1">
            <AnimatedActionBtn
              title="Plan Route"
              variant="primary"
              onPress={handlePlanRoute}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
