"use client";

import { useState, useEffect, useRef } from "react";
import { UserStats } from "@/types";
import { INITIAL_STATS } from "../constants";

const STORAGE_KEY = "coca_user_stats_v1";

export const useUserStats = () => {
	// 1️⃣ Start with safe default (SSR-safe)
	const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

	// Prevent saving before initial load
	const hasLoadedRef = useRef(false);

	// 2️⃣ Load from localStorage (client only)
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				setStats(JSON.parse(stored));
			}
		} catch (e) {
			console.warn("Failed to load stats", e);
		} finally {
			hasLoadedRef.current = true;
		}
	}, []);

	// 3️⃣ Persist to localStorage whenever stats change
	useEffect(() => {
		if (!hasLoadedRef.current) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
		} catch (e) {
			console.warn("Failed to save stats", e);
		}
	}, [stats]);

	// 4️⃣ Check and update streak/history on mount
	useEffect(() => {
		const today = new Date();
		const todayStr = today.toDateString();

		setStats((prev) => {
			// Re-generate history window (last 7 days)
			const newHistory = [];
			for (let i = 6; i >= 0; i--) {
				const d = new Date(today);
				d.setDate(today.getDate() - i);
				const dStr = d.toDateString();

				const existingEntry = prev.history.find((h) => h.fullDate === dStr);

				newHistory.push({
					date: d.toLocaleDateString("en-US", { weekday: "short" }),
					fullDate: dStr,
					xp: existingEntry ? existingEntry.xp : 0,
				});
			}

			// Calculate streak
			let newStreak = prev.streak;

			if (prev.lastLogin !== todayStr) {
				if (prev.lastLogin) {
					const last = new Date(prev.lastLogin);
					const diffTime = Math.abs(today.getTime() - last.getTime());
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

					if (diffDays === 1) {
						newStreak += 1;
					} else if (diffDays > 1) {
						newStreak = 1;
					}
				} else {
					newStreak = 1;
				}
			}

			return {
				...prev,
				history: newHistory,
				streak: newStreak,
				lastLogin: todayStr,
			};
		});
	}, []);

	// 5️⃣ Actions
	const addXp = (amount: number) => {
		setStats((prev) => {
			const todayStr = new Date().toDateString();

			const newHistory = prev.history.map((h) =>
				h.fullDate === todayStr ? { ...h, xp: h.xp + amount } : h,
			);

			const newTotalXp = prev.xp + amount;
			const newLevel = Math.floor(newTotalXp / 500) + 1;

			return {
				...prev,
				xp: newTotalXp,
				level: newLevel,
				history: newHistory,
			};
		});
	};

	const addWordsLearned = (count: number) => {
		setStats((prev) => ({
			...prev,
			wordsLearned: prev.wordsLearned + count,
		}));
	};

	return { stats, addXp, addWordsLearned };
};
