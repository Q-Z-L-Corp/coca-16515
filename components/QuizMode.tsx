import React, { useState, useEffect } from 'react';
import { COCA } from '../data/coca';
import { parseCocaHtml } from '../utils/cocaParser';
import { fetchWordHtml, isWordAvailable } from '../utils/contentProvider';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const VALID_COCA_DATA = COCA.filter(item => item.word && item.html);
const AVAILABLE_DATA = VALID_COCA_DATA.filter(item => isWordAvailable(item.html));

interface LocalQuizQuestion {
  targetWord: string;
  definition: string;
  options: string[];
  examples: string[];
}

interface QuizModeProps {
    onCorrectAnswer: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ onCorrectAnswer }) => {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<LocalQuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const getWorkingDataPool = () => {
      return AVAILABLE_DATA.length > 0 ? AVAILABLE_DATA : VALID_COCA_DATA.slice(0, 10);
  };

  const getRandomItem = () => {
    const pool = getWorkingDataPool();
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  const loadNewQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    try {
      const targetItem = getRandomItem();
      const pool = getWorkingDataPool();
      const distractors: string[] = [];
      while (distractors.length < 3) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const d = pool[randomIndex];
        if (d.word !== targetItem.word && !distractors.includes(d.word)) {
          distractors.push(d.word);
        }
      }
      
      const text = await fetchWordHtml(targetItem.html);
      const parsed = parseCocaHtml(text, targetItem.word);
      const options = [...distractors, targetItem.word].sort(() => Math.random() - 0.5);

      setQuestion({
        targetWord: targetItem.word,
        definition: parsed.definition,
        examples: parsed.examples,
        options
      });

    } catch (error) {
      console.error("Quiz generation error", error);
      setQuestion({
          targetWord: "be",
          definition: "v. to exist; to take place",
          examples: ["To be or not to be."],
          options: ["be", "have", "go", "do"]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const handleAnswer = (option: string) => {
    if (selectedAnswer || !question) return;
    
    setSelectedAnswer(option);
    const correct = option === question.targetWord;
    setIsCorrect(correct);
    
    if (correct) {
      onCorrectAnswer(); // Award XP
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <h3 className="text-xl font-bold text-slate-400">Preparing challenge...</h3>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
        <p className="text-slate-600">Could not load quiz data.</p>
        <button onClick={loadNewQuestion} className="mt-4 px-6 py-2 bg-indigo-600 rounded-xl text-white font-bold shadow-lg shadow-indigo-200">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800">Definition Challenge</h2>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50">
        <div className="mb-10">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Identify the word</span>
            <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-lg md:text-xl font-medium leading-relaxed text-slate-700">
                "{question.definition}"
                </h3>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isTarget = option === question.targetWord;
            
            let btnClass = "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50";
            let icon = null;

            if (selectedAnswer) {
              if (isSelected && isCorrect) {
                  btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100";
                  icon = <CheckCircle className="text-emerald-500" size={20} />;
              }
              else if (isSelected && !isCorrect) {
                  btnClass = "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-100";
                  icon = <XCircle className="text-rose-500" size={20} />;
              }
              else if (!isSelected && isTarget) {
                  btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700 opacity-60"; // Show correct answer
              }
              else {
                  btnClass = "opacity-30 border-slate-200 bg-slate-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between font-bold text-lg capitalize shadow-sm ${btnClass}`}
              >
                <span className="mx-auto">{option}</span>
                {icon && <div className="absolute right-4">{icon}</div>}
              </button>
            );
          })}
        </div>

        {selectedAnswer && (
          <div className="mt-10 pt-6 border-t border-slate-100 animate-fade-in">
            <h4 className="font-bold text-slate-400 mb-3 text-xs uppercase tracking-wider">Example Usage</h4>
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-6">
                <ul className="list-disc list-inside space-y-2 text-indigo-800 text-sm font-medium">
                    {question.examples.length > 0 ? question.examples.slice(0, 2).map((ex, i) => (
                        <li key={i} className="italic">"{ex}"</li>
                    )) : <li>No examples available for this word.</li>}
                </ul>
            </div>
            <button
              onClick={loadNewQuestion}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95"
            >
              Next Challenge
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMode;