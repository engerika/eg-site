# EG Engenharia e Construção — site institucional

Site estático de `egenharia.com.br`, publicado pelo GitHub Pages. Substitui o
tema WordPress [`eg-tema-erika-barros`](https://github.com/engerika/eg-tema-erika-barros),
que rodava na VPS: mesmo conteúdo e mesmo visual, sem servidor, sem banco e sem
assinatura.

## Arquivos

- `index.html` — a página inteira. O conteúdo editável está marcado com
  `<!-- EDITAR -->`: texto do "Sobre", links da Área do Cliente, parcerias,
  redes sociais.
- `style.css` — visual (o mesmo do tema WordPress).
- `assets/marca/` — símbolo e logotipo oficiais.
- `CNAME` — domínio próprio do GitHub Pages. Não apagar.

## Publicar uma alteração

Editar, fazer commit e push no `main`. O GitHub Pages publica sozinho em
cerca de um minuto.

## Ver antes de publicar

```bash
python3 -m http.server 8000
```

e abrir `http://localhost:8000`.
