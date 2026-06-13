/* ── Config ──────────────────────────────────────── */
const API_BASE = 'http://localhost:8086';

const ENDPOINTS = {
  allTrains  : `${API_BASE}/trains`,
  searchCode : (src, dst) =>
    `${API_BASE}/search/by-code?sourceCode=${encodeURIComponent(src)}&destinationCode=${encodeURIComponent(dst)}`,
  searchName : (src, dst) =>
    `${API_BASE}/search/by-name?sourceName=${encodeURIComponent(src)}&destinationName=${encodeURIComponent(dst)}`
};

/* Accent colours cycling per card */
const CARD_ACCENTS = [
  '#f5a623', '#4ade80', '#60a5fa', '#f472b6',
  '#a78bfa', '#fb923c', '#34d399', '#e879f9'
];

/* ── DOM Refs ─────────────────────────────────────── */
const navBtns       = document.querySelectorAll('.nav-btn');
const tabPanels     = document.querySelectorAll('.tab-panel');

const allLoader     = document.getElementById('all-loader');
const allStatus     = document.getElementById('all-status');
const trainsGrid    = document.getElementById('trains-grid');
const btnRefreshAll = document.getElementById('btn-refresh-all');

const searchLoader  = document.getElementById('search-loader');
const searchStatus  = document.getElementById('search-status');
const searchResults = document.getElementById('search-results');

/* Code mode */
const srcInput     = document.getElementById('src-code');
const dstInput     = document.getElementById('dst-code');
const btnSwapCode  = document.getElementById('btn-swap-code');
const rowCode      = document.getElementById('row-code');

/* Name mode */
const srcNameInput = document.getElementById('src-name');
const dstNameInput = document.getElementById('dst-name');
const btnSwapName  = document.getElementById('btn-swap-name');
const rowName      = document.getElementById('row-name');

const btnSearch    = document.getElementById('btn-search');
const modeBtns     = document.querySelectorAll('.mode-btn');

let searchMode = 'code'; // 'code' | 'name'

/* Templates */
const tmplTrainCard     = document.getElementById('tmpl-train-card');
const tmplSchedule      = document.getElementById('tmpl-schedule');
const tmplSearchResult  = document.getElementById('tmpl-search-result');

/* ── Tab Navigation ───────────────────────────────── */
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    navBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');
  });
});

/* ── Search Mode Toggle ───────────────────────────── */
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    searchMode = btn.dataset.mode;
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (searchMode === 'code') {
      rowCode.classList.remove('hidden');
      rowName.classList.add('hidden');
    } else {
      rowName.classList.remove('hidden');
      rowCode.classList.add('hidden');
    }

    clearStatus(searchStatus);
    searchResults.innerHTML = '';
  });
});

/* ── Helpers ──────────────────────────────────────── */
function setStatus(el, msg, type = '') {
  el.textContent = msg;
  el.className = `status-bar ${type}`.trim();
}

function clearStatus(el) {
  el.textContent = '';
  el.className = 'status-bar';
}

function showLoader(el) { el.classList.remove('hidden'); }
function hideLoader(el) { el.classList.add('hidden'); }

function scheduleLabel(count) {
  return count === 1 ? '1 route' : `${count} routes`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/* ── Build Train Card ─────────────────────────────── */
function buildTrainCard(train, accentColor) {
  const card = tmplTrainCard.content.cloneNode(true);

  card.querySelector('.card-accent').style.background = accentColor;
  card.querySelector('.train-number').textContent = `# ${train.trainNumber}`;
  card.querySelector('.train-name').textContent = train.trainName;

  const schedules = train.scheduleList || [];
  card.querySelector('.schedule-badge').textContent = scheduleLabel(schedules.length);

  const scheduleList = card.querySelector('.schedule-list');

  if (schedules.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'font-size:12px;color:var(--text-3);margin-top:8px;';
    empty.textContent = 'No schedules available.';
    scheduleList.appendChild(empty);
  } else {
    schedules.forEach(sched => {
      scheduleList.appendChild(buildScheduleItem(sched));
    });
  }

  return card;
}

/* ── Build Schedule Item ──────────────────────────── */
function buildScheduleItem(sched) {
  const item = tmplSchedule.content.cloneNode(true);

  item.querySelector('.src-station .station-code').textContent = sched.source?.stationCode ?? '—';
  item.querySelector('.src-station .station-name').textContent = sched.source?.stationName ?? '';
  item.querySelector('.dst-station .station-code').textContent = sched.destination?.stationCode ?? '—';
  item.querySelector('.dst-station .station-name').textContent = sched.destination?.stationName ?? '';
  item.querySelector('.depart-time').textContent = sched.departureTime ?? '';
  item.querySelector('.arrive-time').textContent = sched.arrivalTime ?? '';

  return item;
}

/* ── Build Search Result Card ─────────────────────── */
function buildSearchResult(result, index) {
  const card = tmplSearchResult.content.cloneNode(true);

  const train = result.train ?? {};
  card.querySelector('.train-number').textContent = `# ${train.trainNumber ?? '—'}`;
  card.querySelector('.train-name').textContent = train.trainName ?? 'Unknown Train';

  card.querySelector('.result-station.origin .result-time').textContent =
    result.departureTime ?? '—';
  card.querySelector('.result-station.origin .result-code').textContent =
    result.source?.stationCode ?? '—';
  card.querySelector('.result-station.origin .result-sname').textContent =
    result.source?.stationName ?? '';

  card.querySelector('.result-station.dest .result-time').textContent =
    result.arrivalTime ?? '—';
  card.querySelector('.result-station.dest .result-code').textContent =
    result.destination?.stationCode ?? '—';
  card.querySelector('.result-station.dest .result-sname').textContent =
    result.destination?.stationName ?? '';

  /* stagger animation */
  const el = card.querySelector('.result-card');
  if (el) el.style.animationDelay = `${index * 0.06}s`;

  return card;
}

/* ── Load All Trains ──────────────────────────────── */
async function loadAllTrains() {
  trainsGrid.innerHTML = '';
  clearStatus(allStatus);
  showLoader(allLoader);

  try {
    const trains = await fetchJSON(ENDPOINTS.allTrains);
    hideLoader(allLoader);

    if (!Array.isArray(trains) || trains.length === 0) {
      trainsGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon">🚂</span>
          <p>No trains found on the network.</p>
        </div>`;
      return;
    }

    trains.forEach((train, i) => {
      const color = CARD_ACCENTS[i % CARD_ACCENTS.length];
      trainsGrid.appendChild(buildTrainCard(train, color));
    });

    setStatus(allStatus, `${trains.length} train${trains.length !== 1 ? 's' : ''} loaded`, 'info');
    setTimeout(() => clearStatus(allStatus), 3000);

  } catch (err) {
    hideLoader(allLoader);
    setStatus(allStatus, `Failed to load trains: ${err.message}`, 'error');
    console.error(err);
  }
}

/* ── Search Trains ────────────────────────────────── */
async function searchTrains() {
  clearStatus(searchStatus);
  searchResults.innerHTML = '';

  let src, dst, url, displaySrc, displayDst;

  if (searchMode === 'code') {
    src = srcInput.value.trim().toUpperCase();
    dst = dstInput.value.trim().toUpperCase();
    if (!src || !dst) {
      setStatus(searchStatus, 'Please enter both origin and destination station codes.', 'error');
      return;
    }
    url = ENDPOINTS.searchCode(src, dst);
    displaySrc = src;
    displayDst = dst;
  } else {
    src = srcNameInput.value.trim();
    dst = dstNameInput.value.trim();
    if (!src || !dst) {
      setStatus(searchStatus, 'Please enter both origin and destination station names.', 'error');
      return;
    }
    url = ENDPOINTS.searchName(src, dst);
    displaySrc = src;
    displayDst = dst;
  }

  showLoader(searchLoader);
  btnSearch.disabled = true;

  try {
    const results = await fetchJSON(url);
    hideLoader(searchLoader);
    btnSearch.disabled = false;

    if (!Array.isArray(results) || results.length === 0) {
      searchResults.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>No trains found between <strong>${displaySrc}</strong> and <strong>${displayDst}</strong>.<br>
          Check the station ${searchMode === 'code' ? 'codes' : 'names'} and try again.</p>
        </div>`;
      return;
    }

    setStatus(searchStatus,
      `${results.length} train${results.length !== 1 ? 's' : ''} found: ${displaySrc} → ${displayDst}`,
      'info'
    );

    results.forEach((r, i) => {
      searchResults.appendChild(buildSearchResult(r, i));
    });

  } catch (err) {
    hideLoader(searchLoader);
    btnSearch.disabled = false;
    setStatus(searchStatus, `Search failed: ${err.message}`, 'error');
    console.error(err);
  }
}

/* ── Swap Buttons ─────────────────────────────────── */
btnSwapCode.addEventListener('click', () => {
  const temp = srcInput.value;
  srcInput.value = dstInput.value;
  dstInput.value = temp;
});

btnSwapName.addEventListener('click', () => {
  const temp = srcNameInput.value;
  srcNameInput.value = dstNameInput.value;
  dstNameInput.value = temp;
});

/* ── Event Listeners ──────────────────────────────── */
btnRefreshAll.addEventListener('click', loadAllTrains);
btnSearch.addEventListener('click', searchTrains);

/* Enter key triggers search on any input */
[srcInput, dstInput, srcNameInput, dstNameInput].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchTrains();
  });
});

/* Auto-uppercase for code inputs only */
[srcInput, dstInput].forEach(input => {
  input.addEventListener('input', () => {
    const pos = input.selectionStart;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(pos, pos);
  });
});

/* ── Init ─────────────────────────────────────────── */
loadAllTrains();
