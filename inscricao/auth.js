/*
  =============================================
  auth.js — Sistema de Login e Cadastro
  =============================================
  Armazenamento local apenas para estudos. Em produção, use backend.
*/

var USUARIOS_PADRAO = [{ usuario: 'admin', senhaHash: null }];

var SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6 horas

function getAuthScriptUrl() {
  var scripts = document.querySelectorAll('script[src*="auth.js"]');
  if (scripts.length) return scripts[scripts.length - 1].src;
  return null;
}

function getInscricaoBaseUrl() {
  var scriptUrl = getAuthScriptUrl();
  if (scriptUrl) return scriptUrl.replace(/auth\.js(\?.*)?$/, '');
  return new URL('inscricao/', window.location.href).href;
}

function getSiteRootUrl() {
  return getInscricaoBaseUrl().replace(/inscricao\/$/, '');
}

function getPaginaLogin() {
  return getInscricaoBaseUrl() + 'inscricao.html';
}

function getIndexUrl() {
  return new URL('index.html', getSiteRootUrl()).href;
}

function resolverUrl(destino) {
  if (!destino) return getIndexUrl();
  if (/^https?:\/\//i.test(destino)) return destino;
  return new URL(destino, getSiteRootUrl()).href;
}

function carregarUsuarios() {
  var salvos = localStorage.getItem('usuarios');
  if (!salvos) {
    localStorage.setItem('usuarios', JSON.stringify(USUARIOS_PADRAO));
    return USUARIOS_PADRAO.slice();
  }

  var usuarios = JSON.parse(salvos);
  if (!Array.isArray(usuarios)) {
    localStorage.setItem('usuarios', JSON.stringify(USUARIOS_PADRAO));
    return USUARIOS_PADRAO.slice();
  }

  return usuarios;
}

function salvarUsuarios(lista) {
  localStorage.setItem('usuarios', JSON.stringify(lista));
}

function isHashSeguro(valor) {
  return typeof valor === 'string' && /^[a-f0-9]{64}$/i.test(valor);
}

async function hashSenha(senha) {
  var texto = new TextEncoder().encode(senha);
  var digest = await crypto.subtle.digest('SHA-256', texto);
  return Array.from(new Uint8Array(digest))
    .map(function (byte) {
      return byte.toString(16).padStart(2, '0');
    })
    .join('');
}

async function garantirSenhaHash(usuario) {
  if (isHashSeguro(usuario.senhaHash)) return false;
  if (typeof usuario.senha === 'string' && usuario.senha) {
    usuario.senhaHash = await hashSenha(usuario.senha);
    delete usuario.senha;
    return true;
  }
  if (!usuario.senhaHash) {
    usuario.senhaHash = await hashSenha('admin');
    return true;
  }
  return false;
}

async function normalizarUsuarios() {
  var usuarios = carregarUsuarios();
  var mudou = false;

  for (var i = 0; i < usuarios.length; i++) {
    if (await garantirSenhaHash(usuarios[i])) mudou = true;
    if (usuarios[i].cpf) {
      delete usuarios[i].cpf;
      mudou = true;
    }
  }

  if (mudou) salvarUsuarios(usuarios);
  return usuarios;
}

function criarSessao(usuario) {
  var sessao = {
    user: usuario,
    token: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  localStorage.setItem('authSession', JSON.stringify(sessao));
  localStorage.removeItem('authToken');
}

function getSessao() {
  var sessaoRaw = localStorage.getItem('authSession');
  var tokenAntigo = localStorage.getItem('authToken');

  if (!sessaoRaw && tokenAntigo) {
    criarSessao(tokenAntigo);
    sessaoRaw = localStorage.getItem('authSession');
  }

  if (!sessaoRaw) return null;

  try {
    var sessao = JSON.parse(sessaoRaw);
    if (!sessao || !sessao.user || !sessao.expiresAt) return null;
    if (Date.now() > sessao.expiresAt) {
      localStorage.removeItem('authSession');
      return null;
    }
    return sessao;
  } catch (_e) {
    localStorage.removeItem('authSession');
    return null;
  }
}

function isLoggedIn() {
  return !!getSessao();
}

function getUsuarioLogado() {
  var sessao = getSessao();
  return sessao ? sessao.user : null;
}

function acessarConteudo(urlDestino) {
  if (isLoggedIn()) {
    window.location.href = resolverUrl(urlDestino);
    return;
  }
  sessionStorage.setItem('redirectAfterLogin', resolverUrl(urlDestino));
  window.location.href = getPaginaLogin();
}

function exigirLogin() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = getPaginaLogin();
  }
}

function fazerLogout() {
  localStorage.removeItem('authSession');
  localStorage.removeItem('authToken');
  window.location.href = getPaginaLogin();
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

async function validarCredenciaisUsuario(usuarioObj, senhaDigitada) {
  if (!usuarioObj || !senhaDigitada) return false;

  if (isHashSeguro(usuarioObj.senhaHash)) {
    var hashDigitado = await hashSenha(senhaDigitada);
    return hashDigitado === usuarioObj.senhaHash;
  }

  if (usuarioObj.senha && usuarioObj.senha === senhaDigitada) {
    usuarioObj.senhaHash = await hashSenha(senhaDigitada);
    delete usuarioObj.senha;
    return true;
  }

  return false;
}

async function fazerLogin() {
  var usuario = document.getElementById('usuario').value.trim();
  var senha = document.getElementById('senha').value.trim();
  var msgErro = document.getElementById('erro-msg');

  mostrarMensagem(msgErro, '', false);

  if (!usuario || !senha) {
    mostrarMensagem(msgErro, 'Preencha todos os campos.', true);
    return;
  }

  var usuarios = await normalizarUsuarios();
  var encontrado = null;

  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].usuario === usuario && (await validarCredenciaisUsuario(usuarios[i], senha))) {
      encontrado = usuarios[i];
      break;
    }
  }

  if (!encontrado) {
    mostrarMensagem(msgErro, 'Usuário ou senha incorretos.', true);
    return;
  }

  salvarUsuarios(usuarios);
  criarSessao(usuario);

  var destino = resolverUrl(sessionStorage.getItem('redirectAfterLogin'));
  sessionStorage.removeItem('redirectAfterLogin');
  window.location.href = destino;
}

function obterDadosEndereco(prefixo) {
  return {
    cep: (document.getElementById(prefixo + 'cep') || { value: '' }).value.replace(/\D/g, ''),
    rua: (document.getElementById(prefixo + 'rua') || { value: '' }).value.trim(),
    numero: (document.getElementById(prefixo + 'numero') || { value: '' }).value.trim(),
    complemento: (document.getElementById(prefixo + 'complemento') || { value: '' }).value.trim(),
    bairro: (document.getElementById(prefixo + 'bairro') || { value: '' }).value.trim(),
    cidade: (document.getElementById(prefixo + 'cidade') || { value: '' }).value.trim(),
    uf: (document.getElementById(prefixo + 'uf') || { value: '' }).value.trim()
  };
}

async function registrarUsuario() {
  var usuario = document.getElementById('novo-usuario').value.trim();
  var senha = document.getElementById('nova-senha').value.trim();
  var confirmar = document.getElementById('confirmar-senha').value.trim();
  var consentimento = document.getElementById('consentimento-dados');
  var msgErro = document.getElementById('erro-registro');
  var msgOk = document.getElementById('sucesso-registro');

  mostrarMensagem(msgErro, '', false);
  mostrarMensagem(msgOk, '', false);

  if (!usuario || !senha || !confirmar) {
    mostrarMensagem(msgErro, 'Preencha todos os campos.', true);
    return;
  }
  if (usuario.length < 3) {
    mostrarMensagem(msgErro, 'Usuário deve ter pelo menos 3 caracteres.', true);
    return;
  }
  if (senha.length < 8) {
    mostrarMensagem(msgErro, 'Senha deve ter pelo menos 8 caracteres.', true);
    return;
  }
  if (senha !== confirmar) {
    mostrarMensagem(msgErro, 'As senhas não coincidem.', true);
    return;
  }
  if (!consentimento || !consentimento.checked) {
    mostrarMensagem(msgErro, 'Você precisa aceitar os Termos e a Política de Privacidade.', true);
    return;
  }

  var cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  if (!cpf) {
    mostrarMensagem(msgErro, 'Preencha o CPF.', true);
    return;
  }
  if (!validarCpf(cpf)) {
    mostrarMensagem(msgErro, 'CPF inválido.', true);
    return;
  }

  var endereco = obterDadosEndereco('');
  if (!endereco.cep || endereco.cep.length !== 8) {
    mostrarMensagem(msgErro, 'Preencha o CEP.', true);
    return;
  }
  if (!endereco.rua) {
    mostrarMensagem(msgErro, 'CEP não foi buscado. Aguarde ou verifique o CEP.', true);
    return;
  }
  if (!endereco.numero) {
    mostrarMensagem(msgErro, 'Preencha o número da residência.', true);
    return;
  }

  var usuarios = await normalizarUsuarios();
  var jaExiste = usuarios.find(function (u) {
    return u.usuario === usuario;
  });

  if (jaExiste) {
    mostrarMensagem(msgErro, 'Esse usuário já existe.', true);
    return;
  }

  usuarios.push({
    usuario: usuario,
    senhaHash: await hashSenha(senha),
    consentimentoDadosAt: new Date().toISOString(),
    cep: endereco.cep,
    rua: endereco.rua,
    numero: endereco.numero,
    complemento: endereco.complemento,
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    uf: endereco.uf
  });

  salvarUsuarios(usuarios);
  mostrarMensagem(msgOk, 'Conta criada! Redirecionando...', true);

  setTimeout(function () {
    criarSessao(usuario);
    var destino = resolverUrl(sessionStorage.getItem('redirectAfterLogin'));
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = destino;
  }, 1500);
}

function mostrarAba(aba) {
  var abaLogin = document.getElementById('aba-login');
  var abaRegistro = document.getElementById('aba-registro');

  if (aba === 'login') {
    abaLogin.hidden = false;
    abaRegistro.hidden = true;
  } else {
    abaLogin.hidden = true;
    abaRegistro.hidden = false;
  }
}

function abaLoginVisivel() {
  var abaLogin = document.getElementById('aba-login');
  return abaLogin && !abaLogin.hidden;
}

document.addEventListener('DOMContentLoaded', function () {
  normalizarUsuarios();

  var btnLogin = document.getElementById('btn-login');
  var btnRegistro = document.getElementById('btn-registro');
  var linkAbaRegistro = document.getElementById('link-aba-registro');
  var linkAbaLogin = document.getElementById('link-aba-login');

  if (btnLogin) {
    btnLogin.addEventListener('click', function () {
      fazerLogin();
    });
  }

  if (btnRegistro) {
    btnRegistro.addEventListener('click', function () {
      registrarUsuario();
    });
  }

  if (linkAbaRegistro) {
    linkAbaRegistro.addEventListener('click', function (event) {
      event.preventDefault();
      mostrarAba('registro');
    });
  }

  if (linkAbaLogin) {
    linkAbaLogin.addEventListener('click', function (event) {
      event.preventDefault();
      mostrarAba('login');
    });
  }

  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Enter') return;
    if (!document.getElementById('aba-login') && !document.getElementById('aba-registro')) return;

    evento.preventDefault();
    if (abaLoginVisivel()) {
      fazerLogin();
    } else {
      registrarUsuario();
    }
  });
});
