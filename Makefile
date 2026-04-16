.PHONY: help install install-frontend generate dev dev-webkit41 build build-webkit41 frontend-dev frontend-build clean run
APP_NAME := ffmpeg-ui

help:
	@printf "%s\n" \
	"Uso: make <alvo>" \
	"" \
	"Alvos:" \
	"  install            Instala deps (frontend)" \
	"  generate           Gera bindings Wails (wailsjs)" \
	"  dev                Roda em modo dev (Wails)" \
	"  dev-webkit41       Dev com WebKitGTK 4.1 (Ubuntu 25.10+)" \
	"  build              Build production (Wails)" \
	"  build-webkit41     Build production com WebKitGTK 4.1" \
	"  frontend-dev       Dev server do Vite (sem app desktop)" \
	"  frontend-build     Build do frontend (Vite)" \
	"  run                Executa binário gerado (build/bin/$(APP_NAME))" \
	"  clean              Remove build do frontend e binários"

install: install-frontend

install-frontend:
	cd frontend && npm install

generate:
	wails generate module

dev:
	wails dev

dev-webkit41:
	wails dev -tags webkit2_41

build:
	wails build

build-webkit41:
	wails build -tags webkit2_41

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

run:
	./build/bin/$(APP_NAME)

clean:
	rm -rf frontend/dist build/bin
