const modalContainer = document.getElementById('modal-container');

// Generazione della modale per aggiungere un nuovo incidente
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