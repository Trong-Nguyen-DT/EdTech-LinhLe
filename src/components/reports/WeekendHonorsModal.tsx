import React, { useState } from 'react';
import { 
  Trophy, Medal, Sparkles, Copy, Check, Share2, 
  Heart, Flame, Target, Award, Calendar, Users, 
  Send, X, Printer, RefreshCw, Volume2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassGroup, Student, WeekendTopReport } from '../../types';
import { Storage } from '../../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  currentStudentId?: string | null;
  lockedClassId?: string | null;
}

export const WeekendHonorsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  classes,
  currentStudentId,
  lockedClassId
}) => {
  // Find current student's class so it defaults directly to their own class
  const initialClassId = () => {
    if (lockedClassId) return lockedClassId;
    if (currentStudentId) {
      const allStudents = Storage.getStudents();
      const st = allStudents.find(s => s.id === currentStudentId);
      if (st?.classId) return st.classId;
    }
    return classes[0]?.id || 'class-8a3';
  };

  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [report, setReport] = useState<WeekendTopReport>(() => 
    Storage.generateWeekendTopReport(initialClassId())
  );
  const [copied, setCopied] = useState(false);

  // Sync if currentStudentId or lockedClassId changes
  React.useEffect(() => {
    const cid = initialClassId();
    setSelectedClassId(cid);
    setReport(Storage.generateWeekendTopReport(cid));
  }, [currentStudentId, lockedClassId, isOpen]);

  if (!isOpen) return null;

  const currentClassObj = classes.find(c => c.id === selectedClassId);

  const handleClassChange = (classId: string) => {
    if (lockedClassId && classId !== lockedClassId) return;
    setSelectedClassId(classId);
    const newReport = Storage.generateWeekendTopReport(classId);
    setReport(newReport);
  };

  const handleRefresh = () => {
    const updated = Storage.generateWeekendTopReport(selectedClassId);
    setReport(updated);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleCopyZalo = () => {
    navigator.clipboard.writeText(report.teacherMessage);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-500/40 text-amber-300',
          badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30',
          icon: '🥇'
        };
      case 2:
        return {
          bg: 'from-slate-400/20 via-slate-300/10 to-slate-400/20 border-slate-400/40 text-slate-200',
          badge: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-black shadow-lg',
          icon: '🥈'
        };
      case 3:
        return {
          bg: 'from-amber-700/20 via-orange-600/10 to-amber-700/20 border-amber-700/40 text-amber-200',
          badge: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black shadow-lg',
          icon: '🥉'
        };
      default:
        return {
          bg: 'bg-slate-800/60 border-slate-700/60 text-slate-300',
          badge: 'bg-indigo-600/40 text-indigo-300 font-bold',
          icon: `#${rank}`
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl my-6 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/30 overflow-hidden text-slate-100">
        
        {/* Top Decorative Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-amber-900/40 via-indigo-950/60 to-slate-950 border-b border-amber-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Bản Tin Cuối Tuần • Thi Đua Nội Bộ Lớp
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                🏆 Top 5 Xuất Sắc - {currentClassObj?.name || 'Lớp Học'} ({currentClassObj?.grade || 'THCS'})
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{report.generatedDate}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Chỉ tranh thứ hạng giữa các bạn cùng lớp</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyZalo}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã sao chép Zalo!' : 'Sao chép gửi Zalo'}
              </button>

              <button
                onClick={handleRefresh}
                title="Cập nhật kết quả mới nhất"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrint}
                title="In bản tin"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Class Filter Tabs (Only individual classes, locked to student's class when lockedClassId is set) */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
            {lockedClassId ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
                  <Users className="w-3.5 h-3.5" /> Lớp thi đua:
                </span>
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5">
                  <span>{currentClassObj?.name || 'Lớp của em'}</span>
                  {currentClassObj?.grade && (
                    <span className="text-[10px] opacity-80 font-bold">({currentClassObj.grade})</span>
                  )}
                </span>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
                  <Users className="w-3.5 h-3.5" /> Chọn lớp thi đua:
                </span>
                {classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleClassChange(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      selectedClassId === c.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">({c.grade})</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Top 1, 2, 3 Podium Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {report.topStudents.slice(0, 3).map(student => {
              const badge = getRankBadge(student.rank);
              const isCurrent = currentStudentId === student.studentId;

              return (
                <div
                  key={student.studentId}
                  className={`relative p-5 rounded-2xl bg-gradient-to-b ${badge.bg} border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                    isCurrent ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${badge.badge}`}>
                      {badge.icon}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/60 text-slate-300">
                      {student.className}
                    </span>
                  </div>

                  <div className="text-center my-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-3xl shadow-inner mb-2">
                      {student.avatar}
                    </div>
                    <h3 className="font-black text-white text-base truncate" title={student.studentName}>
                      {student.studentName}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-300/90 mt-0.5">
                      {student.highlightTitle}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Con/Em của bạn
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3 text-orange-400" /> XP
                      </div>
                      <div className="text-xs font-black text-white">{student.weeklyPoints}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <Target className="w-3 h-3 text-emerald-400" /> Đúng
                      </div>
                      <div className="text-xs font-black text-emerald-400">{student.accuracyRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <Award className="w-3 h-3 text-amber-400" /> Chuỗi
                      </div>
                      <div className="text-xs font-black text-amber-400">{student.streakCount}d</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top 4 and 5 List */}
          {report.topStudents.length > 3 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-indigo-400" />
                Vinh Danh Hạng 4 & Hạng 5
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.topStudents.slice(3, 5).map(student => (
                  <div
                    key={student.studentId}
                    className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-black text-xs flex items-center justify-center">
                        #{student.rank}
                      </span>
                      <div className="text-2xl">{student.avatar}</div>
                      <div>
                        <div className="font-bold text-white text-sm">{student.studentName}</div>
                        <div className="text-[11px] text-slate-400">{student.className} • {student.highlightTitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-amber-400 text-xs">{student.weeklyPoints} XP</div>
                      <div className="text-[10px] text-emerald-400">{student.accuracyRate}% đúng</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPECIAL AWARD: NGÔI SAO NỖ LỰC HÒA NHẬP (Inclusive Star) */}
          {report.inclusiveStar && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-emerald-950/40 to-slate-900 border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
                    🌈
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      Tuyên Dương Đặc Biệt • Giáo Dục Hòa Nhập
                    </div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      {report.inclusiveStar.studentName} ({report.inclusiveStar.className})
                    </h4>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      {report.inclusiveStar.highlightTitle} — Kiên trì vượt qua khó khăn, hoàn thành xuất sắc các bài tập rèn luyện cá nhân!
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center">
                    <span className="text-[10px] text-slate-400 block">Tích lũy tuần</span>
                    <strong className="text-emerald-400 font-black text-sm">{report.inclusiveStar.weeklyPoints} XP</strong>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center">
                    <span className="text-[10px] text-slate-400 block">Chuỗi tự học</span>
                    <strong className="text-amber-400 font-black text-sm">{report.inclusiveStar.streakCount} ngày 🔥</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Zalo Message Preview with Copy Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Mẫu Tin Nhắn Zalo Chuẩn Bị Gửi Phụ Huynh & Học Sinh:
              </label>
              <button
                onClick={handleCopyZalo}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép!' : 'Sao chép nội dung'}
              </button>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all">
              {report.teacherMessage}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            💡 <strong className="text-slate-200">Gợi ý cho Giáo viên:</strong> Bản tin được tự động cập nhật vào mỗi tối Chủ Nhật hàng tuần dựa trên kết quả thi đua và BTVN.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors ml-auto"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
