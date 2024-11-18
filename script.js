// Inizializzazione della mappa
const map = L.map('map').setView([45.4642, 9.19], 12); // Coordinate di Milano

// Aggiunta del layer di OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Funzione per aggiungere un marcatore alla mappa
function addMarkerToMap(lat, lng, text) {
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(text);
}

// Aggiunta di un marcatore iniziale
addMarkerToMap(45.4642, 9.19, "Centro di Milano");
