import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { StarRating } from './StarRating';
import { Feather } from '@expo/vector-icons';

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => Promise<boolean>;
  placeName: string;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({ visible, onClose, onSubmit, placeName }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const success = await onSubmit(rating, text);
    setSubmitting(false);
    if (success) {
      setRating(0);
      setText('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>Review {placeName}</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-6">
            <Text className="text-slate-500 mb-3">Tap to Rate</Text>
            <StarRating rating={rating} size={36} interactive={true} onRatingChange={setRating} />
          </View>

          <View className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
            <TextInput
              className="text-slate-800 text-base min-h-[100px]"
              placeholder="Share details of your experience at this place (optional)"
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
            />
          </View>

          <TouchableOpacity 
            className={`py-4 rounded-xl items-center justify-center ${rating === 0 ? 'bg-slate-200' : 'bg-primary'}`}
            disabled={rating === 0 || submitting}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-bold text-lg ${rating === 0 ? 'text-slate-400' : 'text-white'}`}>
                Post Review Anonymously
              </Text>
            )}
          </TouchableOpacity>
          <View className="h-8" />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
