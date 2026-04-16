declare module "../wailsjs/go/main/App" {
	import type { main } from "../wailsjs/go/models";

	export function Compress(arg1: main.CompressRequest): Promise<main.ConvertResult>;
	export function Convert(arg1: main.ConvertRequest): Promise<main.ConvertResult>;
	export function SelectInputFile(): Promise<string>;
}

