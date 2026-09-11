import './global.css';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MapContainer } from './src/components/map/MapContainer';
import { DiscoverySheet } from './src/components/ui/DiscoverySheet';
import { useLocation } from './src/hooks/useLocation';

export default function App() {
  useLocation();

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-background">
        <MapContainer />
        <DiscoverySheet />
        <StatusBar style="dark" />
      </View>
    </GestureHandlerRootView>
  );
}
