/* ===== Titular: cada letra en un hueco fijo =====
   view.js cambia el grosor de cada letra; como el ancho del glifo cambia con el grosor, las letras
   se desplazaban y la palabra se estiraba y encogía (parecía que temblaba). Aquí cada letra ocupa
   siempre el ancho que tiene en Black (900), en em, con el glifo centrado: sólo cambia el grosor.
   Con todo en Black es el ancho para el que está calculado el tamaño del titular, así que cabe. */
(function () {
  const letras = [...document.querySelectorAll('.titular .l')];
  if (!letras.length) return;

  function fijar() {
    const actuales = letras.map(l => l.style.fontVariationSettings);
    letras.forEach(l => { l.style.width = ''; l.style.fontVariationSettings = '"wght" 900, "wdth" 50'; });
    const anchos = letras.map(l => l.getBoundingClientRect().width / parseFloat(getComputedStyle(l).fontSize));
    letras.forEach((l, i) => { l.style.width = anchos[i] + 'em'; l.style.fontVariationSettings = actuales[i]; });
  }

  // Hay que medir con Acumin ya cargada, no con la fuente de respaldo
  if (document.fonts) {
    document.fonts.ready.then(fijar);
    document.fonts.addEventListener('loadingdone', fijar);
  } else {
    fijar();
  }
})();
