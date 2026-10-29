# Obscura — modelo cinematográfico (em desenvolvimento)

Segundo modelo de site de tatuagem. Estúdio **fictício** em Manchester. Ainda não é para publicar.

## A ideia

O site é tratado como um filme:

- **Abertura:** ecrã preto, "Obscura apresenta", as barras de letterbox afastam-se e a foto entra com um zoom lento. Clicar ou tocar salta a intro; na mesma visita não se repete.
- **Timecode e cena:** em baixo corre um timecode (o "filme" dura 3:24) e o nome da cena atual.
- **Manifesto:** as palavras acendem à medida que se desce.
- **Bobina:** o portfólio é uma película com perfurações. No computador a secção fica presa e corre na horizontal com o scroll; no telemóvel arrasta-se.
- **Estilos:** no computador a foto aparece a seguir o rato.
- **Focus pull:** as fotos entram desfocadas e ganham nitidez.
- **Créditos finais** no rodapé e botão **Rebobinar**, que volta ao início e repete a abertura.
- Grão de película e vinheta por cima de tudo.

Quem tem "reduzir movimento" ativo no telemóvel/computador vê tudo estático.

## Ver no computador

```bash
cd cinematico
python3 -m http.server 4175
# abrir http://localhost:4175
```

## Antes de usar com um cliente

- As fotos foram recortadas de uma imagem de referência e ampliadas, por isso têm pouca resolução. Substituir por fotos reais em alta resolução (mínimo 1600 px no lado maior).
- Trocar nomes, morada, telefone, preços e artistas.
- Ligar o formulário (`data-endpoint` no `<form>`), apagar a linha `noindex`.
