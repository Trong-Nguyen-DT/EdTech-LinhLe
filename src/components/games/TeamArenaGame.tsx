import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Zap, Clock, Flame, Award, 
  RotateCcw, Play, CheckCircle2, XCircle, ArrowRight, 
  Sliders, Volume2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeLevel, Question, Student, TeamScore } from '../../types';
import { MathText } from '../common/MathText';

interface Props {
  students: Student[];
  questions: Question[];
  onBackToHub: () => void;
  lockedGrade?: GradeLevel;
  lockedClassName?: string;
}

const DEFAULT_TEAMS: TeamScore[] = [
  { id: 'team-1', name: 'Rồng Xanh', color: 'from-blue-600 to-cyan-500', score: 0, members: [], streak: 0 },
  { id: 'team-2', name: 'Phượng Đỏ', color: 'from-red-600 to-rose-500', score: 0, members: [], streak: 0 },
  { id: 'team-3', name: 'Hổ Vàng', color: 'from-amber-500 to-yellow-400', score: 0, members: [], streak: 0 },
  { id: 'team-4', name: 'Sư Tử Tím', color: 'from-purple-600 to-indigo-500', score: 0, members: [], streak: 0 },
];

export const TeamArenaGame: React.FC<Props> = ({ students, questions, onBackToHub, lockedGrade, lockedClassName }) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(lockedGrade || 'Toán 8');

  useEffect(() => {
    if (lockedGrade) setSelectedGrade(lockedGrade);
  }, [lockedGrade]);
  const [teamCount, setTeamCount] = useState<number>(4);
  const [teams, setTeams] = useState<TeamScore[]>(DEFAULT_TEAMS);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'round_result' | 'game_over'>('lobby');
  
  const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [answeringTeamId, setAnsweringTeamId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lastRoundEvent, setLastRoundEvent] = useState<string>('');

  // Auto distribute students into teams
  const distributeStudents = () => {
    const activeTeams = DEFAULT_TEAMS.slice(0, teamCount).map(t => ({ ...t, members: [] as string[], score: 0, streak: 0 }));
    students.forEach((student, index) => {
      const teamIdx = index % teamCount;
      activeTeams[teamIdx].members.push(student.name);
    });
    setTeams(activeTeams);
  };

  useEffect(() => {
    distributeStudents();
  }, [teamCount, students]);

  const startTournament = () => {
    const effectiveGrade = lockedGrade || selectedGrade;
    const mcQuestions = questions.filter(
      q => q.questionType !== 'essay' && Array.isArray(q.options) && q.options.length === 4
    );
    const pool = mcQuestions.filter(q => q.grade === effectiveGrade);
    const sourcePool = pool.length >= 6 ? pool : mcQuestions;
    if (sourcePool.length === 0) return;
    const shuffled = [...sourcePool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8); // 8 intense battle rounds

    setBattleQuestions(shuffled);
    setCurrentRound(0);
    setAnsweringTeamId(null);
    setSelectedAnswer(null);
    setLastRoundEvent('');
    setRoundTimeLeft(25);
    setTimerRunning(true);
    setGameState('playing');
  };

  // Timer
  useEffect(() => {
    if (!timerRunning || gameState !== 'playing') return;

    if (roundTimeLeft <= 0) {
      handleRoundTimeout();
      return;
    }

    const t = setInterval(() => {
      setRoundTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [timerRunning, roundTimeLeft, gameState]);

  const handleRoundTimeout = () => {
    setTimerRunning(false);
    setLastRoundEvent('Hết thời gian! Không đội nào giành được điểm vòng này.');
    setGameState('round_result');
  };

  const currentQ = battleQuestions[currentRound];

  // Buzzer pressed by team
  const handleTeamBuzz = (teamId: string) => {
    if (answeringTeamId) return; // already buzzed
    setAnsweringTeamId(teamId);
  };

  // Team confirms answer
  const handleAnswerSubmit = (optionIndex: number) => {
    if (!answeringTeamId || !currentQ || selectedAnswer !== null) return;
    
    setSelectedAnswer(optionIndex);
    setTimerRunning(false);

    const isCorrect = optionIndex === currentQ.correctAnswer;
    const team = teams.find(t => t.id === answeringTeamId);
    if (!team) return;

    if (isCorrect) {
      // Speed bonus: faster answering gives more points!
      const speedBonus = Math.max(20, roundTimeLeft * 5);
      const pointsWon = 100 + speedBonus + team.streak * 20;

      setTeams(prev => prev.map(t => {
        if (t.id === answeringTeamId) {
          return {
            ...t,
            score: t.score + pointsWon,
            streak: t.streak + 1,
            lastAnswerTime: 25 - roundTimeLeft
          };
        }
        return t;
      }));

      setLastRoundEvent(`Đội ${team.name} trả lời CHÍNH XÁC trong ${25 - roundTimeLeft}s! (+${pointsWon} điểm)`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      // Penalty or pass
      setTeams(prev => prev.map(t => {
        if (t.id === answeringTeamId) {
          return {
            ...t,
            score: Math.max(0, t.score - 30),
            streak: 0
          };
        }
        return t;
      }));
      setLastRoundEvent(`Đội ${team.name} trả lời chưa chính xác (-30 điểm).`);
    }

    setGameState('round_result');
  };

  const handleNextRound = () => {
    if (currentRound + 1 < battleQuestions.length) {
      setCurrentRound(prev => prev + 1);
      setAnsweringTeamId(null);
      setSelectedAnswer(null);
      setLastRoundEvent('');
      setRoundTimeLeft(25);
      setTimerRunning(true);
      setGameState('playing');
    } else {
      // End game
      setGameState('game_over');
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }
  };

  // Sort teams by score for leaderboard
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl">
            ⚔️
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Đấu Trường Toán Học - Thi Đấu Đội Nhóm
            </h2>
            <p className="text-xs text-slate-400">Chế độ máy chiếu / thi đấu tập thể trên lớp</p>
          </div>
        </div>

        <button
          onClick={onBackToHub}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
        >
          ← Trở Về Sảnh Game
        </button>
      </div>

      {/* LOBBY / SETUP */}
      {gameState === 'lobby' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-4xl shadow-xl shadow-rose-950/40">
              ⚔️
            </div>
            <h2 className="text-3xl font-black text-white">Thiết Lập Đấu Trường Tập Thể</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Giáo viên chia lớp thành các đội đối kháng. Các đội cùng nhìn bảng/máy chiếu, bấm chuông giành quyền trả lời và tranh đoạt Cúp Vô Địch!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Options */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Cấu Hình Trận Đấu
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Khối Lớp:</label>
                {lockedGrade ? (
                  <div className="inline-flex items-center py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 border border-indigo-400 text-white">
                    {lockedClassName ? `${lockedClassName} · ${lockedGrade}` : lockedGrade}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {(['Toán 6', 'Toán 7', 'Toán 8', 'Toán 9'] as GradeLevel[]).map(g => (
                      <button
                        key={g}
                        onClick={() => setSelectedGrade(g)}
                        className={`py-2 rounded-xl text-xs font-bold transition border ${
                          selectedGrade === g
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Số Lượng Đội Thi:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setTeamCount(num)}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${
                        teamCount === num
                          ? 'bg-rose-600 border-rose-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {num} Đội
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={distributeStudents}
                  className="w-full py-2.5 rounded-xl border border-dashed border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/20 text-xs font-semibold transition"
                >
                  🎲 Tự Động Chia Lại Thành Viên Lớp Học
                </button>
              </div>
            </div>

            {/* Teams Roster Preview */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                Đội Hình Thi Đấu ({teams.length} Đội)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {teams.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${t.color}`} />
                      <span className="font-bold text-xs text-white">Đội {t.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {t.members.length > 0 ? t.members.join(', ') : 'Chưa có thành viên'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={startTournament}
              className="py-4 px-10 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-base shadow-2xl shadow-rose-950 transition transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5 fill-current" />
              Khai Mạc Đấu Trường (8 Hiệp Đấu)
            </button>
          </div>
        </div>
      )}

      {/* PLAYING ARENA */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-6">
          {/* Live Leaderboard Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {teams.map(team => (
              <div 
                key={team.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  answeringTeamId === team.id
                    ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/20'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${team.color}`} />
                    <span className="font-black text-xs text-white">{team.name}</span>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">{team.streak > 0 ? `🔥${team.streak}` : ''}</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-black text-white">{team.score}</span>
                  <span className="text-[10px] text-slate-400">điểm</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Question Display (Projector Mode) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                Hiệp {currentRound + 1} / {battleQuestions.length} • {currentQ.category}
              </span>

              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-sm border ${
                roundTimeLeft <= 7 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' 
                  : 'bg-slate-950 border-slate-700 text-white'
              }`}>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{roundTimeLeft} giây</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-relaxed text-center py-4">
              <MathText text={currentQ.prompt} />
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={!answeringTeamId || selectedAnswer !== null}
                  onClick={() => handleAnswerSubmit(idx)}
                  className={`p-5 rounded-2xl border-2 text-left font-bold text-base transition flex items-center justify-between ${
                    answeringTeamId && selectedAnswer === null
                      ? 'bg-slate-800/90 border-indigo-500 text-white hover:bg-indigo-600/20 cursor-pointer active:scale-98'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-sm text-indigo-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <MathText text={opt} />
                  </span>
                </button>
              ))}
            </div>

            {/* Team Buzzer Bar */}
            <div className="pt-6 border-t border-slate-800 text-center space-y-3">
              {!answeringTeamId ? (
                <div>
                  <p className="text-xs text-amber-400 font-bold mb-3 uppercase tracking-wider animate-bounce">
                    🔔 Bấm chuông giành quyền trả lời câu hỏi:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {teams.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleTeamBuzz(t.id)}
                        className={`py-4 px-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r ${t.color} hover:brightness-110 active:scale-95 shadow-lg transition flex items-center justify-center gap-2`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>{t.name} BẤM!</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 animate-spin" />
                  Đội <strong className="text-white underline">{teams.find(t => t.id === answeringTeamId)?.name}</strong> đã giành được quyền trả lời! Hãy chọn đáp án ở trên.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROUND RESULT MODAL / BANNER */}
      {gameState === 'round_result' && currentQ && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl">
            {selectedAnswer === currentQ.correctAnswer ? '🎉' : '⏱️'}
          </div>

          <h3 className="text-2xl font-black text-white">{lastRoundEvent}</h3>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-lg mx-auto text-left space-y-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 flex-wrap">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Đáp án đúng: {String.fromCharCode(65 + currentQ.correctAnswer)}.</span>
              <MathText text={currentQ.options[currentQ.correctAnswer]} />
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Giải thích:</strong> <MathText text={currentQ.explanation} />
            </p>
          </div>

          <button
            onClick={handleNextRound}
            className="py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition inline-flex items-center gap-2 shadow-xl shadow-indigo-600/30"
          >
            <span>{currentRound + 1 < battleQuestions.length ? 'Sang Hiệp Kế Tiếp' : 'Xem Bảng Tổng Sắp Cuối Cùng'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* GAME OVER PODIUM */}
      {gameState === 'game_over' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-8">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/20">
            👑
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Vinh Danh Nhà Vô Địch Toán Học
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Khép lại 8 hiệp đấu kịch tính và gay cấn!
            </p>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto items-end pt-6">
            {/* Rank 2 */}
            {sortedTeams[1] && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                <span className="text-2xl">🥈</span>
                <span className="text-xs font-bold text-slate-300 mt-1">Hạng 2</span>
                <p className="font-black text-white mt-1">{sortedTeams[1].name}</p>
                <span className="text-sm font-bold text-indigo-400 mt-0.5">{sortedTeams[1].score} điểm</span>
              </div>
            )}

            {/* Rank 1 (Champion) */}
            {sortedTeams[0] && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-950 border-2 border-amber-500 flex flex-col items-center transform -translate-y-4 shadow-xl shadow-amber-500/10">
                <span className="text-4xl animate-bounce">🥇</span>
                <span className="text-xs font-extrabold text-amber-400 mt-1 uppercase tracking-wider">Vô Địch</span>
                <p className="text-lg font-black text-white mt-1">{sortedTeams[0].name}</p>
                <span className="text-lg font-black text-amber-400 mt-0.5">{sortedTeams[0].score} điểm</span>
              </div>
            )}

            {/* Rank 3 */}
            {sortedTeams[2] && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                <span className="text-2xl">🥉</span>
                <span className="text-xs font-bold text-amber-600 mt-1">Hạng 3</span>
                <p className="font-black text-white mt-1">{sortedTeams[2].name}</p>
                <span className="text-sm font-bold text-indigo-400 mt-0.5">{sortedTeams[2].score} điểm</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={startTournament}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Thi Đấu Trận Mới
            </button>
            <button
              onClick={onBackToHub}
              className="py-3 px-6 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition"
            >
              Trở Về Sảnh Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
