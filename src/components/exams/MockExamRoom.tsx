import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, Clock, Award, CheckCircle2, XCircle, 
  RotateCcw, ArrowRight, BookOpen, AlertCircle, Sparkles, 
  Filter, Plus, Search, HelpCircle, Save, Trophy,
  ZoomIn, ZoomOut, Heart, Eye, Lightbulb, Lock, Wand2, Loader2, Check, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassGroup, EssayAnswerUpload, ExamSubmission, ExamType, GradeLevel, MockExam, Question, Student, TargetAudience } from '../../types';
import { Storage } from '../../utils/storage';
import { WeekendHonorsModal } from '../reports/WeekendHonorsModal';
import { aiService } from '../../utils/aiService';
import { ImportDocumentModal } from '../common/ImportDocumentModal';
import { MathText } from '../common/MathText';
import { EssayImageUploadBox, EssayUploadSlotPreview } from '../common/EssayImageUploadBox';
import { isEssayQuestion } from '../../utils/imageUpload';

interface Props {
  students: Student[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  isTeacherUnlocked: boolean;
  onRequestTeacherUnlock?: () => void;
  onRequestChangeStudent?: () => void;
  classes?: ClassGroup[];
  lockedGrade?: GradeLevel;
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

export const MockExamRoom: React.FC<Props> = ({
  students,
  activeStudentId,
  onStudentSelect: _onStudentSelect,
  isTeacherUnlocked,
  onRequestTeacherUnlock,
  onRequestChangeStudent,
  classes,
  lockedGrade,
  lockedClassId
}) => {
  const [exams, setExams] = useState<MockExam[]>(() => Storage.getMockExams());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => Storage.getExamSubmissions());
  
  // Filter state
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterTerm, setFilterTerm] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all'); // 'all' | 'standard' | 'inclusive'

  // Exam taking state
  const [currentExam, setCurrentExam] = useState<MockExam | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, EssayAnswerUpload>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState<ExamSubmission | null>(null);
  
  // Accessibility state for inclusive learning
  const [examFontSize, setExamFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showHintForCurrentQ, setShowHintForCurrentQ] = useState(false);

  // Weekend honors modal
  const [showWeekendHonorsModal, setShowWeekendHonorsModal] = useState(false);

  // Teacher Create Exam Modal
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamGrade, setNewExamGrade] = useState<GradeLevel>('Toán 8');
  const [newExamTerm, setNewExamTerm] = useState<ExamType>('giua_ki_1');
  const [newExamDuration, setNewExamDuration] = useState(45);
  const [newExamDescription, setNewExamDescription] = useState('');
  const [newExamAudience, setNewExamAudience] = useState<TargetAudience>('standard');

  // AI Exam Generator State (Teacher Only)
  const [showAIExamModal, setShowAIExamModal] = useState(false);
  const [aiExamTitle, setAiExamTitle] = useState('');
  const [aiExamGrade, setAiExamGrade] = useState<GradeLevel>('Toán 8');
  const [aiExamTerm, setAiExamTerm] = useState<ExamType>('giua_ki_1');
  const [aiExamAudience, setAiExamAudience] = useState<TargetAudience>('standard');
  const [aiExamDuration, setAiExamDuration] = useState(45);
  const [aiExamTopic, setAiExamTopic] = useState('');
  const [aiExamCount, setAiExamCount] = useState(8);
  const [isAIExamGenerating, setIsAIExamGenerating] = useState(false);
  const [generatedAIExam, setGeneratedAIExam] = useState<MockExam | null>(null);
  const [aiExamSuccessMsg, setAiExamSuccessMsg] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleGenerateAIExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAIExamGenerating(true);
    setAiExamSuccessMsg('');
    try {
      const exam = await aiService.generateExam({
        title: aiExamTitle.trim() || `Đề Ôn Tập ${aiExamGrade} (${aiExamTerm === 'giua_ki_1' ? 'Giữa Kì 1' : 'Cuối Kì 1'})`,
        grade: aiExamGrade,
        termType: aiExamTerm,
        targetAudience: aiExamAudience,
        durationMinutes: aiExamDuration,
        topic: aiExamTopic.trim() || undefined,
        count: aiExamCount
      });
      setGeneratedAIExam(exam);
    } catch (err) {
      console.error('Error generating AI exam:', err);
    } finally {
      setIsAIExamGenerating(false);
    }
  };

  const handleSaveAIExamToCatalog = () => {
    if (!generatedAIExam) return;
    const updated = [generatedAIExam, ...exams];
    setExams(updated);
    Storage.saveMockExams(updated);
    setAiExamSuccessMsg('✓ Đã lưu đề thi do AI biên soạn vào danh mục thành công!');
    setTimeout(() => {
      setShowAIExamModal(false);
      setGeneratedAIExam(null);
      setAiExamSuccessMsg('');
    }, 1500);
  };

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || DEFAULT_STUDENT;
  const allClasses = classes || Storage.getClasses();
  const effectiveGrade = lockedGrade || filterGrade;
  const scopedExams = lockedGrade ? exams.filter(e => e.grade === lockedGrade) : exams;

  // Filtered exams
  const filteredExams = scopedExams.filter(e => {
    const matchGrade = effectiveGrade === 'all' || e.grade === effectiveGrade;
    const matchTerm = filterTerm === 'all' || e.termType === filterTerm;
    const matchAudience = 
      filterAudience === 'all'
        ? true
        : filterAudience === 'inclusive'
          ? (e.targetAudience === 'inclusive' || e.isInclusiveAdapted)
          : (e.targetAudience === 'standard' || (!e.isInclusiveAdapted && e.targetAudience !== 'inclusive'));
    return matchGrade && matchTerm && matchAudience;
  });

  // Start exam session
  const handleStartExam = (exam: MockExam) => {
    setCurrentExam(exam);
    setCurrentQIndex(0);
    setStudentAnswers({});
    setEssayAnswers({});
    setShowHintForCurrentQ(false);
    
    // Check if session applies inclusive accommodations
    const isInclusiveSession = exam.isInclusiveAdapted || exam.targetAudience === 'inclusive' || activeStudent.isInclusive;
    const multiplier = isInclusiveSession ? (exam.timeMultiplier || 1.5) : 1;
    const totalSecs = Math.round(exam.durationMinutes * multiplier * 60);

    setTimeLeftSeconds(totalSecs);
    setIsExamCompleted(false);
    setExamResult(null);
  };

  // Timer countdown during exam
  useEffect(() => {
    if (!currentExam || isExamCompleted) return;

    if (timeLeftSeconds <= 0) {
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExam, isExamCompleted, timeLeftSeconds]);

  // Handle select answer
  const handleSelectAnswer = (optionIdx: number) => {
    if (isExamCompleted) return;
    setStudentAnswers(prev => ({
      ...prev,
      [currentQIndex]: optionIdx
    }));
  };

  // Submit exam
  const handleSubmitExam = () => {
    if (!currentExam) return;

    let correct = 0;
    let essayCount = 0;
    currentExam.questions.forEach((q, idx) => {
      if (isEssayQuestion(q)) {
        essayCount++;
      } else if (studentAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const totalQ = currentExam.questions.length;
    const mcCount = totalQ - essayCount;
    const rawScore = mcCount > 0 ? (correct / totalQ) * 10 : 0;
    const roundedScore = Math.round(rawScore * 10) / 10;
    const isInclusiveSession = currentExam.isInclusiveAdapted || currentExam.targetAudience === 'inclusive' || activeStudent.isInclusive;
    const multiplier = isInclusiveSession ? (currentExam.timeMultiplier || 1.5) : 1;
    const totalAllowedSecs = Math.round(currentExam.durationMinutes * multiplier * 60);
    const timeSpent = Math.max(0, totalAllowedSecs - timeLeftSeconds);

    const sub: ExamSubmission = {
      id: `sub-exam-${Date.now()}`,
      examId: currentExam.id,
      examTitle: currentExam.title,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      answers: studentAnswers,
      essayAnswers: essayCount > 0 ? essayAnswers : undefined,
      hasEssayQuestions: essayCount > 0,
      essayReviewStatus: essayCount > 0 ? 'pending' : undefined,
      score: roundedScore,
      correctCount: correct,
      totalQuestions: totalQ,
      timeSpentSeconds: timeSpent,
      isInclusiveSubmission: isInclusiveSession,
      submittedAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    Storage.recordExamSubmission(sub);
    setSubmissions(prev => [sub, ...prev]);
    setExamResult(sub);
    setIsExamCompleted(true);

    if (roundedScore >= 8) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    // Pull 5 questions matching grade from question bank
    const allQuestions = Storage.getQuestions();
    const gradeQuestions = allQuestions.filter(q => q.grade === newExamGrade);
    const chosenQuestions = gradeQuestions.slice(0, 5);

    const isInc = newExamAudience === 'inclusive';

    const newExam: MockExam = {
      id: `exam-${Date.now()}`,
      title: newExamTitle.trim(),
      grade: newExamGrade,
      termType: newExamTerm,
      durationMinutes: newExamDuration,
      year: '2024 - 2025',
      targetAudience: newExamAudience,
      isInclusiveAdapted: isInc,
      timeMultiplier: isInc ? 1.5 : 1,
      accommodations: isInc ? ['Thêm 50% thời gian (1.5x)', 'Cỡ chữ phóng to', 'Xem gợi ý giải bài'] : undefined,
      description: newExamDescription.trim() || (isInc ? 'Đề thi điều chỉnh giảm tải dành cho học sinh hòa nhập theo TT 03/2018/BGDĐT.' : 'Bộ đề thi thử theo chuẩn ma trận kiến thức GDPT.'),
      questions: chosenQuestions.length > 0 ? chosenQuestions : allQuestions.slice(0, 5)
    };

    const updated = [newExam, ...exams];
    setExams(updated);
    Storage.saveMockExams(updated);
    setShowCreateExamModal(false);
    setNewExamTitle('');
    setNewExamDescription('');
    setNewExamAudience('standard');
  };

  const getTermLabel = (term: ExamType) => {
    switch (term) {
      case 'giua_ki_1': return 'Giữa Kì 1';
      case 'cuoi_ki_1': return 'Cuối Kì 1';
      case 'giua_ki_2': return 'Giữa Kì 2';
      case 'cuoi_ki_2': return 'Cuối Kì 2';
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- VIEW 1: EXAM TAKING MODE ---
  if (currentExam && !isExamCompleted) {
    const currentQuestion = currentExam.questions[currentQIndex];
    const totalQ = currentExam.questions.length;
    const answeredCount = currentExam.questions.reduce((acc, q, idx) => {
      if (isEssayQuestion(q)) {
        return acc + (essayAnswers[idx]?.imageDataUrl ? 1 : 0);
      }
      return acc + (studentAnswers[idx] !== undefined ? 1 : 0);
    }, 0);

    const isInclusiveSession = currentExam.isInclusiveAdapted || currentExam.targetAudience === 'inclusive' || activeStudent.isInclusive;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with countdown clock */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                {currentExam.grade} • {getTermLabel(currentExam.termType)}
              </span>
              {isInclusiveSession && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center gap-1">
                  🌱 Chế Độ Hòa Nhập • x1.5 Thời gian
                </span>
              )}
              <span className="text-xs text-slate-400">Thí sinh: <strong className="text-white">{activeStudent.name}</strong></span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">{currentExam.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-black text-lg border ${
              timeLeftSeconds < 300 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' 
                : isInclusiveSession 
                ? 'bg-teal-950/60 border-teal-500/60 text-teal-300' 
                : 'bg-slate-950 border-slate-800 text-amber-400'
            }`}>
              <Clock className="w-5 h-5 text-amber-400" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => {
                if (confirm(`Bạn đã hoàn thành ${answeredCount}/${totalQ} câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay không?`)) {
                  handleSubmitExam();
                }
              }}
              className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-lg shadow-emerald-950/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Nộp Bài Thi
            </button>
          </div>
        </div>

        {/* Accessibility Toolbar for Inclusive Learning */}
        <div className="p-3 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5 text-teal-400" /> Trợ năng hiển thị:
            </span>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setExamFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${examFontSize === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Cỡ chữ chuẩn"
              >
                A Chuẩn
              </button>
              <button
                type="button"
                onClick={() => setExamFontSize('large')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${examFontSize === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Cỡ chữ lớn"
              >
                A+ Lớn
              </button>
              <button
                type="button"
                onClick={() => setExamFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${examFontSize === 'xlarge' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Cỡ chữ rất lớn"
              >
                A++
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(currentQuestion?.hint || isInclusiveSession) && (
              <button
                type="button"
                onClick={() => setShowHintForCurrentQ(!showHintForCurrentQ)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  showHintForCurrentQ 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showHintForCurrentQ ? 'Ẩn Gợi Ý' : '💡 Xem Gợi Ý Câu Này'}
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Strip */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Phiếu trả lời: (Đã hoàn thành {answeredCount}/{totalQ} câu)</span>
            <span className="text-indigo-400 font-semibold">Nhấn vào số câu để chuyển nhanh</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentExam.questions.map((qItem, idx) => {
              const isEssayItem = isEssayQuestion(qItem);
              const isAnswered = isEssayItem
                ? Boolean(essayAnswers[idx]?.imageDataUrl)
                : studentAnswers[idx] !== undefined;
              const isCurrent = currentQIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentQIndex(idx);
                    setShowHintForCurrentQ(false);
                  }}
                  title={isEssayItem ? 'Câu tự luận (upload ảnh)' : 'Câu trắc nghiệm'}
                  className={`w-9 h-9 rounded-xl font-bold font-mono text-xs transition border flex items-center justify-center relative ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400/50 scale-105'
                      : isAnswered
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : isEssayItem
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Body */}
        {currentQuestion && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-indigo-400 font-bold uppercase tracking-wider">
                  Câu {currentQIndex + 1} / {totalQ} • {currentQuestion.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  isEssayQuestion(currentQuestion)
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                }`}>
                  {isEssayQuestion(currentQuestion) ? '✍️ Tự Luận · Upload Ảnh' : '📝 Trắc Nghiệm'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isInclusiveSession && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] border border-teal-500/30">
                    🌱 Dạng Hòa Nhập Giảm Tải
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  Mức độ: {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            {/* Prompt with responsive font size */}
            <h3 className={`font-bold text-white leading-relaxed ${
              examFontSize === 'xlarge' ? 'text-2xl sm:text-3xl' : examFontSize === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}>
              <MathText text={currentQuestion.prompt} />
            </h3>

            {/* Hint Box (if toggled) */}
            {showHintForCurrentQ && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm animate-fade-in space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Lightbulb className="w-4 h-4" /> Gợi ý phương pháp giải:
                </div>
                <p className="leading-relaxed">
                  <MathText text={currentQuestion.hint || 'Đọc kĩ đề bài, chú ý công thức đã học trong bảng kiến thức trọng tâm.'} />
                </p>
              </div>
            )}

            {/* Answer Area: Upload Image for Essay OR 4 Multiple Choice Options */}
            {isEssayQuestion(currentQuestion) ? (
              <div className="pt-2">
                <EssayImageUploadBox
                  value={essayAnswers[currentQIndex]}
                  onChange={(upload) => {
                    setEssayAnswers(prev => {
                      const next = { ...prev };
                      if (upload) next[currentQIndex] = upload;
                      else delete next[currentQIndex];
                      return next;
                    });
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = studentAnswers[currentQIndex] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(optIdx)}
                      className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                        examFontSize === 'xlarge' ? 'text-base sm:text-lg' : examFontSize === 'large' ? 'text-sm sm:text-base' : 'text-sm'
                      } font-semibold ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
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

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                disabled={currentQIndex === 0}
                onClick={() => {
                  setCurrentQIndex(prev => prev - 1);
                  setShowHintForCurrentQ(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-30 transition"
              >
                ← Câu Trước
              </button>

              <div className="flex gap-2">
                {currentQIndex < totalQ - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentQIndex(prev => prev + 1);
                      setShowHintForCurrentQ(false);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Câu Tiếp Theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm('Bạn đã đến câu cuối cùng. Bạn có muốn nộp bài thi để xem điểm số ngay?')) {
                        handleSubmitExam();
                      }
                    }}
                    className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
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

  // --- VIEW 2: EXAM RESULTS & DETAILED REVIEW ---
  if (currentExam && isExamCompleted && examResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Summary Banner */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
            🏆
          </div>

          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {currentExam.grade} • {getTermLabel(currentExam.termType)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Kết Quả Bài Thi Thử</h2>
            <p className="text-xs text-slate-400 mt-1">
              Thí sinh: <strong className="text-white">{activeStudent.name}</strong> • Hoàn thành trong {Math.round(examResult.timeSpentSeconds / 60)} phút
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Điểm Số (Thang 10)</span>
              <p className="text-3xl font-black text-amber-400 mt-1">{examResult.score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Số Câu Đúng</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {examResult.correctCount} / {examResult.totalQuestions}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Tỉ Lệ Đạt</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {Math.round((examResult.correctCount / examResult.totalQuestions) * 100)}%
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Xếp Loại</span>
              <p className="text-lg font-black text-rose-400 mt-2">
                {examResult.score >= 8.5 ? 'Xuất Sắc' : examResult.score >= 7.0 ? 'Khá Giỏi' : examResult.score >= 5.0 ? 'Đạt' : 'Cần Cố Gắng'}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartExam(currentExam)}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Thi Lại Lần Nữa
            </button>
            <button
              onClick={() => setCurrentExam(null)}
              className="py-2.5 px-5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
            >
              Trở Về Danh Sách Đề Thi
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Xem Lại Bài Làm & Lời Giải Chi Tiết Từng Câu
          </h3>

          <div className="space-y-4">
            {currentExam.questions.map((q, qIdx) => {
              const isEssay = isEssayQuestion(q);
              const studentChoice = examResult.answers[qIdx];
              const uploadedEssay = examResult.essayAnswers?.[qIdx];
              const isCorrect = !isEssay && studentChoice === q.correctAnswer;

              return (
                <div 
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isEssay
                      ? 'bg-slate-950/60 border-amber-500/40'
                      : isCorrect
                      ? 'bg-slate-950/60 border-emerald-500/40'
                      : 'bg-slate-950/60 border-rose-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                    <span className="font-bold text-xs flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs ${
                        isEssay
                          ? 'bg-amber-500 text-slate-950'
                          : isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}>
                        {qIdx + 1}
                      </span>
                      <span className="text-white">
                        Câu {qIdx + 1} ({q.difficulty}) {isEssay ? '• Tự luận' : ''}:
                      </span>
                    </span>

                    {isEssay ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        uploadedEssay?.imageDataUrl
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {uploadedEssay?.imageDataUrl ? '📷 Đã nộp ảnh (Chờ GV chấm)' : '✗ Chưa tải ảnh bài làm'}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isCorrect ? '✓ Làm đúng' : '✗ Chưa đúng'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-200 mb-3">
                    <MathText text={q.prompt} />
                  </p>

                  {isEssay ? (
                    <div className="pt-1">
                      <EssayImageUploadBox
                        value={uploadedEssay}
                        onChange={() => {}}
                        disabled
                        compact
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectAns = optIdx === q.correctAnswer;
                        const isChosen = optIdx === studentChoice;

                        let style = "p-2.5 rounded-xl border flex items-center justify-between ";
                        if (isCorrectAns) {
                          style += "bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold";
                        } else if (isChosen && !isCorrectAns) {
                          style += "bg-rose-950/40 border-rose-500 text-rose-200 font-semibold";
                        } else {
                          style += "bg-slate-900 border-slate-800 text-slate-500 opacity-60";
                        }

                        return (
                          <div key={optIdx} className={style}>
                            <span className="flex items-center gap-1.5">
                              <strong className="font-mono">{String.fromCharCode(65 + optIdx)}.</strong>
                              <MathText text={opt} />
                            </span>
                            {isCorrectAns && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            {isChosen && !isCorrectAns && <XCircle className="w-4 h-4 text-rose-400" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-indigo-400">💡 {isEssay ? 'Đáp án mẫu / Hướng dẫn giải: ' : 'Lời giải chi tiết: '}</strong>
                    <MathText text={q.explanation} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Counts for filters (scoped to student's grade when lockedGrade is set)
  const standardCount = scopedExams.filter(e => e.targetAudience === 'standard' || (!e.isInclusiveAdapted && e.targetAudience !== 'inclusive')).length;
  const inclusiveCount = scopedExams.filter(e => e.targetAudience === 'inclusive' || e.isInclusiveAdapted).length;

  // --- VIEW 3: MAIN MOCK EXAM CATALOG ---
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              Luyện Thi Chuẩn Ma Trận GDPT & Hòa Nhập
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <FileCheck2 className="w-7 h-7 text-amber-400" />
            Luyện Đề Thi Thử Giữa Kì & Cuối Kì
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Phân định rõ đề thi cho học sinh đại trà và học sinh hòa nhập (giảm tải, thêm thời gian x1.5, trợ giúp gợi ý giải).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Student Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Thí sinh:</span>
            <strong className="text-xs font-bold text-white">{activeStudent.name}</strong>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold text-[11px] border border-amber-800/60">
              Mã: {activeStudent.studentCode}
            </span>
            {activeStudent.isInclusive && (
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] border border-teal-500/30">
                🌱 Hòa Nhập
              </span>
            )}
            {onRequestChangeStudent && (
              <button
                type="button"
                onClick={onRequestChangeStudent}
                className="ml-2 text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition"
                title="Đổi thí sinh bằng mã cá nhân"
              >
                Đổi mã HS
              </button>
            )}
          </div>

          {/* Weekend Top 5 Honors Announcement Button */}
          <button
            onClick={() => setShowWeekendHonorsModal(true)}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            Top 5 Cuối Tuần
          </button>

          {/* Teacher Create Exam Buttons (hidden when student is locked without teacher unlock capability) */}
          {(isTeacherUnlocked || onRequestTeacherUnlock) && (
            <>
              <button
                onClick={() => {
                  if (!isTeacherUnlocked) {
                    onRequestTeacherUnlock?.();
                    return;
                  }
                  setShowAIExamModal(true);
                  setGeneratedAIExam(null);
                  setAiExamSuccessMsg('');
                }}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 active:scale-95"
                title={isTeacherUnlocked ? "Biên soạn đề thi trắc nghiệm bằng Trợ Lý AI" : "Yêu cầu quyền Giáo viên"}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Soạn Đề Nhanh</span>
                {!isTeacherUnlocked && <Lock className="w-3.5 h-3.5 text-amber-300/80 ml-0.5" />}
              </button>

              {/* Import Exam from PDF / Word */}
              <button
                onClick={() => {
                  if (!isTeacherUnlocked) {
                    onRequestTeacherUnlock?.();
                    return;
                  }
                  setShowImportModal(true);
                }}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
                title={isTeacherUnlocked ? "Tải lên tệp PDF hoặc Word (.docx/.doc) để AI trích xuất đề thi" : "Yêu cầu quyền Giáo viên"}
              >
                <BookOpen className="w-4 h-4 text-emerald-200" />
                <span>Nhập từ PDF / Word</span>
                {!isTeacherUnlocked && <Lock className="w-3.5 h-3.5 text-emerald-200/80 ml-0.5" />}
              </button>

              {isTeacherUnlocked ? (
                <button
                  onClick={() => setShowCreateExamModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Thủ Công
                </button>
              ) : (
                <button
                  onClick={onRequestTeacherUnlock}
                  className="py-2 px-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <span>+ Giáo Viên Tạo Đề</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inclusive Student Welcome & Guidance Banner */}
      {activeStudent.isInclusive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/40 border border-teal-500/40 flex items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl shrink-0">
              🌱
            </div>
            <div>
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                Chế Độ Học Sinh Hòa Nhập Đã Bật: Chào em {activeStudent.name}!
              </h4>
              <p className="text-xs text-teal-200/90 mt-0.5 leading-relaxed">
                Đề thi hòa nhập được tinh gọn theo Thông tư 03/2018/BGDĐT: Tự động cộng thêm 50% thời gian (x1.5), có nút <strong>💡 Gợi ý tư duy</strong> và công cụ phóng to chữ để em làm bài thoải mái, tự tin nhất!
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterAudience('inclusive')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
          >
            Lọc Đề Hòa Nhập
          </button>
        </div>
      )}

      {/* Filter Tabs with Audience Segment */}
      <div className="flex flex-wrap gap-3 items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Audience Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterAudience('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              filterAudience === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Đề ({scopedExams.length})
          </button>
          <button
            onClick={() => setFilterAudience('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              filterAudience === 'standard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎯 Chuẩn GDPT (Đại trà)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">{standardCount}</span>
          </button>
          <button
            onClick={() => setFilterAudience('inclusive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              filterAudience === 'inclusive'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-teal-400 hover:text-teal-300'
            }`}
          >
            <span>🌱 Giáo Dục Hòa Nhập</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50 font-mono">{inclusiveCount}</span>
          </button>
        </div>

        {/* Grade & Term dropdowns */}
        <div className="flex flex-wrap gap-2 items-center">
          {lockedGrade ? (
            <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl px-3 py-2">
              {allClasses.find(c => c.id === activeStudent.classId)?.name || 'Lớp của em'} · {lockedGrade}
            </div>
          ) : (
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Tất Cả Khối</option>
              <option value="Toán 6">Toán 6</option>
              <option value="Toán 7">Toán 7</option>
              <option value="Toán 8">Toán 8</option>
              <option value="Toán 9">Toán 9</option>
            </select>
          )}

          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Tất Cả Kì Thi</option>
            <option value="giua_ki_1">Giữa Kì 1</option>
            <option value="cuoi_ki_1">Cuối Kì 1</option>
            <option value="giua_ki_2">Giữa Kì 2</option>
            <option value="cuoi_ki_2">Cuối Kì 2</option>
          </select>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExams.map(exam => {
          const prevSubmission = submissions.find(
            s => s.examId === exam.id && s.studentId === activeStudent.id
          );
          const isInclusiveExam = exam.isInclusiveAdapted || exam.targetAudience === 'inclusive';
          const multiplier = isInclusiveExam ? (exam.timeMultiplier || 1.5) : 1;
          const actualDuration = Math.round(exam.durationMinutes * multiplier);

          return (
            <div
              key={exam.id}
              className={`p-6 rounded-3xl transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                isInclusiveExam
                  ? 'bg-gradient-to-br from-teal-950/30 via-slate-900 to-slate-900 border border-teal-500/30 hover:border-teal-400/60'
                  : 'bg-slate-900 border border-slate-800 hover:border-indigo-500/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                      {exam.grade}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                      {getTermLabel(exam.termType)}
                    </span>
                    {isInclusiveExam ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center gap-1">
                        🌱 Hòa Nhập
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        🎯 Đại trà
                      </span>
                    )}
                    {exam.questions.some(isEssayQuestion) && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        ✍️ Có tự luận
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">Năm: {exam.year}</span>
                </div>

                <h3 className="text-lg font-black text-white leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{exam.description}</p>

                {/* Accommodations strip for inclusive exams */}
                {isInclusiveExam && (
                  <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 flex flex-wrap items-center gap-2 text-[11px] text-teal-300 font-semibold">
                    <span>Trợ năng:</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-900/50 text-teal-200">⏱️ Thêm 50% thời gian ({actualDuration}p)</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-900/50 text-teal-200">💡 Có gợi ý tư duy</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-900/50 text-teal-200">🔍 Chữ lớn</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Thời gian: <strong className="text-white">{actualDuration} phút</strong> {isInclusiveExam && <span className="text-[10px] text-teal-400">(x1.5)</span>}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-slate-300">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Số lượng: <strong>{exam.questions.length} câu</strong></span>
                  </div>
                </div>

                {prevSubmission && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-300">
                      Điểm thi lần trước: <strong className="font-mono text-sm">{prevSubmission.score}/10</strong> ({prevSubmission.correctCount}/{prevSubmission.totalQuestions} câu)
                    </span>
                    <span className="text-[10px] text-slate-400">{prevSubmission.submittedAt}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 italic">Thang điểm 10 • Có lời giải</span>
                <button
                  onClick={() => handleStartExam(exam)}
                  className={`py-2.5 px-5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
                    isInclusiveExam
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/40'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{prevSubmission ? 'Làm Lại Đề Này' : 'Bắt Đầu Làm Bài'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExams.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-3xl">
          Không tìm thấy đề thi thử nào phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {/* WEEKEND TOP 5 HONORS MODAL */}
      <WeekendHonorsModal
        isOpen={showWeekendHonorsModal}
        onClose={() => setShowWeekendHonorsModal(false)}
        classes={allClasses}
        currentStudentId={activeStudent.id}
        lockedClassId={lockedClassId}
      />

      {/* MODAL CREATE EXAM (TEACHER) */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Tạo Đề Thi Thử Mới
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tiêu Đề Đề Thi:</label>
                <input
                  type="text"
                  required
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="Ví dụ: Đề Thi Thử Cuối Kì 2 - Toán 8 (Chương Trình Hòa Nhập)"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Đối Tượng Học Sinh Áp Dụng:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewExamAudience('standard')}
                    className={`p-2.5 rounded-xl border text-center transition font-bold ${
                      newExamAudience === 'standard'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎯 Chuẩn GDPT (Đại trà)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExamAudience('inclusive')}
                    className={`p-2.5 rounded-xl border text-center transition font-bold ${
                      newExamAudience === 'inclusive'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🌱 Giáo Dục Hòa Nhập (x1.5 thời gian)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExamAudience('all')}
                    className={`p-2.5 rounded-xl border text-center transition font-bold ${
                      newExamAudience === 'all'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👥 Cả Lớp (Chung)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Khối Lớp:</label>
                  <select
                    value={newExamGrade}
                    onChange={(e) => setNewExamGrade(e.target.value as GradeLevel)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Toán 6">Toán 6</option>
                    <option value="Toán 7">Toán 7</option>
                    <option value="Toán 8">Toán 8</option>
                    <option value="Toán 9">Toán 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Kỳ Thi:</label>
                  <select
                    value={newExamTerm}
                    onChange={(e) => setNewExamTerm(e.target.value as ExamType)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="giua_ki_1">Giữa Kì 1</option>
                    <option value="cuoi_ki_1">Cuối Kì 1</option>
                    <option value="giua_ki_2">Giữa Kì 2</option>
                    <option value="cuoi_ki_2">Cuối Kì 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Thời Gian Chuẩn (Phút) {newExamAudience === 'inclusive' && <span className="text-teal-400 font-bold">• Sẽ tự động x1.5 cho học sinh hòa nhập</span>}:
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô Tả & Trợ Năng Kèm Theo:</label>
                <textarea
                  rows={3}
                  value={newExamDescription}
                  onChange={(e) => setNewExamDescription(e.target.value)}
                  placeholder="Ghi chú về nội dung trọng tâm đề thi, gợi ý hỗ trợ..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Tạo Đề Thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI EXAM GENERATOR MODAL (TEACHER ONLY) */}
      {showAIExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl my-6 bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-2xl">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Trợ Lý AI Biên Soạn Đề Thi Nhanh</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      Chỉ Dành Cho Giáo Viên
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tạo toàn bộ đề thi giữa kì / cuối kì có ma trận nhận biết - thông hiểu - vận dụng trong tích tắc bằng AI Gemini.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAIExamModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Generator Form */}
            <form onSubmit={handleGenerateAIExam} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Tên Đề Thi:</label>
                <input
                  type="text"
                  value={aiExamTitle}
                  onChange={(e) => setAiExamTitle(e.target.value)}
                  placeholder="Ví dụ: Đề Ôn Tập Giữa Kì 1 - Toán 8 (Tự Động)"
                  className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Khối Lớp:</label>
                  <select
                    value={aiExamGrade}
                    onChange={(e) => setAiExamGrade(e.target.value as GradeLevel)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Toán 6">Toán 6</option>
                    <option value="Toán 7">Toán 7</option>
                    <option value="Toán 8">Toán 8</option>
                    <option value="Toán 9">Toán 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Kì Thi:</label>
                  <select
                    value={aiExamTerm}
                    onChange={(e) => setAiExamTerm(e.target.value as ExamType)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="giua_ki_1">Giữa Kì 1</option>
                    <option value="cuoi_ki_1">Cuối Kì 1</option>
                    <option value="giua_ki_2">Giữa Kì 2</option>
                    <option value="cuoi_ki_2">Cuối Kì 2</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số Câu Hỏi:</label>
                  <select
                    value={aiExamCount}
                    onChange={(e) => setAiExamCount(parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value={4}>4 câu (Đề ngắn / Hòa nhập)</option>
                    <option value={8}>8 câu (Đề chuẩn)</option>
                    <option value={10}>10 câu (Đề định kỳ)</option>
                    <option value={12}>12 câu (Đề nâng cao)</option>
                  </select>
                </div>
              </div>

              {/* Target Audience selection */}
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Đối Tượng Học Sinh Áp Dụng:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAiExamAudience('standard')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      aiExamAudience === 'standard' 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">🎯 Chuẩn GDPT (Đại trà)</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Ma trận 4 mức độ tiêu chuẩn, thời gian gốc 45 phút</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiExamAudience('inclusive')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      aiExamAudience === 'inclusive' 
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200 font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold text-teal-300">🌱 Giáo Dục Hòa Nhập</span>
                    <span className="text-[11px] text-teal-200/80 block mt-0.5">Tự động x1.5 thời gian (68 phút) & gợi ý tư duy</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Trọng Tâm Kiến Thức / Chương Trình (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={aiExamTopic}
                  onChange={(e) => setAiExamTopic(e.target.value)}
                  placeholder="Ví dụ: Ôn tập chương Đa thức và Tứ giác, Định lý Thalès..."
                  className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAIExamGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
              >
                {isAIExamGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI đang xây dựng đề thi và ma trận chuẩn GDPT...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Biên Soạn Đề Thi Bằng AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Success Notification */}
            {aiExamSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                {aiExamSuccessMsg}
              </div>
            )}

            {/* Preview of Generated Exam */}
            {generatedAIExam && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      {generatedAIExam.title} ({generatedAIExam.questions.length} câu • {generatedAIExam.durationMinutes} phút)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{generatedAIExam.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAIExamToCatalog}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/30 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    Lưu Vào Danh Mục Đề
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {generatedAIExam.questions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <span className="font-bold text-white block">
                        Câu {idx + 1}: <MathText text={q.prompt} />
                      </span>
                      {isEssayQuestion(q) ? (
                        <EssayUploadSlotPreview compact />
                      ) : (
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className={`p-1.5 rounded text-[11px] flex items-center gap-1 ${
                                oIdx === q.correctAnswer
                                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60'
                                  : 'text-slate-400'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + oIdx)}.</span>
                              <MathText text={opt} />
                            </span>
                          ))}
                        </div>
                      )}
                      {q.hint && (
                        <p className="text-[10px] text-teal-300 italic pt-0.5">
                          💡 Gợi ý: <MathText text={q.hint} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekend Top 5 Honors Announcement Modal */}
      <WeekendHonorsModal
        isOpen={showWeekendHonorsModal}
        onClose={() => setShowWeekendHonorsModal(false)}
        classes={allClasses}
        currentStudentId={activeStudent.id}
      />

      {/* Import Exam from PDF / Word Modal */}
      <ImportDocumentModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classes={allClasses}
        defaultTargetType="exam"
        defaultGrade={filterGrade !== 'all' ? (filterGrade as GradeLevel) : 'Toán 8'}
        onSuccessSaveExam={(newExam) => {
          setExams(Storage.getMockExams());
        }}
      />
    </div>
  );
};

