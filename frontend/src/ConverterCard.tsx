import { useConversion } from "./ConversionContext";

export function ConverterCard() {
	const {
		inputPath,
		outputFormat,
		inferredOutputFormat,
		compressionPreset,
		isConverting,
		isAdvancedMode,
		lastStatus,
		lastErrorMessage,
		lastOutputPath,
		lastSuccessWasCompression,
		predictedPath,
		videoOptionsVisible,
		audioOptionsVisible,
		imageOptionsVisible,
		selectInput,
		run,
		setOutputFormat,
		setCompressionPreset,
		setAdvancedMode,
	} = useConversion();

	const effectiveFormat = outputFormat.trim().length > 0 ? outputFormat : inferredOutputFormat;
	const isCompressionEnabled = compressionPreset !== "none";
	const canRun = inputPath.trim().length > 0 && effectiveFormat.trim().length > 0 && !isConverting;

	return (
		<section
			className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3.5 box-border"
			aria-label="Conversão"
		>
			<div className="mb-3 flex flex-col gap-1.5">
				<div className="text-[14px] font-extrabold tracking-[0.2px]">
					{isCompressionEnabled ? "Diminuir tamanho" : "Converter"}
				</div>
				<div className="text-[12px]">
					{isCompressionEnabled ? (
						<>
							Gera um novo arquivo com sufixo <span className="font-mono">-small</span> com parâmetros comuns de compressão.
						</>
					) : (
						<>
							Por padrão, o destino é sobrescrito se já existir. Se a combinação de formato/conteúdo não for válida, o log
							mostra o erro do ffmpeg.
						</>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<div className="rounded-[14px] border border-white/10 bg-black/40 px-3 py-3">
					<div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-3">
						<div className="flex min-w-0 items-center gap-2.5">
							<div
								className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-[10px] border border-white/15 bg-white/10 text-[13px] font-black"
								aria-hidden="true"
							>
								1
							</div>
							<div className="min-w-0">
								<div className="text-[13px] font-extrabold">Arquivo de entrada</div>
								<div className="mt-[2px] text-[12px] opacity-75">Imagens, vídeo ou áudio</div>
							</div>
						</div>
						<div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:justify-end lg:flex-none">
							<button
								className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[14px] font-semibold text-white/95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:border-blue-400/80 focus-visible:ring-2 focus-visible:ring-blue-500/40"
								type="button"
								onClick={selectInput}
								disabled={isConverting}
							>
								Escolher arquivo…
							</button>
						</div>
					</div>

					<div className="mt-2.5 flex flex-col gap-2 text-left">
						<input
							className="w-full box-border rounded-xl border border-white/20 bg-black/70 px-3 py-2.5 text-[12.5px] leading-tight text-white/95 outline-none focus:border-blue-400/65 focus:ring-2 focus:ring-blue-500/30 font-mono break-words placeholder:text-white/55"
							value={inputPath}
							readOnly
							placeholder="Nenhum arquivo selecionado"
						/>
					</div>
				</div>

				<div className="rounded-[14px] border border-white/10 bg-black/40 px-3 py-3">
					<div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-3">
						<div className="flex min-w-0 items-center gap-2.5">
							<div
								className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-[10px] border border-white/15 bg-white/10 text-[13px] font-black"
								aria-hidden="true"
							>
								2
							</div>
							<div className="min-w-0">
								<div className="text-[13px] font-extrabold">Formato de saída</div>
								<div className="mt-[2px] text-[12px] opacity-75">
									Define a extensão do arquivo gerado ao lado da entrada
								</div>
							</div>
						</div>
						<div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:justify-end lg:flex-none" />
					</div>

					<div className="mt-2.5 flex flex-col gap-2 text-left">
						<div className="flex items-baseline justify-between gap-2.5">
							<div className="text-[12px] font-extrabold tracking-[0.2px] opacity-95">Formato</div>
							<label className="inline-flex items-center gap-2 text-[12px] opacity-90">
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-white/40 bg-transparent text-blue-500 focus:ring-blue-500/40"
									checked={isAdvancedMode}
									onChange={(e) => setAdvancedMode(e.target.checked)}
									disabled={isConverting || outputFormat.trim() === ""}
								/>
								<span>Uso avançado</span>
							</label>
						</div>
						<select
							className="w-full box-border rounded-xl border border-white/20 bg-slate-900/95 px-3 py-2.5 text-[14px] text-slate-50 outline-none ring-0 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/35 appearance-none disabled:opacity-60"
							value={outputFormat}
							onChange={(e) => setOutputFormat(e.target.value)}
							disabled={isConverting}
						>
							<option value="">
								Automático ({inferredOutputFormat || "—"})
							</option>
							{videoOptionsVisible.length > 0 ? (
								<optgroup label="Vídeo">
									{videoOptionsVisible.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</optgroup>
							) : null}
							{audioOptionsVisible.length > 0 ? (
								<optgroup label="Áudio">
									{audioOptionsVisible.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</optgroup>
							) : null}
							{imageOptionsVisible.length > 0 ? (
								<optgroup label="Imagem">
									{imageOptionsVisible.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</optgroup>
							) : null}
						</select>
					</div>

					<div className="mt-2.5 flex flex-col gap-2 text-left">
						<div className="flex items-baseline justify-between gap-2.5">
							<div className="text-[12px] font-extrabold tracking-[0.2px] opacity-95">Compressão</div>
							<div className="text-[12px] opacity-80">Selecione um preset para ativar</div>
						</div>
						<div className="grid grid-cols-1 gap-2.5 lg:grid-cols-4">
							<button
								type="button"
								className={[
									"rounded-xl border px-3 py-2 text-[13px] font-semibold disabled:opacity-55 disabled:cursor-not-allowed",
									compressionPreset === "none"
										? "border-blue-300/70 bg-blue-500/15 text-white"
										: "border-white/15 bg-black/30 text-white/90 hover:bg-black/40",
								].join(" ")}
								onClick={() => setCompressionPreset("none")}
								disabled={isConverting}
							>
								Nenhuma
							</button>
							<button
								type="button"
								className={[
									"rounded-xl border px-3 py-2 text-[13px] font-semibold disabled:opacity-55 disabled:cursor-not-allowed",
									compressionPreset === "leve"
										? "border-blue-300/70 bg-blue-500/15 text-white"
										: "border-white/15 bg-black/30 text-white/90 hover:bg-black/40",
								].join(" ")}
								onClick={() => setCompressionPreset("leve")}
								disabled={isConverting}
							>
								Leve
							</button>
							<button
								type="button"
								className={[
									"rounded-xl border px-3 py-2 text-[13px] font-semibold disabled:opacity-55 disabled:cursor-not-allowed",
									compressionPreset === "padrao"
										? "border-blue-300/70 bg-blue-500/15 text-white"
										: "border-white/15 bg-black/30 text-white/90 hover:bg-black/40",
								].join(" ")}
								onClick={() => setCompressionPreset("padrao")}
								disabled={isConverting}
							>
								Padrão
							</button>
							<button
								type="button"
								className={[
									"rounded-xl border px-3 py-2 text-[13px] font-semibold disabled:opacity-55 disabled:cursor-not-allowed",
									compressionPreset === "agressivo"
										? "border-blue-300/70 bg-blue-500/15 text-white"
										: "border-white/15 bg-black/30 text-white/90 hover:bg-black/40",
								].join(" ")}
								onClick={() => setCompressionPreset("agressivo")}
								disabled={isConverting}
							>
								Agressivo
							</button>
						</div>
					</div>

					<div className="mt-2.5 flex flex-col gap-2 text-left">
						<div className="flex items-baseline justify-between gap-2.5">
							<div className="text-[12px] font-extrabold tracking-[0.2px] opacity-95">Saída automática</div>
						</div>
						<input
							className="w-full box-border rounded-xl border border-white/20 bg-black/70 px-3 py-2.5 text-[12.5px] leading-tight text-white/95 outline-none focus:border-blue-400/65 focus:ring-2 focus:ring-blue-500/30 font-mono break-words placeholder:text-white/55"
							value={predictedPath}
							readOnly
							placeholder="Selecione a entrada (e opcionalmente o formato) para ver o caminho completo"
						/>
					</div>
				</div>
			</div>

			{lastStatus === "success" ? (
				<div
					className="mt-3 rounded-[14px] border border-emerald-400/60 bg-emerald-500/10 px-3 py-2.5 text-[12px] leading-snug"
					role="status"
				>
					<div className="mb-1 font-black">
						{lastSuccessWasCompression ? "Arquivo reduzido com sucesso" : "Conversão concluída com sucesso"}
					</div>
					{lastOutputPath ? (
						<>
							Arquivo gerado em:{" "}
							<span className="font-mono text-[12.5px] break-words">{lastOutputPath}</span>
						</>
					) : (
						<>O ffmpeg retornou sucesso.</>
					)}
				</div>
			) : null}

			{lastStatus === "error" ? (
				<div
					className="mt-3 rounded-[14px] border border-red-400/70 bg-red-500/10 px-3 py-2.5 text-[12px] leading-snug"
					role="alert"
				>
					<div className="mb-1 font-black">Falhou</div>
					{lastErrorMessage}
				</div>
			) : null}

			<div className="mt-3 flex flex-col gap-2.5 border-t border-white/10 pt-3 lg:flex-row lg:justify-end">
				<div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:justify-end">
					<button
						className="w-full rounded-xl border border-blue-200/60 bg-gradient-to-b from-blue-500/55 to-blue-600/55 px-3 py-2 text-[14px] font-semibold text-white shadow-sm disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:border-blue-300/80 focus-visible:ring-2 focus-visible:ring-blue-400/40 lg:w-auto"
						type="button"
						onClick={run}
						disabled={!canRun}
					>
						{isConverting ? (
							<>
								<span
									className="mr-2 inline-block h-3.5 w-3.5 align-[-2px] rounded-full border-2 border-white/35 border-t-white/95 animate-spin"
									aria-hidden="true"
								/>
								{isCompressionEnabled ? "Reduzindo…" : "Convertendo…"}
							</>
						) : (
							isCompressionEnabled ? "Gerar arquivo menor" : "Converter agora"
						)}
					</button>
				</div>
			</div>
		</section>
	);
}
