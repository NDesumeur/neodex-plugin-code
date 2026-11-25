// Code secret : Trouve le code de 4 couleurs en 10 essais. Les fiches noires disent les bonnes couleurs bien placées, les blanches les bonnes couleurs mal placées.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Code secret</span><span class="hint">Clic sur une couleur (ou 1 à 6, 1 à 8 en expert) · Entrée : valider · Retour : effacer</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="gc" width="288" height="216"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="gStats"></div></div>
      <div class="row"><button class="btn main" id="gNew">NOUVELLE PARTIE</button><button class="btn" id="csFs">PLEIN ÉCRAN</button></div>
      <label class="row"><input type="checkbox" id="csDup"> Couleurs en double possibles</label>
      <label class="row"><input type="checkbox" id="csExp"> Mode expert : 5 trous, 8 couleurs</label>
      <label class="row"><input type="checkbox" id="csInv"> Mode inverse : l'ordinateur devine ton code</label>
      <label class="row"><input type="checkbox" id="csAid"> Aide : codes encore possibles après chaque essai</label>
      <div class="hint">Fiche noire : une couleur juste et à la bonne place. Fiche blanche : une couleur juste, mais ailleurs.</div><div class="hint">Clique sur une fiche posée pour l'enlever.</div><div class="hint">Manette : croix pour choisir la couleur, A pour la poser, B ou X pour effacer, Y ou Start pour valider.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:2 1 560px;min-width:min(100%,560px);position:relative}
.gameBox canvas{width:100%;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{width:min(100%,max(320px,calc((100vh - 200px) * 288 / 216)));height:auto;aspect-ratio:288/216}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 288 / 216))}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "CODE SECRET", T: {"k": "#0a0604", "k2": "#160e08", "fill": "#22160c", "fillOn": "#2e1e10", "hl": "#3a2614", "line": "#5a3a1a", "acc": "#ffa030", "accL": "#ffe0a0", "accS": "#c86a10", "accD": "#4a2406", "rivet": "#ffe0a0", "btn": "#3a2614", "btnHi": "#6a4a24", "btnLo": "#160e08", "btnHov": "#4a3018", "btnHovHi": "#8a5e2e", "text": "#fff4e0", "muted": "#c8a880", "acc2": "#5fbf6a", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#0c0804", "bgDot": "#22160c", "bgDot2": "#160e08", "spark": "#5a3a1a", "spark2": "#5fbf6a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["............", "..kkk..kkk..", ".kaaak.kbbbk", ".kaaak.kbbbk", "..kkk..kkk..", "............", "..kkk..kkk..", ".kgggk.knnnk", ".kgggk.knnnk", "..kkk..kkk..", "............", "............"],
  icons: [[/^NOUVELLE/, "play"], [/^RECORDS/, "crown"]] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (b == null || v > b) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
  // les trophées de NeoDex (3.4.8 et plus) : succès et records déclarés dans plugin.json ; sur un NeoDex plus ancien, rien ne se passe
  const trophy = id => { ctx.games?.unlock(id).catch(() => {}); };
  const trophyRecord = (id, v) => { if (v != null && Number.isFinite(+v)) ctx.games?.record(id, +v).catch(() => {}); };
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
// petits outils communs aux jeux : une toile pré-dessinée, la position du pointeur dans le canevas, un bip
const cnv = (w, h, fn) => { const c = el('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
const spr = (rows, pal) => cnv(Math.max(...rows.map(r => r.length)), rows.length, g => sprite(g, rows, 0, 0, pal));
const W = 288, H = 216, cv = $('gc'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
let actx = null;
const beep = (f, d = .1, type = 'square', slide = 0, vol = .08) => { try { actx ??= new AudioContext(); const o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch {} };
const keyOk = e => view.classList.contains('on') && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
const showStats = rows => $('gStats').replaceChildren(...rows.flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
/* ---------- Code secret : trouver le code (4 couleurs parmi 6, ou 5 parmi 8 en expert) en 10 essais ;
   une fiche noire = bonne couleur bien placée, une blanche = bonne couleur mal placée ---------- */
const CS_COL = [['#ff4a5a', '#ffb0b8', '#a02030'], ['#ffd84a', '#fff4b0', '#b08a10'], ['#5fbf6a', '#c8ffc8', '#2a7a3a'], ['#3f8aff', '#b0d0ff', '#1a4aa0'], ['#b07aff', '#e4d0ff', '#6a3ab0'], ['#ffa030', '#ffe0a0', '#b0600a'],
  ['#ff7ad8', '#ffd0f0', '#a83a88'], ['#4ae0e0', '#c0fbfb', '#1a8a90']];
// les pions en relief : reflet en haut à gauche, ombre en bas à droite
const CS_PEG = CS_COL.map(([m, l, d]) => spr(['...kkkk...', '..kllmmk..', '.klwwlmmk.', 'klwwlmmmdk', 'klllmmmmdk', 'kmlmmmmmdk', 'kmmmmmmddk', '.kmmmmddk.', '..kddddk..', '...kkkk...'], {k: '#140a04', l, m, d, w: '#ffffff'}));
const CS_HOLE = spr(['...kkkk...', '..kddddk..', '.kdHHHHdk.', 'kdHHHHHHdk', 'kdHHHHHHdk', 'kdHHHHHHdk', 'kdHHHHHHlk', '.kdHHHHlk.', '..kdlllk..', '...kkkk...'], {k: '#2a1408', d: '#3e2210', H: '#1a0c06', l: '#7a4a28'});
const CS_PIN_ROWS = ['.kkk.', 'kwwmk', 'kwmmk', 'kmmdk', '.kkk.'];
const CS_PIN = [spr(CS_PIN_ROWS, {k: '#140a04', w: '#6a6a78', m: '#2a2a34', d: '#101016'}), spr(CS_PIN_ROWS, {k: '#140a04', w: '#ffffff', m: '#d8d8e0', d: '#8a8a98'})];
const css = gstore('code', {games: 0, wins: 0, tries: 0, dup: true});
const csSt = () => css.expert ? (css.x ??= {games: 0, wins: 0, tries: 0}) : css;  // les statistiques du mode expert à part
const CS = {X: 30, Y: 14, ROW: 19, TRIES: 10};
// la disposition d'une ligne : écart des trous, place des fiches (2×2 pour 4 trous, 3+2 pour 5), bord droit de la planche
const csLay = n => { const hs = n === 4 ? 20 : 17, pinX = CS.X + n * hs + 2; return {hs, pinX, right: pinX + (n === 4 ? 13 : 17), pin: k => n === 4 ? [pinX + (k % 2) * 7, 4 + Math.floor(k / 2) * 6] : [pinX + (k % 3) * 6, 4 + Math.floor(k / 3) * 6]}; };
function csScore(code, guess) {  // [bien placées, mal placées]
  let ok = 0; const a = [], b = [];
  code.forEach((c, i) => { if (guess[i] === c) ok++; else { a.push(c); b.push(guess[i]); } });
  let near = 0; for (const c of b) { const k = a.indexOf(c); if (k >= 0) { near++; a.splice(k, 1); } }
  return [ok, near];
}
let cs = null;
// tous les codes possibles (1296 pour 4 trous et 6 couleurs), gardés pour ne pas les refaire à chaque partie
const CS_ALL = {};
const csAll = (n, k, dup) => CS_ALL[n + '' + k + dup] ??= (function gen(p) { if (p.length === n) return [p]; const out = []; for (let c = 0; c < k; c++) if (dup || !p.includes(c)) out.push(...gen([...p, c])); return out; })([]);
// la méthode de Knuth (1977) : parmi les essais possibles, celui dont la pire réponse laisse le moins de codes ; à égalité, un code encore possible.
// shortcut: au-delà d'un million de comparaisons (mode expert), on cherche parmi les codes encore possibles, puis au hasard parmi eux
function csKnuth(S, all, n, dup, first) {
  if (first) return dup ? [0, 0, 1, 1, 2].slice(0, n) : [...Array(n).keys()];
  if (S.length <= 2) return S[0];
  const pool = S.length * all.length <= 1e6 ? all : S.length * S.length <= 1e6 ? S : null;
  if (!pool) return S[Math.floor(Math.random() * S.length)];
  const inS = new Set(S); let best = null, bw = 1e9, bIn = false;
  for (const g of pool) {
    const cnt = new Uint16Array(64); let w = 0;
    for (const c of S) { const [a, b] = csScore(c, g), i = a * 8 + b; if (++cnt[i] > w) { w = cnt[i]; if (w > bw) break; } }
    const gin = inS.has(g); if (w < bw || w === bw && gin && !bIn) { best = g; bw = w; bIn = gin; }
  }
  return best;
}
// après un essai : on ne garde que les codes qui auraient donné les mêmes fiches
function csNarrow(gs, ok, near) { cs.S = cs.S.filter(c => { const [a, b] = csScore(c, gs); return a === ok && b === near; }); cs.left.push(cs.S.length); }
const csOver = () => cs.mode === 'won' || cs.mode === 'lost';
const csInput = () => cs.mode === 'play' || cs.mode === 'set';
function csCode(n, k, dup) { const code = []; while (code.length < n) { const c = Math.floor(Math.random() * k); if (dup || !code.includes(c)) code.push(c); } return code; }
function csNew() {
  const n = css.expert ? 5 : 4, k = css.expert ? 8 : 6;
  const inv = !!css.inv;  // mode inverse : on compose d'abord son code, puis l'ordinateur le cherche
  cs = Object.assign(cs || {tick: 0, raf: 0, sel: 0}, {mode: inv ? 'set' : 'play', inv, n, k, code: inv ? [] : csCode(n, k, css.dup), rows: [], cur: [], at: [], end: 0, hover: -1, pad: false, S: csAll(n, k, css.dup), left: [], aiAt: 0});
  if (cs.sel >= k) cs.sel = 0;
  csInfo();
}
// un pion posé : il tombe dans son trou, et « toc » quand il y arrive
const csToc = c => setTimeout(() => { beep(560 + c * 40, .05, 'triangle', 220, .12); beep(1600, .015, 'square', 0, .02); }, 90);
function csPick(c) { if (!csInput() || cs.cur.length >= cs.n || c >= cs.k) return; cs.cur.push(c); cs.at.push(cs.tick); csToc(c); }
function csErase(k = cs.cur.length - 1) { if (!csInput() || k < 0 || k >= cs.cur.length) return; cs.cur.splice(k, 1); cs.at.splice(k, 1); beep(250, .05); }
function csSubmit() {
  if (!csInput() || cs.cur.length < cs.n) return beep(140, .1);
  if (cs.mode === 'set') { cs.code = cs.cur; cs.cur = []; cs.at = []; cs.mode = 'ai'; cs.aiAt = cs.tick + 50; beep(660, .08, 'triangle'); return; }
  const [ok, near] = csScore(cs.code, cs.cur); cs.rows.push({g: cs.cur, ok, near, at: cs.tick}); csNarrow(cs.cur, ok, near); cs.cur = []; cs.at = [];
  for (let k = 0; k < ok + near; k++) setTimeout(() => beep(k < ok ? 880 : 1320, .03, 'square', 0, .035), 150 + k * 110);  // les fiches se posent une à une
  const st = csSt();
  if (ok === cs.n) { cs.mode = 'won'; st.wins++; st.games++; st.tries += cs.rows.length; best(css.expert ? 'codeX' : 'code', -cs.rows.length); csTrophies(); [523, 659, 784].forEach((f, k) => setTimeout(() => beep(f, .15, 'triangle'), 300 + k * 120)); }
  else if (cs.rows.length >= CS.TRIES) { cs.mode = 'lost'; st.games++; setTimeout(() => beep(180, .4, 'sawtooth', 80), 300); }
  else beep(600, .05);
  if (cs.mode !== 'play') { cs.end = 0; cs.endAt = cs.tick; saveGames(); csInfo(); }
}
function csUpdate() {  // le tour de l'ordinateur en mode inverse : un essai toutes les secondes environ, les fiches calculées toutes seules
  if (cs.mode !== 'ai' || cs.tick < cs.aiAt) return;
  const gs = csKnuth(cs.S, csAll(cs.n, cs.k, css.dup), cs.n, css.dup, !cs.rows.length), [ok, near] = csScore(cs.code, gs);
  cs.rows.push({g: gs, ok, near, at: cs.tick}); csNarrow(gs, ok, near); cs.aiAt = cs.tick + 75;
  gs.forEach((c, k) => setTimeout(() => csToc(c), k * 70));
  for (let k = 0; k < ok + near; k++) setTimeout(() => beep(k < ok ? 880 : 1320, .03, 'square', 0, .035), 450 + k * 110);
  if (ok === cs.n || cs.rows.length >= CS.TRIES) {
    const st = (css.iv ??= {games: 0, tries: 0, x: 0, xt: 0}); if (cs.n === 5) { st.x++; st.xt += cs.rows.length; } else { st.games++; st.tries += cs.rows.length; } csTrophies();
    cs.mode = ok === cs.n ? 'won' : 'lost'; cs.end = 0; cs.endAt = cs.tick; saveGames(); csInfo();
    if (ok === cs.n) [784, 659, 523].forEach((f, k) => setTimeout(() => beep(f, .15, 'triangle'), 600 + k * 120));
  }
}
const csBg = n => cnv(W, H, b => {  // la planche de bois, rainures et trous
  const L = csLay(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = Math.sin(x * .05 + Math.sin(y * .11) * 2) > .7 ? 1 : 0; px(b, y % 32 === 0 ? '#3a1e0e' : v ? '#7a4a28' : '#6a3e22', x, y); }
  const bw = L.right + 6 - (CS.X - 8);
  px(b, '#140a04', CS.X - 8, CS.Y - 6, bw, CS.ROW * CS.TRIES + 10); px(b, '#5a3218', CS.X - 7, CS.Y - 5, bw - 2, CS.ROW * CS.TRIES + 8); px(b, '#7a4a28', CS.X - 7, CS.Y - 5, bw - 2, 1);
  for (let r = 0; r < CS.TRIES; r++) { const y = CS.Y + (CS.TRIES - 1 - r) * CS.ROW; px(b, '#4a2812', CS.X - 6, y + 17, bw - 4, 1);
    for (let i = 0; i < n; i++) b.drawImage(CS_HOLE, CS.X + i * L.hs, y + 4);
    for (let k = 0; k < n; k++) { const [x, yy] = L.pin(k); px(b, '#2a1408', x + 1, y + yy + 1, 3, 3); } }
  px(b, '#140a04', 182, 14, 92, 188); px(b, '#5a3218', 183, 15, 90, 186); px(b, '#7a4a28', 183, 15, 90, 1);
});
const CS_BGS = {4: csBg(4), 5: csBg(5)};
const csPalXY = c => [196 + (c % 2) * 34, 30 + Math.floor(c / 2) * (cs.k === 6 ? 30 : 22)];
const csPal = (x, y) => { for (let c = 0; c < cs.k; c++) { const [x0, y0] = csPalXY(c); if (x >= x0 - 3 && x < x0 + 23 && y >= y0 - 3 && y < y0 + 23) return c; } return -1; };
const csPeg = (c, x, y, drop = 0) => { px(g, 'rgba(20,10,4,.45)', x + 2, y + 9, 9, 2); g.drawImage(CS_PEG[c], x, y - drop); };
function csDraw() {
  csUpdate(); if (csOver()) cs.end = cs.tick - cs.endAt;  // la boucle commune ne fait avancer que le mode « play » : l'ordinateur joue d'ici
  const L = csLay(cs.n); g.drawImage(CS_BGS[cs.n], 0, 0);
  cs.rows.forEach((r, i) => { const y = CS.Y + (CS.TRIES - 1 - i) * CS.ROW; r.g.forEach((c, k) => csPeg(c, CS.X + k * L.hs, y + 4));
    [...Array(r.ok).fill(0), ...Array(r.near).fill(1)].forEach((p, k) => { if (cs.tick - r.at < 9 + k * 6.6) return; const [x, yy] = L.pin(k); g.drawImage(CS_PIN[p], x, y + yy); }); });
  // les codes encore possibles après chaque essai (toujours en mode inverse, avec l'aide sinon)
  if (cs.inv || css.aid) { const cx = (L.right + 188) / 2; cs.left.forEach((v, i) => { if (cs.tick - cs.rows[i].at < 12) return; const y = CS.Y + (CS.TRIES - 1 - i) * CS.ROW; pxFont(g, String(v), cx, y + 13, v === 1 ? '#ffd84a' : '#ffe0a0', 6, 'center'); });
    if (cs.left.length) pxFont(g, 'reste', cx, CS.Y + CS.ROW * CS.TRIES + 4, '#c8a878', 6, 'center'); }
  if (cs.mode === 'set') { const bx = (CS.X - 8 + L.right + 6) / 2; px(g, '#140a04', bx - 46, 84, 92, 34); px(g, '#2a1408', bx - 45, 85, 90, 32);
    pxFont(g, 'Compose ton code', bx, 98, '#ffd84a', 6, 'center'); pxFont(g, 'puis VALIDER', bx, 110, '#ffe0a0', 6, 'center'); }
  if (cs.mode === 'play') { const y = CS.Y + (CS.TRIES - 1 - cs.rows.length) * CS.ROW; px(g, '#ffd84a', CS.X - 6, y + 2, 2, 15);
    cs.cur.forEach((c, k) => { const t = cs.tick - cs.at[k]; csPeg(c, CS.X + k * L.hs, y + 4, t < 6 ? (6 - t) * 2 : t === 7 ? 1 : 0); }); }
  // la palette (grosses fiches), les boutons, la case du code caché
  if (cs.inv && cs.mode !== 'set') {  // l'ordinateur au travail : combien de codes il lui reste, sur combien au départ
    pxFont(g, cs.mode === 'ai' ? 'L’ordi cherche…' : 'L’ordi a fini', 228, 32, '#ffe0a0', 6, 'center'); pxFont(g, 'codes possibles', 228, 52, '#c8a878', 6, 'center');
    pxFont(g, String(cs.S.length), 228, 74, '#ffd84a', 12, 'center'); pxFont(g, 'sur ' + csAll(cs.n, cs.k, css.dup).length, 228, 88, '#c8a878', 6, 'center');
    pxFont(g, 'Knuth (1977)', 228, 114, '#8a6a4a', 6, 'center');
  } else for (let c = 0; c < cs.k; c++) { const [x, y] = csPalXY(c), on = cs.hover === c || (cs.pad && cs.sel === c && csInput());
    if (on) { px(g, '#140a04', x - 3, y - 3, 26, 26); px(g, cs.pad && (cs.tick >> 4) % 2 ? '#fff4b0' : '#ffd84a', x - 2, y - 2, 24, 24); }
    g.save(); g.translate(x, y); g.scale(2, 2); g.drawImage(CS_PEG[c], 0, 0); g.restore(); }
  if (!cs.inv || cs.mode === 'set') pxFont(g, 'Couleurs', 228, 25, '#ffe0a0', 6, 'center');
  const vb = cs.cur.length === cs.n && csInput(); px(g, '#140a04', 196, 126, 64, 20); px(g, vb ? '#ffd84a' : '#3a2010', 197, 127, 62, 18); px(g, vb ? '#fff4b0' : '#4a2a14', 197, 127, 62, 1);
  pxFont(g, 'VALIDER', 228, 140, vb ? '#3a1e0e' : '#8a6a4a', 8, 'center');
  px(g, '#140a04', 196, 154, 64, 20); px(g, '#3a2010', 197, 155, 62, 18); pxFont(g, 'EFFACER', 228, 168, cs.cur.length ? '#ffe0a0' : '#8a6a4a', 8, 'center');
  pxFont(g, (cs.inv ? 'Ton code' : 'Code') + (cs.n === 5 ? ' · expert' : ''), 228, 186, '#ffe0a0', 6, 'center');
  for (let i = 0; i < cs.n; i++) { const x = 228 - cs.n * 7 + i * 14, c = cs.mode === 'set' ? cs.cur[i] : cs.code[i]; if (cs.mode === 'play' || c === undefined) px(g, '#2a1408', x, 191, 10, 9); else csPeg(c, x, 190); }
  if (csOver() && cs.end > 30) gameText(g, W, [[cs.inv ? (cs.mode === 'won' ? 'L’ORDI TROUVE EN ' + cs.rows.length : 'L’ORDI ÉCHOUE') : cs.mode === 'won' ? 'TROUVÉ EN ' + cs.rows.length + ' !' : 'PERDU', cs.mode === 'won' ? '#ffd84a' : '#ff4a5a', 12], ['Clic ou A pour rejouer', '#ffe0a0']], 98);
  if (cs.tick % 30 === 0) cv.setAttribute('aria-label', 'Code secret : ' + (cs.mode === 'set' ? 'compose ton code, ' + cs.cur.length + ' pions sur ' + cs.n : cs.mode === 'ai' ? 'l’ordinateur cherche, essai ' + (cs.rows.length + 1) + ', ' + cs.S.length + ' codes possibles' : cs.mode === 'play' ? 'essai ' + (cs.rows.length + 1) + ' sur ' + CS.TRIES + ', ' + cs.cur.length + ' pions posés sur ' + cs.n : cs.mode === 'won' ? 'trouvé en ' + cs.rows.length : 'perdu'));
}
cv.onpointermove = e => { if (!cs) return; const [x, y] = cpos(e); cs.hover = csPal(x, y); cs.pad = false; };
cv.onpointerdown = e => {
  e.preventDefault(); if (!cs) return; const [x, y] = cpos(e);
  if (csOver()) { if (cs.end > 30) csNew(); return; }
  if (cs.mode === 'ai') return;
  const c = csPal(x, y); if (c >= 0) return csPick(c);
  if (x >= 196 && x < 260 && y >= 126 && y < 146) return csSubmit();
  if (x >= 196 && x < 260 && y >= 154 && y < 174) return csErase();
  const ry = CS.Y + (CS.TRIES - 1 - cs.rows.length) * CS.ROW, k = Math.floor((x - CS.X) / csLay(cs.n).hs); if (!cs.inv && y >= ry && y < ry + CS.ROW && x >= CS.X) csErase(k);
};
document.addEventListener('keydown', e => {
  if (!keyOk(e) || !cs) return;
  if (e.key >= '1' && e.key <= '8') csPick(+e.key - 1);
  if (e.key === 'Enter') { e.preventDefault(); csOver() ? csNew() : csSubmit(); }
  if (e.key === 'Backspace') { e.preventDefault(); csErase(); }
});
{  // la manette : croix = choisir la couleur (gauche / droite, haut / bas d'une ligne), A = poser, B ou X = effacer, Y ou Start = valider ; partie finie : A ou Start rejoue
  let prev = [];
  const loop = () => {
    requestAnimationFrame(loop);
    const p = [...(navigator.getGamepads?.() || [])].find(Boolean);
    if (!p || !cs || !view.classList.contains('on')) { prev = []; return; }
    const now = p.buttons.map(b => b.pressed), was = prev, hit = i => now[i] && !was[i]; prev = now;
    if (![0, 1, 2, 3, 9, 12, 13, 14, 15].some(hit)) return;
    cs.pad = true; cs.hover = -1;
    if (csOver()) { if ((hit(0) || hit(9)) && cs.end > 30) csNew(); return; }
    if (cs.mode === 'ai') return;
    const mv = (hit(15) ? 1 : 0) - (hit(14) ? 1 : 0) + (hit(13) ? 2 : 0) - (hit(12) ? 2 : 0); if (mv) { cs.sel = (cs.sel + mv + cs.k * 2) % cs.k; beep(500, .02, 'triangle', 0, .03); }
    if (hit(0)) csPick(cs.sel); if (hit(1) || hit(2)) csErase(); if (hit(3) || hit(9)) csSubmit();
  };
  requestAnimationFrame(loop);
}
function csInfo() {
  const st = csSt(), b = games.best[css.expert ? 'codeX' : 'code'], iv = css.iv || {games: 0, tries: 0, x: 0, xt: 0}, [ig, it] = css.expert ? [iv.x, iv.xt] : [iv.games, iv.tries];
  $('csInv').checked = !!css.inv; $('csAid').checked = !!css.aid;
  if (css.inv) { $('csDup').checked = css.dup; $('csExp').checked = !!css.expert; return showStats([['Mode', 'Inverse' + (css.expert ? ' · expert' : '')], ['Codes trouvés par l’ordi', ig], ['Moyenne d’essais de l’ordi', ig ? (it / ig).toFixed(1) : '-']]); }
  showStats([['Mode', css.expert ? 'Expert' : 'Normal'], ['Parties gagnées', st.wins + ' / ' + st.games], ['Moyenne d\'essais', st.wins ? (st.tries / st.wins).toFixed(1) : '-'], ['Meilleure partie', b ? -b + ' essais' : '-']]);
  $('csDup').checked = css.dup; $('csExp').checked = !!css.expert;
}
$('csDup').onchange = () => { css.dup = $('csDup').checked; saveGames(); csNew(); };
$('csExp').onchange = () => { css.expert = $('csExp').checked; saveGames(); csNew(); };
$('csInv').onchange = () => { css.inv = $('csInv').checked; saveGames(); csNew(); };
$('csAid').onchange = () => { css.aid = $('csAid').checked; saveGames(); };
$('gNew').onclick = () => { csNew(); $('gNew').blur(); };
$('csFs').onclick = () => { $('csFs').blur(); try { if (document.fullscreenElement) document.exitFullscreen(); else cv.parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
function csCheck() {  // vérification : le calcul des fiches, les codes sans double, la place des 5 trous et des 8 couleurs
  const bad = [];
  if (!(csScore([0, 1, 2, 3], [0, 1, 2, 3]).join() === '4,0' && csScore([0, 0, 1, 1], [1, 1, 0, 0]).join() === '0,4' && csScore([0, 1, 2, 3], [0, 0, 0, 0]).join() === '1,0' && csScore([1, 2, 2, 3], [2, 2, 4, 2]).join() === '1,1'
    && csScore([7, 6, 5, 4, 3], [3, 6, 7, 0, 0]).join() === '1,2')) bad.push('fiches');
  for (let i = 0; i < 50; i++) { const c = csCode(5, 8, false); if (new Set(c).size !== 5 || c.some(v => v < 0 || v > 7)) { bad.push('code expert'); break; } }
  for (const n of [4, 5]) { const L = csLay(n); if (L.right + 6 > 180 || [...Array(n).keys()].some(k => { const [x, y] = L.pin(k); return x + 5 > L.right + 1 || y + 5 > CS.ROW - 3; })) bad.push('planche ' + n); }
  const keep = cs; cs = {k: 8}; const last = csPalXY(7); cs = keep; if (last[1] + 20 > 124) bad.push('palette');
  if (csAll(4, 6, true).length !== 1296 || csAll(4, 6, false).length !== 360 || csAll(5, 8, false).length !== 6720 || new Set(csAll(4, 6, false).map(String)).size !== 360) bad.push('tous les codes');
  if (csKnuth(csAll(4, 6, true), csAll(4, 6, true), 4, true, true).join() !== '0,0,1,1') bad.push('premier essai de Knuth');
  return bad.length ? bad.join(', ') : 'ok';
}
console.assert(csCheck() === 'ok', 'code secret', csCheck());
// pour le test : la partie entière de l'ordinateur contre un code donné, essai par essai
const csSolve = (code, n = 4, k = 6, dup = true) => { const all = csAll(n, k, dup); let S = all; const out = []; while (out.length < CS.TRIES) { const gs = csKnuth(S, all, n, dup, !out.length), [a, b] = csScore(code, gs); out.push(gs.join('')); if (a === n) break; S = S.filter(c => { const [x, y] = csScore(c, gs); return x === a && y === b; }); } return out; };
cv.__cs = {st: () => cs, css, check: csCheck, lay: csLay, solve: csSolve};
// les trophées, tirés des statistiques et des records gardés (aussi à l'ouverture : ce qui a été fait avant compte)
function csTrophies() {
  const b = games.best, n = css.wins || 0, x = css.x?.wins || 0, top = Math.max(b.code ?? -99, b.codeX ?? -99);
  trophyRecord('normal', b.code != null ? -b.code : null); trophyRecord('expert', b.codeX != null ? -b.codeX : null);
  if (n + x >= 1) trophy('premier'); if (n + x >= 10) trophy('dix'); if (n + x >= 50) trophy('cinquante');
  if (top >= -3) trophy('trois'); if (top >= -2) trophy('deux'); if (x >= 1) trophy('expert'); if (x >= 10) trophy('expert10');
  if (css.iv && css.iv.games + css.iv.x >= 1) trophy('inverse');
}
ctx.onOpen(() => { if (!cs) csNew(); gameLoop(cs, 'code', () => {}, csDraw); csInfo(); csTrophies(); });

}
