// lancé par le test « local » de NeoDex : la vérification interne, une partie gagnée en trichant (le code est lu), une partie perdue,
// le mode expert (5 trous, 8 couleurs), la manette, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('gc').__cs, cs = T.st(), css = T.css; ${code} })()`);
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), 0`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('gc').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'code-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  const keep = await C('return JSON.stringify({dup: css.dup, expert: !!css.expert});');
  await pj(`document.getElementById('gNew').click(), 0`); await sleep(100);
  // deux essais faux puis le bon, au clavier
  const code = await C('return cs.code;');
  for (const g of [code.map(c => (c + 1) % 6), code.map(c => (c + 2) % 6)]) { for (const c of g) await key(String(c + 1)); await key('Enter'); await sleep(150); }
  for (const c of code.slice(0, 3)) await key(String(c + 1));
  await sleep(40); await shot('0-pion-tombe'); await key(String(code[3] + 1)); await sleep(500); await shot('1-partie');
  await key('Enter'); await sleep(900);
  const won = await C('return cs.mode + "|" + cs.rows.length;'); if (won !== 'won|3') throw new Error('la partie devait être gagnée en 3 : ' + won);
  await shot('2-gagne');
  // le mode expert : 5 trous, 8 couleurs, à la manette
  await pj(`(() => { const b = document.getElementById('csExp'); b.checked = true; b.dispatchEvent(new Event('change')); return 0; })()`); await sleep(100);
  const ex = await C('return cs.n + "/" + cs.k;'); if (ex !== '5/8') throw new Error('mode expert : ' + ex);
  await pj(`(() => { const pad = {axes: [0, 0], buttons: Array.from({length: 17}, () => ({pressed: false}))}; window.__pad = pad; navigator.getGamepads = () => [pad]; return 0; })()`);
  const tap = async i => { await pj(`(__pad.buttons[${i}].pressed = true, 0)`); await sleep(130); await pj(`(__pad.buttons[${i}].pressed = false, 0)`); await sleep(130); };
  await C('cs.sel = 0; return 0;');
  for (const mv of [15, 15, 13, 13, 13]) { await tap(mv); await tap(0); }  // couleurs 1, 2, 4, 6, 8 (index 1, 2, 4, 6, 0 après le tour)
  const row = await C('return cs.cur.join(",") + "|" + cs.sel;'); if (row !== '1,2,4,6,0|0') throw new Error('choix à la manette : ' + row + ' ' + await pj(`window.__e.join(' | ') + ' pads ' + navigator.getGamepads().length + ' mode ' + document.getElementById('gc').__cs.st().mode`));
  await tap(1); if (await C('return cs.cur.length;') !== 4) throw new Error('B devait effacer');
  await tap(0); await tap(3); await sleep(900);
  const r1 = await C('return cs.rows.length + "|" + (cs.rows[0].ok + cs.rows[0].near <= 5);'); if (r1 !== '1|true') throw new Error('Y devait valider : ' + r1);
  await shot('3-expert');
  // une partie perdue (10 essais), puis A relance
  await C('for (let i = 0; i < 9; i++) { cs.cur = cs.code.map(c => (c + 1) % 8); cs.at = cs.cur.map(() => cs.tick); } return 0;');
  for (let i = 0; i < 9; i++) { await C('cs.cur = cs.code.map(c => (c + 1) % 8); cs.at = cs.cur.map(() => cs.tick); return 0;'); await tap(3); }
  await sleep(900); if (await C('return cs.mode;') !== 'lost') throw new Error('la partie devait être perdue'); await shot('4-perdu');
  await tap(0); if (await C('return cs.mode + cs.rows.length;') !== 'play0') throw new Error('A devait relancer');
  await pj(`navigator.getGamepads = () => [], 0`);
  await C(`const k = ${keep}; css.dup = k.dup; css.expert = k.expert; return 0;`); await pj(`document.getElementById('gNew').click(), 0`);
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  // plein écran, et la zone de jeu qui tient dans la fenêtre
  await pj(`document.getElementById('csFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('gc'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('gc').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('gc').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  return 'vérification ok · gagné en 3 · expert à la manette · perdu puis relancé · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
