import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export interface TransportMode {
  id: string;
  label: string;
  icon: string;
  duration: string;
}

interface TransportModeSelectorProps {
  selectedMode: string;
  onSelect: (id: string) => void;
  modes: TransportMode[];
}

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedMode,
  onSelect,
  modes,
}) => {
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 px-4">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              onPress={() => onSelect(mode.id)}
              activeOpacity={0.7}
              className={`mr-3 rounded-xl p-3 w-28 items-center border ${
                isSelected ? 'border-primary bg-primary/10' : 'border-slate-200 bg-surface'
              }`}
            >
              <Text className="text-2xl mb-1">{mode.icon}</Text>
              <Text className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                {mode.label}
              </Text>
              <Text className={`text-xs ${isSelected ? 'text-primary/70' : 'text-slate-400'}`}>
                {mode.duration}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
