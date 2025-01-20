// map.js (script classique)
function initMap() {
  const mapCompass = L.map('map-compass', {
    center: [45.75, 4.85],
    zoom: 13
  });

  console.log("initMap: mapCompass =", mapCompass);
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  ).addTo(mapCompass);

  return mapCompass;
}

// Rendre accessible globalement
window.initMap = initMap;
