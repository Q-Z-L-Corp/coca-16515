import { createContext, useContext, useState, useEffect } from "react";
import { UserStats } from "@/types";
import { INITIAL_STATS } from "./constants";

interface UserStatsContextType {
	stats: UserStats;
	addXp: (amount: number) => void;
	addWordsLearned: (words: string[]) => void;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(
	undefined,
);

export const UserStatsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

	useEffect(() => {
		const stored = localStorage.getItem("coca_user_stats_v1");
		if (stored) {
			const storedStats: UserStats = JSON.parse(stored);
			if (typeof storedStats.wordsLearned === "number") {
				// Migrate old format
				storedStats.wordsLearned = [];
			}
			setStats(storedStats);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("coca_user_stats_v1", JSON.stringify(stats));
	}, [stats]);

	const addXp = (amount: number) => {
		setStats((prev) => {
			const todayStr = new Date().toDateString();
			const newHistory = prev.history.map((h) =>
				h.fullDate === todayStr ? { ...h, xp: h.xp + amount } : h,
			);
			const newTotalXp = prev.xp + amount;
			const newLevel = Math.floor(newTotalXp / 500) + 1;

			return { ...prev, xp: newTotalXp, level: newLevel, history: newHistory };
		});
	};

	const addWordsLearned = (words: string[]) => {
		setStats((prev) => ({
			...prev,
			wordsLearned: Array.from(new Set([...prev.wordsLearned, ...words])),
		}));
	};

	return (
		<UserStatsContext.Provider value={{ stats, addXp, addWordsLearned }}>
			{children}
		</UserStatsContext.Provider>
	);
};

export const useUserStats = (): UserStatsContextType => {
	const context = useContext(UserStatsContext);
	if (!context)
		throw new Error("useUserStats must be used within a UserStatsProvider");
	return context;
};
