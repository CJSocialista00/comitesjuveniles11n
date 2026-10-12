/* ===== Mapa: zoom con dos dedos (pantallas táctiles) =====
   Dos dedos: pellizcar amplía/reduce y arrastrar mueve el mapa. Un dedo sigue desplazando la página
   (el CSS deja `touch-action: pan-x pan-y` en el SVG para que el navegador no amplíe la página entera).
   Se cambia el viewBox del SVG: los puntos crecen con la ampliación (más fáciles de pulsar con el dedo)
   y los trazos no engordan (vector-effect en el CSS). El botón «Ver todo el mapa» vuelve al encuadre inicial. */
(function () {
  const mapa = document.getElementById('mapa');
  const svg = mapa && mapa.querySelector('svg');
  if (!svg || !svg.viewBox || !svg.viewBox.baseVal) return;

  const base = (({ x, y, width, height }) => ({ x, y, w: width, h: height }))(svg.viewBox.baseVal);
  const MAX = 6;                    // ampliación máxima
  let vb = { ...base }, gesto = null;

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'mapa__reset';
  reset.textContent = 'Ver todo el mapa';
  reset.hidden = true;
  mapa.appendChild(reset);

  function aplicar() {
    vb.w = Math.min(base.w, Math.max(base.w / MAX, vb.w));
    vb.h = vb.w * base.h / base.w;
    vb.x = Math.min(base.x + base.w - vb.w, Math.max(base.x, vb.x));
    vb.y = Math.min(base.y + base.h - vb.h, Math.max(base.y, vb.y));
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    reset.hidden = vb.w >= base.w - 0.01;
    // La ficha abierta se recoloca sobre su punto (view.js lo hace en «resize»)
    if (!document.getElementById('ficha').hidden) window.dispatchEvent(new Event('resize'));
  }

  const centro = t => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
  const distancia = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  svg.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) return;
    // Al pellizcar se cierra la ficha abierta (su punto puede quedar fuera de la vista); view.js cierra con Esc
    if (!document.getElementById('ficha').hidden) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const r = svg.getBoundingClientRect(), c = centro(e.touches);
    gesto = {
      d: distancia(e.touches), vb: { ...vb },
      // Punto del mapa (en unidades del viewBox) que queda bajo el centro de los dedos
      px: vb.x + (c.x - r.left) / r.width * vb.w,
      py: vb.y + (c.y - r.top) / r.height * vb.h,
    };
  }, { passive: true });

  svg.addEventListener('touchmove', e => {
    if (!gesto || e.touches.length !== 2) return;
    e.preventDefault(); // con dos dedos manda el mapa, no la página
    const r = svg.getBoundingClientRect(), c = centro(e.touches);
    vb.w = gesto.vb.w * gesto.d / Math.max(distancia(e.touches), 1);
    vb.w = Math.min(base.w, Math.max(base.w / MAX, vb.w));
    vb.h = vb.w * base.h / base.w;
    vb.x = gesto.px - (c.x - r.left) / r.width * vb.w;
    vb.y = gesto.py - (c.y - r.top) / r.height * vb.h;
    aplicar();
  }, { passive: false });

  const fin = e => { if (e.touches.length < 2) gesto = null; };
  svg.addEventListener('touchend', fin);
  svg.addEventListener('touchcancel', fin);

  reset.addEventListener('click', e => { e.stopPropagation(); vb = { ...base }; aplicar(); });
})();
