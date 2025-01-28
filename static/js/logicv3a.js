// This version combines geoJSON files on "country"

// STEP 1: CREATE MAP

// Initialize the map
let myMap = L.map('map', {
  center: [30, 5],
  zoom: 2.5
});
 
// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// Create a layer for migration markers
let migrationLayer = L.layerGroup();
let populationLayer = L.layerGroup();
let choroplethLayer = L.layerGroup();

// Base maps definition
let baseMaps = {
  "Base Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  })
};

// Overlays that can be toggled on or off
let overlayMaps = {
  'Choropleth': choroplethLayer,
  'Net Migration Rate': migrationLayer,
  'Population Density in 2017': populationLayer
};

// Pass map layers into layer control.
// Add the layer control to the map.
let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Create a function to update overLayMaps dynamically
// ChatGPT and Xpert Learning Assistant supported
function updateLayerControl(newOverlayName, newOverlayLayer) {
  overlayMaps[newOverlayName] = newOverlayLayer;
  layerControl.remove(); // Remove the old control
  layerControl = L.control.layers(baseMaps, overlayMaps).addTo(myMap); // Add the updated control
}

// Create an outline for each country
let countriesGeoJSON = "static/data/geometry.geojson";
d3.json(countriesGeoJSON).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data).addTo(myMap);
});

// STEP 2: BUILD MIGRATION RATES LAYER USING MARKERS

// Function to determine marker size based on migration percentage
function markerSize(migrationPercentage) {
  return Math.max(5, Math.abs(migrationPercentage * 2)); 
}

// Function to slightly offset marker locations
// ChatGPT suggestion
function jitterCoordinate(coordinate) {
  let jitter = Math.random() * 0.0008 - 0.0004; // Jitter between -0.0004 and 0.0004
  return coordinate + jitter;
}

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
      // Multiply migration_perc by 1000 to get net migration rate and round
      let migration_perc = Math.round(((item.migration_perc*1000) + Number.EPSILON) *100)/100; 
        
      // Check for null values and provide default values
      if (lat == null || long == null) {
        console.warn("Missing coordinates for entry:", item);
        return; // Skip this entry or handle it as needed
        }
        
      // Add jitter to avoid complete overlap
      let jitteredLat = jitterCoordinate(lat);
      let jitteredLong = jitterCoordinate(long);

      // Create a circle marker for each feature
      let marker = L.circleMarker([jitteredLat, jitteredLong], {
        radius: markerSize(migration_perc), // Size based on migration percentage
        fillColor: "green", // Color of the marker
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
      }).bindPopup("Country: " + country + "<br>Year: " + year + "<br>Net Migration Rate: " + migration_perc);
        
      migrationLayer.addLayer(marker);
    });

    // Now add the migrationLayer to the map after it has been populated
    migrationLayer.addTo(myMap);
  })
    .catch(function(error) {
      console.error("Error loading migration data:", error);
  });
  

// STEP 3: BUILD POPULATION DENSITY LAYER TO SHOW CHOROPLETH MAP
// Load both GeoJSON files
// ChatGPT showed the code for combing GeoJSON files

// Color scale function based on population density
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

// Fetch geometry data
fetch('static/data/geometry.geojson')
  .then(response => response.json())
  .then(geometryData => {

// Fetch gop_density data
    fetch('static/data/pop_density.geojson')
      .then(response => response.json())
      .then(popDensityData => {

        // combine datasets
        combineData(geometryData, popDensityData);
      })
      .catch(error => console.error('Error loading population density data:', error));
  })
  .catch(error => console.error('Error loading geometry data:', error));

// Function to combine the geometry and population density data
function combineData(geometryData, popDensityData) {

  // Create a lookup for population density data by country
  const popDensityLookup = popDensityData.features.reduce((acc, feature) => {
    const country = feature.properties.country;
    acc[country] = feature.properties.pop_density;
    return acc;
  }, {});

  // Add population density to the geometry data
  geometryData.features.forEach(feature => {
    const country = feature.properties.country;
    const density = popDensityLookup[country];
    feature.properties.pop_density = density !== undefined ? density : null;
  });

  // Render the map with the combined data
  renderMap(geometryData);
}

// Function to render the map with population density styling
function renderMap(geometryData) {

  // Style function
  function style(feature) {
    const density = feature.properties.pop_density;
    return {
      fillColor: getColor(density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  // Add GeoJSON layer to the map
  L.geoJson(geometryData, {
    style: style,
    onEachFeature: function (feature, layer) {
      const density = feature.properties.pop_density;
      layer.bindPopup(`${feature.properties.country}: ${Math.round(density)} people/km²`);
    }
  }).addTo(myMap);
}

// Add a legend for choropleth map
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 10, 20, 50, 100, 200, 300, 500];
  const colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

  // Loop through density intervals and generate legend labels
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += '<i style="background:' + colors[i] + '"></i> ' + 
                     grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(myMap);

// STEP 4: BUILD INTERACTIVE DROPDOWN MENU TO SHOW DENSITY BY YEAR
// Specify target year 
const targetYear = "2017";

// Function to load population density data for a specific year
function loadPopulationDensity(year) {
  fetch('static/data/pop_density.geojson')
    .then(response => response.json())
    .then(popDensityData => {

    // Filter for features by year
    const filteredData = {
      "type": "FeatureCollection",
      "features": popDensityData.features.filter(feature => feature.properties.year === year)
    };

    // Remove existing population layer if it exists
    if (populationLayer) {
      myMap.removeLayer(populationLayer);
    }
    
    // Recreate a GeoJSON layer with filtered data
    populationLayer = L.geoJson(filteredData, {
      style: function(feature) {
        const density = feature.properties.pop_density;
        return {
          fillColor: getColor(density),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        }
      },
      onEachFeature: function(feature, layer) {
        const density = feature.properties.pop_density;
        layer.bindPopup(`${feature.properties.country}: ${Math.round(feature.properties.pop_density)} people/km²`);
      }
});

    // Add the new layer
    populationLayer.addTo(myMap);
  
    // Update overlayMaps for layer control
    updateLayerControl(`Population Density in ${year}`, populationLayer);
  })
  .catch(error => console.error("Error loading population density data:", error));
}

// initial load for the default year
loadPopulationDensity(targetYear);

// Add event listener for year selection
document.getElementById('yearSelect').addEventListener('change', function() {
  const selectedYear = this.value;
  loadPopulationDensity(selectedYear);
});