/* Copiado de prototipo/index.html. Único cambio: las fases de las letras cubren el ciclo completo. */
/* ===== Titular: una letra por span; el grosor sube de fino a Black y se desplaza en ola =====
   Se anima con requestAnimationFrame escribiendo font-variation-settings, que funciona igual en iOS, Android y escritorio. */
(function () {
  const letras = [];
  document.querySelectorAll('.titular__linea').forEach(l => {
    const chars = [...l.dataset.texto];
    chars.forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'l';
      s.textContent = ch;
      s.style.setProperty('--i', i);
      s.style.setProperty('--n', chars.length);
      l.appendChild(s);
      // Fases repartidas por el ciclo completo (0–2), no por medio ciclo: siempre hay letras creciendo
      // y nunca están todas finas a la vez.
      letras.push({ el: s, fase: 2 * i / chars.length });
    });
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MEDIO_CICLO = 4.5;        // segundos de fino a Black
  const MIN = 200, MAX = 900;
  let visible = true, t0 = performance.now(), raf = null;

  function pintar(ahora) {
    const t = (ahora - t0) / 1000 / MEDIO_CICLO;
    for (const L of letras) {
      const u = (t + L.fase) % 2;            // onda triangular 0→1→0
      const x = u < 1 ? u : 2 - u;
      const e = 0.5 - 0.5 * Math.cos(Math.PI * x);  // ease-in-out
      const w = Math.round(MIN + (MAX - MIN) * e);
      if (w !== L.w) { L.w = w; L.el.style.fontVariationSettings = `"wght" ${w}, "wdth" 50`; }
    }
    raf = requestAnimationFrame(pintar);
  }
  function arrancar() { if (raf === null && visible && !document.hidden) raf = requestAnimationFrame(pintar); }
  function parar() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

  // Sólo se anima mientras el titular está en pantalla (ahorra batería en móvil)
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? arrancar() : parar(); })
    .observe(document.querySelector('.titular'));
  document.addEventListener('visibilitychange', () => document.hidden ? parar() : arrancar());
  arrancar();
})();
