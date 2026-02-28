var map = L.map('map').setView([25.276987, 55.296249], 8);

// Dark Base Map (better for radar UI)
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap & CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
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
    opacity: 0.1
  }
);

// Weather Layer (precipitation)
const precipitationLayer = L.tileLayer(
  'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=7379ab9c5e4ad29769cb06aeb1f9853e',
  {
    attribution: '&copy; OpenWeatherMap',
    opacity: 0.9,
    color: 'blue'
  }
);

// Weather Layer (Wind)
const windLayer = L.tileLayer(
  'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=7379ab9c5e4ad29769cb06aeb1f9853e',
    {
    attribution: '&copy; OpenWeatherMap',
    opacity: 0.8,
    color: 'green'
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

  // If no matches, show a small message card
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

    // your existing renderResults() call here
  } else {
    showOtherCards();
    resultsWrap.classList.add("hidden");
    resultsWrap.innerHTML = "";
  }
});

function LogOut() {
    // Clear any stored user data (e.g., tokens, session info)
    localStorage.clear();
    // Redirect to login page
    window.location.href = "login.html";
}
