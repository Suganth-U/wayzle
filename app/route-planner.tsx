import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapContainer } from '../src/components/map/MapContainer';
import { TransportModeSelector } from '../src/components/ui/TransportModeSelector';
import { AnimatedActionBtn } from '../src/components/ui/AnimatedActionBtn';
import { useAppStore } from '../src/store/useAppStore';
import { useRoute } from '../src/hooks/useRoute';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

const TRANSPORT_MODES = [
  { id: 'driving-car', label: 'Car', icon: '🚗', duration: '12 min' },
  { id: 'foot-walking', label: 'Walk', icon: '🚶', duration: '45 min' },
  { id: 'cycling-regular', label: 'Bike', icon: '🚲', duration: '18 min' },
];

export default function RoutePlannerScreen() {
  const router = useRouter();
  const { destination, currentLocation, setIsNavigating, searchLocationName, searchLocation } = useAppStore();
  const { routeData, loading, fetchRoute } = useRoute();
  const [selectedMode, setSelectedMode] = useState('driving-car');
  const { setActiveRouteCoordinates, setActiveRouteDuration } = useAppStore();

  useEffect(() => {
    if (destination) {
      const lat = searchLocation ? searchLocation.lat : (currentLocation ? currentLocation.coords.latitude : 8.7514);
      const lng = searchLocation ? searchLocation.lng : (currentLocation ? currentLocation.coords.longitude : 80.4971);

      fetchRoute(
        { lng, lat },
        { lng: destination.lng_out, lat: destination.lat_out },
        selectedMode
      );
    }
  }, [currentLocation, searchLocation, selectedMode, destination, fetchRoute]);

  useEffect(() => {
    if (routeData && routeData.coordinates) {
      setActiveRouteCoordinates(routeData.coordinates);
      setActiveRouteDuration(routeData.totalDuration || null);
    } else {
      setActiveRouteCoordinates(null);
      setActiveRouteDuration(null);
    }
    
    // Cleanup on unmount
    return () => {
      setActiveRouteCoordinates(null);
    };
  }, [routeData, setActiveRouteCoordinates]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    router.replace('/navigation');
  };

  const handleGoBack = () => {
    setActiveRouteCoordinates(null);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const snapPoints = ['15%', '45%', '60%'];

  return (
    <View className="flex-1 bg-background">
      {/* Map Background */}
      <MapContainer />
      
      {/* Top Header Overlay */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-10" pointerEvents="box-none">
        <View className="flex-row items-center px-4 py-3" pointerEvents="box-none">
          <Pressable
            onPress={handleGoBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center mr-4 shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet for Route Details */}
      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
      >
        <View className="flex-1 pt-2">
          {/* From/To */}
          <View className="mx-5 bg-slate-50 rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
            <View className="mb-3">
              <Text className="text-slate-400 text-[10px] font-bold tracking-wider mb-1">STARTING POINT</Text>
              <View className="flex-row items-center">
                <Text className="text-rose-500 mr-3 text-lg">◉</Text>
                <Text className="text-slate-900 text-sm font-bold flex-1" numberOfLines={1}>
                  {searchLocationName || 'Current Location'}
                </Text>
              </View>
            </View>
            <View className="h-px bg-slate-200 mb-3 ml-7" />
            <View>
              <Text className="text-slate-400 text-[10px] font-bold tracking-wider mb-1">DESTINATION</Text>
              <View className="flex-row items-center">
                <Text className="text-primary mr-3 text-lg">📍</Text>
                <Text className="text-slate-900 text-sm font-bold flex-1" numberOfLines={1}>
                  {destination?.name || 'Select Destination'}
                </Text>
              </View>
            </View>
          </View>

          {/* Transport Modes */}
          <View className="mx-5 mb-6">
            <Text className="text-slate-900 text-sm font-bold mb-3">SELECT MODE</Text>
            <TransportModeSelector
              selectedMode={selectedMode}
              onSelect={setSelectedMode}
              modes={TRANSPORT_MODES.map((m) => ({
                ...m,
                duration: routeData?.totalDuration && selectedMode === m.id
                  ? `${Math.round(routeData.totalDuration / 60)} min`
                  : m.duration,
              }))}
            />
          </View>
          
          <View className="mx-5 mt-auto pb-8 pt-4">
            <AnimatedActionBtn
              title={loading ? "Calculating..." : "▲ Start Navigation"}
              onPress={handleStartNavigation}
              variant="primary"
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
