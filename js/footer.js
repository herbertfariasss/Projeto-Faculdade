(function () {
  function getFooterHtml(basePath) {
    var base = (basePath || '.').replace(/\/$/, '');
    return (
      '<footer>' +
      '  <div class="rodTopo">' +
      '    <div class="rod-logo">' +
      '      <h3 class="rod-nome">Tech <strong>Cursos</strong></h3>' +
      '      <p>Todo tipo de linguagem na palma da sua mão!</p>' +
      '    </div>' +
      '    <div class="rod1">' +
      '      <h3>Soluções</h3>' +
      '      <ul>' +
      '        <li><a href="#">Trilhas de Aprendizado</a></li>' +
      '        <li><a href="#">Projetos Práticos</a></li>' +
      '        <li><a href="#">Certificados</a></li>' +
      '      </ul>' +
      '    </div>' +
      '    <div class="rod2">' +
      '      <h3>Legal</h3>' +
      '      <ul>' +
      '        <li><a href="' +
      base +
      '/legal/termos.html">Termos de Uso</a></li>' +
      '        <li><a href="' +
      base +
      '/legal/privacidade.html">Política de Privacidade</a></li>' +
      '      </ul>' +
      '    </div>' +
      '    <div class="rodDados">' +
      '      <h3>Empresa</h3>' +
      '      <p><strong>CNPJ:</strong> 00.000.000/0000-00</p>' +
      '      <p>Rio de Janeiro, RJ — Brasil</p>' +
      '      <p>suporte <a href="mailto:suporte@techcursos.com">@TechCursos.com</a></p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="rodFinal">' +
      '    <p>© Tech Cursos — Devs: Herbert, João, Giovanni, Matheus e Caique.</p>' +
      '  </div>' +
      '</footer>'
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-site-footer]').forEach(function (target) {
      target.innerHTML = getFooterHtml(target.getAttribute('data-base'));
    });
  });
})();
