/* ===== PAJ: RAPO, ISTORIK, FINANS, PARAMET ===== */
const OPSYON_DAT = '<option value="tout">Tout dat net</option><option value="jodi">Jodi a</option><option value="ye">Yè</option><option value="7j">7 dènye jou</option><option value="30j">30 dènye jou</option><option value="mwa">Mwa sa a</option><option value="ane">Ane sa a</option>';
// filtre pa peryòd
const peryod = (v, val) => {
  const d = new Date(v), t = new Date(), j = lokal(d);
  if (val === 'jodi') return j === lokal(t);
  if (val === 'ye') { const y = new Date(); y.setDate(y.getDate() - 1); return j === lokal(y); }
  if (val === '7j') return t - d <= 7 * 864e5;
  if (val === '30j') return t - d <= 30 * 864e5;
  if (val === 'mwa') return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  if (val === 'ane') return d.getFullYear() === t.getFullYear();
  return true;
};

/* ---- Done pou rapò yo ---- */
// chak liy vant (yon liy pa pwodwi nan chak fich)
const liniVant = (vt = vantMwen()) => vt.flatMap(v => v.atik.map(a => ({ id: a.id, desk: a.desk, kan: a.kan, pu: a.pu, pt: a.pt, rete: a.rete, dat: v.dat, kesye: v.kesyeNon || v.kesye, fich: v.id })));
const pdfVant = (l, tit = 'Rapò vant yo') => rapoPDF(tit, ['ID', 'Deskripsyon', 'Kantite', 'Px unit', 'Px tot.', 'Rete', 'Dat', 'Kesye', 'Fich'],
  l.map(x => [x.id, x.desk, x.kan, fmt(x.pu), fmt(x.pt), x.rete ?? '—', lan(x.dat), x.kesye, x.fich]).concat([['', 'TOTAL', '', '', fmt(l.reduce((s, x) => s + x.pt, 0)), '', '', '', '']]));
function pdfKesye() { const vt = DB.getAll('vant'); rapoPDF('Rapò kesye yo', ['ID', 'Non', 'Telefòn', 'Sèks', 'Adrès', 'Dat nesans', 'Salè', 'Total vant'], DB.getAll('kesye').map(k => [k.id, k.non, k.telefon, k.seks, k.adres, dtLan(k.datNesans), fmt(k.salaire), vt.filter(v => v.kesye === k.id).length])); }
const pdfAktivite = l => rapoPDF('Rapò aktivite yo', ['#', 'Aktivite', 'Detay', 'Dat'], l.map((x, i) => [i + 1, aktTxt(x), x.detay || '', lan(x.dat)]));

/* ================= PAJ RAPO ================= */
Pajs.rapo = () => {
  $('#cheche').placeholder = 'Cheche aktivite...';
  const RAP = { vant: 'Rapò sou tout vant yo', kesye: 'Rapò sou tout kesye yo', aktivite: 'Rapò sou tout aktivite yo' };
  const chwa = () => $('input[name=rp]:checked').value;
  const apersi = () => { $('#rpMiniTit').textContent = paramet().biznis; $('#rpMiniNon').textContent = RAP[chwa()]; $('#rpMiniDat').textContent = dtLan(lokal()); };
  $$('input[name=rp]').forEach(r => r.onchange = apersi); apersi();
  $('#rpEnprime').onclick = () => ({ vant: () => pdfVant(liniVant()), kesye: pdfKesye, aktivite: () => pdfAktivite(DB.getAll('istorik')) })[chwa()]();
  // lis aktivite yo (chak liy gen yon nimewo)
  const rend = (f = '') => {
    f = f.toLowerCase();
    const l = DB.getAll('istorik').map((x, i) => ({ ...x, n: i + 1 })).filter(x => (aktTxt(x) + ' ' + lan(x.dat)).toLowerCase().includes(f));
    $('#rpTab').innerHTML = l.map(x => `<tr data-n="${x.n}"><td>${x.n}</td><td>${esc(aktTxt(x))}</td><td>${lan(x.dat)}</td></tr>`).join('') || '<tr><td colspan="3" class="vid" style="font-size:24px">VID</td></tr>';
    $$('#rpTab tr[data-n]').forEach(r => r.onclick = () => {
      const x = DB.getAll('istorik')[r.dataset.n - 1];
      $('#rpDat').textContent = lan(x.dat);
      $('#rpDet').innerHTML = [x.tip && 'Tip: ' + x.tip, x.kesye && 'Kesye: ' + x.kesye, x.detay].filter(Boolean).map(esc).join('<br>') || '—';
      $$('#rpTab tr').forEach(t => t.classList.toggle('sel', t === r));
    });
    const z = $('#rpTab').closest('.tabSkrol'); z.scrollTop = z.scrollHeight;
  };
  $('#rpEfase').onclick = () => konfime('Efase tout istorik aktivite yo ?', () => { DB.clear('istorik'); log('istorik', 'efase tout istorik aktivite yo'); rend(); });
  $('#rpEnpLog').onclick = () => pdfAktivite(DB.getAll('istorik'));
  $('#rpEfase').hidden = !estAdmin();
  App.onSearch = rend; rend();
};

/* ================= PAJ ISTORIK (vant) ================= */
Pajs.istorik = () => {
  $('#cheche').placeholder = 'Cheche deskripsyon, dat, kesye...';
  $('#isDat').innerHTML = OPSYON_DAT;
  let rows = [];
  $('#isEfase').hidden = !estAdmin();   // sèl admin ki ka siprime
  const rend = (f = '') => {
    f = f.toLowerCase();
    rows = liniVant().filter(x => peryod(x.dat, $('#isDat').value) && (x.desk + ' ' + lan(x.dat) + ' ' + x.kesye + ' ' + x.fich).toLowerCase().includes(f));
    $('#isTab').innerHTML = rows.map(x => `<tr class="notranslate" data-f="${x.fich}" title="Double-klik pou reenprime"><td>${x.id}</td><td>${esc(x.desk)}</td><td>${x.kan}</td><td>${fmt(x.pu)}</td><td>${fmt(x.pt)}</td><td>${x.rete ?? '—'}</td><td>${lan(x.dat)}</td><td>${esc(x.kesye)}</td><td>${x.fich}</td></tr>`).join('') || '<tr><td colspan="9" class="vid" style="font-size:24px">VID</td></tr>';
    $('#isTotal').textContent = fmt(rows.reduce((s, x) => s + x.pt, 0));
    $$('#isTab tr[data-f]').forEach(r => r.ondblclick = () => fichVant(DB.find('vant', +r.dataset.f)));
  };
  $('#isDat').onchange = () => rend($('#cheche').value);
  $('#isEnprime').onclick = () => pdfVant(rows, 'Istorik vant yo');
  $('#isEfase').onclick = () => konfime('Efase tout istorik vant yo ? Vant yo ap disparèt nan Finans lan tou. Aksyon sa a pa ka defèt.', () => { DB.clear('vant'); log('istorik', 'efase tout istorik vant yo'); rend(); });
  App.onSearch = rend; rend();
};

/* ================= PAJ FINANS ================= */
const TIPF = { vant: 'Vant', achat: 'Achat stòk', depans: 'Depans', antre: 'Lòt antre' };
// tout mouvman lajan: vant (antre), achat stòk ak depans (sòti), lòt antre
const mouvman = () => {
  const m = [];
  DB.getAll('vant').forEach(v => m.push({ dat: v.dat, tip: 'vant', desk: `Fich #${v.id}` + (v.kliyan ? ' — ' + v.kliyan : ''), kesye: v.kesyeNon || v.kesye, antre: v.total, soti: 0,
    benefis: v.atik.reduce((s, a) => s + a.kan * (a.pu - (a.pa ?? ((DB.find('pwodwi', a.id) || {}).achat ?? a.pu))), 0) }));
  DB.getAll('finans').forEach(f => m.push({ dat: f.dat, tip: f.tip, desk: f.desk + (f.detay ? ` (${f.detay})` : ''), kesye: f.non, antre: f.tip === 'antre' ? f.mont : 0, soti: f.tip === 'antre' ? 0 : f.mont, benefis: 0 }));
  return m.sort((a, b) => a.dat < b.dat ? 1 : -1);
};
Pajs.finans = () => {
  $('#cheche').placeholder = 'Cheche aktivite finansye...';
  $('#fnDat').innerHTML = OPSYON_DAT; let rows = [];
  const rend = (f = '') => {
    f = f.toLowerCase();
    rows = mouvman().filter(m => peryod(m.dat, $('#fnDat').value) && ($('#fnTip').value === 'tout' || m.tip === $('#fnTip').value) && (m.desk + ' ' + m.kesye + ' ' + TIPF[m.tip]).toLowerCase().includes(f));
    const s = k => rows.reduce((t, m) => t + m[k], 0);
    $('#fnAntre').textContent = fmt(s('antre')); $('#fnSoti').textContent = fmt(s('soti')); $('#fnBalans').textContent = fmt(s('antre') - s('soti')); $('#fnBenefis').textContent = fmt(s('benefis'));
    $('#fnTab').innerHTML = rows.map(m => `<tr><td>${lan(m.dat)}</td><td>${TIPF[m.tip]}</td><td class="notranslate">${esc(m.desk)}</td><td class="notranslate">${esc(m.kesye)}</td><td>${m.antre ? '+ ' + fmt(m.antre) : ''}</td><td>${m.soti ? '− ' + fmt(m.soti) : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="vid" style="font-size:24px">VID</td></tr>';
  };
  ['fnTip', 'fnDat'].forEach(x => $('#' + x).onchange = () => rend($('#cheche').value));
  $('#fnEnprime').onclick = () => rapoPDF('Rapò finansye', ['Dat', 'Tip', 'Deskripsyon', 'Kesye', 'Antre', 'Sòti'],
    rows.map(m => [lan(m.dat), TIPF[m.tip], m.desk, m.kesye, m.antre ? fmt(m.antre) : '', m.soti ? fmt(m.soti) : '']).concat([['', '', 'BALANS', '', $('#fnBalans').textContent, '']]));
  // ajoute yon depans oswa yon lòt antre lajan manyèlman
  $('#fnAjoute').onclick = () => fom('Nouvo mouvman lajan', [{ k: 'tip', label: 'Tip', type: 'select', options: ['Depans', 'Antre'] }, { k: 'desk', label: 'Deskripsyon' }, { k: 'mont', label: 'Montan', type: 'number' }], d => {
    const m = parseFloat(d.mont);
    if (!d.desk) return 'Deskripsyon an obligatwa.';
    if (!(m > 0)) return 'Montan an dwe plis pase 0.';
    const k = kesyeAktif(), t = d.tip === 'Antre' ? 'antre' : 'depans';
    DB.save('finans', { tip: t, desk: d.desk, detay: '', mont: m, kesye: k.id, non: k.non, dat: new Date().toISOString() });
    log('finans', `anrejistre yon ${TIPF[t].toLowerCase()}`, `${d.desk} — ${fmt(m)}`); rend($('#cheche').value);
  });
  App.onSearch = rend; rend();
};

/* ================= PAJ PARAMET ================= */
// [kle, tèks, tip, opsyon]
const OPS = [
  ['kreyeKont', 'Kite nenpòt itilizatè kreye kont', 'bool'],
  ['kesyeIstorik', 'Kite kesye gen aksè ak istorik vant yo', 'bool'],
  ['kesyeStok', 'Kite kesye modifye stòk pwodwi', 'bool'],
  ['kliyanOblije', 'Egzije non kliyan apre fin ranpli panye a', 'bool'],
  ['kliyanSouvan', 'Kenbe non kliyan ki achte souvan', 'bool'],
  ['stokFeb', 'Stòk pwodwi a fèb lè rete', 'sel', [['mwatye', 'Mwatye (rete ≤ 1/2 stòk la)'], ['3/4', '3/4 (rete ≤ 3/4 stòk la)']]],
  ['kesyeSale', 'Kite semi-admin fikse kantite lajan kesye touche', 'bool'],
  ['sync', 'Senkwonize done yo anliy (poko disponib)', 'bool'],
  ['maksPanye', 'Kantite pwodwi panye a ka sipote', 'sel', [[0, 'Ilimite'], [5, '5'], [8, '8'], [12, '12'], [20, '20'], [30, '30'], [50, '50']]]
];
Pajs.paramet = () => {
  let edit = false, logo = '';
  // bouton Reset App ak Netwaye ranplase ba rechèch la
  $('.bwatRecherche').hidden = true;
  const pb = document.createElement('div'); pb.id = 'paramBtn'; pb.className = 'pmHaut';
  // Reset ak Netwaye = siprime done: sèl admin ka fè sa
  pb.innerHTML = estAdmin() ? '<button class="btn btnWouj" id="pmReset">RESET APP</button><button class="btn btnVet" id="pmNet">NETWAYE</button>' : '';
  $('.antetLa').prepend(pb);
  // enfòmasyon antrepriz la
  const ch = ['pmNon', 'pmAdres', 'pmTel', 'pmMail', 'pmDev', 'pmMes'], kl = ['biznis', 'adres', 'telefon', 'mail', 'devise', 'mesaj'];
  const rend = () => {
    const p = paramet(); logo = p.logo;
    ch.forEach((id, i) => { $('#' + id).value = p[kl[i]] || ''; $('#' + id).readOnly = !edit; });
    $('#pmLogo').innerHTML = logo ? `<img src="${logo}">` : 'LOGO';
    $('#pmSove').hidden = !edit; $('#pmModifye').textContent = edit ? 'Anile' : 'Modifye';
  };
  $('#pmModifye').onclick = () => { edit = !edit; rend(); };
  $('#pmLogo').onclick = () => edit ? $('#pmFile').click() : toast('Klike sou "Modifye" anvan.');
  $('#pmFile').onchange = e => e.target.files[0] && redui(e.target.files[0], 200, d => { logo = d; $('#pmLogo').innerHTML = `<img src="${d}">`; });
  $('#pmSove').onclick = () => {
    const v = id => $('#' + id).value.trim();
    if (!v('pmNon')) return toast('Non antrepriz la obligatwa.');
    if (!v('pmDev')) return toast('Deviz la obligatwa.');
    DB.setOne('paramet', { ...paramet(), biznis: v('pmNon'), adres: v('pmAdres'), telefon: v('pmTel'), mail: v('pmMail'), devise: v('pmDev'), mesaj: v('pmMes'), logo });
    DEV = v('pmDev'); log('paramet', 'modifye enfòmasyon antrepriz la'); edit = false; rend(); toast('Chanjman sove.');
  };
  // opsyon yo (WI / NON): yo sove touswit
  const sove = (k, val, lab) => { DB.setOne('paramet', { ...paramet(), [k]: val }); log('paramet', 'chanje yon paramèt', `${lab} → ${val}`); };
  const opsRend = () => {
    const p = paramet();
    $('#pmOps').innerHTML = OPS.map(([k, lab, tip, ops], i) => `<div class="pmLiy"><span>${lab}</span>` + (tip === 'bool'
      ? [['WI', true], ['NON', false]].map(([t, v]) => `<button class="pmBtn ${!!p[k] === v ? 'aktif' : ''}" data-i="${i}" data-v="${v}" ${k === 'sync' ? 'disabled' : ''}>${t}</button>`).join('')
      : `<select data-i="${i}">${ops.map(([v, t]) => `<option value="${v}" ${String(p[k]) === String(v) ? 'selected' : ''}>${t}</option>`).join('')}</select>`) + '</div>').join('');
    $$('#pmOps .pmBtn').forEach(b => b.onclick = () => { const o = OPS[b.dataset.i]; sove(o[0], b.dataset.v === 'true', o[1]); opsRend(); });
    $$('#pmOps select').forEach(s => s.onchange = () => { const o = OPS[s.dataset.i]; sove(o[0], o[0] === 'maksPanye' ? +s.value : s.value, o[1]); });
  };
  // lisans lan
  const l = DB.getOne('lisans', null);
  $('#pmLis').textContent = l ? `Lisans: ${l.non} — ${l.fen ? 'ekspire ' + dtLan(lokal(new Date(l.fen))) + ' (' + Math.max(0, Math.ceil((new Date(l.fen) - Date.now()) / 864e5)) + ' jou rete)' : 'ilimite'} — kòd: ${l.kod.slice(0, 4)}-••••-••••-${l.kod.slice(-4)}` : '';
  // Reset: efase tout done yo (lisans lan rete)
  if ($('#pmReset')) $('#pmReset').onclick = () => fom('RESET APP — tout done yo ap efase', [{ k: 'pas', label: 'Ekri modpas ou pou konfime', type: 'password' }], d => {
    if (d.pas !== kesyeAktif().modpas) return 'Modpas pa kòrèk.';
    Object.keys(localStorage).filter(k => k.startsWith('vanda_') && !['vanda_lisans', 'vanda_lisansYo', 'vanda_tan'].includes(k)).forEach(k => localStorage.removeItem(k));
    location.hash = 'konekte'; location.reload();
  });
  // Netwaye: efase aktivite ki gen plis pase 30 jou
  if ($('#pmNet')) $('#pmNet').onclick = () => konfime('Netwaye aktivite ki gen plis pase 30 jou yo ?', () => {
    const tout = DB.getAll('istorik'), rete = tout.filter(x => Date.now() - new Date(x.dat) <= 30 * 864e5);
    DB._ekri('istorik', rete); log('paramet', 'netwaye istorik aktivite yo', (tout.length - rete.length) + ' liy efase'); toast((tout.length - rete.length) + ' liy efase.');
  });
  $('#pmDevBtn').onclick = devReset;
  rend(); opsRend();
};

/* ===== DEMARE APLIKASYON AN (dènye bagay) ===== */
window.onhashchange = chaje;
chaje();
