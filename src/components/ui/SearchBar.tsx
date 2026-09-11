import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

interface SearchBarProps {
  onPress?: () => void;
  onAvatarPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onPress,
  onAvatarPress,
}) => {
  const { searchLocationName, userProfile, setSearchLocation, setSearchLocationName, setIsMarkingLocation } = useAppStore();

  const handleClear = () => {
    setSearchLocation(null);
    setSearchLocationName(null);
    setIsMarkingLocation(false);
  };

  return (
    <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
      <Text className="text-slate-900 font-extrabold text-xl tracking-tight">Wayzle</Text>
      
      {/* Tappable search area — opens the LocationSearchModal */}
      <TouchableOpacity 
        className="flex-1 flex-row items-center bg-slate-50 rounded-xl px-4 py-2.5 mx-4 border border-slate-100"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Feather name={searchLocationName ? "map-pin" : "search"} size={16} color={searchLocationName ? "#ef4444" : "#64748b"} />
        <Text 
          className={`flex-1 font-medium ml-2 ${searchLocationName ? 'text-slate-800' : 'text-slate-400'}`} 
          numberOfLines={1}
        >
          {searchLocationName || 'Search for places...'}
        </Text>
        {searchLocationName && (
          <TouchableOpacity onPress={handleClear} className="ml-2 p-1 rounded-full bg-slate-200">
            <Feather name="x" size={12} color="#64748b" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* User avatar */}
      <TouchableOpacity activeOpacity={0.7} onPress={onAvatarPress}>
        {userProfile.avatarUrl ? (
          <Image 
            source={{ uri: userProfile.avatarUrl }} 
            className="w-10 h-10 rounded-full"
            style={{ borderWidth: 2, borderColor: '#e2e8f0' }}
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200">
            <Feather name="user" size={18} color="#64748b" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
