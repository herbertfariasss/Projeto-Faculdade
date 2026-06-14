/*
  =============================================
  auth.js — Sistema de Login e Cadastro
  =============================================
  Este arquivo cuida de TUDO relacionado ao login:
  - Criar conta
  - Entrar com usuário e senha
  - Verificar se está logado
  - Fazer logout (sair)

  Como os dados são salvos?
  → Usamos o localStorage do navegador (funciona como um "banco de dados" local)
  → localStorage.usuarios  = lista com todos os usuários cadastrados
  → localStorage.authToken = nome do usuário que está logado no momento

  ATENÇÃO: Em projetos reais, o login é feito com servidor + banco de dados.
  Aqui usamos localStorage apenas para fins de estudo/demonstração.
*/


// ============================================================
// CONFIGURAÇÕES INICIAIS
// ============================================================

// Usuário padrão criado automaticamente na primeira vez que o site abre
var USUARIOS_PADRAO = [
  { usuario: 'admin', senha: 'admin' }
];

// Descobre a URL do auth.js (funciona localmente e no GitHub Pages /Projeto-Faculdade/)
function getAuthScriptUrl() {
  var scripts = document.querySelectorAll('script[src*="auth.js"]');
  if (scripts.length) {
    return scripts[scripts.length - 1].src;
  }
  return null;
}

function getInscricaoBaseUrl() {
  var scriptUrl = getAuthScriptUrl();
  if (scriptUrl) {
    return scriptUrl.replace(/auth\.js(\?.*)?$/, '');
  }
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

// Converte caminhos relativos (ex.: cursos/cursos.html) em URL completa
function resolverUrl(destino) {
  if (!destino) return getIndexUrl();
  if (/^https?:\/\//i.test(destino)) return destino;
  return new URL(destino, getSiteRootUrl()).href;
}


// ============================================================
// FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS
// ============================================================

// Carrega a lista de usuários do localStorage
// Se ainda não existir nenhum, cria a lista com o usuário padrão
function carregarUsuarios() {
  var salvos = localStorage.getItem('usuarios');

  if (salvos) {
    // JSON.parse converte o texto salvo de volta para um array JavaScript
    return JSON.parse(salvos);
  } else {
    // Primeira vez: salva o usuário padrão e retorna a lista
    localStorage.setItem('usuarios', JSON.stringify(USUARIOS_PADRAO));
    return USUARIOS_PADRAO;
  }
}

// Salva a lista completa de usuários no localStorage
// JSON.stringify converte o array JavaScript em texto para poder salvar
function salvarUsuarios(lista) {
  localStorage.setItem('usuarios', JSON.stringify(lista));
}


// ============================================================
// FUNÇÕES DE VERIFICAÇÃO DE LOGIN
// ============================================================

// Verifica se o usuário está logado
// Retorna true (logado) ou false (não logado)
function isLoggedIn() {
  return localStorage.getItem('authToken') !== null;
}

// Retorna o nome do usuário que está logado
function getUsuarioLogado() {
  return localStorage.getItem('authToken');
}


// ============================================================
// FUNÇÕES DE NAVEGAÇÃO E PROTEÇÃO DE PÁGINAS
// ============================================================

// Tenta acessar uma página protegida
// Se não estiver logado, salva o destino e manda para o login
// Depois do login, o sistema redireciona de volta para onde o usuário queria ir
function acessarConteudo(urlDestino) {
  if (isLoggedIn()) {
    window.location.href = resolverUrl(urlDestino);
  } else {
    // Usuário não logado: guarda o destino e vai para o login
    sessionStorage.setItem('redirectAfterLogin', resolverUrl(urlDestino));
    window.location.href = getPaginaLogin();
  }
}

// Protege uma página: se o usuário tentar acessar sem estar logado,
// é redirecionado para o login automaticamente
// Use esta função no início de páginas restritas
function exigirLogin() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = getPaginaLogin();
  }
}

// Faz o logout: remove o token de sessão e volta para o login
function fazerLogout() {
  localStorage.removeItem('authToken'); // apaga a sessão
  window.location.href = getPaginaLogin(); // redireciona para o login
}


// ============================================================
// FUNÇÕES DE INTERFACE (MENSAGENS NA TELA)
// ============================================================

// Mostra ou esconde uma mensagem de erro/sucesso na tela
// el      = o elemento HTML da mensagem
// texto   = o texto a mostrar
// visivel = true para mostrar, false para esconder
function mostrarMensagem(el, texto, visivel) {
  if (!el) return; // se o elemento não existe, não faz nada

  if (visivel) {
    el.textContent = texto;
    el.hidden = false; // mostra o elemento
  } else {
    el.textContent = '';
    el.hidden = true; // esconde o elemento
  }
}


// ============================================================
// FUNÇÃO DE LOGIN
// ============================================================

// Executada quando o usuário clica em "Entrar"
// Lê os campos do formulário, valida e verifica no localStorage
function fazerLogin() {
  // Pega o que o usuário digitou (trim remove espaços em branco)
  var usuario = document.getElementById('usuario').value.trim();
  var senha   = document.getElementById('senha').value.trim();
  var msgErro = document.getElementById('erro-msg');

  // Esconde qualquer mensagem de erro anterior
  mostrarMensagem(msgErro, '', false);

  // Validação: campos não podem estar vazios
  if (!usuario || !senha) {
    mostrarMensagem(msgErro, 'Preencha todos os campos.', true);
    return; // para aqui, não continua
  }

  // Procura o usuário na lista salva no localStorage
  var usuarios  = carregarUsuarios();
  var encontrado = usuarios.find(function(u) {
    return u.usuario === usuario && u.senha === senha;
  });

  if (encontrado) {
    // Login correto: salva o nome como token de sessão
    localStorage.setItem('authToken', usuario);

    // Verifica se tem uma página para redirecionar após o login
    var destino = resolverUrl(sessionStorage.getItem('redirectAfterLogin'));
    sessionStorage.removeItem('redirectAfterLogin'); // limpa o destino salvo
    window.location.href = destino; // redireciona

  } else {
    // Login incorreto: mostra mensagem de erro
    mostrarMensagem(msgErro, 'Usuário ou senha incorretos.', true);
  }
}


// ============================================================
// FUNÇÃO DE CADASTRO
// ============================================================

// Executada quando o usuário clica em "Cadastrar"
// Valida os campos e cria uma nova conta no localStorage
function registrarUsuario() {
  var usuario   = document.getElementById('novo-usuario').value.trim();
  var senha     = document.getElementById('nova-senha').value.trim();
  var confirmar = document.getElementById('confirmar-senha').value.trim();
  var msgErro   = document.getElementById('erro-registro');
  var msgOk     = document.getElementById('sucesso-registro');

  // Esconde mensagens anteriores
  mostrarMensagem(msgErro, '', false);
  mostrarMensagem(msgOk,   '', false);

  // Validações (cada uma para antes de ir para a próxima)
  if (!usuario || !senha || !confirmar) {
    mostrarMensagem(msgErro, 'Preencha todos os campos.', true);
    return;
  }
  if (usuario.length < 3) {
    mostrarMensagem(msgErro, 'Usuário deve ter pelo menos 3 caracteres.', true);
    return;
  }
  if (senha.length < 4) {
    mostrarMensagem(msgErro, 'Senha deve ter pelo menos 4 caracteres.', true);
    return;
  }
  if (senha !== confirmar) {
    mostrarMensagem(msgErro, 'As senhas não coincidem.', true);
    return;
  }

    // Validação do CPF
  var cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  if (!cpf) {
    mostrarMensagem(msgErro, 'Preencha o CPF.', true);
    return;
  }
  if (!validarCpf(cpf)) {
    mostrarMensagem(msgErro, 'CPF inválido.', true);
    return;
  }

  // Validação do CEP
  var cep = document.getElementById('cep').value.replace(/\D/g, '');
  var rua = document.getElementById('rua').value.trim();
  if (!cep || cep.length !== 8) {
    mostrarMensagem(msgErro, 'Preencha o CEP.', true);
    return;
  }
  if (!rua) {
    mostrarMensagem(msgErro, 'CEP não foi buscado. Aguarde ou verifique o CEP.', true);
    return;
  }
  var numero = document.getElementById('numero').value.trim();
  if (!numero) {
    mostrarMensagem(msgErro, 'Preencha o número da residência.', true);
    return;
  }

  // Verifica se o nome de usuário já está em uso
  var usuarios = carregarUsuarios();
  var jaExiste = usuarios.find(function(u) { return u.usuario === usuario; });

  if (jaExiste) {
    mostrarMensagem(msgErro, 'Esse usuário já existe.', true);
    return;
  }

  // Tudo certo: adiciona o novo usuário à lista e salva
  usuarios.push({ usuario: usuario, senha: senha, cpf: cpf, cep: cep, numero: numero });
  salvarUsuarios(usuarios);

  // Mostra mensagem de sucesso e redireciona após 1,5 segundos
  mostrarMensagem(msgOk, 'Conta criada! Redirecionando...', true);

  setTimeout(function() {
    localStorage.setItem('authToken', usuario); // loga automaticamente
    var destino = resolverUrl(sessionStorage.getItem('redirectAfterLogin'));
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = destino;
  }, 1500);
}


// ============================================================
// FUNÇÃO DE ABAS (LOGIN / CADASTRO)
// ============================================================

// Alterna entre a aba de Login e a aba de Criar Conta na tela
// aba = 'login' ou 'registro'
function mostrarAba(aba) {
  var abaLogin    = document.getElementById('aba-login');
  var abaRegistro = document.getElementById('aba-registro');

  if (aba === 'login') {
    abaLogin.hidden    = false; // mostra o formulário de login
    abaRegistro.hidden = true;  // esconde o formulário de cadastro
  } else {
    abaLogin.hidden    = true;  // esconde o formulário de login
    abaRegistro.hidden = false; // mostra o formulário de cadastro
  }
}

// Verifica qual aba está visível no momento
function abaLoginVisivel() {
  var abaLogin = document.getElementById('aba-login');
  return abaLogin && !abaLogin.hidden;
}


// ============================================================
// ATALHO DE TECLADO: ENTER
// ============================================================

// Quando o usuário aperta Enter, envia o formulário que está visível
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('keydown', function(evento) {
    if (evento.key !== 'Enter') return; // ignora qualquer tecla que não seja Enter
    evento.preventDefault();

    if (abaLoginVisivel()) {
      fazerLogin();     // aba de login visível → faz login
    } else {
      registrarUsuario(); // aba de cadastro visível → cria conta
    }
  });
});
