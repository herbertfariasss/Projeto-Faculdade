/**
 * cabecalho.js — Página de login (inscricao.html)
 *
 * Função: abrir/fechar menu mobile (botão hambúrguer).
 * Ligado a:
 *   - Botão #hamburger (onclick="toggleMenu()" no HTML)
 *   - Div #mobile-menu (recebe classe .open → exibida via cabecalho.css)
 */

function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  // Alterna a classe "open" — CSS .mobile-menu.open { display: flex; }
  menu.classList.toggle('open');
}
