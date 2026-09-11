const ORS_API_KEY = process.env.EXPO_PUBLIC_OPENROUTESERVICE_KEY;

export const getRoutePolyline = async (start: [number, number], end: [number, number]) => {
  try {
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('ORS Route Error:', err);
    return null;
  }
};
