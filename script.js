import { carica, salva, incidenti } from './carica_salva.js';

const loginContainer = document.getElementById('login-container');
const modalContainer = document.getElementById('modal-container');
const mapContainer = document.getElementById('map-container');
const tableContainer = document.getElementById('table-container');

let myToken, myKey, tokenMap, map;
let renderTable; // funzione globale


let isLogged = false;


function loadConfig() {
  return new Promise((resolve, reject) => {
    fetch('./conf.json')
      .then((response) => {
        if (!response.ok) {
          reject('Errore nel caricamento del file JSON');
        }
        return response.json();
      })
      .then((data) => {
        resolve(data); // risolvo la promise con i dati
      })
      .catch((error) => reject('Errore: ' + error));
  });
}

loadConfig()
  .then((data) => {
    myToken = data.cacheToken;
    myKey = data.myKey;
    tokenMap = data.TokenLocationIQ;

    console.log(tokenMap);
    console.log(myKey);
    console.log(myToken);
    carica().then(() => {
      //console.log("aAAAAAAAAAA   ",incidenti);
      render(tokenMap, myToken);
      createTable(tableContainer, tokenMap);
    })

    //render(tokenMap);
  
  })
  .catch((error) => console.error(error));


function createIncidenteModal(parentElement) {
  const modalContainer = parentElement;

  // HTML della modale
  const modalHTML = `
    <button id="apriBtn" class="btn btn-primary">Aggiungi Incidente</button>

    <div id="incidenteModal" class="modal" tabindex="-1" style="display: none;">
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

  modalContainer.innerHTML += modalHTML;

  const modal = document.getElementById('incidenteModal');
  const apriBtn = document.getElementById('apriBtn');
  const cancelButton = document.getElementById('cancelButton');
  const submitButton = document.getElementById('submit');



  apriBtn.onclick = () => {
    console.log("PREMENDOOOOOOO")
    modal.style.display = 'block';
    console.log("Modale mostrata:", modal.style.display);
  };

  cancelButton.onclick = () => {
    modal.style.display = 'none';
  };

  submitButton.onclick = () => {
    const indirizzo = document.getElementById('indirizzo').value;
    const targhe = document.getElementById('targhe').value.split(',').map((t) => t.trim());
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

    // Aggiungo l'incidente alla lista
    incidenti.push(nuovoIncidente);
    salva()
    renderTable(); // funzione che aggiorna la lista degli incidenti
    modal.style.display = 'none'; // Chiudo la modale
  };
}

function createMap(parentElement){
  //CREO MAPPA
  parentElement.style.height = '500px';
  parentElement.style.width = '100%';

  map = L.map(parentElement).setView([45.4642, 9.19], 11); //coordinate di Milano
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);  
}

function createTable(parentElement, tokenMap){
  let searchTerm = '';

  renderTable = function(){
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
    filteredData.forEach((incidente, i) => {
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
      setTimeout(() => { // metto il setTimeout per irsolvere il 429
        getCoordinates(incidente.indirizzo, tokenMap).then(({ lat, lon }) => {
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
        })
        .catch((error) => {
          console.error(`Errore nel recupero delle coordinate per ${incidente.indirizzo}:`, error);
        });
      }, i * 1000); // Ritardo di 1 secondo moltiplicato per l'indice
    });

    html += '</table>';
    parentElement.innerHTML = html;
          

    document.getElementById('searchButton').onclick = () => {
      searchTerm = document.getElementById('searchInput').value;
      renderTable();
    };
  }
  renderTable();
}

function getCoordinates(indirizzo, tokenMap) {
  let ind_mil = indirizzo + ', Milano';
  let url = `https://us1.locationiq.com/v1/search?key=${tokenMap}&q=${encodeURIComponent(ind_mil)}&format=json`;
  //console.log("url:", url);

  // Restituisce una Promise che si risolve con le coordinate
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          resolve({ lat, lon });  // Risolve la Promise con le coordinate
        } else {
          console.log('Indirizzo non trovato:', indirizzo);
          reject('Indirizzo non trovato');
        }
      })
      .catch((error) => {
        console.error('Errore nel geocoding:', error);
        reject('Errore nel geocoding');
      });
  });
}

function createLogin(parentElement, myToken, modal_cont) {
  const loginContainer = parentElement;

  const loginHTML = `
  <button id="loginBtn" class="btn btn-primary">login</button>

  <div id="loginModal" class="modal" tabindex="-1" style="display: none;">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h1 class="modal-title fs-5">Login</h1>
        </div>

        <div class="modal-body">
          <form id="loginForm">

            <div class="form-group">
              <label for="user">User</label>
              <input type="text" class="form-control" id="user" required>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" class="form-control" id="password" required>
            </div>

            <button type="button" id="submitBtn" class="btn btn-primary">Invia</button>
            <button type="button" id="cancelBtn" class="btn btn-secondary">Annulla</button>
          </form>
        </div>
      </div>
    </div>
  </div>
`;

  loginContainer.innerHTML += loginHTML;

  const modal = document.getElementById('loginModal');
  const loginBtn = document.getElementById('loginBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitBtn');


  


  loginBtn.onclick = () => {
    modal.style.display = 'block';
  };

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };


  


}




function render(tokenMap, myToken){

  createLogin(loginContainer, myToken, modalContainer);
  
  //createIncidenteModal(modalContainer);

  createMap(mapContainer);

  createTable(tableContainer, tokenMap);
}