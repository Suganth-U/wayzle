import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform, Animated } from 'react-native';

interface Props {
  avatarUrl: string | null;
  fullName: string | null;
}

export const CurrentLocationMarker = ({ avatarUrl, fullName }: Props) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    ).start();
  }, [pulseAnim, opacityAnim]);

  const initials = fullName 
    ? fullName.charAt(0).toUpperCase() 
    : 'Me';

  return (
    <View className="items-center justify-center w-12 h-12">
      {/* Pulsing ring */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(59,130,246,0.3)',
            borderRadius: 24,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          }
        ]}
      />
      
      {/* Avatar or Initials */}
      <View className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white items-center justify-center shadow-md overflow-hidden">
        {avatarUrl ? (
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-white text-xs font-bold">
            {initials}
          </Text>
        )}
      </View>
    </View>
  );
};
