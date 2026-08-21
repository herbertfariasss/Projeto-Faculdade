(function () {
  function createElement(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === 'string') el.textContent = text;
    return el;
  }

  function createLink(text, href) {
    var link = document.createElement('a');
    link.textContent = text;
    link.href = href;
    return link;
  }

  function sanitizeBasePath(basePath) {
    if (typeof basePath !== 'string') return '.';
    var trimmed = basePath.trim().replace(/\/$/, '');
    if (!trimmed) return '.';
    if (!/^[./a-zA-Z0-9_-]+$/.test(trimmed)) return '.';
    return trimmed;
  }

  function createFooter(basePath) {
    var base = sanitizeBasePath(basePath);
    var footer = document.createElement('footer');

    var rodTopo = createElement('div', 'rodTopo');

    var rodLogo = createElement('div', 'rod-logo');
    var rodNome = createElement('h3', 'rod-nome');
    rodNome.append('Tech ');
    rodNome.appendChild(createElement('strong', null, 'Cursos'));
    rodLogo.appendChild(rodNome);
    rodLogo.appendChild(createElement('p', null, 'Todo tipo de linguagem na palma da sua mão!'));

    var rod1 = createElement('div', 'rod1');
    rod1.appendChild(createElement('h3', null, 'Soluções'));
    var rod1List = createElement('ul');
    ['Trilhas de Aprendizado', 'Projetos Práticos', 'Certificados'].forEach(function (text) {
      var li = createElement('li');
      li.appendChild(createLink(text, '#'));
      rod1List.appendChild(li);
    });
    rod1.appendChild(rod1List);

    var rod2 = createElement('div', 'rod2');
    rod2.appendChild(createElement('h3', null, 'Legal'));
    var rod2List = createElement('ul');
    var liTermos = createElement('li');
    liTermos.appendChild(createLink('Termos de Uso', base + '/legal/termos.html'));
    var liPriv = createElement('li');
    liPriv.appendChild(createLink('Política de Privacidade', base + '/legal/privacidade.html'));
    rod2List.appendChild(liTermos);
    rod2List.appendChild(liPriv);
    rod2.appendChild(rod2List);

    var rodDados = createElement('div', 'rodDados');
    rodDados.appendChild(createElement('h3', null, 'Empresa'));
    var cnpj = createElement('p');
    cnpj.appendChild(createElement('strong', null, 'CNPJ:'));
    cnpj.append(' 00.000.000/0000-00');
    rodDados.appendChild(cnpj);
    rodDados.appendChild(createElement('p', null, 'Rio de Janeiro, RJ — Brasil'));
    var suporte = createElement('p');
    suporte.append('suporte ');
    suporte.appendChild(createLink('@TechCursos.com', 'mailto:suporte@techcursos.com'));
    rodDados.appendChild(suporte);

    rodTopo.appendChild(rodLogo);
    rodTopo.appendChild(rod1);
    rodTopo.appendChild(rod2);
    rodTopo.appendChild(rodDados);

    var rodFinal = createElement('div', 'rodFinal');
    rodFinal.appendChild(createElement('p', null, '© Tech Cursos — Devs: Herbert, João, Giovanni, Matheus e Caique.'));

    footer.appendChild(rodTopo);
    footer.appendChild(rodFinal);

    return footer;
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-site-footer]').forEach(function (target) {
      var footer = createFooter(target.getAttribute('data-base'));
      target.replaceChildren(footer);
    });
  });
})();
