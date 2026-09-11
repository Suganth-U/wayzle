import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useRouter } from "expo-router";
import { useAppStore } from '../../store/useAppStore';
import { CurrentLocationMarker } from './CurrentLocationMarker';
import { PulseMarker } from './PulseMarker';

let Map: any, Camera: any, Marker: any, ShapeSource: any, LineLayer: any;
if (Platform.OS !== 'web') {
  const MapLibre = require('@maplibre/maplibre-react-native');
  Map = MapLibre.Map;
  Camera = MapLibre.Camera;
  Marker = MapLibre.Marker;
  ShapeSource = MapLibre.ShapeSource;
  LineLayer = MapLibre.LineLayer;
}

// Fallback to Vavuniya testing coordinates
const DEFAULT_COORDS: [number, number] = [80.4971, 8.7514]; 

export const MapContainer = () => {
  const router = useRouter();
  const { isNavigating, currentLocation, destination, searchLocation, activeRouteCoordinates, activeRouteDuration, userProfile, isMarkingLocation, setIsMarkingLocation } = useAppStore();
  const cameraRef = React.useRef<any>(null);
  
  const centerCoordinate: [number, number] = searchLocation
    ? [searchLocation.lng, searchLocation.lat]
    : currentLocation 
      ? [currentLocation.coords.longitude, currentLocation.coords.latitude] 
      : DEFAULT_COORDS;

  React.useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.flyTo({
        center: centerCoordinate,
        zoom: searchLocation ? 15 : 14,
        duration: 1000
      });
    }
  }, [searchLocation, currentLocation, isNavigating]);

  const routeGeoJSON = activeRouteCoordinates ? {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: activeRouteCoordinates,
        },
      },
    ],
  } : null;

  const handleContinue = () => {
    router.push("/explore");
    setIsMarkingLocation(false);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        style={StyleSheet.absoluteFill}
        styleURL="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            zoom: 14,
            center: centerCoordinate,
            pitch: isNavigating ? 60 : 0,
          }}
        />

        {currentLocation && (
          <Marker
            id="currentLocationMarker"
            lngLat={[currentLocation.coords.longitude, currentLocation.coords.latitude]}
          >
            <CurrentLocationMarker 
              avatarUrl={userProfile?.avatarUrl || null} 
              fullName={userProfile?.fullName || null} 
            />
          </Marker>
        )}
        
        {destination && (
          <Marker
            id="destinationMarker"
            lngLat={[destination.lng_out, destination.lat_out]}
            anchor={{ x: 0.5, y: 1 }} // Anchor at bottom center so tooltip floats above the exact point
          >
            <View className="items-center">
              {activeRouteDuration && (
                <View className="bg-slate-900 px-3 py-1.5 rounded-full mb-1 shadow-md border border-slate-700">
                  <Text className="text-white text-xs font-bold">
                    {Math.round(activeRouteDuration / 60)} min
                  </Text>
                </View>
              )}
              <PulseMarker color="#FF0055" size={16} />
            </View>
          </Marker>
        )}

        {searchLocation && !destination && (
          <Marker
            id="searchLocationMarker"
            lngLat={[searchLocation.lng, searchLocation.lat]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <PulseMarker color="#0f172a" size={16} />
          </Marker>
        )}

        {activeRouteCoordinates && ShapeSource && LineLayer && (
          <ShapeSource id="routeSource" shape={routeGeoJSON}>
            <LineLayer
              id="routeLine"
              style={{
                lineColor: '#0f172a',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}
      </Map>

      {/* Continue / Explore button */}
      {isMarkingLocation && (
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={{
            position: 'absolute',
            bottom: 48,
            left: 20,
            right: 20,
            backgroundColor: '#ef4444',
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ color: 'white', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 }}>
            Explore this area →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
