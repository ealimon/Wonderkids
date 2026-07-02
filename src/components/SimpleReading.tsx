import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import {
  RotateCcw,
  Star,
  CheckCircle,
  ArrowRight,
  Printer,
  RefreshCw,
  FileText,
  Check,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ReadingProblem {
  id: number;
  sentence: string;
  word: string;
  decoy1: string;
  decoy2: string;
}

// Pool of educational simple sentences suitable for early readers
const READING_POOL: ReadingProblem[] = [
  { id: 1, sentence: "The big ___ cat slept on the red rug.", word: "red", decoy1: "run", decoy2: "yes" },
  { id: 2, sentence: "I can see a yellow ___ in the sky.", word: "sun", decoy1: "sad", decoy2: "hop" },
  { id: 3, sentence: "The happy little ___ barked at the ball.", word: "dog", decoy1: "dig", decoy2: "day" },
  { id: 4, sentence: "She put her pink ___ on her head.", word: "hat", decoy1: "hot", decoy2: "him" },
  { id: 5, sentence: "We can ___ in the cool blue pool.", word: "swim", decoy1: "sit", decoy2: "stop" },
  { id: 6, sentence: "The baby pig is very ___ and cute.", word: "pink", decoy1: "play", decoy2: "pen" },
  { id: 7, sentence: "He sat down on the wooden ___.", word: "chair", decoy1: "chin", decoy2: "cold" },
  { id: 8, sentence: "The fast blue ___ went zoom zoom zoom.", word: "car", decoy1: "can", decoy2: "cry" },
  { id: 9, sentence: "Please put the golden ___ on the table.", word: "cup", decoy1: "cap", decoy2: "cut" },
  { id: 10, sentence: "A little sweet ___ buzzed by the flower.", word: "bee", decoy1: "boy", decoy2: "big" },
  { id: 11, sentence: "My sweet ___ loves to drink milk.", word: "cat", decoy1: "can", decoy2: "cut" },
  { id: 12, sentence: "The bright green ___ hopped on the leaf.", word: "frog", decoy1: "from", decoy2: "fox" },
  { id: 13, sentence: "I love to read a good ___ at night.", word: "book", decoy1: "back", decoy2: "bark" },
  { id: 14, sentence: "We live in a tall red brick ___.", word: "house", decoy1: "horse", decoy2: "happy" },
  { id: 15, sentence: "The yellow ___ is sailing on the sea.", word: "boat", decoy1: "boot", decoy2: "best" },
  { id: 16, sentence: "The juicy sweet ___ is red and round.", word: "apple", decoy1: "asked", decoy2: "about" },
];

export default function SimpleReading({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>('game');

  // Interactive Game State
  const [rounds, setRounds] = useState<ReadingProblem[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>([]);

  // Worksheet Generator State
  const [wsDifficulty, setWsDifficulty] = useState<'easy' | 'medium' | 'advanced'>('easy');
  const [wsProblemCount, setWsProblemCount] = useState<number>(6);
  const [wsMascot, setWsMascot] = useState<'lion' | 'rabbit' | 'owl'>('owl');
  const [wsProblems, setWsProblems] = useState<ReadingProblem[]>([]);

  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    const shuffled = [...READING_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    setRounds(shuffled);
    setCurrentRoundIdx(0);
    setSelectedAnswer(null);
    setWrongAnswer(null);
    setRoundComplete(false);
    setGameComplete(false);
    setScore(0);
    setupRound(shuffled[0]);
  };

  const setupRound = (problem: ReadingProblem) => {
    const list = [problem.word, problem.decoy1, problem.decoy2];
    setOptions(list.sort(() => Math.random() - 0.5));
  };

  const handleSelectAnswer = (answer: string) => {
    if (roundComplete || gameComplete) return;

    const activeProblem = rounds[currentRoundIdx];

    if (answer === activeProblem.word) {
      audioManager.playPop();
      audioManager.playCorrect();
      setSelectedAnswer(answer);
      setRoundComplete(true);
      setScore((prev) => prev + 1);

      if (currentRoundIdx === rounds.length - 1) {
        setGameComplete(true);
        onGameWin(3);
      }
    } else {
      audioManager.playIncorrect();
      setWrongAnswer(answer);
      setTimeout(() => setWrongAnswer(null), 500);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < rounds.length - 1) {
      const nextIdx = currentRoundIdx + 1;
      setCurrentRoundIdx(nextIdx);
      setSelectedAnswer(null);
      setWrongAnswer(null);
      setRoundComplete(false);
      setupRound(rounds[nextIdx]);
    }
  };

  const handleGenerateWorksheet = (count = wsProblemCount) => {
    const shuffled = [...READING_POOL].sort(() => Math.random() - 0.5).slice(0, count);
    setWsProblems(shuffled);
  };

  useEffect(() => {
    handleGenerateWorksheet();
  }, [wsProblemCount, wsDifficulty]);

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const activeProblem = rounds[currentRoundIdx];

  const mascotDetails = {
    owl: { emoji: '🦉', bg: 'bg-indigo-100', text: 'Wise Owl Reading' },
    lion: { emoji: '🦁', bg: 'bg-amber-100', text: 'Brave Lion Phonics' },
    rabbit: { emoji: '🐰', bg: 'bg-pink-100', text: 'Bouncy Bunny Vocab' }
  };

  const mascot = mascotDetails[wsMascot];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black animate-fade-in" id="simple-reading-app">
      
      {/* Tab bar switch */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
            activeTab === 'game' ? 'bg-indigo-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🎮 PLAY PHONICS GAME
        </button>
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('worksheet');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
            activeTab === 'worksheet' ? 'bg-purple-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📝 PRINT READING SHEETS
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'game' ? (
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center print:hidden"
          >
            <ConfettiEffect active={gameComplete} />

            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-indigo-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-950">SENTENCE PROGRESS:</span>
                <div className="flex gap-1.5 sm:gap-2">
                  {rounds.map((_, idx) => {
                    const isSolved = idx < currentRoundIdx || (idx === currentRoundIdx && roundComplete);
                    const isCurrent = idx === currentRoundIdx;
                    return (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                          isSolved ? 'bg-emerald-400 text-black' : isCurrent ? 'bg-orange-400 text-white animate-pulse' : 'bg-white text-black'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Star className="w-5 h-5 fill-yellow-400 text-black animate-bounce" />
                <span className="font-black font-mono text-xs sm:text-sm">{score} / {rounds.length} CORRECT</span>
              </div>
            </div>

            {rounds.length > 0 && activeProblem ? (
              <div className="w-full bg-indigo-50 rounded-[36px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                <div className="absolute top-2 right-2 text-3xl opacity-20 select-none">📚</div>
                <div className="absolute bottom-2 left-2 text-3xl opacity-20 select-none">✏️</div>

                <div className="text-center mb-6">
                  <div className="inline-block bg-indigo-200 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 rounded-2xl mb-3 text-xl">📖</div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-indigo-950">FILL IN THE BLANK</h2>
                  <p className="text-xs font-bold text-gray-700 mt-1">Read the sentence and pick the missing word that fits perfectly!</p>
                </div>

                <div className="my-8 px-4 text-center">
                  <p className="text-2xl sm:text-3xl font-black leading-relaxed text-indigo-950 bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    {activeProblem.sentence.split("___").map((segment, index) => (
                      <span key={index}>
                        {segment}
                        {index === 0 && (
                          <span className={`inline-block mx-2 px-4 py-1 border-4 border-dashed rounded-2xl min-w-[100px] text-center ${roundComplete ? 'border-solid border-emerald-400 text-emerald-500 bg-emerald-50 scale-110' : 'border-indigo-400 text-indigo-400 bg-indigo-100/50'} transition-all`}>
                            {roundComplete ? activeProblem.word : "?"}
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="border-t-3 border-black/15 pt-6 mt-4 min-h-[120px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {roundComplete ? (
                      <motion.div
                        key="win-message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-sm sm:text-lg mb-4">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-black animate-bounce" />
                          GREAT JOB! "{activeProblem.word}" is the correct word! 🌟
                        </div>
                        {!gameComplete ? (
                          <button
                            onClick={handleNextRound}
                            className="flex items-center gap-2 px-8 py-3.5 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                          >
                            Next Sentence
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xl text-indigo-950 font-black uppercase tracking-widest">READING SUPERSTAR! 👑📚</span>
                            <span className="text-xs font-bold text-indigo-900 mt-1">Excellent reading! You successfully finished all tasks!</span>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center w-full" key="options-picker">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-950 mb-4">CHOOSE THE BEST FITTING WORD:</span>
                        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
                          {options.map((opt) => {
                            const isWrong = wrongAnswer === opt;
                            return (
                              <motion.button
                                key={opt}
                                onClick={() => handleSelectAnswer(opt)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className={`px-6 py-3 rounded-2xl border-4 border-black font-black text-base sm:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all ${
                                  isWrong ? 'bg-red-400 text-white' : 'bg-white hover:bg-indigo-100 text-black'
                                }`}
                              >
                                {opt}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 font-bold">Loading Phonics Adventure...</div>
            )}

            <div className="mt-8">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 px-6 py-3.5 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                RESTART GAME
              </button>
            </div>
          </motion.div>
        ) : (
          // WORKSHEET TAB
          <motion.div
            key="worksheet-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-8 text-black"
          >
            <div className="w-full bg-purple-100 rounded-[32px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col gap-6 print:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400 border-2 border-black p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-purple-950">Worksheet Creator</h3>
                  <p className="text-xs font-bold text-purple-900/70">Produce physical and printable reading worksheet pages instantly!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t-2 border-purple-200 pt-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Problem Count</span>
                  <div className="flex flex-col gap-1.5">
                    {([6, 8, 12] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          audioManager.playPop();
                          setWsProblemCount(count);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs uppercase transition-all flex items-center justify-between ${
                          wsProblemCount === count ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{count} sentences</span>
                        {wsProblemCount === count && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Mascot Partner</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'owl', name: '🦉 Wise Owl' },
                      { id: 'lion', name: '🦁 Phonics Lion' },
                      { id: 'rabbit', name: '🐰 Bouncy Rabbit' }
                    ] as const).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsMascot(m.id);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsMascot === m.id ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{m.name}</span>
                        {wsMascot === m.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-3">
                  <button
                    onClick={() => {
                      audioManager.playPop();
                      handleGenerateWorksheet();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
                    Randomize Sentences
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t-2 border-purple-200 pt-6">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white border-4 border-black font-black uppercase rounded-2xl text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 stroke-[3]" />
                  PRINT / DOWNLOAD PDF
                </button>
              </div>
            </div>

            {/* LIVE PAPER PREVIEW CONTAINER */}
            <div className="w-full flex justify-center print:w-full print:m-0 print:p-0">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  .print-avoid-break {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .print-break-before {
                    break-before: page !important;
                    page-break-before: always !important;
                  }
                }
              `}} />
              <div
                className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] font-sans relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:bg-white"
              >
                {/* Lined Notebook Paper Aesthetics */}
                <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-20 pointer-events-none print:hidden" />

                {/* 1. Header of the printed worksheet */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-4 border-black pb-6 mb-8 print:flex-row print:justify-between print:pb-2 print:mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 print:w-10 print:h-10 print:rounded-lg ${mascot.bg}`}>
                      <span className="text-2xl print:text-xl">{mascot.emoji}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 leading-none">WONDERKIDS READING</span>
                      <h1 className="text-2xl font-black tracking-tight uppercase mt-0.5 leading-none print:text-lg">{mascot.text}</h1>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs font-bold font-mono tracking-wide text-gray-700 w-full sm:w-auto print:w-auto print:gap-1">
                    <div className="flex items-center gap-1.5">
                      <span>NAME:</span>
                      <div className="flex-grow sm:w-44 border-b-2 border-dotted border-black/30 h-4 print:w-36" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>DATE:</span>
                      <div className="flex-grow sm:w-44 border-b-2 border-dotted border-black/30 h-4 print:w-36" />
                    </div>
                  </div>
                </div>

                {/* Sub-Header & Instructions */}
                <div className="flex justify-between items-center bg-gray-50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl">
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-purple-500 leading-none">Assignment Instructions</p>
                    <p className="text-sm font-black text-black mt-1 leading-tight">
                      Read each sentence carefully. Write the correct word in the blank space to make the sentence complete.
                    </p>
                  </div>
                  <div className="border-l-2 border-dashed border-black/20 pl-4 text-center print:border-black/30 flex-shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">SCORE</span>
                    <div className="text-base font-black text-black mt-0.5">
                      _______ / {wsProblemCount}
                    </div>
                  </div>
                </div>

                {/* Problems Grid */}
                <div className={`grid gap-6 print:gap-x-4 print:gap-y-3 ${
                  wsProblemCount === 6 
                    ? 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3' 
                    : wsProblemCount === 8 
                    ? 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4' 
                    : 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4'
                }`}>
                  {wsProblems.map((prob, idx) => (
                    <div
                      key={prob.id}
                      className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-gray-200 rounded-2xl relative bg-white min-h-[170px] print:min-h-[105px] print:py-2 print:px-1 print:rounded-xl print:border-black/30"
                    >
                      {/* Problem Index */}
                      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black">
                        {idx + 1}.
                      </span>

                      {/* Display Mascot Little Accent */}
                      <span className="absolute top-2 right-2 text-xs opacity-40 select-none print:block">
                        📖
                      </span>

                      {/* Math problem sentence display */}
                      <div className="text-center px-1 font-bold text-xs text-gray-800 leading-normal mt-4 print:mt-2 print:text-[11px] print:leading-normal">
                        {prob.sentence.split("___").map((seg, i) => (
                          <span key={i}>
                            {seg}
                            {i === 0 && (
                              <span className="inline-block mx-1 w-10 border-b border-black text-transparent select-none">
                                ___
                              </span>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Dotted target container with suggestions */}
                      <div className="w-full border-t border-dashed border-black/10 mt-4 pt-3 text-center print:mt-2 print:pt-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 print:text-black mb-1">Options:</p>
                        <div className="flex gap-1.5 justify-center">
                          {[prob.word, prob.decoy1, prob.decoy2].sort().map((word, wIdx) => (
                            <span 
                              key={wIdx} 
                              className="text-[10px] sm:text-xs font-black font-mono px-2 py-0.5 bg-gray-100 rounded-md border border-gray-300 print:bg-white print:border-black/30 print:text-[9px]"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Message for Child */}
                <div className="mt-12 text-center text-xs font-extrabold text-orange-500/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "You are a Reading Superstar! Keep shining!" 🌟
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
