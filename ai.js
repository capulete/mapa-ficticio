/* ============================================================
   ai.js — Integração com a API do Claude (Anthropic)
   
   A chave é inserida pelo usuário no campo da interface.
   NUNCA salve sua API Key diretamente neste arquivo se o
   repositório for público.
   ============================================================ */

// ===== HELPERS =====
function getApiKey() {
  return document.getElementById('apiKey').value.trim();
}

function typewriter(el, text, speed = 18) {
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i] || '';
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

async function callClaude(prompt, maxTokens = 1000) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key não informada. Insira sua chave no campo acima.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            apiKey,
      'anthropic-version':    '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}

// ===== MAIN AI GENERATION =====
async function generateWithAI() {
  const desc = document.getElementById('worldDesc').value.trim();
  const aiBox = document.getElementById('aiResponse');

  if (!desc) {
    document.getElementById('worldDesc').style.borderColor = '#8b1a1a';
    setTimeout(() => document.getElementById('worldDesc').style.borderColor = '', 1500);
    return;
  }

  if (!getApiKey()) {
    aiBox.className = 'ai-response';
    aiBox.textContent = '⚠ Insira sua API Key do Claude no campo acima para usar a IA.';
    return;
  }

  aiBox.className = 'ai-response loading';
  aiBox.textContent = '✦ O oráculo consulta os pergaminhos antigos...';

  // Generate terrain first
  generateTerrain();

  const existingCities = getCities();
  const cityNames = existingCities.map(c => c.name).join(', ');

  const prompt = `Você é um narrador de RPG de fantasia medieval.
O mundo foi descrito como: "${desc}".
${existingCities.length > 0 ? `Localidades existentes neste mundo: ${cityNames}.` : ''}

Crie uma descrição épica e atmosférica deste mundo em 3-4 parágrafos curtos. Inclua:
- A história e lore do mundo
- Os perigos e mistérios das regiões
- Facções, conflitos ou segredos
- Ganchos de aventura para os jogadores

Escreva em português do Brasil com tom de narrador épico medieval. Seja conciso mas envolvente.`;

  try {
    const text = await callClaude(prompt, 1000);
    aiBox.className = 'ai-response';
    typewriter(aiBox, text);

    // Auto-suggest cities if map has none
    if (existingCities.length === 0) {
      await suggestCities(desc);
    }

  } catch (err) {
    aiBox.className = 'ai-response';
    aiBox.textContent = `⚠ ${err.message}`;
  }
}

// ===== CITY SUGGESTION =====
async function suggestCities(desc) {
  const prompt = `Para um mundo de RPG descrito como: "${desc}", sugira 4 localidades importantes.
Responda APENAS com JSON válido, sem nenhum texto adicional, sem markdown, sem backticks.
Formato exato: [{"name":"Nome","type":"city|village|castle|dungeon|port|temple"}]`;

  try {
    const raw = await callClaude(prompt, 400);
    const clean = raw.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(clean);

    const positions = [
      { row: 10, col: 15 },
      { row:  8, col: 40 },
      { row: 25, col: 20 },
      { row: 28, col: 42 },
    ];

    suggestions.forEach((s, i) => {
      if (i < positions.length) {
        addCityFromAI({
          ...positions[i],
          name: s.name,
          type: s.type || 'city',
        });
      }
    });

    drawMap();

  } catch (e) {
    // Silent fail — city suggestion is optional
    console.warn('Sugestão de cidades falhou:', e.message);
  }
}
