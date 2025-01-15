// map.js (script classique)

// Fonction initCompassMap dans le scope global
function initCompassMap() {
  // Création de la carte Leaflet
  const mapCompass = L.map('map-compass', {
    center: [45.75, 4.85], // Lyon
    zoom: 13
  });

  console.log("initCompassMap: mapCompass =", mapCompass); // debug

  // Fond de carte OpenStreetMap (plus sûr)
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
window.initCompassMap = initCompassMap;
