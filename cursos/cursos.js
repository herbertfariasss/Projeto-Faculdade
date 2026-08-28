document.addEventListener('DOMContentLoaded', function () {
  exigirLogin();
  var saudacao = document.getElementById('saudacao');
  if (saudacao) {
    saudacao.textContent = 'Olá, ' + getUsuarioLogado();
  }
});
