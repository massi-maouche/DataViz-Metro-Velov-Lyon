// stats.js
import { loadBikesData } from './data.js';

let globalBikesData = [];
let globalCloseStations = [];

/**
 * Loads the global bikes data once. Called by main.js on page load.
 */
export async function initStats() {
  globalBikesData = await loadBikesData();
}

/**
 * Called each time a new station selection occurs.
 */
export function updateStats(stationsProches, filters) {
  globalCloseStations = stationsProches.map(s => s.id_velov);

  // Filter data based on user-chosen date/hour
  const filteredData = applyFilters(globalBikesData, filters);

  // Then filter by the currently nearby station IDs
  const closeBikeData = filteredData.filter(bike =>
    globalCloseStations.includes(bike.id_velov)
  );

  // Update the summary stats
  document.getElementById('summary-nearby-stations').textContent =
    stationsProches.length;

  // Clear old charts
  const container = document.getElementById('charts-section');
  container.innerHTML = '';

  // If no stations are nearby, no charts to show
  if (!stationsProches.length) return;

  // Draw charts
  displayHourlyAvailability(closeBikeData);
  displayDailyTrends(closeBikeData);
  displayFluxGraph(closeBikeData);
}

/**
 * If user changes the date/hour filters, refresh the existing selection.
 */
export function refreshStatsWithNewFilters(filters) {
  if (!globalCloseStations.length) {
    return; // No station selected yet
  }
  updateStats(globalCloseStations.map(id => ({ id_velov: id })), filters);
}

/**
 * Some basic filters for date and hour range.
 */
function applyFilters(allBikes, filters) {
  const { startDate, endDate, startHour, endHour } = filters;

  return allBikes.filter(bike => {
    const d = new Date(bike.year, bike.month - 1, bike.day);

    let inDateRange = true;
    if (startDate) inDateRange = inDateRange && (d >= startDate);
    if (endDate) inDateRange = inDateRange && (d <= endDate);

    let inHourRange = true;
    if (startHour !== null) inHourRange = inHourRange && (bike.hour >= startHour);
    if (endHour !== null) inHourRange = inHourRange && (bike.hour <= endHour);

    return inDateRange && inHourRange;
  });
}


/** ============== CHARTS ============== */

function displayHourlyAvailability(bikeData) {
  const hourlyAvailability = {};
  bikeData.forEach(bike => {
    const h = bike.hour;
    if (!hourlyAvailability[h]) {
      hourlyAvailability[h] = { total: 0, count: 0 };
    }
    hourlyAvailability[h].total += bike.bikes;
    hourlyAvailability[h].count += 1;
  });

  const data = Object.keys(hourlyAvailability).map(h => ({
    hour: +h,
    avgBikes: hourlyAvailability[h].total / hourlyAvailability[h].count
  })).sort((a,b) => a.hour - b.hour);

  const width = 400, height = 200, margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const container = d3.select('#charts-section');

  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('display', 'block')
    .style('margin', '1rem 0')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.hour))
    .range([0, width])
    .padding(0.2);

  const maxVal = d3.max(data, d => d.avgBikes);
  const y = d3.scaleLinear()
    .domain([0, maxVal || 0])
    .range([height, 0]);

  // Axes
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  svg.append('g')
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('fill', '#3498db')
    .attr('x', d => x(d.hour))
    .attr('y', d => y(d.avgBikes))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.avgBikes));

  // Title
  svg.append('text')
    .attr('x', width/2)
    .attr('y', -5)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Disponibilité moyenne par heure');
}

function displayDailyTrends(bikeData) {
  // Group by date
  const daily = {};
  bikeData.forEach(bike => {
    const dateKey = `${bike.year}-${bike.month}-${bike.day}`;
    if (!daily[dateKey]) {
      daily[dateKey] = 0;
    }
    daily[dateKey] += bike.bikes;
  });

  const data = Object.keys(daily).map(k => ({
    date: k,
    total: daily[k]
  })).sort((a,b) => new Date(a.date) - new Date(b.date));

  const width = 400, height = 200, margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const container = d3.select('#charts-section');
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('display', 'block')
    .style('margin', '1rem 0')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.date))
    .range([0, width])
    .padding(0.3);

  const maxVal = d3.max(data, d => d.total);
  const y = d3.scaleLinear()
    .domain([0, maxVal || 0])
    .range([height, 0]);

  // X axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(d => d.slice(5)) // just "MM-DD"
    )
    .selectAll("text")
    .style("font-size", "10px")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end");

  // Y axis
  svg.append('g').call(d3.axisLeft(y));

  // Line
  const line = d3.line()
    .x(d => x(d.date) + x.bandwidth() / 2)
    .y(d => y(d.total));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#e74c3c')
    .attr('stroke-width', 2)
    .attr('d', line);

  // Title
  svg.append('text')
    .attr('x', width/2)
    .attr('y', -5)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Disponibilité totale par jour');
}

function displayFluxGraph(bikeData) {
  const hourlyFlux = {};
  bikeData.forEach(bike => {
    const h = bike.hour;
    if (!hourlyFlux[h]) {
      hourlyFlux[h] = { dep: 0, arr: 0, count: 0 };
    }
    hourlyFlux[h].dep += bike.departure30min;
    hourlyFlux[h].arr += bike.arrival30min;
    hourlyFlux[h].count += 1;
  });

  const data = Object.keys(hourlyFlux).map(h => ({
    hour: +h,
    avgDep: hourlyFlux[h].dep / hourlyFlux[h].count,
    avgArr: hourlyFlux[h].arr / hourlyFlux[h].count
  })).sort((a,b) => a.hour - b.hour);

  const width = 400, height = 200, margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const container = d3.select('#charts-section');

  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('display', 'block')
    .style('margin', '1rem 0')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.hour))
    .range([0, width])
    .padding(0.2);

  const maxVal = d3.max(data, d => Math.max(d.avgDep, d.avgArr));
  const y = d3.scaleLinear()
    .domain([0, maxVal || 0])
    .range([height, 0]);

  // Axes
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  svg.append('g')
    .call(d3.axisLeft(y));

  // Lines
  const lineDep = d3.line()
    .x(d => x(d.hour) + x.bandwidth()/2)
    .y(d => y(d.avgDep));
  const lineArr = d3.line()
    .x(d => x(d.hour) + x.bandwidth()/2)
    .y(d => y(d.avgArr));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#3498db')
    .attr('stroke-width', 2)
    .attr('d', lineDep);

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#2ecc71')
    .attr('stroke-width', 2)
    .attr('d', lineArr);

  // Title
  svg.append('text')
    .attr('x', width/2)
    .attr('y', -5)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Flux moyens (départs & arrivées)');
}
