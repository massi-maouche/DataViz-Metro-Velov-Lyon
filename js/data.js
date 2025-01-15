// data.js (script classique)

// Charger les données (Metro Stations)
window.loadMetroStations = async function() {
  try {
    const response = await d3.json('data/sytral_tcl_sytral.tclstation.json');
    console.log("Metro Stations chargées :", response.features.length);
    return response;
  } catch (error) {
    console.error("Erreur chargement sytral_tcl_sytral.tclstation.json :", error);
    throw error;
  }
};

// Charger les données (Bike Stations)
window.loadBikeStations = async function() {
  try {
    const data = await d3.csv('data/data-stations.csv');
    const parsedData = data.map(d => ({
      id_velov: d.id_velov,
      latitude: parseFloat(d.latitude),
      longitude: parseFloat(d.longitude),
      bike_stands: parseInt(d.bike_stands, 10) || 0,
      available_bikes: parseInt(d.available_bikes, 10) || 0
    }));
    console.log("Bike Stations chargées :", parsedData.length);
    return parsedData;
  } catch (error) {
    console.error("Erreur chargement data-stations.csv :", error);
    throw error;
  }
};

// Charger les données (Metro Lines)
window.loadMetroLines = async function() {
  try {
    const response = await d3.json('data/ligne_metro.json');
    console.log("Metro Lines chargées :", response.features.length);
    return response;
  } catch (error) {
    console.error("Erreur chargement ligne_metro.json :", error);
    throw error;
  }
};

// Charger les données (ddata-bikes.csv)
window.loadBikesData = async function() {
  try {
    const data = await d3.csv('data/ddata-bikes.csv');
    const parsedData = data.map(d => ({
      id_velov: d.id_velov,
      year: parseInt(d.year, 10),
      month: parseInt(d.month, 10),
      day: parseInt(d.day, 10),
      hour: parseInt(d.hour, 10),
      minute: parseInt(d.minute, 10),
      bikes: parseInt(d.bikes, 10),
      bike_stands: parseInt(d.bike_stands, 10),
      departure30min: parseInt(d.departure30min, 10),
      arrival30min: parseInt(d.arrival30min, 10)
    }));
    console.log("Bikes Data chargées :", parsedData.length);
    return parsedData;
  } catch (error) {
    console.error("Erreur chargement ddata-bikes.csv :", error);
    throw error;
  }
};

// distance (Haversine)
window.distance = function(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
};
