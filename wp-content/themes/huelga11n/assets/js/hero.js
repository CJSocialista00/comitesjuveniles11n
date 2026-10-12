/* ===== Hero (bloque Portada/Cover con la clase "hero") =====
   Sin vídeo, imagen ni fondo CSS: grano animado en canvas, como en el prototipo.
   Con vídeo: se respeta prefers-reduced-motion pausándolo. */
(function () {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.hero').forEach(function (hero) {
    const video = hero.querySelector('.wp-block-cover__video-background');
    if (video) {
      if (reducido) { video.removeAttribute('autoplay'); video.pause(); }
      return;
    }
    if (hero.querySelector('.wp-block-cover__image-background')) return;
    if (getComputedStyle(hero).backgroundImage !== 'none') return; // fondo del tema (collage)

    const c = document.createElement('canvas');
    c.className = 'hero__grano';
    c.setAttribute('aria-hidden', 'true');
    const fondo = hero.querySelector('.wp-block-cover__background');
    fondo ? fondo.after(c) : hero.prepend(c);

    const etiqueta = document.createElement('span');
    etiqueta.className = 'hero__etiqueta';
    etiqueta.textContent = 'Vídeo · provisional';
    hero.append(etiqueta);

    /* Grano: copiado del prototipo */
    const ctx = c.getContext('2d');
    c.width = 220; c.height = 140;
    const img = ctx.createImageData(c.width, c.height);
    function frame() {
      const d = img.data;
      for (let p = 0; p < d.length; p += 4) {
        const v = Math.random() * 255 | 0;
        d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    frame();
    if (!reducido) setInterval(frame, 90);
  });
})();
