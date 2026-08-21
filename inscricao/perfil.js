(function () {
  function formatarCep(cep) {
    var s = cep.replace(/\D/g, '');
    return s.length === 8 ? s.slice(0, 5) + '-' + s.slice(5) : s;
  }

  function exibirErro(el, texto) {
    el.textContent = texto;
    el.hidden = false;
  }

  function abrirModalExcluir() {
    document.getElementById('modal-excluir').hidden = false;
  }

  function fecharModalExcluir() {
    document.getElementById('modal-excluir').hidden = true;
  }

  function mascararCepPerfil(input) {
    var v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
    input.value = v;

    if (v.replace(/\D/g, '').length !== 8) return;

    fetch('https://viacep.com.br/ws/' + v.replace(/\D/g, '') + '/json/')
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d.erro) return;
        document.getElementById('p-rua').value = d.logradouro || '';
        document.getElementById('p-bairro').value = d.bairro || '';
        document.getElementById('p-cidade').value = d.localidade || '';
        document.getElementById('p-uf').value = d.uf || '';
      })
      .catch(function () {});
  }

  function obterUsuarioAtual(usuarios, nomeLogado) {
    var idx = usuarios.findIndex(function (u) {
      return u.usuario === nomeLogado;
    });
    return { idx: idx, usuario: idx >= 0 ? usuarios[idx] : null };
  }

  async function salvarPerfil() {
    var msgErro = document.getElementById('msg-perfil-erro');
    var msgSucesso = document.getElementById('msg-perfil-sucesso');
    msgErro.hidden = true;
    msgSucesso.hidden = true;

    var nomeLogado = getUsuarioLogado();
    var novoUsuario = document.getElementById('p-usuario').value.trim();
    var senhaAtual = document.getElementById('p-senha-atual').value.trim();
    var novaSenha = document.getElementById('p-nova-senha').value.trim();
    var confirmarSenha = document.getElementById('p-confirmar-senha').value.trim();

    if (!novoUsuario) return exibirErro(msgErro, 'O nome de usuário não pode ficar vazio.');
    if (!senhaAtual) return exibirErro(msgErro, 'Digite sua senha atual para confirmar as alterações.');

    var usuarios = await normalizarUsuarios();
    var atual = obterUsuarioAtual(usuarios, nomeLogado);
    if (!atual.usuario) return exibirErro(msgErro, 'Usuário não encontrado.');

    if (!(await validarCredenciaisUsuario(atual.usuario, senhaAtual))) {
      return exibirErro(msgErro, 'Senha atual incorreta.');
    }

    if (novoUsuario !== nomeLogado) {
      var nomeEmUso = usuarios.find(function (u) {
        return u.usuario === novoUsuario;
      });
      if (nomeEmUso) return exibirErro(msgErro, 'Esse nome de usuário já está em uso.');
    }

    if (novaSenha) {
      if (novaSenha.length < 8) return exibirErro(msgErro, 'A nova senha deve ter pelo menos 8 caracteres.');
      if (novaSenha !== confirmarSenha) return exibirErro(msgErro, 'As novas senhas não coincidem.');
      atual.usuario.senhaHash = await hashSenha(novaSenha);
    }

    atual.usuario.usuario = novoUsuario;
    atual.usuario.cep = document.getElementById('p-cep').value.replace(/\D/g, '');
    atual.usuario.rua = document.getElementById('p-rua').value.trim();
    atual.usuario.numero = document.getElementById('p-numero').value.trim();
    atual.usuario.complemento = document.getElementById('p-complemento').value.trim();
    atual.usuario.bairro = document.getElementById('p-bairro').value.trim();
    atual.usuario.cidade = document.getElementById('p-cidade').value.trim();
    atual.usuario.uf = document.getElementById('p-uf').value.trim();

    usuarios[atual.idx] = atual.usuario;
    salvarUsuarios(usuarios);

    if (novoUsuario !== nomeLogado) {
      var sessao = getSessao();
      if (sessao) {
        sessao.user = novoUsuario;
        localStorage.setItem('authSession', JSON.stringify(sessao));
      }
    }

    document.getElementById('p-senha-atual').value = '';
    document.getElementById('p-nova-senha').value = '';
    document.getElementById('p-confirmar-senha').value = '';

    msgSucesso.textContent = '✅ Dados atualizados com sucesso!';
    msgSucesso.hidden = false;
    setTimeout(function () {
      msgSucesso.hidden = true;
    }, 3000);
  }

  async function excluirConta() {
    var nomeLogado = getUsuarioLogado();
    var usuarios = await normalizarUsuarios();
    var novos = usuarios.filter(function (u) {
      return u.usuario !== nomeLogado;
    });

    salvarUsuarios(novos);
    localStorage.removeItem('authSession');
    window.location.href = 'inscricao.html';
  }

  function preencherFormulario(usuario) {
    document.getElementById('p-usuario').value = usuario.usuario || '';
    document.getElementById('p-cep').value = usuario.cep ? formatarCep(usuario.cep) : '';
    document.getElementById('p-rua').value = usuario.rua || '';
    document.getElementById('p-numero').value = usuario.numero || '';
    document.getElementById('p-complemento').value = usuario.complemento || '';
    document.getElementById('p-bairro').value = usuario.bairro || '';
    document.getElementById('p-cidade').value = usuario.cidade || '';
    document.getElementById('p-uf').value = usuario.uf || '';
  }

  document.addEventListener('DOMContentLoaded', async function () {
    exigirLogin();

    var nomeLogado = getUsuarioLogado();
    var usuarios = await normalizarUsuarios();
    var usuario = usuarios.find(function (u) {
      return u.usuario === nomeLogado;
    });
    if (usuario) preencherFormulario(usuario);

    document.getElementById('p-cep').addEventListener('input', function () {
      mascararCepPerfil(this);
    });

    document.getElementById('btn-salvar-perfil').addEventListener('click', function () {
      salvarPerfil();
    });

    document.getElementById('btn-abrir-modal-excluir').addEventListener('click', function () {
      abrirModalExcluir();
    });

    document.getElementById('btn-cancelar-excluir').addEventListener('click', function () {
      fecharModalExcluir();
    });

    document.getElementById('btn-confirmar-excluir').addEventListener('click', function () {
      excluirConta();
    });

    document.getElementById('modal-excluir').addEventListener('click', function (e) {
      if (e.target === this) fecharModalExcluir();
    });
  });
})();
