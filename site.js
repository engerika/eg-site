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

  // Serviços empilhando: cada cartão gruda um pouco abaixo do anterior (--n),
  // e o de trás recua (--recuo, 0 a 1) à medida que o próximo o cobre.
  var cartoes = Array.prototype.slice.call(document.querySelectorAll('.servico'));
  cartoes.forEach(function (c, i) { c.style.setProperty('--n', i); });
  if (cartoes.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var pedido = false;
    function recuar() {
      pedido = false;
      for (var i = 0; i < cartoes.length - 1; i++) {
        var atual = cartoes[i].getBoundingClientRect();
        var proximo = cartoes[i + 1].getBoundingClientRect();
        var p = 1 - (proximo.top - atual.top) / atual.height;
        cartoes[i].style.setProperty('--recuo', Math.max(0, Math.min(1, p)).toFixed(3));
      }
    }
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; requestAnimationFrame(recuar); }
    }, { passive: true });
    window.addEventListener('resize', recuar);
    recuar();
  }

  // Ícones de pixels: grade 10×10 animada a ~8 quadros/s, cada seção com um desenho
  // de obra (prédio subindo, escada, grade, planta). Parado fora da tela; com
  // movimento reduzido, mostra só o quadro final.
  var desenhos = {
    // prédio: colunas de alturas diferentes acendendo de baixo para cima
    predio: function (t) {
      var alturas = [0, 6, 6, 9, 9, 9, 7, 7, 4, 0], h = t % 14;
      return function (x, y) {
        var linha = 9 - y;
        if (linha >= alturas[x] || linha > h) return 0;
        return (linha === h || (x % 2 && y % 2 && (x + y + t) % 5 === 0)) ? 2 : 1;
      };
    },
    // escada: degraus acendendo em diagonal
    escada: function (t) {
      var passo = t % 12;
      return function (x, y) {
        var degrau = Math.floor(x / 2);
        if (9 - y > degrau * 2 + 1 || degrau > passo) return 0;
        return degrau === passo ? 2 : 1;
      };
    },
    // grade: onda atravessando a matriz de pontos
    grade: function (t) {
      return function (x, y) {
        var d = Math.abs(((x + y) - t % 22) );
        return d === 0 ? 2 : d < 3 ? 1 : 0;
      };
    },
    // planta: contorno percorrido e uma parede interna
    planta: function (t) {
      var borda = [];
      for (var i = 1; i < 9; i++) borda.push([i, 1]);
      for (i = 2; i < 9; i++) borda.push([8, i]);
      for (i = 7; i > 0; i--) borda.push([i, 8]);
      for (i = 7; i > 1; i--) borda.push([1, i]);
      for (i = 2; i < 6; i++) borda.push([5, i]);
      var n = t % (borda.length + 8);
      return function (x, y) {
        for (var k = 0; k < Math.min(n, borda.length); k++) {
          if (borda[k][0] === x && borda[k][1] === y) return k === n - 1 ? 2 : 1;
        }
        return 0;
      };
    }
  };
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('canvas.pixel').forEach(function (tela) {
    var ctx = tela.getContext('2d');
    var desenho = desenhos[tela.dataset.desenho] || desenhos.grade;
    var escuro = !!tela.closest('.secao-escura');
    var cores = escuro
      ? ['rgba(255,255,255,.10)', 'rgba(255,255,255,.85)', '#e6a87d']
      : ['rgba(42,27,20,.08)', '#2a1b14', '#cd6543'];
    var t = 0, relogio = null;
    function quadro() {
      var f = desenho(t++);
      ctx.clearRect(0, 0, 80, 80);
      for (var y = 0; y < 10; y++) for (var x = 0; x < 10; x++) {
        ctx.fillStyle = cores[f(x, y)];
        ctx.fillRect(x * 8 + 1, y * 8 + 1, 6, 6);
      }
    }
    if (semMovimento) { t = 9; quadro(); return; }
    quadro();
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !relogio) relogio = setInterval(quadro, 125);
      if (!en[0].isIntersecting && relogio) { clearInterval(relogio); relogio = null; }
    }).observe(tela);
  });

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
