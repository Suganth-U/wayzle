import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Alert, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../src/api/supabase';
import { useAppStore } from '../../src/store/useAppStore';

interface Profile {
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string;
  total_trips: number;
  total_distance_km: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { setUserProfile } = useAppStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || '');

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setEditName(data.full_name || '');
      // Sync to global store so SearchBar and Map can use it
      setUserProfile({
        avatarUrl: data.avatar_url,
        fullName: data.full_name,
      });
    }
  };

  const handlePickAvatar = async () => {
    if (isUploading) return;
    
    // On web, use a file input
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        await uploadAvatar(file);
      };
      input.click();
    } else {
      // For native, you'd use expo-image-picker here
      Alert.alert('Coming Soon', 'Photo picker is available on the mobile app.');
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Upload Failed', "We couldn't upload your photo right now. Please try again later.");
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        Alert.alert('Update Failed', "We couldn't save your new profile picture. Please try again later.");
        setIsUploading(false);
        return;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      setUserProfile({
        avatarUrl,
        fullName: profile?.full_name || null,
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      Alert.alert('Upload Failed', "Something went wrong. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !editName.trim()) return;

    await supabase
      .from('profiles')
      .update({ full_name: editName.trim() })
      .eq('id', user.id);

    setProfile(prev => prev ? { ...prev, full_name: editName.trim() } : prev);
    setUserProfile({
      avatarUrl: profile?.avatar_url || null,
      fullName: editName.trim(),
    });
    setIsEditingName(false);
    Alert.alert('Success', 'Name updated successfully!');
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          setUserProfile({ avatarUrl: null, fullName: null });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">Profile</Text>
        <Text className="text-slate-900 text-3xl font-bold mb-8">My Account</Text>

        {/* Avatar & Name */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.75} disabled={isUploading}>
            <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center mb-2 border-2 border-slate-200 overflow-hidden relative">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                  style={{ opacity: isUploading ? 0.5 : 1 }}
                />
              ) : (
                <Feather name="user" size={44} color="#94a3b8" style={{ opacity: isUploading ? 0.3 : 1 }} />
              )}
              
              {/* Uploading Spinner Overlay */}
              {isUploading && (
                <View className="absolute inset-0 items-center justify-center bg-black/20 rounded-full">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}
            </View>
            {/* Camera badge */}
            {!isUploading && (
              <View 
                className="absolute bottom-2 right-0 bg-slate-900 rounded-full items-center justify-center border-2 border-white"
                style={{ width: 32, height: 32 }}
              >
                <Feather name="camera" size={14} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {isEditingName ? (
            <View className="flex-row items-center mt-3">
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="text-slate-900 text-xl font-bold border-b-2 border-slate-300 px-2 py-1 min-w-[160px] text-center"
                autoFocus
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={handleSaveName} className="ml-3 p-2">
                <Feather name="check" size={20} color="#22c55e" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditingName(false)} className="ml-1 p-2">
                <Feather name="x" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)} className="flex-row items-center mt-3">
              <Text className="text-slate-900 text-xl font-bold">
                {profile?.full_name || 'Wayzle User'}
              </Text>
              <Feather name="edit-2" size={14} color="#94a3b8" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
          <Text className="text-slate-500 text-sm mt-1">{email}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around bg-white rounded-2xl py-6 px-4 shadow-sm border border-slate-100 mb-8">
          <View className="items-center">
            <Text className="text-slate-900 text-2xl font-bold">
              {profile?.total_trips || 0}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">Trips</Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-slate-900 text-2xl font-bold">
              {profile?.total_distance_km?.toFixed(0) || 0}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">km Traveled</Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-slate-900 text-2xl font-bold">0</Text>
            <Text className="text-slate-500 text-sm mt-1">Friends</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {[
            { icon: 'settings' as const, label: 'Settings' },
            { icon: 'bell' as const, label: 'Notifications' },
            { icon: 'moon' as const, label: 'Appearance' },
            { icon: 'help-circle' as const, label: 'Help & Support' },
          ].map((item, index) => (
            <Pressable
              key={item.label}
              className={`flex-row items-center px-5 py-4 ${
                index < 3 ? 'border-b border-slate-100' : ''
              }`}
            >
              <View className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center mr-4">
                <Feather name={item.icon} size={18} color="#475569" />
              </View>
              <Text className="text-slate-800 text-base font-medium flex-1">{item.label}</Text>
              <Feather name="chevron-right" size={18} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="mt-6 bg-white rounded-2xl py-4 items-center border border-red-100 flex-row justify-center"
        >
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
