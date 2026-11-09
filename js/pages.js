/* ===== MODÈL HTML PAJ YO =====
   Yo la dirèkteman nan JavaScript pou sit la mache lè w double-klike sou index.html
   (pa bezwen VS Code ni sèvè). */
const PAGES = {};

PAGES.konekte = `
<div class="loginGoch"><h2>BYENVINI SOU</h2><h1>VANDA<sup>HT</sup></h1></div>
<div class="loginKat">
  <div class="loginAvatar" data-ik="avatar"></div>
  <h3 style="color:#fff;text-align:center">KONEKSYON</h3>
  <input id="lgId" placeholder="KOD IDANTIFIKASYON" autocomplete="off">
  <div class="modpasLiy"><input id="lgPas" type="password" placeholder="MODPAS"><button id="lgWe" type="button">WÈ</button></div>
  <a id="lgBliye">Bliye modpas oswa ID?</a>
  <button class="btn btnVet" id="lgOk">KONEKTE</button>
  <a id="lgKreye">Kreye kont !</a>
  <div class="modalErr" id="lgErr"></div>
</div>
<div class="kredi">CREATED BY: <b>ALEXIS DJOUSSON</b></div>`;

PAGES.akey = `
<div class="akGrid">
  <div class="stat stVet"><span id="akLab1">Tout kòb</span><strong id="akSom">0 G</strong></div>
  <div class="stat stOranj"><span>Vant jodi a</span><strong id="akNb">0</strong></div>
  <div class="kat akStok"><h3>Stòk pwodwi ki fèb</h3><div class="tabSkrol akStokSkrol">
    <table><thead><tr><th>Deskripsyon</th><th>Kantite</th></tr></thead><tbody id="akStok"></tbody></table></div></div>
  <div class="kat akStat" id="akStatKat"><h3>Statistik finansye <a class="lyen" data-ale="rapo">Wè tout</a></h3>
    <div class="lyenStat">
      <button class="btn btnVet" data-ale="rapo">Statistik sou vant yo</button>
      <button class="btn btnVet" data-ale="rapo">Statistik sou pwodwi</button>
      <button class="btn btnVet" data-ale="rapo">Statistik sou kesye yo</button>
    </div></div>
  <div class="kat akPie"><h3>Stat vant</h3><div id="akPie"></div></div>
  <div class="kat akTrans"><h3>Denye tranzaksyon yo <a class="lyen" id="akVwaTout" data-ale="istorik">Wè tout</a></h3><div id="akTrans"></div></div>
  <div class="kat akGraf"><h3>Grafik</h3><div class="grafBa" id="akGraf"></div></div>
</div>`;

PAGES.vann = `
<div class="kat vnHaut">
  <div class="foto" style="cursor:default"><i data-ik="kamera"></i></div>
  <div>
    <label>Deskripsyon pwodwi<input id="vnDesk" readonly></label>
    <div class="vnRanje">
      <label>Kantite<div class="kantitBwat"><button class="btn btnVet" id="vnMwen" type="button">−</button><input id="vnKan" type="number" min="1" value="1"><button class="btn btnVet" id="vnPlis" type="button">+</button></div></label>
      <label>Px. unit.<input id="vnPu" readonly></label>
      <label>Px. tot.<input id="vnPt" readonly></label>
      <button class="btn btnVet" id="vnAjoute">Ajoute nan panye</button>
    </div>
  </div>
</div>
<div class="vnBa">
  <div class="kat">
    <h3>Panye <small id="vnTotal">Total: 0 G</small></h3>
    <div class="tabSkrol"><table><thead><tr><th>Deskripsyon</th><th>Kantite</th><th>Px unit</th><th>Px tot</th><th></th></tr></thead><tbody id="vnPanye"></tbody></table></div>
    <div class="panyeBa"><button class="btn btnOranj" id="vnValide">VALIDE</button><button class="btn btnWouj" id="vnAnile">Anile vant ×</button></div>
  </div>
  <div>
    <div class="kat"><h3>Tout pwodwi dispo yo</h3><div class="pwoLis tabSkrol" id="vnListe"></div></div>
    <div class="kat" style="margin-top:12px"><label>Non kliyan <span id="vnKlOp">(fakiltatif)</span><input id="vnKliyan" list="vnKlLis" autocomplete="off"><datalist id="vnKlLis"></datalist></label></div>
  </div>
</div>`;

PAGES.kesye = `
<div class="kat"><h3>Tout kesye yo</h3>
  <div class="tabSkrol"><table><thead><tr><th>ID</th><th>Non</th><th>Wòl</th><th>Adrès</th><th>Telefòn</th><th>Sèks</th><th>Dat n.</th><th>Salè</th><th>Dènye koneksyon</th><th>Dat kreye kont</th><th>Total vant</th></tr></thead><tbody id="ksTab"></tbody></table></div></div>
<div class="ksBa">
  <div class="kat ksFom">
    <div class="foto" id="ksFoto" title="Chanje foto"><i data-ik="kamera"></i></div>
    <div><label>Non<input id="ksNon" data-cap></label><label>Telefòn<input id="ksTel"></label></div>
    <input type="file" id="ksFile" accept="image/*" hidden>
  </div>
  <div style="display:grid;gap:8px;align-content:start">
    <button class="btn btnVet" id="ksNouvo">AJOUTE NOUVO KESYE</button>
    <div style="display:flex;gap:8px"><button class="btn btnOranj" id="ksRapo" style="flex:1">RAPÒ</button><button class="btn btnWouj" id="ksSiprime" style="flex:1">SIPRIME / REVOKE</button></div>
  </div>
</div>
<div class="kat"><h3>Enfòmasyon sou kesye a <span class="idBadge notranslate" id="ksId">—</span></h3>
  <div class="ksInfo">
    <label>Sèks<select id="ksSeks"><option>Gason</option><option>Fi</option></select></label>
    <label>Adrès<input id="ksAdres"></label>
    <label>Dènye koneksyon<input id="ksKonek" readonly></label>
    <label>Dat kreyasyon kont<input id="ksKreye" readonly></label>
    <label>Total vant<input id="ksVant" readonly></label>
    <label>Salè<div class="enpG"><input id="ksSale" type="number" min="0"><span class="sifiks">G</span></div></label>
    <label>Dat nesans<input id="ksNes" type="date"></label>
    <label id="ksWolLab">Wòl<select id="ksWol"><option value="kesye">Kesye</option><option value="semi">Semi-admin</option><option value="admin">Admin</option></select></label>
    <div class="ksBoutonYo"><button class="btn btnGri" id="ksWolBtn">CHANJE WÒL</button><button class="btn btnOranj" id="ksValide">VALIDE MODIFIKASYON</button></div>
  </div>
</div>`;

PAGES.pwodwi = `
<div class="pwGrid">
  <div class="kat"><div class="pwTit"><h3 style="margin:0">Tout pwodwi yo</h3><button class="btn btnGri" id="pwTri">Tri: Tout pwodwi yo</button></div>
    <div class="tabSkrol" style="max-height:60vh"><table><thead><tr><th>ID</th><th>Deskripsyon</th><th>Kantite</th><th>Px achat</th><th>Px vente</th><th>Benefis</th><th>Eta</th></tr></thead><tbody id="pwTab"></tbody></table></div></div>
  <div class="kat">
    <label>Deskripsyon<textarea id="pwDesk" rows="2"></textarea></label>
    <div class="pwDe"><label>Kantite<input id="pwKan" type="number" min="0"></label><label>Px achat<input id="pwAchat" type="number" min="0" step="any"></label></div>
    <div class="pwDe"><label>Px vente<input id="pwVente" type="number" min="0" step="any"></label><label>Benefis<input id="pwBenefis" readonly></label></div>
    <label>Dat dènye renouvèlman stòk<input id="pwDat" readonly></label>
    <button class="btn btnGri" id="pwNouvo" style="width:100%;margin-bottom:8px">NOUVO PWODWI +</button>
    <div class="pwDe"><button class="btn btnVet" id="pwAjoute">AJOUTE</button><button class="btn btnOranj" id="pwModifye">MODIFYE ATIK</button></div>
    <div class="pwDe"><button class="btn btnGri" id="pwRapo">RAPÒ ENPRIME</button><button class="btn btnWouj" id="pwSiprime">SIPRIME</button></div>
  </div>
</div>`;

PAGES.rapo = `
<div class="kat rpHaut">
  <div>
    <h3 style="margin:0">Tout rapò yo</h3><small class="gri">SELEKSYONE YON RAPÒ</small>
    <div class="rpApersi"><div class="rpMini"><b id="rpMiniTit"></b><span id="rpMiniNon"></span><small id="rpMiniDat"></small></div></div>
  </div>
  <div class="rpListe">
    <label class="rpOpsyon"><input type="radio" name="rp" value="vant" checked> Rapò sou tout vant ki fèt yo</label>
    <label class="rpOpsyon"><input type="radio" name="rp" value="kesye"> Rapò sou tout kesye yo</label>
    <label class="rpOpsyon"><input type="radio" name="rp" value="aktivite"> Rapò sou tout aktivite yo net</label>
    <button class="btn rpEnp btnOranj" id="rpEnprime">ENPRIME</button>
  </div>
</div>
<div class="kat rpBa">
  <div>
    <h3>Tout tranzaksyon yo</h3>
    <div class="tabSkrol" style="max-height:230px"><table><thead><tr><th>#</th><th>Aktivite</th><th>Dat</th></tr></thead><tbody id="rpTab"></tbody></table></div>
    <div class="rpBouton"><button class="btn btnWouj" id="rpEfase">Efase istorisite a</button><button class="btn btnVet" id="rpEnpLog">ENPRIME</button></div>
  </div>
  <div class="rpDetay">
    <div class="rpBwat"><b>Dat</b><div id="rpDat">—</div></div>
    <div class="rpBwat" style="flex:1"><b>Detay</b><div id="rpDet">—</div></div>
  </div>
</div>`;

PAGES.istorik = `
<div class="kat">
  <div class="isHaut">
    <h3 style="margin:0">Istorik tout vant yo</h3>
    <div class="isFiltre"><small>Cheche yon deskripsyon, yon dat, oswa chwazi</small><select id="isDat"></select></div>
  </div>
  <div class="tabSkrol isTab"><table><thead><tr><th>ID</th><th>Deskripsyon</th><th>Kantite ki vann</th><th>Px unit</th><th>Px tot.</th><th>Kantite ki te dispo</th><th>Dat vann</th><th>Kesye</th><th># Fich</th></tr></thead><tbody id="isTab"></tbody></table></div>
  <div class="isBa"><div class="isTotal">TOTAL: <b id="isTotal">0 G</b></div><button class="btn btnWouj" id="isEfase">EFASE TOUT ISTORIK</button><button class="btn btnOranj" id="isEnprime">ENPRIME</button></div>
  <small class="gri">Double-klik sou yon liy pou reenprime fich vant lan.</small>
</div>`;

PAGES.finans = `
<div class="fnStat">
  <div class="stat stVet">Antre (vant + lòt antre)<strong id="fnAntre">0 G</strong></div>
  <div class="stat stRouj">Sòti (achat stòk + depans)<strong id="fnSoti">0 G</strong></div>
  <div class="stat stOranj">Balans<strong id="fnBalans">0 G</strong></div>
  <div class="stat stMawon">Benefis sou vant yo<strong id="fnBenefis">0 G</strong></div>
</div>
<div class="kat">
  <div class="isHaut">
    <h3 style="margin:0">Aktivite finansye yo</h3>
    <div class="isFiltre">
      <select id="fnTip"><option value="tout">Tout tip</option><option value="vant">Vant</option><option value="achat">Achat stòk</option><option value="depans">Depans</option><option value="antre">Lòt antre</option></select>
      <select id="fnDat"></select>
    </div>
  </div>
  <div class="tabSkrol isTab"><table><thead><tr><th>Dat</th><th>Tip</th><th>Deskripsyon</th><th>Kesye</th><th>Antre</th><th>Sòti</th></tr></thead><tbody id="fnTab"></tbody></table></div>
  <div class="isBa"><button class="btn btnVet" id="fnAjoute">+ AJOUTE DEPANS / ANTRE</button><button class="btn btnOranj" id="fnEnprime">ENPRIME</button></div>
</div>`;

PAGES.paramet = `
<div class="kat">
  <div class="pmTit"><h3>Paramèt</h3><button class="btn btnOranj" id="pmSove" hidden>SOVE CHANJMAN</button></div>
  <div class="pmEntrepriz">
    <div class="pmLogo" id="pmLogo" title="Chanje logo">LOGO</div>
    <div>
      <label>Non antrepriz la<input id="pmNon" readonly></label>
      <label>Adrès antrepriz la<input id="pmAdres" readonly></label>
      <label>Telefòn antrepriz la<input id="pmTel" readonly></label>
    </div>
    <div>
      <label>Mail antrepriz la<input id="pmMail" readonly></label>
      <label>Deviz antrepriz la itilize<input id="pmDev" readonly maxlength="4"></label>
      <label>Mesaj anba fich vant<input id="pmMes" readonly></label>
      <a class="lyen" id="pmModifye">Modifye</a>
    </div>
  </div>
  <input type="file" id="pmFile" accept="image/*" hidden>
  <div id="pmOps"></div>
  <div class="pmLisans" id="pmLis"></div>
  <div class="pmDevZon"><a id="pmDevBtn">Espas devlopè</a></div>
</div>`;
