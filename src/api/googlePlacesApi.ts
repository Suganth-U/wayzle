export const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 'AIzaSyCbwEUyI-viZNGyPa11-fioQgApmttLCe4';

export const getPlacePhotoUrl = (photoReference: string, maxWidth: number = 400) => {
  if (!photoReference) return null;
  return `https://places.googleapis.com/v1/${photoReference}/media?key=${API_KEY}&maxHeightPx=${maxWidth}&maxWidthPx=${maxWidth}`;
};

export const searchNearbyPlaces = async (
  lat: number, 
  lng: number, 
  radiusMeters: number = 3000, 
  includedTypes: string[] = []
) => {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  
  const body: any = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
  };
  
  if (includedTypes.length > 0) {
    body.includedTypes = includedTypes;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY || '',
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.types,places.photos,places.currentOpeningHours,places.priceLevel,places.websiteUri'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

export const getPlaceDetails = async (placeId: string) => {
  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': API_KEY || '',
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,primaryType,types,photos,currentOpeningHours,editorialSummary,reviews,priceLevel,websiteUri,internationalPhoneNumber'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places Details API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};
