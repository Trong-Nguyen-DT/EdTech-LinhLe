import React, { useState, useEffect, useRef } from 'react';
import { Zap, Timer, Flame, Trophy, RotateCcw, ArrowLeft, Check, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../../types';
import { Storage } from '../../utils/storage';

interface Props {
  students: Student[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  onBackToHub: () => void;
}

interface SpeedProblem {
  question: string;
  answer: number;
  type: string;
}

export const SpeedFlashMathGame: React.FC<Props> = ({
  students,
  activeStudentId,
  onStudentSelect,
  onBackToHub
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<SpeedProblem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Generator for authentic THCS mental math problems
  const generateProblem = (): SpeedProblem => {
    const types = ['integers', 'powers', 'squares', 'linear_eq', 'percentage'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    switch (chosenType) {
      case 'integers': {
        const a = Math.floor(Math.random() * 30) - 15;
        const b = Math.floor(Math.random() * 30) - 15;
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
          return {
            question: `${a} + (${b})`,
            answer: a + b,
            type: 'Số nguyên'
          };
        } else {
          return {
            question: `${a} - (${b})`,
            answer: a - b,
            type: 'Số nguyên'
          };
        }
      }
      case 'squares': {
        const base = Math.floor(Math.random() * 11) + 4; // 4 to 14
        const sq = base * base;
        if (Math.random() > 0.5) {
          return {
            question: `√${sq}`,
            answer: base,
            type: 'Căn bậc hai'
          };
        } else {
          return {
            question: `${base}²`,
            answer: sq,
            type: 'Lũy thừa 2'
          };
        }
      }
      case 'powers': {
        const bases = [2, 3, 5, 10];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const exp = base === 2 ? Math.floor(Math.random() * 4) + 3 : 2; // 2^3 to 2^6 or 3^2, 5^2, 10^2
        return {
          question: `${base}^${exp}`,
          answer: Math.pow(base, exp),
          type: 'Lũy thừa'
        };
      }
      case 'linear_eq': {
        const xVal = Math.floor(Math.random() * 10) + 1;
        const a = Math.floor(Math.random() * 4) + 2; // 2 to 5
        const b = Math.floor(Math.random() * 15) + 1;
        const c = a * xVal + b;
        return {
          question: `${a}x + ${b} = ${c}  (tìm x)`,
          answer: xVal,
          type: 'Tìm ẩn x'
        };
      }
      case 'percentage': {
        const percents = [10, 20, 25, 50];
        const p = percents[Math.floor(Math.random() * percents.length)];
        const total = (Math.floor(Math.random() * 10) + 1) * 20;
        return {
          question: `${p}% của ${total}`,
          answer: (p * total) / 100,
          type: 'Tỉ số phần trăm'
        };
      }
      default:
        return { question: '12 + 15', answer: 27, type: 'Cộng' };
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setUserInput('');
    setCurrentProblem(generateProblem());
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Focus input on game start
  useEffect(() => {
    if (isPlaying) {
      inputRef.current?.focus();
    }
  }, [isPlaying, currentProblem]);

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);

    confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });

    if (activeStudent) {
      const totalAttempted = correctAnswers + wrongAnswers;
      const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;
      
      Storage.recordGameResult(
        activeStudent.id,
        'speed',
        score,
        Math.max(score, 500),
        60 - timeLeft,
        accuracy,
        {
          speed: Math.min(100, correctAnswers * 5 + 30),
          algebra: Math.min(100, 60 + correctAnswers * 2)
        }
      );
      Storage.updateDailyQuestProgress(activeStudent.id, 'speed', 1);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentProblem || userInput.trim() === '') return;

    const val = Number(userInput.trim());
    if (val === currentProblem.answer) {
      // Correct!
      const bonus = streak * 10;
      setScore(prev => prev + 50 + bonus);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
    } else {
      // Wrong
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
    }

    setUserInput('');
    setCurrentProblem(generateProblem());
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'DEL') {
      setUserInput(prev => prev.slice(0, -1));
    } else if (val === 'ENTER') {
      handleSubmit();
    } else if (val === '-') {
      if (userInput === '') setUserInput('-');
    } else {
      setUserInput(prev => prev + val);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Student Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
            {activeStudent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Học sinh:</span>
              <span className="font-bold text-sm text-white">{activeStudent.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold text-[11px] border border-amber-800/60">
                Mã: {activeStudent.studentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">Tốc độ hiện tại: <span className="text-amber-400 font-bold">{activeStudent.skills.speed}/100</span></p>
          </div>
        </div>

        <button
          onClick={onBackToHub}
          disabled={isPlaying}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition disabled:opacity-40"
        >
          ← Trở Về Sảnh Game
        </button>
      </div>

      {!isPlaying && !isGameOver && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl animate-pulse">
            ⚡
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Thần Tốc Tính Nhẩm (60 Giây)
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
              Rèn luyện phản xạ tính nhẩm số nguyên, phân số, lũy thừa, phương trình bậc nhất nhanh như chớp. Giải càng nhiều, điểm càng cao!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400">Thời Gian</span>
              <p className="text-lg font-black text-amber-400">60s</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400">Điểm Mỗi Câu</span>
              <p className="text-lg font-black text-emerald-400">+50đ</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400">Hỗ Trợ</span>
              <p className="text-lg font-black text-indigo-400">Bàn phím ảo</p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="py-4 px-10 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-base shadow-xl shadow-amber-500/30 transition transform hover:-translate-y-0.5 active:scale-95"
          >
            Bắt Đầu Đếm Ngược ⚡
          </button>
        </div>
      )}

      {isPlaying && currentProblem && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Thời Gian</span>
                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-400 animate-ping' : 'text-white'}`}>{timeLeft}s</p>
              </div>
              <Timer className="w-5 h-5 text-amber-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Điểm Số</span>
                <p className="text-2xl font-black text-amber-400">{score}</p>
              </div>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Chuỗi Đúng</span>
                <p className="text-2xl font-black text-rose-400">{streak} 🔥</p>
              </div>
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
          </div>

          {/* Flash Problem Board */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              {currentProblem.type}
            </span>

            <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-wider py-4">
              {currentProblem.question} = <span className="text-amber-400">?</span>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
              <input
                ref={inputRef}
                type="text"
                pattern="-?[0-9]*"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Gõ kết quả..."
                className="w-full text-center text-3xl font-mono font-bold py-3 px-4 rounded-2xl bg-slate-950 border-2 border-indigo-500 text-white focus:outline-none focus:border-amber-400 transition"
              />
            </form>

            {/* Touch Keypad for Tablets & Phones */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', 'DEL'].map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono font-bold text-lg border border-slate-700/80 transition shadow-sm"
                >
                  {key === 'DEL' ? <Delete className="w-5 h-5 mx-auto text-rose-400" /> : key}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSubmit()}
              className="w-full max-w-xs py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Check className="w-5 h-5" />
              Trả Lời Ngay (Enter)
            </button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
            ⚡
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hết Giờ! Kết Quả Tính Nhẩm
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Học sinh: <span className="text-white font-bold">{activeStudent.name}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Điểm</span>
              <p className="text-2xl font-black text-amber-400 mt-1">+{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Câu Đúng</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{correctAnswers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Câu Sai</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{wrongAnswers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Tốc Độ</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {Math.round(60 / Math.max(1, correctAnswers))}s/câu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={startGame}
              className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Thử Lại Trận Mới
            </button>
            <button
              onClick={onBackToHub}
              className="py-3 px-6 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition"
            >
              Trở Về Danh Sách Trò Chơi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
