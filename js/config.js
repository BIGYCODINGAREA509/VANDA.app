/* ===== KONFIGIRASYON ===== 
   Isit la w ka chanje chemen imaj yo ak kòd devlopè a.
   Gwosè imaj yo kontwole nan css/style.css (kòmansman fichye a, seksyon :root). */
const ICONS = {
  logo:      'images/logoVanda.png',
  akey:      'images/icons/akey.png',
  vann:      'images/icons/vann.png',
  kesye:     'images/icons/kesye.png',
  pwodwi:    'images/icons/pwodwi.png',
  rapo:      'images/icons/rapo.png',
  istorik:   'images/icons/istorik.png',
  finans:    'images/icons/finans.png',
  paramet:   'images/icons/paramet.png',
  rechech:   'images/icons/rechech.png',
  plenEkran: 'images/icons/plenEkran.png',
  profil:    'images/icons/profil.png',   // foto pa defo si kesye a poko mete youn
  avatar:    'images/icons/avatar.png',   // gwo avatar nan paj koneksyon an
  kamera:    'images/icons/kamera.png',   // foto kesye / logo pwodwi
  lisans:    'images/icons/lisans.png'    // ekran lisans lan
};
// Kòd pou espas devlopè a (reyinisyalize aplikasyon an nèt, lisans enkli). CHANJE L!
const KOD_DEV = '1234';
// kreye yon <img> pou yon ikòn (si imaj la poko la, kote a rete vid, pa gen ikòn kase)
const ik = n => `<img class="ik ik-${n}" src="${ICONS[n]}" alt="" draggable="false" onerror="this.style.visibility='hidden'">`;
// logo VANDA a (si imaj la manke, nou afiche tèks VANDA)
const logoImg = c => `<img class="logoImg ${c || ''}" src="${ICONS.logo}" alt="VANDA" draggable="false" onerror="this.replaceWith(document.createTextNode('VANDA'))">`;
// ranpli tout kote ki gen data-ik oswa data-logo
function ranpliIk(r = document) {
  r.querySelectorAll('[data-ik]').forEach(e => e.innerHTML = ik(e.dataset.ik));
  r.querySelectorAll('[data-logo]').forEach(e => e.innerHTML = logoImg(e.dataset.logo));
}
