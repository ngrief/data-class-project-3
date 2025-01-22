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
    return migrationPercentage * 75; 
  }
  
  // Load the local GeoJSON data for migration percentage
  fetch('resources/data.json')
    .then(response => response.json())
    .then(migrationData => {
      // Create a layer for migration markers
      let migrationMarkers = L.layerGroup();
  
      migrationData.forEach(data => {
        
        // extract variables
        let lat = data.latitude;
        let long = data.longitude; 
        let country = data.country;
        let year = data.year;
        let migration_perc = data.migration_perc;
        

        // Check for null values and provide default values
        if (lat == null || long == null) {
        console.warn("Missing coordinates for entry:", data);
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
  
        migrationMarkers.addLayer(marker);
      });
  
      // Add the migration markers layer to the map
      migrationMarkers.addTo(myMap);
      
      // Load the local GeoJSON data for population density
      fetch('resources/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Check the structure of the loaded data

            if (data && data.features) {
            // Create a choropleth layer for population density
            let populationLayer = L.choropleth(pop_density, {
                valueProperty: "pop_density",
                scale: ["#ffffb2", "#b10026"],
                steps: 10,
                mode: "q",
                style: {
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
                },
                onEachFeature: function(layer) {
                layer.bindPopup("Country: " + country + 
                                "<br>Year: " + year + 
                                "<br>Population Density: " + pop_density);
                }
            });

        // Add the population layer to the map
        populationLayer.addTo(myMap);
            } else {
                console.error('Data is not in the expected format:', data);
            }

        // Create a layer control
        let overlayMaps = {
            "Migration Markers": migrationMarkers,
            "Population Density": populationLayer
          };
  
          L.control.layers(null, overlayMaps).addTo(myMap);
        });
    })
    .catch(error => {
        console.error('Error loading the data:', error);
    });
    