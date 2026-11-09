'use strict';
/* ================= ZOUTI JENERAL ================= */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
// pwoteje tèks anvan nou mete l nan HTML
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let DEV = 'G';   // deviz (Goud pa defo), chanje nan Paramèt
// fòma lajan: 1500 -> "1 500 G"
const fmt = n => { n = Math.round((+n || 0) * 100) / 100; const [p, d] = String(n).split('.'); return p.replace(/\B(?=(\d{3})+$)/g, ' ') + (d ? '.' + d : '') + ' ' + DEV; };
const lokal = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const lan = v => v ? new Date(v).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') : '—';
const dtLan = v => v ? v.split('-').reverse().join('/') : '—';
const App = { onSearch: null }, Pajs = {};
// premye lèt chak mo an majiskil (live pandan w ap tape)
const capLive = s => s.replace(/(^|[\s\-'’])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
// vèsyon final (mete rès lèt yo an miniskil tou)
const capFinal = s => capLive(s.trim().replace(/\s+/g, ' ').toLowerCase());
// laj yon moun a pati dat nesans li (YYYY-MM-DD)
const laj = dn => { const d = new Date(dn + 'T00:00:00'), t = new Date(); let a = t.getFullYear() - d.getFullYear(); if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--; return a; };
const maxNes = () => { const t = new Date(); return lokal(new Date(t.getFullYear() - 18, t.getMonth(), t.getDate())); };
// retounen yon mesaj erè si dat nesans lan pa bon (omwen 18 an, pa nan fiti)
const verifNes = dn => !dn || isNaN(new Date(dn)) ? 'Dat nesans lan obligatwa.' : dn > lokal() ? 'Dat nesans lan pa ka depase dat jodi a.' : laj(dn) < 18 ? 'Ou dwe gen omwen 18 an pou kreye yon kont.' : '';

function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 3000); }

// ranje otomatik: nimewo pa ka pi piti pase "min", ak majiskil nan chan ki gen data-cap
document.addEventListener('input', e => {
  const i = e.target;
  if (i.type === 'number' && i.min !== '' && i.value !== '' && +i.value < +i.min) i.value = i.min;
  if (i.dataset && i.dataset.cap !== undefined) { const v = capLive(i.value); if (v !== i.value) i.value = v; }
});

/* ---- Modal (fenèt ki parèt anlè, efè glasmorphism) ---- */
function modal(tit, kontni, bouton) {
  $('#modalZon').innerHTML = `<div class="modalFon"><div class="modalBwat"><h3>${tit}</h3><div>${kontni}</div><div class="modalErr"></div><div class="modalBouton"></div></div></div>`;
  bouton.forEach(([t, cls, fn]) => { const b = document.createElement('button'); b.textContent = t; b.className = 'btn ' + cls; b.onclick = fn; $('.modalBouton').append(b); });
}
const femen = () => { $('#modalZon').innerHTML = ''; };
const mesaj = m => modal('Mesaj', esc(m), [['OK', 'btnVet', femen]]);
const konfime = (m, cb) => modal('Konfime', esc(m), [['Non', 'btnGri', femen], ['Wi', 'btnWouj', () => { femen(); cb(); }]]);
// fòm jenerik: champs = [{k,label,type,options,attr,cap,suffix}], valid(d) retounen yon mesaj erè oswa anyen
function fom(tit, champs, valid) {
  const h = champs.map(c => {
    let e = c.type === 'select'
      ? `<select name="${c.k}">${c.options.map(o => `<option>${o}</option>`).join('')}</select>`
      : `<input name="${c.k}" type="${c.type || 'text'}" ${c.cap ? 'data-cap' : ''} ${c.attr || ''}>`;
    if (c.suffix) e = `<div class="enpG">${e}<span class="sifiks">${c.suffix}</span></div>`;
    return `<label>${c.label}${e}</label>`;
  }).join('');
  const ok = () => {
    const d = {}; $$('#modalZon [name]').forEach(e => d[e.name] = e.value.trim());
    const er = valid(d); if (er) $('.modalErr').textContent = er; else femen();
  };
  modal(tit, h, [['Anile', 'btnGri', femen], ['Valide', 'btnVet', ok]]);
  $$('#modalZon input').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') ok(); });
  const p = $('#modalZon input, #modalZon select'); if (p) p.focus();
}

/* ================= DONE JENERAL ================= */
// paramèt yo (valè par defo + sa moun nan chanje nan paj Paramèt)
const PDEFO = { biznis: 'VANDA', adres: 'Adrès pa defini', telefon: '', mail: '', devise: 'G', mesaj: 'Mèsi pou acha w la!', logo: '',
  kreyeKont: true, kesyeIstorik: false, kesyeStok: false, kliyanOblije: false, kliyanSouvan: false, stokFeb: 'mwatye', kesyeSale: false, sync: false, maksPanye: 0 };
const paramet = () => ({ ...PDEFO, ...DB.getOne('paramet', {}) });
DEV = paramet().devise || 'G';
const kesyeAktif = () => DB.find('kesye', localStorage.getItem('vanda_sesyon'));
// istorik aktivite: log(tip, mesaj, detay, non) — non kesye a pran otomatikman
const log = (tip, mesaj, detay = '', non) => { const k = kesyeAktif(); DB.save('istorik', { tip, mesaj, detay, non: non === undefined ? (k ? k.non : '') : (non || ''), kesye: k ? k.id : '', dat: new Date().toISOString() }); };
const aktTxt = i => (i.non ? i.non + ' ' : '') + i.mesaj;

/* ---- Wòl yo: admin (tout dwa), semi (rantre tout kote, pa siprime anyen sof pwodwi), kesye ---- */
const wol = k => (k || kesyeAktif() || {}).wol || 'kesye';
const estAdmin = () => wol() === 'admin';                    // ka siprime
const estGere = () => ['admin', 'semi'].includes(wol());     // ka rantre tout kote
const estPrensipal = () => !!(kesyeAktif() || {}).prensipal; // sèl li ki jere wòl yo
const WOLTXT = { admin: 'Admin', semi: 'Semi-admin', kesye: 'Kesye' };
// ki paj chak moun gen dwa wè
const ACCES = {
  konekte: () => true, akey: () => true, vann: () => true,
  kesye: () => estGere(), rapo: () => estGere(), finans: () => estGere(), paramet: () => estGere(),
  pwodwi: () => estGere() || paramet().kesyeStok,
  istorik: () => estGere() || paramet().kesyeIstorik
};
// vant moun nan gen dwa wè (admin: tout, kesye: pa li sèlman)
const vantMwen = () => { const k = kesyeAktif(); return DB.getAll('vant').filter(v => estGere() || (k && v.kesye === k.id)); };
// eta stòk yon pwodwi: 'fini' | 'feb' | 'ok' (fèb = rete mwens pase mwatye oswa 3/4 stòk dènye renouvèlman an)
const etatStok = p => {
  if (p.kantite <= 0) return 'fini';
  if (!p.kanRef) return 'ok';
  return p.kantite <= p.kanRef * (paramet().stokFeb === '3/4' ? 0.75 : 0.5) ? 'feb' : 'ok';
};

/* ================= PDF (fich vant + rapò) ================= */
const pdfPare = () => { if (window.jspdf) return true; mesaj('Bibliyotèk PDF la pa chaje. Verifye dosye js/lib la epi rechaje paj la.'); return false; };

// Montre PDF la plen ekran ak bouton Enprime / Telechaje / Ekran konplè
function montrePDF(doc, nom) {
  const url = doc.output('bloburl');
  $('#modalZon').innerHTML = `<div class="modalFon"><div class="pdfBwat" id="pdfBwat"><div class="pdfBa"><b>${esc(nom)}</b><span>
    <button class="btn btnVet" id="pdfEnp">Enprime</button> <button class="btn btnOranj" id="pdfTel">Telechaje PDF</button>
    <button class="btn btnGri" id="pdfFull">Ekran konplè</button> <button class="btn btnWouj" id="pdfFem">Fèmen</button></span></div>
    <iframe id="pdfFr" src="${url}"></iframe></div></div>`;
  const telecharje = () => { const a = document.createElement('a'); a.href = url; a.download = nom + '.pdf'; a.click(); };
  // Si navigatè a pa kite enprime, PDF la telechaje otomatikman
  $('#pdfEnp').onclick = () => { try { const f = $('#pdfFr').contentWindow; f.focus(); f.print(); } catch (e) { telecharje(); toast('Pa jwenn printer. PDF la telechaje.'); } };
  $('#pdfTel').onclick = telecharje;
  $('#pdfFull').onclick = () => document.fullscreenElement ? document.exitFullscreen() : ($('#pdfBwat').requestFullscreen && $('#pdfBwat').requestFullscreen());
  $('#pdfFem').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); femen(); };
}

// Ti fich vant lan (80mm, fòma resi)
function fichVant(v) {
  if (!pdfPare()) return;
  const p = paramet(), doc = new jspdf.jsPDF({ unit: 'mm', format: [80, 85 + v.atik.length * 10] });
  let y = 8;
  const c = (t, s = 9, b = 0) => { doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.setFontSize(s); doc.text(String(t), 40, y, { align: 'center' }); y += s * 0.45 + 1.5; };
  const ti = () => { doc.line(5, y, 75, y); y += 4; };
  c(p.biznis, 14, 1); c(p.adres, 8); if (p.telefon) c(p.telefon, 8); ti();
  c('FICH VANT #' + v.id, 10, 1); c(lan(v.dat), 8); c('Kesye: ' + (v.kesyeNon || v.kesye), 8); if (v.kliyan) c('Kliyan: ' + v.kliyan, 8); ti();
  doc.setFontSize(8);
  v.atik.forEach(a => {
    doc.setFont('helvetica', 'bold'); doc.text(a.desk.slice(0, 32), 5, y); y += 4;
    doc.setFont('helvetica', 'normal'); doc.text(`${a.kan} x ${fmt(a.pu)}`, 8, y); doc.text(fmt(a.pt), 75, y, { align: 'right' }); y += 6;
  });
  ti(); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('TOTAL', 5, y); doc.text(fmt(v.total), 75, y, { align: 'right' }); y += 9;
  c(p.mesaj, 8);
  montrePDF(doc, 'Fich vant ' + v.id);
}

// Rapò jenerik an PDF (A4) ak tablo
function rapoPDF(tit, kol, ranje) {
  if (!pdfPare()) return;
  const p = paramet(), doc = new jspdf.jsPDF();
  doc.setFontSize(16); doc.text(p.biznis, 14, 16); doc.setFontSize(9); doc.text(`${p.adres} ${p.telefon}`, 14, 22);
  doc.setFontSize(13); doc.text(tit, 14, 32); doc.setFontSize(8); doc.text('Dat: ' + lan(new Date()), 14, 37);
  doc.autoTable({ head: [kol], body: ranje, startY: 42, styles: { fontSize: 8 }, headStyles: { fillColor: [35, 157, 145] } });
  montrePDF(doc, tit);
}

// redui gwosè yon foto anvan nou sere l (pou localStorage pa plen)
function redui(f, t, cb) {
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), s = Math.min(1, t / Math.max(im.width, im.height)); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .7)); }; im.src = r.result; };
  r.readAsDataURL(f);
}

/* ---- Espas devlopè: reyinisyalize tout aplikasyon an (lisans enkli) ---- */
function devReset() {
  fom('Espas devlopè — tout aplikasyon an (lisans enkli) ap reyinisyalize', [{ k: 'kod', label: 'Kòd devlopè', type: 'password' }], d => {
    if (d.kod !== KOD_DEV) return 'Kòd devlopè a pa kòrèk.';
    Object.keys(localStorage).filter(k => k.startsWith('vanda_')).forEach(k => localStorage.removeItem(k));
    location.hash = ''; location.reload();
  });
}

/* ================= PAJ KONEKSYON ================= */
// fòm pou kreye yon kesye (itilize nan koneksyon ak nan paj Kesye)
function fomKesye(cb) {
  const p = paramet(), k = kesyeAktif();
  const peutSale = k && (estAdmin() || (estGere() && p.kesyeSale));   // sèlman moun ki gen dwa fikse salè
  const champs = [{ k: 'id', label: 'Kòd idantifikasyon (ID)' }, { k: 'non', label: 'Non konplè', cap: true }, { k: 'telefon', label: 'Telefòn' },
    { k: 'seks', label: 'Sèks', type: 'select', options: ['Gason', 'Fi'] }, { k: 'adres', label: 'Adrès' },
    { k: 'datNesans', label: 'Dat nesans (omwen 18 an)', type: 'date', attr: `max="${maxNes()}"` }];
  if (peutSale) champs.push({ k: 'salaire', label: 'Salè', type: 'number', attr: 'min="0"', suffix: DEV });
  champs.push({ k: 'modpas', label: 'Modpas', type: 'password' });
  fom('Nouvo kesye', champs, d => {
    d.id = d.id.toUpperCase();
    if (!/^[A-Z0-9]{3,12}$/.test(d.id)) return 'ID a dwe gen 3 a 12 lèt oswa chif.';
    if (DB.find('kesye', d.id)) return 'ID sa a deja egziste.';
    d.non = capFinal(d.non);
    if (!d.non) return 'Non an obligatwa.';
    const e = verifNes(d.datNesans); if (e) return e;
    if (d.modpas.length < 4) return 'Modpas la dwe gen omwen 4 karaktè.';
    // si gen deja yon admin prensipal, tout nouvo kont se kesye
    const genAdmin = DB.getAll('kesye').some(x => x.prensipal);
    DB.save('kesye', { ...d, salaire: Math.max(0, +d.salaire || 0), adres: d.adres || 'Poko defini', foto: '', wol: genAdmin ? 'kesye' : 'admin', prensipal: !genAdmin, denyeKoneksyon: '', datKreye: new Date().toISOString() });
    log('kesye', 'Nouvo kesye kreye: ' + d.non, '', k ? k.non : d.non); if (cb) cb();
  });
}

Pajs.konekte = () => {
  const antre = () => {
    const id = $('#lgId').value.trim().toUpperCase(), k = DB.find('kesye', id);
    if (!k || k.modpas !== $('#lgPas').value) { $('#lgErr').textContent = 'ID oswa modpas pa kòrèk.'; return; }
    DB.update('kesye', id, { denyeKoneksyon: new Date().toISOString() });
    localStorage.setItem('vanda_sesyon', id); log('koneksyon', 'konekte!'); ale('akey');
  };
  $('#lgOk').onclick = antre;
  $('#loginZon').onkeydown = e => { if (e.key === 'Enter') antre(); };
  $('#lgWe').onclick = () => { const i = $('#lgPas'); i.type = i.type === 'password' ? 'text' : 'password'; };
  $('#lgBliye').onclick = () => mesaj('Kontakte administratè a pou l reyinisyalize modpas ou.');
  if (paramet().kreyeKont) $('#lgKreye').onclick = () => fomKesye(() => toast('Kont kreye! Ou ka konekte kounye a.')); else $('#lgKreye').hidden = true;
};

/* ================= PAJ AKEY (DASHBOARD) ================= */
// koulè diferan pou chak pwodwi nan chart la
const koule = i => `hsl(${Math.round((i * 137.508) % 360)} 65% 48%)`;
// chart won (pie): items = [{desk, kan, klr}]
function pieSVG(items) {
  const tot = items.reduce((s, x) => s + x.kan, 0); if (!tot) return '';
  let a = -Math.PI / 2; const R = 80, pt = t => [(R * Math.cos(t)).toFixed(2), (R * Math.sin(t)).toFixed(2)];
  return '<svg viewBox="-90 -90 180 180" class="pie">' + items.filter(x => x.kan > 0).map(x => {
    const f = x.kan / tot;
    if (f >= 0.9999) return `<circle r="${R}" fill="${x.klr}"><title>${esc(x.desk)}: ${x.kan}</title></circle>`;
    const a2 = a + f * 2 * Math.PI, [x1, y1] = pt(a), [x2, y2] = pt(a2);
    const d = `M0 0L${x1} ${y1}A${R} ${R} 0 ${f > 0.5 ? 1 : 0} 1 ${x2} ${y2}Z`; a = a2;
    return `<path d="${d}" fill="${x.klr}" stroke="#fff" stroke-width="1"><title>${esc(x.desk)}: ${x.kan}</title></path>`;
  }).join('') + '</svg>';
}

Pajs.akey = () => {
  const vt = vantMwen(), tj = vt.filter(v => lokal(new Date(v.dat)) === lokal());
  // kesye wè sa li menm vann; admin wè tout kòb ki fèt la
  $('#akLab1').textContent = estGere() ? 'Tout kòb ki fèt' : 'Tout kòb ou vann';
  $('#akSom').textContent = fmt(vt.reduce((s, v) => s + v.total, 0));
  $('#akNb').textContent = tj.length;
  $('#akStatKat').hidden = !estGere();
  $('#akVwaTout').hidden = !ACCES.istorik();
  const feb = DB.getAll('pwodwi').filter(p => etatStok(p) !== 'ok').sort((a, b) => a.kantite - b.kantite);
  $('#akStok').innerHTML = feb.length ? feb.map(p => `<tr><td class="notranslate">${esc(p.desk)}</td><td class="${etatStok(p) === 'fini' ? 'rouj' : 'oranj'}">${p.kantite}</td></tr>`).join('') : '<tr><td colspan="2" class="vid">VID</td></tr>';
  const k = kesyeAktif();
  $('#akTrans').innerHTML = DB.getAll('istorik').filter(i => estGere() || i.kesye === k.id).slice(-6).reverse().map(i => `<div class="tranz"><span>${esc(aktTxt(i))}</span><small>${lan(i.dat)}</small></div>`).join('') || '<div class="vid">VID</div>';
  // grafik: vant 7 dènye jou yo
  const jou = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
  const som = jou.map(d => vt.filter(v => lokal(new Date(v.dat)) === lokal(d)).reduce((s, v) => s + v.total, 0)), mx = Math.max(...som);
  $('#akGraf').innerHTML = mx ? jou.map((d, i) => `<div class="grafKol" title="${fmt(som[i])}"><div class="barr" style="height:${Math.max(3, som[i] / mx * 85)}%"></div><small>${d.getDate()}/${d.getMonth() + 1}</small></div>`).join('') : '<div class="vid" style="font-size:22px;width:100%">ENDISPONIB</div>';
  // stat vant: tout pwodwi yo, klase ak sa ki vann plis yo anwo, chak ak yon koulè
  const st = {};
  DB.getAll('pwodwi').forEach(p => st[p.id] = { desk: p.desk, kan: 0 });
  vt.forEach(v => v.atik.forEach(a => { (st[a.id] = st[a.id] || { desk: a.desk, kan: 0 }).kan += a.kan; }));
  const lis = Object.values(st).sort((a, b) => b.kan - a.kan || a.desk.localeCompare(b.desk)).map((x, i) => ({ ...x, klr: koule(i) }));
  const tot = lis.reduce((s, x) => s + x.kan, 0);
  $('#akPie').innerHTML = lis.length && tot ? `<div class="pieBwat">${pieSVG(lis)}<div class="pieLeg notranslate">${lis.map(x => `<div><i style="background:${x.klr}"></i><span>${esc(x.desk)}</span><b>${x.kan}</b></div>`).join('')}</div></div>` : '<div class="vid" style="font-size:22px">ENDISPONIB</div>';
  $$('[data-ale]').forEach(a => a.onclick = () => ale(a.dataset.ale));
};

/* ================= PAJ VANN ================= */
Pajs.vann = () => {
  let sel = null, panye = [];
  $('#cheche').placeholder = 'Cheche pwodwi...';
  const total = () => panye.reduce((s, a) => s + a.pt, 0);
  const nanPanye = id => (panye.find(a => a.id === id) || { kan: 0 }).kan;
  const rete = p => p.kantite - nanPanye(p.id);                        // kantite ki rete pou vann
  const dispo = () => DB.getAll('pwodwi').filter(p => rete(p) > 0);    // pwodwi ki gen stòk sèlman
  // kalkile kantite a: li pa ka depase sa ki rete nan stòk la
  const kalkil = () => {
    let q = Math.max(1, parseInt($('#vnKan').value) || 1);
    if (sel) { const mx = rete(DB.find('pwodwi', sel.id) || { kantite: 0, id: sel.id }); if (q > mx) { q = Math.max(1, mx); toast('Stòk la gen sèlman ' + mx + ' sou pwodwi sa a.'); } }
    $('#vnKan').value = q; $('#vnPt').value = sel ? fmt(q * sel.vente) : '';
  };
  const chwazi = p => { sel = p; $('#vnDesk').value = p.desk; $('#vnKan').value = 1; $('#vnPu').value = fmt(p.vente); kalkil(); liste(); };
  const vidSel = () => { sel = null; ['vnDesk', 'vnPu', 'vnPt'].forEach(x => $('#' + x).value = ''); $('#vnKan').value = 1; };
  // lis pwodwi dispo yo (klike pou chwazi)
  const liste = () => {
    $('#vnListe').innerHTML = dispo().map(p => `<div data-id="${p.id}" class="${sel && sel.id === p.id ? 'sel' : ''}"><span>${p.id}</span><span class="notranslate">${esc(p.desk)}</span><small>(${rete(p)})</small></div>`).join('') || '<div class="vid" style="font-size:24px">VID</div>';
    $$('#vnListe [data-id]').forEach(d => d.onclick = () => chwazi(DB.find('pwodwi', +d.dataset.id)));
  };
  // sijesyon anba ba rechèch la: depi l jwenn yon pwodwi, li seleksyone l otomatikman
  const sij = $('#sijesyon');
  const kache = () => { sij.hidden = true; sij.innerHTML = ''; };
  const cheche = f => {
    f = f.trim().toLowerCase(); if (!f) return kache();
    const m = dispo().filter(p => p.desk.toLowerCase().includes(f) || String(p.id) === f);
    sij.hidden = false;
    sij.innerHTML = m.map(p => `<div data-id="${p.id}" class="notranslate">${esc(p.desk)} <small>(${rete(p)})</small></div>`).join('') || '<div class="pa">Pa gen pwodwi ki matche.</div>';
    $$('div[data-id]', sij).forEach(d => d.onmousedown = e => { e.preventDefault(); chwazi(DB.find('pwodwi', +d.dataset.id)); $('#cheche').value = sel.desk; kache(); });
    if (m.length && (!sel || sel.id !== m[0].id)) chwazi(m[0]);
  };
  $('#cheche').onkeydown = e => { if (e.key === 'Enter') kache(); if (e.key === 'Escape') kache(); };
  $('#cheche').onblur = () => setTimeout(kache, 150);
  const panyeRend = () => {
    $('#vnPanye').innerHTML = panye.map((a, i) => `<tr><td class="notranslate">${esc(a.desk)}</td><td>${a.kan}</td><td>${fmt(a.pu)}</td><td>${fmt(a.pt)}</td><td><button class="btn btnWouj" data-i="${i}" style="padding:2px 8px">×</button></td></tr>`).join('');
    $('#vnTotal').textContent = 'Total: ' + fmt(total());
    $$('#vnPanye [data-i]').forEach(b => b.onclick = () => { panye.splice(+b.dataset.i, 1); panyeRend(); liste(); });
  };
  // bouton + : li pa kite w pran plis pase stòk la
  $('#vnPlis').onclick = () => { if (!sel) return toast('Chwazi yon pwodwi anvan.'); $('#vnKan').value = (parseInt($('#vnKan').value) || 0) + 1; kalkil(); };
  $('#vnMwen').onclick = () => { $('#vnKan').value = (parseInt($('#vnKan').value) || 2) - 1; kalkil(); };
  $('#vnKan').oninput = kalkil;
  // ajoute nan panye (verifye stòk la ankò)
  $('#vnAjoute').onclick = () => {
    if (!sel) return toast('Chwazi yon pwodwi anvan.');
    kalkil(); const q = +$('#vnKan').value, l = panye.find(a => a.id === sel.id), fresh = DB.find('pwodwi', sel.id), mk = paramet().maksPanye;
    if (!fresh || q + (l ? l.kan : 0) > fresh.kantite) return toast('Stòk pa sifi. Rete: ' + (fresh ? fresh.kantite - (l ? l.kan : 0) : 0));
    if (!l && mk && panye.length >= mk) return toast('Panye a ka pote ' + mk + ' pwodwi maksimòm.');
    if (l) { l.kan += q; l.pt = l.kan * l.pu; } else panye.push({ id: sel.id, desk: sel.desk, kan: q, pu: sel.vente, pa: fresh.achat, pt: q * sel.vente });
    panyeRend(); vidSel(); $('#cheche').value = ''; kache(); liste();
  };
  // valide vant lan: retire stòk, sere vant, enprime fich la
  $('#vnValide').onclick = () => {
    if (!panye.length) return toast('Panye a vid.');
    const p = paramet(), k = kesyeAktif(), kl = $('#vnKliyan').value.trim();
    if (p.kliyanOblije && !kl) return toast('Non kliyan an obligatwa.');
    for (const a of panye) { const x = DB.find('pwodwi', a.id); if (!x || x.kantite < a.kan) return mesaj('Stòk pa sifi pou ' + a.desk + '.'); }
    panye.forEach(a => DB.update('pwodwi', a.id, { kantite: DB.find('pwodwi', a.id).kantite - a.kan }));
    const v = DB.save('vant', { kesye: k.id, kesyeNon: k.non, kliyan: kl, atik: panye, total: total(), dat: new Date().toISOString() });
    log('vant', `vann ${panye.reduce((s, a) => s + a.kan, 0)} atik!`, `Fich #${v.id} — ${fmt(v.total)}`);
    panye = []; vidSel(); $('#vnKliyan').value = ''; $('#cheche').value = ''; kache();
    panyeRend(); liste(); kliyanYo(); fichVant(v);
  };
  $('#vnAnile').onclick = () => panye.length ? konfime('Anile vant lan ?', () => { panye = []; panyeRend(); liste(); }) : 0;
  // non kliyan ki achte souvan (opsyon nan Paramèt)
  const kliyanYo = () => {
    const c = {}; if (paramet().kliyanSouvan) DB.getAll('vant').forEach(v => v.kliyan && (c[v.kliyan] = (c[v.kliyan] || 0) + 1));
    $('#vnKlLis').innerHTML = Object.keys(c).filter(n => c[n] >= 2).map(n => `<option value="${esc(n)}">`).join('');
  };
  $('#vnKlOp').textContent = paramet().kliyanOblije ? '(obligatwa)' : '(fakiltatif)';
  App.onSearch = cheche; liste(); panyeRend(); kliyanYo();
};

/* ================= PAJ KESYE ================= */
Pajs.kesye = () => {
  let id = null, foto = '';
  $('#cheche').placeholder = 'Non oswa ID kesye...';
  const p = paramet(), peutSale = estAdmin() || (estGere() && p.kesyeSale);
  $('#ksSiprime').hidden = !estAdmin();                        // semi-admin pa siprime anyen
  $('#ksWolLab').hidden = $('#ksWolBtn').hidden = !estPrensipal();   // sèl admin prensipal la jere wòl yo
  $('#ksSale').disabled = !peutSale; $('#ksNes').max = maxNes(); $('.sifiks', $('#ksSale').parentElement).textContent = DEV;
  const fotoRend = () => $('#ksFoto').innerHTML = foto ? `<img src="${foto}">` : ik('kamera');
  const vid = () => { ['ksNon', 'ksTel', 'ksAdres', 'ksKonek', 'ksKreye', 'ksVant', 'ksSale', 'ksNes'].forEach(x => $('#' + x).value = ''); $('#ksId').textContent = '—'; foto = ''; fotoRend(); };
  const rend = (f = '') => {
    const vt = DB.getAll('vant'); f = f.toLowerCase();
    $('#ksTab').innerHTML = DB.getAll('kesye').filter(k => (k.non + k.id).toLowerCase().includes(f)).map(k => `<tr data-id="${esc(k.id)}" class="notranslate ${k.id === id ? 'sel' : ''}"><td>${esc(k.id)}</td><td>${esc(k.non)}</td><td>${WOLTXT[wol(k)]}${k.prensipal ? ' *' : ''}</td><td>${esc(k.adres)}</td><td>${esc(k.telefon)}</td><td>${esc(k.seks)}</td><td>${dtLan(k.datNesans)}</td><td>${fmt(k.salaire)}</td><td>${lan(k.denyeKoneksyon)}</td><td>${lan(k.datKreye)}</td><td>${vt.filter(v => v.kesye === k.id).length}</td></tr>`).join('');
    $$('#ksTab tr').forEach(r => r.onclick = () => chwazi(r.dataset.id));
  };
  // klike sou yon kesye: ranpli fòm lan
  const chwazi = i => {
    const k = DB.find('kesye', i); if (!k) return; id = i; foto = k.foto || '';
    $('#ksNon').value = k.non; $('#ksTel').value = k.telefon || ''; $('#ksSeks').value = k.seks; $('#ksAdres').value = k.adres;
    $('#ksKonek').value = lan(k.denyeKoneksyon); $('#ksKreye').value = lan(k.datKreye); $('#ksSale').value = k.salaire; $('#ksNes').value = k.datNesans || '';
    $('#ksVant').value = DB.getAll('vant').filter(v => v.kesye === i).length; $('#ksId').textContent = k.id; $('#ksWol').value = wol(k); fotoRend(); rend($('#cheche').value);
  };
  $('#ksFoto').onclick = () => $('#ksFile').click();
  $('#ksFile').onchange = e => { if (e.target.files[0]) redui(e.target.files[0], 150, d => { foto = d; fotoRend(); }); };
  $('#ksNouvo').onclick = () => fomKesye(() => { toast('Kesye ajoute.'); rend(); });
  $('#ksValide').onclick = () => {
    if (!id) return toast('Chwazi yon kesye nan tablo a.');
    const non = capFinal($('#ksNon').value); if (!non) return toast('Non an obligatwa.');
    const e = verifNes($('#ksNes').value); if (e) return toast(e);
    const ch = { non, telefon: $('#ksTel').value.trim(), seks: $('#ksSeks').value, adres: $('#ksAdres').value.trim() || 'Poko defini', datNesans: $('#ksNes').value, foto };
    if (peutSale) ch.salaire = Math.max(0, +$('#ksSale').value || 0);
    DB.update('kesye', id, ch);
    log('kesye', 'Kesye modifye: ' + id); toast('Modifikasyon valide.'); chwazi(id); antetRend();
  };
  // chanje wòl (sèl admin prensipal la)
  $('#ksWolBtn').onclick = () => {
    if (!id) return toast('Chwazi yon kesye nan tablo a.');
    const k = DB.find('kesye', id);
    if (k.prensipal) return toast('Ou pa ka chanje wòl admin prensipal la.');
    DB.update('kesye', id, { wol: $('#ksWol').value });
    log('kesye', `Wòl ${k.non} chanje an ${WOLTXT[$('#ksWol').value]}`); toast('Wòl chanje.'); rend($('#cheche').value);
  };
  $('#ksSiprime').onclick = () => {
    if (!id) return toast('Chwazi yon kesye.');
    const k = DB.find('kesye', id);
    if (id === kesyeAktif().id) return toast('Ou pa ka siprime pwòp kont ou.');
    if (k.prensipal) return toast('Ou pa ka siprime admin prensipal la.');
    if (wol(k) !== 'kesye' && !estPrensipal()) return toast('Sèl admin prensipal la ka revoke yon admin.');
    konfime('Revoke kesye ' + id + ' ?', () => { DB.delete('kesye', id); log('kesye', 'Kesye revoke: ' + id); id = null; vid(); rend(); });
  };
  $('#ksRapo').onclick = pdfKesye;
  App.onSearch = rend; rend();
};

/* ================= PAJ PWODWI ================= */
Pajs.pwodwi = () => {
  let id = null, tri = 'tout';
  const TRI = { tout: 'Tout pwodwi yo', fini: 'Pwodwi ki fini', feb: 'Stòk ki fèb' }, ETA = { fini: 'Fini', feb: 'Fèb', ok: 'OK' };
  $('#cheche').placeholder = 'Cheche pwodwi...';
  $('#pwSiprime').hidden = !estGere();   // admin ak semi-admin sèlman (semi: kenbe nan istorik)
  const benefis = () => $('#pwBenefis').value = fmt((+$('#pwVente').value || 0) - (+$('#pwAchat').value || 0));
  const vid = () => { id = null; ['pwDesk', 'pwKan', 'pwAchat', 'pwVente', 'pwBenefis', 'pwDat'].forEach(x => $('#' + x).value = ''); rend($('#cheche').value); };
  const rend = (f = '') => {
    $('#pwTri').textContent = 'Tri: ' + TRI[tri];
    const l = DB.getAll('pwodwi').filter(p => p.desk.toLowerCase().includes(f.toLowerCase()) && (tri === 'tout' || (tri === 'fini' ? etatStok(p) === 'fini' : etatStok(p) === 'feb')));
    $('#pwTab').innerHTML = l.map(p => `<tr data-id="${p.id}" class="notranslate ${p.id === id ? 'sel' : ''}"><td>${p.id}</td><td>${esc(p.desk)}</td><td>${p.kantite}</td><td>${fmt(p.achat)}</td><td>${fmt(p.vente)}</td><td>${fmt(p.vente - p.achat)}</td><td class="eta eta-${etatStok(p)}">${ETA[etatStok(p)]}</td></tr>`).join('') || '<tr><td colspan="7" class="vid" style="font-size:24px">VID</td></tr>';
    $$('#pwTab tr[data-id]').forEach(r => r.onclick = () => {
      const p = DB.find('pwodwi', +r.dataset.id); id = p.id;
      $('#pwDesk').value = p.desk; $('#pwKan').value = p.kantite; $('#pwAchat').value = p.achat; $('#pwVente').value = p.vente; $('#pwDat').value = lan(p.datRenouvel); benefis(); rend($('#cheche').value);
    });
  };
  // bouton tri a: tout -> fini -> fèb -> tout
  $('#pwTri').onclick = () => { tri = tri === 'tout' ? 'fini' : tri === 'fini' ? 'feb' : 'tout'; rend($('#cheche').value); };
  // li fòm lan; retounen {d} si tout bon oswa {er} si gen erè
  const lis = () => {
    const d = { desk: $('#pwDesk').value.trim(), kantite: parseInt($('#pwKan').value), achat: parseFloat($('#pwAchat').value), vente: parseFloat($('#pwVente').value) };
    if (!d.desk) return { er: 'Deskripsyon an obligatwa.' };
    if ([d.kantite, d.achat, d.vente].some(n => isNaN(n) || n < 0)) return { er: 'Kantite ak pri yo dwe se nimewo ki pa negatif.' };
    return { d };
  };
  // achat stòk la anrejistre nan Finans (sòti lajan)
  const achatFinans = (desk, kan, pa) => { const k = kesyeAktif(); if (kan > 0 && pa > 0) DB.save('finans', { tip: 'achat', desk: 'Achat stòk: ' + desk, detay: `${kan} x ${fmt(pa)}`, mont: kan * pa, kesye: k.id, non: k.non, dat: new Date().toISOString() }); };
  ['pwAchat', 'pwVente'].forEach(x => $('#' + x).oninput = benefis);
  $('#pwNouvo').onclick = vid;
  $('#pwAjoute').onclick = () => {
    const { d, er } = lis(); if (er) return toast(er);
    if (DB.getAll('pwodwi').some(p => p.desk.toLowerCase() === d.desk.toLowerCase())) return toast('Pwodwi sa a deja egziste.');
    DB.save('pwodwi', { ...d, kanRef: d.kantite, datRenouvel: new Date().toISOString() }); achatFinans(d.desk, d.kantite, d.achat);
    log('pwodwi', 'Nouvo pwodwi: ' + d.desk); toast('Pwodwi ajoute.'); vid();
  };
  $('#pwModifye').onclick = () => {
    if (!id) return toast('Chwazi yon pwodwi nan tablo a.');
    const { d, er } = lis(); if (er) return toast(er);
    const ansyen = DB.find('pwodwi', id), plis = d.kantite > ansyen.kantite;
    // dat renouvèlman ak kantite referans chanje sèlman si stòk la ogmante
    DB.update('pwodwi', id, { ...d, kanRef: plis ? d.kantite : Math.max(ansyen.kanRef || 0, d.kantite), datRenouvel: plis ? new Date().toISOString() : ansyen.datRenouvel });
    if (plis) achatFinans(d.desk, d.kantite - ansyen.kantite, d.achat);
    log('pwodwi', 'Pwodwi modifye: ' + d.desk); toast('Pwodwi modifye.'); vid();
  };
  $('#pwSiprime').onclick = () => {
    if (!id) return toast('Chwazi yon pwodwi.');
    konfime('Siprime pwodwi sa a ?', () => { log('pwodwi', 'Pwodwi siprime: ' + DB.find('pwodwi', id).desk); DB.delete('pwodwi', id); vid(); });
  };
  $('#pwRapo').onclick = () => rapoPDF('Rapò pwodwi yo', ['ID', 'Deskripsyon', 'Kantite', 'Px achat', 'Px vente', 'Benefis'], DB.getAll('pwodwi').map(p => [p.id, p.desk, p.kantite, fmt(p.achat), fmt(p.vente), fmt(p.vente - p.achat)]));
  App.onSearch = rend; rend();
};

/* ================= ANTÈT + ROUTER ================= */
function antetRend() {
  const k = kesyeAktif(); if (!k) return;
  $('#nonKont').textContent = k.non.split(' ').pop().toUpperCase();
  $('#iconePwofil').innerHTML = k.foto ? `<img src="${k.foto}">` : ik('profil');
}
// si moun nan poko gen foto pwofil, klike sou ikòn nan ouvri chwa imaj sou òdinatè a
$('#iconePwofil').onclick = () => { const k = kesyeAktif(); if (k && !k.foto) $('#pwFoto').click(); };
$('#pwFoto').onchange = e => {
  const f = e.target.files[0], k = kesyeAktif(); e.target.value = '';
  if (f && k) redui(f, 150, d => { DB.update('kesye', k.id, { foto: d }); antetRend(); toast('Foto pwofil sove.'); });
};
const PAJ = { konekte: 'Konekte', akey: 'Akey', vann: 'Vann', kesye: 'Kesye', pwodwi: 'Pwodwi', rapo: 'Rapo/Stat', istorik: 'Istorik', finans: 'Finans', paramet: 'Paramet' };
const ale = p => location.hash === '#' + p ? chaje() : (location.hash = p);

function chaje() {
  let p = location.hash.slice(1); if (!PAJ[p]) p = 'akey';
  // pa gen lisans valid -> ekran lisans lan
  if (lisansEtat() !== 'ok') { $('#layout').hidden = true; $('#loginZon').hidden = true; $('#titPaj').textContent = 'VANDA - Lisans'; montreLisans(); return; }
  $('#lisansZon').hidden = true;
  const k = kesyeAktif();
  if (!k && p !== 'konekte') return ale('konekte');
  if (k && p === 'konekte') return ale('akey');
  if (k && !ACCES[p]()) { toast('Ou pa gen aksè nan paj sa a.'); return ale('akey'); }
  $('#layout').hidden = p === 'konekte'; $('#loginZon').hidden = p !== 'konekte';
  $('#titPaj').textContent = 'VANDA - ' + PAJ[p];
  // meni a montre sèlman paj moun nan gen dwa wè
  $$('.menuItem').forEach(b => { b.classList.toggle('aktif', b.dataset.paj === p); b.hidden = !!k && !ACCES[b.dataset.paj](); });
  // netwaye sa paj anvan an te kite
  const pb = $('#paramBtn'); if (pb) pb.remove();
  $('.bwatRecherche').hidden = false; $('#sijesyon').hidden = true;
  App.onSearch = null; $('#cheche').value = ''; $('#cheche').placeholder = 'Cheche...'; $('#cheche').onkeydown = null; $('#cheche').onblur = null;
  const z = p === 'konekte' ? $('#loginZon') : $('#kontni');
  z.innerHTML = PAGES[p]; ranpliIk(z);
  antetRend(); Pajs[p]();
}

const deco = () => { localStorage.removeItem('vanda_sesyon'); ale('konekte'); };
$$('.menuItem').forEach(b => b.onclick = () => ale(b.dataset.paj));
$('#btnDeco').onclick = deco;
$('#btnQuitter').onclick = () => konfime('Quitter VANDA ? Ou pral dekonekte.', deco);
$('#cheche').oninput = e => App.onSearch && App.onSearch(e.target.value);
ranpliIk();   // ikòn ak logo ki nan index.html

/* ---- Ekran konplè (kache bouton an sou aparèy ki pa sipòte l, tankou iPhone) ---- */
if (!document.documentElement.requestFullscreen) $('#btnFull').hidden = true;
$('#btnFull').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
document.addEventListener('fullscreenchange', () => document.body.classList.toggle('plenEkran', document.fullscreenElement === document.documentElement));

/* ---- Lang: Google Translate. Nou pa ekri okenn tradiksyon, chwa a sove nan localStorage ---- */
function initTradiksyon() { new google.translate.TranslateElement({ pageLanguage: 'ht', includedLanguages: 'ht,fr,en,es', autoDisplay: false }, 'google_translate_element'); aplikeLang(); }
function aplikeLang(essai = 0) {
  const l = localStorage.getItem('vanda_lang') || 'ht'; if (l === 'ht') return;
  const c = $('.goog-te-combo');
  if (!c) { if (essai < 25) setTimeout(() => aplikeLang(essai + 1), 300); return; }
  c.value = l; c.dispatchEvent(new Event('change'));
}
$('#chwaziLang').value = localStorage.getItem('vanda_lang') || 'ht';
$('#chwaziLang').onchange = e => {
  const l = e.target.value; localStorage.setItem('vanda_lang', l);
  const ekspire = ';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
  if (l === 'ht') { document.cookie = 'googtrans=' + ekspire; document.cookie = 'googtrans=' + ekspire + ';domain=' + location.hostname; location.reload(); }
  else { document.cookie = 'googtrans=/ht/' + l + ';path=/'; const c = $('.goog-te-combo'); if (c) { c.value = l; c.dispatchEvent(new Event('change')); } else location.reload(); }
};
