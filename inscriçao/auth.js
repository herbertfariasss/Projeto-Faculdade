// ============================================
//  AUTH.JS — Autenticação local com localStorage
// ============================================

const PAGINA_LOGIN = 'inscricao.html';
const USUARIOS_PADRAO = [{ usuario: 'admin', senha: 'admin' }];

function carregarUsuarios() {
  const salvos = localStorage.getItem('usuarios');
  if (salvos) return JSON.parse(salvos);
  localStorage.setItem('usuarios', JSON.stringify(USUARIOS_PADRAO));
  return USUARIOS_PADRAO;
}

function salvarUsuarios(lista) {
  localStorage.setItem('usuarios', JSON.stringify(lista));
}

function isLoggedIn() {
  return localStorage.getItem('authToken') !== null;
}

function getUsuarioLogado() {
  return localStorage.getItem('authToken');
}

function fazerLogout() {
  localStorage.removeItem('authToken');
  window.location.href = PAGINA_LOGIN;
}

function acessarConteudo(urlDestino) {
  if (isLoggedIn()) {
    window.location.href = urlDestino;
  } else {
    sessionStorage.setItem('redirectAfterLogin', urlDestino);
    window.location.href = PAGINA_LOGIN;
  }
}

function exigirLogin() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = PAGINA_LOGIN;
  }
}

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

function mostrarAba(aba) {
  const abaLogin = document.getElementById('aba-login');
  const abaRegistro = document.getElementById('aba-registro');
  const tabLogin = document.getElementById('tab-login');
  const tabRegistro = document.getElementById('tab-registro');

  const loginAtivo = aba === 'login';

  abaLogin.hidden = !loginAtivo;
  abaRegistro.hidden = loginAtivo;

  tabLogin.classList.toggle('ativa', loginAtivo);
  tabRegistro.classList.toggle('ativa', !loginAtivo);
}

function abaLoginVisivel() {
  const abaLogin = document.getElementById('aba-login');
  return abaLogin && !abaLogin.hidden;
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (abaLoginVisivel()) fazerLogin();
    else registrarUsuario();
  });
});
