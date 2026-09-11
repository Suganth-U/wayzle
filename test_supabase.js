const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
  const { data, error } = await supabase.rpc('get_places_nearby', {
    lat: 8.7514,
    lng: 80.4971,
    radius_meters: 10000,
    filter_category: null
  });
  console.log("Error:", error);
  console.log("Data length:", data?.length);
  if (data?.length > 0) console.log("First item:", data[0].name);
})();
