import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Clock, Sparkles, HelpCircle, 
  RotateCcw, ArrowRight, CheckCircle2, XCircle, Award, 
  ChevronRight, Compass, ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeLevel, MathCategory, Question, Student } from '../../types';
import { Storage } from '../../utils/storage';
import { MathText } from '../common/MathText';

interface Props {
  students: Student[];
  questions: Question[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  onBackToHub: () => void;
  lockedGrade?: GradeLevel;
  lockedClassName?: string;
}

export const KnowledgeClimbGame: React.FC<Props> = ({
  students,
  questions,
  activeStudentId,
  onStudentSelect,
  onBackToHub,
  lockedGrade,
  lockedClassName
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(lockedGrade || 'Toán 8');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');

  useEffect(() => {
    if (lockedGrade) setSelectedGrade(lockedGrade);
  }, [lockedGrade]);
  
  // Game session states
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  
  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [usedAddTime, setUsedAddTime] = useState(false);
  
  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

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

  const effectiveGrade = lockedGrade || selectedGrade;

  const mcQuestions = questions.filter(
    q => q.questionType !== 'essay' && Array.isArray(q.options) && q.options.length === 4
  );

  const filteredQuestions = mcQuestions.filter(q => {
    const matchGrade = q.grade === effectiveGrade;
    const matchCat = selectedCategory === 'Tất cả' || q.category === selectedCategory;
    return matchGrade && matchCat;
  });

  const startClimb = () => {
    let pool = [...filteredQuestions];
    if (pool.length === 0) {
      pool = mcQuestions.filter(q => q.grade === effectiveGrade);
    }
    if (pool.length === 0) {
      pool = [...mcQuestions];
    }
    if (pool.length === 0) return;
    // Shuffle and pick up to 10 questions
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setSessionQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTotalTimeSpent(0);
    setUsed5050(false);
    setUsedHint(false);
    setUsedAddTime(false);
    setHiddenOptions([]);
    setShowHint(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setTimeLeft(shuffled[0]?.timeLimitSeconds || 25);
    setTimerActive(true);
    setGameState('playing');
  };

  // Timer countdown
  useEffect(() => {
    if (!timerActive || gameState !== 'playing' || isAnswerChecked) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, gameState, isAnswerChecked]);

  const handleTimeOut = () => {
    setIsAnswerChecked(true);
    setStreak(0);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(idx);
    setIsAnswerChecked(true);

    const currentQ = sessionQuestions[currentIndex];
    const isCorrect = idx === currentQ.correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.max(10, timeLeft * 4);
      const streakBonus = streak * 15;
      const questionScore = 100 + timeBonus + streakBonus;
      setScore(prev => prev + questionScore);
      setStreak(prev => prev + 1);
      setCorrectCount(prev => prev + 1);

      // Play soft mini confetti on streak
      if ((streak + 1) % 3 === 0) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < sessionQuestions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setHiddenOptions([]);
      setShowHint(false);
      setTimeLeft(sessionQuestions[nextIndex].timeLimitSeconds || 25);
    } else {
      // Completed!
      finishGame();
    }
  };

  const finishGame = () => {
    setGameState('completed');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (activeStudent) {
      const accuracy = sessionQuestions.length > 0 
        ? Math.round((correctCount / sessionQuestions.length) * 100) 
        : 0;

      Storage.recordGameResult(
        activeStudent.id,
        'climb',
        score,
        sessionQuestions.length * 200,
        totalTimeSpent,
        accuracy,
        {
          algebra: selectedCategory.includes('Đại số') ? accuracy : undefined,
          geometry: selectedCategory.includes('Hình học') ? accuracy : undefined,
          speed: Math.max(40, 100 - Math.round(totalTimeSpent / sessionQuestions.length * 3))
        }
      );
      Storage.updateDailyQuestProgress(activeStudent.id, 'climb', 1);
    }
  };

  // Lifelines
  const apply5050 = () => {
    if (used5050 || isAnswerChecked) return;
    const currentQ = sessionQuestions[currentIndex];
    const wrongIndices = currentQ.options
      .map((_, i) => i)
      .filter(i => i !== currentQ.correctAnswer);
    
    // Pick two random wrong indices
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
    setHiddenOptions(shuffledWrong.slice(0, 2));
    setUsed5050(true);
  };

  const applyHint = () => {
    if (usedHint || isAnswerChecked) return;
    setShowHint(true);
    setUsedHint(true);
  };

  const applyAddTime = () => {
    if (usedAddTime || isAnswerChecked) return;
    setTimeLeft(prev => prev + 15);
    setUsedAddTime(true);
  };

  const currentQ = sessionQuestions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Student Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
            {activeStudent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Học sinh:</span>
              <span className="font-bold text-sm text-white">{activeStudent.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono font-bold text-[11px] border border-indigo-800/60">
                Mã: {activeStudent.studentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">Chuỗi đúng: <span className="text-amber-400 font-bold">{activeStudent.streakCount} 🔥</span> | Điểm tích lũy: <span className="text-emerald-400 font-bold">{activeStudent.totalPoints}</span></p>
          </div>
        </div>

        <button
          onClick={onBackToHub}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
        >
          ← Trở Về Sảnh Game
        </button>
      </div>

      {gameState === 'setup' && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-4xl mb-2 animate-bounce">
            🏔️
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Leo Núi Tri Thức Toán Học
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mt-2">
              Chinh phục đỉnh Everest toán học qua 10 câu hỏi thử thách. Mỗi câu trả lời đúng sẽ đưa em lên một tầm cao mới cùng combo điểm số rực rỡ!
            </p>
          </div>

          {/* Grade selection (locked to student's class/grade when lockedGrade is set) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {lockedGrade ? 'Khối Lớp Của Em:' : 'Chọn Khối Lớp:'}
            </label>
            {lockedGrade ? (
              <div className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold bg-indigo-600 border border-indigo-400 text-white shadow-lg shadow-indigo-600/30">
                <span>{lockedClassName ? `${lockedClassName} · ${lockedGrade}` : lockedGrade}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                {(['Toán 6', 'Toán 7', 'Toán 8', 'Toán 9'] as GradeLevel[]).map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition border ${
                      selectedGrade === grade
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chọn Chủ Đề:</label>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {['Tất cả', 'Số học & Đại số', 'Hình học & Đo lường', 'Thống kê & Xác suất'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-3.5 rounded-lg text-xs font-semibold transition border ${
                    selectedCategory === cat
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={startClimb}
              disabled={filteredQuestions.length === 0}
              className="py-4 px-10 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
            >
              Bắt Đầu Leo Núi (10 Trạm) 🚀
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentQ && (
        <div className="space-y-6">
          {/* Header Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Mountain Progress */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Trạm Hiện Tại</span>
                <p className="text-lg font-black text-white">{currentIndex + 1} / {sessionQuestions.length}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {Math.round(((currentIndex + 1) / sessionQuestions.length) * 100)}%
              </div>
            </div>

            {/* Score */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Điểm Số</span>
                <p className="text-lg font-black text-amber-400">{score}</p>
              </div>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            {/* Streak */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Combo Chuỗi</span>
                <p className="text-lg font-black text-rose-400">{streak} 🔥</p>
              </div>
              <Flame className="w-5 h-5 text-rose-400" />
            </div>

            {/* Timer */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              timeLeft <= 7 
                ? 'bg-rose-950/40 border-rose-600/50 text-rose-300 animate-pulse' 
                : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Thời Gian</span>
                <p className="text-lg font-black">{timeLeft}s</p>
              </div>
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          {/* Mountain Progress Graphic Bar */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">⛺ Chân núi</span>
              <span className="flex items-center gap-1 font-bold text-amber-400">🚩 Đỉnh Everest (Trạm 10)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lifelines Bar */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold pl-2">Trợ giúp:</span>
            <div className="flex gap-2">
              <button
                onClick={apply5050}
                disabled={used5050 || isAnswerChecked}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
              >
                <span>50:50</span>
              </button>
              <button
                onClick={applyHint}
                disabled={usedHint || isAnswerChecked}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 border-amber-500/30 text-amber-300 hover:bg-amber-950/40"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Gợi ý</span>
              </button>
              <button
                onClick={applyAddTime}
                disabled={usedAddTime || isAnswerChecked}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40"
              >
                <span>+15s</span>
              </button>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                  {currentQ.grade}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  {currentQ.category}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium italic">
                Độ khó: {currentQ.difficulty}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              <MathText text={currentQ.prompt} />
            </h3>

            {/* Hint Box if revealed */}
            {showHint && currentQ.hint && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Gợi ý từ giáo viên:</strong> <MathText text={currentQ.hint} />
                </div>
              </div>
            )}

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                if (isHidden) {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-dashed border-slate-800 text-slate-600 text-sm italic text-center select-none"
                    >
                      (Đã loại trừ 50:50)
                    </div>
                  );
                }

                let btnStyles = "p-4 rounded-2xl border text-sm font-semibold text-left transition flex items-center justify-between ";
                if (!isAnswerChecked) {
                  btnStyles += "bg-slate-800/80 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-slate-100 hover:scale-[1.01]";
                } else {
                  if (idx === currentQ.correctAnswer) {
                    btnStyles += "bg-emerald-600/20 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-900/30";
                  } else if (idx === selectedAnswer) {
                    btnStyles += "bg-rose-600/20 border-rose-500 text-rose-200";
                  } else {
                    btnStyles += "bg-slate-900 border-slate-800 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerChecked}
                    onClick={() => handleSelectOption(idx)}
                    className={btnStyles}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-950/60 border border-slate-700/60 flex items-center justify-center text-xs font-mono font-bold text-slate-300 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <MathText text={opt} />
                    </span>

                    {isAnswerChecked && idx === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {isAnswerChecked && idx === selectedAnswer && idx !== currentQ.correctAnswer && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Button */}
            {isAnswerChecked && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Lời Giải Chi Tiết Của Giáo Viên:
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <MathText text={currentQ.explanation} />
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <span>{currentIndex + 1 < sessionQuestions.length ? 'Trạm Tiếp Theo' : 'Xem Kết Quả Đỉnh Núi'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed State */}
      {gameState === 'completed' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20">
            🏆
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Chúc Mừng Em Đã Chinh Phục Đỉnh Núi!
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Học sinh: <span className="text-white font-bold">{activeStudent.name}</span>
            </p>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Tổng Điểm</span>
              <p className="text-2xl font-black text-amber-400 mt-1">+{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Độ Chính Xác</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {sessionQuestions.length > 0 ? Math.round((correctCount / sessionQuestions.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Số Câu Đúng</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {correctCount} / {sessionQuestions.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Thời Gian</span>
              <p className="text-2xl font-black text-purple-400 mt-1">{totalTimeSpent}s</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={startClimb}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi Lại Trận Mới
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
