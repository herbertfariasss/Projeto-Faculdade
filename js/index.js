(function () {
  function loadHeroVideo(wrapper) {
    var embedUrl = wrapper.getAttribute('data-embed-url');
    if (!embedUrl) return;

    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-require-auth]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        acessarConteudo(link.getAttribute('href'));
      });
    });

    var btnLogin = document.getElementById('btn-login-header');
    var dropdown = document.getElementById('user-dropdown');
    var nomeSpan = document.getElementById('nome-usuario-header');
    var dropMenu = document.getElementById('dropdown-menu');
    var btnUsuario = document.getElementById('btn-usuario-nome');
    var btnPerfil = document.getElementById('btn-perfil');
    var btnLogout = document.getElementById('btn-logout');

    if (isLoggedIn()) {
      btnLogin.style.display = 'none';
      dropdown.hidden = false;
      nomeSpan.textContent = getUsuarioLogado();
    }

    btnUsuario.addEventListener('click', function () {
      dropMenu.hidden = !dropMenu.hidden;
    });

    btnPerfil.addEventListener('click', function () {
      window.location.href = 'inscricao/perfil.html';
    });

    btnLogout.addEventListener('click', function () {
      fazerLogout();
    });

    document.addEventListener('click', function (evento) {
      if (!dropdown.contains(evento.target)) {
        dropMenu.hidden = true;
      }
    });

    document.querySelectorAll('.js-video-trigger').forEach(function (wrapper) {
      var ativar = function () {
        loadHeroVideo(wrapper);
      };

      wrapper.addEventListener('click', ativar);
      wrapper.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          ativar();
        }
      });
    });
  });
})();
