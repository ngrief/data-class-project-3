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
    return Math.abs(migrationPercentage * 75); // Adjust scaling as needed
  }
  
  // Function to determine color for population density
  function getColor(density) {
    return density > 500 ? "#800026" :
           density > 200 ? "#BD0026" :
           density > 100 ? "#E31A1C" :
           density > 50  ? "#FC4E2A" :
           density > 20  ? "#FD8D3C" :
           density > 10  ? "#FEB24C" :
           density > 0   ? "#FED976" :
                           "#FFEDA0";
  }
  
  // Fetch and process the data
  fetch('resources/data.json')
    .then(response => response.json())
    .then(data => {
      console.log("Loaded Data:", data);
  
      // Layer for migration markers
      let migrationMarkers = L.layerGroup();
  
      data.forEach(entry => {
        let { latitude, longitude, migration_perc, country, year, pop_density } = entry;
  
        if (!latitude || !longitude) {
          console.warn("Missing coordinates for:", entry);
          return;
        }
  
        // Add circle markers for migration
        let marker = L.circleMarker([latitude, longitude], {
          radius: markerSize(migration_perc),
          fillColor: "blue",
          color: "white",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.6
        }).bindPopup(
          `<b>Country:</b> ${country}<br>` +
          `<b>Year:</b> ${year}<br>` +
          `<b>Migration %:</b> ${migration_perc}`
        );
  
        migrationMarkers.addLayer(marker);
      });
  
      migrationMarkers.addTo(myMap);
  
      // Add a population density layer
      let populationLayer = L.layerGroup();
  
      data.forEach(entry => {
        let { latitude, longitude, pop_density, country, year } = entry;
  
        if (!latitude || !longitude) {
          return;
        }
  
        // Add population density markers
        let densityMarker = L.circle([latitude, longitude], {
          radius: 20000, // Fixed radius for visualization
          fillColor: getColor(pop_density),
          color: "white",
          weight: 1,
          fillOpacity: 0.7
        }).bindPopup(
          `<b>Country:</b> ${country}<br>` +
          `<b>Year:</b> ${year}<br>` +
          `<b>Population Density:</b> ${pop_density}`
        );
  
        populationLayer.addLayer(densityMarker);
      });
  
      populationLayer.addTo(myMap);
  
      // Add layer control
      L.control.layers(null, {
        "Migration Markers": migrationMarkers,
        "Population Density": populationLayer
      }).addTo(myMap);
    })
    .catch(error => console.error("Error loading data:", error));
  