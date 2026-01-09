import { CocaWord, UserStats } from './types';

// In a real scenario, this would be fetched from the large json file.
export const MOCK_COCA_DATA: CocaWord[] = [
  { word: "the", html: "coca_00001_the.html", rank: 1 },
  // ... (kept for fallback structure if needed, though main data is in data/coca.ts)
];

// Generate last 7 days for the chart
const getInitialHistory = () => {
    const history = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        history.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d.toDateString(),
            xp: 0
        });
    }
    return history;
};

export const INITIAL_STATS: UserStats = {
  wordsLearned: 0,
  xp: 0,
  streak: 1,
  level: 1,
  history: getInitialHistory(),
  lastLogin: new Date().toDateString()
};

export const GEMINI_MODEL_FAST = "gemini-3-flash-preview";
export const GEMINI_MODEL_SMART = "gemini-3-pro-preview";