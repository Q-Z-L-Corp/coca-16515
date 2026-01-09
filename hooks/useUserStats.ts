import { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { INITIAL_STATS } from '../constants';

const STORAGE_KEY = 'coca_user_stats_v1';

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load stats", e);
    }
    return INITIAL_STATS;
  });

  // Persist to localStorage whenever stats change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  // Check and update streak/history on mount
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    setStats(prev => {
      // 1. Re-generate history window (last 7 days)
      const newHistory = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toDateString();
        
        // Find existing XP for this date if it exists in previous history
        const existingEntry = prev.history.find(h => h.fullDate === dStr);
        
        newHistory.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: dStr,
          xp: existingEntry ? existingEntry.xp : 0
        });
      }

      // 2. Calculate Streak
      let newStreak = prev.streak;
      if (prev.lastLogin !== todayStr) {
         if (prev.lastLogin) {
            const last = new Date(prev.lastLogin);
            const diffTime = Math.abs(today.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
            } else if (diffDays > 1) {
                // Missed a day, reset (or keep at 1 if starting today)
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
        lastLogin: todayStr
      };
    });
  }, []);

  const addXp = (amount: number) => {
    setStats(prev => {
      const todayStr = new Date().toDateString();
      const newHistory = prev.history.map(h => {
        if (h.fullDate === todayStr) {
          return { ...h, xp: h.xp + amount };
        }
        return h;
      });

      const newTotalXp = prev.xp + amount;
      // Level up every 500 XP
      const newLevel = Math.floor(newTotalXp / 500) + 1;

      return {
        ...prev,
        xp: newTotalXp,
        level: newLevel,
        history: newHistory
      };
    });
  };

  const addWordsLearned = (count: number) => {
    setStats(prev => ({
      ...prev,
      wordsLearned: prev.wordsLearned + count
    }));
  };

  return { stats, addXp, addWordsLearned };
};
