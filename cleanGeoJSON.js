const fs = require('fs');

console.log("Reading export.geojson...");
const rawData = JSON.parse(fs.readFileSync('export.geojson', 'utf8'));

const cleanPlaces = [];

rawData.features.forEach(feature => {
  if (feature.properties && feature.properties.name) {
    // Extract district if available in the tags
    let district = feature.properties['is_in:district'] || null;
    if (!district && feature.properties['is_in']) {
      // Fallback: sometimes "is_in" is formatted as "Badulla District;Uva Province;Sri Lanka"
      const parts = feature.properties['is_in'].split(';');
      district = parts.find(p => p.toLowerCase().includes('district')) || parts[0];
    }

    cleanPlaces.push({
      osm_id: feature.id.replace('node/', '').replace('way/', '').replace('relation/', ''),
      name: feature.properties.name,
      name_si: feature.properties['name:si'] || null,
      name_ta: feature.properties['name:ta'] || null,
      type: feature.properties.place,
      lat: feature.geometry.coordinates[1], // GeoJSON coordinates are [longitude, latitude]
      lng: feature.geometry.coordinates[0],
      district: district
    });
  }
});

fs.writeFileSync('clean_places.json', JSON.stringify(cleanPlaces, null, 2));
console.log(`Successfully cleaned and extracted ${cleanPlaces.length} places!`);
