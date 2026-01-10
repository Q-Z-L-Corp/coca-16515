export interface CocaWord {
	word: string;
	html: string; // The reference file name from the original dataset
	rank?: number;
	reason?: string;
}

export interface WordDetails {
	definition: string;
	partOfSpeech: string;
	synonyms: string[];
	examples: string[];
	mnemonics?: string;
}

export enum AppMode {
	DASHBOARD = "DASHBOARD",
	LEARN = "LEARN", // Flashcards
	QUIZ = "QUIZ",
	TUTOR = "TUTOR", // AI Chat
	BROWSER = "BROWSER", // Word Explorer
}

export interface UserStats {
	wordsLearned: number;
	xp: number;
	streak: number;
	level: number;
	history: { date: string; xp: number; fullDate?: string }[];
	lastLogin?: string;
}

export interface QuizQuestion {
	question: string;
	options: string[];
	correctAnswer: string;
	explanation: string;
}

export interface ChatMessage {
	role: "user" | "model";
	text: string;
}

export interface ChatHistory {
	role: string;
	parts: { text: string }[];
}
