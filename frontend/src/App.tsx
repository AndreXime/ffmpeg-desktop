import { useEffect, useMemo, useState } from "react";
import { Convert, SelectInputFile } from "../wailsjs/go/main/App";
import { ConversionContext } from "./ConversionContext";
import { ConverterCard } from "./ConverterCard";
import { LogPanel } from "./LogPanel";
import {
	detectGroupFromInputPath,
	inferOutputFormatFromInputPath,
	OUTPUT_FORMATS,
	predictedCompressedOutputPath,
	predictedConvertedOutputPath,
} from "./lib/conversion";
import type { CompressPresetSelection, LastRunStatus } from "./lib/types";
import type { main } from "../wailsjs/go/models";

function getWailsCompress(): ((req: main.CompressRequest) => Promise<main.ConvertResult>) | undefined {
	const w = window as unknown;
	if (typeof w !== "object" || w === null) return undefined;

	const go = (w as { readonly go?: unknown }).go;
	if (typeof go !== "object" || go === null) return undefined;

	const mainNs = (go as { readonly main?: unknown }).main;
	if (typeof mainNs !== "object" || mainNs === null) return undefined;

	const app = (mainNs as { readonly App?: unknown }).App;
	if (typeof app !== "object" || app === null) return undefined;

	const compress = (app as { readonly Compress?: unknown }).Compress;
	if (typeof compress !== "function") return undefined;

	return compress as (req: main.CompressRequest) => Promise<main.ConvertResult>;
}

function App() {
	const [inputPath, setInputPath] = useState<string>("");
	const [outputFormat, setOutputFormat] = useState<string>("");
	const [compressionPreset, setCompressionPreset] = useState<CompressPresetSelection>("none");
	const [isConverting, setIsConverting] = useState(false);
	const [logText, setLogText] = useState<string>("");
	const [lastStatus, setLastStatus] = useState<LastRunStatus>("idle");
	const [lastErrorMessage, setLastErrorMessage] = useState<string>("");
	const [lastOutputPath, setLastOutputPath] = useState<string>("");
	const [lastSuccessWasCompression, setLastSuccessWasCompression] = useState(false);
	const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
	const [showLog, setShowLog] = useState<boolean>(false);

	const inferredOutputFormat = useMemo(() => inferOutputFormatFromInputPath(inputPath), [inputPath]);
	const effectiveOutputFormat = outputFormat.trim().length > 0 ? outputFormat : inferredOutputFormat;
	const isCompressionEnabled = compressionPreset !== "none";

	const predictedPath = useMemo(() => {
		if (isCompressionEnabled) return predictedCompressedOutputPath(inputPath, effectiveOutputFormat);
		return predictedConvertedOutputPath(inputPath, effectiveOutputFormat);
	}, [inputPath, effectiveOutputFormat, isCompressionEnabled]);

	function resetRunState() {
		setLastStatus("idle");
		setLastErrorMessage("");
		setLastOutputPath("");
		setLastSuccessWasCompression(false);
	}

	function resetFormFields() {
		setOutputFormat("");
		setCompressionPreset("none");
		setLogText("");
		resetRunState();
		setIsAdvancedMode(false);
	}

	function clearInputsAfterSuccess() {
		setInputPath("");
		setOutputFormat("");
		setCompressionPreset("none");
		setLogText("");
		setIsAdvancedMode(false);
	}

	async function chooseInput() {
		try {
			const selected = await SelectInputFile();
			if (!selected) return;
			setInputPath(selected);
			resetFormFields();
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setLastStatus("error");
			setLastErrorMessage(message);
		}
	}

	async function run() {
		const hasInput = inputPath.trim().length > 0;
		const hasFormat = effectiveOutputFormat.trim().length > 0;
		const canRun = hasInput && hasFormat && !isConverting;
		if (!canRun) return;

		setIsConverting(true);
		setLogText(isCompressionEnabled ? "Reduzindo..." : "Convertendo...");
		resetRunState();

		try {
			if (isCompressionEnabled) {
				const compressFn = getWailsCompress();
				if (!compressFn) {
					setLastStatus("error");
					setLastErrorMessage("Função de compressão não está disponível no runtime.");
					return;
				}

				const result = await compressFn({
					inputPath,
					outputFormat: effectiveOutputFormat,
					outputPath: "",
					qualityPreset: compressionPreset,
				});

				const outPath = (result.outputPath ?? "").trim();
				setLastOutputPath(outPath);

				const header = result?.command ? `${result.command}\n\n` : "";
				setLogText(`${header}${result.outputText ?? ""}`.trim());
				setLastSuccessWasCompression(true);
				setLastStatus("success");
				clearInputsAfterSuccess();
				return;
			}

			const result = await Convert({
				inputPath,
				outputFormat: effectiveOutputFormat,
				outputPath: predictedConvertedOutputPath(inputPath, effectiveOutputFormat),
			});

			const outPath = (result.outputPath ?? "").trim();
			setLastOutputPath(outPath);

			const header = result?.command ? `${result.command}\n\n` : "";
			setLogText(`${header}${result.outputText ?? ""}`.trim());
			setLastSuccessWasCompression(false);
			setLastStatus("success");
			clearInputsAfterSuccess();
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setLastStatus("error");
			setLastErrorMessage(message);
			setLogText((prev) => `${prev}\n\nERRO: ${message}`.trim());
		} finally {
			setIsConverting(false);
		}
	}

	async function copyLog() {
		if (!logText) return;
		try {
			await navigator.clipboard.writeText(logText);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setLastStatus("error");
			setLastErrorMessage(`Não foi possível copiar o log: ${message}`);
		}
	}

	const videoOptions = OUTPUT_FORMATS.filter((f) => f.group === "Vídeo");
	const audioOptions = OUTPUT_FORMATS.filter((f) => f.group === "Áudio");
	const imageOptions = OUTPUT_FORMATS.filter((f) => f.group === "Imagem");

	const inputGroup = useMemo(() => detectGroupFromInputPath(inputPath), [inputPath]);

	const { videoOptionsVisible, audioOptionsVisible, imageOptionsVisible } = useMemo(() => {
		if (!isAdvancedMode && inputGroup) {
			return {
				videoOptionsVisible: inputGroup === "Vídeo" ? videoOptions : [],
				audioOptionsVisible: inputGroup === "Áudio" ? audioOptions : [],
				imageOptionsVisible: inputGroup === "Imagem" ? imageOptions : [],
			};
		}

		return {
			videoOptionsVisible: videoOptions,
			audioOptionsVisible: audioOptions,
			imageOptionsVisible: imageOptions,
		};
	}, [isAdvancedMode, inputGroup, videoOptions, audioOptions, imageOptions]);

	useEffect(() => {
		if (isAdvancedMode) return;
		if (!inputGroup) return;

		const allowedOptions = inputGroup === "Vídeo" ? videoOptions : inputGroup === "Áudio" ? audioOptions : imageOptions;
		const currentIsAllowed = allowedOptions.some((opt) => opt.value === outputFormat);

		if (!currentIsAllowed && allowedOptions.length > 0) {
			if (outputFormat.trim() === "") return;
			setOutputFormat(allowedOptions[0]?.value ?? outputFormat);
		}
	}, [isAdvancedMode, inputGroup, videoOptions, audioOptions, imageOptions, outputFormat]);

	return (
		<ConversionContext.Provider
			value={{
				inputPath,
				outputFormat,
				compressionPreset,
				inferredOutputFormat,
				isConverting,
				isAdvancedMode,
				lastStatus,
				lastErrorMessage,
				lastOutputPath,
				lastSuccessWasCompression,
				predictedPath,
				logText,
				videoOptionsVisible,
				audioOptionsVisible,
				imageOptionsVisible,
				selectInput: chooseInput,
				run,
				setOutputFormat: (format: string) => {
					setOutputFormat(format);
					resetRunState();
				},
				setCompressionPreset: (preset: CompressPresetSelection) => {
					setCompressionPreset(preset);
					resetRunState();
				},
				setAdvancedMode: (advanced: boolean) => {
					setIsAdvancedMode(advanced);
					resetRunState();
				},
				copyLog,
				clearLog: () => setLogText(""),
			}}
		>
			<div
				id="App"
				className="min-h-screen flex flex-col items-center gap-4 px-4 pb-11 pt-6 text-white/90 bg-slate-900"
			>
				<div className="w-full max-w-[980px] flex flex-col gap-3.5">
					<div className="flex flex-col gap-3.5 rounded-2xl border border-white/10 bg-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] p-3.5">
						<div className="flex flex-col gap-3">
							<div className="flex flex-col gap-1.5 min-w-0">
								<div className="text-[22px] font-extrabold tracking-[0.2px]">ffmpeg-ui</div>
								<p className="max-w-[62ch] text-[13px] opacity-90">
									Interface simples para conversões com ffmpeg, com foco em saídas previsíveis e logs claros.
								</p>
							</div>

							<div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
								<div className="flex w-full justify-end lg:w-auto">
									<label className="inline-flex items-center gap-2 text-[13px]">
										<input
											type="checkbox"
											className="h-4 w-4 rounded border-white/40 bg-transparent text-blue-500 focus:ring-blue-500/40"
											checked={showLog}
											onChange={(e) => setShowLog(e.target.checked)}
											disabled={isConverting}
										/>
										<span>Mostrar log</span>
									</label>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-3.5 lg:flex-row lg:items-stretch">
						<div className="flex-1 min-w-0">
							<ConverterCard />
						</div>

						{showLog ? (
							<aside className="lg:flex-[0_0_360px] lg:min-w-0">
								<LogPanel />
							</aside>
						) : null}
					</div>
				</div>
			</div>
		</ConversionContext.Provider>
	);
}

export default App;
