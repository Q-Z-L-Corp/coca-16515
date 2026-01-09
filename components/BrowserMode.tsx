import React, { useState, useMemo } from 'react';
import { COCA } from '../data/coca';
import { CocaWord } from '../types';
import WordCard from './WordCard';
import { Search, X, ChevronLeft } from 'lucide-react';

const VALID_COCA_DATA = COCA.filter(item => item.word && item.html);
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

// Candy-like pastel colors for light mode
const LETTER_STYLES = [
  { bg: 'bg-rose-100', hover: 'group-hover:bg-rose-200', border: 'border-rose-200', text: 'text-rose-600', shadow: 'hover:shadow-rose-100' },
  { bg: 'bg-orange-100', hover: 'group-hover:bg-orange-200', border: 'border-orange-200', text: 'text-orange-600', shadow: 'hover:shadow-orange-100' },
  { bg: 'bg-amber-100', hover: 'group-hover:bg-amber-200', border: 'border-amber-200', text: 'text-amber-600', shadow: 'hover:shadow-amber-100' },
  { bg: 'bg-yellow-100', hover: 'group-hover:bg-yellow-200', border: 'border-yellow-200', text: 'text-yellow-700', shadow: 'hover:shadow-yellow-100' },
  { bg: 'bg-lime-100', hover: 'group-hover:bg-lime-200', border: 'border-lime-200', text: 'text-lime-700', shadow: 'hover:shadow-lime-100' },
  { bg: 'bg-green-100', hover: 'group-hover:bg-green-200', border: 'border-green-200', text: 'text-green-700', shadow: 'hover:shadow-green-100' },
  { bg: 'bg-emerald-100', hover: 'group-hover:bg-emerald-200', border: 'border-emerald-200', text: 'text-emerald-700', shadow: 'hover:shadow-emerald-100' },
  { bg: 'bg-teal-100', hover: 'group-hover:bg-teal-200', border: 'border-teal-200', text: 'text-teal-700', shadow: 'hover:shadow-teal-100' },
  { bg: 'bg-cyan-100', hover: 'group-hover:bg-cyan-200', border: 'border-cyan-200', text: 'text-cyan-700', shadow: 'hover:shadow-cyan-100' },
  { bg: 'bg-sky-100', hover: 'group-hover:bg-sky-200', border: 'border-sky-200', text: 'text-sky-700', shadow: 'hover:shadow-sky-100' },
  { bg: 'bg-blue-100', hover: 'group-hover:bg-blue-200', border: 'border-blue-200', text: 'text-blue-700', shadow: 'hover:shadow-blue-100' },
  { bg: 'bg-indigo-100', hover: 'group-hover:bg-indigo-200', border: 'border-indigo-200', text: 'text-indigo-700', shadow: 'hover:shadow-indigo-100' },
  { bg: 'bg-violet-100', hover: 'group-hover:bg-violet-200', border: 'border-violet-200', text: 'text-violet-700', shadow: 'hover:shadow-violet-100' },
  { bg: 'bg-purple-100', hover: 'group-hover:bg-purple-200', border: 'border-purple-200', text: 'text-purple-700', shadow: 'hover:shadow-purple-100' },
  { bg: 'bg-fuchsia-100', hover: 'group-hover:bg-fuchsia-200', border: 'border-fuchsia-200', text: 'text-fuchsia-700', shadow: 'hover:shadow-fuchsia-100' },
  { bg: 'bg-pink-100', hover: 'group-hover:bg-pink-200', border: 'border-pink-200', text: 'text-pink-700', shadow: 'hover:shadow-pink-100' },
];

const RAINBOW_TEXT_COLORS = [
  'text-rose-500', 'text-orange-500', 'text-amber-600', 
  'text-emerald-600', 'text-teal-600', 'text-cyan-600', 
  'text-sky-600', 'text-indigo-600', 'text-violet-600', 'text-fuchsia-600', 'text-pink-500'
];

const getWordColor = (word: string) => {
  const index = word.length % RAINBOW_TEXT_COLORS.length;
  return RAINBOW_TEXT_COLORS[index];
};

const BrowserMode: React.FC = () => {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<CocaWord | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter Logic
  const filteredWords = useMemo(() => {
    let filtered = VALID_COCA_DATA;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item => item.word.toLowerCase().includes(lowerSearch));
      // Sort by relevance
      filtered.sort((a, b) => {
          const aStarts = a.word.toLowerCase().startsWith(lowerSearch);
          const bStarts = b.word.toLowerCase().startsWith(lowerSearch);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
      });
      return filtered.slice(0, 100);
    } else if (activeLetter) {
      const letter = activeLetter.toLowerCase();
      return filtered.filter(item => item.word.toLowerCase().startsWith(letter));
    }
    return [];
  }, [activeLetter, searchTerm]);

  const handleLetterClick = (letter: string) => {
    setIsAnimating(true);
    setTimeout(() => {
        setActiveLetter(letter);
        setSearchTerm('');
        setIsAnimating(false);
    }, 300);
  };

  const handleBackToAlphabet = () => {
    setActiveLetter(null);
    setSearchTerm('');
  };

  const isBrowsing = !searchTerm && !activeLetter;

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-100px)] p-4">
      
      {/* 
          Main Layout Container 
          - Grid Mode: Used for Alphabet view (Desktop: 6 cols to ensure A-E-I-O-U in col 1)
          - Flex Mode: Used when searching or viewing a cloud
      */}
      <div className={`
        w-full transition-all duration-500 ease-in-out
        ${isBrowsing ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-5 auto-rows-min' : 'flex flex-col gap-6'}
      `}>

         {/* 
            Search Input Tile 
         */}
         <div className={`
             relative z-20 transition-all duration-500
             ${isBrowsing 
               ? 'col-span-2 sm:col-span-4 md:col-span-2 md:col-start-5 md:row-start-1 md:row-span-2 min-h-[140px] md:min-h-auto' 
               : 'w-full order-first'
             }
         `}>
             <div className={`
                 h-full bg-white border border-slate-200 rounded-[2rem] p-5 shadow-lg shadow-slate-200/50 flex flex-col justify-center transition-all group
                 ${!isBrowsing ? 'flex-row items-center p-3 h-auto shadow-md rounded-2xl' : ''}
             `}>
                <div className={`flex items-center text-indigo-500 mb-3 ml-1 transition-all ${!isBrowsing ? 'mb-0 mr-3' : ''}`}>
                   <Search size={!isBrowsing ? 20 : 28} strokeWidth={2.5} />
                   {isBrowsing && <span className="ml-2 font-black uppercase tracking-wider text-sm text-slate-400">Search</span>}
                </div>
                
                <div className="relative w-full">
                    <input 
                       type="text" 
                       placeholder={isBrowsing ? "Find a word..." : "Search..."}
                       value={searchTerm}
                       onChange={(e) => {
                           setSearchTerm(e.target.value);
                           if (e.target.value) setActiveLetter(null);
                       }}
                       className={`
                         w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all placeholder-slate-400 font-semibold
                         ${isBrowsing ? 'px-4 py-3 text-lg' : 'px-4 py-2'}
                       `}
                    />
                     {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
             </div>
         </div>

         {/* 
            Alphabet Grid Items
            - Only visible in Browsing Mode
            - Rendered with distinct colorful styles
         */}
         {isBrowsing && ALPHABET.map((char, index) => {
             const style = LETTER_STYLES[index % LETTER_STYLES.length];
             return (
               <button
                 key={char}
                 onClick={() => handleLetterClick(char)}
                 style={{ animationDelay: `${index * 15}ms` }}
                 className={`
                   aspect-square rounded-3xl border-b-4 transition-all duration-300 
                   group flex flex-col items-center justify-center animate-fade-in-up relative overflow-hidden
                   hover:-translate-y-1 active:scale-95 shadow-sm
                   ${style.bg} ${style.border} ${style.shadow} ${style.hover}
                 `}
               >
                 <span className={`text-4xl md:text-5xl font-black transition-all drop-shadow-sm ${style.text}`}>
                   {char}
                 </span>
               </button>
             );
         })}

         {/* Search Results List */}
         {searchTerm && (
            <div className="w-full animate-fade-in flex-1">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 pl-2">
                  Found {filteredWords.length} results
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredWords.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedWord(item)}
                          className="bg-white hover:bg-indigo-600 border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-white py-3 px-4 rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-indigo-200 hover:scale-[1.02] group flex justify-between items-center"
                        >
                            <span className="font-bold truncate capitalize">{item.word}</span>
                        </button>
                    ))}
                    {filteredWords.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No matching words found for "{searchTerm}".
                        </div>
                    )}
                </div>
            </div>
         )}

         {/* Word Cloud View */}
         {!searchTerm && activeLetter && (
            <div className="w-full animate-fade-in flex-1 flex flex-col">
               <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={handleBackToAlphabet}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group px-4 py-2 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl shadow-sm"
                  >
                      <ChevronLeft size={20} className="mr-2" />
                      <span className="font-bold">Back</span>
                  </button>
                  <div className="flex items-center space-x-3 bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm">
                      <span className="text-3xl font-black text-indigo-600">{activeLetter}</span>
                      <div className="h-6 w-px bg-slate-200"></div>
                      <span className="text-sm font-bold text-slate-500">{filteredWords.length} Words</span>
                  </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 flex-1 shadow-lg shadow-slate-100 relative overflow-hidden">
                   {/* Background decoration */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-50 rounded-full blur-3xl opacity-60 -ml-16 -mb-16 pointer-events-none"></div>

                  <div className="flex flex-wrap justify-center content-start gap-2 md:gap-3 relative z-10">
                     {filteredWords.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedWord(item)}
                          style={{ animationDelay: `${Math.min(idx * 5, 500)}ms` }}
                          className={`
                            px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-sm md:text-lg tracking-wide
                            bg-slate-50 hover:bg-white border border-slate-200 hover:border-current
                            shadow-sm hover:shadow-md
                            transition-all duration-200 hover:scale-110 active:scale-95
                            cursor-pointer animate-fade-in
                            ${getWordColor(item.word)}
                          `}
                        >
                            {item.word}
                        </button>
                     ))}
                     {filteredWords.length === 0 && (
                         <div className="w-full text-center py-20 text-slate-400 font-medium">
                             No words found for this letter.
                         </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Word Details Modal */}
      {selectedWord && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedWord(null)}>
              <div 
                className="relative w-full max-w-sm" 
                onClick={(e) => e.stopPropagation()} 
              >
                  <button 
                    onClick={() => setSelectedWord(null)}
                    className="absolute -top-12 right-0 md:-right-12 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                      <X size={32} />
                  </button>
                  
                  <WordCard 
                     item={selectedWord} 
                     className="h-[450px]"
                     autoPlayAudio={true}
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default BrowserMode;