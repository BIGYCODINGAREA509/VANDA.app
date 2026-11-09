/* ===== KOUCH BAZ DONE (localStorage) =====
   Tout aplikasyon an pale ak DB sèlman. Pou Supabase pita: ranplase kò fonksyon sa yo,
   kenbe menm non yo epi rès kòd la p ap bezwen chanje. */
const DB = {
  _k: t => 'vanda_' + t,
  // bay tout done yon tab (lis)
  getAll(t) { try { return JSON.parse(localStorage.getItem(this._k(t))) || []; } catch (e) { return []; } },
  _ekri(t, l) { localStorage.setItem(this._k(t), JSON.stringify(l)); },
  // jwenn yon done pa id
  find(t, id) { return this.getAll(t).find(x => x.id === id); },
  // ajoute yon done (si pa gen id, nou kreye yon nimewo otomatik)
  save(t, o) {
    const l = this.getAll(t);
    if (o.id === undefined) o.id = l.reduce((m, x) => Math.max(m, +x.id || 0), 0) + 1;
    l.push(o); this._ekri(t, l); return o;
  },
  // modifye yon done
  update(t, id, c) { const l = this.getAll(t), x = l.find(y => y.id === id); if (x) { Object.assign(x, c); this._ekri(t, l); } return x; },
  // siprime yon done
  delete(t, id) { this._ekri(t, this.getAll(t).filter(x => x.id !== id)); },
  // vide yon tab nèt
  clear(t) { localStorage.removeItem(this._k(t)); },
  // pou yon sèl objè (egzanp paramèt yo)
  getOne(t, d) { try { return JSON.parse(localStorage.getItem(this._k(t))) || d; } catch (e) { return d; } },
  setOne(t, o) { localStorage.setItem(this._k(t), JSON.stringify(o)); },
  // premye done yo (yon sèl fwa) + ranje ansyen done
  init() {
    if (!localStorage.getItem('vanda_seed')) {
      const now = new Date().toISOString();
      // admin prensipal la
      this.save('kesye', { id: 'DAMXA', non: 'Alexis Djousson', adres: 'Poko defini', telefon: '', seks: 'Gason', datNesans: '2005-09-23', salaire: 0, modpas: '1234', foto: '', wol: 'admin', prensipal: true, denyeKoneksyon: '', datKreye: now });
      [['Ordinateur', 3, 500, 600], ['Routeur', 15, 2000, 2500], ['Souris', 13, 2000, 2500]]
        .forEach(([desk, kantite, achat, vente]) => this.save('pwodwi', { desk, kantite, kanRef: kantite, achat, vente, datRenouvel: now }));
      localStorage.setItem('vanda_seed', '1');
    }
    // migrasyon: bay chak kesye yon wòl, epi asire gen yon admin prensipal
    const ks = this.getAll('kesye');
    ks.forEach(k => { if (!k.wol) k.wol = 'kesye'; });
    if (ks.length && !ks.some(k => k.prensipal)) {
      const a = ks.find(k => k.id === 'DAMXA') || ks.find(k => k.wol === 'admin') || ks[0];
      a.wol = 'admin'; a.prensipal = true;
    }
    this._ekri('kesye', ks);
    // pwodwi ki pa gen kantite referans (pou kalkile stòk fèb)
    const ps = this.getAll('pwodwi'); ps.forEach(p => { if (p.kanRef === undefined) p.kanRef = p.kantite; }); this._ekri('pwodwi', ps);
  }
};
DB.init();
