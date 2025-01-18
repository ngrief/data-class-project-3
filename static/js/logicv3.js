// This file will use L.geojson to outline countries
// Only uses data from 10 countries with highest migration percentages
// Uses a fetch function for both the migration markers and population density maps
// logic.js uses separate fetch functions (one for markers and one for choropleth)

// Initialize the map
let myMap = L.map('map', {
  center: [0, 0],
  zoom: 3
});
 
// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// Use file to get GeoJSON country outlines
let countries = "resources/data_files/10countries_outline.geojson";

// Getting our GeoJSON data
d3.json(countries).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data).addTo(myMap);
});
  
// Function to determine marker size based on migration percentage
function markerSize(migrationPercentage) {
  return Math.abs(migrationPercentage * 2000); 
}

// Create a layer for migration markers
let migrationLayer = L.layerGroup();
let populationLayer = L.layerGroup();

// Load the local GeoJSON data for migration percentage
fetch('resources/data_files/migration_data.json')
  .then(response => response.json())
  .then(migrationData => {

    migrationData.forEach(item => {
      // extract variables
      let lat = item.latitude;
      let long = item.longitude; 
      let country = item.country;
      let year = item.year;
      let migration_perc = item.migration_perc;
        
      // Check for null values and provide default values
      if (lat == null || long == null) {
        console.warn("Missing coordinates for entry:", item);
        return; // Skip this entry or handle it as needed
        }
        
      // Create a circle marker for each feature
      let marker = L.circleMarker([lat, long], {
        radius: markerSize(migration_perc), // Size based on migration percentage
        fillColor: "green", // Color of the marker
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
      }).bindPopup("Country: " + country + "<br>Year: " + year + "<br>Migration Percentage: " + migration_perc);
  
      migrationLayer.addLayer(marker);
    });

    // Now add the migrationLayer to the map after it has been populated
    migrationLayer.addTo(myMap);
  })
  .catch(function(error) {
      console.error("Error loading migration data:", error);
  });

// Load population density data
let populationDensityData = "resources/data_files/top10country_population.geojson";

// Function to determine color for population density
function chooseColor(pop_density) {
  if (pop_density == undefined || pop_density === null) return "#FFFFFF";
  return pop_density > 700 ? "#800026" :
  pop_density > 500 ? "#BD0026" :
  pop_density > 300 ? "#E31A1C" :
  pop_density > 100  ? "#FC4E2A" :
  pop_density > 75  ? "#FD8D3C" :
  pop_density > 50  ? "#FEB24C" :
  pop_density > 30   ? "#FED976" :
  "#FFEDA0";
}

// Specify target year
const targetYear = "2017";

//Get GeoJSON data
d3.json(populationDensityData).then(function(data) {
  console.log(data);

  // Filter for features
  const filteredData = {
    "type": "FeatureCollection",
    "features": data.features
    .filter(feature => feature.properties.year === targetYear)
  };

  console.log(filteredData.features);

  // Create a GeoJSON layer with retrieved data
  let populationGeoJsonLayer = L.geoJson(filteredData, {
    style: function(feature) {
      return {
        color: "red",
        fillColor: chooseColor(feature.properties.pop_density),
        fillOpacity: .5,
        weight: 1.5
      };
    },
  
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`${feature.properties.country}: ${feature.properties.pop_density} people/km²`);
    }
  }).addTo(populationLayer);

  // Add populationLayer to map
  populationLayer.addTo(myMap);

}).catch(function(error) {
  console.error("Error loading population density data:", error);
});

// Base maps definition
let baseMaps = {
  "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  })
};

// Overlays that can be toggled on or off
let overlayMaps = {
  'Migration': migrationLayer,
  'Population Density in  2017': populationLayer
};

// Pass our map layers into our layer control.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps).addTo(myMap);