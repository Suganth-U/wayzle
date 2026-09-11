const fs = require('fs');

const data = JSON.parse(fs.readFileSync('clean_places.json', 'utf8'));
const headers = ['osm_id', 'name', 'name_si', 'name_ta', 'type', 'lat', 'lng', 'district'];

let csv = headers.join(',') + '\n';

const escapeCsv = (str) => {
  if (str === null || str === undefined) return '';
  const stringified = String(str);
  if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
    return `"${stringified.replace(/"/g, '""')}"`;
  }
  return stringified;
};

data.forEach(row => {
  const rowData = headers.map(header => escapeCsv(row[header]));
  csv += rowData.join(',') + '\n';
});

fs.writeFileSync('clean_places.csv', csv);
console.log('Successfully converted to clean_places.csv!');
