/**
 * script.js — Página principal (index.html)
 *
 * Função: rolagem suave ao clicar nos links do menu (#Home, #Cursos, #Sobre, #Contato).
 * Ligado a: <nav class="nav"> no index.html (href="#...")
 *
 * O CSS também define scroll-behavior: smooth em styles.css/html,
 * mas este script garante scrollIntoView com controle do alvo.
 */

// Seleciona todos os links internos que começam com #
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute('href');

  // Ignora links vazios ou só "#"
  if (!id || id === '#') return;

  link.addEventListener('click', (e) => {
    // Busca o elemento com o mesmo id (ex: #Cursos → <hr id="Cursos">)
    const alvo = document.querySelector(id);
    if (!alvo) return;

    e.preventDefault();
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
