import { useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useAppStore } from '../store/useAppStore';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Task Manager Error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // TODO: Sync to Supabase active_trips table here
    console.log('Background location update:', locations[0]);
  }
});

export const useLocation = () => {
  const { setCurrentLocation } = useAppStore();

  useEffect(() => {
    (async () => {
      try {
        const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
        if (fgStatus !== 'granted') return;

        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);

        try {
          const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
          if (bgStatus === 'granted') {
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
              showsBackgroundLocationIndicator: true,
              foregroundService: {
                notificationTitle: 'Wayzle Navigation',
                notificationBody: 'Sharing your live location...',
                notificationColor: '#FF0055',
              },
            });
          }
        } catch (bgError) {
          console.log('Background location not configured in this build. Skipping.', bgError);
        }
      } catch (error) {
        console.warn('Location access denied or failed, using fallback coordinates.', error);
        // Set fallback coordinates (Colombo, Sri Lanka) so the avatar marker still renders
        setCurrentLocation({
          coords: {
            latitude: 6.9271,
            longitude: 79.8612,
            altitude: null,
            accuracy: 100,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }
    })();
  }, [setCurrentLocation]);
};
