import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, Modal, SafeAreaView, Platform } from 'react-native';
import { getPlacePhotoUrl } from '../../api/googlePlacesApi';
import { Feather } from '@expo/vector-icons';

interface PhotoGalleryProps {
  photos: any[];
}

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// Because we might be centered on Web (e.g. max-width: 480px)
// we should just use percentages for width, and a calculated baseHeight.
// However, to make perfect squares, we can estimate container width if on Web.
const containerWidth = Platform.OS === 'web' ? Math.min(windowWidth, 600) : windowWidth;
const baseSize = containerWidth / 3;

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!photos || photos.length === 0) {
    return (
      <View style={{ width: '100%', height: 280 }} className="bg-slate-200 items-center justify-center">
        <Text className="text-slate-400">No photos available</Text>
      </View>
    );
  }

  const displayPhotos = photos.slice(0, 10); // Exactly 10 photos

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (modalVisible && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
      }, 100);
    }
  }, [modalVisible, selectedIndex]);

  const renderBentoGrid = () => {
    if (displayPhotos.length === 1) {
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(0)} style={{ width: '100%', height: baseSize * 2 }}>
          <Image source={{ uri: getPlacePhotoUrl(displayPhotos[0].name, 800) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </TouchableOpacity>
      );
    }
    
    if (displayPhotos.length === 2) {
      return (
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(0)} style={{ width: '50%', height: baseSize * 1.5 }}>
            <Image source={{ uri: getPlacePhotoUrl(displayPhotos[0].name, 600) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(1)} style={{ width: '50%', height: baseSize * 1.5 }}>
            <Image source={{ uri: getPlacePhotoUrl(displayPhotos[1].name, 600) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ width: '100%' }}>
        {/* ROW 1 (Items 0, 1, 2) - 1 Large Left, 2 Small Right */}
        <View style={{ flexDirection: 'row', height: baseSize * 2 }}>
          {displayPhotos[0] && (
            <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(0)} style={{ width: '66.666%' }}>
              <Image source={{ uri: getPlacePhotoUrl(displayPhotos[0].name, 800) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </TouchableOpacity>
          )}
          <View style={{ width: '33.333%', flexDirection: 'column' }}>
            {displayPhotos[1] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(1)} style={{ height: baseSize }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[1].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {displayPhotos[2] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(2)} style={{ height: baseSize }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[2].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ROW 2 (Items 3, 4) - 1 Small Left, 1 Wide Right */}
        {displayPhotos.length > 3 && (
          <View style={{ flexDirection: 'row', height: baseSize }}>
            {displayPhotos[3] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(3)} style={{ width: '33.333%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[3].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {displayPhotos[4] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(4)} style={{ width: '66.666%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[4].name, 800) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ROW 3 (Items 5, 6, 7) - 3 Small squares */}
        {displayPhotos.length > 5 && (
          <View style={{ flexDirection: 'row', height: baseSize }}>
            {displayPhotos[5] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(5)} style={{ width: '33.333%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[5].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {displayPhotos[6] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(6)} style={{ width: '33.333%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[6].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {displayPhotos[7] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(7)} style={{ width: '33.333%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[7].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ROW 4 (Items 8, 9) - 1 Wide Left, 1 Small Right */}
        {displayPhotos.length > 8 && (
          <View style={{ flexDirection: 'row', height: baseSize }}>
            {displayPhotos[8] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(8)} style={{ width: '66.666%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[8].name, 800) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {displayPhotos[9] && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openModal(9)} style={{ width: '33.333%' }}>
                <Image source={{ uri: getPlacePhotoUrl(displayPhotos[9].name, 400) || undefined }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View>
      {renderBentoGrid()}

      {/* Full-Screen Modal Overlay */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-row justify-between items-center px-4 py-2 absolute top-10 left-0 right-0 z-10" pointerEvents="box-none">
              <TouchableOpacity 
                onPress={closeModal} 
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              >
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
              <View className="bg-black/50 px-3 py-1 rounded-full">
                <Text className="text-white font-bold">
                  {selectedIndex + 1} / {displayPhotos.length}
                </Text>
              </View>
            </View>

            <FlatList
              ref={flatListRef}
              data={displayPhotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.name || index.toString()}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
                setSelectedIndex(index);
              }}
              getItemLayout={(data, index) => ({
                length: windowWidth,
                offset: windowWidth * index,
                index,
              })}
              renderItem={({ item }) => {
                const url = getPlacePhotoUrl(item.name, 1000);
                return (
                  <View style={{ width: windowWidth, flex: 1, justifyContent: 'center' }}>
                    <Image
                      source={{ uri: url || undefined }}
                      style={{ width: windowWidth, height: windowHeight * 0.7 }}
                      resizeMode="contain"
                    />
                  </View>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};
