import { useConversion } from "./ConversionContext";

export function LogPanel() {
	const { logText, isConverting, copyLog, clearLog } = useConversion();

	return (
		<section
			className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3.5 box-border"
			aria-label="Log"
		>
			<div className="mb-3 flex flex-col gap-1.5">
				<div className="text-[14px] font-extrabold tracking-[0.2px]">Log do ffmpeg</div>
				<div className="text-[12px]">Útil para diagnosticar codecs, permissões e paths.</div>
			</div>

			<div className="mb-2.5 flex w-full justify-stretch gap-2.5">
				<button
					className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[14px] font-semibold text-white/95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:border-blue-400/80 focus-visible:ring-2 focus-visible:ring-blue-500/40"
					type="button"
					onClick={copyLog}
					disabled={!logText}
				>
						Copiar log
				</button>
				<button
					className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[14px] font-semibold text-white/95 disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:border-blue-400/80 focus-visible:ring-2 focus-visible:ring-blue-500/40"
					type="button"
					onClick={clearLog}
					disabled={!logText || isConverting}
				>
						Limpar log
				</button>
			</div>

			<textarea
				className="min-h-[220px] resize-y w-full box-border rounded-xl border border-white/20 bg-black/70 px-3 py-2.5 text-[14px] leading-relaxed text-white/95 outline-none focus:border-blue-400/65 focus:ring-2 focus:ring-blue-500/30 placeholder:text-white/55"
				value={logText}
				readOnly
				placeholder="A saída do ffmpeg aparece aqui…"
				spellCheck={false}
			/>
		</section>
	);
}
