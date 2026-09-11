import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { usePlacesSearch, Place } from '../../hooks/usePlacesSearch';
import { Feather } from '@expo/vector-icons';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ visible, onClose }) => {
  const [query, setQuery] = useState('');
  const { places, loading } = usePlacesSearch(query);
  const { setSearchLocation, setSearchLocationName, setIsMarkingLocation, recentSearches, addRecentSearch, clearRecentSearches } = useAppStore();

  const handleSelectPlace = (place: Place) => {
    setSearchLocation({ lat: place.lat, lng: place.lng });
    setSearchLocationName(place.name + (place.district ? `, ${place.district}` : ''));
    setIsMarkingLocation(true);
    addRecentSearch(place.name);
    onClose();
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
        >
          {/* Top Notch Header */}
          <View className="px-4 pt-3 pb-3 flex-row items-center justify-between z-10 bg-white shadow-sm border-b border-slate-100">
            <TouchableOpacity 
              onPress={onClose} 
              className="p-2 mr-1 rounded-full active:bg-slate-100"
              activeOpacity={0.6}
            >
              <Feather name="arrow-left" size={24} color="#1e293b" />
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <Feather name="search" size={20} color="#64748b" className="mr-3" />
              <TextInput
                className="flex-1 text-slate-800 text-base font-medium ml-2"
                placeholder="Where in Sri Lanka?"
                placeholderTextColor="#94a3b8"
                value={query}
                onChangeText={setQuery}
                autoFocus
                returnKeyType="search"
                selectionColor="#0ea5e9"
                autoCapitalize="words"
              />
              {loading ? (
                <ActivityIndicator size="small" color="#1e293b" />
              ) : query.length > 0 ? (
                <TouchableOpacity onPress={clearSearch} className="p-1 rounded-full bg-slate-200 ml-2">
                  <Feather name="x" size={14} color="#64748b" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Results List */}
          <FlatList
            data={places}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center px-6 py-4 bg-white active:bg-slate-50 border-b border-slate-50"
                onPress={() => handleSelectPlace(item)}
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center mr-4">
                  <Feather name="map-pin" size={20} color="#334155" />
                </View>
                
                <View className="flex-1 justify-center">
                  <Text className="text-slate-800 font-semibold text-[17px] mb-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-500 text-sm font-medium capitalize">
                      {item.type}
                    </Text>
                    {item.district && (
                      <>
                        <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
                        <Text className="text-slate-500 text-sm font-medium">{item.district} District</Text>
                      </>
                    )}
                  </View>
                </View>
                
                {(item.name_si || item.name_ta) && (
                  <View className="items-end pl-2">
                    {item.name_si && <Text className="text-slate-400 font-medium text-xs mb-1">{item.name_si}</Text>}
                    {item.name_ta && <Text className="text-slate-400 font-medium text-xs">{item.name_ta}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              !loading && query.length >= 2 ? (
                <View className="flex-1 items-center justify-center pt-20 px-8">
                  <View className="w-20 h-20 rounded-full bg-slate-50 items-center justify-center mb-6">
                    <Feather name="search" size={32} color="#cbd5e1" />
                  </View>
                  <Text className="text-slate-800 font-semibold text-lg mb-2 text-center">
                    No places found
                  </Text>
                  <Text className="text-slate-500 text-center leading-relaxed">
                    We couldn't find any results for "{query}". Try checking your spelling or searching for a different area.
                  </Text>
                </View>
              ) : !loading && query.length === 0 ? (
                <View className="flex-1 pt-8 px-6">
                  {/* Recent Searches Section */}
                  {recentSearches.length > 0 && (
                    <View className="mb-8">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-slate-400 font-bold text-sm tracking-wider uppercase">
                          Recent Searches
                        </Text>
                        <TouchableOpacity onPress={clearRecentSearches}>
                          <Text className="text-rose-500 text-sm font-semibold">Clear</Text>
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row flex-wrap">
                        {recentSearches.map((term) => (
                          <TouchableOpacity 
                            key={term} 
                            className="flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 mr-3 mb-3"
                            onPress={() => setQuery(term)}
                          >
                            <Feather name="clock" size={14} color="#64748b" className="mr-2" />
                            <Text className="text-slate-700 font-medium text-[15px]">{term}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Trending Searches Section */}
                  <Text className="text-slate-400 font-bold text-sm tracking-wider uppercase mb-4">
                    Trending Destinations 🔥
                  </Text>
                  {['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Ella', 'Mirissa'].map((city) => (
                    <TouchableOpacity 
                      key={city} 
                      className="flex-row items-center py-3 mb-1"
                      onPress={() => setQuery(city)}
                    >
                      <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-4">
                        <Feather name="trending-up" size={18} color="#94a3b8" />
                      </View>
                      <Text className="text-slate-700 font-semibold text-[16px]">{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null
            )}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
