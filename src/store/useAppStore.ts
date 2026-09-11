import { create } from 'zustand';
import { LocationObject } from 'expo-location';

export interface Place {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  rating?: number;
  reviews_count?: number;
  vibe_tags?: string[];
  is_open_now?: boolean;
  active_users_count?: number;
  distance_meters?: number;
  lat_out: number;
  lng_out: number;
}

export interface UserProfile {
  avatarUrl: string | null;
  fullName: string | null;
}

interface AppState {
  // Location
  currentLocation: LocationObject | null;
  setCurrentLocation: (location: LocationObject) => void;
  
  searchLocation: { lat: number; lng: number } | null;
  setSearchLocation: (location: { lat: number; lng: number } | null) => void;
  searchLocationName: string | null;
  setSearchLocationName: (name: string | null) => void;
  isMarkingLocation: boolean;
  setIsMarkingLocation: (isMarking: boolean) => void;

  // Navigation
  destination: Place | null;
  setDestination: (dest: Place | null) => void;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  activeRouteCoordinates: number[][] | null;
  setActiveRouteCoordinates: (coords: number[][] | null) => void;
  activeRouteDuration: number | null;
  setActiveRouteDuration: (duration: number | null) => void;

  // Category filter
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // User profile
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;

  // Searches
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  searchLocation: null,
  setSearchLocation: (location) => set({ searchLocation: location }),
  searchLocationName: null,
  setSearchLocationName: (name) => set({ searchLocationName: name }),
  isMarkingLocation: false,
  setIsMarkingLocation: (isMarking) => set({ isMarkingLocation: isMarking }),

  destination: null,
  setDestination: (dest) => set({ destination: dest }),

  isNavigating: false,
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  activeRouteCoordinates: null,
  setActiveRouteCoordinates: (coords) => set({ activeRouteCoordinates: coords }),
  activeRouteDuration: null,
  setActiveRouteDuration: (duration) => set({ activeRouteDuration: duration }),

  selectedCategory: 'all',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  userProfile: { avatarUrl: null, fullName: null },
  setUserProfile: (profile) => set({ userProfile: profile }),

  recentSearches: [],
  addRecentSearch: (search) => set((state) => {
    // Only keep unique recent searches, put the new one at the front
    const updated = [search, ...state.recentSearches.filter(s => s !== search)].slice(0, 5);
    return { recentSearches: updated };
  }),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
