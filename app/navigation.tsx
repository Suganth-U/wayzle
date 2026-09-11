import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { MapContainer } from '../src/components/map/MapContainer';
import { TurnBanner } from '../src/components/ui/TurnBanner';
import { NavigationHUD } from '../src/components/ui/NavigationHUD';
import { useAppStore } from '../src/store/useAppStore';
import { useRoute } from '../src/hooks/useRoute';
import { useVoiceTTS } from '../src/hooks/useVoiceTTS';
import { useLocation } from '../src/hooks/useLocation';

export default function NavigationScreen() {
  const router = useRouter();
  const { destination, currentLocation, setIsNavigating } = useAppStore();
  const { routeData, fetchRoute } = useRoute();
  const { speak } = useVoiceTTS();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  useLocation();

  const centerCoordinate: [number, number] = currentLocation
    ? [currentLocation.coords.longitude, currentLocation.coords.latitude]
    : [80.4971, 8.7514];

  useEffect(() => {
    if (destination) {
      const lat = currentLocation ? currentLocation.coords.latitude : 8.7514;
      const lng = currentLocation ? currentLocation.coords.longitude : 80.4971;

      fetchRoute(
        { lng, lat },
        { lng: destination.lng_out, lat: destination.lat_out },
        'car'
      );
    }
  }, [currentLocation, destination, fetchRoute]);

  // Speak the first instruction
  useEffect(() => {
    if (routeData?.steps && routeData.steps.length > 0) {
      speak(routeData.steps[0].instruction);
    }
  }, [routeData]);

  const handleEndTrip = () => {
    setIsNavigating(false);
    router.replace('/(tabs)');
  };

  const handleShare = () => {
    speak('Sharing your live location with friends');
  };

  const currentStep = routeData?.steps?.[currentStepIndex];
  const etaMinutes = routeData ? Math.round(routeData.totalDuration / 60) : 8;
  const distanceKm = routeData ? (routeData.totalDistance / 1000).toFixed(1) : '2.4';

  return (
    <View className="flex-1">
      {/* Full-screen Map */}
      <View style={StyleSheet.absoluteFill}>
        <MapContainer />
      </View>

      {/* Turn Banner */}
      <View className="absolute top-14 left-5 right-5">
        <TurnBanner
          instruction={currentStep?.instruction || 'TURN LEFT ONTO GALLE ROAD'}
          distanceText={currentStep ? `In ${Math.round(currentStep.distance)}m` : 'In 250m'}
        />
      </View>

      {/* Navigation HUD */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationHUD
          etaMinutes={etaMinutes}
          distanceKm={parseFloat(String(distanceKm))}
          onShare={handleShare}
          onEndTrip={handleEndTrip}
        />
      </View>
    </View>
  );
}
