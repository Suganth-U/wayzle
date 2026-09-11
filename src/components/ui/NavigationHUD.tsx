import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface NavigationHUDProps {
  etaMinutes: number;
  distanceKm: number;
  onShare: () => void;
  onEndTrip: () => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  etaMinutes,
  distanceKm,
  onShare,
  onEndTrip,
}) => {
  return (
    <View className="bg-surface rounded-t-3xl pt-5 pb-8 px-6 shadow-lg border-t border-slate-100 w-full">
      <View className="items-center mb-4">
        <View className="w-12 h-1.5 bg-slate-200 rounded-full mb-4" />
        
        <View className="flex-row w-full justify-between items-end">
          <View>
            <Text className="text-primary text-5xl font-extrabold tracking-tighter">
              {etaMinutes}<Text className="text-2xl">min</Text>
            </Text>
            <Text className="text-slate-500 font-bold text-xs tracking-widest mt-1">
              ARRIVAL ETA
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="text-slate-800 text-2xl font-bold">
              {distanceKm.toFixed(1)} km
            </Text>
            <Text className="text-slate-500 text-sm font-medium mt-1">
              remaining
            </Text>
          </View>
        </View>
      </View>
      
      <View className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <View className="h-full bg-primary w-1/3 rounded-full" />
      </View>
      
      <View className="flex-row space-x-4">
        <TouchableOpacity 
          className="flex-1 py-4 rounded-xl border border-primary items-center justify-center mr-2"
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Text className="text-primary font-bold">SHARE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 py-4 rounded-xl bg-primary items-center justify-center flex-row ml-2"
          onPress={onEndTrip}
          activeOpacity={0.7}
        >
          <Text className="text-white font-bold mr-2">END TRIP</Text>
          <Text className="text-white">✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
