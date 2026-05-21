/**
 * auth.js — Sistema de login/cadastro local (sem servidor)
 *
 * Usado em: inscriçao/inscricao.html (botões onclick e links "Criar conta"/"Entrar")
 * Armazena dados no navegador:
 *   - localStorage.usuarios → lista de { usuario, senha }
 *   - localStorage.authToken → nome do usuário logado
 *   - sessionStorage.redirectAfterLogin → URL para voltar após login
 *
 * Usuário padrão na primeira visita: admin / admin
 */

// Página de login (caminho relativo dentro da pasta inscriçao/)
const PAGINA_LOGIN = 'inscricao.html';

// Conta criada automaticamente se não existir nada no localStorage
const USUARIOS_PADRAO = [{ usuario: 'admin', senha: 'admin' }];

/** Lê usuários do localStorage ou cria a lista padrão */
function carregarUsuarios() {
  const salvos = localStorage.getItem('usuarios');
  if (salvos) return JSON.parse(salvos);
  localStorage.setItem('usuarios', JSON.stringify(USUARIOS_PADRAO));
  return USUARIOS_PADRAO;
}

/** Salva a lista completa de usuários no localStorage */
function salvarUsuarios(lista) {
  localStorage.setItem('usuarios', JSON.stringify(lista));
}

/** Retorna true se authToken existir (usuário logado) */
function isLoggedIn() {
  return localStorage.getItem('authToken') !== null;
}

/** Nome do usuário logado (valor do authToken) */
function getUsuarioLogado() {
  return localStorage.getItem('authToken');
}

/** Remove sessão e volta para a tela de login */
function fazerLogout() {
  localStorage.removeItem('authToken');
  window.location.href = PAGINA_LOGIN;
}

/**
 * Redireciona para conteúdo protegido.
 * Se não logado: guarda destino e manda para login.
 * (Pode ser chamado de outras páginas no futuro)
 */
function acessarConteudo(urlDestino) {
  if (isLoggedIn()) {
    window.location.href = urlDestino;
  } else {
    sessionStorage.setItem('redirectAfterLogin', urlDestino);
    window.location.href = PAGINA_LOGIN;
  }
}

/** Bloqueia página se não estiver logado (uso em páginas restritas) */
function exigirLogin() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = PAGINA_LOGIN;
  }
}

/** Exibe ou esconde mensagens de erro/sucesso (#erro-msg, #erro-registro, etc.) */
function mostrarMensagem(el, texto, visivel) {
  if (!el) return;
  if (visivel) {
    el.textContent = texto;
    el.hidden = false;
  } else {
    el.textContent = '';
    el.hidden = true;
  }
}

/**
 * Login — ligado ao botão #btn-login e Enter no teclado.
 * Valida contra a lista em localStorage.usuarios
 */
function fazerLogin() {
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const erro = document.getElementById('erro-msg');

  mostrarMensagem(erro, '', false);

  if (!usuario || !senha) {
    mostrarMensagem(erro, 'Preencha todos os campos.', true);
    return;
  }

  const usuarios = carregarUsuarios();
  const encontrado = usuarios.find((u) => u.usuario === usuario && u.senha === senha);

  if (encontrado) {
    localStorage.setItem('authToken', usuario);
    const destino = sessionStorage.getItem('redirectAfterLogin') || '../index.html';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = destino;
  } else {
    mostrarMensagem(erro, 'Usuário ou senha incorretos.', true);
  }
}

/**
 * Cadastro — ligado ao botão #btn-registro.
 * Campos: #novo-usuario, #nova-senha, #confirmar-senha
 */
function registrarUsuario() {
  const usuario = document.getElementById('novo-usuario').value.trim();
  const senha = document.getElementById('nova-senha').value.trim();
  const confirmar = document.getElementById('confirmar-senha').value.trim();
  const erro = document.getElementById('erro-registro');
  const sucesso = document.getElementById('sucesso-registro');

  mostrarMensagem(erro, '', false);
  mostrarMensagem(sucesso, '', false);

  if (!usuario || !senha || !confirmar) {
    mostrarMensagem(erro, 'Preencha todos os campos.', true);
    return;
  }
  if (usuario.length < 3) {
    mostrarMensagem(erro, 'Usuário deve ter pelo menos 3 caracteres.', true);
    return;
  }
  if (senha.length < 4) {
    mostrarMensagem(erro, 'Senha deve ter pelo menos 4 caracteres.', true);
    return;
  }
  if (senha !== confirmar) {
    mostrarMensagem(erro, 'As senhas não coincidem.', true);
    return;
  }

  const usuarios = carregarUsuarios();
  if (usuarios.find((u) => u.usuario === usuario)) {
    mostrarMensagem(erro, 'Esse usuário já existe.', true);
    return;
  }

  usuarios.push({ usuario, senha });
  salvarUsuarios(usuarios);

  mostrarMensagem(sucesso, 'Conta criada! Redirecionando...', true);

  setTimeout(() => {
    localStorage.setItem('authToken', usuario);
    const destino = sessionStorage.getItem('redirectAfterLogin') || '../index.html';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = destino;
  }, 1500);
}

/**
 * Troca entre abas Login e Criar conta (inscricao.html).
 * Liga: links em .trocar-aba → mostrarAba('login'|'registro')
 * Controla: #aba-login e #aba-registro (atributo hidden)
 */
function mostrarAba(aba) {
  const abaLogin = document.getElementById('aba-login');
  const abaRegistro = document.getElementById('aba-registro');
  const tabLogin = document.getElementById('tab-login');
  const tabRegistro = document.getElementById('tab-registro');

  const loginAtivo = aba === 'login';

  if (abaLogin) abaLogin.hidden = !loginAtivo;
  if (abaRegistro) abaRegistro.hidden = loginAtivo;

  // Abas visuais opcionais (se existirem no HTML no futuro)
  if (tabLogin) tabLogin.classList.toggle('ativa', loginAtivo);
  if (tabRegistro) tabRegistro.classList.toggle('ativa', !loginAtivo);
}

/** Verifica se a aba de login está visível (para tecla Enter) */
function abaLoginVisivel() {
  const abaLogin = document.getElementById('aba-login');
  return abaLogin && !abaLogin.hidden;
}

// Enter no teclado envia login ou cadastro conforme a aba aberta
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (abaLoginVisivel()) fazerLogin();
    else registrarUsuario();
  });
});
