import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MapContainer } from '../../src/components/map/MapContainer';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { LocationSearchModal } from '../../src/components/ui/LocationSearchModal';
import { useLocation } from '../../src/hooks/useLocation';
import { useAppStore } from '../../src/store/useAppStore';
import { supabase } from '../../src/api/supabase';

export default function HomeScreen() {
  useLocation();
  const { setUserProfile } = useAppStore();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setUserProfile({
          avatarUrl: data.avatar_url,
          fullName: data.full_name,
        });
      }
    };
    loadUserProfile();
  }, [setUserProfile]);

  return (
    <View className="flex-1 bg-background">
      <MapContainer />

      {/* Search Bar Overlay */}
      <View className="absolute top-14 left-5 right-5 z-10" pointerEvents="box-none">
        <SearchBar 
          onPress={() => setSearchModalVisible(true)}
        />
      </View>

      <LocationSearchModal 
        visible={searchModalVisible} 
        onClose={() => setSearchModalVisible(false)} 
      />
    </View>
  );
}
