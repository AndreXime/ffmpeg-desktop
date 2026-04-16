package main

import (
	"context"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type ConvertRequest struct {
	InputPath    string `json:"inputPath"`
	OutputFormat string `json:"outputFormat"`
	OutputPath   string `json:"outputPath"`
}

type ConvertResult struct {
	Command    string `json:"command"`
	OutputPath string `json:"outputPath"`
	OutputText string `json:"outputText"`
}

type CompressRequest struct {
	InputPath     string `json:"inputPath"`
	OutputFormat  string `json:"outputFormat"`
	OutputPath    string `json:"outputPath"`
	QualityPreset string `json:"qualityPreset"` // "leve" | "padrao" | "agressivo"
}

func inputFileFilters() []runtime.FileFilter {
	imageExts := []string{"png", "jpg", "jpeg", "jfif", "webp", "gif", "bmp", "tif", "tiff", "heic", "heif", "avif"}
	videoExts := []string{"mp4", "mkv", "mov", "avi", "webm", "m4v", "wmv", "flv", "mpeg", "mpg", "3gp"}
	audioExts := []string{"mp3", "wav", "aac", "m4a", "flac", "ogg", "opus", "wma"}

	pattern := func(exts []string) string {
		parts := make([]string, 0, len(exts))
		for _, ext := range exts {
			parts = append(parts, "*."+ext)
		}
		return strings.Join(parts, ";")
	}

	return []runtime.FileFilter{
		{DisplayName: "Imagens", Pattern: pattern(imageExts)},
		{DisplayName: "Vídeo", Pattern: pattern(videoExts)},
		{DisplayName: "Áudio", Pattern: pattern(audioExts)},
		{DisplayName: "Todos os arquivos", Pattern: "*.*"},
	}
}

func (a *App) SelectInputFile() (string, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:   "Selecione o arquivo de entrada",
		Filters: inputFileFilters(),
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil
	}
	return filepath.Clean(path), nil
}

func stripKnownExtension(fileName string) string {
	base := fileName
	if base == "" || base == "." {
		return base
	}

	lower := strings.ToLower(base)
	for _, ext := range []string{
		".tar.gz", ".tar.bz2", ".tar.xz",
	} {
		if strings.HasSuffix(lower, ext) {
			return base[:len(base)-len(ext)]
		}
	}

	ext := filepath.Ext(base)
	if ext == "" {
		return base
	}
	return strings.TrimSuffix(base, ext)
}

func resolveOutputPath(request ConvertRequest) (string, error) {
	legacy := strings.TrimSpace(request.OutputPath)
	if legacy != "" {
		return filepath.Clean(legacy), nil
	}

	format := strings.ToLower(strings.TrimSpace(strings.TrimPrefix(request.OutputFormat, ".")))
	if format == "" {
		return "", errors.New("outputFormat é obrigatório")
	}

	inputPath := filepath.Clean(strings.TrimSpace(request.InputPath))
	if inputPath == "" {
		return "", errors.New("inputPath é obrigatório")
	}

	dir := filepath.Dir(inputPath)
	base := filepath.Base(inputPath)
	stem := stripKnownExtension(base)
	outName := stem + "." + format
	return filepath.Join(dir, outName), nil
}

func resolveCompressedOutputPath(request CompressRequest) (string, error) {
	legacy := strings.TrimSpace(request.OutputPath)
	if legacy != "" {
		return filepath.Clean(legacy), nil
	}

	format := strings.ToLower(strings.TrimSpace(strings.TrimPrefix(request.OutputFormat, ".")))
	if format == "" {
		return "", errors.New("outputFormat é obrigatório")
	}

	inputPath := filepath.Clean(strings.TrimSpace(request.InputPath))
	if inputPath == "" {
		return "", errors.New("inputPath é obrigatório")
	}

	dir := filepath.Dir(inputPath)
	base := filepath.Base(inputPath)
	stem := stripKnownExtension(base)
	outName := stem + "-small." + format
	return filepath.Join(dir, outName), nil
}

func (a *App) Convert(request ConvertRequest) (ConvertResult, error) {
	inputPath := filepath.Clean(strings.TrimSpace(request.InputPath))
	outputPath, err := resolveOutputPath(request)
	if err != nil {
		return ConvertResult{}, err
	}
	outputPath = filepath.Clean(outputPath)

	if inputPath == "" {
		return ConvertResult{}, errors.New("inputPath é obrigatório")
	}

	if stat, err := os.Stat(inputPath); err != nil {
		return ConvertResult{}, err
	} else if stat.IsDir() {
		return ConvertResult{}, errors.New("inputPath deve ser um arquivo, não uma pasta")
	}

	outputDir := filepath.Dir(outputPath)
	if stat, err := os.Stat(outputDir); err != nil {
		return ConvertResult{}, err
	} else if !stat.IsDir() {
		return ConvertResult{}, errors.New("diretório de saída inválido")
	}

	args := []string{
		"-hide_banner",
		"-y",
		"-i", inputPath,
	}

	// Para saídas de imagem estática via muxer `image2`, o ffmpeg costuma avisar
	// (e às vezes falhar) se não houver padrão de sequência (%03d) ou `-update`.
	outputExt := strings.ToLower(strings.TrimPrefix(filepath.Ext(outputPath), "."))
	switch outputExt {
	case "png", "jpg", "jpeg", "jfif", "bmp", "tif", "tiff":
		args = append(args, "-frames:v", "1", "-update", "1")
	}

	args = append(args, outputPath)

	cmd := exec.CommandContext(a.ctx, "ffmpeg", args...)
	out, err := cmd.CombinedOutput()
	outputText := strings.TrimSpace(string(out))

	commandPreview := "ffmpeg " + strings.Join(args, " ")
	if err != nil {
		return ConvertResult{
			Command:    commandPreview,
			OutputPath: outputPath,
			OutputText: outputText,
		}, err
	}

	return ConvertResult{
		Command:    commandPreview,
		OutputPath: outputPath,
		OutputText: outputText,
	}, nil
}

func (a *App) Compress(request CompressRequest) (ConvertResult, error) {
	inputPath := filepath.Clean(strings.TrimSpace(request.InputPath))
	outputPath, err := resolveCompressedOutputPath(request)
	if err != nil {
		return ConvertResult{}, err
	}
	outputPath = filepath.Clean(outputPath)

	if inputPath == "" {
		return ConvertResult{}, errors.New("inputPath é obrigatório")
	}

	if stat, err := os.Stat(inputPath); err != nil {
		return ConvertResult{}, err
	} else if stat.IsDir() {
		return ConvertResult{}, errors.New("inputPath deve ser um arquivo, não uma pasta")
	}

	outputDir := filepath.Dir(outputPath)
	if stat, err := os.Stat(outputDir); err != nil {
		return ConvertResult{}, err
	} else if !stat.IsDir() {
		return ConvertResult{}, errors.New("diretório de saída inválido")
	}

	preset := strings.ToLower(strings.TrimSpace(request.QualityPreset))
	if preset == "" {
		preset = "padrao"
	}

	args := []string{
		"-hide_banner",
		"-y",
		"-i", inputPath,
	}

	outputExt := strings.ToLower(strings.TrimPrefix(filepath.Ext(outputPath), "."))

	switch outputExt {
	case "mp4", "mkv", "mov", "avi":
		crf := "28"
		ffPreset := "medium"
		audioBitrate := "128k"
		switch preset {
		case "leve":
			crf = "23"
			ffPreset = "slow"
			audioBitrate = "160k"
		case "agressivo":
			crf = "32"
			ffPreset = "veryfast"
			audioBitrate = "96k"
		}
		args = append(args,
			"-c:v", "libx264",
			"-preset", ffPreset,
			"-crf", crf,
			"-c:a", "aac",
			"-b:a", audioBitrate,
			"-movflags", "+faststart",
		)
	case "webm":
		crf := "34"
		cpuUsed := "4"
		audioBitrate := "96k"
		switch preset {
		case "leve":
			crf = "28"
			cpuUsed = "2"
			audioBitrate = "128k"
		case "agressivo":
			crf = "38"
			cpuUsed = "6"
			audioBitrate = "64k"
		}
		args = append(args,
			"-c:v", "libvpx-vp9",
			"-crf", crf,
			"-b:v", "0",
			"-cpu-used", cpuUsed,
			"-row-mt", "1",
			"-c:a", "libopus",
			"-b:a", audioBitrate,
		)
	case "mp3":
		bitrate := "160k"
		switch preset {
		case "leve":
			bitrate = "192k"
		case "agressivo":
			bitrate = "96k"
		}
		args = append(args, "-vn", "-c:a", "libmp3lame", "-b:a", bitrate)
	case "wav", "flac":
		args = append(args, "-vn")
	case "jpg", "jpeg":
		quality := "4"
		switch preset {
		case "leve":
			quality = "2"
		case "agressivo":
			quality = "8"
		}
		args = append(args, "-frames:v", "1", "-q:v", quality)
	case "png":
		args = append(args, "-frames:v", "1", "-update", "1")
	case "webp":
		q := "70"
		switch preset {
		case "leve":
			q = "82"
		case "agressivo":
			q = "55"
		}
		args = append(args, "-frames:v", "1", "-q:v", q)
	default:
		// fallback: tenta re-encode com defaults do ffmpeg
	}

	args = append(args, outputPath)

	cmd := exec.CommandContext(a.ctx, "ffmpeg", args...)
	out, err := cmd.CombinedOutput()
	outputText := strings.TrimSpace(string(out))
	commandPreview := "ffmpeg " + strings.Join(args, " ")
	if err != nil {
		return ConvertResult{
			Command:    commandPreview,
			OutputPath: outputPath,
			OutputText: outputText,
		}, err
	}

	return ConvertResult{
		Command:    commandPreview,
		OutputPath: outputPath,
		OutputText: outputText,
	}, nil
}
