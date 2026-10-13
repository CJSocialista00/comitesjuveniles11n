/* Titular en imagen: que al abrir la web quepa el hero entero en la pantalla (cabecera, titular, lema,
   botón y banda de lemas). Mide lo que ocupa todo menos el titular y calcula el ancho al que cabe; el titular
   y el pie (lema + botón) forman un bloque de ese ancho, centrado (CSS --titular-ancho, en el .wrap).
   El alto de referencia es 100svh (con las barras del navegador del móvil visibles), medido con una sonda
   para que no cambie al hacer scroll. Sin JS, el titular va a todo el ancho. */
( function () {
	const h1 = document.querySelector( '.titular--imagen' );
	if ( ! h1 ) return;
	const img = h1.querySelector( 'img' );
	const apaisada = h1.querySelector( 'source[media]' );
	const wrap = h1.parentElement;
	const fin = document.querySelector( '.banda' ) || h1.closest( '.hero' ) || h1;
	const MINIMO = 120; // alto mínimo del titular, en px
	const MAXIMO = 1600; // ancho máximo: puede salirse del ancho del diseño (--max) hasta los márgenes de la pantalla

	const sonda = document.createElement( 'div' );
	sonda.setAttribute( 'aria-hidden', 'true' );
	sonda.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
	document.body.append( sonda );

	// La de la imagen que se ve (al girar el móvil, la otra versión tarda un momento en cargar: hasta
	// entonces manda la que hay); si aún no tiene caja, la de los atributos de la versión que toca.
	function proporcion() {
		if ( img.offsetHeight ) return img.offsetWidth / img.offsetHeight;
		const f = apaisada && matchMedia( apaisada.media ).matches ? apaisada : img;
		return f.getAttribute( 'width' ) / f.getAttribute( 'height' );
	}

	function encajar() {
		const e = getComputedStyle( wrap );
		const contenido = Math.min( MAXIMO, document.documentElement.clientWidth - parseFloat( e.paddingLeft ) - parseFloat( e.paddingRight ) );
		// Todo lo que no es el titular: desde lo alto de la página (incluye barras que WordPress ponga encima) hasta el final de la banda
		const resto = fin.getBoundingClientRect().bottom + scrollY - img.getBoundingClientRect().height;
		const alto = Math.max( MINIMO, sonda.offsetHeight - resto );
		const ancho = Math.floor( Math.min( contenido, alto * proporcion() ) );
		const antes = parseFloat( wrap.style.getPropertyValue( '--titular-ancho' ) ) || 0;
		if ( Math.abs( ancho - antes ) > 1 ) wrap.style.setProperty( '--titular-ancho', ancho + 'px' );
	}

	encajar();
	addEventListener( 'resize', encajar );
	img.addEventListener( 'load', encajar ); // también cuando cambia de versión (vertical ↔ apaisada)
	if ( document.fonts ) document.fonts.ready.then( encajar ); // el lema y la banda cambian de alto al cargar la fuente
	if ( window.ResizeObserver ) new ResizeObserver( encajar ).observe( fin );
} )();
