import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Clock, RotateCcw, CheckCircle2, BookmarkCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FormulaCard, Student } from '../../types';
import { FORMULA_CARDS } from '../../data/initialData';
import { Storage } from '../../utils/storage';
import { MathText } from '../common/MathText';

interface Props {
  students: Student[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  onBackToHub: () => void;
}

interface ShuffledCard extends FormulaCard {
  isFlipped: boolean;
  isMatched: boolean;
  uniqueKey: string;
}

export const FormulaMatchGame: React.FC<Props> = ({
  students,
  activeStudentId,
  onStudentSelect,
  onBackToHub
}) => {
  const [cards, setCards] = useState<ShuffledCard[]>([]);
  const [firstCard, setFirstCard] = useState<ShuffledCard | null>(null);
  const [secondCard, setSecondCard] = useState<ShuffledCard | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [turns, setTurns] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const DEFAULT_STUDENT: Student = {
    id: 'guest',
    name: 'Học sinh Toán THCS',
    classId: 'class-6a1',
    avatar: '👨‍🎓',
    totalPoints: 1000,
    streakCount: 3,
    gamesPlayed: 5,
    accuracyRate: 85,
    studentCode: 'HS801',
    parentCode: 'PH801',
    username: 'hs801',
    password: '123456',
    parentUsername: 'ph801',
    parentPassword: '123456',
    skills: { algebra: 85, geometry: 85, statistics: 85, speed: 85 },
    recentResults: []
  };

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || DEFAULT_STUDENT;

  const initializeCards = () => {
    // Pick 6 pairs (12 cards)
    const selected = FORMULA_CARDS.slice(0, 12);
    const shuffled: ShuffledCard[] = selected
      .sort(() => Math.random() - 0.5)
      .map((card, idx) => ({
        ...card,
        isFlipped: false,
        isMatched: false,
        uniqueKey: `${card.id}-${idx}`
      }));

    setCards(shuffled);
    setFirstCard(null);
    setSecondCard(null);
    setTurns(0);
    setMatchedPairs(0);
    setTimer(0);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initializeCards();
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying || isCompleted) return;
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isCompleted]);

  const handleCardClick = (card: ShuffledCard) => {
    if (disabled || card.isFlipped || card.isMatched) return;

    // Flip card
    setCards(prev =>
      prev.map(c => (c.uniqueKey === card.uniqueKey ? { ...c, isFlipped: true } : c))
    );

    if (!firstCard) {
      setFirstCard(card);
    } else {
      setSecondCard(card);
      setDisabled(true);
      setTurns(prev => prev + 1);
    }
  };

  // Compare cards
  useEffect(() => {
    if (firstCard && secondCard) {
      if (firstCard.matchId === secondCard.matchId) {
        // Matched!
        setCards(prev =>
          prev.map(c =>
            c.matchId === firstCard.matchId ? { ...c, isMatched: true } : c
          )
        );
        setMatchedPairs(prev => prev + 1);
        resetTurn();

        // Check if all matched
        if (matchedPairs + 1 === 6) {
          handleVictory();
        }
      } else {
        // Not matched, flip back after 1s
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.uniqueKey === firstCard.uniqueKey || c.uniqueKey === secondCard.uniqueKey
                ? { ...c, isFlipped: false }
                : c
            )
          );
          resetTurn();
        }, 900);
      }
    }
  }, [firstCard, secondCard]);

  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setDisabled(false);
  };

  const handleVictory = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    if (activeStudent) {
      const calculatedScore = Math.max(100, 600 - turns * 15 - timer * 2);
      const accuracy = Math.round((6 / Math.max(6, turns)) * 100);

      Storage.recordGameResult(
        activeStudent.id,
        'match',
        calculatedScore,
        600,
        timer,
        accuracy,
        {
          geometry: 88,
          algebra: 90
        }
      );
      Storage.updateDailyQuestProgress(activeStudent.id, 'match', 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
            {activeStudent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Học sinh:</span>
              <span className="font-bold text-sm text-white">{activeStudent.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold text-[11px] border border-purple-800/60">
                Mã: {activeStudent.studentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">Trò chơi lật thẻ rèn trí nhớ & công thức Toán THCS</p>
          </div>
        </div>

        <button
          onClick={onBackToHub}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
        >
          ← Trở Về Sảnh Game
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Đã Khớp</span>
            <p className="text-lg font-black text-emerald-400">{matchedPairs} / 6 cặp</p>
          </div>
          <BookmarkCheck className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Số Lượt Lật</span>
            <p className="text-lg font-black text-indigo-400">{turns} lượt</p>
          </div>
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Thời Gian</span>
            <p className="text-lg font-black text-amber-400">{timer}s</p>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {cards.map(card => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.uniqueKey}
              onClick={() => handleCardClick(card)}
              disabled={isRevealed || disabled}
              className={`h-36 sm:h-40 rounded-2xl p-4 transition-all duration-300 transform flex flex-col justify-between text-left select-none border ${
                card.isMatched
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20 opacity-80 cursor-default'
                  : isRevealed
                  ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-400 shadow-xl'
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 cursor-pointer active:scale-95'
              }`}
            >
              {isRevealed ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-indigo-300">
                      {card.category}
                    </span>
                    {card.isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="my-auto text-center">
                    <p className="text-base sm:text-lg font-extrabold text-white font-mono leading-snug">
                      <MathText text={card.content} />
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    {card.title}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-70">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg text-indigo-400 font-bold font-mono">
                    ?
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">Toán Học</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isCompleted && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
            🏆
          </div>
          <h3 className="text-xl font-bold text-white">Xuất Sắc! Em Đã Khớp Hết Các Công Thức</h3>
          <p className="text-sm text-slate-300">
            Hoàn thành trong <strong className="text-amber-400">{timer} giây</strong> với <strong className="text-indigo-400">{turns} lượt lật</strong>.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initializeCards}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi Lại Ván Mới
            </button>
            <button
              onClick={onBackToHub}
              className="py-2.5 px-5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              Về Sảnh Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
