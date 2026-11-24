import React, { useEffect, useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Calculator,
  Search,
  Download,
  Lock,
  Info,
  Award,
} from 'lucide-react';
import {
  ClassGroup,
  GradebookSemester,
  Student,
  StudentGradeRecord,
  UserRole,
} from '../../types';
import { Storage } from '../../utils/storage';

interface Props {
  students: Student[];
  classes: ClassGroup[];
  records: StudentGradeRecord[];
  onUpdateRecords: (records: StudentGradeRecord[]) => void;
  userRole: UserRole;
  isTeacherUnlocked: boolean;
  onRequestTeacherUnlock?: () => void;
  lockedStudentId?: string | null;
}

export interface GradeCalculation {
  regularValues: number[];
  regularSum: number;
  regularCount: number;
  hasMidterm: boolean;
  hasFinal: boolean;
  numerator: number;
  denominator: number;
  average: number | null;
  exactValue: number | null;
  isComplete: boolean; // true when both GK and CK are entered -> denominator = regularCount + 5
  formulaText: string;
}

export function calculateGradeAverage(record: StudentGradeRecord): GradeCalculation {
  const regularValues = record.regularScores.filter(
    (v): v is number => typeof v === 'number' && !isNaN(v)
  );
  const regularSum = regularValues.reduce((acc, v) => acc + v, 0);
  const regularCount = regularValues.length;

  const hasMidterm = typeof record.midtermScore === 'number' && !isNaN(record.midtermScore);
  const hasFinal = typeof record.finalScore === 'number' && !isNaN(record.finalScore);

  const gkVal = hasMidterm ? record.midtermScore! : 0;
  const ckVal = hasFinal ? record.finalScore! : 0;

  const numerator = regularSum + (hasMidterm ? gkVal * 2 : 0) + (hasFinal ? ckVal * 3 : 0);
  const isComplete = hasMidterm && hasFinal;
  const denominator = isComplete
    ? regularCount + 5
    : regularCount + (hasMidterm ? 2 : 0) + (hasFinal ? 3 : 0);

  if (denominator === 0) {
    return {
      regularValues,
      regularSum: 0,
      regularCount: 0,
      hasMidterm,
      hasFinal,
      numerator: 0,
      denominator: 0,
      average: null,
      exactValue: null,
      isComplete: false,
      formulaText: 'Chưa có cột điểm nào được nhập.',
    };
  }

  const exactValue = numerator / denominator;
  const average = Math.round(exactValue * 10) / 10;

  const numParts: string[] = regularValues.map((v) => String(v));
  if (hasMidterm) numParts.push(`${gkVal}×2`);
  if (hasFinal) numParts.push(`${ckVal}×3`);

  const denText = isComplete
    ? `${regularCount} + 5`
    : `${regularCount}${hasMidterm ? ' + 2' : ''}${hasFinal ? ' + 3' : ''}`;

  const cleanNum = Math.round(numerator * 100) / 100;
  const formulaText = `(${numParts.join(' + ')}) / (${denText}) = ${cleanNum} / ${denominator} ≈ ${average.toFixed(1)}`;

  return {
    regularValues,
    regularSum,
    regularCount,
    hasMidterm,
    hasFinal,
    numerator: cleanNum,
    denominator,
    average,
    exactValue,
    isComplete,
    formulaText,
  };
}

function getAcademicRating(avg: number | null): { label: string; badgeClass: string } {
  if (avg === null) {
    return {
      label: 'Chưa xếp loại',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
    };
  }
  if (avg >= 8.0) {
    return {
      label: 'Tốt',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  }
  if (avg >= 6.5) {
    return {
      label: 'Khá',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    };
  }
  if (avg >= 5.0) {
    return {
      label: 'Đạt',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  }
  return {
    label: 'Chưa đạt',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };
}

interface ScoreInputProps {
  value: number | null;
  disabled: boolean;
  onChange: (val: number | null) => void;
  ariaLabel: string;
  accentClass?: string;
}

const ScoreInputCell: React.FC<ScoreInputProps> = ({
  value,
  disabled,
  onChange,
  ariaLabel,
  accentClass = 'border-slate-700 focus:border-indigo-400',
}) => {
  const [draft, setDraft] = useState<string>(value !== null ? String(value) : '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(value !== null ? String(value) : '');
    }
  }, [value, isFocused]);

  const commitDraft = (raw: string) => {
    const cleaned = raw.trim().replace(',', '.');
    if (cleaned === '') {
      onChange(null);
      setDraft('');
      return;
    }
    const num = Number(cleaned);
    if (isNaN(num)) {
      setDraft(value !== null ? String(value) : '');
      return;
    }
    const clamped = Math.max(0, Math.min(10, Math.round(num * 100) / 100));
    onChange(clamped);
    setDraft(String(clamped));
  };

  if (disabled) {
    return (
      <div
        className={`w-12 sm:w-14 h-9 mx-auto rounded-lg border flex items-center justify-center font-mono text-xs sm:text-sm font-bold tabular-nums ${
          value !== null
            ? 'bg-slate-950/90 border-slate-800 text-white'
            : 'bg-slate-950/40 border-slate-800/50 text-slate-600'
        }`}
      >
        {value !== null ? value : '—'}
      </div>
    );
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      value={draft}
      placeholder="—"
      onFocus={(e) => {
        setIsFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        const val = e.target.value;
        if (val === '' || /^\d{0,2}([.,]\d{0,2})?$/.test(val)) {
          setDraft(val);
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        commitDraft(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
          setDraft(value !== null ? String(value) : '');
          setIsFocused(false);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={`w-12 sm:w-14 h-9 mx-auto block text-center rounded-lg bg-slate-950 border ${accentClass} text-white font-mono text-xs sm:text-sm font-bold tabular-nums placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
    />
  );
};

export const GradebookView: React.FC<Props> = ({
  students,
  classes,
  records,
  onUpdateRecords,
  userRole,
  isTeacherUnlocked,
  onRequestTeacherUnlock,
  lockedStudentId,
}) => {
  const isTeacher = userRole === 'teacher';
  const canEdit = isTeacher && isTeacherUnlocked;

  const [semester, setSemester] = useState<GradebookSemester>('hk1');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);
  const [selectedDetailStudentId, setSelectedDetailStudentId] = useState<string | null>(null);

  // Determine scoped students strictly by role
  const visibleStudents = useMemo(() => {
    if (!isTeacher && lockedStudentId) {
      return students.filter((s) => s.id === lockedStudentId);
    }
    return students.filter((s) => {
      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, isTeacher, lockedStudentId, selectedClassId, searchQuery]);

  const getRecordForStudent = (studentId: string): StudentGradeRecord => {
    const existing = records.find(
      (r) => r.studentId === studentId && r.semester === semester
    );
    if (existing) return existing;
    return {
      studentId,
      semester,
      regularScores: [null, null, null, null, null],
      midtermScore: null,
      finalScore: null,
    };
  };

  const handleUpdateScore = (
    studentId: string,
    field: 'regular' | 'midterm' | 'final',
    regularIndex: number,
    value: number | null
  ) => {
    if (!canEdit) return;
    const current = getRecordForStudent(studentId);
    const updatedRegular = [...current.regularScores];
    let updatedMidterm = current.midtermScore;
    let updatedFinal = current.finalScore;

    if (field === 'regular') {
      updatedRegular[regularIndex] = value;
    } else if (field === 'midterm') {
      updatedMidterm = value;
    } else {
      updatedFinal = value;
    }

    const updatedRecord: StudentGradeRecord = {
      ...current,
      studentId,
      semester,
      regularScores: updatedRegular,
      midtermScore: updatedMidterm,
      finalScore: updatedFinal,
    };

    const nextList = Storage.upsertGradeRecord(updatedRecord);
    onUpdateRecords(nextList);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Mã HS',
      'Họ và Tên',
      'Lớp',
      'TX 1',
      'TX 2',
      'TX 3',
      'TX 4',
      'TX 5',
      'Giữa kì (x2)',
      'Cuối kì (x3)',
      'Điểm TB',
      'Xếp loại',
    ];

    const rows = visibleStudents.map((st, idx) => {
      const rec = getRecordForStudent(st.id);
      const calc = calculateGradeAverage(rec);
      const clsName = classes.find((c) => c.id === st.classId)?.name || '';
      const rating = getAcademicRating(calc.average).label;
      return [
        idx + 1,
        st.studentCode,
        `"${st.name}"`,
        `"${clsName}"`,
        ...rec.regularScores.map((s) => (s !== null ? s : '')),
        rec.midtermScore !== null ? rec.midtermScore : '',
        rec.finalScore !== null ? rec.finalScore : '',
        calc.average !== null ? calc.average.toFixed(1) : '',
        `"${rating}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const classLabel =
      selectedClassId === 'all'
        ? 'TatCaLop'
        : (classes.find((c) => c.id === selectedClassId)?.name || 'Lop').replace(/\s+/g, '');
    a.href = url;
    a.download = `BangDiem_${classLabel}_${semester.toUpperCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Summary Stats for visible students
  const summaryStats = useMemo(() => {
    const averages = visibleStudents
      .map((st) => calculateGradeAverage(getRecordForStudent(st.id)).average)
      .filter((a): a is number => a !== null);

    const classAvg =
      averages.length > 0
        ? Math.round((averages.reduce((s, a) => s + a, 0) / averages.length) * 10) / 10
        : null;

    const goodCount = averages.filter((a) => a >= 8.0).length;
    const fairCount = averages.filter((a) => a >= 6.5 && a < 8.0).length;
    const passCount = averages.filter((a) => a >= 5.0 && a < 6.5).length;

    return {
      totalStudents: visibleStudents.length,
      gradedCount: averages.length,
      classAvg,
      goodCount,
      fairCount,
      passCount,
    };
  }, [visibleStudents, records, semester]);

  const detailStudent = selectedDetailStudentId
    ? visibleStudents.find((s) => s.id === selectedDetailStudentId) || null
    : !isTeacher
    ? visibleStudents[0] || null
    : null;

  const detailCalc = detailStudent
    ? calculateGradeAverage(getRecordForStudent(detailStudent.id))
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
              {isTeacher ? 'Bảng Điểm Môn Toán THCS' : 'Bảng Điểm Cá Nhân Môn Toán'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Gồm 5 cột kiểm tra thường xuyên (hệ số 1), 1 cột giữa kì (hệ số 2), 1 cột cuối kì (hệ số 3) và tổng điểm trung bình.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Semester Selector */}
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setSemester('hk1')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  semester === 'hk1'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Học Kì 1
              </button>
              <button
                type="button"
                onClick={() => setSemester('hk2')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  semester === 'hk2'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Học Kì 2
              </button>
            </div>

            <button
              type="button"
              hidden
              aria-hidden="true"
              onClick={() => setShowFormulaGuide((prev) => !prev)}
              className="hidden px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-xs font-bold transition items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Công thức tính ĐTB</span>
            </button>
          </div>
        </div>

        {/* Formula Guide Banner */}
        {showFormulaGuide && (
          <div
            hidden
            aria-hidden="true"
            className="hidden p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2"
          >
            <div className="font-bold text-indigo-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Cách tính Tổng điểm trung bình môn:
            </div>
            <p className="font-mono text-sm text-white bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-indigo-500/20 overflow-x-auto">
              ĐTB = (Tổng điểm thường xuyên + Giữa kì × 2 + Cuối kì × 3) / (Số cột điểm thường xuyên có + 5)
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-amber-300">Ví dụ:</strong> Kiểm tra thường xuyên 4 lần được{' '}
              <span className="font-mono text-white">6, 8, 9, 1</span>; Giữa kì được{' '}
              <span className="font-mono text-white">7</span> điểm; Cuối kì được{' '}
              <span className="font-mono text-white">8</span> điểm:
              <br />
              <span className="font-mono text-emerald-300">
                ĐTB = (6 + 8 + 9 + 1 + 7×2 + 8×3) / (4 + 5) = 62 / 9 ≈ 6.9
              </span>
            </p>
          </div>
        )}

        {/* Teacher Toolbar */}
        {isTeacher && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">Tất Cả Các Lớp</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade})
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên hoặc mã HS..."
                  className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl pl-8 pr-3 py-2 w-48 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>
              ) : (
                onRequestTeacherUnlock && (
                  <button
                    type="button"
                    onClick={onRequestTeacherUnlock}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mở Khóa Quyền Giáo Viên Để Sửa Điểm</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Teacher Class Summary Cards */}
      {isTeacher && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Sĩ Số Hiển Thị</span>
            <p className="text-2xl font-black text-white mt-1 tabular-nums">
              {summaryStats.totalStudents} <span className="text-xs font-normal text-slate-400">HS</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Điểm TB Chung Lớp</span>
            <p className="text-2xl font-black text-amber-400 mt-1 tabular-nums">
              {summaryStats.classAvg !== null ? summaryStats.classAvg.toFixed(1) : '—'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Xếp Loại Tốt (≥ 8.0)</span>
            <p className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">
              {summaryStats.goodCount} <span className="text-xs font-normal text-slate-400">HS</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Xếp Loại Khá (6.5–7.9)</span>
            <p className="text-2xl font-black text-indigo-400 mt-1 tabular-nums">
              {summaryStats.fairCount} <span className="text-xs font-normal text-slate-400">HS</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Gradebook Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              {/* Group Header Row: 4 Main Score Columns */}
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] uppercase tracking-wider font-extrabold text-slate-300">
                <th rowSpan={2} className="py-3 px-4 border-r border-slate-800/80 w-10 text-center">
                  STT
                </th>
                <th rowSpan={2} className="py-3 px-4 border-r border-slate-800/80 min-w-[180px]">
                  Học Sinh
                </th>
                <th
                  colSpan={5}
                  className="py-2.5 px-3 text-center border-r border-slate-800/80 text-indigo-300 bg-indigo-950/20"
                >
                  1. Kiểm Tra Thường Xuyên (5 lần · Hệ số 1)
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800/80 text-amber-300 bg-amber-950/20">
                  2. Giữa Kì (1 lần)
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800/80 text-rose-300 bg-rose-950/20">
                  3. Cuối Kì (1 lần)
                </th>
                <th
                  colSpan={2}
                  className="py-2.5 px-3 text-center text-emerald-300 bg-emerald-950/20"
                >
                  4. Tổng Điểm Trung Bình
                </th>
              </tr>

              {/* Sub-Column Header Row */}
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                <th className="py-2 px-1.5 text-center">Lần 1</th>
                <th className="py-2 px-1.5 text-center">Lần 2</th>
                <th className="py-2 px-1.5 text-center">Lần 3</th>
                <th className="py-2 px-1.5 text-center">Lần 4</th>
                <th className="py-2 px-1.5 text-center border-r border-slate-800/80">Lần 5</th>
                <th className="py-2 px-2 text-center border-r border-slate-800/80 text-amber-300/90">
                  Hệ số 2
                </th>
                <th className="py-2 px-2 text-center border-r border-slate-800/80 text-rose-300/90">
                  Hệ số 3
                </th>
                <th className="py-2 px-3 text-center text-emerald-300">ĐTB</th>
                <th className="py-2 px-3 text-center">Xếp loại</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/70 text-sm">
              {visibleStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 text-xs">
                    Không tìm thấy học sinh phù hợp.
                  </td>
                </tr>
              ) : (
                visibleStudents.map((st, idx) => {
                  const rec = getRecordForStudent(st.id);
                  const calc = calculateGradeAverage(rec);
                  const rating = getAcademicRating(calc.average);
                  const clsObj = classes.find((c) => c.id === st.classId);
                  const isSelectedDetail = detailStudent?.id === st.id;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedDetailStudentId(st.id)}
                      className={`transition cursor-pointer ${
                        isSelectedDetail
                          ? 'bg-indigo-950/25'
                          : 'hover:bg-slate-800/35'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-500 border-r border-slate-800/60">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800/60">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg shrink-0">{st.avatar}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs sm:text-sm truncate">
                              {st.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span>{clsObj?.name || ''}</span>
                              <span>•</span>
                              <span className="font-mono text-indigo-300">{st.studentCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 5 Regular Scores */}
                      {[0, 1, 2, 3, 4].map((slotIdx) => (
                        <td
                          key={slotIdx}
                          onClick={(e) => e.stopPropagation()}
                          className={`py-2.5 px-1 text-center ${
                            slotIdx === 4 ? 'border-r border-slate-800/60' : ''
                          }`}
                        >
                          <ScoreInputCell
                            value={rec.regularScores[slotIdx]}
                            disabled={!canEdit}
                            ariaLabel={`Điểm thường xuyên lần ${slotIdx + 1} của ${st.name}`}
                            accentClass="border-indigo-500/30 focus:border-indigo-400"
                            onChange={(val) =>
                              handleUpdateScore(st.id, 'regular', slotIdx, val)
                            }
                          />
                        </td>
                      ))}

                      {/* Midterm Score (x2) */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-2.5 px-2 text-center border-r border-slate-800/60"
                      >
                        <ScoreInputCell
                          value={rec.midtermScore}
                          disabled={!canEdit}
                          ariaLabel={`Điểm giữa kì của ${st.name}`}
                          accentClass="border-amber-500/40 focus:border-amber-400"
                          onChange={(val) =>
                            handleUpdateScore(st.id, 'midterm', 0, val)
                          }
                        />
                      </td>

                      {/* Final Score (x3) */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-2.5 px-2 text-center border-r border-slate-800/60"
                      >
                        <ScoreInputCell
                          value={rec.finalScore}
                          disabled={!canEdit}
                          ariaLabel={`Điểm cuối kì của ${st.name}`}
                          accentClass="border-rose-500/40 focus:border-rose-400"
                          onChange={(val) =>
                            handleUpdateScore(st.id, 'final', 0, val)
                          }
                        />
                      </td>

                      {/* Average Score */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-base font-black font-mono tabular-nums ${
                              calc.average === null
                                ? 'text-slate-500'
                                : calc.average >= 8.0
                                ? 'text-emerald-400'
                                : calc.average >= 6.5
                                ? 'text-indigo-300'
                                : calc.average >= 5.0
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {calc.average !== null ? calc.average.toFixed(1) : '—'}
                          </span>
                          {calc.average !== null && !calc.isComplete && (
                            <span className="text-[9px] text-amber-400/90 font-semibold">
                              Tạm tính
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${rating.badgeClass}`}
                        >
                          {rating.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>
              💡 Nhấp trực tiếp vào từng ô điểm (0 – 10, hỗ trợ số thập phân VD: 7.5) để nhập hoặc xóa trống. Điểm trung bình tự động cập nhật và lưu tức thì.
            </span>
            <span>Nhấp vào một hàng học sinh để xem phép tính chi tiết bên dưới.</span>
          </div>
        )}
      </div>

      {/* Selected Student Formula Breakdown Card */}
      {detailStudent && detailCalc && (
        <div
          hidden
          aria-hidden="true"
          className="hidden p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex-wrap items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Chi tiết tính điểm trung bình — {semester === 'hk1' ? 'Học kì 1' : 'Học kì 2'}</span>
            </div>
            <p className="text-sm font-bold text-white">
              {detailStudent.avatar} {detailStudent.name}{' '}
              <span className="text-xs font-mono text-slate-400">
                ({detailStudent.studentCode})
              </span>
            </p>
            <p className="font-mono text-xs sm:text-sm text-emerald-300 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              {detailCalc.formulaText}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                {detailCalc.isComplete ? 'Tổng điểm trung bình' : 'Điểm TB (tạm tính)'}
              </span>
              <span className="text-3xl font-black font-mono text-amber-400 tabular-nums">
                {detailCalc.average !== null ? detailCalc.average.toFixed(1) : '—'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
