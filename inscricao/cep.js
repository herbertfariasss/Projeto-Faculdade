function mascaraCep(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 5) {
    valor = valor.slice(0, 5) + "-" + valor.slice(5, 8);
  }

  input.value = valor;

  // Busca automaticamente quando atingir 8 dígitos
  if (valor.replace(/\D/g, "").length === 8) {
    buscarCep();
  }
}

async function buscarCep() {
  const campoCep = document.getElementById("cep");
  const erroMsg  = document.getElementById("erro-cep");
  const cep      = campoCep.value.replace(/\D/g, "");

  erroMsg.hidden = true;
  erroMsg.textContent = "";

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados    = await resposta.json();

    if (dados.erro) {
      erroMsg.textContent = "CEP não encontrado.";
      erroMsg.hidden = false;
      limparCamposEndereco();
      return;
    }

    document.getElementById("rua").value    = dados.logradouro || "";
    document.getElementById("bairro").value = dados.bairro     || "";
    document.getElementById("cidade").value = dados.localidade || "";
    document.getElementById("uf").value     = dados.uf         || "";

    document.getElementById("numero").focus();

  } catch (erro) {
    erroMsg.textContent = "Não foi possível buscar o CEP.";
    erroMsg.hidden = false;
  }
}

function limparCamposEndereco() {
  document.getElementById("rua").value    = "";
  document.getElementById("bairro").value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("uf").value     = "";
}