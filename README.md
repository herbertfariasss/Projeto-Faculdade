# 📚 Projeto Faculdade

Projeto desenvolvido durante o primeiro semestre de Análise e Desenvolvimento de Sistemas na UNISUAM.

O objetivo deste projeto foi praticar conceitos de desenvolvimento web utilizando HTML, CSS e JavaScript, aplicando estruturação de páginas, estilização e interatividade.

## 🚀 Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Git e GitHub

## 🧭 Arquitetura atual

- `/index.html`: landing page, menu e entrada para cursos.
- `/inscricao/*.html`: autenticação e perfil do usuário.
- `/cursos/*.html` e `/cursos/aulas/*.html`: trilhas e páginas de aulas.
- `/css`: estilos globais da home e componentes visuais.
- `/js`: scripts globais (rolagem, interação da home e footer reutilizável).
- `/inscricao/auth.js`: autenticação e sessão local para fins didáticos.
- `/legal`: páginas de Termos de Uso e Política de Privacidade.

## 🔐 Segurança e privacidade

> **Importante:** este projeto ainda é estático e client-side para aprendizado.

Melhorias aplicadas:

- Senhas não ficam mais em texto puro: são armazenadas com hash SHA-256.
- Sessão passou a usar objeto com expiração (`authSession`) em vez de token simples.
- CPF é validado no cadastro, mas não é persistido no armazenamento local.
- Cadastro exige aceite de Termos de Uso e Política de Privacidade.

Para ambiente real, ainda é necessário migrar autenticação para backend com banco de dados e sessão/token no servidor.

## ♻️ Reuso e manutenção

- O rodapé foi centralizado no script `js/footer.js` e injetado nas páginas.
- Scripts inline foram removidos em favor de arquivos dedicados.
- Interações com clique foram migradas de `onclick` inline para `addEventListener`.

## ✅ Qualidade de código

Comandos de validação:

```bash
npm install
npm run lint
npm run format:check
```

## 🔄 Fluxo sugerido de manutenção

1. Criar branch para cada melhoria.
2. Fazer alterações pequenas e testáveis.
3. Rodar lint e validação de formatação.
4. Revisar acessibilidade básica (teclado/foco/labels).
5. Abrir PR com resumo técnico da mudança.

## 🌐 Site publicado (GitHub Pages)

**URL correta:** https://herbertfariasss.github.io/Projeto-Faculdade/

> Use sempre o link com `/Projeto-Faculdade/` no final. Abrir só `herbertfariasss.github.io` (sem o nome do repositório) gera erro 404.
