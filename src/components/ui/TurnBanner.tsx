import React from 'react';
import { View, Text } from 'react-native';

interface TurnBannerProps {
  instruction: string;
  distanceText: string;
}

export const TurnBanner: React.FC<TurnBannerProps> = ({ instruction, distanceText }) => {
  return (
    <View className="bg-surface/95 border border-primary/20 rounded-2xl p-4 shadow-md m-4 flex-row items-center">
      <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center mr-4">
        <Text className="text-primary text-2xl">⤴</Text>
      </View>
      
      <View className="flex-1">
        <Text className="text-slate-800 text-xl font-bold mb-1">{distanceText}</Text>
        <Text className="text-slate-600 text-sm font-medium uppercase tracking-wider">
          {instruction}
        </Text>
      </View>
    </View>
  );
};
