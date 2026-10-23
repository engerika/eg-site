// Comportamento do site: abertura, navegação, revelação no scroll.
// Sem dependências: o site é publicado como arquivos estáticos.

(function () {
  var raiz = document.documentElement;

  // Abertura só na primeira visita da sessão.
  try {
    if (sessionStorage.getItem('eg-intro')) raiz.classList.add('intro-vista');
    else sessionStorage.setItem('eg-intro', '1');
  } catch (e) { /* armazenamento bloqueado: mostra a abertura */ }

  document.querySelectorAll('.intro-marca span').forEach(function (letra, i) {
    letra.style.setProperty('--i', i);
  });

  // Navegação: vidro depois de rolar; menu no celular.
  var nav = document.querySelector('.nav');
  var botao = document.querySelector('.nav-abrir');
  function aoRolar() { nav.classList.toggle('rolou', window.scrollY > 24); }
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  function fecharMenu() {
    nav.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
  }
  botao.addEventListener('click', function () {
    var abrir = !nav.classList.contains('aberto');
    nav.classList.toggle('aberto', abrir);
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', fecharMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(); });

  // Revelação: cada grupo entra em cascata, uma vez.
  var itens = document.querySelectorAll('.revelar');
  itens.forEach(function (el) {
    var irmaos = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('revelar');
    });
    el.style.setProperty('--atraso', Math.min(irmaos.indexOf(el), 5) * 90 + 'ms');
  });
  if (!('IntersectionObserver' in window)) {
    itens.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    itens.forEach(function (el) { obs.observe(el); });
  }

  // Vídeo do hero: só carrega se existir e se a pessoa não pediu menos movimento ou
  // economia de dados; aparece com fade quando começa a tocar e pausa fora da tela.
  var video = document.querySelector('.hero-video');
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var economia = navigator.connection && navigator.connection.saveData;
  if (video && !calmo && !economia) {
    video.addEventListener('playing', function () { video.classList.add('tocando'); });
    video.addEventListener('error', function () { video.remove(); }, true);
    video.src = video.dataset.src;
    video.play().catch(function () { /* sem arquivo ou sem autoplay: fica a imagem */ });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (!video.isConnected) return;
        if (en[0].isIntersecting) video.play().catch(function () {}); else video.pause();
      }).observe(video);
    }
  }

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
