import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, Bookmark, Award, Clock, AlertTriangle, 
  ChevronRight, Sparkles, Printer, Search, Zap, Check, ArrowLeft, ArrowRight,
  ShieldCheck, HelpCircle
} from 'lucide-react';
import { GradeLevel, KnowledgeLesson, MathCategory, Student } from '../../types';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase';
import { Storage } from '../../utils/storage';
import { MathText } from '../common/MathText';

interface Props {
  students: Student[];
  lessons?: KnowledgeLesson[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  onRequestChangeStudent?: () => void;
  onLessonCompleted?: (lessonId: string) => void;
  lockedGrade?: GradeLevel;
  lockedClassName?: string;
}

export const KnowledgeHub: React.FC<Props> = ({
  students,
  lessons,
  activeStudentId,
  onRequestChangeStudent,
  onLessonCompleted,
  lockedGrade,
  lockedClassName
}) => {
  const allLessons = React.useMemo(() => {
    const source = lessons ?? KNOWLEDGE_BASE;
    return [...source].sort((a, b) => {
      if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber;
      return a.lessonNumber - b.lessonNumber;
    });
  }, [lessons]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];
  const initialGrade: GradeLevel = lockedGrade || 'Toán 8';
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(initialGrade);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return allLessons.find(l => l.grade === initialGrade)?.id || allLessons[0]?.id || '';
  });
  const [learnedLessonIds, setLearnedLessonIds] = useState<string[]>(() => {
    return activeStudent ? Storage.getLearnedLessons(activeStudent.id) : [];
  });

  // Mini quiz state for current lesson
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Sync learned lessons on student switch
  React.useEffect(() => {
    if (activeStudent) {
      setLearnedLessonIds(Storage.getLearnedLessons(activeStudent.id));
    }
  }, [activeStudent?.id]);

  // Sync lockedGrade when student changes
  React.useEffect(() => {
    if (lockedGrade) {
      setSelectedGrade(lockedGrade);
      const firstInGrade = allLessons.find(l => l.grade === lockedGrade);
      if (firstInGrade) {
        setActiveLessonId(firstInGrade.id);
        setQuizAnswers({});
        setQuizChecked(false);
        setQuizScore(null);
      }
    }
  }, [lockedGrade, allLessons]);

  const effectiveGrade = lockedGrade || selectedGrade;
  // Lessons of current grade
  const gradeLessons = allLessons.filter(l => l.grade === effectiveGrade);

  // Filtered lessons
  const filteredLessons = gradeLessons.filter(lesson => {
    const matchCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchQuery = searchQuery.trim() === '' || 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.goldenFormulas.some(f => f.formula.toLowerCase().includes(searchQuery.toLowerCase()) || f.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  // Current active lesson
  const currentLesson =
    gradeLessons.find(l => l.id === activeLessonId) ||
    gradeLessons[0] ||
    allLessons[0] ||
    null;

  // Check if current lesson is mastered
  const isMastered = activeStudent && currentLesson ? learnedLessonIds.includes(currentLesson.id) : false;

  const handleToggleLearned = () => {
    if (!activeStudent || !currentLesson) return;
    const isNowLearned = Storage.toggleLearnedLesson(activeStudent.id, currentLesson.id);
    setLearnedLessonIds(Storage.getLearnedLessons(activeStudent.id));
    if (isNowLearned && onLessonCompleted) {
      onLessonCompleted(currentLesson.id);
    }
  };

  const handleSelectLessonClick = (lesson: KnowledgeLesson) => {
    setActiveLessonId(lesson.id);
    setSelectedGrade(lesson.grade);
    setQuizAnswers({});
    setQuizChecked(false);
    setQuizScore(null);
  };

  const handleGradeChange = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    const firstInGrade = allLessons.find(l => l.grade === grade);
    if (firstInGrade) {
      setActiveLessonId(firstInGrade.id);
      setQuizAnswers({});
      setQuizChecked(false);
      setQuizScore(null);
    }
  };

  const handleCheckQuiz = () => {
    if (!currentLesson || !currentLesson.miniQuiz.length) return;
    let correct = 0;
    currentLesson.miniQuiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    setQuizScore(correct);
    setQuizChecked(true);

    if (activeStudent && correct > 0) {
      Storage.updateDailyQuestProgress(activeStudent.id, 'quiz', 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate mastery progress
  const totalInGrade = gradeLessons.length;
  const learnedInGrade = gradeLessons.filter(l => learnedLessonIds.includes(l.id)).length;
  const masteryPercent = totalInGrade > 0 ? Math.round((learnedInGrade / totalInGrade) * 100) : 0;

  // Find next and prev lessons in current grade
  const currentIndex = currentLesson ? gradeLessons.findIndex(l => l.id === currentLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? gradeLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < gradeLessons.length - 1 ? gradeLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Student Info */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-950/50">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Góc Tự Học & Ôn Tập</span>
              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-xs font-bold border border-blue-700/50">
                Mã: {activeStudent?.studentCode || 'HS801'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Hệ Thống Kiến Thức Trọng Tâm THCS
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Cô đọng lý thuyết, đóng khung công thức vàng, bí kíp phân loại dạng bài và bài tập củng cố chuẩn GDPT 2018.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
            <span className="text-[11px] text-slate-400 font-semibold block">Tiến độ nắm vững {effectiveGrade}</span>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="text-base font-extrabold text-emerald-400">{learnedInGrade}/{totalInGrade} bài</span>
              <span className="text-xs font-bold text-slate-400">({masteryPercent}%)</span>
            </div>
          </div>

          {onRequestChangeStudent ? (
            <button
              onClick={onRequestChangeStudent}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>{activeStudent?.name || 'Học sinh'}</span>
              <span className="text-[10px] text-indigo-300 underline">Đổi mã</span>
            </button>
          ) : (
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
              <span>{activeStudent?.name || 'Học sinh'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grade Selector Tabs (locked to student's single class/grade when lockedGrade is set) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {(lockedGrade ? [lockedGrade] : (['Toán 6', 'Toán 7', 'Toán 8', 'Toán 9'] as GradeLevel[])).map(grade => {
          const count = allLessons.filter(l => l.grade === grade).length;
          const learned = allLessons.filter(l => l.grade === grade && learnedLessonIds.includes(l.id)).length;
          const isActive = effectiveGrade === grade;
          return (
            <button
              key={grade}
              onClick={() => !lockedGrade && handleGradeChange(grade)}
              className={`px-4 sm:px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2.5 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/50 scale-105'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{lockedGrade && lockedClassName ? `${lockedClassName} · ${grade}` : grade}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {learned}/{count} đã thuộc
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Sidebar list & Content reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Directory & Search (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm công thức, bài học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedCategory('Số học & Đại số')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'Số học & Đại số'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Đại số
              </button>
              <button
                onClick={() => setSelectedCategory('Hình học & Đo lường')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'Hình học & Đo lường'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Hình học
              </button>
            </div>
          </div>

          {/* Lessons list */}
          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredLessons.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                Không tìm thấy bài học phù hợp với từ khóa!
              </div>
            ) : (
              filteredLessons.map((lesson) => {
                const active = currentLesson ? lesson.id === currentLesson.id : false;
                const mastered = learnedLessonIds.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectLessonClick(lesson)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      active
                        ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-500 shadow-md shadow-blue-950/40 translate-x-1'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          Bài {lesson.lessonNumber}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {lesson.category === 'Số học & Đại số' ? 'Đại số' : lesson.category === 'Hình học & Đo lường' ? 'Hình học' : lesson.category}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.readingTimeMinutes}p
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold leading-snug ${
                        active ? 'text-white' : 'text-slate-200'
                      }`}>
                        {lesson.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
                        {lesson.chapter}
                      </p>
                    </div>

                    <div className="shrink-0 mt-1">
                      {mastered ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50" title="Đã thuộc">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Reader View (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!currentLesson ? (
            <div className="p-8 rounded-3xl bg-slate-900/95 border border-slate-800 text-center text-slate-400 text-sm">
              Chưa có bài giáo án nào cho khối lớp này.
            </div>
          ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-6">
            {/* Header: Title & Actions */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-extrabold border border-blue-500/20">
                    {currentLesson.grade}
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentLesson.chapter}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentLesson.title}
                </h2>
                {currentLesson.examRelevance && (
                  <p className="text-xs text-amber-300/90 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Mẹo thi cử:</strong> {currentLesson.examRelevance}</span>
                  </p>
                )}
              </div>

              {/* Actions: Mastered Toggle & Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  title="In phiếu tóm tắt bài học"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleLearned}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                    isMastered
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40'
                  }`}
                >
                  {isMastered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã Thuộc Bài (+50 XP)</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Đánh Dấu Đã Học (+50 XP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SECTION 1: LÝ THUYẾT CỐT LÕI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-blue-500" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  1. Lý Thuyết & Định Nghĩa Trọng Tâm
                </h3>
              </div>
              <ul className="space-y-2 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                {currentLesson.coreTheory.map((point, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <MathText text={point} />
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 2: HỘP CÔNG THỨC VÀNG (CHEAT SHEET) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-amber-500" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>2. Hộp Công Thức Vàng</span>
                  <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Bắt buộc ghi nhớ
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentLesson.goldenFormulas.map((gf, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${
                      gf.highlight
                        ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/50 shadow-md shadow-amber-950/30'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                        {gf.title}
                      </span>
                      <div className="mt-1 font-mono text-sm sm:text-base font-black text-amber-100 bg-black/40 p-2.5 rounded-xl border border-amber-500/20 leading-snug select-all">
                        <MathText text={gf.formula} />
                      </div>
                    </div>
                    {gf.note && (
                      <p className="text-[11px] text-slate-400 italic">
                        💡 <MathText text={gf.note} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: CÁC DẠNG BÀI TẬP & PHƯƠNG PHÁP GIẢI */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-indigo-500" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  3. Dạng Bài Trọng Tâm & Bí Kíp Giải
                </h3>
              </div>
              <div className="space-y-4">
                {currentLesson.problemTypes.map((pt, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-extrabold text-indigo-300">
                      {pt.name}
                    </h4>

                    {/* Method */}
                    <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-100 leading-relaxed whitespace-pre-line">
                      <strong className="text-indigo-400 block mb-1">Phương pháp tư duy từng bước:</strong>
                      <MathText text={pt.method} />
                    </div>

                    {/* Example */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2 text-xs leading-relaxed">
                      <div className="font-semibold text-white">
                        <span className="text-amber-400">Ví dụ minh họa: </span>
                        <MathText text={pt.example.problem} />
                      </div>
                      <div className="font-mono text-slate-300 whitespace-pre-line bg-black/30 p-3 rounded-lg border border-slate-800">
                        <strong className="text-emerald-400 block mb-0.5">Lời giải chi tiết:</strong>
                        <MathText text={pt.example.solution} />
                      </div>
                      {pt.example.tips && (
                        <p className="text-[11px] text-amber-300/90 font-medium">
                          ⭐ <em>Lời khuyên thầy cô:</em> <MathText text={pt.example.tips} />
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: BẪY TOÁN HỌC & LỖI SAI CẦN TRÁNH */}
            {currentLesson.commonMistakes && currentLesson.commonMistakes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-5 rounded-full bg-rose-500" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>4. Bẫy Toán Học Cần Tránh (Dễ Mất Điểm)</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {currentLesson.commonMistakes.map((cm, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase">
                          Lỗi Sai
                        </span>
                        <p className="text-rose-200 line-through">
                          <MathText text={cm.mistake} />
                        </p>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-rose-500/20">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                          Sửa Đúng
                        </span>
                        <p className="text-emerald-300 font-semibold">
                          <MathText text={cm.correction} />
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 italic pt-1 pl-2">
                        💡 <MathText text={cm.explanation} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: MINI-QUIZ KIỂM TRA HIỂU BÀI */}
            {currentLesson.miniQuiz && currentLesson.miniQuiz.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 rounded-full bg-purple-500" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>5. Thử Thách Nhanh: Mini-Quiz Củng Cố</span>
                    </h3>
                  </div>
                  <span className="text-xs text-purple-300 font-bold bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/60">
                    +60 XP Thi Đua
                  </span>
                </div>

                <div className="space-y-4">
                  {currentLesson.miniQuiz.map((quiz, qIdx) => {
                    const chosen = quizAnswers[qIdx];
                    const isCorrect = chosen === quiz.correctAnswer;
                    return (
                      <div key={qIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                          Câu {qIdx + 1}: <MathText text={quiz.question} />
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {quiz.options.map((opt, optIdx) => {
                            const isThisChosen = chosen === optIdx;
                            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                            if (quizChecked) {
                              if (optIdx === quiz.correctAnswer) {
                                btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold';
                              } else if (isThisChosen && !isCorrect) {
                                btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                              }
                            } else if (isThisChosen) {
                              btnStyle = 'bg-indigo-600 border-indigo-400 text-white font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={quizChecked}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition flex items-center gap-2.5 min-h-[48px] ${btnStyle}`}
                              >
                                <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <MathText text={opt} className="font-semibold" />
                              </button>
                            );
                          })}
                        </div>

                        {quizChecked && (
                          <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isCorrect ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-900/40' : 'bg-rose-950/30 text-rose-300 border border-rose-900/40'
                          }`}>
                            <strong>{isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng!'}</strong> <MathText text={quiz.explanation} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-2">
                    {!quizChecked ? (
                      <button
                        onClick={handleCheckQuiz}
                        disabled={Object.keys(quizAnswers).length === 0}
                        className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition shadow-lg shadow-purple-950/50"
                      >
                        Kiểm Tra Kết Quả (+60 XP)
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-purple-300">
                          Đúng: {quizScore} / {currentLesson.miniQuiz.length} câu
                        </span>
                        <button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizChecked(false);
                            setQuizScore(null);
                          }}
                          className="text-xs text-slate-400 hover:text-white underline"
                        >
                          Làm lại Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Nav: Prev / Next */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              {prevLesson ? (
                <button
                  onClick={() => handleSelectLessonClick(prevLesson)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Bài trước: {prevLesson.title.slice(0, 20)}...</span>
                </button>
              ) : <div />}

              {nextLesson ? (
                <button
                  onClick={() => handleSelectLessonClick(nextLesson)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md"
                >
                  <span>Bài kế: {nextLesson.title.slice(0, 20)}...</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : <div />}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
