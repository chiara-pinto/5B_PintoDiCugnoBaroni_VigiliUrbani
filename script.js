const modalContainer = document.getElementById('modal-container');

modalContainer.innerHTML += `
  <button id="apriBtn" class="btn btn-primary">Aggiungi Incidente</button>

  <div id="incidenteModal" class="modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h1 class="modal-title fs-5">Aggiungi Incidente</h1>
        </div>

        <div class="modal-body">
          <form id="incidenteForm">

            <div class="form-group">
              <label for="indirizzo">Indirizzo</label>
              <input type="text" class="form-control" id="indirizzo" required>
            </div>

            <div class="form-group">
              <label for="targhe">Targhe (separate da virgola)</label>
              <input type="text" class="form-control" id="targhe" required>
            </div>

            <div class="form-group">
              <label for="dataOra">Data e Ora</label>
              <input type="datetime-local" class="form-control" id="dataOra" required>
            </div>

            <div class="form-group">
              <label for="feriti">Numero feriti</label>
              <input type="number" class="form-control" id="feriti" min="0" required>
            </div>
<div class="form-group">
              <label for="morti">Numero morti</label>
              <input type="number" class="form-control" id="morti" min="0" required>
            </div>

            <div class="form-group">
              <label for="descrizione">Descrizione</label>
              <textarea class="form-control" id="descrizione" required></textarea>
            </div>

            <button type="button" id="submit" class="btn btn-primary">Invia</button>
            <button type="button" id="cancelButton" class="btn btn-secondary">Annulla</button>
            
          </form>
        </div>
      </div>
    </div>
</div>
`;

document.getElementById('apriBtn').onclick = () => {
  document.getElementById('incidenteModal').style.display = 'block';
};

document.getElementById('cancelButton').onclick = () => {
  document.getElementById('incidenteModal').style.display = 'none';
};

document.getElementById('submit').onclick = () => {
  const indirizzo = document.getElementById('indirizzo').value;
  const targhe = document
    .getElementById('targhe')
    .value.split(',')
    .map((t) => t.trim());
  const dataOra = document.getElementById('dataOra').value;
  const [data, ora] = dataOra.split('T');
  const numFeriti = parseInt(document.getElementById('feriti').value, 10);
  const numMorti = parseInt(document.getElementById('morti').value, 10);
  const descrizione = document.getElementById('descrizione').value;

  const nuovoIncidente = {
    id: incidenti.length + 1,
    data,
    ora,
    indirizzo,
    targhe,
    numFeriti,
    numMorti,
    descrizione,
  };

  incidenti.push(nuovoIncidente);
  render();
  document.getElementById('incidenteModal').style.display = 'none';
};

const map = L.map('map').setView([45.4642, 9.19], 11); // Coordinate di Milano
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

const formContainer = document.getElementById('form-container');
const tableContainer = document.getElementById('table-container');
let incidenti = [];
let searchTerm = '';

// Dati degli incidenti
incidenti = [
  {
    id: 1,
    indirizzo: 'Viale Abruzzi 12, Milano',
    targhe: ['AB123CD', 'EF456GH', 'IJ789KL'],
    data: '2024-11-14',
    ora: '16:45',
    numFeriti: 2,
    numMorti: 0,
    descrizione: 'Tamponamento a catena',
  },
  {
    id: 2,
    indirizzo: 'Corso Buenos Aires 15, Milano',
    targhe: ['MN123OP', 'QR456ST'],
    data: '2024-11-13',
    ora: '09:10',
    numFeriti: 1,
    numMorti: 0,
    descrizione: 'Investimento pedonale',
  },
  {
    id: 3,
    indirizzo: 'Piazza Duomo 1, Milano',
    targhe: ['UV789WX'],
    data: '2024-11-12',
    ora: '12:50',
    numFeriti: 0,
    numMorti: 1,
    descrizione: 'Scontro tra taxi',
  },
  {
    id: 4,
    indirizzo: 'Via Torino 5, Milano',
    targhe: ['YZ123AB', 'CD456EF'],
    data: '2024-11-11',
    ora: '18:30',
    numFeriti: 3,
    numMorti: 0,
    descrizione: 'Incidente con feriti lievi',
  },
];

// Funzione per ottenere le coordinate (latitudine e longitudine) tramite Nominatim
function getCoordinates(indirizzo, callback) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(indirizzo)}`;//``
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        callback(lat, lon);
      } else {
        console.log('Indirizzo non trovato: ', indirizzo);
      }
    })
    .catch((error) => console.error('Errore nel geocoding: ', error));
}

// Funzione per il rendering della tabella e mappa
function render() {
  let html = '';

  // input
  html += `
    <div class="input-group mb-3">
      <input type="text" id="searchInput" class="form-control" placeholder="Cerca per indirizzo..." value="${searchTerm}">
      <button id="searchButton" class="btn btn-primary">Cerca</button>
    </div>
  `;

  // tabella
  html += '<table class="table table-bordered table-striped">';
  html += `
    <thead>
      <tr>
        <th>ID</th>
        <th>Indirizzo</th>
        <th>Targhe Coinvolte</th>
        <th>Data e Ora</th>
        <th>Numero Feriti</th>
        <th>Numero Morti</th>
        <th>Descrizione</th>
      </tr>
    </thead>
  `;

  // filtraggio degli incidenti
  const filteredData = incidenti.filter((incidente) =>
    incidente.indirizzo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // popolazione righe tabella con i dati filtrati
  filteredData.forEach((incidente) => {
    const targhe = incidente.targhe.join(', ');
    html += `
      <tr>
        <td>${incidente.id}</td>
        <td>${incidente.indirizzo}</td>
        <td>${targhe}</td>
        <td>${incidente.data} ${incidente.ora}</td>
        <td>${incidente.numFeriti}</td>
        <td>${incidente.numMorti}</td>
        <td>${incidente.descrizione}</td>
      </tr>
    `;

    // aggiungo un marcatore
    getCoordinates(incidente.indirizzo, (lat, lon) => {
      if (lat && lon) {
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(
            `<b>${incidente.indirizzo}</b><br>
             Data: ${incidente.data}<br>
             Feriti: ${incidente.numFeriti}, Morti: ${incidente.numMorti}<br>
             ${incidente.descrizione}`
          );
      }
    });
  });

  html += '</table>';
  tableContainer.innerHTML = html;

  document.getElementById('searchButton').onclick = () => {
    searchTerm = document.getElementById('searchInput').value;
    render();
  };
}

render();