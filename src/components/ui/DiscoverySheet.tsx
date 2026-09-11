import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from './GlassCard';
import { CategoryPill } from './CategoryPill';
import { AnimatedActionBtn } from './AnimatedActionBtn';
import { useAppStore } from '../../store/useAppStore';

// Temporary fallback for web where BottomSheet might be crashing
import BottomSheet from '@gorhom/bottom-sheet';

export const DiscoverySheet = () => {
  const snapPoints = useMemo(() => ['15%', '45%', '85%'], []);
  const { isNavigating, setIsNavigating } = useAppStore();

  if (isNavigating) return null;

  // Render a simple view instead if BottomSheet is undefined (common issue on web)
  if (!BottomSheet) {
    return (
      <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 300, backgroundColor: 'white' }}>
        <Text>BottomSheet is not available on web</Text>
      </View>
    );
  }

  return (
    <BottomSheet
      index={1}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
    >
      <View className="flex-1 px-5 pt-2">
        <Text className="text-slate-900 text-3xl font-bold mb-6">Discover Nearby</Text>
        <View className="flex-row mb-8">
          <CategoryPill title="Cafes" isActive={true} onPress={() => {}} />
          <CategoryPill title="Cinemas" isActive={false} onPress={() => {}} />
          <CategoryPill title="Hotels" isActive={false} onPress={() => {}} />
        </View>
        
        {/* Placeholder for list of places */}
        <View className="flex-1" />

        <View className="pb-8">
          <AnimatedActionBtn 
            title="Start Navigation (Test)" 
            onPress={() => setIsNavigating(true)} 
          />
        </View>
      </View>
    </BottomSheet>
  );
};
