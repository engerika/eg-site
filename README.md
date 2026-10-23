# EG Engenharia e Construção — site institucional

Site estático de `egenharia.com.br`, publicado pelo GitHub Pages. Substitui o
tema WordPress [`eg-tema-erika-barros`](https://github.com/engerika/eg-tema-erika-barros),
que rodava na VPS: mesmo conteúdo e mesmo visual, sem servidor, sem banco e sem
assinatura.

## Arquivos

- `index.html` — a página inteira. O conteúdo editável está marcado com
  `<!-- EDITAR -->`: números do hero, texto do "Sobre", etapas, links da Área
  do Cliente, parcerias.
- `style.css` — visual, com os tokens de `projetodesign/tokens.css` (Preset A).
- `site.js` — abertura, menu, revelação no scroll e vídeo do hero. Sem dependências.
- `assets/img/`, `assets/video/` — fotos e vídeo (lista abaixo).
- `assets/marca/` — símbolo e logotipo oficiais.
- `CNAME` — domínio próprio do GitHub Pages. Não apagar.

## Imagens e vídeo

Enquanto um arquivo não existe, o lugar dele mostra um degradê da marca.
Basta salvar com o nome certo; não precisa mexer no código.

| Arquivo | Onde aparece | Formato |
|---|---|---|
| `assets/img/hero.jpg` | fundo do topo | horizontal, ≥ 2400 px de largura |
| `assets/video/hero.mp4` | por cima do fundo, em loop | sem som, 10–20 s, até ~6 MB |
| `assets/img/servico-reforma.jpg` | cartão Reforma | vertical 4:5 |
| `assets/img/servico-projeto.jpg` | cartão Projeto | vertical 4:5 |
| `assets/img/servico-obra.jpg` | cartão Obra | vertical 4:5 |
| `assets/img/servico-credito.jpg` | cartão Crédito | vertical 4:5 |
| `assets/img/sobre.jpg` | bloco Sobre | vertical 4:5 |

JPG até ~400 KB cada (o GitHub Pages não comprime). O vídeo não carrega para
quem pediu menos movimento ou economia de dados no aparelho.

## Publicar uma alteração

Editar, fazer commit e push no `main`. O GitHub Pages publica sozinho em
cerca de um minuto.

## Ver antes de publicar

```bash
python3 -m http.server 8000
```

e abrir `http://localhost:8000`.
