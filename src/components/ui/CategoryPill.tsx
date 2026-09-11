import React from 'react';
import { Pressable, Text } from 'react-native';

interface CategoryPillProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryPill = ({ title, isActive, onPress }: CategoryPillProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`px-5 py-2 rounded-full border ${
        isActive 
          ? 'bg-primary border-primary' 
          : 'bg-white border-slate-200'
      } mr-3 shadow-sm`}
    >
      <Text className={isActive ? 'text-white font-bold' : 'text-slate-500 font-medium'}>
        {title}
      </Text>
    </Pressable>
  );
};
