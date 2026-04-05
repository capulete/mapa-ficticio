# ⚔ Forja de Mundos — Gerador de Mapas RPG

Um gerador de mapas interativo para RPG com suporte a IA (Claude API), construído com HTML, CSS e JavaScript puro. Funciona direto no navegador, sem dependências.

![Forja de Mundos](https://img.shields.io/badge/RPG-Map%20Generator-gold?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-green?style=for-the-badge)

## 🚀 Como usar

### Opção 1 — GitHub Pages (recomendado)
1. Faça fork deste repositório
2. Vá em **Settings → Pages**
3. Em "Source", selecione **main** e pasta **/ (root)**
4. Acesse `https://seu-usuario.github.io/rpg-map-generator`

### Opção 2 — Localmente
```bash
git clone https://github.com/seu-usuario/rpg-map-generator.git
cd rpg-map-generator
# Abra o index.html no navegador — sem servidor necessário!
```

## 🗺 Funcionalidades

- **Pintar terrenos** — oceano, planície, floresta, montanha, deserto, pântano e neve
- **Pincel ajustável** — tamanho 1 a 5
- **Adicionar localidades** — cidades, aldeias, castelos, masmorras, portos e templos
- **Geração procedural** — terreno aleatório com biomas realistas
- **IA integrada** — descrição narrativa do mundo via Claude API (requer chave)
- **Sugestão automática de cidades** — a IA popula o mapa com localidades temáticas
- **Exportar PNG** — salva o mapa como imagem
- **Responsivo** — funciona em desktop e mobile

## 🤖 Configurando a IA (opcional)

A IA usa a [API do Claude (Anthropic)](https://console.anthropic.com/).

1. Crie uma conta em [console.anthropic.com](https://console.anthropic.com/)
2. Gere uma API Key
3. Abra o arquivo `js/ai.js`
4. Substitua `SUA_CHAVE_AQUI` pela sua chave:

```js
const API_KEY = 'sk-ant-...';
```

> ⚠ **Atenção:** Nunca exponha sua chave em repositórios públicos!  
> Para produção, use um backend proxy para proteger a chave.

## 📁 Estrutura do projeto

```
rpg-map-generator/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos completos
├── js/
│   ├── map.js          # Lógica do canvas e terrenos
│   ├── cities.js       # Gerenciamento de localidades
│   └── ai.js           # Integração com Claude API
└── README.md
```

## 🛠 Tecnologias

- HTML5 Canvas
- CSS3 (sem frameworks)
- JavaScript ES6+ (sem dependências)
- Claude API (Anthropic) — opcional

## 📜 Licença

MIT — use à vontade para seus projetos!
