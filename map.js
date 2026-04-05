/* ============================================================
   map.js — Canvas, terrenos e interação do mapa
   ============================================================ */

const COLS = 60;
const ROWS = 40;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill('ocean'));
window.brushSize = 2;

let currentTerrain = 'ocean';
let painting = false;

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('mapContainer');

const TERRAIN_COLORS = {
  ocean:    '#1a3a5c',
  plains:   '#7ab648',
  forest:   '#2d5016',
  mountain: '#4a3728',
  desert:   '#c8a832',
  swamp:    '#3d6b3d',
  snow:     '#c8e0f0',
};

const TERRAIN_TEXTURE = {
  ocean:    '#1e4268',
  plains:   '#8dc955',
  forest:   '#3a6620',
  mountain: '#5c4535',
  desert:   '#d4b840',
  swamp:    '#4a7a4a',
  snow:     '#d8eaf8',
};

// ===== CANVAS RESIZE =====
function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  canvas.width  = Math.max(rect.width,  300);
  canvas.height = Math.max(rect.height, 460);
  drawMap();
}

window.addEventListener('resize', resizeCanvas);
// Delay first render so the container has its final size
setTimeout(resizeCanvas, 120);

// ===== DRAWING =====
function getCellSize() {
  return { w: canvas.width / COLS, h: canvas.height / ROWS };
}

function drawMap() {
  const { w, h } = getCellSize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Terrain cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      ctx.fillStyle = TERRAIN_COLORS[t] || '#1a3a5c';
      ctx.fillRect(c * w, r * h, w + 1, h + 1);

      // Simple texture detail
      ctx.fillStyle = TERRAIN_TEXTURE[t] || '#1e4268';
      ctx.globalAlpha = 0.35;

      if (t === 'ocean' && (r + c) % 4 === 0) {
        ctx.fillRect(c * w + 1, r * h + h * 0.4, w * 0.6, 1);

      } else if (t === 'forest' && (r + c) % 3 === 0) {
        ctx.fillRect(c * w + w * 0.3, r * h + h * 0.1, w * 0.4, h * 0.6);

      } else if (t === 'mountain' && (r + c) % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(c * w + w * 0.5, r * h + h * 0.1);
        ctx.lineTo(c * w + w * 0.9, r * h + h * 0.9);
        ctx.lineTo(c * w + w * 0.1, r * h + h * 0.9);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * h); ctx.lineTo(canvas.width, r * h); ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * w, 0); ctx.lineTo(c * w, canvas.height); ctx.stroke();
  }

  // Vignette
  const vg = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.75
  );
  vg.addColorStop(0, 'transparent');
  vg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cities (drawn by cities.js)
  if (typeof drawCities === 'function') drawCities(ctx, { w, h });

  // Compass rose
  drawCompass();
}

function drawCompass() {
  const x = canvas.width - 50, y = 50, r = 28;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(244,232,193,0.85)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c8960c'; ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#2c1a0e';
  ctx.font = 'bold 11px Cinzel, Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('N', x,     y - r + 10);
  ctx.fillText('S', x,     y + r - 10);
  ctx.fillText('L', x + r - 10, y);
  ctx.fillText('O', x - r + 10, y);

  ctx.strokeStyle = '#8b1a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - r + 14); ctx.lineTo(x, y); ctx.stroke();
  ctx.strokeStyle = '#4a3728'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + r - 14); ctx.stroke();

  ctx.restore();
}

// ===== INTERACTION =====
function getCell(e) {
  const rect  = canvas.getBoundingClientRect();
  const { w, h } = getCellSize();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top)  * scaleY;
  return { col: Math.floor(px / w), row: Math.floor(py / h) };
}

function paintCell(e) {
  // If city placement mode, delegate to cities.js
  if (window.cityMode) {
    const { col, row } = getCell(e);
    if (typeof openCityModal === 'function') openCityModal(col, row);
    return;
  }

  if (!painting) return;

  const { col, row } = getCell(e);
  const half = Math.floor(window.brushSize / 2);

  for (let dr = -half; dr <= half; dr++) {
    for (let dc = -half; dc <= half; dc++) {
      const rr = row + dr, cc = col + dc;
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
        grid[rr][cc] = currentTerrain === 'eraser' ? 'ocean' : currentTerrain;
      }
    }
  }
  drawMap();
}

canvas.addEventListener('mousedown',  e => { painting = true;  paintCell(e); });
canvas.addEventListener('mousemove',  e => { if (painting && !window.cityMode) paintCell(e); });
canvas.addEventListener('mouseup',    ()  => { painting = false; });
canvas.addEventListener('mouseleave', ()  => { painting = false; });

canvas.addEventListener('touchstart', e => { painting = true;  paintCell(e.touches[0]); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove',  e => { paintCell(e.touches[0]); e.preventDefault(); },                   { passive: false });
canvas.addEventListener('touchend',   ()  => { painting = false; });

// ===== TERRAIN MODE =====
function setTerrain(btn) {
  window.cityMode = null;
  currentTerrain = btn.dataset.terrain;
  document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('hint').textContent = '🖱 Clique e arraste para pintar o terreno';
}

// ===== MAP UTILS =====
function clearMap() {
  if (!confirm('Limpar todo o mapa e localidades?')) return;
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill('ocean'));
  if (typeof clearCities === 'function') clearCities();
  drawMap();
}

function generateTerrain() {
  const cx = COLS / 2 + Math.random() * 10 - 5;
  const cy = ROWS / 2 + Math.random() * 10 - 5;
  const islandR = Math.min(COLS, ROWS) * 0.35;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx = c - cx, dy = r - cy;
      const dist  = Math.sqrt(dx * dx + dy * dy);
      const noise = (Math.sin(c * 0.4 + Math.random()) * Math.cos(r * 0.4) + 1) * 0.5;
      const falloff = 1 - Math.min(1, dist / (islandR * (0.8 + noise * 0.4)));

      if (falloff < 0.05) { grid[r][c] = 'ocean'; continue; }

      const elevation = falloff + noise * 0.3;
      if      (elevation > 0.85) grid[r][c] = 'mountain';
      else if (elevation > 0.70) grid[r][c] = 'forest';
      else if (elevation > 0.55) grid[r][c] = 'plains';
      else if (elevation > 0.40) grid[r][c] = Math.random() < 0.2 ? 'swamp' : 'plains';
      else if (elevation > 0.15) grid[r][c] = Math.random() < 0.1 ? 'desert' : 'ocean';
      else                       grid[r][c] = 'ocean';
    }
  }

  // Desert patch
  const dRow = Math.floor(Math.random() * ROWS * 0.6 + ROWS * 0.2);
  const dCol = Math.floor(Math.random() * COLS * 0.6 + COLS * 0.2);
  for (let r = dRow - 4; r < dRow + 5; r++) {
    for (let c = dCol - 6; c < dCol + 7; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === 'plains') {
        grid[r][c] = 'desert';
      }
    }
  }

  // Snow in north rows
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== 'ocean' && Math.random() < 0.6) grid[r][c] = 'snow';
    }
  }

  drawMap();
}

function saveMap() {
  const link = document.createElement('a');
  link.download = 'mapa-rpg.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
