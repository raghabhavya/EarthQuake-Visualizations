

//creating the map project
//We set the view to the Ontario, Canada coordinates
let myMap = L.map('map').setView([51.2538, -85.3232], 3);

//adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);




//set our api urls based on what we want to display.
//We choose the dataset for PB2002_plates.json file from "https://github.com/fraxen/tectonicplates"
const tectonic_plates_url="https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";


// Get the tectonic plates data and add it to the map as a separate layer
let tectonic_Plates = L.layerGroup();


//call the api with d3 to get the techntonic plates data.
d3.json(tectonic_plates_url).then(function (plateData) {
    L.geoJSON(plateData, {
      color: "orange",
      weight: 2
    }).addTo(tectonic_Plates);
  
    tectonic_Plates.addTo(myMap);
  });


// Define a grayscale base map using OpenStreetMap tiles
const grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Define a satellite imagery base map using Esri's World Imagery service
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});



// Define a tile layer for the Outdoor Map using OpenStreetMap tiles
var outdoorsMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Tiles &copy; OpenTopoMap'
});

// Define a base maps object for switching 
const baseMaps = {
    'Grayscale Map': grayscale,
    'Satellite Imagery': satellite,
    'Outdoor Map' : outdoorsMap
};





//set our api urls based on what we want to display.
//We choose the dataset for Past 7 Days (Updated every minute)
const url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


//call the api with d3 to get the data.
d3.json(url).then(function(data){
    console.log(data);

    //create a leaflet layer group
    let earthquakes = L.layerGroup();
    
    // Loop through the features in the data
    data.features.forEach(function (feature) {
    // Get the coordinates of the earthquake
    let coordinates = feature.geometry.coordinates;
    let lat = coordinates[1];
    let lng = coordinates[0];
    let depth = coordinates[2];
  
    // Get the magnitude of the earthquake
    let magnitude = feature.properties.mag;
  
    // Create a circle marker for the earthquake
    let marker = L.circleMarker([lat, lng], {
      radius: magnitude * 3, 
      color: '#000',      
      weight: 1,              
      fillColor: getColor(depth),  
      fillOpacity: 0.7        
    });
      
    //add a popup to the marker with information about the earthquake
    marker.bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br>
        <strong>Magnitude:</strong> ${magnitude}<br>
        <strong>Depth:</strong> ${depth} km`);
      
      //add the marker to the layer group
      marker.addTo(earthquakes);
    });
    
    //add the layer group to the map
    earthquakes.addTo(myMap);
  
    //define a function to get the color based on the depth of the earthquake
    function getColor(d) {
        return d > 90 ? '#D73027' :
               d > 70 ? '#4575B4' :
               d > 50 ? '#91BFDB' :
               d > 30 ? '#313695' :
               d > 10 ? '#FEE08B' :
               d > -10 ? '#A6D96A' :
               '#1A9850';
      }
  
    //create a legend control
    let legend = L.control({position: 'bottomright'});

   //add the legend to the map
   legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend'),
        depths_intervals = [-10, 10, 30, 50, 70, 90],
        labels = [];
  
    // loop through our depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths_intervals.length; i++) {
    div.innerHTML +=
          '<i style="background:' + getColor(depths_intervals[i] + 1) + '"></i> ' +
          depths_intervals[i] + (depths_intervals[i + 1] ? '&ndash;' + depths_intervals[i + 1] + '<br>' : '+') + '<br>';
    }
    
    // Return the legend container with HTML content
    return div;

};
  // Add the legend control to the Leaflet map
  legend.addTo(myMap);
  


// Define overlay maps to be added to the layer control
const overlayMaps = {
    // Earthquakes layer
    Earthquakes: earthquakes, 
    // Tectonic Plates layer              
    "Tectonic Plates": tectonic_Plates        
  };
  
  // Add Layer controls to the Leaflet map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  
  


  });




