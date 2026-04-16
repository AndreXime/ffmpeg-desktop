# README

## About

App Wails (Go + React/TS) para converter **imagem**, **vídeo** ou **áudio** usando `ffmpeg`.

Por padrão, a saída é salva **no mesmo diretório da entrada**, com o **mesmo nome base** e a extensão do formato escolhido.

## Requirements

- `ffmpeg` instalado e disponível no PATH
- Linux (GTK/WebKit):
  - Ubuntu 25.10+: `libwebkit2gtk-4.1-dev`
  - Ubuntu mais antigas: `libwebkit2gtk-4.0-dev` (quando disponível)
  - `libgtk-3-dev`
  - `pkg-config`

## Live Development

To run in live development mode:

```bash
cd frontend
npm install
cd ..
wails dev
```

Em distros com WebKitGTK 4.1 (ex.: Ubuntu 25.10), use:

```bash
wails dev -tags webkit2_41
```

## Building

To build a redistributable, production mode package:

```bash
wails build
```

Em distros com WebKitGTK 4.1 (ex.: Ubuntu 25.10), use:

```bash
wails build -tags webkit2_41
```

Se aparecer erro de `webkit2gtk-4.0` no `pkg-config`, instale o pacote WebKit correto para a sua versão do Ubuntu (4.0 vs 4.1) e/ou use `-tags webkit2_41`.
