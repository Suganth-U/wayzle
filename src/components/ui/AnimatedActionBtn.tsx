import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedActionBtnProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const AnimatedActionBtn = ({ title, onPress, variant = 'primary' }: AnimatedActionBtnProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const bgColor = variant === 'primary' ? 'bg-primary' : 'bg-slate-200';
  const textColor = variant === 'primary' ? 'text-white' : 'text-slate-900';
  const shadow = variant === 'primary' ? 'shadow-primary/30' : 'shadow-slate-300';

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
      style={[animatedStyle]}
      className={`px-6 py-4 rounded-full items-center justify-center ${bgColor} shadow-lg ${shadow}`}
    >
      <Text className={`font-bold text-lg ${textColor}`}>{title}</Text>
    </AnimatedPressable>
  );
};
