var map = L.map('map', {
  center: [25.276987, 55.296249],
  zoom: 8,
  minZoom: 2.299,   // ✅ stops zooming out too far (tweak 2–4 if you want)
  maxZoom: 19
});

// ✅ World bounds lock (prevents panning above/beside the map)
const worldBounds = L.latLngBounds(
  L.latLng(-85, -180),
  L.latLng(85, 180)
);

map.setMaxBounds(worldBounds);
map.options.maxBoundsViscosity = 1.0;

// Dark Base Map (better for radar UI)
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap & CartoDB',
    subdomains: 'abcd',
    maxZoom: 19,
    noWrap: true,           // ✅ stops repeating
    bounds: worldBounds     // ✅ keeps tiles within bounds
  }
).addTo(map);

// Day/Night Layer using Leaflet Terminator Plugin
const dayNightLayer = L.terminator({
  fillColor: "#ffffff",
  fillOpacity: 0.2,
  color: "#ffffff",
  weight: 0.5
}).addTo(map);

// DAY / NIGHT TOGGLE
const dayNightToggle = document.getElementById("dayNightToggle");

// Start enabled only if checked
if (!dayNightToggle.checked) {
  map.removeLayer(dayNightLayer);
}

dayNightToggle.addEventListener("change", function () {
  if (this.checked) {
    dayNightLayer.addTo(map);
  } else {
    map.removeLayer(dayNightLayer);
  }
});


// Weather Layer(clounds)
const cloudsLayer = L.tileLayer(
  'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=7379ab9c5e4ad29769cb06aeb1f9853e',
  {
    attribution: '&copy; OpenWeatherMap',
    opacity: 0.1,
    noWrap: true,           // ✅ stops repeating
    bounds: worldBounds
  }
);

// Weather Layer (precipitation)
const precipitationLayer = L.tileLayer(
  'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=7379ab9c5e4ad29769cb06aeb1f9853e',
  {
    attribution: '&copy; OpenWeatherMap',
    opacity: 0.9,
    noWrap: true,           // ✅ stops repeating
    bounds: worldBounds
  }
);

// Weather Layer (Wind)
const windLayer = L.tileLayer(
  'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=7379ab9c5e4ad29769cb06aeb1f9853e',
  {
    attribution: '&copy; OpenWeatherMap',
    opacity: 0.8,
    noWrap: true,           // ✅ stops repeating
    bounds: worldBounds
  }
);

// Toggle Logic
const weatherToggle = document.getElementById("weatherToggle");

if (weatherToggle.checked) {
  cloudsLayer.addTo(map);
  precipitationLayer.addTo(map);
  windLayer.addTo(map);
}

weatherToggle.addEventListener("change", function () {
  if (this.checked) {
    cloudsLayer.addTo(map);
    precipitationLayer.addTo(map);
    windLayer.addTo(map);
  } else {
    map.removeLayer(cloudsLayer);
    map.removeLayer(precipitationLayer);
    map.removeLayer(windLayer);
  }
});

// ✅ Extra safety: if any interaction pushes it, snap back inside bounds
map.on("drag", () => map.panInsideBounds(worldBounds, { animate: false }));
map.on("zoomend", () => map.panInsideBounds(worldBounds, { animate: false }));

// --- Airports Layer ---
const airportToggle = document.getElementById("airportToggle");
const airportsLayer = L.layerGroup().addTo(map);

// ✅ Create icon once (performance improvement)
const airportIcon = L.icon({
  iconUrl: "../images/airport-Icon.png",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

// Load airports inside current view
async function loadAirportsInView() {
  if (!airportToggle.checked) return;

  const b = map.getBounds();
  const minLat = b.getSouth();
  const maxLat = b.getNorth();
  const minLon = b.getWest();
  const maxLon = b.getEast();

  try {
    airportsLayer.clearLayers();

    const API_BASE = "http://localhost:5000";
    const url =
      `${API_BASE}/api/airports?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Airports API failed: ${res.status}`);

    const airports = await res.json();

    airports.forEach((a) => {
      const lat = Number(a.latidude);
      const lon = Number(a.Longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      const marker = L.marker([lat, lon], { icon: airportIcon });

      const title = `${a.Name || "Airport"} (${a.IATA || "-"} / ${a.ICAO || "-"})`;
      const subtitle = `${a.City || ""}${a.City ? ", " : ""}${a.Country || ""}`;

      marker.bindPopup(
        `
        <div class="airport-popup-card">
          <div class="airport-popup-title">${title}</div>
          <div class="airport-popup-subtitle">${subtitle}</div>
        </div>
        `,
        {
          className: "airport-popup-theme leaflet-popup",
          closeButton: false,
          autoPan: true
        }
      );

            marker.addTo(airportsLayer);
          });
        } catch (err) {
          console.error(err);
        }
      }

map.on("moveend", loadAirportsInView);

airportToggle.addEventListener("change", () => {
  if (airportToggle.checked) {
    airportsLayer.addTo(map);
    loadAirportsInView();
  } else {
    map.removeLayer(airportsLayer);
    airportsLayer.clearLayers();
  }
});

loadAirportsInView();

// --- Aircraft Layer ---
const aircraftToggle = document.getElementById("aircraftToggle");
const aircraftLayer = L.layerGroup().addTo(map);

// simple plane icon (no rotation plugin needed)
function makePlaneDivIcon(deg = 0) {
  const safeDeg = Number.isFinite(deg) ? deg : 0;

  return L.divIcon({
    className: "plane-icon-wrap",
    html: `
      <img
        src="../images/plane-removebg-preview.png"
        class="plane-icon"
        style="transform: rotate(${safeDeg}deg);"
      />
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

async function loadAircraftInView() {
  if (!aircraftToggle.checked) return;

  const b = map.getBounds();
  const minLat = b.getSouth();
  const maxLat = b.getNorth();
  const minLon = b.getWest();
  const maxLon = b.getEast();

  try {
    aircraftLayer.clearLayers();

    const API_BASE = "http://localhost:5000";
    const url =
      `${API_BASE}/api/aircraft?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Aircraft API failed: ${res.status}`);

    const data = await res.json();
    const states = data.states || [];

    states.forEach((a) => {
      const lat = Number(a.latitude);
      const lon = Number(a.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      const heading = Number(a.true_track); // degrees
      const icon = makePlaneDivIcon(heading);

      const marker = L.marker([lat, lon], { icon });

      const callsign = (a.callsign || "").trim() || "Unknown";
      const altM = a.baro_altitude;
      const altFt = Number.isFinite(Number(altM)) ? Math.round(Number(altM) * 3.28084) : null;
      const speed = a.velocity; // m/s from OpenSky
      const speedKt = Number.isFinite(Number(speed)) ? Math.round(Number(speed) * 1.94384) : null;

      marker.bindPopup(`
        <div class="aircraft-popup-card">
          <div class="aircraft-popup-title">${callsign}</div>
          <div class="aircraft-popup-subtitle">
            ICAO24: ${a.icao24 || "-"}<br/>
            Country: ${a.origin_country || "-"}<br/>
            Alt: ${altFt ?? "-"} ft<br/>
            Speed: ${speedKt ?? "-"} kt<br/>
            Squawk: ${a.squawk || "-"}
          </div>
        </div>
      `, { closeButton: false, autoPan: true, className: "aircraft-popup-theme leaflet-popup" });

      marker.addTo(aircraftLayer);
    });

  } catch (err) {
    console.error(err);
  }
}

// reload on pan/zoom
map.on("moveend", loadAircraftInView);

// refresh every 10s while toggle is ON
let aircraftTimer = null;

function startAircraftRefresh() {
  if (aircraftTimer) clearInterval(aircraftTimer);
  aircraftTimer = setInterval(loadAircraftInView, 10000);
}

function stopAircraftRefresh() {
  if (aircraftTimer) clearInterval(aircraftTimer);
  aircraftTimer = null;
}

aircraftToggle.addEventListener("change", () => {
  if (aircraftToggle.checked) {
    aircraftLayer.addTo(map);
    loadAircraftInView();
    startAircraftRefresh();
  } else {
    map.removeLayer(aircraftLayer);
    aircraftLayer.clearLayers();
    stopAircraftRefresh();
  }
});

// initial
if (aircraftToggle.checked) startAircraftRefresh();
loadAircraftInView();

// Search Functionality
const searchInput = document.getElementById("sidebarSearch");
const resultsWrap = document.getElementById("searchResultsWrap");

// Demo data (replace later with real API results)
const demoFlights = [
  { callsign: "EK403", origin: "Singapore", altitude: "34,000 ft", speed: "480 kts", squawk: "1990", icao: "######" },
  { callsign: "EK202", origin: "Dubai",     altitude: "31,000 ft", speed: "455 kts", squawk: "1200", icao: "######" },
  { callsign: "QR100", origin: "Doha",      altitude: "36,000 ft", speed: "510 kts", squawk: "0670", icao: "######" },
  { callsign: "BA107", origin: "London",    altitude: "33,000 ft", speed: "470 kts", squawk: "4512", icao: "######" },
];

function renderResults(list) {
  resultsWrap.innerHTML = list.map(f => `
    <div class="flight-card">
      <div class="flight-title">Flight ${f.callsign}(Callsign)</div>
      <div class="flight-sub">${f.origin}(Origin)</div>

      <div class="flight-meta">
        <div>Altitude: <span>${f.altitude}</span></div>
        <div>Speed: <span>${f.speed}</span></div>
        <div>SQAWK: <span>${f.squawk}</span></div>
        <div>ICAO: <span>${f.icao}</span></div>
      </div>
    </div>
  `).join("");
}

function filterFlights(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return demoFlights.filter(f =>
    f.callsign.toLowerCase().includes(q) ||
    f.origin.toLowerCase().includes(q)
  );
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value;
  const matches = filterFlights(q);

  if (q.trim().length === 0) {
    resultsWrap.classList.add("hidden");
    resultsWrap.innerHTML = "";
    return;
  }

  resultsWrap.classList.remove("hidden");

  if (matches.length === 0) {
    resultsWrap.innerHTML = `
      <div class="flight-card">
        <div class="flight-title">No results</div>
        <div class="flight-sub">Try a callsign like EK403</div>
      </div>
    `;
    return;
  }

  renderResults(matches);
});

const sidebarCards = document.querySelectorAll(".sidebar-card");

function hideOtherCards() {
  sidebarCards.forEach(card => {
    card.classList.add("sidebar-hidden");
  });
}

function showOtherCards() {
  sidebarCards.forEach(card => {
    card.classList.remove("sidebar-hidden");
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();

  if (q.length > 0) {
    hideOtherCards();
    resultsWrap.classList.remove("hidden");
  } else {
    showOtherCards();
    resultsWrap.classList.add("hidden");
    resultsWrap.innerHTML = "";
  }
});