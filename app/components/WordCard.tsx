import React, { useState, useEffect, useRef } from "react";
import { CocaWord } from "@/types";
import { parseCocaHtml, ParsedWordData } from "../utils/cocaParser";
import { fetchWordHtml } from "../utils/contentProvider";
import { Volume2, RotateCw, Sparkles, Book, Info } from "lucide-react";
import { useUserStats } from "../UserStatsProvider";

interface WordCardProps {
	item: CocaWord;
	className?: string;
	autoPlayAudio?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({
	item,
	className = "",
	autoPlayAudio = false,
}) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const [loading, setLoading] = useState(false);
	const [wordData, setWordData] = useState<ParsedWordData | null>(null);
	const [audioError, setAudioError] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const { addXp, addWordsLearned } = useUserStats();

	const loadWordData = async () => {
		if (!item) return;
		setLoading(true);
		setAudioError(false);
		try {
			const text = await fetchWordHtml(item.html);
			const parsed = parseCocaHtml(text, item.word);
			setWordData(parsed);
		} catch (error) {
			console.error("Failed to load word data:", error);
			setWordData({
				word: item.word,
				audioSrc: null,
				phonetic: "",
				definition: "Definition unavailable.",
				usageBlocks: [],
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setIsFlipped(false);
		setWordData(null);
		loadWordData();
	}, [item]);

	const handleSpeak = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (wordData?.audioSrc && !audioError && audioRef.current) {
			audioRef.current.src = `data/${wordData.audioSrc}`;
			audioRef.current.play().catch(() => {
				setAudioError(true);
				fallbackSpeak();
			});
		} else {
			fallbackSpeak();
		}
	};

	const fallbackSpeak = () => {
		const utterance = new SpeechSynthesisUtterance(item.word);
		utterance.lang = "en-US";
		window.speechSynthesis.speak(utterance);
	};

	const onFlipEffect = () => {
		setIsFlipped(!isFlipped);
		if (isFlipped) {
			addWordsLearned([item.word]);
			addXp(5); // Award 5 XP for learning the word after flipping back
		}
		if (!isFlipped) {
			addXp(5); // Award 5 XP for flipping the card to see details
		}
	};

	return (
		<div
			onClick={onFlipEffect}
			className={`relative perspective-1000 cursor-pointer group ${className}`}
		>
			<audio ref={audioRef} className="hidden" />

			<div
				className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-2xl rounded-3xl ${isFlipped ? "rotate-y-180" : ""}`}
			>
				{/* Front Face - Vibrant Light Theme */}
				<div
					className="absolute inset-0 backface-hidden bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col items-center text-center shadow-xl shadow-indigo-100"
					style={{ transform: "rotateY(0deg) translateZ(1px)" }}
				>
					{/* Decorative Background Blob */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-50 rounded-full -ml-8 -mb-8 blur-2xl"></div>

					<div className="flex-1"></div>

					<div className="z-10 flex flex-col items-center w-full relative">
						<h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight capitalize break-words w-full px-2 drop-shadow-sm">
							{item.word}
						</h2>

						{wordData?.phonetic ? (
							<div className="inline-block bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
								<p className="text-slate-500 font-mono text-base md:text-lg font-medium">
									{wordData.phonetic}
								</p>
							</div>
						) : (
							<div className="h-8"></div>
						)}
						{item?.reason && (
							<div className="text-xs italic text-slate-400 mt-2 text-center">
								{item.reason}
							</div>
						)}
					</div>

					<div className="flex-1 flex flex-col justify-end items-center w-full space-y-4">
						<button
							onClick={handleSpeak}
							className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-full transition-all text-white shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 group-hover:animate-pulse-slow"
						>
							<Volume2 size={24} className="md:w-7 md:h-7" />
						</button>

						<div className="flex items-center space-x-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
							<RotateCw size={12} />
							<span>Tap to flip</span>
						</div>
					</div>
				</div>

				{/* Back Face - Clean Detail View */}
				<div
					className="absolute inset-0 backface-hidden bg-slate-50 border-2 border-indigo-100 rounded-3xl p-6 overflow-hidden flex flex-col shadow-xl shadow-slate-200"
					style={{ transform: "rotateY(180deg) translateZ(1px)" }}
				>
					{loading ? (
						<div className="flex flex-col items-center justify-center h-full space-y-3">
							<Sparkles className="animate-spin text-indigo-500" size={32} />
							<p className="text-slate-500 text-sm font-semibold">
								Loading definitions...
							</p>
						</div>
					) : wordData ? (
						<div className="flex flex-col h-full">
							<div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
								<h3 className="text-2xl font-black text-slate-800 capitalize truncate pr-2">
									{wordData.word}
								</h3>
								<button
									onClick={handleSpeak}
									className="p-2 bg-white hover:bg-slate-100 text-indigo-600 rounded-full transition-colors border border-slate-100 shadow-sm shrink-0"
								>
									<Volume2 size={20} />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5 text-left">
								<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
									<h4 className="flex items-center text-teal-600 text-[10px] uppercase tracking-wider font-extrabold mb-2">
										<Info size={12} className="mr-1.5" /> Definition
									</h4>
									<p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
										{wordData.definition || "No definition available."}
									</p>
								</div>

								{wordData.usageBlocks && wordData.usageBlocks.length > 0 && (
									<div>
										<h4 className="flex items-center text-indigo-500 text-[10px] uppercase tracking-wider font-extrabold mb-3 pl-1">
											<Book size={12} className="mr-1.5" /> Examples
										</h4>

										<div className="space-y-6">
											{wordData.usageBlocks.map((block, blockIndex) => (
												<div key={blockIndex} className="space-y-3">
													{/* POS */}
													<div className="text-[10px] font-extrabold tracking-wide text-rose-500 uppercase">
														{block.pos}
													</div>

													{/* Usage (ZH) */}
													<div className="text-xs text-orange-600">
														{block.usageZh}
													</div>

													{/* Usage (EN) */}
													<div className="text-xs font-semibold text-slate-700">
														{block.usageEn}
													</div>

													{/* Examples */}
													<ul className="space-y-2 pt-1">
														{block.examples.slice(0, 2).map((ex, i) => (
															<li
																key={i}
																className="text-slate-600 text-xs md:text-sm bg-indigo-50/50 p-3 rounded-xl border-l-4 border-indigo-400 italic leading-relaxed"
															>
																“{ex}”
															</li>
														))}
													</ul>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default WordCard;
