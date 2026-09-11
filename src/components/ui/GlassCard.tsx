import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children: React.ReactNode;
}

export const GlassCard = ({ children, style, intensity = 50, tint = 'dark', ...props }: GlassCardProps) => {
  return (
    <View 
      className="overflow-hidden rounded-3xl border border-white/10"
      style={style} 
      {...props}
    >
      <BlurView intensity={intensity} tint={tint} className="flex-1 p-4 bg-[#1A1D2B]/40">
        {children}
      </BlurView>
    </View>
  );
};
