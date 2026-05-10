/*
  app logic:
  - handle view switching between home and iframes
  - theme system: provide a list of themes, apply via data-theme on <html>, persist to localStorage
  - theme modal UI and tile generation
  if anything fails im crashing out
*/

const THEMES = [
  {
    id: 'dark',
    name: 'dark',
    vars: {
      '--bg': '#0b0f12',
      '--panel': '#0f1417',
      '--muted': '#98a0a6',
      '--text': '#e6eef3',
      '--accent': '#51c7ff',
      '--accent-2': '#2dd4bf',
      '--glass': 'rgba(255,255,255,0.03)'
    }
  },
  {
    id: 'light',
    name: 'light',
    vars: {
      '--bg': '#f6f7f9',
      '--panel': '#ffffff',
      '--muted': '#55606a',
      '--text': '#0b1215',
      '--accent': '#0ea5e9',
      '--accent-2': '#06b6d4',
      '--glass': 'rgba(0,0,0,0.04)'
    }
  },
  {
    id: 'serika-dark',
    name: 'serika dark',
    vars: {
      '--bg':'#0b0b10','--panel':'#0f1115','--muted':'#9aa5b0','--text':'#e6eef3','--accent':'#8be9fd','--accent-2':'#7ee787','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'serika-light',
    name: 'serika light',
    vars: {
      '--bg':'#fbfbfc','--panel':'#ffffff','--muted':'#6b7378','--text':'#07121a','--accent':'#2bb3cc','--accent-2':'#36c1a8','--glass':'rgba(0,0,0,0.04)'
    }
  },
  {
    id: 'nord',
    name: 'nord',
    vars: {
      '--bg':'#2e3440','--panel':'#3b4252','--muted':'#a3b1c4','--text':'#eceff4','--accent':'#81a1c1','--accent-2':'#88c0d0','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'dracula',
    name: 'dracula',
    vars: {
      '--bg':'#0b0b17','--panel':'#1e1b2b','--muted':'#bfb6d3','--text':'#f8f8f2','--accent':'#ff79c6','--accent-2':'#8be9fd','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'rose-pine',
    name: 'rose pine',
    vars: {
      '--bg':'#191724','--panel':'#1f1d2e','--muted':'#c4b9d6','--text':'#e7def8','--accent':'#eb6f92','--accent-2':'#9ccfd8','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'catppuccin',
    name: 'catppuccin mocha',
    vars: {
      '--bg':'#1e1b1d','--panel':'#26232a','--muted':'#c5b4bd','--text':'#f5e9f1','--accent':'#f5bde6','--accent-2':'#8bd5ca','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'solarized-dark',
    name: 'solarized dark',
    vars: {
      '--bg':'#002b36','--panel':'#073642','--muted':'#93a1a1','--text':'#eee8d5','--accent':'#268bd2','--accent-2':'#2aa198','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'gruvbox',
    name: 'gruvbox dark',
    vars: {
      '--bg':'#1d2021','--panel':'#2a2a2a','--muted':'#bdae93','--text':'#fbf1c7','--accent':'#fb4934','--accent-2':'#fabd2f','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'tokyo-night',
    name: 'tokyo night',
    vars: {
      '--bg':'#1a1b26','--panel':'#15161e','--muted':'#8b93a7','--text':'#c0caf5','--accent':'#7aa2f7','--accent-2':'#9ece6a','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'one-dark',
    name: 'one dark',
    vars: {
      '--bg':'#0b0f14','--panel':'#16191d','--muted':'#97a0a9','--text':'#cbd6e2','--accent':'#61afef','--accent-2':'#98c379','--glass':'rgba(255,255,255,0.02)'
    }
  },
  {
    id: 'vro',
    name: 'vro',
    vars: {
      // background images will be randomized when this theme is applied
      '--bg': 'transparent',
      '--panel': 'linear-gradient(180deg, rgba(0,0,0,0.36), rgba(0,0,0,0.5))',
      '--muted': '#c0c0c0',
      '--text': '#ffffff',
      '--accent': '#7ad0ff',
      '--accent-2': '#6ef0d6',
      '--glass': 'rgba(255,255,255,0.04)'
    }
  }
];

// helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* theme management, eau-ly is just placeholder for now */
const LS_KEY = 'eau-ly:theme';
const getSavedTheme = () => localStorage.getItem(LS_KEY) || 'dark';
const applyTheme = (themeId) => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);

  // if vro theme (lol), randomize the order of the provided image layers each time
  if (theme.id === 'vro') {
    const imgs = [
      '/toletole.png',
      '/toletole2.png',
      '/toletole3.png',
      '/toletole4.png',
      '/toletole5.png'
    ];
    // simple Fisher-Yates shuffle
    for (let i = imgs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    }
    const bgImageValue = imgs.map(p => `url("${p}")`).join(', ');
    // apply randomized bg-image first
    root.style.setProperty('--bg-image', bgImageValue);
  }

  // apply other CSS vars from the theme
  Object.entries(theme.vars).forEach(([k, v]) => {
    // avoid overwriting a randomized --bg-image for vro
    if (k === '--bg-image' && theme.id === 'vro') return;
    root.style.setProperty(k, v);
  });

  localStorage.setItem(LS_KEY, theme.id);
  // update selected state in tiles
  $$('.theme-tile').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === theme.id);
  });
};

const resetTheme = () => {
  localStorage.removeItem(LS_KEY);
  applyTheme('dark');
};

/* modal UI */
const themeModal = $('#theme-modal');
const themeGrid = $('#theme-grid');
const btnThemes = $('#btn-themes');
const closeBtn = $('#theme-close');
const modalBackdrop = $('#modal-backdrop');

function openThemeModal(){
  themeModal.setAttribute('aria-hidden','false');
  btnThemes.classList.add('active');
  btnThemes.setAttribute('aria-expanded','true');
}
function closeThemeModal(){
  themeModal.setAttribute('aria-hidden','true');
  btnThemes.classList.remove('active');
  btnThemes.setAttribute('aria-expanded','false');
}

/* create tiles */
function buildThemeTiles(){
  themeGrid.innerHTML = '';
  THEMES.forEach(t=>{
    const tile = document.createElement('button');
    tile.className = 'theme-tile';
    tile.dataset.id = t.id;
    tile.type = 'button';
    // swatch
    const sw = document.createElement('div');
    sw.className = 'small-swatch';
    // create 4 color bars from key tokens
    const keys = ['--panel','--bg','--accent','--accent-2'];
    keys.forEach(k=>{
      const b = document.createElement('div');
      b.className = 'swatch-bar';
      b.style.background = t.vars[k] || '#000';
      sw.appendChild(b);
    });
    const title = document.createElement('div');
    title.className = 'tile-title';
    title.textContent = t.name;
    const sub = document.createElement('div');
    sub.className = 'tile-sub';
    sub.textContent = t.id;
    tile.appendChild(sw);
    tile.appendChild(title);
    tile.appendChild(sub);
    tile.addEventListener('click', ()=>{
      applyTheme(t.id);
    });
    themeGrid.appendChild(tile);
  });
}

/* views and iframe handling */
const btnEvitools = $('#btn-evitools');
const btnEauai = $('#btn-eauai');
const btnWebVm = $('#btn-webvm');
const btnSubway = $('#btn-subway');
const btnBrowserLol = $('#btn-browserlol');
const btnNintendo = $('#btn-nintendo');
const homeView = $('#home');
const iframeWrap = $('#iframe-wrap');

let activeBtn = null;
let currentIframeUrl = null;

function setActiveButton(btn){
  // toggle
  if(activeBtn === btn){
    // deactivate
    activeBtn = null;
    $$('.nav-btn').forEach(b=>b.classList.remove('active'));
    showHome();
    return;
  }
  activeBtn = btn;
  $$('.nav-btn').forEach(b=>b.classList.toggle('active', b === btn || (b===btnThemes && themeModal.getAttribute('aria-hidden')==='false')));
  const url = btn.dataset.target;
  showIframe(url, btn);
}

function showHome(){
  // remove iframe cleanly
  iframeWrap.innerHTML = '';
  iframeWrap.classList.remove('active');
  homeView.classList.add('active');
  // ensure nav button active states cleared (except themes)
  $$('.nav-btn').forEach(b=> {
    if(b !== btnThemes) b.classList.remove('active');
  });
}

function showIframe(url, btn){
  homeView.classList.remove('active');
  iframeWrap.classList.add('active');
  // create iframe if different
  if(currentIframeUrl === url) return;
  iframeWrap.innerHTML = '';
  const ifr = document.createElement('iframe');
  ifr.src = url;
  ifr.setAttribute('allow', 'clipboard-read; clipboard-write; encrypted-media; fullscreen;');
  ifr.setAttribute('referrerpolicy', 'no-referrer');
  ifr.style.background = 'transparent';
  // make iframe edge-to-edge below navbar by occupying parent which already sized to calc
  iframeWrap.appendChild(ifr);
  currentIframeUrl = url;
  // set active class for nav buttons
  $$('.nav-btn').forEach(b=>b.classList.toggle('active', b === btn));
}

/* event wiring */
btnEvitools.addEventListener('click', ()=> setActiveButton(btnEvitools));
btnEauai.addEventListener('click', ()=> setActiveButton(btnEauai));
btnWebVm.addEventListener('click', ()=> setActiveButton(btnWebVm));
btnSubway.addEventListener('click', ()=> setActiveButton(btnSubway));
btnBrowserLol.addEventListener('click', ()=> setActiveButton(btnBrowserLol));
btnNintendo.addEventListener('click', ()=> setActiveButton(btnNintendo));

btnThemes.addEventListener('click', ()=>{
  const isOpen = themeModal.getAttribute('aria-hidden') === 'false';
  if(isOpen) closeThemeModal();
  else openThemeModal();
});

// close modal
closeBtn.addEventListener('click', closeThemeModal);
modalBackdrop.addEventListener('click', closeThemeModal);
document.getElementById('reset-theme').addEventListener('click', () => {
  resetTheme();
});

// quick cards on home
document.getElementById('card-evitools').addEventListener('click', ()=> {
  setActiveButton(btnEvitools);
});
document.getElementById('card-eauai').addEventListener('click', ()=> {
  setActiveButton(btnEauai);
});
document.getElementById('card-webvm').addEventListener('click', ()=> {
  setActiveButton(btnWebVm);
});
document.getElementById('card-subway').addEventListener('click', ()=> {
  setActiveButton(btnSubway);
});
document.getElementById('card-browserlol').addEventListener('click', ()=> {
  setActiveButton(btnBrowserLol);
});
document.getElementById('card-nintendo').addEventListener('click', ()=> {
  setActiveButton(btnNintendo);
});

// keyboard escape to close theme modal
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    if(themeModal.getAttribute('aria-hidden') === 'false') closeThemeModal();
    else if(activeBtn) { // pressing ESC while iframe open returns home
      setActiveButton(activeBtn);
    }
  }
});

// click outside iframe (nav remains visible) - no extra behavior needed

// observe for future insertions/attribute changes
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes && m.addedNodes.forEach(node => {
          if (node && node.nodeType === 1) {
            if (node.matches && node.matches('a#websim-logo-container.show')) replaceClass(node);
            // also check descendants
            node.querySelectorAll && node.querySelectorAll('a#websim-logo-container.show').forEach(replaceClass);
          }
        });
      } else if (m.type === 'attributes' && m.target) {
        // if attributes changed (class added), ensure conversion
        const target = m.target;
        if (target.matches && target.matches('a#websim-logo-container.show')) replaceClass(target);
      }
    }
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

/* Init */
buildThemeTiles();
applyTheme(getSavedTheme());

// ensure modal closes on load
closeThemeModal();

// Responsive: close modal on resize small screens
window.addEventListener('resize', ()=> {
  if(window.innerWidth < 520 && themeModal.getAttribute('aria-hidden') === 'false'){
    // keep open but allow scrolling inside; nothing required. Keeping behavior simple.
  }
});
