import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Play, Sparkles, Trophy } from "lucide-react";
import WordCard from "./WordCard";
import { useUserStats } from "../hooks/useUserStats";
import { CocaWord } from "@/types";
import { COCA } from "../coca";

const WORDS_PER_ROUND = 20;

interface FlashcardModeProps {
	onRoundComplete?: (count: number) => void;
}

interface FlashcardWord extends CocaWord {
	rank?: number;
	reason?: string;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ onRoundComplete }) => {
	const { stats } = useUserStats();

	const [words, setWords] = useState<FlashcardWord[]>([]);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [roundFinished, setRoundFinished] = useState<boolean>(false);

	// Fetch 20 words from API
	const fetchWords = async () => {
		if (!stats) return;
		setLoading(true);
		setRoundFinished(false);
		setCurrentIndex(0);

		try {
			const res = await fetch("/api/tutor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "flashcards",
					userStats: stats,
					wordsSeen: words.map((w) => w.word),
				}),
			});
			const data = await res.json();

			const fetchedWords: FlashcardWord[] =
				data.words
					?.map((w: any) => {
						const cocaItem = COCA.find((c) => c.word === w.word);
						if (!cocaItem) return null;
						return { ...cocaItem, rank: w.rank, reason: w.reason };
					})
					.filter((w): w is FlashcardWord => w !== null) || [];

			setWords(fetchedWords);
		} catch (err) {
			console.error("Failed to fetch flashcards:", err);
			setWords([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWords();
	}, [stats]);

	const handleNext = () => {
		if (currentIndex < words.length - 1) {
			setCurrentIndex((i) => i + 1);
		} else {
			setRoundFinished(true);
			onRoundComplete?.(WORDS_PER_ROUND);
		}
	};

	const handlePrev = () => {
		if (currentIndex > 0) setCurrentIndex((i) => i - 1);
	};

	const startNextRound = () => fetchWords();

	const currentWord = words[currentIndex];

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
				{/* Loading label */}
				<p className="text-slate-600 text-lg md:text-xl font-semibold text-center">
					Curating your personalized flashcards with AI…
				</p>

				{/* Fancy spinner */}
				<div className="w-16 h-16 border-4 border-indigo-300 border-t-indigo-600 border-solid rounded-full animate-spin"></div>
			</div>
		);
	}

	if (roundFinished) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
				<div className="bg-white rounded-2xl p-10 text-center shadow-lg w-full max-w-md">
					<div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
						<Trophy className="text-indigo-500" size={48} />
					</div>
					<h2 className="text-2xl font-bold mb-3">Round Complete!</h2>
					<p className="text-slate-500 mb-6">
						You’ve learned {WORDS_PER_ROUND} new words.
					</p>
					<button
						onClick={startNextRound}
						className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
					>
						<Play size={20} /> Learn Next 20 Words
					</button>
				</div>
			</div>
		);
	}

	if (!currentWord) return null;

	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4">
			<WordCard item={currentWord} className="w-full max-w-md h-[380px]" />

			<div className="flex justify-between items-center mt-6 max-w-md w-full gap-4">
				<button
					onClick={handlePrev}
					disabled={currentIndex === 0}
					className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
				>
					<ArrowLeft />
					{currentIndex === 0 ? "" : "Previous"}
				</button>

				<button
					onClick={handleNext}
					className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
				>
					{currentIndex === words.length - 1 ? "Finish" : "Next"}
					<ArrowRight className="ml-2" />
				</button>
			</div>
		</div>
	);
};

export default FlashcardMode;
