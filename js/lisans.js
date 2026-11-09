/* ===== LISANS =====
   Chak kòd gen yon non ak yon dire: [non, inite, kantite]  (j = jou, m = mwa, a = ane, null = ilimite)
   NÒT: verifikasyon an fèt nan navigatè a. Lè w pase sou Supabase, verifye kòd yo sou sèvè a. */
const LISANS = {
  'VND-7K9P-2M4X-8QRT': ['Demo 1 jou', 'j', 1],
  'VND-3W6N-9B2F-5JHK': ['7 jou', 'j', 7],
  'VND-8R4T-1Y7C-6PZM': ['1 mwa', 'm', 1],
  'VND-5H2Q-7L9D-3XKW': ['3 mwa', 'm', 3],
  'VND-9M6B-4K1R-7TYP': ['6 mwa', 'm', 6],
  'VND-2X8J-5N3W-9FQL': ['1 an', 'a', 1],
  'VND-4P7Z-6C2M-8HRT': ['2 an', 'a', 2],
  'VND-1K5Y-9Q4B-2WDX': ['5 an', 'a', 5],
  'VND-6T3F-8M7N-4JPK': ['Ilimite', null, 0]
};

// kalkile dat fen lisans lan
function fenLisans(dat, [, u, n]) {
  if (!u) return null;
  const d = new Date(dat);
  if (u === 'j') d.setDate(d.getDate() + n); else if (u === 'm') d.setMonth(d.getMonth() + n); else d.setFullYear(d.getFullYear() + n);
  return d.toISOString();
}

// 'ok' = lisans valid | 'pa' = pa gen lisans | 'ekspire' | 'tan' = revèy òdinatè a tounen dèyè
function lisansEtat() {
  const l = DB.getOne('lisans', null); if (!l) return 'pa';
  const now = Date.now(), dènye = +localStorage.getItem('vanda_tan') || 0;
  if (now < dènye - 864e5) return 'tan';
  localStorage.setItem('vanda_tan', Math.max(now, dènye));
  if (l.fen && now > new Date(l.fen).getTime()) return 'ekspire';
  return 'ok';
}

// verifye epi sove lisans lan; retounen yon mesaj erè oswa null si tout bon
function aktiveLisans(kod) {
  const e = LISANS[kod]; if (!e) return 'Kòd lisans sa a pa valid.';
  const itil = DB.getOne('lisansYo', {}), deja = itil[kod];
  if (deja) {
    if (deja.fen && new Date(deja.fen) < new Date()) return 'Lisans sa a deja ekspire. Achte yon lòt.';
    DB.setOne('lisans', deja);                      // kòd la te deja aktive: nou remete l
  } else {
    const dat = new Date().toISOString(), l = { kod, non: e[0], dat, fen: fenLisans(dat, e) };
    itil[kod] = l; DB.setOne('lisansYo', itil); DB.setOne('lisans', l);   // sove ki lisans ki achte a
    log('lisans', 'aktive lisans ' + e[0], 'Kòd: ' + kod, null);
  }
  return lisansEtat() === 'ok' ? null : 'Revèy òdinatè a pa kòrèk. Korije dat la epi eseye ankò.';
}

// ekran lisans lan (parèt anvan tout bagay si pa gen lisans valid)
function montreLisans() {
  const z = $('#lisansZon'), et = lisansEtat();
  z.hidden = false;
  z.innerHTML = `<div class="lisansKat">
    <div class="lisansTit"><div class="lisansLogo" data-ik="lisans"></div><div><small>KONFIGIRASYON</small><h2>LISANS</h2></div></div>
    <div class="lisansBwat"><b>AJOUTE LISANS OU LA:</b>
      <div class="lisansChan">VND- <input maxlength="4" autocomplete="off"> - <input maxlength="4" autocomplete="off"> - <input maxlength="4" autocomplete="off"></div></div>
    <button class="btn lisansOk" id="lsOk">OK</button>
    <div class="lisansMes" id="lsMes">${{ pa: 'Ou poko gen lisans. Antre kòd ou a pou kontinye.', ekspire: 'Lisans ou a ekspire. Antre yon nouvo kòd.', tan: 'Revèy òdinatè a pa kòrèk. Korije dat la.' }[et]}</div>
    <a class="lisansAid" id="lsAid">Poukisa sa afiche?</a><a class="lisansAid" id="lsDev">Espas devlopè</a></div>`;
  ranpliIk(z); $('#lsDev').onclick = devReset;
  const ins = $$('#lisansZon input');
  ins.forEach((i, n) => {
    i.oninput = () => { i.value = i.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (i.value.length === 4 && ins[n + 1]) ins[n + 1].focus(); };
    i.onpaste = e => {   // kole kòd konplè a nan nenpòt ka
      const t = (e.clipboardData.getData('text') || '').toUpperCase().replace(/^\s*VND-?/, '').replace(/[^A-Z0-9]/g, '');
      if (t.length > 4) { e.preventDefault(); ins.forEach((x, m) => x.value = t.slice(m * 4, m * 4 + 4)); }
    };
    i.onkeydown = e => { if (e.key === 'Enter') $('#lsOk').click(); if (e.key === 'Backspace' && !i.value && ins[n - 1]) ins[n - 1].focus(); };
  });
  ins[0].focus();
  $('#lsAid').onclick = () => mesaj('VANDA bezwen yon lisans valid pou l fonksyone. Si w poko achte youn, kontakte vandè a pou w jwenn yon kòd (fòm: VND-XXXX-XXXX-XXXX). Ekran sa a parèt tou lè lisans ou a ekspire.');
  $('#lsOk').onclick = () => {
    const er = aktiveLisans('VND-' + ins.map(i => i.value).join('-'));
    if (er) { $('#lsMes').textContent = er; return; }
    z.hidden = true; z.innerHTML = ''; chaje();
  };
}
