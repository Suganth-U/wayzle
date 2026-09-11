import React from 'react';
import { View, Text, Image } from 'react-native';
import { StarRating } from './StarRating';
import { Feather } from '@expo/vector-icons';

export interface ReviewProps {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  isAnonymous?: boolean;
}

export const ReviewCard: React.FC<{ review: ReviewProps }> = ({ review }) => {
  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center flex-1">
          {review.authorPhotoUrl && !review.isAnonymous ? (
            <Image 
              source={{ uri: review.authorPhotoUrl }} 
              className="w-10 h-10 rounded-full mr-3 border border-slate-100"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
              <Feather name="user" size={16} color="#94a3b8" />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-bold text-slate-800 text-sm">
              {review.isAnonymous ? 'Anonymous User' : review.authorName}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">{review.relativeTimeDescription}</Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>
      
      {review.text ? (
        <Text className="text-slate-600 text-sm leading-6">
          {review.text}
        </Text>
      ) : (
        <Text className="text-slate-400 text-sm italic">No review text provided.</Text>
      )}
    </View>
  );
};
