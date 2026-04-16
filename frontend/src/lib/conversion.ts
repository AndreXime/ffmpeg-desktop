import type { OutputFormatOption } from "./types";

export const OUTPUT_FORMATS: ReadonlyArray<OutputFormatOption> = [
	{ value: "mp4", label: "MP4 (.mp4)", group: "Vídeo" },
	{ value: "mkv", label: "Matroska (.mkv)", group: "Vídeo" },
	{ value: "mov", label: "QuickTime (.mov)", group: "Vídeo" },
	{ value: "avi", label: "AVI (.avi)", group: "Vídeo" },
	{ value: "webm", label: "WebM (.webm)", group: "Vídeo" },

	{ value: "mp3", label: "MP3 (.mp3)", group: "Áudio" },
	{ value: "wav", label: "WAV (.wav)", group: "Áudio" },
	{ value: "flac", label: "FLAC (.flac)", group: "Áudio" },

	{ value: "png", label: "PNG (.png)", group: "Imagem" },
	{ value: "jpg", label: "JPEG (.jpg)", group: "Imagem" },
	{ value: "jpeg", label: "JPEG (.jpeg)", group: "Imagem" },
	{ value: "webp", label: "WebP (.webp)", group: "Imagem" },
	{ value: "bmp", label: "BMP (.bmp)", group: "Imagem" },
	{ value: "tiff", label: "TIFF (.tiff)", group: "Imagem" },
	{ value: "gif", label: "GIF (.gif)", group: "Imagem" },
] as const;

function basenamePosix(path: string): string {
	const trimmed = path.trim();
	if (!trimmed) return "";
	const parts = trimmed.split("/");
	return parts[parts.length - 1] ?? "";
}

function dirnamePosix(path: string): string {
	const trimmed = path.trim();
	if (!trimmed) return "";
	const idx = trimmed.lastIndexOf("/");
	if (idx <= 0) return ".";
	return trimmed.slice(0, idx);
}

function stripKnownExtension(fileName: string): string {
	const base = fileName;
	if (!base || base === ".") return base;

	const lower = base.toLowerCase();
	for (const ext of [".tar.gz", ".tar.bz2", ".tar.xz"] as const) {
		if (lower.endsWith(ext)) return base.slice(0, base.length - ext.length);
	}

	const dot = base.lastIndexOf(".");
	if (dot <= 0) return base;
	return base.slice(0, dot);
}

function joinPosix(dir: string, name: string): string {
	if (!dir || dir === ".") return name;
	return `${dir.replace(/\/+$/, "")}/${name}`;
}

export function predictedOutputPath(inputPath: string, outputFormat: string): string {
	const cleanInput = inputPath.trim();
	const format = outputFormat.trim().replace(/^\./, "").toLowerCase();
	if (!cleanInput || !format) return "";

	const base = basenamePosix(cleanInput);
	if (!base) return "";

	const dir = dirnamePosix(cleanInput);
	const stem = stripKnownExtension(base);
	return joinPosix(dir, `${stem}.${format}`);
}

function detectExtensionFromInputPath(path: string): string | undefined {
	const base = basenamePosix(path);
	if (!base) return undefined;
	const dot = base.lastIndexOf(".");
	if (dot <= 0 || dot === base.length - 1) return undefined;
	return base.slice(dot + 1).toLowerCase();
}

export function inferOutputFormatFromInputPath(inputPath: string): OutputFormatOption["value"] {
	const ext = detectExtensionFromInputPath(inputPath);
	if (ext) {
		const match = OUTPUT_FORMATS.find((f) => f.value.toLowerCase() === ext);
		if (match) return match.value;
	}

	const group = detectGroupFromInputPath(inputPath);
	if (group === "Áudio") return "mp3";
	if (group === "Imagem") return "webp";
	return "mp4";
}

export function predictedConvertedOutputPath(inputPath: string, outputFormat: string): string {
	const cleanInput = inputPath.trim();
	const format = outputFormat.trim().replace(/^\./, "").toLowerCase();
	if (!cleanInput || !format) return "";

	const base = basenamePosix(cleanInput);
	if (!base) return "";

	const dir = dirnamePosix(cleanInput);
	const stem = stripKnownExtension(base);
	const inputExt = detectExtensionFromInputPath(cleanInput);
	const outStem = inputExt && inputExt.toLowerCase() === format ? `${stem}-converted` : stem;
	return joinPosix(dir, `${outStem}.${format}`);
}

export function predictedCompressedOutputPath(inputPath: string, outputFormatOverride?: string): string {
	const cleanInput = inputPath.trim();
	if (!cleanInput) return "";

	const base = basenamePosix(cleanInput);
	if (!base) return "";

	const dir = dirnamePosix(cleanInput);
	const stem = stripKnownExtension(base);
	const format = outputFormatOverride?.trim()
		? outputFormatOverride.trim().replace(/^\./, "").toLowerCase()
		: inferOutputFormatFromInputPath(cleanInput);
	return joinPosix(dir, `${stem}-small.${format}`);
}

export function detectGroupFromInputPath(path: string): OutputFormatOption["group"] | undefined {
	const base = basenamePosix(path);
	if (!base) return undefined;

	const dot = base.lastIndexOf(".");
	if (dot <= 0 || dot === base.length - 1) return undefined;

	const ext = base.slice(dot + 1).toLowerCase();
	const match = OUTPUT_FORMATS.find((f) => f.value.toLowerCase() === ext);
	return match?.group;
}
