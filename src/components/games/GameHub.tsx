import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Zap, Mountain, BookmarkCheck, 
  Users, Sparkles, Play, Award, ChevronRight, HelpCircle,
  Gift, CheckCircle2, Circle, Star, Target, Calendar,
  ShieldCheck, ArrowUpRight, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassGroup, DailyQuestState, HomeStudyBadge, Student } from '../../types';
import { Storage } from '../../utils/storage';
import { WeekendHonorsModal } from '../reports/WeekendHonorsModal';

interface Props {
  students: Student[];
  classes?: ClassGroup[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  onSelectGame: (gameId: 'climb' | 'speed' | 'match' | 'team_arena' | 'wheel' | 'face_quiz') => void;
  onRequestChangeStudent?: () => void;
  onNavigateToKnowledge?: () => void;
  lockedClassId?: string | null;
}

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

export const GameHub: React.FC<Props> = ({
  students,
  classes,
  activeStudentId,
  onStudentSelect,
  onSelectGame,
  onRequestChangeStudent,
  onNavigateToKnowledge,
  lockedClassId
}) => {
  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || DEFAULT_STUDENT;
  
  // Daily Quests and Badges state
  const [questState, setQuestState] = useState<DailyQuestState>(() => {
    return Storage.getDailyQuests(activeStudent.id);
  });
  const [badges, setBadges] = useState<HomeStudyBadge[]>(() => {
    return Storage.getHomeStudyBadges(activeStudent.id);
  });
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showWeekendHonorsModal, setShowWeekendHonorsModal] = useState(false);

  useEffect(() => {
    if (activeStudent) {
      setQuestState(Storage.getDailyQuests(activeStudent.id));
      setBadges(Storage.getHomeStudyBadges(activeStudent.id));
    }
  }, [activeStudent.id, activeStudent.totalPoints, activeStudent.streakCount]);

  const completedQuestsCount = questState.quests.filter(q => q.completed).length;
  const allQuestsCompleted = completedQuestsCount === questState.quests.length;

  const handleClaimChest = () => {
    if (!allQuestsCompleted || questState.claimedDailyChest) return;
    const bonus = Storage.claimDailyRewardChest(activeStudent.id);
    if (bonus > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setQuestState(Storage.getDailyQuests(activeStudent.id));
    }
  };

  // Streak Multiplier
  const streak = activeStudent.streakCount || 1;
  let multiplierText = 'x1.0';
  let multiplierColor = 'text-amber-400';
  if (streak >= 14) {
    multiplierText = 'x2.0 (Siêu Sao)';
    multiplierColor = 'text-rose-400';
  } else if (streak >= 7) {
    multiplierText = 'x1.5 (Bậc Thầy)';
    multiplierColor = 'text-purple-400';
  } else if (streak >= 3) {
    multiplierText = 'x1.25 (Chăm Chỉ)';
    multiplierColor = 'text-amber-400';
  }

  // Days of week tracking (Mon-Sun)
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 is Monday
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* 1. HERO CARD: Student Profile & Code */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
            {activeStudent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">Chiến binh tự học:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-800/60">
                Mã: {activeStudent.studentCode}
              </span>
              {onRequestChangeStudent && (
                <button
                  onClick={onRequestChangeStudent}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                >
                  Đổi Mã Học Sinh
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">{activeStudent.name}</h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
              <span>Điểm thi đua: <strong className="text-amber-400 font-bold">{activeStudent.totalPoints} XP</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Chuỗi tự giác: <strong className="text-rose-400 font-bold">{streak} ngày 🔥</strong>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-black/40 ${multiplierColor}`}>
                  {multiplierText}
                </span>
              </span>
              <span>•</span>
              <span>Chính xác: <strong className="text-emerald-400 font-bold">{activeStudent.accuracyRate}%</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Skill & Badge Summary & Weekend Honors */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowWeekendHonorsModal(true)}
            className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-950/20 active:scale-95"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-amber-300 block font-normal">Vinh Danh Cuối Tuần</span>
              <span>Top 5 Tuần Này 🏆</span>
            </div>
          </button>

          <button
            onClick={() => setShowBadgeModal(true)}
            className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/30 text-amber-200 text-xs font-bold transition flex items-center gap-2"
          >
            <Award className="w-5 h-5 text-amber-400" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-amber-300 block font-normal">Huy Hiệu Tự Học</span>
              <span>{badges.filter(b => b.unlocked).length}/{badges.length} Đã Mở</span>
            </div>
          </button>
        </div>
      </div>

      {/* Inclusive Student Motivation Banner */}
      {activeStudent.isInclusive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/40 border border-teal-500/40 flex items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl shrink-0">
              🌱
            </div>
            <div>
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                <span>Chào Chiến Binh Hòa Nhập: {activeStudent.name}!</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  Bền Bỉ & Tự Tin
                </span>
              </h4>
              <p className="text-xs text-teal-200/90 mt-0.5 leading-relaxed">
                Mỗi bài tập toán em rèn luyện mỗi ngày là một chiến thắng của sự kiên trì. Cuối tuần này em hãy cùng hướng đến danh hiệu <strong>Ngôi Sao Nỗ Lực Hòa Nhập</strong> nhé!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWeekendHonorsModal(true)}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
          >
            Xem Tuyên Dương
          </button>
        </div>
      )}

      {/* 2. KHU VỰC THI ĐUA TỰ HỌC TẠI NHÀ (DAILY QUESTS & STREAK MOTIVATION) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Thi Đua Tự Học Tại Nhà - Nhiệm Vụ Hôm Nay</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {completedQuestsCount}/{questState.quests.length} Hoàn thành
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Rèn luyện thói quen tự học đều đặn mỗi tối. Tích lũy XP để leo bảng vinh danh và nhận rương quà siêu cấp!
              </p>
            </div>
          </div>

          {/* Weekly Attendance Check */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Tuần này:</span>
            {weekDays.map((day, idx) => {
              const isPastOrToday = idx <= currentDayIndex;
              const isToday = idx === currentDayIndex;
              return (
                <div
                  key={day}
                  className={`w-7 h-7 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition ${
                    isToday
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-950 ring-2 ring-rose-400/50'
                      : isPastOrToday
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                  title={isToday ? 'Hôm nay' : day}
                >
                  <span>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Daily Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {questState.quests.map((quest) => {
            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  quest.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{quest.icon}</span>
                    <span className="text-xs font-black text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      +{quest.rewardPoints} XP
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {quest.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {quest.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {quest.currentCount}/{quest.targetCount}
                  </span>
                  {quest.completed ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Đang thực hiện</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Bonus Chest Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
              🎁
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Rương Quà Siêu Cấp Tự Giác Ngày</span>
                <span className="text-xs font-mono font-extrabold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded">
                  +120 XP & Tăng Chuỗi
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                {allQuestsCompleted 
                  ? (questState.claimedDailyChest ? '🎉 Bạn đã nhận rương quà hôm nay! Hãy giữ phong độ vào ngày mai nhé.' : '✨ Xuất sắc! Tất cả nhiệm vụ đã xong. Mở rương nhận thưởng ngay!')
                  : `Cần hoàn thành thêm ${questState.quests.length - completedQuestsCount} nhiệm vụ hôm nay để mở khóa rương.`}
              </p>
            </div>
          </div>

          <div>
            {questState.claimedDailyChest ? (
              <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Đã Nhận Quà
              </span>
            ) : (
              <button
                disabled={!allQuestsCompleted}
                onClick={handleClaimChest}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Gift className="w-4 h-4" />
                <span>Mở Rương (+120 XP)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECTION TRÒ CHƠI CÁ NHÂN (LUYỆN TẬP TỰ HỌC TẠI NHÀ) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-indigo-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Đấu Trường Luyện Tập & Chinh Phục Cá Nhân
              </h3>
            </div>
            <p className="text-xs text-slate-400 ml-4.5 mt-0.5">
              Học sinh chủ động chọn màn thử thách để củng cố kiến thức từng bài học Toán THCS.
            </p>
          </div>

          {onNavigateToKnowledge && (
            <button
              onClick={onNavigateToKnowledge}
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Xem Kiến Thức Trọng Tâm</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Game 1: Leo Núi Tri Thức */}
          <div 
            onClick={() => onSelectGame('climb')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-indigo-950/40 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-900/30 group-hover:scale-110 transition">
                🏔️
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">
                  Leo Núi Tri Thức
                </h4>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  +100 XP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vượt qua 10 trạm câu hỏi trắc nghiệm Toán 6, 7, 8, 9 có tính giờ, sử dụng quyền trợ giúp 50:50 và nhận lời giải chi tiết.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Chinh phục ngay (10 trạm)</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Game 2: Thần Tốc Tính Nhẩm */}
          <div 
            onClick={() => onSelectGame('speed')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/80 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-amber-950/40 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-900/30 group-hover:scale-110 transition">
                ⚡
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white group-hover:text-amber-400 transition">
                  Thần Tốc Tính Nhẩm
                </h4>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  +80 XP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Thử thách 60 giây phản xạ tính số nguyên, lũy thừa, căn bậc hai và phương trình bậc nhất siêu tốc với bàn phím ảo.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Bứt phá 60 giây</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Game 3: Ghép Thẻ Công Thức */}
          <div 
            onClick={() => onSelectGame('match')}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/80 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-purple-950/40 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-900/30 group-hover:scale-110 transition">
                🃏
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition">
                  Nối Cặp Công Thức
                </h4>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  +50 XP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lật thẻ ghi nhớ 7 hằng đẳng thức đáng nhớ, định lý Pytago, hệ thức Vi-ét và các công thức diện tích hình học THCS.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>Lật thẻ trí nhớ</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION TRÒ CHƠI TẬP THỂ & THI ĐẤU LỚP */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-rose-500" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Đấu Trường Tập Thể - Máy Chiếu & Giờ Học Trên Lớp
            </h3>
          </div>
          <p className="text-xs text-slate-400 ml-4.5 mt-0.5">
            Dành cho máy chiếu hoặc màn hình TV thông minh khi giáo viên tổ chức thi đua trực tiếp giữa các tổ!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Team Arena Battle */}
          <div 
            onClick={() => onSelectGame('team_arena')}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 hover:border-rose-400 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-rose-900/30 group-hover:scale-110 transition">
                  ⚔️
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-extrabold uppercase">
                  Chia 2 - 4 Đội
                </span>
              </div>
              <h4 className="text-xl font-black text-white group-hover:text-rose-400 transition">
                Đấu Trường Đồng Đội (Team Arena)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chia lớp thành các đội: Rồng Lửa, Phượng Hoàng, Kỳ Lân, Sư Tử. Các đội bấm chuông giành quyền trả lời, nhận điểm thưởng và vinh danh đội vô địch!
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Bắt đầu trận đấu tập thể</span>
              <Play className="w-4 h-4 fill-rose-400" />
            </div>
          </div>

          {/* Lucky Wheel */}
          <div 
            onClick={() => onSelectGame('wheel')}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/30 group-hover:scale-110 transition">
                  🎡
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase">
                  Kiểm tra ngẫu nhiên
                </span>
              </div>
              <h4 className="text-xl font-black text-white group-hover:text-emerald-400 transition">
                Vòng Quay May Mắn (Khởi Động Tiết Học)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Quay số ngẫu nhiên chọn học sinh lên bảng hoặc nhận câu hỏi bất ngờ với âm thanh hào hứng và hiệu ứng pháo hoa sôi động.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Mở vòng quay lớp học</span>
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
          </div>

          {/* Face Control Webcam Math Game */}
          <div 
            onClick={() => onSelectGame('face_quiz')}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-900 border border-blue-500/40 hover:border-sky-400 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-900/30 group-hover:scale-110 transition">
                  🎥
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-extrabold uppercase">
                  Webcam AI · Lớp 3-10
                </span>
              </div>
              <h4 className="text-xl font-black text-white group-hover:text-sky-400 transition">
                Toán Tương Tác Khuôn Mặt (Nghiêng Đầu A/B)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gemini AI tạo 10 câu Kết nối tri thức. Nghiêng đầu trái/phải chọn đáp án A/B và há miệng chuyển câu nhanh ngay trên máy chiếu!
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Mở đấu trường Webcam AI</span>
              <Play className="w-4 h-4 fill-sky-400" />
            </div>
          </div>
        </div>
      </div>

      {/* BADGE SHOWCASE MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏅</span>
                <div>
                  <h3 className="text-xl font-black text-white">Bảng Huy Hiệu Tự Học</h3>
                  <p className="text-xs text-slate-400">
                    Thành tích tự rèn luyện tại nhà của {activeStudent.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    b.unlocked
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    b.unlocked ? 'bg-amber-500/20 border border-amber-500/40 shadow-inner' : 'bg-slate-800'
                  }`}>
                    {b.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{b.title}</h4>
                      {b.unlocked ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Đã đạt
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          Chưa mở
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{b.description}</p>
                    <p className="text-[11px] text-amber-400/90 font-mono">
                      Điều kiện: {b.requirement}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowBadgeModal(false)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekend Top 5 Honors Announcement Modal */}
      <WeekendHonorsModal
        isOpen={showWeekendHonorsModal}
        onClose={() => setShowWeekendHonorsModal(false)}
        classes={classes || Storage.getClasses()}
        currentStudentId={activeStudent.id}
        lockedClassId={lockedClassId}
      />
    </div>
  );
};

