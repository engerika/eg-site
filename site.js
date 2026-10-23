// Comportamento do site: abertura, menu, revelação no scroll, cartões que
// empilham, vitrine que alterna, ícones de pixels e vídeo do hero.
// Sem dependências: o site é publicado como arquivos estáticos.
// Tempos e medidas seguem o código-fonte da referência (v0 "modern agentic").

(function () {
  var raiz = document.documentElement;
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Abertura (tempos da referência) ----------
  // Letras entram (90 ms entre elas, 700 ms cada), seguram 300 ms, saem
  // (55 ms, 450 ms); a cortina sobe em 1,3 s e o hero aparece 150 ms antes
  // dela terminar. Só na primeira visita da sessão.
  var intro = document.querySelector('.intro');
  var hero = document.querySelector('.hero');
  var letras = document.querySelectorAll('.intro-marca span');
  letras.forEach(function (l, i) { l.style.setProperty('--i', i); });
  var jaViu = false;
  try { jaViu = !!sessionStorage.getItem('eg-intro'); sessionStorage.setItem('eg-intro', '1'); } catch (e) {}
  function heroPronto() { hero.classList.add('pronto'); contarNumeros(document.querySelectorAll('.numeros dd')); }
  if (jaViu || semMovimento || !intro) {
    raiz.classList.add('intro-vista');
    requestAnimationFrame(heroPronto);
  } else {
    var entrada = 90 * (letras.length - 1) + 700 + 300;
    var cortina = entrada + 100;
    setTimeout(function () { intro.classList.add('entrando'); }, 80);
    setTimeout(function () { intro.classList.remove('entrando'); intro.classList.add('saindo'); }, entrada);
    setTimeout(function () { intro.classList.add('subindo'); }, cortina);
    setTimeout(heroPronto, cortina + 1300 - 150);
    setTimeout(function () { intro.classList.add('fim'); }, cortina + 1300 + 200);
  }

  // Contador: sobe de 0 ao valor de data-ate em 1,8 s (só se houver número).
  function contarNumeros(els) {
    Array.prototype.forEach.call(els, function (el) {
      var fim = parseFloat(el.dataset.ate);
      if (!fim) return;
      var sufixo = el.dataset.sufixo || '';
      if (semMovimento) { el.textContent = fim.toLocaleString('pt-BR') + sufixo; return; }
      var inicio = performance.now();
      (function passo(t) {
        var p = Math.min(1, (t - inicio) / 1800);
        el.textContent = Math.floor(fim * p).toLocaleString('pt-BR') + sufixo;
        if (p < 1) requestAnimationFrame(passo);
      })(inicio);
    });
  }
  document.querySelectorAll('.numeros > div').forEach(function (d, i) { d.style.setProperty('--i', i); });

  // ---------- Menu ----------
  var nav = document.querySelector('.nav');
  var botao = document.querySelector('.nav-abrir');
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

  // ---------- Títulos por palavra (80 ms entre palavras) ----------
  // Quebra o texto de cada .palavras em <span class="palavra">, sem perder <em>.
  document.querySelectorAll('.palavras').forEach(function (h) {
    var n = 0;
    (function partir(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
        if (filho.nodeType === 3) {
          var frag = document.createDocumentFragment();
          filho.textContent.split(/(\s+)/).forEach(function (pedaco) {
            if (!pedaco) return;
            if (/^\s+$/.test(pedaco)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'palavra'; s.textContent = pedaco; s.style.setProperty('--p', n++);
            frag.appendChild(s);
          });
          no.replaceChild(frag, filho);
        } else if (filho.nodeType === 1) partir(filho);
      });
    })(h);
  });

  // ---------- Revelação de blocos (uma vez) ----------
  var itens = document.querySelectorAll('.revelar, .palavras');
  document.querySelectorAll('.revelar').forEach(function (el) {
    var irmaos = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('revelar');
    });
    el.style.setProperty('--atraso', Math.min(irmaos.indexOf(el), 5) * 60 + 'ms');
  });
  document.querySelectorAll('.registro-linhas li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  if (!('IntersectionObserver' in window)) {
    itens.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visivel');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    itens.forEach(function (el) { obs.observe(el); });
    var contador = document.querySelector('.contador span');
    if (contador) {
      new IntersectionObserver(function (en, o) {
        if (en[0].isIntersecting) { contarNumeros([contador]); o.disconnect(); }
      }, { threshold: 0.5 }).observe(contador);
    }
  }

  // ---------- Brilho que segue o mouse ----------
  document.querySelectorAll('[data-brilho]').forEach(function (grupo) {
    grupo.addEventListener('mousemove', function (e) {
      var alvo = e.target.closest('[data-brilho] > *');
      if (!alvo || alvo.parentElement !== grupo) return;
      var r = alvo.getBoundingClientRect();
      alvo.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      alvo.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ---------- Tabela de obras: uma linha sai, outra entra (exemplo) ----------
  var lista = document.querySelector('[data-rodizio]');
  if (lista && !semMovimento) {
    setInterval(function () {
      var r = lista.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var primeira = lista.firstElementChild;
      lista.removeChild(primeira);
      lista.appendChild(primeira);
    }, 2400);
  }

  // ---------- Formulário de contato: abre o e-mail da pessoa já preenchido ----------
  var form = document.querySelector('[data-contato]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      if (!email) return;
      location.href = 'mailto:contato@erikabarros.com?subject=' + encodeURIComponent('Contato pelo site') +
        '&body=' + encodeURIComponent('Olá! Quero conversar sobre uma obra.\n\nMeu e-mail: ' + email);
    });
  }

  // ---------- Cartões que empilham ----------
  // Cada cartão gruda em 80 + 16·i px. --camadas = quantos cartões depois dele
  // já chegaram à própria posição de grudar (ou seja, estão por cima dele).
  var pilhas = Array.prototype.slice.call(document.querySelectorAll('.servico-pilha'));
  pilhas.forEach(function (p, i) { p.style.setProperty('--n', i); });
  if (pilhas.length > 1 && !semMovimento) {
    var pedido = false;
    function empilhar() {
      pedido = false;
      var topos = pilhas.map(function (p) { return p.getBoundingClientRect().top; });
      pilhas.forEach(function (p, i) {
        var camadas = 0;
        for (var j = i + 1; j < pilhas.length; j++) {
          if (topos[j] <= 80 + j * 16 + 2) camadas++;
        }
        p.firstElementChild.style.setProperty('--camadas', camadas);
      });
    }
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; requestAnimationFrame(empilhar); }
    }, { passive: true });
    window.addEventListener('resize', empilhar);
    empilhar();
  }

  // ---------- Vitrine: alterna a cada 3,2 s, com troca desfocada de 180 ms ----------
  document.querySelectorAll('[data-vitrine]').forEach(function (vitrine) {
    var abas = Array.prototype.slice.call(vitrine.querySelectorAll('[role="tab"]'));
    var paineis = abas.map(function (a) { return document.getElementById(a.getAttribute('aria-controls')); });
    var caixa = vitrine.querySelector('.vitrine-paineis');
    var pontos = vitrine.querySelectorAll('.vitrine-pontos i');
    var atual = 0, relogio = null, visivel = false, sobre = false;

    function marcar(i) {
      abas.forEach(function (a, k) {
        a.setAttribute('aria-selected', String(k === i));
        a.tabIndex = k === i ? 0 : -1;
        if (pontos[k]) pontos[k].classList.toggle('ativo', k === i);
      });
    }
    function mostrar(i) {
      if (i === atual) return;
      atual = i;
      marcar(i);
      if (semMovimento) { paineis.forEach(function (p, k) { p.hidden = k !== i; }); return; }
      caixa.classList.add('trocando');
      setTimeout(function () {
        paineis.forEach(function (p, k) { p.hidden = k !== i; });
        requestAnimationFrame(function () { caixa.classList.remove('trocando'); });
      }, 180);
    }
    function parar() { clearInterval(relogio); relogio = null; }
    function seguir() {
      parar();
      if (visivel && !sobre && !semMovimento) {
        relogio = setInterval(function () { mostrar((atual + 1) % abas.length); }, 3200);
      }
    }
    abas.forEach(function (a, i) {
      a.addEventListener('click', function () { mostrar(i); seguir(); });
      a.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = (atual + d + abas.length) % abas.length;
        mostrar(n); abas[n].focus(); seguir();
      });
    });
    vitrine.addEventListener('mouseenter', function () { sobre = true; parar(); });
    vitrine.addEventListener('mouseleave', function () { sobre = false; seguir(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visivel = en[0].isIntersecting; seguir(); }, { threshold: 0.3 }).observe(vitrine);
    }
    marcar(0);
    paineis.forEach(function (p, k) { p.hidden = k !== 0; });
  });

  // ---------- Ícones de pixels ----------
  // Grade 12×12 em tons da cor do texto, animada continuamente (requestAnimationFrame),
  // como a referência; o desenho é de obra. Para fora da tela; com movimento
  // reduzido, fica um quadro parado.
  var N = 12;
  function mascara(linhas) { return linhas.map(function (l) { return l.split('').map(Number); }); }
  var PREDIO = mascara([
    '000000000000', '000011110000', '000011110000', '000010110000',
    '001111111100', '001101101100', '001111111100', '001101101100',
    '111111111111', '110110110111', '111111111111', '111111111111'
  ]);
  var ESCADA = mascara([
    '000000000011', '000000000011', '000000001111', '000000001111',
    '000000111111', '000000111111', '000011111111', '000011111111',
    '001111111111', '001111111111', '111111111111', '111111111111'
  ]);
  var PLANTA = (function () {
    var c = [], i;
    for (i = 1; i <= 10; i++) c.push([i, 1]);
    for (i = 2; i <= 10; i++) c.push([10, i]);
    for (i = 9; i >= 1; i--) c.push([i, 10]);
    for (i = 9; i >= 2; i--) c.push([1, i]);
    return c;
  })();
  var paredes = { '6,2': 1, '6,3': 1, '6,4': 1, '6,5': 1, '2,6': 1, '3,6': 1, '4,6': 1, '5,6': 1, '6,6': 1 };

  // Cada desenho devolve a opacidade (0–1) do pixel (x, y) no tempo t (ms).
  var desenhos = {
    // prédio: luz subindo pelos andares, janelas piscando
    predio: function (x, y, t) {
      if (!PREDIO[y][x]) return 0.05;
      var onda = (Math.sin(t * 0.0025 + (N - y) * 0.45) + 1) / 2;
      return 0.25 + 0.6 * onda;
    },
    // escada: brilho percorrendo os degraus
    escada: function (x, y, t) {
      if (!ESCADA[y][x]) return 0.05;
      var onda = (Math.sin(t * 0.003 - (x - y) * 0.35) + 1) / 2;
      return 0.2 + 0.65 * onda;
    },
    // grade: onda diagonal atravessando a matriz
    grade: function (x, y, t) {
      var onda = Math.max(0, Math.sin(t * 0.003 - (x + y) * 0.45));
      return 0.07 + 0.7 * onda;
    },
    // planta: contorno com um traço correndo em volta e paredes internas
    planta: function (x, y, t) {
      if (paredes[x + ',' + y]) return 0.3 + 0.15 * Math.sin(t * 0.002);
      for (var k = 0; k < PLANTA.length; k++) {
        if (PLANTA[k][0] === x && PLANTA[k][1] === y) {
          var cabeca = (t * 0.012) % PLANTA.length;
          var d = (cabeca - k + PLANTA.length) % PLANTA.length;
          return 0.15 + 0.7 * Math.exp(-d / 4);
        }
      }
      return 0.04;
    }
  };

  document.querySelectorAll('canvas.pixel').forEach(function (tela) {
    var lado = 40, dpr = window.devicePixelRatio || 1;
    tela.width = lado * dpr; tela.height = lado * dpr;
    var ctx = tela.getContext('2d');
    var desenho = desenhos[tela.dataset.desenho] || desenhos.grade;
    var ps = tela.width / N, quadro = null;

    function pintar(t) {
      ctx.clearRect(0, 0, tela.width, tela.height);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        ctx.fillStyle = 'rgba(42,27,20,' + desenho(x, y, t).toFixed(3) + ')';
        ctx.fillRect(x * ps, y * ps, ps - dpr, ps - dpr);
      }
    }
    function laco(t) { pintar(t); quadro = requestAnimationFrame(laco); }

    pintar(1200);
    if (semMovimento || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !quadro) quadro = requestAnimationFrame(laco);
      if (!en[0].isIntersecting && quadro) { cancelAnimationFrame(quadro); quadro = null; }
    }).observe(tela);
  });

  // ---------- Vídeo do hero ----------
  // Só carrega se existir e se a pessoa não pediu menos movimento ou economia
  // de dados; aparece com fade quando começa a tocar e pausa fora da tela.
  var video = document.querySelector('.hero-video');
  var economia = navigator.connection && navigator.connection.saveData;
  if (video && !semMovimento && !economia) {
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
