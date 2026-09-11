import React, { useState } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePlacesSearch, Place } from '../../hooks/usePlacesSearch';

interface LocationSelectorProps {
  onSelectPlace: (place: Place) => void;
  placeholder?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onSelectPlace, 
  placeholder = "Search for a city, town, or village..." 
}) => {
  const [query, setQuery] = useState('');
  const { places, loading } = usePlacesSearch(query);

  const handleSelect = (place: Place) => {
    setQuery(place.name); // Fill input with selected name
    onSelectPlace(place);
  };

  return (
    <View className="w-full relative z-50">
      {/* Search Input */}
      <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-12 shadow-sm">
        <Text className="text-slate-400 mr-2">📍</Text>
        <TextInput
          className="flex-1 text-base text-slate-800"
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="#FF0055" />}
      </View>

      {/* Search Results Dropdown */}
      {query.length >= 2 && places.length > 0 && (
        <View className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-100 max-h-64 overflow-hidden z-50">
          <FlatList
            data={places}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="px-4 py-3 border-b border-slate-50 active:bg-slate-50 flex-row items-center justify-between"
                onPress={() => handleSelect(item)}
              >
                <View>
                  <Text className="text-slate-800 font-semibold text-base">
                    {item.name}
                  </Text>
                  {/* Show district if available, otherwise just type */}
                  <Text className="text-slate-500 text-sm capitalize mt-0.5">
                    {item.type} {item.district ? `• ${item.district}` : ''}
                  </Text>
                </View>
                
                {/* Optional: Show Sinhala/Tamil names if you want */}
                {(item.name_si || item.name_ta) && (
                  <View className="items-end">
                    {item.name_si && <Text className="text-slate-400 text-xs">{item.name_si}</Text>}
                    {item.name_ta && <Text className="text-slate-400 text-xs">{item.name_ta}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* No Results State */}
      {query.length >= 2 && !loading && places.length === 0 && (
        <View className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-50">
          <Text className="text-slate-500 text-center">No locations found for "{query}"</Text>
        </View>
      )}
    </View>
  );
};
