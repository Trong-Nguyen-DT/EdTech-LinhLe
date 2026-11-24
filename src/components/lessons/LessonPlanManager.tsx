import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Clock,
  Sparkles,
  Eye,
  X,
  Save,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
  FolderPlus,
} from 'lucide-react';
import {
  CommonMistake,
  GoldenFormula,
  GradeLevel,
  KnowledgeLesson,
  MathCategory,
  MiniQuizQuestion,
  ProblemTypeMethod,
} from '../../types';
import { MathText } from '../common/MathText';

interface Props {
  lessons: KnowledgeLesson[];
  onUpdateLessons: (lessons: KnowledgeLesson[]) => void;
  isTeacherUnlocked: boolean;
  onRequestTeacherUnlock: () => void;
}

const GRADE_TABS: Array<{ grade: GradeLevel; shortLabel: string }> = [
  { grade: 'Toán 6', shortLabel: 'Khối 6' },
  { grade: 'Toán 7', shortLabel: 'Khối 7' },
  { grade: 'Toán 8', shortLabel: 'Khối 8' },
  { grade: 'Toán 9', shortLabel: 'Khối 9' },
];

const CATEGORIES: MathCategory[] = [
  'Số học & Đại số',
  'Hình học & Đo lường',
  'Thống kê & Xác suất',
  'Tính nhanh & Tư duy logic',
];

function createEmptyLessonForm(
  grade: GradeLevel,
  chapterNumber: number,
  chapterName: string,
  lessonNumber: number
): KnowledgeLesson {
  return {
    id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    grade,
    chapter: chapterName,
    chapterNumber,
    lessonNumber,
    title: '',
    category: 'Số học & Đại số',
    readingTimeMinutes: 5,
    examRelevance: '',
    coreTheory: [''],
    goldenFormulas: [
      {
        title: '',
        formula: '',
        note: '',
        highlight: true,
      },
    ],
    problemTypes: [],
    commonMistakes: [],
    miniQuiz: [],
  };
}

export const LessonPlanManager: React.FC<Props> = ({
  lessons,
  onUpdateLessons,
  isTeacherUnlocked,
  onRequestTeacherUnlock,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('Toán 6');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [formState, setFormState] = useState<KnowledgeLesson>(() =>
    createEmptyLessonForm('Toán 6', 1, '', 1)
  );
  const [previewLesson, setPreviewLesson] = useState<KnowledgeLesson | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const gradeLessons = useMemo(() => {
    return lessons
      .filter((l) => l.grade === selectedGrade)
      .sort((a, b) => {
        if (a.chapterNumber !== b.chapterNumber) {
          return a.chapterNumber - b.chapterNumber;
        }
        return a.lessonNumber - b.lessonNumber;
      });
  }, [lessons, selectedGrade]);

  const existingChaptersInGrade = useMemo(() => {
    const map = new Map<number, string>();
    gradeLessons.forEach((l) => {
      if (!map.has(l.chapterNumber)) {
        map.set(l.chapterNumber, l.chapter);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([chapterNumber, chapter]) => ({ chapterNumber, chapter }));
  }, [gradeLessons]);

  const filteredGradeLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return gradeLessons.filter((l) => {
      const matchCat = filterCategory === 'all' || l.category === filterCategory;
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.chapter.toLowerCase().includes(q) ||
        l.coreTheory.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [gradeLessons, searchQuery, filterCategory]);

  const groupedByChapter = useMemo(() => {
    const groups: Array<{
      chapterNumber: number;
      chapterName: string;
      items: KnowledgeLesson[];
    }> = [];

    filteredGradeLessons.forEach((lesson) => {
      let group = groups.find(
        (g) =>
          g.chapterNumber === lesson.chapterNumber &&
          g.chapterName === lesson.chapter
      );
      if (!group) {
        group = {
          chapterNumber: lesson.chapterNumber,
          chapterName: lesson.chapter,
          items: [],
        };
        groups.push(group);
      }
      group.items.push(lesson);
    });

    return groups.sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [filteredGradeLessons]);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  const openCreateNewChapterLesson = () => {
    const maxChapter = existingChaptersInGrade.reduce(
      (max, c) => Math.max(max, c.chapterNumber),
      0
    );
    const nextChapterNum = maxChapter + 1;
    setEditingLessonId(null);
    setFormState(
      createEmptyLessonForm(
        selectedGrade,
        nextChapterNum,
        `Chương ${nextChapterNum}: `,
        1
      )
    );
    setIsEditorOpen(true);
  };

  const openAddLessonToChapter = (
    chapterNumber: number,
    chapterName: string
  ) => {
    const lessonsInChapter = gradeLessons.filter(
      (l) => l.chapterNumber === chapterNumber
    );
    const maxLessonNum = lessonsInChapter.reduce(
      (max, l) => Math.max(max, l.lessonNumber),
      0
    );
    setEditingLessonId(null);
    setFormState(
      createEmptyLessonForm(
        selectedGrade,
        chapterNumber,
        chapterName,
        maxLessonNum + 1
      )
    );
    setIsEditorOpen(true);
  };

  const openEditLesson = (lesson: KnowledgeLesson) => {
    setEditingLessonId(lesson.id);
    setFormState({
      ...lesson,
      coreTheory: lesson.coreTheory.length > 0 ? [...lesson.coreTheory] : [''],
      goldenFormulas: lesson.goldenFormulas.map((f) => ({ ...f })),
      problemTypes: lesson.problemTypes.map((pt) => ({
        ...pt,
        example: { ...pt.example },
      })),
      commonMistakes: lesson.commonMistakes.map((cm) => ({ ...cm })),
      miniQuiz: lesson.miniQuiz.map((q) => ({ ...q, options: [...q.options] })),
    });
    setIsEditorOpen(true);
  };

  const handleDeleteLesson = (lesson: KnowledgeLesson) => {
    if (
      confirm(
        `Thầy/Cô có chắc chắn muốn xóa bài "${lesson.title}" khỏi ${lesson.grade}?`
      )
    ) {
      const updated = lessons.filter((l) => l.id !== lesson.id);
      onUpdateLessons(updated);
      showToast(`Đã xóa bài "${lesson.title}".`);
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.chapter.trim()) return;

    const cleanedLesson: KnowledgeLesson = {
      ...formState,
      chapter: formState.chapter.trim(),
      chapterNumber: Math.max(1, Number(formState.chapterNumber) || 1),
      lessonNumber: Math.max(1, Number(formState.lessonNumber) || 1),
      title: formState.title.trim(),
      readingTimeMinutes: Math.max(1, Number(formState.readingTimeMinutes) || 5),
      examRelevance: formState.examRelevance?.trim() || undefined,
      coreTheory: formState.coreTheory.map((t) => t.trim()).filter(Boolean),
      goldenFormulas: formState.goldenFormulas
        .map((gf) => ({
          title: gf.title.trim(),
          formula: gf.formula.trim(),
          note: gf.note?.trim() || undefined,
          highlight: Boolean(gf.highlight),
        }))
        .filter((gf) => gf.title || gf.formula),
      problemTypes: formState.problemTypes
        .map((pt) => ({
          name: pt.name.trim(),
          method: pt.method.trim(),
          example: {
            problem: pt.example.problem.trim(),
            solution: pt.example.solution.trim(),
            tips: pt.example.tips?.trim() || undefined,
          },
        }))
        .filter((pt) => pt.name || pt.method || pt.example.problem),
      commonMistakes: formState.commonMistakes
        .map((cm) => ({
          mistake: cm.mistake.trim(),
          correction: cm.correction.trim(),
          explanation: cm.explanation.trim(),
        }))
        .filter((cm) => cm.mistake || cm.correction),
      miniQuiz: formState.miniQuiz
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          correctAnswer:
            q.correctAnswer >= 0 && q.correctAnswer < 4 ? q.correctAnswer : 0,
          explanation: q.explanation.trim(),
        }))
        .filter((q) => q.question && q.options.some(Boolean)),
    };

    const updated = editingLessonId
      ? lessons.map((l) => (l.id === editingLessonId ? cleanedLesson : l))
      : [...lessons, cleanedLesson];

    onUpdateLessons(updated);
    setSelectedGrade(cleanedLesson.grade);
    setIsEditorOpen(false);
    showToast(
      editingLessonId
        ? `Đã cập nhật bài "${cleanedLesson.title}" vào Kiến thức trọng tâm!`
        : `Đã thêm bài "${cleanedLesson.title}" vào ${cleanedLesson.grade}!`
    );
  };

  if (!isTeacherUnlocked) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white">
          Khu Vực Quản Lý Giáo Án (Khối 6 – 9)
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Chức năng biên soạn bài học cho mục Kiến thức trọng tâm đang tạm khóa. Vui lòng nhập mã PIN Giáo viên để tiếp tục.
        </p>
        <button
          type="button"
          onClick={onRequestTeacherUnlock}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30"
        >
          Mở Khóa Quyền Giáo Viên
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Quản Lý Giáo Án & Kiến Thức Trọng Tâm (Khối 6 – 9)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tạo thủ công từng bài học theo từng chương cho 4 khối 6, 7, 8, 9. Dữ liệu đồng bộ trực tiếp sang mục{' '}
            <strong className="text-indigo-300">Kiến Thức Trọng Tâm</strong> ở Góc Học Sinh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreateNewChapterLesson}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4 text-emerald-400" />
            <span>Thêm Chương Mới</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const latestChapter =
                existingChaptersInGrade[existingChaptersInGrade.length - 1];
              if (latestChapter) {
                openAddLessonToChapter(
                  latestChapter.chapterNumber,
                  latestChapter.chapter
                );
              } else {
                openCreateNewChapterLesson();
              }
            }}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bài Giáo Án ({selectedGrade})</span>
          </button>
        </div>
      </div>

      {/* Saved feedback banner */}
      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 4 Grade Tabs: Khối 6, 7, 8, 9 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GRADE_TABS.map(({ grade, shortLabel }) => {
          const gradeItems = lessons.filter((l) => l.grade === grade);
          const chapterCount = new Set(
            gradeItems.map((l) => `${l.chapterNumber}-${l.chapter}`)
          ).size;
          const isActive = selectedGrade === grade;

          return (
            <button
              key={grade}
              type="button"
              onClick={() => {
                setSelectedGrade(grade);
                setSearchQuery('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">
                  {shortLabel}
                </span>
                <span className="text-base font-black block mt-0.5">
                  {grade}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg block ${
                    isActive
                      ? 'bg-black/20 text-white'
                      : 'bg-slate-800 text-indigo-300'
                  }`}
                >
                  {gradeItems.length} bài
                </span>
                <span
                  className={`text-[11px] block mt-1 ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {chapterCount} chương
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Tìm bài học, chương trong ${selectedGrade}...`}
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Lọc theo phân môn"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Tất cả phân môn</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-400 px-2">
            Hiển thị <strong className="text-white">{filteredGradeLessons.length}</strong> bài
          </span>
        </div>
      </div>

      {/* Chapters & Lessons List */}
      {groupedByChapter.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Chưa có bài giáo án nào trong {selectedGrade} khớp với bộ lọc.
          </p>
          <button
            type="button"
            onClick={openCreateNewChapterLesson}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài đầu tiên cho {selectedGrade}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByChapter.map((group) => (
            <div
              key={`${group.chapterNumber}-${group.chapterName}`}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg"
            >
              {/* Chapter Header */}
              <div className="p-4 sm:p-5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-black">
                    Chương {group.chapterNumber}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {group.chapterName}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {group.items.length} bài giáo án trong chương
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openAddLessonToChapter(group.chapterNumber, group.chapterName)
                  }
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm bài vào chương này</span>
                </button>
              </div>

              {/* Lessons inside Chapter */}
              <div className="divide-y divide-slate-800">
                {group.items.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-800/30 transition"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold">
                          Bài {lesson.lessonNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {lesson.category}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.readingTimeMinutes} phút
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-white">
                        {lesson.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>{lesson.coreTheory.length} ý lý thuyết</span>
                        <span>•</span>
                        <span>{lesson.goldenFormulas.length} công thức vàng</span>
                        <span>•</span>
                        <span>{lesson.problemTypes.length} dạng bài mẫu</span>
                        <span>•</span>
                        <span>{lesson.miniQuiz.length} câu Mini-Quiz</span>
                      </div>

                      {lesson.examRelevance && (
                        <p className="text-[11px] text-amber-300 flex items-center gap-1 pt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{lesson.examRelevance}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewLesson(lesson)}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Xem</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditLesson(lesson)}
                        className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLesson(lesson)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition"
                        title="Xóa bài giáo án"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold">
                    {previewLesson.grade}
                  </span>
                  <span className="text-xs text-slate-400">
                    {previewLesson.chapter} • Bài {previewLesson.lessonNumber}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {previewLesson.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewLesson.coreTheory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  1. Lý thuyết trọng tâm
                </h4>
                <ul className="space-y-1.5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300">
                  {previewLesson.coreTheory.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                      <MathText text={pt} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewLesson.goldenFormulas.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  2. Hộp công thức vàng
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewLesson.goldenFormulas.map((gf, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1"
                    >
                      <span className="text-[11px] font-bold text-amber-400 block">
                        {gf.title}
                      </span>
                      <div className="font-mono text-sm font-bold text-white">
                        <MathText text={gf.formula} />
                      </div>
                      {gf.note && (
                        <p className="text-[11px] text-slate-400 italic">
                          <MathText text={gf.note} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewLesson.problemTypes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  3. Dạng bài & Ví dụ minh họa
                </h4>
                <div className="space-y-3">
                  {previewLesson.problemTypes.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <p className="font-bold text-indigo-300">{pt.name}</p>
                      {pt.method && (
                        <div className="text-slate-300 whitespace-pre-line">
                          <MathText text={pt.method} />
                        </div>
                      )}
                      {pt.example.problem && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <p className="font-semibold text-white">
                            VD: <MathText text={pt.example.problem} />
                          </p>
                          <p className="text-slate-300 whitespace-pre-line">
                            <MathText text={pt.example.solution} />
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const target = previewLesson;
                  setPreviewLesson(null);
                  openEditLesson(target);
                }}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa bài này</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="py-2 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LESSON MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 my-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  {editingLessonId
                    ? 'Chỉnh Sửa Bài Giáo Án'
                    : 'Tạo Bài Giáo Án Mới (Thủ Công)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hỗ trợ công thức toán LaTeX bọc trong dấu{' '}
                  <code className="text-indigo-300">$...$</code> (VD:{' '}
                  <code className="text-indigo-300">$(a+b)^2 = a^2 + 2ab + b^2$</code>).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-6">
              {/* SECTION A: GENERAL METADATA */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  Thông tin Chương & Bài học
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Khối lớp
                    </label>
                    <select
                      value={formState.grade}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          grade: e.target.value as GradeLevel,
                        }))
                      }
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {GRADE_TABS.map((g) => (
                        <option key={g.grade} value={g.grade}>
                          {g.grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Số thứ tự chương
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formState.chapterNumber}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          chapterNumber: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Số thứ tự bài
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formState.lessonNumber}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          lessonNumber: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tên chương (chọn nhanh chương có sẵn hoặc nhập tên chương mới)
                  </label>
                  <input
                    type="text"
                    required
                    list="existing-chapters-list"
                    value={formState.chapter}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = existingChaptersInGrade.find(
                        (c) => c.chapter === val
                      );
                      setFormState((prev) => ({
                        ...prev,
                        chapter: val,
                        chapterNumber: matched
                          ? matched.chapterNumber
                          : prev.chapterNumber,
                      }));
                    }}
                    placeholder="VD: Chương 1: Tập hợp các số tự nhiên"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="existing-chapters-list">
                    {existingChaptersInGrade.map((c) => (
                      <option key={c.chapterNumber} value={c.chapter} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tên bài học
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="VD: Bài 1: Thứ Tự Thực Hiện Phép Tính"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Phân môn
                    </label>
                    <select
                      value={formState.category}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          category: e.target.value as MathCategory,
                        }))
                      }
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Thời lượng đọc (phút)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formState.readingTimeMinutes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          readingTimeMinutes: parseInt(e.target.value, 10) || 5,
                        }))
                      }
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Ghi chú thi cử (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={formState.examRelevance || ''}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          examRelevance: e.target.value,
                        }))
                      }
                      placeholder="VD: Thường ra câu 1 đề giữa kì 1"
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: CORE THEORY */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                    1. Lý Thuyết & Định Nghĩa Trọng Tâm
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        coreTheory: [...prev.coreTheory, ''],
                      }))
                    }
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm ý
                  </button>
                </div>

                <div className="space-y-2">
                  {formState.coreTheory.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={point}
                        onChange={(e) => {
                          const next = [...formState.coreTheory];
                          next[idx] = e.target.value;
                          setFormState((prev) => ({ ...prev, coreTheory: next }));
                        }}
                        placeholder={`Ý trọng tâm #${idx + 1}...`}
                        className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                      {formState.coreTheory.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              coreTheory: prev.coreTheory.filter((_, i) => i !== idx),
                            }))
                          }
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40"
                          title="Xóa ý này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: GOLDEN FORMULAS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    2. Hộp Công Thức Vàng
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        goldenFormulas: [
                          ...prev.goldenFormulas,
                          { title: '', formula: '', note: '', highlight: false },
                        ],
                      }))
                    }
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm công thức
                  </button>
                </div>

                {formState.goldenFormulas.length === 0 && (
                  <p className="text-xs text-slate-500 italic">
                    Chưa có công thức vàng. Nhấn "Thêm công thức" nếu bài học có công thức cần ghi nhớ.
                  </p>
                )}

                <div className="space-y-3">
                  {formState.goldenFormulas.map((gf, idx) => {
                    const updateFormula = (patch: Partial<GoldenFormula>) => {
                      const next = formState.goldenFormulas.map((item, i) =>
                        i === idx ? { ...item, ...patch } : item
                      );
                      setFormState((prev) => ({ ...prev, goldenFormulas: next }));
                    };

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-amber-400">
                            Công thức #{idx + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(gf.highlight)}
                                onChange={(e) =>
                                  updateFormula({ highlight: e.target.checked })
                                }
                              />
                              <span>Nổi bật</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((prev) => ({
                                  ...prev,
                                  goldenFormulas: prev.goldenFormulas.filter(
                                    (_, i) => i !== idx
                                  ),
                                }))
                              }
                              className="text-xs text-rose-400 hover:text-rose-300"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={gf.title}
                            onChange={(e) => updateFormula({ title: e.target.value })}
                            placeholder="Tên công thức (VD: Định lí Pythagore)"
                            className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <input
                            type="text"
                            value={gf.note || ''}
                            onChange={(e) => updateFormula({ note: e.target.value })}
                            placeholder="Ghi chú ngắn (tùy chọn)"
                            className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <input
                          type="text"
                          value={gf.formula}
                          onChange={(e) => updateFormula({ formula: e.target.value })}
                          placeholder="Công thức (VD: $a^2 + b^2 = c^2$)"
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION D: PROBLEM TYPES & EXAMPLES */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                    3. Dạng Bài Trọng Tâm & Ví Dụ Minh Họa
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        problemTypes: [
                          ...prev.problemTypes,
                          {
                            name: '',
                            method: '',
                            example: { problem: '', solution: '', tips: '' },
                          },
                        ],
                      }))
                    }
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm dạng bài
                  </button>
                </div>

                {formState.problemTypes.length === 0 && (
                  <p className="text-xs text-slate-500 italic">
                    Chưa có dạng bài mẫu. Nhấn "Thêm dạng bài" để bổ sung phương pháp giải và ví dụ.
                  </p>
                )}

                <div className="space-y-3">
                  {formState.problemTypes.map((pt, idx) => {
                    const updatePT = (patch: Partial<ProblemTypeMethod>) => {
                      const next = formState.problemTypes.map((item, i) =>
                        i === idx ? { ...item, ...patch } : item
                      );
                      setFormState((prev) => ({ ...prev, problemTypes: next }));
                    };

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-300">
                            Dạng bài #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                problemTypes: prev.problemTypes.filter(
                                  (_, i) => i !== idx
                                ),
                              }))
                            }
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Xóa
                          </button>
                        </div>

                        <input
                          type="text"
                          value={pt.name}
                          onChange={(e) => updatePT({ name: e.target.value })}
                          placeholder="Tên dạng bài (VD: Dạng 1: Tính nhanh bằng tính chất phân phối)"
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />

                        <textarea
                          rows={2}
                          value={pt.method}
                          onChange={(e) => updatePT({ method: e.target.value })}
                          placeholder="Phương pháp giải từng bước..."
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />

                        <input
                          type="text"
                          value={pt.example.problem}
                          onChange={(e) =>
                            updatePT({
                              example: { ...pt.example, problem: e.target.value },
                            })
                          }
                          placeholder="Đề bài ví dụ minh họa"
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />

                        <textarea
                          rows={2}
                          value={pt.example.solution}
                          onChange={(e) =>
                            updatePT({
                              example: { ...pt.example, solution: e.target.value },
                            })
                          }
                          placeholder="Lời giải chi tiết ví dụ"
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />

                        <input
                          type="text"
                          value={pt.example.tips || ''}
                          onChange={(e) =>
                            updatePT({
                              example: { ...pt.example, tips: e.target.value },
                            })
                          }
                          placeholder="Lời khuyên thầy cô (tùy chọn)"
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION E: COMMON MISTAKES */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    4. Bẫy Toán Học & Lỗi Sai Cần Tránh (tùy chọn)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        commonMistakes: [
                          ...prev.commonMistakes,
                          { mistake: '', correction: '', explanation: '' },
                        ],
                      }))
                    }
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm lưu ý lỗi sai
                  </button>
                </div>

                {formState.commonMistakes.map((cm, idx) => {
                  const updateCM = (patch: Partial<CommonMistake>) => {
                    const next = formState.commonMistakes.map((item, i) =>
                      i === idx ? { ...item, ...patch } : item
                    );
                    setFormState((prev) => ({ ...prev, commonMistakes: next }));
                  };

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-rose-300">
                          Lỗi sai #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              commonMistakes: prev.commonMistakes.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          Xóa
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cm.mistake}
                        onChange={(e) => updateCM({ mistake: e.target.value })}
                        placeholder="Lỗi sai học sinh hay mắc"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={cm.correction}
                        onChange={(e) => updateCM({ correction: e.target.value })}
                        placeholder="Cách làm đúng"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={cm.explanation}
                        onChange={(e) => updateCM({ explanation: e.target.value })}
                        placeholder="Giải thích ngắn gọn"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* SECTION F: MINI QUIZ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    5. Mini-Quiz Củng Cố (tùy chọn)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        miniQuiz: [
                          ...prev.miniQuiz,
                          {
                            question: '',
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                            explanation: '',
                          },
                        ],
                      }))
                    }
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm câu Mini-Quiz
                  </button>
                </div>

                {formState.miniQuiz.map((q, qIdx) => {
                  const updateQuiz = (patch: Partial<MiniQuizQuestion>) => {
                    const next = formState.miniQuiz.map((item, i) =>
                      i === qIdx ? { ...item, ...patch } : item
                    );
                    setFormState((prev) => ({ ...prev, miniQuiz: next }));
                  };

                  return (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-300">
                          Câu Mini-Quiz #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              miniQuiz: prev.miniQuiz.filter((_, i) => i !== qIdx),
                            }))
                          }
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          Xóa
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuiz({ question: e.target.value })}
                        placeholder="Nội dung câu hỏi trắc nghiệm"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`quiz-correct-${qIdx}`}
                              checked={q.correctAnswer === oIdx}
                              onChange={() => updateQuiz({ correctAnswer: oIdx })}
                              title="Chọn làm đáp án đúng"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const nextOpts = [...q.options];
                                nextOpts[oIdx] = e.target.value;
                                updateQuiz({ options: nextOpts });
                              }}
                              placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => updateQuiz({ explanation: e.target.value })}
                        placeholder="Giải thích đáp án đúng"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingLessonId ? 'Lưu Cập Nhật Giáo Án' : 'Lưu Bài Giáo Án Mới'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
