import React, { useState } from 'react';
import { 
  BookOpen, Plus, Search, Trash2, Edit3, 
  CheckCircle2, Filter, Sparkles, HelpCircle, Save, X, 
  Bot, Loader2, Wand2, Lock, ShieldCheck, Check 
} from 'lucide-react';
import { DifficultyLevel, GradeLevel, MathCategory, Question, QuestionType } from '../../types';
import { Storage } from '../../utils/storage';
import { aiService } from '../../utils/aiService';
import { ImportDocumentModal } from '../common/ImportDocumentModal';
import { MathText } from '../common/MathText';
import { EssayUploadSlotPreview } from '../common/EssayImageUploadBox';
import { isEssayQuestion } from '../../utils/imageUpload';

interface Props {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  isTeacherUnlocked?: boolean;
  onRequestTeacherUnlock?: () => void;
}

export const QuestionBankEditor: React.FC<Props> = ({ 
  questions, 
  onUpdateQuestions,
  isTeacherUnlocked = false,
  onRequestTeacherUnlock
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // AI Question Generator state (Teacher only)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiGrade, setAiGrade] = useState<GradeLevel>('Toán 8');
  const [aiCategory, setAiCategory] = useState<MathCategory>('Số học & Đại số');
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('Thông hiểu');
  const [aiIsInclusive, setAiIsInclusive] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(3);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<Question[]>([]);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Form states
  const [formGrade, setFormGrade] = useState<GradeLevel>('Toán 8');
  const [formCategory, setFormCategory] = useState<MathCategory>('Số học & Đại số');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('Thông hiểu');
  const [formQuestionType, setFormQuestionType] = useState<QuestionType>('multiple_choice');
  const [formPrompt, setFormPrompt] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formHint, setFormHint] = useState('');
  const [formTimeLimit, setFormTimeLimit] = useState(25);

  const filteredQuestions = questions.filter(q => {
    const matchGrade = selectedGrade === 'all' || q.grade === selectedGrade;
    const matchCat = selectedCategory === 'all' || q.category === selectedCategory;
    const qType = isEssayQuestion(q) ? 'essay' : 'multiple_choice';
    const matchType = selectedType === 'all' || qType === selectedType;
    const matchSearch = q.prompt.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        q.explanation.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchGrade && matchCat && matchType && matchSearch;
  });

  const openCreateModal = () => {
    setEditingQuestionId(null);
    setFormGrade('Toán 8');
    setFormCategory('Số học & Đại số');
    setFormDifficulty('Thông hiểu');
    setFormQuestionType('multiple_choice');
    setFormPrompt('');
    setFormOptions(['', '', '', '']);
    setFormCorrectAnswer(0);
    setFormExplanation('');
    setFormHint('');
    setFormTimeLimit(25);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    const isEssay = isEssayQuestion(q);
    setEditingQuestionId(q.id);
    setFormGrade(q.grade);
    setFormCategory(q.category);
    setFormDifficulty(q.difficulty);
    setFormQuestionType(isEssay ? 'essay' : 'multiple_choice');
    setFormPrompt(q.prompt);
    setFormOptions(isEssay ? ['', '', '', ''] : [...q.options]);
    setFormCorrectAnswer(isEssay ? 0 : q.correctAnswer);
    setFormExplanation(q.explanation);
    setFormHint(q.hint || '');
    setFormTimeLimit(q.timeLimitSeconds || (isEssay ? 180 : 25));
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const isEssay = formQuestionType === 'essay';
    if (!formPrompt.trim() || (!isEssay && formOptions.some(opt => !opt.trim()))) {
      alert(isEssay ? 'Vui lòng nhập đầy đủ đề bài tự luận!' : 'Vui lòng nhập đầy đủ nội dung câu hỏi và 4 đáp án!');
      return;
    }

    if (editingQuestionId) {
      // Update
      const updated = questions.map(q => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            grade: formGrade,
            category: formCategory,
            difficulty: formDifficulty,
            questionType: formQuestionType,
            prompt: formPrompt.trim(),
            options: isEssay ? [] : formOptions.map(o => o.trim()),
            correctAnswer: isEssay ? -1 : formCorrectAnswer,
            explanation: formExplanation.trim() || 'Theo định lý và công thức chuẩn SGK.',
            hint: formHint.trim(),
            timeLimitSeconds: isEssay ? Math.max(formTimeLimit, 120) : formTimeLimit
          };
        }
        return q;
      });
      onUpdateQuestions(updated);
      Storage.saveQuestions(updated);
    } else {
      // Create new
      const newQ: Question = {
        id: `q-custom-${Date.now()}`,
        grade: formGrade,
        category: formCategory,
        difficulty: formDifficulty,
        questionType: formQuestionType,
        prompt: formPrompt.trim(),
        options: isEssay ? [] : formOptions.map(o => o.trim()),
        correctAnswer: isEssay ? -1 : formCorrectAnswer,
        explanation: formExplanation.trim() || 'Theo định lý và công thức chuẩn SGK.',
        hint: formHint.trim(),
        timeLimitSeconds: isEssay ? Math.max(formTimeLimit, 120) : formTimeLimit
      };
      const updated = [newQ, ...questions];
      onUpdateQuestions(updated);
      Storage.saveQuestions(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề?')) {
      const updated = questions.filter(q => q.id !== id);
      onUpdateQuestions(updated);
      Storage.saveQuestions(updated);
    }
  };

  const handleOpenAIModal = () => {
    if (!isTeacherUnlocked) {
      onRequestTeacherUnlock?.();
      return;
    }
    setAiGeneratedQuestions([]);
    setAiSuccessMessage('');
    setIsAIModalOpen(true);
  };

  const handleGenerateQuestionsWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAIGenerating(true);
    setAiSuccessMessage('');
    try {
      const generated = await aiService.generateQuestions({
        grade: aiGrade,
        category: aiCategory,
        difficulty: aiDifficulty,
        topic: aiTopic.trim() || undefined,
        count: aiCount,
        isInclusive: aiIsInclusive
      });
      setAiGeneratedQuestions(generated);
    } catch (err) {
      console.error('AI question generation error:', err);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleAddAllAIToBank = () => {
    if (aiGeneratedQuestions.length === 0) return;
    const updated = [...aiGeneratedQuestions, ...questions];
    onUpdateQuestions(updated);
    Storage.saveQuestions(updated);
    setAiSuccessMessage(`✓ Đã thêm thành công ${aiGeneratedQuestions.length} câu hỏi AI vào Ngân hàng!`);
    setTimeout(() => {
      setIsAIModalOpen(false);
      setAiGeneratedQuestions([]);
      setAiSuccessMessage('');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Ngân Hàng Đề Thi & Tùy Chỉnh Câu Hỏi Toán THCS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tổng cộng: <strong className="text-white font-mono">{questions.length}</strong> câu hỏi chuẩn chương trình GDPT (Lớp 6, 7, 8, 9).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAIModal}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-950/40 active:scale-95"
            title={isTeacherUnlocked ? "Biên soạn câu hỏi tự động bằng Trợ Lý AI" : "Yêu cầu quyền Giáo viên"}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Soạn Câu Hỏi Tự Động</span>
            {!isTeacherUnlocked && <Lock className="w-3.5 h-3.5 text-amber-300/80 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              if (!isTeacherUnlocked) {
                onRequestTeacherUnlock?.();
                return;
              }
              setShowImportModal(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95"
            title={isTeacherUnlocked ? "Tải lên tệp PDF hoặc Word (.docx/.doc) để trích xuất câu hỏi" : "Yêu cầu quyền Giáo viên"}
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>Nhập từ PDF / Word</span>
            {!isTeacherUnlocked && <Lock className="w-3.5 h-3.5 text-emerald-200/80 ml-0.5" />}
          </button>

          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Thêm Thủ Công
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Tất Cả Khối Lớp</option>
            <option value="Toán 6">Toán 6</option>
            <option value="Toán 7">Toán 7</option>
            <option value="Toán 8">Toán 8</option>
            <option value="Toán 9">Toán 9</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Tất Cả Chủ Đề</option>
            <option value="Số học & Đại số">Số học & Đại số</option>
            <option value="Hình học & Đo lường">Hình học & Đo lường</option>
            <option value="Thống kê & Xác suất">Thống kê & Xác suất</option>
            <option value="Tính nhanh & Tư duy logic">Tính nhanh & Tư duy logic</option>
          </select>

          {/* Question Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Tất Cả Dạng Câu</option>
            <option value="multiple_choice">Trắc Nghiệm (4 đáp án)</option>
            <option value="essay">✍️ Tự Luận (Upload ảnh)</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isEssay = isEssayQuestion(q);
          return (
          <div
            key={q.id}
            className={`p-5 rounded-2xl bg-slate-900 border transition space-y-3 ${
              isEssay ? 'border-amber-500/35 hover:border-amber-500/60' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                  isEssay ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                  {q.grade}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isEssay
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                }`}>
                  {isEssay ? '✍️ Tự luận (Upload ảnh)' : '📝 Trắc nghiệm'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                  {q.category}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold italic">
                  Độ khó: {q.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(q)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Chỉnh sửa câu hỏi"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
                  title="Xóa câu hỏi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              <MathText text={q.prompt} />
            </p>

            {/* Answer Area: Upload Image Slot for Essay OR 4 Options Grid */}
            {isEssay ? (
              <div className="pt-1">
                <EssayUploadSlotPreview compact />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctAnswer;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <strong className="font-mono text-slate-300">{String.fromCharCode(65 + optIdx)}.</strong>
                        <MathText text={opt} />
                      </span>
                      {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Explanation & Hint */}
            <div className="pt-2 text-xs text-slate-400 space-y-1 border-t border-slate-800/80">
              <p><strong className="text-indigo-400">{isEssay ? 'Đáp án / Lời giải mẫu:' : 'Giải thích:'}</strong> <MathText text={q.explanation} /></p>
              {q.hint && <p><strong className="text-amber-400">Gợi ý học sinh:</strong> <MathText text={q.hint} /></p>}
            </div>
          </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT QUESTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                {editingQuestionId ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Toán Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Khối Lớp:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as GradeLevel)}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Toán 6">Toán 6</option>
                    <option value="Toán 7">Toán 7</option>
                    <option value="Toán 8">Toán 8</option>
                    <option value="Toán 9">Toán 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Chủ Đề:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MathCategory)}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Số học & Đại số">Số học & Đại số</option>
                    <option value="Hình học & Đo lường">Hình học & Đo lường</option>
                    <option value="Thống kê & Xác suất">Thống kê & Xác suất</option>
                    <option value="Tính nhanh & Tư duy logic">Tính nhanh & Tư duy logic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Độ Khó:</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Dạng Câu Hỏi:</label>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormQuestionType('multiple_choice')}
                    className={`p-3 rounded-xl border text-left transition ${
                      formQuestionType === 'multiple_choice'
                        ? 'bg-indigo-600/25 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">📝 Trắc Nghiệm (4 đáp án)</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Chọn 1 đáp án đúng A, B, C, D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormQuestionType('essay')}
                    className={`p-3 rounded-xl border text-left transition ${
                      formQuestionType === 'essay'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">✍️ Tự Luận (Upload ảnh)</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Học sinh chụp ảnh bài làm tải lên</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Đề Bài (Nội dung câu hỏi):</label>
                <textarea
                  rows={3}
                  required
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder={
                    formQuestionType === 'essay'
                      ? 'Ví dụ: Giải phương trình (2x - 3)/4 - (x + 1)/3 = 1/2 và trình bày chi tiết từng bước...'
                      : 'Ví dụ: Tính diện tích hình thoi có độ dài hai đường chéo là 8cm và 10cm...'
                  }
                  className="w-full p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Answer Area: Upload Image Slot OR 4 Options */}
              {formQuestionType === 'essay' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-amber-300 font-semibold block">
                    Vị Trí Trả Lời Của Học Sinh:
                  </label>
                  <EssayUploadSlotPreview />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    4 Phương Án Trả Lời (Chọn dấu tròn để đặt làm đáp án đúng):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {formOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <input
                          type="radio"
                          name="correctAnswerOption"
                          checked={formCorrectAnswer === idx}
                          onChange={() => setFormCorrectAnswer(idx)}
                          className="accent-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formOptions];
                            newOpts[idx] = e.target.value;
                            setFormOptions(newOpts);
                          }}
                          placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                          className="w-full bg-transparent text-xs text-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Lời Giải Chi Tiết Của Giáo Viên:</label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Giải thích từng bước để học sinh xem lại sau khi trả lời..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Gợi Ý Làm Bài (Dùng cho quyền trợ giúp):</label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="Ví dụ: Áp dụng công thức S = (1/2) * d1 * d2..."
                  className="w-full py-2 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Save className="w-4 h-4" />
                  Lưu Câu Hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI QUESTION GENERATION MODAL (TEACHER ONLY) */}
      {isAIModalOpen && (
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
                    <h3 className="text-lg font-black text-white">Trợ Lý AI Soạn Câu Hỏi Tự Động</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      Chỉ Dành Cho Giáo Viên
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tự động tạo câu hỏi trắc nghiệm Toán THCS chuẩn GDPT 2018 bằng mô hình AI Gemini.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAIModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Generator Form */}
            <form onSubmit={handleGenerateQuestionsWithAI} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Khối Lớp:</label>
                  <select
                    value={aiGrade}
                    onChange={(e) => setAiGrade(e.target.value as GradeLevel)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Toán 6">Toán 6</option>
                    <option value="Toán 7">Toán 7</option>
                    <option value="Toán 8">Toán 8</option>
                    <option value="Toán 9">Toán 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phân Môn:</label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value as MathCategory)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Số học & Đại số">Số học & Đại số</option>
                    <option value="Hình học & Đo lường">Hình học & Đo lường</option>
                    <option value="Thống kê & Xác suất">Thống kê & Xác suất</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Mức Độ Nhận Thức:</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Nhận biết">Nhận biết (Cơ bản)</option>
                    <option value="Thông hiểu">Thông hiểu (Tiêu chuẩn)</option>
                    <option value="Vận dụng">Vận dụng (Nâng cao)</option>
                    <option value="Vận dụng cao">Vận dụng cao (Học sinh giỏi)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số Lượng Câu Hỏi Cần Tạo:</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value={1}>1 câu</option>
                    <option value={3}>3 câu</option>
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu</option>
                  </select>
                </div>
              </div>

              {/* Target Audience selection */}
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Đối Tượng Học Sinh Áp Dụng:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAiIsInclusive(false)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      !aiIsInclusive 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">🎯 Chuẩn GDPT (Đại trà)</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Đầy đủ các mức độ theo khung chuẩn Bộ GD&ĐT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiIsInclusive(true)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      aiIsInclusive 
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200 font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold text-teal-300">🌱 Giáo Dục Hòa Nhập</span>
                    <span className="text-[11px] text-teal-200/80 block mt-0.5">Tự động sinh kèm gợi ý tư duy từng bước cho bé</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Chủ Đề Cụ Thể Hoặc Yêu Cầu Riêng (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Phép cộng trừ số nguyên, Định lý Thalès, Hình hộp chữ nhật..."
                  className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAIGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
              >
                {isAIGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI đang biên soạn câu hỏi chuẩn GDPT...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Bắt Đầu Tạo {aiCount} Câu Hỏi Bằng AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Success message */}
            {aiSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                {aiSuccessMessage}
              </div>
            )}

            {/* Generated Questions Preview */}
            {aiGeneratedQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Đã tạo thành công {aiGeneratedQuestions.length} câu hỏi AI:
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddAllAIToBank}
                    className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-1 shadow-md shadow-emerald-950/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Thêm Tất Cả Vào Ngân Hàng
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {aiGeneratedQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white">Câu {idx + 1}: <MathText text={q.prompt} /></span>
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] shrink-0 font-mono">
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 ${
                              optIdx === q.correctAnswer
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-mono">{String.fromCharCode(65 + optIdx)}.</span>
                            <MathText text={opt} />
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400 italic pt-0.5">
                        <strong className="text-indigo-400 not-italic">Giải thích:</strong> <MathText text={q.explanation} />
                      </p>
                      {q.hint && (
                        <p className="text-[11px] text-teal-300 italic">
                          <strong className="text-teal-400 not-italic">💡 Gợi ý:</strong> <MathText text={q.hint} />
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

      {/* Import Document Modal */}
      <ImportDocumentModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classes={[]}
        defaultTargetType="questions"
        defaultGrade={selectedGrade !== 'all' ? (selectedGrade as GradeLevel) : 'Toán 8'}
        onSuccessSaveQuestions={(newQs) => {
          onUpdateQuestions(Storage.getQuestions());
        }}
      />
    </div>
  );
};
