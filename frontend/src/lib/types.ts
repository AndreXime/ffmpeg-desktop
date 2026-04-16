export type LastRunStatus = "idle" | "success" | "error";

export type CompressPreset = "leve" | "padrao" | "agressivo";
export type CompressPresetSelection = "none" | CompressPreset;

export interface OutputFormatOption {
	readonly value: string;
	readonly label: string;
	readonly group: "Vídeo" | "Áudio" | "Imagem";
}
