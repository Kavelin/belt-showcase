
    const BELT_ORDER = [
      { name: "Black Belt", class: "belt-black" },
      { name: "Red Belt", class: "belt-red" },
      { name: "Brown Belt", class: "belt-brown" },
      { name: "Purple Belt", class: "belt-purple" },
      { name: "Blue Belt", class: "belt-blue" },
      { name: "Green Belt", class: "belt-green" },
      { name: "Orange Belt", class: "belt-orange" },
      { name: "Yellow Belt", class: "belt-yellow" },
      { name: "White Belt", class: "belt-white" }
    ];

    let currentData = [];
    let checkedMap = {};

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('csv-file');

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#38bdf8'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          processCSV(results.data);
        }
      });
    }

    function processCSV(data) {
      currentData = data.filter(row => row['Participant First Name'] || row['Participant Last Name']);
      checkedMap = {};
      document.getElementById('controls').style.display = 'flex';
      renderBoard();
    }

    function normalizeBeltName(rankStr) {
      if (!rankStr) return "White Belt";
      const clean = rankStr.trim().toLowerCase();
      for (const b of BELT_ORDER) {
        if (clean.includes(b.name.toLowerCase().replace(' belt', ''))) {
          return b.name;
        }
      }
      return "White Belt";
    }

    function renderBoard() {
      const board = document.getElementById('showcase-board');
      board.innerHTML = '';

      const searchTerm = document.getElementById('search-input').value.toLowerCase();

      // Group students by normalized belt rank
      const grouped = {};
      BELT_ORDER.forEach(b => grouped[b.name] = []);

      let visibleTotal = 0;

      currentData.forEach((row, index) => {
        const firstName = (row['Participant First Name'] || '').trim();
        const lastName = (row['Participant Last Name'] || '').trim();
        const fullName = `${firstName} ${lastName[0]}`.trim().toUpperCase();
        const rank = row['Rank'] || '';
        const normBelt = normalizeBeltName(rank);

        if (fullName.toLowerCase().includes(searchTerm)) {
          grouped[normBelt].push({
            id: index,
            name: fullName,
            status: row['Status'] || 'Active'
          });
          visibleTotal++;
        }
      });

      let verifiedTotal = 0;

      BELT_ORDER.forEach(belt => {
        const tierDiv = document.createElement('div');
        tierDiv.className = 'belt-tier';

        const headerDiv = document.createElement('div');
        headerDiv.className = `belt-header ${belt.class}`;
        
        const count = grouped[belt.name].length;
        headerDiv.innerHTML = `
          <span>${belt.name}</span>
          <span class="belt-count">${count} Ninjas</span>
        `;
        tierDiv.appendChild(headerDiv);

        const gridDiv = document.createElement('div');
        gridDiv.className = `student-grid ${belt.class}`;

        if (count === 0) {
          gridDiv.innerHTML = `<div class="empty-belt">No ninjas in this belt rank</div>`;
        } else {
          grouped[belt.name].forEach(student => {
            const isChecked = !!checkedMap[student.id];
            if (isChecked) verifiedTotal++;

            const card = document.createElement('div');
            card.className = `student-card ${isChecked ? 'checked' : ''}`;
            card.onclick = (e) => toggleCheck(student.id, e);

            card.innerHTML = `
              <div class="student-info">
                <span class="student-name">${student.name}</span>
              </div>
              <input type="checkbox" class="audit-checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleCheck(${student.id});" />
            `;
            gridDiv.appendChild(card);
          });
        }

        tierDiv.appendChild(gridDiv);
        board.appendChild(tierDiv);
      });

      // Update counter badges
      document.getElementById('total-count').textContent = `Total: ${visibleTotal}`;
      document.getElementById('verified-count').textContent = `Verified: ${verifiedTotal}`;
      document.getElementById('remaining-count').textContent = `Remaining: ${visibleTotal - verifiedTotal}`;
    }

    function toggleCheck(id) {
      checkedMap[id] = !checkedMap[id];
      renderBoard();
    }

    function filterNinjas() {
      renderBoard();
    }
