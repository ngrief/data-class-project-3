// Initialize the map
let myMap = L.map('map', {
    center: [0, 0],
    zoom: 3
  });
  
  // Add a tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(myMap);
  
  // Function to determine marker size based on migration percentage
  function markerSize(migrationPercentage) {
    return Math.abs(migrationPercentage * 2000); // Adjust scaling as needed
  }
  
  // Predefined country-to-color mapping
  const countryColors = {
    "United Kingdom": "green",
    "China": "blue",
    "India": "orange",
    "Mexico": "purple",
    "Poland": "red",
    "Ukraine": "yellow",
    "Russia": "cyan",
    "Pakistan": "pink",
    "Bangladesh": "black",
    "Philippines": "lime"
  };
  
  // Default color for countries not listed
  const defaultColor = "gray";
  
  // Function to determine the color for a country
  function countryColor(country) {
    return countryColors[country] || defaultColor; // Return specific color or default if not found
  }
  
  // Create layers for overlays
  let migrationCircleLayer = L.layerGroup();
  let migrationMarkerLayer = L.layerGroup();
  let geoJsonLayer;
  
  // Load migration data for circle markers and standard markers
  fetch('resources/data_files/migration_data.json')
    .then(response => response.json())
    .then(migrationData => {
      migrationData.forEach(item => {
        let { latitude, longitude, migration_perc, country, year, population } = item;
  
        if (!latitude || !longitude) {
          console.warn("Missing coordinates for entry:", item);
          return;
        }
  
        // Add circle markers with a color based on the country
        let circleMarker = L.circleMarker([latitude, longitude], {
          radius: markerSize(migration_perc),
          fillColor: countryColor(country), // Use the country-specific color
          color: "white", // Outline color
          weight: 1,
          fillOpacity: 0.6
        }).bindPopup(
          `<b>Country:</b> ${country}<br>` +
          `<b>Year:</b> ${year}<br>` +
          `<b>Migration Percentage:</b> ${migration_perc}%`
        );
  
        migrationCircleLayer.addLayer(circleMarker);
  
        // Add standard markers with country-specific popups
        let standardMarker = L.marker([latitude, longitude]).bindPopup(
          `<b>Country:</b> ${country}<br>` +
          `<b>Year:</b> ${year}<br>` +
          `<b>Population:</b> ${population} people/km²`
        );
  
        migrationMarkerLayer.addLayer(standardMarker);
      });
  
      // Add both layers to the map
      migrationCircleLayer.addTo(myMap);
      migrationMarkerLayer.addTo(myMap);
    })
    .catch(error => console.error("Error loading migration data:", error));
  
  // Load GeoJSON data for country polygons
  fetch('resources/data_files/10countries_outline.geojson')
    .then(response => response.json())
    .then(geojsonData => {
      geoJsonLayer = L.geoJson(geojsonData, {
        style: function(feature) {
          return {
            color: "blue", // Outline color for polygons
            fillColor: countryColor(feature.properties.country), // Fill color based on country
            fillOpacity: 0.5, // Transparency of the fill
            weight: 1.5 // Border thickness
          };
        },
        onEachFeature: function(feature, layer) {
          // Add popups to the GeoJSON polygons
          layer.bindPopup(
            `<b>Country:</b> ${feature.properties.country || "Unknown"}<br>` +
            `<b>Population:</b> ${feature.properties.population || "No data"}`
          );
        }
      }).addTo(myMap);
    })
    .catch(error => console.error("Error loading GeoJSON data:", error));
  
  // Add layer controls to toggle between circle markers, standard markers, and GeoJSON layers with an icon
  L.control.layers(null, {
    'Migration Circle Markers': migrationCircleLayer,
    'Migration Standard Markers': migrationMarkerLayer,
    // 'Country Polygons': geoJsonLayer
  }).addTo(myMap);