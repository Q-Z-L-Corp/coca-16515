"use client";

import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import FlashcardMode from "./components/FlashcardMode";
import QuizMode from "./components/QuizMode";
import ChatTutor from "./components/ChatTutor";
import BrowserMode from "./components/BrowserMode";
import { AppMode } from "../types";
import { useUserStats } from "./UserStatsProvider";

const App: React.FC = () => {
	const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
	const { stats, addXp } = useUserStats();

	const renderContent = () => {
		switch (mode) {
			case AppMode.DASHBOARD:
				return <Dashboard stats={stats} setMode={setMode} />;
			case AppMode.LEARN:
				return <FlashcardMode stats={stats} />;
			case AppMode.BROWSER:
				return <BrowserMode />;
			case AppMode.QUIZ:
				return <QuizMode onCorrectAnswer={() => addXp(10)} />;
			case AppMode.TUTOR:
				return <ChatTutor />;
			default:
				return <Dashboard stats={stats} setMode={setMode} />;
		}
	};

	return (
		<Layout currentMode={mode} setMode={setMode}>
			{renderContent()}
		</Layout>
	);
};

export default App;
