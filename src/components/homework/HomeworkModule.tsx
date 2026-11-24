import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle2, XCircle, Clock, 
  AlertCircle, Plus, Send, Eye, MessageSquare, 
  FileText, Users, Award, BellRing, Copy, Check,
  Trophy, Lightbulb, Heart, Lock, BookOpen, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassGroup, EssayAnswerUpload, GradeLevel, HomeworkAssignment, HomeworkSubmission, Question, Student, TargetAudience } from '../../types';
import { Storage } from '../../utils/storage';
import { WeekendHonorsModal } from '../reports/WeekendHonorsModal';
import { ImportDocumentModal } from '../common/ImportDocumentModal';
import { MathText } from '../common/MathText';
import { EssayImageUploadBox } from '../common/EssayImageUploadBox';
import { isEssayQuestion } from '../../utils/imageUpload';

interface Props {
  students: Student[];
  classes: ClassGroup[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  isTeacherUnlocked: boolean;
  onRequestTeacherUnlock?: () => void;
  onRequestChangeStudent?: () => void;
  lockedClassId?: string | null;
}

const DEFAULT_STUDENT: Student = {
  id: 'guest',
  studentCode: 'HS801',
  parentCode: 'PH801',
  username: 'hs801',
  password: '123456',
  parentUsername: 'ph801',
  parentPassword: '123456',
  name: 'Học sinh Toán THCS',
  classId: 'class-6a1',
  avatar: '👨‍🎓',
  totalPoints: 1000,
  streakCount: 3,
  gamesPlayed: 5,
  accuracyRate: 85,
  skills: { algebra: 85, geometry: 85, statistics: 85, speed: 85 },
  recentResults: []
};

export const HomeworkModule: React.FC<Props> = ({
  students,
  classes,
  activeStudentId,
  onStudentSelect: _onStudentSelect,
  isTeacherUnlocked,
  onRequestTeacherUnlock,
  onRequestChangeStudent,
  lockedClassId
}) => {
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>(() => Storage.getHomeworks());
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(() => Storage.getHomeworkSubmissions());
  
  // Selected homework for teacher detail review
  const [selectedHwForTeacher, setSelectedHwForTeacher] = useState<HomeworkAssignment | null>(null);
  
  // Student doing homework state
  const [doingHomework, setDoingHomework] = useState<HomeworkAssignment | null>(null);
  const [hwAnswers, setHwAnswers] = useState<Record<number, number>>({});
  const [hwEssayAnswers, setHwEssayAnswers] = useState<Record<number, EssayAnswerUpload>>({});
  const [hwCurrentQ, setHwCurrentQ] = useState(0);
  const [hwResult, setHwResult] = useState<HomeworkSubmission | null>(null);

  // Teacher reviewing student essay submission modal
  const [reviewingSubmission, setReviewingSubmission] = useState<{
    student: Student;
    sub: HomeworkSubmission;
  } | null>(null);
  const [reviewScore, setReviewScore] = useState<string>('');
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  // Accessibility state
  const [hwFontSize, setHwFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showHwHint, setShowHwHint] = useState(false);

  // Filter Audience state
  const [filterAudience, setFilterAudience] = useState<string>('all'); // 'all' | 'standard' | 'inclusive'

  // Weekend honors modal
  const [showWeekendHonorsModal, setShowWeekendHonorsModal] = useState(false);

  // Teacher Create Homework Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('2025-05-20 21:00');
  const [newDescription, setNewDescription] = useState('');
  const [newHwAudience, setNewHwAudience] = useState<TargetAudience>('standard');
  const [showImportModal, setShowImportModal] = useState(false);

  // Copied reminder alert
  const [copiedReminder, setCopiedReminder] = useState(false);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || DEFAULT_STUDENT;
  const activeStudentClass = classes.find(c => c.id === activeStudent.classId);

  // Homeworks assigned to the active student's class with audience filter
  const classHomeworks = homeworks.filter(h => h.classId === activeStudent.classId);
  const studentHomeworks = classHomeworks.filter(h => {
    if (filterAudience === 'all') return true;
    if (filterAudience === 'inclusive') return h.targetAudience === 'inclusive' || h.isInclusiveAdapted;
    return h.targetAudience === 'standard' || (!h.isInclusiveAdapted && h.targetAudience !== 'inclusive');
  });

  // Submit student homework
  const handleSubmitHomework = () => {
    if (!doingHomework) return;

    let correct = 0;
    let essayCount = 0;
    doingHomework.questions.forEach((q, idx) => {
      if (isEssayQuestion(q)) {
        essayCount++;
      } else if (hwAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const totalQ = doingHomework.questions.length;
    const mcCount = totalQ - essayCount;
    const rawScore = mcCount > 0 ? (correct / totalQ) * 10 : 0;
    const score = Math.round(rawScore * 10) / 10;

    const isInc = Boolean(doingHomework.isInclusiveAdapted || doingHomework.targetAudience === 'inclusive' || activeStudent.isInclusive);

    const sub: HomeworkSubmission = {
      id: `sub-hw-${Date.now()}`,
      homeworkId: doingHomework.id,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      answers: hwAnswers,
      essayAnswers: essayCount > 0 ? hwEssayAnswers : undefined,
      hasEssayQuestions: essayCount > 0,
      essayReviewStatus: essayCount > 0 ? 'pending' : undefined,
      score,
      correctCount: correct,
      totalQuestions: totalQ,
      timeSpentSeconds: 180,
      isInclusiveSubmission: isInc,
      submittedAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'submitted',
      teacherFeedback: essayCount > 0
        ? 'Đã ghi nhận bài làm trắc nghiệm & ảnh bài tự luận (Chờ giáo viên chấm điểm tự luận).'
        : isInc 
        ? 'Rất khen ngợi tinh thần tự giác nỗ lực của em! Bài làm tiến bộ rõ rệt.'
        : 'Đã ghi nhận bài nộp vào hệ thống!'
    };

    Storage.recordHomeworkSubmission(sub);
    setSubmissions(prev => [sub, ...prev.filter(s => !(s.homeworkId === sub.homeworkId && s.studentId === sub.studentId))]);
    setHwResult(sub);

    if (score >= 8) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleSaveTeacherReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission) return;
    const parsedScore = Math.max(0, Math.min(10, parseFloat(reviewScore) || 0));
    const updatedSub: HomeworkSubmission = {
      ...reviewingSubmission.sub,
      score: Math.round(parsedScore * 10) / 10,
      teacherFeedback: reviewFeedback.trim() || 'Giáo viên đã kiểm tra và chấm bài tự luận.',
      essayReviewStatus: 'graded',
    };
    Storage.updateHomeworkSubmission(updatedSub);
    setSubmissions(prev => prev.map(s => (s.id === updatedSub.id ? updatedSub : s)));
    setReviewingSubmission(null);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetClass = classes.find(c => c.id === newClassId);
    const allQuestions = Storage.getQuestions();
    const classQuestions = allQuestions.filter(q => q.grade === targetClass?.grade);
    const isInc = newHwAudience === 'inclusive';
    const chosenQuestions = isInc 
      ? classQuestions.filter(q => q.difficulty === 'Nhận biết' || q.difficulty === 'Thông hiểu').slice(0, 3)
      : classQuestions.slice(0, 4);

    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: newTitle.trim(),
      classId: newClassId,
      grade: targetClass?.grade || 'Toán 8',
      targetAudience: newHwAudience,
      isInclusiveAdapted: isInc,
      inclusiveNotes: isInc ? 'Bài tập giảm tải theo KHGD cá nhân (TT03/2018/BGDĐT)' : undefined,
      description: newDescription.trim() || (isInc ? 'Bài tập củng cố nhẹ nhàng, tinh gọn kiến thức trọng tâm có kèm gợi ý.' : 'Bài tập rèn luyện củng cố kiến thức tuần học.'),
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: newDueDate,
      questions: chosenQuestions.length > 0 ? chosenQuestions : allQuestions.slice(0, 3)
    };

    const updated = [newHw, ...homeworks];
    setHomeworks(updated);
    Storage.saveHomeworks(updated);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewHwAudience('standard');
  };

  const handleCopyUnsubmittedStudents = (unsubmittedNames: string[], hwTitle: string) => {
    const text = `📢 [NHẮC NHỞ BTVN TOÁN - ${hwTitle}]\nDanh sách các bạn học sinh chưa nộp bài:\n${unsubmittedNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}\nNhờ Quý phụ huynh nhắc nhở các con hoàn thành và nộp trước hạn chót. Trân trọng!`;
    navigator.clipboard.writeText(text);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2500);
  };

  // --- VIEW 1: STUDENT TAKING HOMEWORK ---
  if (doingHomework && !hwResult) {
    const currentQ = doingHomework.questions[hwCurrentQ];
    const totalQ = doingHomework.questions.length;
    const isInc = Boolean(doingHomework.isInclusiveAdapted || doingHomework.targetAudience === 'inclusive' || activeStudent.isInclusive);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                {doingHomework.grade} • Hạn nộp: {doingHomework.dueDate}
              </span>
              {isInc && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 flex items-center gap-1">
                  🌱 Hòa Nhập
                </span>
              )}
            </div>
            <span className="text-slate-400">Học sinh: <strong className="text-white">{activeStudent.name}</strong></span>
          </div>
          <h2 className="text-xl font-black text-white">{doingHomework.title}</h2>
          <p className="text-xs text-slate-400">{doingHomework.description}</p>
        </div>

        {/* Accessibility Toolbar */}
        <div className="p-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-teal-400" /> Cỡ chữ:
            </span>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setHwFontSize('normal')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${hwFontSize === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A Chuẩn
              </button>
              <button
                type="button"
                onClick={() => setHwFontSize('large')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${hwFontSize === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A+ Lớn
              </button>
              <button
                type="button"
                onClick={() => setHwFontSize('xlarge')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${hwFontSize === 'xlarge' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A++
              </button>
            </div>
          </div>

          {(currentQ?.hint || isInc) && (
            <button
              type="button"
              onClick={() => setShowHwHint(!showHwHint)}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
                showHwHint ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {showHwHint ? 'Ẩn Gợi Ý' : '💡 Xem Gợi Ý Câu Này'}
            </button>
          )}
        </div>

        {/* Question Form */}
        {currentQ && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold uppercase">Câu {hwCurrentQ + 1} / {totalQ}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  isEssayQuestion(currentQ)
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                }`}>
                  {isEssayQuestion(currentQ) ? '✍️ Tự Luận · Upload Ảnh' : '📝 Trắc Nghiệm'}
                </span>
              </div>
              <span className="text-slate-400">Độ khó: {currentQ.difficulty}</span>
            </div>

            <h3 className={`font-bold text-white leading-relaxed ${
              hwFontSize === 'xlarge' ? 'text-2xl' : hwFontSize === 'large' ? 'text-xl' : 'text-base sm:text-lg'
            }`}>
              <MathText text={currentQ.prompt} />
            </h3>

            {/* Hint Box */}
            {showHwHint && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm animate-fade-in space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-300">
                  <Lightbulb className="w-4 h-4" /> Gợi ý làm bài:
                </div>
                <p className="leading-relaxed">
                  <MathText text={currentQ.hint || 'Đọc kĩ đề bài và áp dụng công thức tương ứng.'} />
                </p>
              </div>
            )}

            {isEssayQuestion(currentQ) ? (
              <EssayImageUploadBox
                value={hwEssayAnswers[hwCurrentQ]}
                onChange={(upload) => {
                  setHwEssayAnswers(prev => {
                    const next = { ...prev };
                    if (upload) next[hwCurrentQ] = upload;
                    else delete next[hwCurrentQ];
                    return next;
                  });
                }}
              />
            ) : (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = hwAnswers[hwCurrentQ] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => setHwAnswers(prev => ({ ...prev, [hwCurrentQ]: optIdx }))}
                      className={`w-full p-4 rounded-2xl border ${
                        hwFontSize === 'xlarge' ? 'text-base' : hwFontSize === 'large' ? 'text-sm' : 'text-xs sm:text-sm'
                      } font-semibold text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-700 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <MathText text={opt} />
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                disabled={hwCurrentQ === 0}
                onClick={() => {
                  setHwCurrentQ(prev => prev - 1);
                  setShowHwHint(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-30"
              >
                ← Câu Trước
              </button>

              <div className="flex gap-2">
                {hwCurrentQ < totalQ - 1 ? (
                  <button
                    onClick={() => {
                      setHwCurrentQ(prev => prev + 1);
                      setShowHwHint(false);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Câu Tiếp Theo →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitHomework}
                    className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg"
                  >
                    Hoàn Thành & Nộp Bài
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: STUDENT HOMEWORK SUBMISSION RESULT ---
  if (doingHomework && hwResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
            🎉
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Nộp Bài Tập Về Nhà Thành Công!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Bài: <strong>{doingHomework.title}</strong> • Học sinh: <strong className="text-white">{activeStudent.name}</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400">
                {hwResult.hasEssayQuestions ? 'Điểm Trắc Nghiệm (Tạm tính)' : 'Điểm Số'}
              </span>
              <p className="text-2xl font-black text-amber-400 mt-1">{hwResult.score} / 10</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400">Trắc Nghiệm Đúng</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{hwResult.correctCount} / {hwResult.totalQuestions}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400">Trạng Thái</span>
              <p className={`text-sm font-bold mt-2 ${hwResult.hasEssayQuestions ? 'text-amber-300' : 'text-indigo-400'}`}>
                {hwResult.hasEssayQuestions ? 'Chờ GV chấm tự luận' : 'Đã ghi nhận'}
              </p>
            </div>
          </div>

          {hwResult.hasEssayQuestions && hwResult.essayAnswers && (
            <div className="text-left space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Ảnh bài làm tự luận đã tải lên:
              </h4>
              {doingHomework.questions.map((q, qIdx) =>
                isEssayQuestion(q) ? (
                  <div key={q.id || qIdx} className="space-y-2">
                    <div className="text-xs font-semibold text-slate-200">
                      Câu {qIdx + 1}: <MathText text={q.prompt} />
                    </div>
                    <EssayImageUploadBox
                      value={hwResult.essayAnswers?.[qIdx]}
                      onChange={() => {}}
                      disabled
                      compact
                    />
                  </div>
                ) : null
              )}
            </div>
          )}

          <button
            onClick={() => {
              setDoingHomework(null);
              setHwResult(null);
            }}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            Quay Lại Danh Sách BTVN
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 3: TEACHER DETAILED ROSTER FOR A SPECIFIC HOMEWORK ---
  if (selectedHwForTeacher) {
    const hwClass = classes.find(c => c.id === selectedHwForTeacher.classId);
    const classAllStudents = students.filter(s => s.classId === selectedHwForTeacher.classId);
    
    // Divide into Submitted vs Unsubmitted
    const submittedStudents: { student: Student; sub: HomeworkSubmission }[] = [];
    const unsubmittedStudents: Student[] = [];

    classAllStudents.forEach(st => {
      const sub = submissions.find(s => s.homeworkId === selectedHwForTeacher.id && s.studentId === st.id);
      if (sub) {
        submittedStudents.push({ student: st, sub });
      } else {
        unsubmittedStudents.push(st);
      }
    });

    const completionRate = classAllStudents.length > 0 
      ? Math.round((submittedStudents.length / classAllStudents.length) * 100) 
      : 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back and Header */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSelectedHwForTeacher(null)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
            >
              ← Quay Lại Danh Sách BTVN
            </button>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
              {hwClass?.name} ({selectedHwForTeacher.grade})
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{selectedHwForTeacher.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Hạn chót: <strong className="text-rose-400">{selectedHwForTeacher.dueDate}</strong> • Số bài tập: {selectedHwForTeacher.questions.length} câu
            </p>
          </div>

          {/* Progress bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Tiến độ nộp bài của lớp:</span>
              <span className="font-mono font-bold text-emerald-400">
                {submittedStudents.length}/{classAllStudents.length} học sinh ({completionRate}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2 Columns: ĐÃ THAM GIA vs CHƯA THAM GIA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column A: ĐÃ NỘP BÀI (SUBMITTED) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Học Sinh ĐÃ THAM GIA & NỘP BÀI ({submittedStudents.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {submittedStudents.map(({ student, sub }) => {
                const hasEssayUploads = Boolean(sub.essayAnswers && Object.keys(sub.essayAnswers).length > 0);
                return (
                <div key={student.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{student.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs text-white truncate">{student.name}</h4>
                        {student.isInclusive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                            🌱 Hòa nhập
                          </span>
                        )}
                        {(hasEssayUploads || sub.hasEssayQuestions) && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            sub.essayReviewStatus === 'graded'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}>
                            {sub.essayReviewStatus === 'graded' ? '✓ Đã chấm tự luận' : '📷 Có ảnh tự luận'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">Nộp lúc: {sub.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-amber-400 block">{sub.score} / 10đ</span>
                      <span className="text-[10px] text-emerald-400">Đúng {sub.correctCount}/{sub.totalQuestions} câu</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingSubmission({ student, sub });
                        setReviewScore(String(sub.score));
                        setReviewFeedback(sub.teacherFeedback || '');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-bold transition"
                    >
                      Xem bài
                    </button>
                  </div>
                </div>
                );
              })}

              {submittedStudents.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">Chưa có học sinh nào nộp bài.</p>
              )}
            </div>
          </div>

          {/* Column B: CHƯA NỘP BÀI (UNSUBMITTED) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Học Sinh CHƯA THAM GIA / CHƯA NỘP ({unsubmittedStudents.length})
              </h3>

              {unsubmittedStudents.length > 0 && (
                <button
                  onClick={() => handleCopyUnsubmittedStudents(unsubmittedStudents.map(s => s.name), selectedHwForTeacher.title)}
                  className="py-1 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  {copiedReminder ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReminder ? 'Đã sao chép tin nhắn!' : 'Sao chép tin nhắn gửi Zalo'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {unsubmittedStudents.map(student => (
                <div key={student.id} className="p-3.5 rounded-2xl bg-slate-950 border border-rose-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{student.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{student.name}</h4>
                        {student.isInclusive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                            🌱 Hòa nhập
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-rose-400 font-semibold">Chưa làm bài</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[11px] font-bold">
                    Cần nhắc nhở 🔔
                  </span>
                </div>
              ))}

              {unsubmittedStudents.length === 0 && (
                <p className="text-xs text-emerald-400 text-center py-8 font-bold">
                  Tuyệt vời! 100% học sinh trong lớp đã hoàn thành bài tập về nhà.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* TEACHER SUBMISSION & ESSAY PHOTO GRADING MODAL */}
        {reviewingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Bài làm của {reviewingSubmission.student.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedHwForTeacher.title} • Nộp lúc {reviewingSubmission.sub.submittedAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedHwForTeacher.questions.map((q, qIdx) => {
                  const isEssay = isEssayQuestion(q);
                  const chosen = reviewingSubmission.sub.answers[qIdx];
                  const essayImg = reviewingSubmission.sub.essayAnswers?.[qIdx];
                  return (
                    <div key={q.id || qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-indigo-300">
                          Câu {qIdx + 1} ({isEssay ? 'Tự luận - Upload ảnh' : 'Trắc nghiệm'})
                        </span>
                        {!isEssay && (
                          <span className={chosen === q.correctAnswer ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {chosen === q.correctAnswer ? '✓ Đúng' : '✗ Sai'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        <MathText text={q.prompt} />
                      </p>
                      {isEssay ? (
                        <EssayImageUploadBox
                          value={essayImg}
                          onChange={() => {}}
                          disabled
                          compact
                        />
                      ) : (
                        <div className="text-xs text-slate-300">
                          Học sinh chọn:{' '}
                          <strong className="text-white">
                            {chosen !== undefined && q.options[chosen]
                              ? `${String.fromCharCode(65 + chosen)}. ${q.options[chosen]}`
                              : 'Chưa chọn'}
                          </strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSaveTeacherReview} className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Điểm tổng kết (0 - 10):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      value={reviewScore}
                      onChange={(e) => setReviewScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nhận xét của Giáo viên:</label>
                    <input
                      type="text"
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Nhập nhận xét bài làm tự luận cho học sinh..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingSubmission(null)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Lưu Điểm & Nhận Xét
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Counts for audience tabs
  const standardCount = classHomeworks.filter(h => h.targetAudience === 'standard' || (!h.isInclusiveAdapted && h.targetAudience !== 'inclusive')).length;
  const inclusiveCount = classHomeworks.filter(h => h.targetAudience === 'inclusive' || h.isInclusiveAdapted).length;

  // --- VIEW 4: MAIN HOMEWORK DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
              Quản Lý & Rèn Luyện Bài Tập Về Nhà
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-indigo-400" />
            Hệ Thống Bài Tập Về Nhà (BTVN)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Phân chia rõ bài tập đại trà và bài tập hòa nhập (giảm tải, có gợi ý), tự động chấm điểm và tổng hợp danh sách nộp bài.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Student Locked Badge with Code */}
          <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-slate-950 border border-indigo-500/30">
            <span className="text-base">{activeStudent.avatar}</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400">Đang làm bài:</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {activeStudent.name}
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold">
                  {activeStudent.studentCode || 'HS801'}
                </span>
                {activeStudent.isInclusive && (
                  <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[9px] font-bold">
                    🌱 Hòa Nhập
                  </span>
                )}
              </span>
            </div>
            {onRequestChangeStudent && (
              <button
                type="button"
                onClick={onRequestChangeStudent}
                className="ml-2 text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold transition"
                title="Đổi học sinh bằng mã cá nhân"
              >
                Đổi mã HS
              </button>
            )}
          </div>

          {/* Weekend Top 5 Honors Button */}
          <button
            onClick={() => setShowWeekendHonorsModal(true)}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            Top 5 Cuối Tuần
          </button>

          {/* Teacher Homework Controls (hidden for locked student accounts) */}
          {(isTeacherUnlocked || onRequestTeacherUnlock) && (
            <>
              <button
                onClick={() => {
                  if (!isTeacherUnlocked) {
                    onRequestTeacherUnlock?.();
                    return;
                  }
                  setShowImportModal(true);
                }}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
                title={isTeacherUnlocked ? "Nhập BTVN từ tệp PDF hoặc Word (.docx/.doc)" : "Yêu cầu quyền Giáo viên"}
              >
                <FileText className="w-4 h-4 text-emerald-200" />
                <span>Nhập BTVN từ PDF / Word</span>
                {!isTeacherUnlocked && <Lock className="w-3.5 h-3.5 text-emerald-200/80 ml-0.5" />}
              </button>

              {isTeacherUnlocked ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  Giao BTVN Mới
                </button>
              ) : (
                <button
                  onClick={onRequestTeacherUnlock}
                  className="py-2 px-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
                >
                  + Giáo Viên Giao Bài
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inclusive Student Welcome Banner */}
      {activeStudent.isInclusive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/40 border border-teal-500/40 flex items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl shrink-0">
              🌱
            </div>
            <div>
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                Chế Độ Học Sinh Hòa Nhập: Chào em {activeStudent.name}!
              </h4>
              <p className="text-xs text-teal-200/90 mt-0.5 leading-relaxed">
                Bài tập về nhà được tinh gọn (2-3 câu trọng tâm), có nút <strong>💡 Gợi ý làm bài</strong> và công cụ phóng to cỡ chữ để em tự giác rèn luyện thoải mái tại nhà.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterAudience('inclusive')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
          >
            Lọc Bài Hòa Nhập
          </button>
        </div>
      )}

      {/* Student View Banner: Active Student's Assignments */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="text-xl">{activeStudent.avatar}</span>
              Bài Tập Về Nhà Của Em ({activeStudent.name} - {activeStudentClass?.name || 'THCS'})
            </h3>
            <span className="text-xs text-slate-400">
              Hiển thị <strong className="text-indigo-400 font-mono">{studentHomeworks.length}</strong> bài tập
            </span>
          </div>

          {/* Audience Filter Segment */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setFilterAudience('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                filterAudience === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả ({classHomeworks.length})
            </button>
            <button
              onClick={() => setFilterAudience('standard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                filterAudience === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯 Chuẩn GDPT</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-800 font-mono">{standardCount}</span>
            </button>
            <button
              onClick={() => setFilterAudience('inclusive')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                filterAudience === 'inclusive' ? 'bg-teal-600 text-white shadow-md' : 'text-teal-400 hover:text-teal-300'
              }`}
            >
              <span>🌱 Hòa Nhập</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-teal-950 text-teal-300 font-mono border border-teal-700/50">{inclusiveCount}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentHomeworks.map(hw => {
            const studentSub = submissions.find(
              s => s.homeworkId === hw.id && s.studentId === activeStudent.id
            );
            const isIncHw = hw.isInclusiveAdapted || hw.targetAudience === 'inclusive';

            return (
              <div 
                key={hw.id}
                className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between transition-all ${
                  isIncHw 
                    ? 'bg-gradient-to-br from-teal-950/30 via-slate-950 to-slate-950 border-teal-500/30 hover:border-teal-400/60'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                        {hw.grade}
                      </span>
                      {isIncHw ? (
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/40">
                          🌱 Hòa Nhập
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                          🎯 Chuẩn GDPT
                        </span>
                      )}
                      {hw.questions.some(isEssayQuestion) && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          ✍️ Có tự luận
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Hạn: <strong className="text-rose-400">{hw.dueDate}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{hw.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{hw.description}</p>

                  {isIncHw && (
                    <div className="p-2 rounded-xl bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-300 font-semibold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{hw.inclusiveNotes || 'Bài tập giảm tải trọng tâm, có kèm gợi ý phương pháp giải.'}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                  {studentSub ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Đã nộp: <strong className="text-amber-400">{studentSub.score}/10đ</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Chưa nộp bài</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setDoingHomework(hw);
                      setHwCurrentQ(0);
                      setHwAnswers({});
                      setHwEssayAnswers({});
                      setHwResult(null);
                      setShowHwHint(false);
                    }}
                    className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition ${
                      isIncHw
                        ? 'bg-teal-600 hover:bg-teal-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {studentSub ? 'Làm Lại' : 'Làm Bài Ngay'}
                  </button>
                </div>
              </div>
            );
          })}

          {studentHomeworks.length === 0 && (
            <div className="col-span-2 p-8 text-center text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
              Không có bài tập nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </div>

      {/* Teacher View: Class Progress Roster Tracking (Strictly Teacher Only - never exposed to students) */}
      {isTeacherUnlocked && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Sổ Theo Dõi Nộp Bài Toàn Bộ Lớp Học (Dành Cho Giáo Viên)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bấm vào từng bài tập để xem danh sách chi tiết học sinh đã tham gia và học sinh chưa nộp bài.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {homeworks.map(hw => {
              const hwClass = classes.find(c => c.id === hw.classId);
              const classStudents = students.filter(s => s.classId === hw.classId);
              const submittedCount = classStudents.filter(st => 
                submissions.some(s => s.homeworkId === hw.id && s.studentId === st.id)
              ).length;
              const rate = classStudents.length > 0 ? Math.round((submittedCount / classStudents.length) * 100) : 0;
              const isInc = hw.isInclusiveAdapted || hw.targetAudience === 'inclusive';

              return (
                <div
                  key={hw.id}
                  onClick={() => setSelectedHwForTeacher(hw)}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer flex flex-wrap items-center justify-between gap-4 group"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{hw.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-semibold">{hwClass?.name}</span>
                      {isInc && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                          🌱 Hòa nhập
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">Hạn chót: {hw.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        Đã nộp: <strong className="text-emerald-400">{submittedCount}/{classStudents.length}</strong> em
                      </span>
                      <span className="text-[10px] text-slate-400">Chưa nộp: <strong className="text-rose-400">{classStudents.length - submittedCount}</strong></span>
                    </div>

                    <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${rate}%` }}
                      />
                    </div>

                    <button className="py-1.5 px-3 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKEND TOP 5 HONORS MODAL */}
      <WeekendHonorsModal
        isOpen={showWeekendHonorsModal}
        onClose={() => setShowWeekendHonorsModal(false)}
        classes={classes}
        currentStudentId={activeStudent.id}
        lockedClassId={lockedClassId}
      />

      {/* MODAL CREATE HOMEWORK (TEACHER) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Giao Bài Tập Về Nhà Mới
            </h3>

            <form onSubmit={handleCreateHomework} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tiêu Đề BTVN:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: BTVN Tuần 9: Định lý Pytago & Tứ Giác"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Đối Tượng Học Sinh Áp Dụng:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewHwAudience('standard')}
                    className={`p-2 rounded-xl border text-center transition font-bold ${
                      newHwAudience === 'standard'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎯 Chuẩn GDPT
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHwAudience('inclusive')}
                    className={`p-2 rounded-xl border text-center transition font-bold ${
                      newHwAudience === 'inclusive'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🌱 Hòa Nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHwAudience('all')}
                    className={`p-2 rounded-xl border text-center transition font-bold ${
                      newHwAudience === 'all'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👥 Cả Lớp
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Lớp Học Nhận Bài:</label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Hạn Chót Nộp Bài:</label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="Ví dụ: 2025-05-22 21:00"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Yêu Cầu & Hướng Dẫn:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Lời dặn dò của giáo viên cho các em học sinh..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Giao Bài Cho Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekend Top 5 Honors Announcement Modal */}
      <WeekendHonorsModal
        isOpen={showWeekendHonorsModal}
        onClose={() => setShowWeekendHonorsModal(false)}
        classes={classes}
        currentStudentId={activeStudent.id}
      />

      {/* Import BTVN from PDF / Word Modal */}
      <ImportDocumentModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classes={classes}
        defaultTargetType="homework"
        defaultGrade={activeStudentClass?.grade || 'Toán 8'}
        onSuccessSaveHomework={(newHw) => {
          setHomeworks(Storage.getHomeworks());
        }}
      />
    </div>
  );
};


