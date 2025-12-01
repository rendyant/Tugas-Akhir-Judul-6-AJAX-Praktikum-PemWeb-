const state = {
    currentUnit: 'metric',
    currentCity: 'Jakarta',
    currentCoords: { lat: -6.2088, lon: 106.8456 },
    updateInterval: null,
    favoriteCities: JSON.parse(localStorage.getItem('favoriteCities')) || [
        { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
        { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
        { name: 'Surabaya', lat: -7.2575, lon: 112.7521 }
    ]
};

const weatherIcons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '⛈️',
    71: '🌨️', 73: '🌨️', 75: '❄️', 77: '❄️',
    80: '🌦️', 81: '🌧️', 82: '⛈️',
    85: '🌨️', 86: '❄️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const weatherDescriptions = {
    0: 'Cerah',
    1: 'Cerah Berawan',
    2: 'Berawan Sebagian',
    3: 'Mendung',
    45: 'Berkabut',
    48: 'Kabut Tebal',
    51: 'Gerimis Ringan',
    53: 'Gerimis',
    55: 'Gerimis Lebat',
    61: 'Hujan Ringan',
    63: 'Hujan Sedang',
    65: 'Hujan Lebat',
    71: 'Salju Ringan',
    73: 'Salju Sedang',
    75: 'Salju Lebat',
    77: 'Butiran Salju',
    80: 'Hujan Ringan',
    81: 'Hujan Sedang',
    82: 'Hujan Sangat Lebat',
    85: 'Salju Ringan',
    86: 'Salju Lebat',
    95: 'Badai Petir',
    96: 'Badai Petir dengan Hujan Es',
    99: 'Badai Petir dengan Hujan Es Lebat'
};

function init() {
    loadFavorites();
    fetchWeatherData(state.currentCoords, state.currentCity);
    startAutoUpdate();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('citySearch').addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSearch();
    });
    document.getElementById('citySearch').addEventListener('input', handleSearchInput);

    document.getElementById('unitToggle').addEventListener('click', toggleUnit);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        fetchWeatherData(state.currentCoords, state.currentCity);
    });
    document.getElementById('addFavoriteBtn').addEventListener('click', addCurrentToFavorites);

    document.addEventListener('click', e => {
        if (!e.target.closest('.search-container')) {
            document.getElementById('suggestions').style.display = 'none';
        }
    });
}

async function handleSearchInput(e) {
    const query = e.target.value.trim();
    const suggestions = document.getElementById('suggestions');

    if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&country=ID&language=id&format=json`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = data.results.map(c => `
            <div class="suggestion-item"
                onclick="selectCity('${c.name}', ${c.latitude}, ${c.longitude})">
                ${c.name} — ${c.admin1 || 'Indonesia'}
            </div>
        `).join('');

        suggestions.style.display = 'block';

    } catch (err) {
        console.error(err);
    }
}

async function handleSearch() {
    const input = document.getElementById('citySearch').value.trim();
    if (!input) return;

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=1&country=ID&language=id&format=json`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            showStatus("Kota tidak ditemukan di Indonesia.", "error");
            return;
        }

        const c = data.results[0];
        selectCity(c.name, c.latitude, c.longitude);

    } catch (err) {
        showStatus("Terjadi kesalahan saat mencari kota.", "error");
    }
}

function selectCity(name, lat, lon) {
    state.currentCity = name;
    state.currentCoords = { lat, lon };

    document.getElementById('citySearch').value = name;
    document.getElementById('suggestions').style.display = 'none';

    fetchWeatherData({ lat, lon }, name);
}

async function fetchWeatherData(coords, cityName) {
    showLoading(true);
    hideStatus();

    try {
        const currentUrl = `
            https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}
            &current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure
            &timezone=auto
        `.replace(/\s+/g, '');

        const forecastUrl = `
            https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}
            &daily=weather_code,temperature_2m_max,temperature_2m_min
            &timezone=auto&forecast_days=5
        `.replace(/\s+/g, '');

        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        updateCurrentWeather(currentData, cityName);
        updateForecast(forecastData);

        showStatus("Data cuaca berhasil dimuat!", "success");

    } catch (err) {
        showStatus("Gagal mengambil data cuaca.", "error");
        console.error(err);
    } finally {
        showLoading(false);
    }
}

function updateCurrentWeather(data, cityName) {
    const c = data.current;
    const unit = state.currentUnit === 'metric' ? '°C' : '°F';

    let temp = Math.round(c.temperature_2m);
    let feels = Math.round(c.apparent_temperature);

    if (state.currentUnit === 'imperial') {
        temp = Math.round((temp * 9/5) + 32);
        feels = Math.round((feels * 9/5) + 32);
    }

    document.getElementById('locationInfo').textContent = cityName;
    document.getElementById('timestamp').textContent = new Date().toLocaleString('id-ID', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('tempDisplay').textContent = `${temp}${unit}`;
    document.getElementById('weatherIconMain').textContent = weatherIcons[c.weather_code] || '☀️';
    document.getElementById('weatherDesc').textContent = weatherDescriptions[c.weather_code] || 'Cerah';

    document.getElementById('humidity').textContent = `${c.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(c.wind_speed_10m)} km/h`;
    document.getElementById('feelsLike').textContent = `${feels}${unit}`;
    document.getElementById('pressure').textContent = `${Math.round(c.surface_pressure)} hPa`;
}

function updateForecast(data) {
    const daily = data.daily;
    const unit = state.currentUnit === 'metric' ? '°C' : '°F';

    const html = daily.time.map((date, i) => {
        if (i === 0) return '';

        let maxT = Math.round(daily.temperature_2m_max[i]);
        let minT = Math.round(daily.temperature_2m_min[i]);

        if (state.currentUnit === 'imperial') {
            maxT = Math.round((maxT * 9/5) + 32);
            minT = Math.round((minT * 9/5) + 32);
        }

        const code = daily.weather_code[i];

        return `
            <div class="forecast-card">
                <div class="forecast-day">${
                    new Date(date).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'short'
                })}</div>

                <div class="forecast-icon">${weatherIcons[code]}</div>
                <div class="forecast-desc">${weatherDescriptions[code]}</div>

                <div class="forecast-temp">
                    <span class="temp-max">${maxT}${unit}</span>
                    <span class="temp-min">${minT}${unit}</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('forecastGrid').innerHTML = html;
}

function loadFavorites() {
    document.getElementById('favorites').innerHTML =
        state.favoriteCities.map(c => `
            <div class="favorite-chip">
                <span onclick="selectCity('${c.name}', ${c.lat}, ${c.lon})">${c.name}</span>
                <span class="remove" onclick="removeFavorite('${c.name}')">✕</span>
            </div>
        `).join('');
}

function addCurrentToFavorites() {
    if (state.favoriteCities.some(c => c.name === state.currentCity)) {
        showStatus("Kota sudah ada di favorit!", "error");
        return;
    }

    state.favoriteCities.push({
        name: state.currentCity,
        lat: state.currentCoords.lat,
        lon: state.currentCoords.lon
    });

    localStorage.setItem('favoriteCities', JSON.stringify(state.favoriteCities));
    loadFavorites();
    showStatus("Ditambahkan ke favorit!", "success");
}

function removeFavorite(name) {
    state.favoriteCities = state.favoriteCities.filter(c => c.name !== name);
    localStorage.setItem('favoriteCities', JSON.stringify(state.favoriteCities));
    loadFavorites();
    showStatus("Dihapus dari favorit", "success");
}

function toggleUnit() {
    state.currentUnit = state.currentUnit === 'metric' ? 'imperial' : 'metric';
    fetchWeatherData(state.currentCoords, state.currentCity);
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');

    if (document.body.classList.contains('light-theme')) {
        icon.textContent = '☀️';
        text.textContent = 'Mode Terang';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Mode Gelap';
    }
}

function startAutoUpdate() {
    state.updateInterval = setInterval(() => {
        fetchWeatherData(state.currentCoords, state.currentCity);
    }, 300000);
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
    document.getElementById('mainWeather').classList.toggle('hidden', show);
}

function showStatus(message, type) {
    const el = document.getElementById('statusMessage');
    el.textContent = message;
    el.className = `status-message active ${type}`;

    setTimeout(() => el.classList.remove('active'), 3000);
}

function hideStatus() {
    document.getElementById('statusMessage').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', init);
