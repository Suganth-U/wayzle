import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';

interface Props {
  color?: string;
  size?: number;
}

export const PulseMarker = ({ color = '#FF0055', size = 20 }: Props) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 2.5,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    ).start();
  }, [pulseAnim, opacityAnim]);

  const wrapperSize = size * 3;

  return (
    <View style={{ width: wrapperSize, height: wrapperSize, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulsing ring */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: color,
            borderRadius: wrapperSize / 2,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          }
        ]}
      />
      
      {/* Core Dot */}
      <View 
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }} 
      />
    </View>
  );
};
