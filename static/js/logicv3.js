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
let countries = "static/data/10countries_outline.geojson";

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
fetch('static/data/migration_data.json')
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
let populationDensityData = "static/data/top10country_population.geojson";

// Function to determine the color based on population density
function getColor(density) {
  return density > 500 ? '#800026' :
         density > 300 ? '#BD0026' :
         density > 200 ? '#E31A1C' :
         density > 100 ? '#FC4E2A' :
         density > 50  ? '#FD8D3C' :
         density > 20  ? '#FEB24C' :
         density > 10  ? '#FED976' :
                         '#FFEDA0';
}

// function to style the polygon
function style(feature) {
  console.log(feature.properties.pop_density); // check values
  return {
    fillColor: getColor(feature.properties.pop_density),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: .7
  };
}

// Specify target year 
const targetYear = "2017";

// Function to load population density data for a specific year
function loadPopulationDensity(year) {

  //Get GeoJSON data
  d3.json(populationDensityData).then(function(data) {
    console.log(data);

  // Filter for features
  const filteredData = {
    "type": "FeatureCollection",
    "features": data.features
    .filter(feature => feature.properties.year === year)
  };

  console.log(filteredData.features.length);

  // Remove existing population layer if it exists
  if (populationLayer) {
    myMap.removeLayer(populationLayer);
    delete overlayMaps['Population Density in ' + (targetYear === year ? '2017' : targetYear)];
  }

  // Create a GeoJSON layer with retrieved data
 populationLayer = L.geoJson(filteredData, {
    style: style,
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`${feature.properties.country}: ${feature.properties.pop_density} people/km²`);
      }
    
  }).addTo(myMap);

  // Update overlayMaps for layer control
  overlayMaps['Population Density in ' + year] = populationLayer;

  // Re-add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

}).catch(function(error) {
  console.error("Error loading population density data:", error);
});

}

// initial load for the default year
loadPopulationDensity(targetYear);

// Add event listener for year selection
document.getElementById('yearSelect').addEventListener('change', function() {
  const selectedYear = this.value;
  loadPopulationDensity(selectedYear);
});

// Base maps definition
let baseMaps = {
  "Base Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  })
};

// Overlays that can be toggled on or off
let overlayMaps = {
  'Migration': migrationLayer,
  'Population Density in 2017': populationLayer
};

// Pass our map layers into our layer control.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps).addTo(myMap);