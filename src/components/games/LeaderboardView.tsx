import React, { useMemo, useState } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { ClassGroup, GameHistoryItem, Student } from '../../types';
import { Storage } from '../../utils/storage';

interface Props {
  students: Student[];
  classes: ClassGroup[];
  history: GameHistoryItem[];
  onSelectStudent: (student: Student) => void;
  lockedClassId?: string | null;
}

type TimeScope = 'week' | 'month' | 'semester' | 'all';

interface ActivityEvent {
  id: string;
  studentId: string;
  points: number;
  accuracy: number;
  date: Date;
}

function parseTimestamp(raw?: string): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Handle vi-VN formats like "08:30 22/11/2026", "22/11/2026, 08:30", "22/11/2026"
  const vnDateMatch = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (vnDateMatch) {
    const day = parseInt(vnDateMatch[1], 10);
    const month = parseInt(vnDateMatch[2], 10) - 1;
    const year = parseInt(vnDateMatch[3], 10);
    const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
    const hour = timeMatch ? parseInt(timeMatch[1], 10) : 12;
    const minute = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const d = new Date(year, month, day, hour, minute, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  // Handle "YYYY-MM-DD HH:mm" or ISO strings
  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (isoDateMatch) {
    const year = parseInt(isoDateMatch[1], 10);
    const month = parseInt(isoDateMatch[2], 10) - 1;
    const day = parseInt(isoDateMatch[3], 10);
    const hour = isoDateMatch[4] ? parseInt(isoDateMatch[4], 10) : 12;
    const minute = isoDateMatch[5] ? parseInt(isoDateMatch[5], 10) : 0;
    const d = new Date(year, month, day, hour, minute, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatShortDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function getWeekRange(offsetWeeks: number): { start: Date; end: Date; label: string; shortLabel: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday - offsetWeeks * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const rangeText = `${formatShortDate(start)} – ${formatShortDate(end)}/${end.getFullYear()}`;
  const prefix =
    offsetWeeks === 0 ? 'Tuần này' : offsetWeeks === 1 ? 'Tuần trước' : `${offsetWeeks} tuần trước`;

  return {
    start,
    end,
    label: `${prefix} (${rangeText})`,
    shortLabel: prefix,
  };
}

function getMonthRange(offsetMonths: number): { start: Date; end: Date; label: string; shortLabel: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1, 0, 0, 0, 0);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthStr = String(start.getMonth() + 1).padStart(2, '0');
  const yearStr = start.getFullYear();
  const prefix =
    offsetMonths === 0 ? 'Tháng này' : offsetMonths === 1 ? 'Tháng trước' : `Tháng ${monthStr}/${yearStr}`;

  return {
    start,
    end,
    label: offsetMonths <= 1 ? `${prefix} (T${monthStr}/${yearStr})` : prefix,
    shortLabel: `T${monthStr}/${yearStr}`,
  };
}

function getSemesterRange(): { start: Date; end: Date; label: string } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(end.getDate() - 120);
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
    label: `Học kì (4 tháng gần nhất: ${formatShortDate(start)} – ${formatShortDate(end)}/${end.getFullYear()})`,
  };
}

export const LeaderboardView: React.FC<Props> = ({
  students,
  classes,
  history,
  onSelectStudent,
  lockedClassId
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(lockedClassId || 'all');
  const [sortBy, setSortBy] = useState<'points' | 'streak' | 'accuracy' | 'speed'>('points');
  // Default filter: Theo tuần (Tuần này)
  const [timeScope, setTimeScope] = useState<TimeScope>('week');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);

  const effectiveClassId = lockedClassId || selectedClassId;
  const lockedClassObj = lockedClassId ? classes.find(c => c.id === lockedClassId) : null;

  const weekOptions = useMemo(() => [0, 1, 2, 3].map(getWeekRange), []);
  const monthOptions = useMemo(() => [0, 1, 2, 3].map(getMonthRange), []);
  const semesterRange = useMemo(() => getSemesterRange(), []);

  const activeRangeInfo = useMemo(() => {
    if (timeScope === 'week') {
      const w = weekOptions[weekOffset] || weekOptions[0];
      return { start: w.start, end: w.end, label: w.label, unitLabel: 'tuần', colHeader: 'Điểm Tuần' };
    }
    if (timeScope === 'month') {
      const m = monthOptions[monthOffset] || monthOptions[0];
      return { start: m.start, end: m.end, label: m.label, unitLabel: 'tháng', colHeader: 'Điểm Tháng' };
    }
    if (timeScope === 'semester') {
      return {
        start: semesterRange.start,
        end: semesterRange.end,
        label: semesterRange.label,
        unitLabel: 'học kì',
        colHeader: 'Điểm Học Kì',
      };
    }
    return {
      start: null as Date | null,
      end: null as Date | null,
      label: 'Toàn thời gian (Tích lũy từ đầu năm)',
      unitLabel: 'tổng',
      colHeader: 'Tổng Điểm',
    };
  }, [timeScope, weekOffset, monthOffset, weekOptions, monthOptions, semesterRange]);

  // Aggregate unique activity events across games, mock exams, and homework
  const eventsByStudent = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    const seenIds = new Set<string>();

    const pushEvent = (ev: ActivityEvent) => {
      if (seenIds.has(ev.id)) return;
      seenIds.add(ev.id);
      const list = map.get(ev.studentId) || [];
      list.push(ev);
      map.set(ev.studentId, list);
    };

    history.forEach(h => {
      const d = parseTimestamp(h.playedAt);
      if (d) {
        pushEvent({
          id: `gh:${h.id}`,
          studentId: h.studentId,
          points: h.score,
          accuracy: h.accuracy,
          date: d,
        });
      }
    });

    students.forEach(st => {
      (st.recentResults || []).forEach(h => {
        const d = parseTimestamp(h.playedAt);
        if (d) {
          pushEvent({
            id: `gh:${h.id}`,
            studentId: st.id,
            points: h.score,
            accuracy: h.accuracy,
            date: d,
          });
        }
      });
    });

    const examSubs = Storage.getExamSubmissions();
    examSubs.forEach(sub => {
      const d = parseTimestamp(sub.submittedAt);
      if (d) {
        const acc = sub.totalQuestions > 0 ? Math.round((sub.correctCount / sub.totalQuestions) * 100) : 0;
        pushEvent({
          id: `ex:${sub.id}`,
          studentId: sub.studentId,
          points: Math.round(sub.score * 50),
          accuracy: acc,
          date: d,
        });
      }
    });

    const hwSubs = Storage.getHomeworkSubmissions();
    hwSubs.forEach(sub => {
      const d = parseTimestamp(sub.submittedAt);
      if (d) {
        const acc = sub.totalQuestions > 0 ? Math.round((sub.correctCount / sub.totalQuestions) * 100) : 0;
        pushEvent({
          id: `hw:${sub.id}`,
          studentId: sub.studentId,
          points: Math.round(sub.score * 30),
          accuracy: acc,
          date: d,
        });
      }
    });

    return map;
  }, [students, history]);

  const filteredStudents = students.filter(s =>
    effectiveClassId === 'all' || s.classId === effectiveClassId
  );

  const rankedEntries = useMemo(() => {
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 120);

    const entries = filteredStudents.map(st => {
      const stEvents = eventsByStudent.get(st.id) || [];
      const recentLoggedPoints = stEvents
        .filter(ev => ev.date >= recentCutoff)
        .reduce((sum, ev) => sum + ev.points, 0);

      // Historical baseline points excluding recent live activity so new activity counts 100% into current period
      const seededBase = Math.max(0, st.totalPoints - recentLoggedPoints);

      const windowEvents =
        activeRangeInfo.start && activeRangeInfo.end
          ? stEvents.filter(ev => ev.date >= activeRangeInfo.start! && ev.date <= activeRangeInfo.end!)
          : stEvents;

      const windowPoints = windowEvents.reduce((sum, ev) => sum + ev.points, 0);

      let displayPoints = st.totalPoints;
      if (timeScope === 'week') {
        const baseFactor = weekOffset === 0 ? 0.25 : Math.max(0.1, 0.22 - weekOffset * 0.04);
        displayPoints = windowPoints + Math.round(seededBase * baseFactor);
      } else if (timeScope === 'month') {
        const baseFactor = monthOffset === 0 ? 0.6 : Math.max(0.2, 0.5 - monthOffset * 0.12);
        displayPoints = windowPoints + Math.round(seededBase * baseFactor);
      } else if (timeScope === 'semester') {
        displayPoints = windowPoints + Math.round(seededBase * 0.85);
      }

      const displayAccuracy =
        windowEvents.length > 0
          ? Math.round(windowEvents.reduce((sum, ev) => sum + ev.accuracy, 0) / windowEvents.length)
          : st.accuracyRate;

      return {
        student: st,
        displayPoints,
        displayAccuracy,
        activityCount: windowEvents.length,
      };
    });

    return entries.sort((a, b) => {
      if (sortBy === 'points') {
        return b.displayPoints - a.displayPoints || b.displayAccuracy - a.displayAccuracy;
      }
      if (sortBy === 'streak') return b.student.streakCount - a.student.streakCount;
      if (sortBy === 'accuracy') return b.displayAccuracy - a.displayAccuracy;
      if (sortBy === 'speed') return b.student.skills.speed - a.student.skills.speed;
      return 0;
    });
  }, [filteredStudents, eventsByStudent, activeRangeInfo, timeScope, weekOffset, monthOffset, sortBy]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Filter */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Bảng Vàng Danh Dự & Xếp Hạng Toán Học
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ghi nhận thành tích thi đua, tốc độ giải toán và chuỗi thắng của học sinh.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{activeRangeInfo.label}</span>
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Left: Class + Time Period Filter (Default: Theo tuần) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Class Filter */}
            {lockedClassId ? (
              <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl px-3.5 py-2">
                Chỉ xem: {lockedClassObj ? `${lockedClassObj.name} (${lockedClassObj.grade})` : 'Lớp của em'}
              </div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">Tất Cả Các Lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Time Scope Segmented Filter */}
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setTimeScope('week')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeScope === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Theo Tuần
              </button>
              <button
                type="button"
                onClick={() => setTimeScope('month')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeScope === 'month' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Theo Tháng
              </button>
              <button
                type="button"
                onClick={() => setTimeScope('semester')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeScope === 'semester' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Học Kì
              </button>
              <button
                type="button"
                onClick={() => setTimeScope('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeScope === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Tất Cả
              </button>
            </div>

            {/* Sub-period Picker for Week or Month */}
            {timeScope === 'week' && (
              <select
                value={weekOffset}
                onChange={(e) => setWeekOffset(Number(e.target.value))}
                aria-label="Chọn tuần cụ thể"
                className="bg-slate-800 border border-slate-700 text-indigo-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
              >
                {weekOptions.map((w, idx) => (
                  <option key={idx} value={idx}>
                    {w.label}
                  </option>
                ))}
              </select>
            )}

            {timeScope === 'month' && (
              <select
                value={monthOffset}
                onChange={(e) => setMonthOffset(Number(e.target.value))}
                aria-label="Chọn tháng cụ thể"
                className="bg-slate-800 border border-slate-700 text-indigo-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
              >
                {monthOptions.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right: Metric Sort Filter */}
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setSortBy('points')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sortBy === 'points' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Điểm Số
            </button>
            <button
              type="button"
              onClick={() => setSortBy('streak')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sortBy === 'streak' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Chuỗi 🔥
            </button>
            <button
              type="button"
              onClick={() => setSortBy('accuracy')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sortBy === 'accuracy' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Chính Xác %
            </button>
            <button
              type="button"
              onClick={() => setSortBy('speed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sortBy === 'speed' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tốc Độ ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      {rankedEntries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 max-w-2xl mx-auto">
          {/* Top 2 */}
          <div
            onClick={() => onSelectStudent(rankedEntries[1].student)}
            className="cursor-pointer p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center hover:border-slate-700 transition"
          >
            <span className="text-3xl">🥈</span>
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-2xl my-2">
              {rankedEntries[1].student.avatar}
            </div>
            <h4 className="font-bold text-sm text-white truncate">{rankedEntries[1].student.name}</h4>
            <span className="text-xs text-indigo-400 font-extrabold">
              {rankedEntries[1].displayPoints} đ{timeScope !== 'all' ? ` / ${activeRangeInfo.unitLabel}` : ''}
            </span>
          </div>

          {/* Top 1 */}
          <div
            onClick={() => onSelectStudent(rankedEntries[0].student)}
            className="cursor-pointer p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/80 text-center transform -translate-y-4 shadow-xl shadow-amber-500/10 hover:border-amber-400 transition"
          >
            <span className="text-4xl animate-bounce">🥇</span>
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl my-2">
              {rankedEntries[0].student.avatar}
            </div>
            <h4 className="font-black text-base text-white truncate">{rankedEntries[0].student.name}</h4>
            <span className="text-sm text-amber-400 font-black">
              {rankedEntries[0].displayPoints} đ{timeScope !== 'all' ? ` / ${activeRangeInfo.unitLabel}` : ''}
            </span>
            <span className="block text-[11px] text-rose-400 font-bold mt-1">
              🔥 {rankedEntries[0].student.streakCount} trận thắng
            </span>
          </div>

          {/* Top 3 */}
          <div
            onClick={() => onSelectStudent(rankedEntries[2].student)}
            className="cursor-pointer p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center hover:border-slate-700 transition"
          >
            <span className="text-3xl">🥉</span>
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-2xl my-2">
              {rankedEntries[2].student.avatar}
            </div>
            <h4 className="font-bold text-sm text-white truncate">{rankedEntries[2].student.name}</h4>
            <span className="text-xs text-indigo-400 font-extrabold">
              {rankedEntries[2].displayPoints} đ{timeScope !== 'all' ? ` / ${activeRangeInfo.unitLabel}` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider">
              <th className="pb-3 pl-3">Hạng</th>
              <th className="pb-3">Học Sinh</th>
              <th className="pb-3 text-center">{activeRangeInfo.colHeader}</th>
              <th className="pb-3 text-center">Chuỗi Thắng</th>
              <th className="pb-3 text-center">Chính Xác</th>
              <th className="pb-3 text-center">Tốc Độ</th>
              <th className="pb-3 text-right pr-3">Hồ Sơ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {rankedEntries.map((entry, index) => {
              const st = entry.student;
              const classObj = classes.find(c => c.id === st.classId);

              return (
                <tr
                  key={st.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onSelectStudent(st)}
                >
                  <td className="py-3.5 pl-3 font-mono font-bold">
                    {index === 0 && <span className="text-amber-400">#1</span>}
                    {index === 1 && <span className="text-slate-300">#2</span>}
                    {index === 2 && <span className="text-amber-600">#3</span>}
                    {index > 2 && <span className="text-slate-500">#{index + 1}</span>}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{st.avatar}</span>
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-400 transition">{st.name}</div>
                        <span className="text-xs text-slate-400">
                          {classObj?.name || 'Chưa xếp lớp'}
                          {entry.activityCount > 0 && (
                            <span className="ml-2 text-indigo-300 font-semibold">
                              • {entry.activityCount} lượt thi đua
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-bold font-mono text-amber-400 tabular-nums">
                    {entry.displayPoints}
                  </td>
                  <td className="py-3.5 text-center font-bold text-rose-400">
                    {st.streakCount} 🔥
                  </td>
                  <td className="py-3.5 text-center font-bold text-emerald-400">
                    {entry.displayAccuracy}%
                  </td>
                  <td className="py-3.5 text-center font-bold text-indigo-400">
                    {st.skills.speed}/100
                  </td>
                  <td className="py-3.5 text-right pr-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(st);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
