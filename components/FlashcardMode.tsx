import React, { useState, useMemo } from 'react';
import { COCA } from '../data/coca';
import { Trophy, Play, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import WordCard from './WordCard';

const VALID_COCA_DATA = COCA.filter(item => item.word && item.html);
const WORDS_PER_ROUND = 20;

interface FlashcardModeProps {
    onRoundComplete: (count: number) => void;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ onRoundComplete }) => {
  const [round, setRound] = useState(0); 
  const [roundIndex, setRoundIndex] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(false);
  
  const roundWords = useMemo(() => {
    const start = round * WORDS_PER_ROUND;
    const end = Math.min(start + WORDS_PER_ROUND, VALID_COCA_DATA.length);
    return VALID_COCA_DATA.slice(start, end);
  }, [round]);

  const currentItem = roundWords[roundIndex];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (roundIndex < roundWords.length - 1) {
      setRoundIndex(prev => prev + 1);
    } else {
      setIsRoundComplete(true);
      if (!hasAwarded) {
          onRoundComplete(WORDS_PER_ROUND);
          setHasAwarded(true);
      }
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (roundIndex > 0) {
      setRoundIndex(prev => prev - 1);
    }
  };

  const startNextRound = () => {
    setRound(r => r + 1);
    setRoundIndex(0);
    setIsRoundComplete(false);
    setHasAwarded(false);
  };

  if (isRoundComplete) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[calc(100vh-100px)] w-full max-w-lg mx-auto px-4 animate-fade-in mt-10 md:mt-0">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center shadow-2xl shadow-indigo-100 w-full">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="text-indigo-500" size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3">Round {round + 1} Complete!</h2>
                <p className="text-slate-500 font-medium mb-8">Fantastic job! You've reviewed 20 new words.</p>
                
                <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                    <div className="flex justify-between items-center text-sm text-slate-500 font-bold mb-3">
                        <span>Total Words Seen</span>
                        <span className="text-indigo-600 font-mono">{(round + 1) * WORDS_PER_ROUND} / {VALID_COCA_DATA.length}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div 
                           className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full" 
                           style={{ width: `${Math.min(100, (((round + 1) * WORDS_PER_ROUND) / VALID_COCA_DATA.length) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                <button 
                  onClick={startNextRound}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 group transform active:scale-95"
                >
                  <Play size={20} className="fill-current"/> Start Round {round + 2}
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] md:min-h-[calc(100vh-120px)] w-full max-w-4xl mx-auto px-4 py-2 md:py-0">
      
      {/* Header Info */}
      <div className="w-full max-w-sm flex justify-between items-center mb-4 md:mb-6 px-2">
        <div className="flex items-center space-x-2 text-slate-400 font-medium">
           <span className="text-xs md:text-sm uppercase tracking-widest text-indigo-600 font-bold">Round {round + 1}</span>
           <span className="text-slate-300">|</span>
           <span className="text-xs md:text-sm uppercase tracking-widest">Word</span>
           <span className="text-slate-800 font-black">{roundIndex + 1}</span>
           <span className="text-slate-300">/</span>
           <span className="text-slate-500">{WORDS_PER_ROUND}</span>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-full px-3 py-1 flex items-center space-x-2">
           <Sparkles size={12} className="text-amber-500 fill-current" />
           <span className="text-xs font-mono font-bold text-amber-700">Rank: {currentItem.rank || ((round * WORDS_PER_ROUND) + roundIndex + 1)}</span>
        </div>
      </div>

      <WordCard 
        item={currentItem} 
        className="w-full max-w-sm h-[300px] md:h-[380px]" 
      />

      {/* Footer Controls */}
      <div className="flex justify-between items-center mt-6 md:mt-8 w-full max-w-sm gap-4">
        <button 
          onClick={handlePrev}
          disabled={roundIndex === 0}
          className="flex-1 py-3 md:py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-slate-400 hover:text-slate-700 shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>

        <button 
          onClick={handleNext}
          className="flex-[2] py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 rounded-2xl flex items-center justify-center transition-all active:scale-95 text-white font-bold tracking-wide text-lg"
        >
          {roundIndex === WORDS_PER_ROUND - 1 ? "Finish" : "Next Word"} <ArrowRight size={22} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardMode;