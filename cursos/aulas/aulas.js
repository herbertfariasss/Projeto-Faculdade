(function () {
  function getSafeEmbedUrl(rawUrl) {
    try {
      var url = new URL(rawUrl, window.location.origin);
      if (url.protocol !== 'https:') return null;
      if (url.hostname !== 'www.youtube.com') return null;
      if (!url.pathname.startsWith('/embed/')) return null;
      return url.toString();
    } catch (_error) {
      return null;
    }
  }

  function loadVideo(wrapper, embedUrl) {
    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    wrapper.appendChild(iframe);
  }

  function setupVideoTriggers() {
    document.querySelectorAll('.js-video-trigger').forEach(function (wrapper) {
      var url = getSafeEmbedUrl(wrapper.getAttribute('data-embed-url'));
      if (!url) return;

      var ativarVideo = function () {
        loadVideo(wrapper, url);
      };

      wrapper.addEventListener('click', ativarVideo);
      wrapper.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          ativarVideo();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    exigirLogin();
    var saudacao = document.getElementById('saudacao');
    if (saudacao) {
      saudacao.textContent = 'Olá, ' + getUsuarioLogado();
    }
    setupVideoTriggers();
  });
})();
