import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 16, 
  interactive = false,
  onRatingChange 
}) => {
  return (
    <View className="flex-row items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!interactive}
          onPress={() => interactive && onRatingChange?.(star)}
          className="mr-1"
        >
          <Ionicons 
            name={star <= rating ? "star" : "star-outline"} 
            size={size} 
            color={star <= rating ? '#fbbf24' : '#e2e8f0'} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};
