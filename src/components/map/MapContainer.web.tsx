import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from "expo-router";
import { useAppStore } from '../../store/useAppStore';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { setWorkerUrl } from 'maplibre-gl';
import { CurrentLocationMarker } from './CurrentLocationMarker';

setWorkerUrl('https://unpkg.com/maplibre-gl@6.8.0/dist/maplibre-gl-worker.mjs');

// Inject pulse animation CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

const DEFAULT_COORDS: [number, number] = [80.4971, 8.7514]; 

const osmStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

// Reverse geocode using free Nominatim (OpenStreetMap)
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      // Build a readable name from the address parts
      const parts: string[] = [];
      
      // Get the most specific local area
      if (a.road || a.pedestrian || a.neighbourhood || a.suburb) {
        parts.push(a.road || a.pedestrian || a.neighbourhood || a.suburb);
      }
      // Get the broader area (city, town, village)
      if (a.city || a.town || a.village) {
        parts.push(a.city || a.town || a.village);
      } else if (a.county || a.state_district) {
        // Fallback to district if no city is found
        parts.push(a.county || a.state_district);
      }
      
      if (parts.length === 0 && data.display_name) {
        return data.display_name.split(',').slice(0, 2).join(',').trim();
      }
      
      // If we only got one part, and it's short, try to append the country if it looks empty
      return parts.join(', ');
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.warn('Reverse geocoding failed', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export const MapContainer = () => {
  const { 
    isNavigating, currentLocation, destination, searchLocation, isMarkingLocation, activeRouteCoordinates,
    setSearchLocation, setSearchLocationName, setIsMarkingLocation, userProfile
  } = useAppStore();
  
  const mapRef = React.useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const centerCoordinate: [number, number] = useMemo(() => {
    if (searchLocation) {
      return [searchLocation.lng, searchLocation.lat];
    }
    return currentLocation 
      ? [currentLocation.coords.longitude, currentLocation.coords.latitude] 
      : DEFAULT_COORDS;
  }, [currentLocation, searchLocation]);

  React.useEffect(() => {
    if (mapRef.current && !isDragging) {
      mapRef.current.flyTo({
        center: centerCoordinate,
        zoom: searchLocation ? 15 : 14,
        duration: 1500
      });
    }
  }, [centerCoordinate, isDragging]);

  const handleMarkerDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMarkerDragEnd = useCallback(async (event: any) => {
    const { lng, lat } = event.lngLat;
    setSearchLocation({ lat, lng });
    setIsDragging(false);
    setIsGeocoding(true);
    
    const name = await reverseGeocode(lat, lng);
    setSearchLocationName(name);
    setIsGeocoding(false);
  }, [setSearchLocation, setSearchLocationName]);

  const handleUseMyLocation = () => {
    if (currentLocation) {
      setSearchLocation(null);
      setSearchLocationName(null);
      router.push("/explore");
    setIsMarkingLocation(false);
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [currentLocation.coords.longitude, currentLocation.coords.latitude],
          zoom: 14,
          duration: 1500
        });
      }
    }
  };

  const router = useRouter();

  const handleContinue = () => {
    router.push("/explore");
    setIsMarkingLocation(false);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: centerCoordinate[0],
          latitude: centerCoordinate[1],
          zoom: searchLocation ? 15 : 14,
          pitch: isNavigating ? 60 : 0,
        }}
        mapStyle={osmStyle as any}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Current Location — User Avatar or Blue Dot */}
        {currentLocation && (
          <Marker
            longitude={currentLocation.coords.longitude}
            latitude={currentLocation.coords.latitude}
            anchor="center"
          >
            <CurrentLocationMarker 
              avatarUrl={userProfile?.avatarUrl || null} 
              fullName={userProfile?.fullName || null} 
            />
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            longitude={destination.lng_out}
            latitude={destination.lat_out}
            anchor="bottom"
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#FF0055',
              border: '3px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }} />
          </Marker>
        )}

        {/* Draggable Search Location — Red Pin */}
        {searchLocation && !destination && (
          <Marker
            longitude={searchLocation.lng}
            latitude={searchLocation.lat}
            anchor="bottom"
            draggable={true}
            onDragStart={handleMarkerDragStart}
            onDragEnd={handleMarkerDragEnd}
          >
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'transform 0.15s ease',
                transform: isDragging ? 'scale(1.15) translateY(-8px)' : 'scale(1)',
                filter: isDragging ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
              }}
            >
              {/* SVG Red Pin */}
              <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Pin body */}
                <path d="M20 0C9 0 0 9 0 20C0 35 20 52 20 52C20 52 40 35 40 20C40 9 31 0 20 0Z" fill="#EF4444"/>
                {/* Inner shadow */}
                <path d="M20 0C9 0 0 9 0 20C0 35 20 52 20 52C20 52 40 35 40 20C40 9 31 0 20 0Z" fill="url(#gradient)"/>
                {/* White circle center */}
                <circle cx="20" cy="18" r="8" fill="white"/>
                <circle cx="20" cy="18" r="4" fill="#EF4444"/>
                <defs>
                  <linearGradient id="gradient" x1="20" y1="0" x2="20" y2="52" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0.2"/>
                    <stop offset="1" stopColor="black" stopOpacity="0.15"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </Marker>
        )}

        {/* Route Polyline */}
        {activeRouteCoordinates && (
          <Source
            id="routeSource"
            type="geojson"
            data={{
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
            }}
          >
            <Layer
              id="routeLine"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
              paint={{
                'line-color': '#0ea5e9',
                'line-width': 5,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Geocoding indicator — shows while resolving address */}
      {isGeocoding && (
        <View style={{
          position: 'absolute',
          top: 100,
          alignSelf: 'center',
          backgroundColor: 'rgba(0,0,0,0.75)',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="small" color="white" />
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '600', marginLeft: 8 }}>
            Finding location...
          </Text>
        </View>
      )}

      {/* Drag hint when marking */}
      {isMarkingLocation && !isDragging && !isGeocoding && (
        <View style={{
          position: 'absolute',
          top: 100,
          alignSelf: 'center',
          backgroundColor: 'rgba(0,0,0,0.75)',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
        }}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
            Drag the pin to adjust location
          </Text>
        </View>
      )}

      {/* "Use My Location" button */}
      {currentLocation && (
        <TouchableOpacity 
          onPress={handleUseMyLocation}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            right: 20,
            bottom: isMarkingLocation ? 120 : 200,
            backgroundColor: 'white',
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}
        >
          <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', width: 22, height: 2, backgroundColor: '#1e293b', borderRadius: 1 }} />
            <View style={{ position: 'absolute', width: 2, height: 22, backgroundColor: '#1e293b', borderRadius: 1 }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: '#1e293b', backgroundColor: 'transparent' }} />
          </View>
        </TouchableOpacity>
      )}

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
