/* ============================================================
   Mariana & Rodrigo · 03.10.2026
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. Contagem decrescente ──────────────────────────────
     Data do casamento: 3 de Outubro de 2026, 15h00 (hora de
     Portugal continental — WEST, UTC+1 nessa data).            */
  var DATA_CASAMENTO = new Date('2026-10-03T15:00:00+01:00').getTime();

  var el = {
    dias: document.getElementById('cdDays'),
    horas: document.getElementById('cdHours'),
    mins: document.getElementById('cdMins'),
    secs: document.getElementById('cdSecs'),
    bloco: document.getElementById('countdown'),
    msg: document.getElementById('cdMsg')
  };

  function dois(n) { return String(n).padStart(2, '0'); }

  function atualizarContagem() {
    var falta = DATA_CASAMENTO - Date.now();

    if (falta <= 0) {
      if (el.bloco) el.bloco.hidden = true;
      if (el.msg) el.msg.hidden = false;
      clearInterval(timer);
      return;
    }

    var seg = Math.floor(falta / 1000);
    el.dias.textContent = Math.floor(seg / 86400);
    el.horas.textContent = dois(Math.floor(seg / 3600) % 24);
    el.mins.textContent = dois(Math.floor(seg / 60) % 60);
    el.secs.textContent = dois(seg % 60);
  }

  var timer;
  if (el.dias) {
    atualizarContagem();
    timer = setInterval(atualizarContagem, 1000);
  }

  /* ── 2. Menu mobile ──────────────────────────────────────── */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var aberto = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── 3. Copiar (IBAN e MB WAY) ─────────────────────────────
     Qualquer botão com [data-copiar="valor"] copia esse valor
     para a área de transferência e mostra feedback temporário,
     mantendo o texto original do botão (ex.: "Copiar IBAN",
     "Copiar").                                                    */
  function copiarTexto(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(
        function () { return true; },
        function () { return false; }
      );
    }
    // fallback para browsers antigos
    var tmp = document.createElement('textarea');
    tmp.value = texto;
    tmp.setAttribute('readonly', '');
    tmp.style.position = 'absolute';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);
    tmp.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(tmp);
    return Promise.resolve(ok);
  }

  document.querySelectorAll('[data-copiar]').forEach(function (botao) {
    var rotuloNormal = botao.textContent;

    botao.addEventListener('click', function () {
      copiarTexto(botao.dataset.copiar).then(function (ok) {
        botao.textContent = ok ? 'Copiado ✓' : 'Copie manualmente';
        botao.classList.add('is-copied');
        setTimeout(function () {
          botao.textContent = rotuloNormal;
          botao.classList.remove('is-copied');
        }, 2500);
      });
    });
  });

  /* ── 4. Imagens opcionais ─────────────────────────────────
     Qualquer <img data-opcional> desaparece silenciosamente se
     o ficheiro ainda não existir na pasta imagens/. Assim podes
     ir acrescentando as imagens aos poucos, sem nunca deixar
     um ícone partido no site.                                  */
  var opcionais = document.querySelectorAll('img[data-opcional]');

  opcionais.forEach(function (img) {
    function esconder() { img.style.display = 'none'; }
    img.addEventListener('error', esconder);
    if (img.complete && img.naturalWidth === 0) esconder();
  });

  /* ── 5. Fundo fotográfico do topo ──────────────────────────
     Procura a foto-0 em várias extensões (.jpg, .JPG, .png, …).
     Isto é importante: em muitos servidores de internet as
     maiúsculas contam, por isso "foto-0.JPG" e "foto-0.jpg" são
     ficheiros diferentes. Ao testar todas as variantes, a foto
     aparece independentemente de como o ficheiro está gravado.
     Se não existir nenhuma, o topo fica com o fundo creme
     simples — nunca fica partido.                              */
  var hero = document.querySelector('.hero');

  if (hero) {
    (function () {
      var variantes = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'webp'];
      var i = 0;

      function tentar() {
        if (i >= variantes.length) return;

        var caminho = 'fotos/foto-0.' + variantes[i];
        var teste = new Image();

        teste.onload = function () {
          hero.style.backgroundImage = 'url("' + caminho + '")';
          hero.classList.add('has-photo');
        };
        teste.onerror = function () { i++; tentar(); };
        teste.src = caminho;
      }

      tentar();
    })();
  }

  /* ── 6. Galeria "Os Noivos" ───────────────────────────────
     Mostra TODAS as fotos da pasta fotos/, exceto a foto-0
     (que é o fundo do topo). A lista é procurada por três vias,
     pela ordem que funcionar:

     1) window.FOTOS — vem de fotos/lista.js, carregado como
        <script> no index.html. Funciona SEMPRE, mesmo abrindo o
        index.html com duplo clique (sem servidor).
     2) fotos/lista.json — usado se o lista.js não existir.
     3) Tentar foto-1, foto-2, … como último recurso.

     Ambos os ficheiros são gerados por fotos/gerar-lista.py —
     corre-o sempre que adicionares ou tirares fotos.            */
  var LIMITE_INDICE = 30;
  var EXTENSOES = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'];

  function prepararLista(lista) {
    if (!Array.isArray(lista) || lista.length === 0) return null;
    return lista
      .filter(function (nome) { return !/^foto-0\./i.test(nome); })
      // encodeURIComponent trata nomes com espaços e acentos
      .map(function (nome) { return 'fotos/' + encodeURIComponent(nome); });
  }

  function procurarPorScript() {
    return prepararLista(window.FOTOS);
  }

  function testarImagem(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(src); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function encontrarFoto(indice) {
    var tentativas = EXTENSOES.map(function (ext) {
      return 'fotos/foto-' + indice + '.' + ext;
    });
    return tentativas.reduce(function (promessa, src) {
      return promessa.then(function (encontrada) {
        return encontrada ? encontrada : testarImagem(src);
      });
    }, Promise.resolve(null));
  }

  function procurarPorProbing() {
    var indices = [];
    for (var i = 1; i <= LIMITE_INDICE; i++) indices.push(i);
    return Promise.all(indices.map(encontrarFoto)).then(function (resultados) {
      return resultados.filter(Boolean);
    });
  }

  function procurarPorManifesto() {
    if (typeof fetch !== 'function') return Promise.resolve(null);

    try {
      return fetch('fotos/lista.json')
        .then(function (resp) { return resp.ok ? resp.json() : null; })
        .then(prepararLista)
        .catch(function () { return null; });
    } catch (err) {
      return Promise.resolve(null);
    }
  }

  var galeria = document.getElementById('galeria');
  var molduras = [];

  if (galeria) {
    var doScript = procurarPorScript();

    if (doScript) {
      mostrarFotos(doScript);
    } else {
      procurarPorManifesto().then(function (fotosManifesto) {
        if (fotosManifesto && fotosManifesto.length > 0) return fotosManifesto;
        return procurarPorProbing();
      }).then(mostrarFotos);
    }
  }

  function mostrarFotos(fotos) {
    if (!fotos || fotos.length === 0) return;

    var fragmento = document.createDocumentFragment();

    fotos.forEach(function (src) {
      var figura = document.createElement('figure');
      figura.className = 'foto';

      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Mariana e Rodrigo';
      img.loading = 'lazy';

      figura.appendChild(img);
      fragmento.appendChild(figura);
      molduras.push(figura);
    });

    galeria.appendChild(fragmento);

    ajustarGrelha();
    window.addEventListener('resize', agendarAjuste);
  }

  /* ── 6b. Grelha sempre completa ───────────────────────────
     A galeria nunca deve terminar com uma linha incompleta (por
     exemplo 3 colunas e uma última linha com só 1 foto). Aqui
     contamos quantas colunas a grelha tem neste momento e
     mostramos apenas um número de fotos que seja múltiplo desse
     valor — as restantes ficam escondidas até o ecrã mudar de
     tamanho e voltarem a encaixar.
     Nota: se houver menos fotos do que colunas, mostram-se todas
     (caso contrário não apareceria nenhuma).                    */
  function contarColunas() {
    var valor = window.getComputedStyle(galeria).gridTemplateColumns;
    if (!valor || valor === 'none') return 1;
    return valor.trim().split(/\s+/).length;
  }

  function ajustarGrelha() {
    var total = molduras.length;
    if (!total) return;

    // repor tudo visível: as colunas são calculadas pela largura
    // do contentor, e assim a medição não depende do estado anterior
    molduras.forEach(function (fig) { fig.style.display = ''; });

    var colunas = contarColunas();
    var visiveis = Math.floor(total / colunas) * colunas;

    if (visiveis < colunas) visiveis = total;

    molduras.forEach(function (fig, i) {
      fig.style.display = i < visiveis ? '' : 'none';
    });
  }

  var timerAjuste;

  function agendarAjuste() {
    clearTimeout(timerAjuste);
    timerAjuste = setTimeout(ajustarGrelha, 150);
  }

  /* ── 8. Prendas: grelha sempre completa e centrada ────────
     Ao contrário da galeria de fotos (secção 6b), aqui não se
     pode esconder nenhuma prenda — têm de aparecer todas. Em vez
     disso, ajusta-se o NÚMERO DE COLUNAS (a variável CSS
     --prendas-colunas, usada no flex-basis de cada .prenda) para
     que a grelha feche sempre uma linha completa e nunca deixe a
     última linha com uma única prenda sozinha:
       1) mede quantas colunas cabem naturalmente na largura do
          contentor, sem nunca passar de MAX_COLUNAS_PRENDAS —
          para os cartões não ficarem pequenos demais em ecrãs
          largos;
       2) procura, a partir daí para baixo, o maior número de
          colunas que divide o total de prendas sem resto;
       3) se não houver divisor exato, procura o maior número
          de colunas cujo resto não seja exactamente 1 (a última
          linha pode ficar incompleta, mas nunca com uma prenda
          isolada) — e como .prendas é flex-wrap com
          justify-content:center, essa linha incompleta fica
          automaticamente centrada, em vez de encostada à
          esquerda.
     (Nota: função e variável com nomes próprios — "colunas" e
     "grelha" já existem na secção 6b para a galeria de fotos, e
     reutilizar os mesmos nomes aqui rebentava com essa secção.) */
  var MAX_COLUNAS_PRENDAS = 3;
  var LARGURA_MIN_PRENDA = 220; // tem de bater certo com o min-width no CSS
  var prendasGrelha = document.querySelector('.prendas');

  function colunasNaturaisPrendas(grelha) {
    var largura = grelha.getBoundingClientRect().width;
    var gap = parseFloat(window.getComputedStyle(grelha).columnGap) || 0;
    var colunas = Math.floor((largura + gap) / (LARGURA_MIN_PRENDA + gap));
    return Math.max(1, colunas);
  }

  function melhorNumeroColunasPrendas(total, maxColunas) {
    if (total <= maxColunas) return total || 1;

    for (var c = maxColunas; c >= 2; c--) {
      if (total % c === 0) return c;
    }
    for (var c2 = maxColunas; c2 >= 2; c2--) {
      if (total % c2 !== 1) return c2;
    }
    return maxColunas;
  }

  function ajustarGrelhaPrendas() {
    if (!prendasGrelha) return;

    var itens = prendasGrelha.querySelectorAll('.prenda').length;
    if (!itens) return;

    var maxColunas = Math.min(colunasNaturaisPrendas(prendasGrelha), MAX_COLUNAS_PRENDAS);
    var colunas = melhorNumeroColunasPrendas(itens, maxColunas);
    prendasGrelha.style.setProperty('--prendas-colunas', colunas);
  }

  var timerAjustePrendas;

  function agendarAjustePrendas() {
    clearTimeout(timerAjustePrendas);
    timerAjustePrendas = setTimeout(ajustarGrelhaPrendas, 150);
  }

  if (prendasGrelha) {
    ajustarGrelhaPrendas();
    window.addEventListener('resize', agendarAjustePrendas);
  }

  /* ── 9. Animação suave de entrada das secções ────────────── */
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduzir && 'IntersectionObserver' in window) {
    var alvos = document.querySelectorAll('.section .wrap > *, .footer .wrap > *');

    alvos.forEach(function (n) { n.classList.add('reveal'); });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    alvos.forEach(function (n) { obs.observe(n); });
  }

  /* ── 10. Mensagem para os noivos → Google Docs ─────────────
     O formulário envia "Nome", "Valor Oferecido" (opcional) e
     "Mensagem" para um Google Apps Script (Web App) que os
     acrescenta a um Google Doc. Para ativar o envio:
       1. Abram (ou criem) o Google Doc onde querem guardar as
          mensagens e copiem o ID do URL (o trecho entre "/d/" e
          "/edit").
       2. Em script.google.com, criem um novo projeto e colem o
          código do ficheiro apps-script-mensagens.gs (incluído
          junto a este site), preenchendo esse ID.
       3. Implementar → Nova implementação → tipo "Aplicação Web",
          a executar como "Eu" e com acesso "Qualquer pessoa".
       4. Colem o URL da aplicação Web gerado na constante
          MENSAGEM_SCRIPT_URL, aqui em baixo.
     Enquanto a constante ficar vazia, o formulário avisa que o
     envio ainda não está configurado, em vez de falhar em
     silêncio.                                                     */
  var MENSAGEM_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuwr6XosbeIK8ebAZdY-TiU-4L8W3H12rZ-j1ucmSHQUy4NT0-gYQrztelPoaZi_JRaA/exec'; // <-- colar aqui o URL da Google Apps Script Web App

  var formMensagem = document.getElementById('mensagemForm');
  var statusMensagem = document.getElementById('mensagemStatus');

  function mostrarEstadoMensagem(texto, erro) {
    if (!statusMensagem) return;
    statusMensagem.textContent = texto;
    statusMensagem.hidden = false;
    statusMensagem.classList.toggle('is-erro', !!erro);
  }

  if (formMensagem) {
    formMensagem.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!MENSAGEM_SCRIPT_URL) {
        mostrarEstadoMensagem('O envio ainda não está configurado. Contactem os noivos diretamente.', true);
        return;
      }

      var nome = document.getElementById('mensagemNome').value.trim();
      var valor = document.getElementById('mensagemValor').value.trim();
      var mensagem = document.getElementById('mensagemTexto').value.trim();

      if (!nome || !mensagem) {
        mostrarEstadoMensagem('Preencham o nome e a mensagem antes de submeter.', true);
        return;
      }

      var botao = formMensagem.querySelector('button[type="submit"]');
      botao.disabled = true;
      mostrarEstadoMensagem('A enviar…', false);

      var dados = new URLSearchParams();
      dados.append('nome', nome);
      dados.append('valor', valor);
      dados.append('mensagem', mensagem);

      fetch(MENSAGEM_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: dados
      }).then(function () {
        // Em modo "no-cors" não é possível ler a resposta; se o
        // fetch não rejeitar, assume-se que o envio foi feito.
        mostrarEstadoMensagem('Mensagem enviada. Muito obrigado! ♥', false);
        formMensagem.reset();
      }).catch(function () {
        mostrarEstadoMensagem('Não foi possível enviar. Tentem novamente mais tarde.', true);
      }).finally(function () {
        botao.disabled = false;
      });
    });
  }
})();
