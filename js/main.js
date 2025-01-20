let playInterval = null;     // pour le slider "jour"
let timeInterval = null;     // pour le slider "demi-heure"
let currentHeatLayer = null;
let currentHeatPoints = [];
let transitionInterval = null;

const TRANSITION_DURATION = 500; // ms
const TRANSITION_STEPS    = 20;
const TRANSITION_INTERVAL = TRANSITION_DURATION / TRANSITION_STEPS;

// Plage de dates (1er au 7 janvier 2021)
const startDate = new Date(2021, 0, 1);
const endDate   = new Date(2021, 0, 7);
const totalDays = Math.floor((endDate - startDate) / (1000*60*60*24));

// Quand le DOM est prêt (version D3)
d3.select(document).on('DOMContentLoaded', async function() {
  // 1. Initialiser la carte
  const map = initMap();
  console.log("Map initialisée :", map);

  // 2. Charger les données
  let metroStations, bikeStations, metroLines, bikesData;
  try {
    [metroStations, bikeStations, metroLines, bikesData] = await Promise.all([
      loadMetroStations(),
      loadBikeStations(),
      loadMetroLines(),
      loadBikesData()
    ]);
    console.log("Toutes les données sont chargées.");
  } catch (err) {
    console.error("Impossible de charger les données :", err);
    alert("Erreur lors du chargement des données.");
    return;
  }

  // 3. Dessiner : stations de métro, lignes, stations Vélo'v (exemple initial)
  const selectedDate = new Date(2021, 0, 1);
  const halfHourIndex = 24; // 12:00
  drawMetroStations(map, metroStations, bikeStations, bikesData, selectedDate, halfHourIndex);
  drawMetroLines(map, metroLines);
  drawBikeStations(map, bikeStations);
  console.log("Toutes les couches sont dessinées.");

  // 4. Récupérer les sliders et boutons avec D3
  const daySlider       = d3.select('#day-slider');
  const daySliderValue  = d3.select('#slider-value');
  const timeSlider      = d3.select('#time-slider');
  const timeSliderValue = d3.select('#time-slider-value');
  const playButton      = d3.select('#play-button');
  const timePlayButton  = d3.select('#time-play-button');

  // Configurer le slider "jour" (min, max, valeur)
  daySlider
    .attr('min', 0)
    .attr('max', totalDays)
    .property('value', 2); // Défaut au 3ème jour

  daySliderValue.text(formatDate(new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 2
  )));

  // Configurer le slider "demi-heure"
  timeSlider
    .attr('min', 0)
    .attr('max', 47)
    .property('value', 24); // Défaut : midi
  timeSliderValue.text(formatHalfHour(24));

  // Événement slider "jour"
  daySlider.on('input', function() {
    const dayIndex = +this.value;  // parseInt(this.value)
    const selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + dayIndex);

    daySliderValue.text(formatDate(selectedDate));
    console.log(`Jour sélectionné : ${formatDate(selectedDate)}`);

    const halfHourIndex = +timeSlider.property('value');
    updateMapWithTime(map, metroStations, bikeStations, bikesData, selectedDate, halfHourIndex);
    updateHeatmap(map, bikeStations, bikesData, selectedDate, halfHourIndex);
  });

  // Événement slider "demi-heure"
  timeSlider.on('input', function() {
    const dayIndex = +daySlider.property('value');
    const selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + dayIndex);

    const halfHourIndex = +this.value;
    timeSliderValue.text(formatHalfHour(halfHourIndex));
    console.log(`Demi-heure sélectionnée : ${formatHalfHour(halfHourIndex)}`);

    updateMapWithTime(map, metroStations, bikeStations, bikesData, selectedDate, halfHourIndex);
    updateHeatmap(map, bikeStations, bikesData, selectedDate, halfHourIndex);
  });

  // Bouton Play/Pause slider "jour"
  playButton.on('click', function() {
    const isPlaying = playButton.text().includes('⏸️');
    if (isPlaying) {
      clearInterval(playInterval);
      playInterval = null;
      playButton.text('▶️ Play');
      console.log("Lecture du jour arrêtée.");
    } else {
      playButton.text('⏸️ Pause');
      console.log("Lecture du jour commencée.");
      let currentValue = +daySlider.property('value');
      playInterval = setInterval(() => {
        currentValue++;
        if (currentValue > totalDays) {
          currentValue = 0;
        }
        daySlider.property('value', currentValue);
        daySlider.dispatch('input');
      }, 1000);
    }
  });

  // Bouton Play/Pause slider "demi-heure"
  timePlayButton.on('click', function() {
    const isPlaying = timePlayButton.text().includes('⏸️');
    if (isPlaying) {
      clearInterval(timeInterval);
      timeInterval = null;
      timePlayButton.text('⏯️ Play');
      console.log("Lecture de la demi-heure arrêtée.");
    } else {
      timePlayButton.text('⏸️ Pause');
      console.log("Lecture de la demi-heure commencée.");
      let currentValue = +timeSlider.property('value');
      timeInterval = setInterval(() => {
        currentValue++;
        if (currentValue > 47) {
          currentValue = 0;
        }
        timeSlider.property('value', currentValue);
        timeSlider.dispatch('input');
      }, 1000);
    }
  });

  // 5. Afficher la heatmap initiale
  updateHeatmap(map, bikeStations, bikesData, startDate, +timeSlider.property('value'));
  console.log("Heatmap initiale affichée.");
});






/** =====================
 * FONCTIONS JAVASCRIPT
 =====================**/

 function drawBikeStations(map, stations) {
  stations.forEach(station => {
    const marker = L.circleMarker([station.latitude, station.longitude], {
      radius: 2,
      color: '#606060',
      fillColor: '#606060',
      fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`
      <strong>Station Vélo'v</strong><br>
      Emplacements disponibles : ${station.bike_stands || 'N/A'}<br>
      Vélos disponibles : ${station.available_bikes || 'N/A'}
    `);
  });
}

function drawMetroStations(map, metroStations, bikeStations, bikesData, selectedDate, halfHourIndex) {
  const color = '#3498db';
  const hour = Math.floor(halfHourIndex / 2);
  const minute = (halfHourIndex % 2 === 0) ? 0 : 30;
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  metroStations.features.forEach(station => {
    const [lng, lat] = station.geometry.coordinates;
    const marker = L.circleMarker([lat, lng], {
      color,
      fillColor: color,
      fillOpacity: 0.8,
      radius: 8
    }).addTo(map);

    marker.on('click', () => {
      const nearbyStations = bikeStations.filter(s => {
        const distM = distance(s.latitude, s.longitude, lat, lng);
        return distM <= 500;
      });

      const filteredBikesData = bikesData.filter(b =>
        nearbyStations.some(s => s.id_velov === b.id_velov) &&
        b.year === year &&
        b.month === month &&
        b.day === day &&
        b.hour === hour &&
        b.minute === minute
      );

      const totalAvailableBikes = filteredBikesData.reduce((sum, b) => sum + b.bikes, 0);

      let popupContent = `
        <strong>${station.properties.nom}</strong><br>
        Stations Vélo'v proches : ${nearbyStations.length}<br>
      `;

      if (filteredBikesData.length > 0) {
        popupContent += `Vélos disponibles sur la plage ${hour}h${String(minute).padStart(2, '0')} : ${totalAvailableBikes}`;
      } else {
        popupContent += `Aucune donnée de vélos disponible pour cette plage horaire.`;
      }

      marker.bindPopup(popupContent).openPopup();
    });
  });
}

function drawMetroLines(map, metroLines) {
  metroLines.features.forEach(line => {
    const coordinates = line.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    const color = `rgb(${line.properties.couleur})`;
    L.polyline(coordinates, {
      color,
      weight: 6,
      opacity: 0.8
    }).addTo(map);
  });
}

/** =====================
 * updateMapWithTime
 =====================**/
function updateMapWithTime(map, metroStations, bikeStations, bikesData, selectedDate, halfHourIndex) {
  const hour = Math.floor(halfHourIndex / 2);
  const minute = (halfHourIndex % 2 === 0) ? 0 : 30;
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  // Supprimer anciens marqueurs de métro
  if (window.metroMarkers) {
    window.metroMarkers.forEach(m => map.removeLayer(m));
    window.metroMarkers = [];
  } else {
    window.metroMarkers = [];
  }

  // Recréer tous les marqueurs de métro
  metroStations.features.forEach(station => {
    const [lng, lat] = station.geometry.coordinates;
    const marker = L.circleMarker([lat, lng], {
      color: '#3498db',
      fillColor: '#3498db',
      fillOpacity: 0.8,
      radius: 5
    }).addTo(map);

    marker.on('click', () => {
      const nearbyStations = bikeStations.filter(s => {
        const distM = distance(s.latitude, s.longitude, lat, lng);
        return distM <= 500;
      });

      const totalAvailableBikes = bikesData.filter(b =>
        nearbyStations.some(s => s.id_velov === b.id_velov) &&
        b.year === year &&
        b.month === month &&
        b.day === day &&
        b.hour === hour &&
        b.minute === minute
      ).reduce((sum, b) => sum + b.bikes, 0);

      const popupContent = `
        <strong>${station.properties.nom}</strong><br>
        Stations Vélo'v proches : ${nearbyStations.length}<br>
        Vélos disponibles sur la plage ${hour}h${String(minute).padStart(2, '0')} : ${totalAvailableBikes}
      `;
      marker.bindPopup(popupContent).openPopup();
      window.metroMarkers.push(marker);
    });

    window.metroMarkers.push(marker);
  });
}

/** =====================
 * updateHeatmap
 =====================**/
function updateHeatmap(map, bikeStations, bikesData, date, halfHourIndex) {
  const newPoints = buildHeatPoints(bikeStations, bikesData, date, halfHourIndex);
  console.log("Heatmap points:", newPoints);

  if (!newPoints || newPoints.length === 0) {
    console.log("Aucune donnée ce jour/demi-heure.");
    return;
  }

  if (!currentHeatLayer || currentHeatPoints.length === 0) {
    // Première création de la heatmap sans transition
    currentHeatPoints = newPoints.slice();
    if (currentHeatLayer) {
      map.removeLayer(currentHeatLayer);
      currentHeatLayer = null;
    }
    currentHeatLayer = L.heatLayer(currentHeatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 18,
      gradient: {
        0.2: 'blue',
        0.5: 'lime',
        1.0: 'red'
      }
    }).addTo(map);
    console.log("Heatmap initiale ajoutée.");
    return;
  }

  // Sinon, interpolation entre l'ancienne et la nouvelle heatmap
  const oldPoints = currentHeatPoints.slice();
  console.log("Heatmap mise à jour avec interpolation.");

  // Arrêter toute transition en cours
  if (transitionInterval) {
    clearInterval(transitionInterval);
    transitionInterval = null;
  }

  let frame = 0;
  transitionInterval = setInterval(() => {
    frame++;
    const t = frame / TRANSITION_STEPS;
    if (t > 1) {
      clearInterval(transitionInterval);
      transitionInterval = null;
      currentHeatPoints = newPoints.slice();
      console.log("Transition heatmap terminée.");
      return;
    }
    const interpolated = interpolatePoints(oldPoints, newPoints, t);
    currentHeatLayer.setLatLngs(interpolated);
  }, TRANSITION_INTERVAL);
}

/** =====================
 * buildHeatPoints
 =====================**/
function buildHeatPoints(bikeStations, bikesData, date, halfHourIndex) {
  if (halfHourIndex == null) halfHourIndex = 0;
  const hour = Math.floor(halfHourIndex / 2);
  const minute = halfHourIndex % 2 === 0 ? 0 : 30;

  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const day   = date.getDate();

  const points = [];
  bikeStations.forEach(station => {
    const dailyData = bikesData.filter(b =>
      b.id_velov === station.id_velov &&
      b.year === year &&
      b.month === month &&
      b.day === day &&
      b.hour === hour &&
      b.minute === minute
    );
    if (dailyData.length === 0) return;

    // Tri pour obtenir la dernière entrée
    dailyData.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    const latest = dailyData[dailyData.length - 1];
    const capacity  = latest.bike_stands;
    const available = latest.bikes;
    const ratio = capacity > 0 ? (available / capacity) : 0;
    points.push([station.latitude, station.longitude, ratio]);
  });
  return points;
}

/** =====================
 * interpolatePoints
 =====================**/
function interpolatePoints(oldPoints, newPoints, t) {
  const result = [];
  const n = Math.min(oldPoints.length, newPoints.length);
  for (let i = 0; i < n; i++) {
    const [lat1, lng1, val1] = oldPoints[i];
    const [lat2, lng2, val2] = newPoints[i];
    const lat = lat2;
    const lng = lng2;
    const val = val1 + (val2 - val1) * t;
    result.push([lat, lng, val]);
  }
  return result;
}

/** =====================
 * formatDate / formatHalfHour
 =====================**/
function formatDate(date) {
  const d = String(date.getDate()).padStart(2,'0');
  const m = String(date.getMonth() + 1).padStart(2,'0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatHalfHour(index) {
  const h = Math.floor(index / 2);
  const m = (index % 2 === 0) ? '00' : '30';
  return `${h}:${m}`;
}
