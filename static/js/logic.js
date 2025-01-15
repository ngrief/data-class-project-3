// Initialize the map
const myMap = L.map('map').setView([37.09, -95.71], 5);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// Handle file upload
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseCSV(content);
        };
        reader.readAsText(file);
    }
});

// Function to parse CSV data
function parseCSV(data) {
    const rows = data.split('\n');
    rows.forEach(row => {
        const columns = row.split(',');
        const lat = parseFloat(columns[0]); // Assuming latitude is in the first column
        const lng = parseFloat(columns[1]); // Assuming longitude is in the second column
        const description = columns[2]; // Assuming description is in the third column

        if (!isNaN(lat) && !isNaN(lng)) {
            // Create a marker and add it to the map
            L.marker([lat, lng])
                .bindPopup(description)
                .addTo(myMap);
        }
    });
}

// // Create createMap function
// function createMap(migration) {
//     // create the tile layer 
//     let worldMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
//         attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
//       });

//     // create a basemap layer object to hold tile layer 
//     let baseMaps = {
//         "World Map": worldMap
//     };

//     // create overlayMaps object to hold earthquake magnitude layer
//     let overlayMaps = {
//         "Migration": migration
//     };

//     // Create the map object with options.
//     let myMap = L.map("map", {
//         center: [14.59, 28.67],
//         zoom: 2,
//         layers: [worldMap, migration]
//     });
  
//     // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
//     L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// };

// // Create createMarkers function
// function createMarkers(response) {
//     console.log(response);

//     // Initialize an array to hold the magnitude markers.
//     let magMarkers = [];

//     // Loop through the features array.
//     for (let i = 0; i < response.features.length; i++) {
        
//         // Pull the variables from response.features.
//         // Xpert Assistant helped me to debug this and use correct dot notation
//         // let properties = response.features[i];
//         let coordinates = response.features[i].geometry.coordinates;
//         let place = response.features[i].properties.place;
//         let mag = response.features[i].properties.mag;

//         // For each feature, create a marker, and bind a popup with the feature's name.
//         // Add the marker to the magMarkers array.
//         let magMarker = L.marker([coordinates[1], coordinates[0]])
//             .bindPopup(`<h3><p>Location: ${place}</h3><p>Magnitude: ${mag}</p>`);

//         magMarkers.push(magMarker);
//     }

//     // Create a layer group that's made from the mag markers array, and pass it to the createMap function.
//     createMap(L.layerGroup(magMarkers));
// }