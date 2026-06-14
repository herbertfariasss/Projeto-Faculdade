// Aplica a máscara "000.000.000-00" enquanto digita
function mascaraCpf(input) {
  let v = input.value.replace(/\D/g, "");

  if (v.length > 3)  v = v.slice(0, 3) + "." + v.slice(3);
  if (v.length > 7)  v = v.slice(0, 7) + "." + v.slice(7);
  if (v.length > 11) v = v.slice(0, 11) + "-" + v.slice(11, 13);

  input.value = v;

  // Valida quando terminar de digitar os 11 dígitos
  const erroMsg = document.getElementById("erro-cpf");
  const digits  = input.value.replace(/\D/g, "");

  if (digits.length === 11) {
    if (!validarCpf(digits)) {
      erroMsg.textContent = "CPF inválido.";
      erroMsg.hidden = false;
    } else {
      erroMsg.hidden = true;
    }
  } else {
    erroMsg.hidden = true;
  }
}

function validarCpf(cpf) {
  // Rejeita sequências iguais: 000.000.000-00, 111.111.111-11, etc.
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcula o 1º dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  // Calcula o 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}