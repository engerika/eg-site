# Política de segurança

Este repositório é o código do site institucional da **EG Engenharia**,
publicado em [egenharia.com.br](https://egenharia.com.br) pelo GitHub
Pages.

## Versão coberta

Só a versão **no ar**, que é sempre a do branch `main`. Não há versões
antigas mantidas.

## O que é coberto

- O código deste repositório: HTML, CSS e JavaScript do site.
- A configuração de publicação: domínio (`CNAME`), HTTPS e o que for
  servido a partir deste repositório.
- O formulário de contato. Hoje ele **não envia dados a servidor
  nenhum**: abre o programa de e-mail de quem visita, já preenchido.
  Qualquer forma de fazê-lo enviar dados para outro lugar é falha.
- Conteúdo de terceiros carregado pela página (fontes do Google Fonts),
  no que depender de como o site os carrega.

## O que não é coberto

- A infraestrutura do GitHub Pages e do Google Fonts — relate direto a
  essas empresas.
- Ausência de cabeçalhos HTTP de segurança que o GitHub Pages não deixa
  configurar.
- Ataques de negação de serviço, spam, engenharia social ou acesso físico.
- Relatórios gerados só por ferramenta automática, sem um caso que
  mostre o problema.

Os demais sistemas da EG (portal do cliente, aplicativo) **não estão
neste repositório**. Se encontrar algo neles, use o mesmo canal abaixo —
o relato será encaminhado.

## Como relatar uma vulnerabilidade

**Não abra issue pública.** Use um destes canais, que são privados:

1. **GitHub** — aba [Security](https://github.com/engerika/eg-site/security)
   deste repositório → **Report a vulnerability**. É o canal preferido.
2. **E-mail** — contato@erikabarros.com, com o assunto
   "Segurança — egenharia.com.br".

Inclua, se puder:

- o que encontrou e onde (endereço da página, arquivo, linha);
- o passo a passo para reproduzir;
- o que alguém conseguiria fazer explorando a falha;
- seu nome ou apelido, se quiser crédito.

## O que esperar

- **Confirmação de recebimento** em até 5 dias úteis.
- Uma avaliação inicial, dizendo se a falha foi confirmada, em até
  15 dias úteis.
- Aviso quando a correção for publicada. Com sua autorização, você é
  creditado no histórico da correção.

Pedimos que não divulgue a falha antes da correção nem acesse,
altere ou apague dados de outras pessoas ao testar. Não há programa de
recompensa em dinheiro.
