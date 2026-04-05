/* ============================================================
   cities.js — Gerenciamento de localidades no mapa
   ============================================================ */

let cities = [];
window.cityMode = null;
let pendingCity = null;

const CITY_ICONS = {
  city:    '🏙',
  village: '🏘',
  castle:  '🏰',
  dungeon: '💀',
  port:    '⚓',
  temple:  '⛩',
};

// ===== DRAW CITIES ON CANVAS =====
function drawCities(ctx, { w, h }) {
  const fs = Math.min(w, h) * 1.5;
  ctx.font = `${fs}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const city of cities) {
    const x = city.col * w + w / 2;
    const y = city.row * h + h / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(CITY_ICONS[city.type] || '📍', x, y);
    ctx.shadowBlur = 0;

    if (fs > 10) {
      const labelSize = Math.max(8, fs * 0.55);
      ctx.font = `bold ${labelSize}px Cinzel, Georgia, serif`;
      ctx.fillStyle = 'rgba(244,232,193,0.95)';
      ctx.strokeStyle = 'rgba(44,26,14,0.9)';
      ctx.lineWidth = 2.5;
      ctx.strokeText(city.name, x, y + fs * 0.75);
      ctx.fillText(city.name, x, y + fs * 0.75);
      ctx.font = `${fs}px serif`;
    }
  }
}

// ===== CITY MODE (placed by clicking on map) =====
function setCityMode(btn, type) {
  window.cityMode = type;
  document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('hint').textContent = '📍 Clique no mapa para posicionar a localidade';
}

function openCityModal(col, row) {
  pendingCity = { col, row, type: window.cityMode };
  document.getElementById('cityTypeSelect').value = window.cityMode;
  document.getElementById('cityName').value = '';
  document.getElementById('cityModal').classList.add('open');
  document.getElementById('cityName').focus();
}

function confirmCity() {
  const name = document.getElementById('cityName').value.trim();
  if (!name) {
    document.getElementById('cityName').style.borderColor = '#8b1a1a';
    return;
  }
  const type = document.getElementById('cityTypeSelect').value;
  cities.push({ ...pendingCity, name, type });
  renderCityList();
  drawMap();
  closeCityModal();
}

function cancelCity() {
  closeCityModal();
}

function closeCityModal() {
  document.getElementById('cityModal').classList.remove('open');
  window.cityMode = null;
  pendingCity = null;
  document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
  const firstBtn = document.querySelector('[data-terrain="ocean"]');
  if (firstBtn) firstBtn.classList.add('active');
}

document.getElementById('cityName').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmCity();
  if (e.key === 'Escape') cancelCity();
});

// ===== CITY LIST UI =====
function renderCityList() {
  const list = document.getElementById('cityList');
  if (!cities.length) {
    list.innerHTML = '<div class="empty-msg">Nenhuma localidade adicionada ainda...</div>';
    return;
  }
  list.innerHTML = cities.map((c, i) => `
    <div class="city-item" onclick="selectCity(${i})">
      <span class="city-icon">${CITY_ICONS[c.type] || '📍'}</span>
      <span class="city-name">${escapeHtml(c.name)}</span>
      <span class="city-type">${c.type}</span>
      <span class="city-delete" onclick="deleteCity(event,${i})">✕</span>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function selectCity(i) {
  drawMap();
  // Briefly highlight the selected city
  const { w, h } = getCellSize();
  const c = cities[i];
  const ctx = document.getElementById('mapCanvas').getContext('2d');
  ctx.strokeStyle = '#c8960c';
  ctx.lineWidth = 2;
  ctx.strokeRect(c.col * w - 2, c.row * h - 2, w + 4, h + 4);
}

function deleteCity(e, i) {
  e.stopPropagation();
  cities.splice(i, 1);
  renderCityList();
  drawMap();
}

function clearCities() {
  cities = [];
  renderCityList();
}

// ===== EXPOSE for ai.js =====
function addCityFromAI(cityData) {
  cities.push(cityData);
  renderCityList();
}

function getCities() {
  return cities;
}
