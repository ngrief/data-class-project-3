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

// Function to draw the country
function drawCountry(countries) {
  L.geoJson(countries, {
    style: function(feature) {
      return {
        color: 'black',
        weight: 1,
        fillOpacity: .5
      };
    }
  }).addTo(myMap);
}

// Getting our GeoJSON data
d3.json(countries).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data).addTo(myMap);
});
  
// Function to determine marker size based on migration percentage
function markerSize(migrationPercentage) {
  return Math.abs(migrationPercentage * 5); 
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
      // Multiply migration_perc by 1000 to get net migration rate and round
      let migration_perc = Math.round(((item.migration_perc*1000) + Number.EPSILON) *100)/100; 
       
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
let popDensityData = "resources/data_files/top10country_population.geojson";

// Function to shade by popluation density
function shadeByPopDensity(countries, popDensityData) {
  L.geoJson(countries, {
    style: function(feature) {
      const density = popDensityData[feature.properties.country] || 0;
      return {
        fillColor: getColor(density),
        weight: 1,
        opacity: 1,
        fillOpacity: .7
      };
    }
  }).addTo(myMap);
}

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

drawCountry(countries);
shadeByPopDensity(countries, poplulationDensityData);

// // function to style the polygon
// function style(feature) {
//   console.log(feature.properties.pop_density); // check values
//   return {
//     fillColor: chooseColor(feature.properties.pop_density),
//     weight: 2,
//     opacity: 1,
//     color: 'white',
//     dashArray: '3',
//     fillOpacity: .7
//   };
// }

// Specify target year 
const targetYear = "2017";

// Function to load population density data for a specific year
function loadPopulationDensity(year) {

  //Get GeoJSON data
  d3.json(popDensityData).then(function(data) {
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
      layer.bindPopup(`${feature.properties.country}: ${Math.round(feature.properties.pop_density)} people/km²`);
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