// This file will use L.geojson to outline countries
// Only uses data from 10 countries with highest migration percentages
// Uses a fetch function for both the markers and choropleth maps
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
  return Math.abs(10, migrationPercentage * 75); // Adjust scaling as needed
}

// Create a layer for migration markers
let migrationMarkers = L.layerGroup();

// Load migation data
let migrationData = "resources/data_files/migration_data.json";

d3.json(migrationData).then(function(data) {
  console.log(data);
  data.forEach(item => {
    L.circleMarker([item.latitude, item.longitude], {
      radius: markerSize(item.migration_perc),
      fillColor: "green",
      color: "white",
      weight: 1, 
      opacity: 1,
      fillOpacity: .6
    })
    .bindPopup(
      `<b>Country:</b> ${item.country}<br>` +
      `<b>Year: </b> ${item.year}<br>` +
      `<b>Migration %:</b> ${item.migration_perc}`
    )
    .addTo(myMap);
  });
}).catch(function(error) {
  console.error("Error loading migration data:", error);
});

// Load population density data
let populationDensityData = "resources/data_files/top10country_population.geojson";
d3.json(populationDensityData).then(function(data) {
  // Create a choropleth layer
  let geojson = L.choropleth(data, {
    valueProperty:'pop_density',
    scale: ['#ffffb2', '#b10026'],
    steps: 10,
    mode: 'q', 
    style: {
      color: '#fff',
      weight: 1, 
      fillOpacity: .8
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`${feature.properties.country}: ${feature.properties.pop_density} people/km²`);
    }
  }).addTo(myMap);

}).catch(function(error) {
  console.error("Error loading population density data:", error);
});
  
  // // Function to determine color for population density
  // function getColor(density) {
  //   return density > 500 ? "#800026" :
  //          density > 200 ? "#BD0026" :
  //          density > 100 ? "#E31A1C" :
  //          density > 50  ? "#FC4E2A" :
  //          density > 20  ? "#FD8D3C" :
  //          density > 10  ? "#FEB24C" :
  //          density > 0   ? "#FED976" :
  //                          "#FFEDA0";
  // }