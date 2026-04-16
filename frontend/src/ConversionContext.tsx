import { createContext, useContext } from "react";
import type { CompressPresetSelection, LastRunStatus, OutputFormatOption } from "./lib/types";

export interface ConversionContextValue {
	readonly inputPath: string;
	readonly outputFormat: string;
	readonly compressionPreset: CompressPresetSelection;
	readonly inferredOutputFormat: string;
	readonly isConverting: boolean;
	readonly isAdvancedMode: boolean;
	readonly lastStatus: LastRunStatus;
	readonly lastErrorMessage: string;
	readonly lastOutputPath: string;
	readonly lastSuccessWasCompression: boolean;
	readonly predictedPath: string;
	readonly logText: string;
	readonly videoOptionsVisible: ReadonlyArray<OutputFormatOption>;
	readonly audioOptionsVisible: ReadonlyArray<OutputFormatOption>;
	readonly imageOptionsVisible: ReadonlyArray<OutputFormatOption>;
	selectInput: () => void | Promise<void>;
	run: () => void | Promise<void>;
	setOutputFormat: (format: string) => void;
	setCompressionPreset: (preset: CompressPresetSelection) => void;
	setAdvancedMode: (isAdvanced: boolean) => void;
	copyLog: () => void | Promise<void>;
	clearLog: () => void;
}

export const ConversionContext = createContext<ConversionContextValue | undefined>(undefined);

export function useConversion(): ConversionContextValue {
	const ctx = useContext(ConversionContext);
	if (!ctx) {
		throw new Error("useConversion deve ser usado dentro de ConversionContext.Provider");
	}
	return ctx;
}
