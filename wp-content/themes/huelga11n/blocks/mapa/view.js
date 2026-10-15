/* Copiado de prototipo/index.html. Cambios: todos los puntos tienen el mismo radio y los contactos @usuario enlazan a Instagram. CIUDADES lo define PHP justo antes de este script (huelga11n_datos_mapa_js). */
/* Misma proyección que la usada para dibujar el mapa (equirectangular, lat0 = 40º).
   Canarias está desplazada al recuadro: sumar 9º a lon y 6.3º a lat. */
function proyectar(lon, lat, canarias) {
  if (canarias) { lon += 9; lat += 6.3; }
  const k = Math.cos(40 * Math.PI / 180), S = 62;
  return [(lon + 9.6) * k * S, (44 - lat) * S];
}

(function () {
  const svgNS = 'http://www.w3.org/2000/svg';
  const mapa = document.getElementById('mapa');
  const gPuntos = document.getElementById('puntos');
  const ficha = document.getElementById('ficha');
  const listado = document.getElementById('listado');
  const buscar = document.getElementById('buscar');
  const resumen = document.getElementById('resumen');
  const puntos = {};
  let fijado = false, actual = null, cierreDiferido = null;

  /* Fila de comité: nombre + contacto (o "pendiente").
     Un contacto «@usuario» es un enlace a su Instagram (https://www.instagram.com/usuario/). */
  const INSTAGRAM = /^@([A-Za-z0-9._]{1,30})$/;
  function contacto(texto, q) {
    const ig = INSTAGRAM.exec(texto);
    const k = document.createElement(ig ? 'a' : 'span'); k.className = 'com__contacto' + (texto ? '' : ' pendiente');
    if (ig) {
      k.href = `https://www.instagram.com/${ig[1]}/`;
      k.target = '_blank'; k.rel = 'noopener';
      k.setAttribute('aria-label', `${texto} en Instagram (se abre en otra pestaña)`);
    }
    k.append(texto ? (q ? marcar(texto, q) : texto) : 'pendiente');
    return k;
  }
  function filaComite(com, q) {
    const li = document.createElement('li');
    const n = document.createElement('span'); n.className = 'com__nombre';
    n.append(q ? marcar(com.nombre, q) : com.nombre);
    li.append(n, contacto(com.contacto, q));
    return li;
  }
  /* Contactos generales de la ciudad (correo o @usuario), junto a su nombre */
  function contactosCiudad(c, clase, q) {
    const p = document.createElement('span'); p.className = clase;
    (c.contactos || []).forEach(t => p.append(contacto(t, q)));
    return p;
  }
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const total = CIUDADES.reduce((n, c) => n + c.comites.length, 0);

  /* ---- Ficha flotante ---- */
  function colocar() {
    if (!actual) return;
    const r = puntos[actual.id].getBoundingClientRect(), m = mapa.getBoundingClientRect();
    const ancho = ficha.offsetWidth, alto = ficha.offsetHeight;
    let x = r.left + r.width / 2 - m.left;
    x = Math.max(ancho / 2 - 8, Math.min(m.width - ancho / 2 + 8, x));
    const y = r.top + r.height / 2 - m.top;
    // Si no cabe por encima del punto, se abre por debajo
    const abajo = (r.top + r.height / 2) - alto - 28 < 0;
    ficha.classList.toggle('abajo', abajo);
    ficha.style.left = x + 'px';
    ficha.style.top = (abajo ? y + 6 : y - 6) + 'px';
  }
  function mostrar(c) {
    clearTimeout(cierreDiferido);
    actual = c;
    ficha.querySelector('.ficha__ccaa').textContent = c.ccaaNombre;
    const nombre = ficha.querySelector('.ficha__nombre');
    nombre.textContent = c.nombre;
    const n = document.createElement('small');
    n.textContent = c.comites.length === 1 ? '1 comité' : c.comites.length + ' comités';
    nombre.appendChild(n);
    const generales = ficha.querySelector('.ficha__contactos');
    generales.replaceChildren(...contactosCiudad(c, 'x').childNodes);
    generales.hidden = !(c.contactos || []).length;
    const lista = ficha.querySelector('.ficha__lista');
    lista.replaceChildren(...c.comites.map(com => filaComite(com)));
    lista.scrollTop = 0;
    ficha.hidden = false;
    colocar();
    Object.values(puntos).forEach(p => p.classList.toggle('activo', p === puntos[c.id]));
    document.querySelectorAll('.ccaa').forEach(p => p.classList.toggle('activa', p.id === 'ccaa-' + c.ccaa));
  }
  function ocultar() {
    ficha.hidden = true; fijado = false; actual = null;
    document.querySelectorAll('.punto.activo, .ccaa.activa').forEach(p => p.classList.remove('activo', 'activa'));
  }
  const ocultarLuego = () => { if (!fijado) cierreDiferido = setTimeout(ocultar, 250); };

  /* ---- Puntos del mapa ---- */
  CIUDADES.forEach(c => {
    const region = document.getElementById('ccaa-' + c.ccaa);
    if (region) region.classList.add('con-comite');
  });
  // Las ciudades con más comités se dibujan primero para que las pequeñas queden encima
  [...CIUDADES].sort((a, b) => b.comites.length - a.comites.length).forEach(c => {
    const [x, y] = proyectar(c.lon, c.lat, c.ccaa === 'canarias');
    const r = 7.5; // todos los puntos iguales, tengan los comités que tengan
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'punto');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${c.nombre}: ${c.comites.length} comités`);
    g.innerHTML = `<circle class="punto__halo" cx="${x}" cy="${y}" r="${r}"/><circle class="punto__nucleo" cx="${x}" cy="${y}" r="${r}"/>`;
    gPuntos.appendChild(g);
    puntos[c.id] = g;

    g.addEventListener('mouseenter', () => { if (!fijado) mostrar(c); });
    g.addEventListener('mouseleave', ocultarLuego);
    g.addEventListener('click', e => { e.stopPropagation(); fijado = true; mostrar(c); });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fijado = true; mostrar(c); } });
  });

  ficha.addEventListener('mouseenter', () => clearTimeout(cierreDiferido));
  ficha.addEventListener('mouseleave', ocultarLuego);
  ficha.addEventListener('click', e => e.stopPropagation());
  ficha.querySelector('.ficha__cerrar').addEventListener('click', ocultar);
  document.addEventListener('click', () => { if (fijado) ocultar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ocultar(); });
  window.addEventListener('resize', colocar);

  /* ---- Listado lateral con buscador ---- */
  function marcar(texto, q) {
    const frag = document.createDocumentFragment();
    if (!q) { frag.append(texto); return frag; }
    const i = norm(texto).indexOf(q);
    if (i < 0) { frag.append(texto); return frag; }
    const m = document.createElement('mark');
    m.textContent = texto.slice(i, i + q.length);
    frag.append(texto.slice(0, i), m, texto.slice(i + q.length));
    return frag;
  }
  function pintarListado() {
    const q = norm(buscar.value.trim());
    let nCiudades = 0, nComites = 0;
    listado.replaceChildren();
    [...CIUDADES].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).forEach(c => {
      const ciudadCoincide = !q || norm(c.nombre).includes(q) || norm(c.ccaaNombre).includes(q) || (c.contactos || []).some(t => norm(t).includes(q));
      const items = ciudadCoincide ? c.comites : c.comites.filter(com => norm(com.nombre).includes(q) || norm(com.contacto).includes(q));
      if (!items.length) return;
      nCiudades++; nComites += items.length;

      const d = document.createElement('details');
      d.className = 'ciudad';
      if (q) d.open = true;
      const s = document.createElement('summary');
      const nom = document.createElement('span'); nom.className = 'ciudad__nombre'; nom.append(marcar(c.nombre, ciudadCoincide ? q : ''));
      const n = document.createElement('span'); n.className = 'ciudad__n'; n.textContent = items.length;
      s.append(nom, n);
      if ((c.contactos || []).length) s.append(contactosCiudad(c, 'ciudad__contactos', q));
      const ul = document.createElement('ul');
      items.forEach(com => ul.appendChild(filaComite(com, ciudadCoincide ? '' : q)));
      const ver = document.createElement('button');
      ver.type = 'button'; ver.className = 'ciudad__ver'; ver.textContent = 'Ver en el mapa';
      ver.addEventListener('click', e => {
        e.stopPropagation(); fijado = true;
        mapa.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mostrar(c);
      });
      const li = document.createElement('li'); li.appendChild(ver); li.style.listStyle = 'none';
      li.className = 'sin-barra';
      ul.appendChild(li);
      d.append(s, ul);
      listado.appendChild(d);
    });
    if (!nCiudades) {
      const p = document.createElement('p'); p.className = 'sin-resultados';
      p.textContent = 'No hay ningún comité con ese nombre. Prueba con tu ciudad o tu universidad.';
      listado.appendChild(p);
    }
    resumen.textContent = q
      ? `${nComites} ${nComites === 1 ? 'comité' : 'comités'} en ${nCiudades} ${nCiudades === 1 ? 'ciudad' : 'ciudades'}`
      : `${total} comités en ${CIUDADES.length} ciudades`;
  }
  buscar.addEventListener('input', pintarListado);
  pintarListado();
})();
