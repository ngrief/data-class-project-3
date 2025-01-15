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

// Load the local GeoJSON data for migration percentage and population density
fetch('resources/data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Check the structure of the loaded data

        // Check if the data is in the expected GeoJSON format
        if (data && data.features) {
        // Create a layer for migration markers
        let migrationMarkers = L.layerGroup();

        data.forEach(entry => {
            // Extract variables
            let lat = entry.latitude;
            let long = entry.longitude; 
            let country = entry.country;
            let year = entry.year;
            let migration_perc = entry.migration_perc;

            // Check for null values and provide default values
            if (lat == null || long == null) {
                console.warn("Missing coordinates for entry:", entry);
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

        // Create a choropleth layer for population density using the same data
        let populationLayer = L.choropleth(data, { // Use the same data
            valueProperty: "pop_density", 
            scale: ["#ffffb2", "#b10026"],
            steps: 10,
            mode: "q",
            style: {
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup("Country: " + feature.properties.country + 
                                 "<br>Year: " + feature.properties.year + 
                                 "<br>Population Density: " + feature.properties.pop_density);
            }
        });

        // Add the population layer to the map
        populationLayer.addTo(myMap);

        // Create a layer control
        let overlayMaps = {
            "Migration Markers": migrationMarkers,
            "Population Density": populationLayer
        };

        L.control.layers(null, overlayMaps).addTo(myMap);
    } else {
        console.error('Data is not in the expected format:', data);
    }

    })

    .catch(error => {
        console.error('Error loading the data:', error);
    });