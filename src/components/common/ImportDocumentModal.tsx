import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Heart,
  Trash2,
  Plus,
  Edit3,
  Check,
  Wand2,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ClassGroup,
  ExamType,
  GradeLevel,
  HomeworkAssignment,
  MockExam,
  Question,
  QuestionType,
  TargetAudience,
} from '../../types';
import { Storage } from '../../utils/storage';
import { aiService, fileToBase64, ImportDocumentResult } from '../../utils/aiService';
import { EssayUploadSlotPreview } from './EssayImageUploadBox';
import { isEssayQuestion } from '../../utils/imageUpload';
import { MathText } from './MathText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  defaultTargetType?: 'exam' | 'homework' | 'questions';
  defaultGrade?: GradeLevel;
  onSuccessSaveExam?: (exam: MockExam) => void;
  onSuccessSaveHomework?: (hw: HomeworkAssignment) => void;
  onSuccessSaveQuestions?: (questions: Question[]) => void;
}

const SAMPLE_EXAM_TEXT = `TRƯỜNG THCS NGUYỄN DU
ĐỀ KIỂM TRA GIỮA HỌC KÌ I - MÔN TOÁN 8 (NĂM HỌC 2024 - 2025)
Thời gian làm bài: 45 phút

Câu 1: Khai triển hằng đẳng thức (x + 2)² ta được kết quả là:
A. x² + 4x + 4
B. x² + 2x + 4
C. x² + 4
D. x² + 4x + 2
Đáp án: A
Lời giải: Áp dụng hằng đẳng thức (A + B)² = A² + 2AB + B² với A = x, B = 2 ta có: (x + 2)² = x² + 2·x·2 + 2² = x² + 4x + 4.
Gợi ý: Dùng công thức bình phương của một tổng.

Câu 2: Đa thức 4x² - 9y² được phân tích thành nhân tử là:
A. (2x - 3y)(2x + 3y)
B. (4x - 9y)(4x + 9y)
C. (2x - 3y)²
D. (2x + 3y)²
Đáp án: A
Lời giải: Ta có 4x² - 9y² = (2x)² - (3y)² = (2x - 3y)(2x + 3y).
Gợi ý: Nhận dạng hằng đẳng thức hiệu hai bình phương A² - B² = (A - B)(A + B).

Câu 3: Kết quả của phép chia đơn thức 12x⁴y³ cho 4x²y là:
A. 3x²y²
B. 3x²y
C. 8x²y²
D. 3x⁶y⁴
Đáp án: A
Lời giải: 12x⁴y³ : 4x²y = (12 : 4) · (x⁴ : x²) · (y³ : y) = 3x²y².
Gợi ý: Chia hệ số với hệ số, chia các lũy thừa của từng biến.

Câu 4: Tứ giác ABCD có góc A = 100°, góc B = 80°, góc C = 110°. Số đo góc D là:
A. 70°
B. 80°
C. 60°
D. 90°
Đáp án: A
Lời giải: Tổng các góc trong một tứ giác bằng 360°. Do đó góc D = 360° - (100° + 80° + 110°) = 70°.
Gợi ý: Tổng 4 góc của bất kỳ tứ giác nào luôn bằng 360°.

Câu 5: Hình thang cân là hình thang có:
A. Hai góc kề một đáy bằng nhau
B. Hai cạnh bên bằng nhau
C. Hai đường chéo vuông góc
D. Hai góc đối bằng nhau
Đáp án: A
Lời giải: Theo định nghĩa trong SGK Toán 8, hình thang cân là hình thang có hai góc kề một đáy bằng nhau.
Gợi ý: Nhớ lại định nghĩa chuẩn về hình thang cân.

Câu 6: Cho đa thức P(x) = 2x² - 8x + 8. Hãy phân tích đa thức P(x) thành nhân tử và tính giá trị của P(x) tại x = 12.
Lời giải: P(x) = 2(x² - 4x + 4) = 2(x - 2)². Tại x = 12, ta có P(12) = 2·(12 - 2)² = 2·100 = 200.
Gợi ý: Đặt nhân tử chung 2 ra ngoài trước, sau đó dùng hằng đẳng thức bình phương của một hiệu.`;

const IMPORT_PROMPT_STORAGE_KEY = 'mathmaster_import_custom_prompt_v3';

const DEFAULT_IMPORT_PROMPT = `I. QUY TẮC ĐỌC VÀ TRÍCH XUẤT TOÀN BỘ ĐỀ:
1. Đọc toàn bộ các trang của tài liệu tải lên (văn bản, câu hỏi, công thức toán, hình vẽ/đồ thị trên PDF, bảng số liệu).
2. Trích xuất ĐẦY ĐỦ TẤT CẢ CÁC CÂU HỎI trong đề thi từ Câu 1 đến câu cuối cùng (bao gồm mọi phần như Phần I, Phần II, Phần III, Tự luận...). Tuyệt đối không dừng lại ở câu đầu tiên và không lấy tên tệp làm câu hỏi.
3. Nếu tệp chứa nhiều đề thi khác nhau (ví dụ Đề 1, Đề 2 hoặc nhiều mã đề), CHỈ trích xuất ĐỀ ĐẦU TIÊN, bỏ qua các đề tiếp theo; không trộn câu hỏi hoặc đáp án giữa các đề.
4. Giữ nguyên thứ tự và nguyên văn đề gốc (số liệu, giả thiết, đơn vị đo, các ý nhỏ a, b, c, d...).

II. PHÂN LOẠI KHỚP CẤU TRÚC CODE (CHỈ CÓ 2 LOẠI: "multiple_choice" & "essay"):
1. "multiple_choice": Dành cho câu trắc nghiệm có sẵn 4 phương án A, B, C, D.
   - Đưa nguyên văn đề câu hỏi vào "prompt".
   - Đưa đúng 4 phương án vào mảng "options" (4 chuỗi sạch, bỏ chữ cái đầu "A. ", "B. ", "C. ", "D. ").
   - Đặt "correctAnswer" là số nguyên 0 (A), 1 (B), 2 (C) hoặc 3 (D).
2. "essay": Dành cho câu tự luận, câu trả lời ngắn, hoặc câu Đúng/Sai nhiều ý (a, b, c, d) không có dạng 4 lựa chọn A-B-C-D.
   - Hệ thống tự động thay thế 4 đáp án A-B-C-D bằng vị trí UPLOAD ẢNH BÀI LÀM cho mọi câu "essay".
   - TUYỆT ĐỐI KHÔNG tự chế câu tự luận/trả lời ngắn/đúng-sai thành 4 phương án A-B-C-D giả.
   - Giữ nguyên toàn bộ đề bài (gồm cả các ý a, b, c...) trong "prompt", đặt "options": [] và "correctAnswer": -1.

III. XỬ LÝ HÌNH ẢNH & HÌNH HỌC:
1. Không tự vẽ lại hình hay tự bịa số liệu không có trong tài liệu.
2. Với PDF, đọc trực tiếp hình vẽ/đồ thị/bảng biểu trên trang PDF. Nếu câu hỏi có hình ảnh/công thức dạng ảnh bị mờ hoặc thiếu (ví dụ hình nhúng trong Word không đọc được), vẫn giữ nguyên phần chữ của câu hỏi và ghi rõ cảnh báo (câu số mấy cần bổ sung ảnh) vào mảng "extractionWarnings".

IV. CHUẨN HÓA CÔNG THỨC TOÁN HỌC DẠNG MATHTYPE / KATEX:
1. Website tích hợp sẵn KaTeX để hiển thị công thức toán học chuẩn MathType (phân số xếp tầng, căn thức, lũy thừa, chỉ số, hệ phương trình, góc, vectơ, ký hiệu tập hợp, logic...).
2. Với MỌI công thức và ký hiệu toán học (như phân số, căn, mũ, góc, độ, vectơ, $\\le, \\ge, \\ne, \\in, \\subset, \\cup, \\cap, \\Delta, \\alpha, \\beta, \\pi, \\Rightarrow, \\Leftrightarrow$), hãy viết bằng LaTeX chuẩn và đặt trong cặp dấu \`$ ... $\` (trong dòng) hoặc \`$$ ... $$\` (công thức đứng riêng).
3. Ví dụ chuẩn: \`$\\frac{x+1}{x-2}$\`, \`$\\sqrt{x^2+1}$\`, \`$\\widehat{ABC} = 60^\\circ$\`, \`$\\vec{AB}$\`, \`$\\begin{cases} x+y=3 \\\\ x-y=1 \\end{cases}$\`, \`$x \\in \\mathbb{R}$\`.
4. Nếu tài liệu gốc có công thức dạng MathType/ảnh nhúng mà vẫn đọc được nội dung trên trang PDF, bắt buộc chuyển chuẩn xác sang LaTeX \`$ ... $\`; nếu ảnh mờ không đọc được thì ghi vào "extractionWarnings".
5. TUYỆT ĐỐI giữ đúng ký tự \`\\\\\` khi xuất chuỗi JSON để không làm mất dấu gạch chéo của \`\\frac\`, \`\\sqrt\`, \`\\times\`, \`\\text\`.

V. ĐÁP ÁN, PHÂN LOẠI & LỜI GIẢI:
1. Với "multiple_choice": ưu tiên lấy "correctAnswer" (0..3) từ bảng đáp án/đánh dấu trong tài liệu; nếu đề chưa có đáp án thì tự giải toán để chọn đúng. Nếu thiếu hình/thiếu dữ kiện không giải được, đặt 0 và ghi vào "extractionWarnings".
2. Với "essay": đặt "options": [], "correctAnswer": -1, viết hướng dẫn giải chi tiết từng bước vào "explanation".
3. "difficulty" chỉ chọn 1 trong 4 giá trị: "Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao".
4. "category" chỉ chọn 1 trong 4 giá trị: "Số học & Đại số", "Hình học & Đo lường", "Thống kê & Xác suất", "Tính nhanh & Tư duy logic".
5. Viết "explanation" (lời giải chi tiết) và "hint" (gợi ý tư duy ngắn gọn) — không làm biến đổi đề gốc trong "prompt".`;

export const ImportDocumentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  classes,
  defaultTargetType = 'exam',
  defaultGrade = 'Toán 8',
  onSuccessSaveExam,
  onSuccessSaveHomework,
  onSuccessSaveQuestions,
}) => {
  const availableClasses = classes.length > 0 ? classes : Storage.getClasses();

  const [step, setStep] = useState<'upload' | 'review'>('upload');

  // Configuration
  const [targetType, setTargetType] = useState<'exam' | 'homework' | 'questions'>(defaultTargetType);
  const [grade, setGrade] = useState<GradeLevel>(defaultGrade);
  const [termType, setTermType] = useState<ExamType>('giua_ki_1');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('standard');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [selectedClassId, setSelectedClassId] = useState(availableClasses[0]?.id || 'class-8a3');
  const [dueDate, setDueDate] = useState('2025-05-25 21:00');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(IMPORT_PROMPT_STORAGE_KEY);
      return saved && saved.trim().length > 0 ? saved : DEFAULT_IMPORT_PROMPT;
    } catch {
      return DEFAULT_IMPORT_PROMPT;
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Parsed review data
  const [parsedData, setParsedData] = useState<ImportDocumentResult | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetType(defaultTargetType);
      setGrade(defaultGrade);
      setErrorMessage('');
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, defaultTargetType, defaultGrade]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      const ext = dropped.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        setFile(dropped);
        setErrorMessage('');
      } else {
        setErrorMessage('Vui lòng chọn tệp có định dạng .pdf, .docx, .doc hoặc .txt');
      }
    }
  };

  const loadSampleText = () => {
    setRawText(SAMPLE_EXAM_TEXT);
    setShowPasteArea(true);
    setFile(null);
    setGrade('Toán 8');
    setTermType('giua_ki_1');
    setErrorMessage('');
  };

  const handleCustomPromptChange = (value: string) => {
    setCustomPrompt(value);
    try {
      if (value.trim() === DEFAULT_IMPORT_PROMPT.trim()) {
        localStorage.removeItem(IMPORT_PROMPT_STORAGE_KEY);
      } else {
        localStorage.setItem(IMPORT_PROMPT_STORAGE_KEY, value);
      }
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleResetPrompt = () => {
    setCustomPrompt(DEFAULT_IMPORT_PROMPT);
    try {
      localStorage.removeItem(IMPORT_PROMPT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const isPromptCustomized = customPrompt.trim() !== DEFAULT_IMPORT_PROMPT.trim();

  const handleProcessDocument = async () => {
    if (!file && !rawText.trim()) {
      setErrorMessage('Vui lòng chọn một tệp PDF / Word hoặc dán nội dung văn bản đề thi.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setProcessStatus('Đang đọc tài liệu và trích xuất cấu trúc...');

    try {
      let fileBase64 = '';
      let fileType: 'pdf' | 'docx' | 'doc' | 'txt' = 'txt';
      let fileName = 'tailieu.txt';

      if (file) {
        fileName = file.name;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') fileType = 'pdf';
        else if (ext === 'docx') fileType = 'docx';
        else if (ext === 'doc') fileType = 'doc';
        else fileType = 'txt';

        setProcessStatus(`Đang xử lý tệp ${fileName} (${(file.size / 1024).toFixed(1)} KB)...`);
        fileBase64 = await fileToBase64(file);
      }

      setProcessStatus('Hệ thống đang phân tích câu hỏi, đáp án và lời giải chi tiết...');

      const result = await aiService.importDocument({
        fileBase64,
        fileName,
        fileType,
        rawText: rawText.trim() || undefined,
        targetType,
        grade,
        termType,
        targetAudience,
        durationMinutes,
        classId: selectedClassId,
        title: file ? file.name.replace(/\.[^/.]+$/, '') : undefined,
        customPrompt: customPrompt.trim() || undefined,
      });

      if (!result.questions || result.questions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi nào trong tài liệu. Vui lòng kiểm tra lại định dạng tệp.');
      }

      setParsedData(result);
      setEditableTitle(result.title);
      setEditableDescription(result.description);
      setQuestions(result.questions);
      setStep('review');
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    } catch (err: any) {
      console.error('Lỗi phân tích tài liệu:', err);
      setErrorMessage(
        err.message ||
          'Không thể trích xuất đề thi từ tệp này. Vui lòng thử lại hoặc dán nội dung trực tiếp.'
      );
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const handleQuestionPromptChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], prompt: val };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIdx].options];
    newOptions[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: newOptions };
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIdx: number, correctIdx: number) => {
    const updated = [...questions];
    updated[qIdx] = { ...updated[qIdx], correctAnswer: correctIdx };
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (qIdx: number, nextType: QuestionType) => {
    const updated = [...questions];
    const current = updated[qIdx];
    if (nextType === 'essay') {
      updated[qIdx] = {
        ...current,
        questionType: 'essay',
        options: [],
        correctAnswer: -1,
      };
    } else {
      updated[qIdx] = {
        ...current,
        questionType: 'multiple_choice',
        options:
          Array.isArray(current.options) && current.options.length === 4
            ? current.options
            : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer:
          typeof current.correctAnswer === 'number' && current.correctAnswer >= 0 && current.correctAnswer <= 3
            ? current.correctAnswer
            : 0,
      };
    }
    setQuestions(updated);
  };

  const handleExplanationChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], explanation: val };
    setQuestions(updated);
  };

  const handleHintChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], hint: val };
    setQuestions(updated);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setErrorMessage('Đề thi hoặc bài tập cần có ít nhất 1 câu hỏi.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleAddEmptyQuestion = (qType: QuestionType = 'multiple_choice') => {
    const isInc = targetAudience === 'inclusive';
    const newQ: Question =
      qType === 'essay'
        ? {
            id: `imported-add-${Date.now()}`,
            grade,
            category: 'Số học & Đại số',
            difficulty: isInc ? 'Thông hiểu' : 'Vận dụng',
            questionType: 'essay',
            prompt: 'Nhập nội dung bài tự luận mới tại đây...',
            options: [],
            correctAnswer: -1,
            explanation: 'Hướng dẫn giải chi tiết mẫu từng bước cho câu tự luận.',
            hint: 'Gợi ý hướng tư duy giải bài.',
            timeLimitSeconds: isInc ? 240 : 180,
          }
        : {
            id: `imported-add-${Date.now()}`,
            grade,
            category: 'Số học & Đại số',
            difficulty: isInc ? 'Nhận biết' : 'Thông hiểu',
            questionType: 'multiple_choice',
            prompt: 'Nhập nội dung câu hỏi mới tại đây...',
            options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
            correctAnswer: 0,
            explanation: 'Hướng dẫn giải chi tiết cho câu hỏi.',
            hint: isInc ? 'Gợi ý tư duy từng bước cho học sinh.' : undefined,
            timeLimitSeconds: isInc ? 45 : 30,
          };
    setQuestions([...questions, newQ]);
  };

  const handleSaveFinal = () => {
    if (questions.length === 0) {
      setErrorMessage('Không có câu hỏi nào để lưu.');
      return;
    }

    const isInc = targetAudience === 'inclusive';
    const effectiveDuration = isInc ? Math.round(durationMinutes * 1.5) : durationMinutes;

    if (targetType === 'exam') {
      const finalExam: MockExam = {
        id: `imported-exam-${Date.now()}`,
        title: editableTitle || `Đề Kiểm Tra ${grade}`,
        grade,
        termType,
        targetAudience,
        durationMinutes: effectiveDuration,
        year: '2024 - 2025',
        isInclusiveAdapted: isInc,
        timeMultiplier: isInc ? 1.5 : 1.0,
        description: editableDescription || `Đề thi trích xuất tự động từ tài liệu chuẩn GDPT 2018.`,
        accommodations: isInc
          ? [
              'Tự động cộng thêm 50% thời gian (x1.5)',
              'Có gợi ý tư duy cho mỗi câu hỏi',
              'Câu chữ tinh giản, không gây nhiễu',
            ]
          : undefined,
        questions,
      };

      Storage.addMockExam(finalExam);
      if (onSuccessSaveExam) onSuccessSaveExam(finalExam);
    } else if (targetType === 'homework') {
      const finalHw: HomeworkAssignment = {
        id: `imported-hw-${Date.now()}`,
        title: editableTitle || `Bài Tập Về Nhà - ${grade}`,
        classId: selectedClassId,
        grade,
        description: editableDescription || `Bài tập về nhà trích xuất từ tài liệu PDF/Word.`,
        assignedDate: new Date().toLocaleDateString('vi-VN'),
        dueDate: dueDate || '2025-05-30 21:00',
        targetAudience,
        isInclusiveAdapted: isInc,
        inclusiveNotes: isInc ? 'Hỗ trợ gợi ý tư duy cho từng câu hỏi' : undefined,
        questions,
      };

      Storage.addHomework(finalHw);
      if (onSuccessSaveHomework) onSuccessSaveHomework(finalHw);
    } else {
      const existing = Storage.getQuestions();
      Storage.saveQuestions([...questions, ...existing]);
      if (onSuccessSaveQuestions) onSuccessSaveQuestions(questions);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  const selectClassName =
    'w-full px-3 py-2.5 text-sm font-medium bg-slate-950 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition';

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-doc-modal-title"
    >
      <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header (never shrinks or overlaps body) */}
        <div className="shrink-0 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 px-5 py-4 sm:px-6 text-white flex items-center justify-between border-b border-indigo-500/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="import-doc-modal-title" className="text-base sm:text-lg font-extrabold truncate">
                  Nhập Đề Thi & BTVN từ File PDF / Word
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-400 text-slate-950 inline-flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3" /> Trợ Lý AI
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5 truncate">
                Tự động nhận diện câu hỏi trắc nghiệm, tự luận, đáp án và lời giải từ tài liệu giáo viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
          {step === 'upload' ? (
            <div className="space-y-6">
              {/* Step 1: Target Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  1. Chọn mục tiêu nhập dữ liệu
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetType('exam')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      targetType === 'exam'
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-lg shadow-indigo-950/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">📝</span>
                      {targetType === 'exam' && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-white">Đề Thi Thử (Giữa / Cuối Kì)</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Đầy đủ ma trận, tính điểm 10 và bấm giờ tự động
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('homework')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      targetType === 'homework'
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-lg shadow-indigo-950/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">📚</span>
                      {targetType === 'homework' && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-white">Bài Tập Về Nhà (BTVN)</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Phân công theo lớp, theo dõi tiến độ nộp bài của học sinh
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('questions')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      targetType === 'questions'
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-lg shadow-indigo-950/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🗂️</span>
                      {targetType === 'questions' && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-white">Ngân Hàng Câu Hỏi</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Lưu vào kho chung để tái sử dụng cho trò chơi & ôn tập
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Target Parameters */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Cấu hình đối tượng & thông số môn học
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Khối Lớp
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as GradeLevel)}
                      className={selectClassName}
                    >
                      <option value="Toán 6">Toán 6 (GDPT 2018)</option>
                      <option value="Toán 7">Toán 7 (GDPT 2018)</option>
                      <option value="Toán 8">Toán 8 (GDPT 2018)</option>
                      <option value="Toán 9">Toán 9 (GDPT 2018)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Đối Tượng Học Sinh
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                      className={`w-full px-3 py-2.5 text-sm font-medium border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                        targetAudience === 'inclusive'
                          ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                          : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      <option value="standard">👥 Học sinh đại trà (Chuẩn GDPT)</option>
                      <option value="inclusive">🌟 Học sinh hòa nhập / Khuyết tật</option>
                      <option value="all">🌐 Áp dụng chung toàn bộ</option>
                    </select>
                  </div>

                  {targetType === 'exam' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Kì Thi
                        </label>
                        <select
                          value={termType}
                          onChange={(e) => setTermType(e.target.value as ExamType)}
                          className={selectClassName}
                        >
                          <option value="giua_ki_1">Giữa Học Kì 1</option>
                          <option value="cuoi_ki_1">Cuối Học Kì 1</option>
                          <option value="giua_ki_2">Giữa Học Kì 2</option>
                          <option value="cuoi_ki_2">Cuối Học Kì 2</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Thời gian làm bài ({targetAudience === 'inclusive' ? 'Đã nhân 1.5x' : 'chuẩn'})
                        </label>
                        <select
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className={selectClassName}
                        >
                          <option value={15}>15 phút</option>
                          <option value={45}>45 phút (1 tiết)</option>
                          <option value={60}>60 phút</option>
                          <option value={90}>90 phút (2 tiết)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {targetType === 'homework' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Lớp Giao Bài
                        </label>
                        <select
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className={selectClassName}
                        >
                          {availableClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.grade})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Hạn Nộp Bài
                        </label>
                        <input
                          type="text"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          placeholder="2025-05-30 21:00"
                          className={selectClassName}
                        />
                      </div>
                    </>
                  )}
                </div>

                {targetAudience === 'inclusive' && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                    <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <strong>Chế độ giáo dục hòa nhập:</strong> Hệ thống sẽ tự động bổ sung gợi ý tư duy từng bước cho mỗi câu hỏi, kiểm tra tính dễ hiểu của thuật ngữ và tự động kéo dài 50% thời gian ({Math.round(durationMinutes * 1.5)} phút).
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: File Upload Zone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  3. Chọn tệp PDF hoặc Word từ máy tính của bạn
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragOver
                      ? 'border-indigo-400 bg-indigo-950/50 scale-[1.01]'
                      : file
                      ? 'border-emerald-500/60 bg-emerald-950/25'
                      : 'border-slate-700 hover:border-indigo-500/70 bg-slate-950/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white">{file.name}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Dung lượng: {(file.size / 1024).toFixed(1)} KB • Định dạng:{' '}
                        {file.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-lg transition-colors"
                        >
                          Chọn tệp khác
                        </button>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg transition-colors"
                        >
                          Gỡ tệp
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white">
                        Kéo thả tệp vào đây hoặc{' '}
                        <span className="text-indigo-400 underline underline-offset-2">
                          bấm để tải lên
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-md">
                        Hỗ trợ định dạng tài liệu:{' '}
                        <span className="font-semibold text-rose-300">.PDF</span>,{' '}
                        <span className="font-semibold text-sky-300">.DOCX (Word)</span>,{' '}
                        <span className="font-semibold text-sky-400">.DOC</span> hoặc văn bản{' '}
                        <span className="font-semibold text-slate-200">.TXT</span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span className="px-2.5 py-1 text-[11px] font-semibold bg-rose-950/60 text-rose-300 rounded-lg border border-rose-500/30">
                          📄 PDF Đề Thi
                        </span>
                        <span className="px-2.5 py-1 text-[11px] font-semibold bg-sky-950/60 text-sky-300 rounded-lg border border-sky-500/30">
                          📘 Word .DOCX
                        </span>
                        <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 rounded-lg border border-emerald-500/30">
                          ✨ Nhận diện công thức Toán
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Paste Toggle & Sample Button */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasteArea(!showPasteArea)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {showPasteArea
                      ? 'Ẩn ô dán văn bản'
                      : 'Hoặc dán trực tiếp nội dung đề thi từ clipboard'}
                  </button>

                  <button
                    type="button"
                    onClick={loadSampleText}
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Tải đề mẫu thử nghiệm (Toán 8)
                  </button>
                </div>

                {showPasteArea && (
                  <div className="mt-3">
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={6}
                      placeholder="Dán nội dung đề thi vào đây (Ví dụ: Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A ...)"
                      className="w-full p-3.5 text-xs font-mono bg-slate-950 text-slate-100 border border-slate-700 rounded-xl placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Step 4: Collapsible Prompt Customization Panel */}
              <div className="bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPromptEditor((prev) => !prev)}
                  className="w-full px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
                      4. Tùy chỉnh Prompt phân tích đề (Giáo viên)
                    </span>
                    {isPromptCustomized && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        Đã tùy chỉnh
                      </span>
                    )}
                  </div>
                  {showPromptEditor ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {showPromptEditor && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-800/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chỉnh sửa trực tiếp quy tắc trích xuất toàn bộ đề, phân loại Trắc nghiệm / Tự luận (Upload ảnh), hoặc yêu cầu sư phạm. Định dạng JSON đầu ra được ràng buộc tự động để khớp hệ thống.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetPrompt}
                        disabled={!isPromptCustomized}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Khôi phục mặc định
                      </button>
                    </div>

                    <textarea
                      value={customPrompt}
                      onChange={(e) => handleCustomPromptChange(e.target.value)}
                      rows={8}
                      placeholder="Nhập yêu cầu trích xuất và phân tích đề thi..."
                      className="w-full p-3.5 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-700 rounded-xl placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Processing Spinner */}
              {isProcessing && (
                <div className="p-4 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white">
                      AI Đang Phân Tích & Chuẩn Hóa Đề Thi...
                    </div>
                    <div className="text-xs text-indigo-200">{processStatus}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: REVIEW & EDIT QUESTIONS */
            <div className="space-y-5">
              {/* Summary Bar */}
              <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-indigo-600/40 border border-indigo-500/40 px-2.5 py-0.5 rounded-md">
                      {targetType === 'exam'
                        ? 'Đề Thi Thử'
                        : targetType === 'homework'
                        ? 'Bài Tập Về Nhà'
                        : 'Ngân Hàng Câu Hỏi'}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Khối: <strong className="text-white">{grade}</strong>
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Số lượng:{' '}
                      <strong className="text-white">{questions.length} câu hỏi</strong>{' '}
                      <span className="text-slate-400">
                        ({questions.filter(q => !isEssayQuestion(q)).length} trắc nghiệm •{' '}
                        {questions.filter(q => isEssayQuestion(q)).length} tự luận)
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 mt-1.5">
                    Nguồn phân tích:{' '}
                    <strong className="text-white">
                      {parsedData?.source === 'gemini-ai'
                        ? 'Trợ lý AI Phân Tích Tài Liệu'
                        : 'Trình trích xuất tài liệu THCS'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddEmptyQuestion('multiple_choice')}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-200 bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Trắc nghiệm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddEmptyQuestion('essay')}
                    className="px-3 py-1.5 text-xs font-bold text-amber-200 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Tự luận
                  </button>
                </div>
              </div>

              {/* Title & Description Edit */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tiêu Đề{' '}
                    {targetType === 'exam'
                      ? 'Đề Thi'
                      : targetType === 'homework'
                      ? 'Bài Tập Về Nhà'
                      : 'Bộ Đề'}
                  </label>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold text-white bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mô Tả & Hướng Dẫn Học Sinh
                  </label>
                  <input
                    type="text"
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {parsedData?.extractionWarnings && parsedData.extractionWarnings.length > 0 && (
                <div className="p-3.5 bg-amber-950/50 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Lưu ý kiểm tra thủ công từ AI ({parsedData.extractionWarnings.length}):
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-amber-100/90">
                    {parsedData.extractionWarnings.map((warning, wIdx) => (
                      <li key={wIdx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Question List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Danh sách {questions.length} câu hỏi đã trích xuất (Có thể chuyển đổi Trắc nghiệm / Tự luận):
                </h4>

                {questions.map((q, qIdx) => {
                  const isEssay = isEssayQuestion(q);
                  return (
                  <div
                    key={q.id || qIdx}
                    className={`p-4 bg-slate-950/70 rounded-2xl border transition-all space-y-3 ${
                      isEssay
                        ? 'border-amber-500/35 hover:border-amber-500/60'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                          isEssay ? 'bg-amber-600' : 'bg-indigo-600'
                        }`}>
                          {qIdx + 1}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                          {q.difficulty}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                          {q.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Switcher: Trắc nghiệm vs Tự luận */}
                        <div className="inline-flex rounded-xl bg-slate-900 p-0.5 border border-slate-700 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeChange(qIdx, 'multiple_choice')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition ${
                              !isEssay
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Trắc nghiệm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeChange(qIdx, 'essay')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition ${
                              isEssay
                                ? 'bg-amber-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            ✍️ Tự luận (Upload ảnh)
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-950/40 transition-colors"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Prompt input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Nội dung câu hỏi:
                      </label>
                      <textarea
                        value={q.prompt}
                        onChange={(e) => handleQuestionPromptChange(qIdx, e.target.value)}
                        rows={isEssay ? 3 : 2}
                        className="w-full p-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      {q.prompt && (
                        <div className="mt-1.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                          <span className="text-[10px] font-bold text-indigo-300 mr-2">Hiển thị công thức:</span>
                          <MathText text={q.prompt} />
                        </div>
                      )}
                    </div>

                    {/* Answer Area: Upload Image Slot for Essay OR 4 Options for Multiple Choice */}
                    {isEssay ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-300 mb-1.5">
                          Cách thức trả lời (Đã thay 4 đáp án A-B-C-D bằng vị trí upload ảnh):
                        </label>
                        <EssayUploadSlotPreview compact />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          4 Phương án lựa chọn (Nhấp để đánh dấu đáp án đúng):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === optIdx;
                            const letter = String.fromCharCode(65 + optIdx);
                            return (
                              <div
                                key={optIdx}
                                onClick={() => handleCorrectAnswerChange(qIdx, optIdx)}
                                className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-100 font-semibold'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                      isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    {letter}
                                  </div>
                                  <input
                                    type="text"
                                    value={opt}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                    className="flex-1 text-xs text-white bg-transparent outline-none"
                                  />
                                  {isCorrect && (
                                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                                      ĐÚNG
                                    </span>
                                  )}
                                </div>
                                {/[\\$\/^_{}]/.test(opt) && (
                                  <div className="pl-8 text-xs text-slate-200">
                                    <MathText text={opt} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Explanation & Hint */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Lời giải chi tiết:
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Gợi ý tư duy (hòa nhập):
                        </label>
                        <input
                          type="text"
                          value={q.hint || ''}
                          placeholder="Gợi ý từng bước cho học sinh..."
                          onChange={(e) => handleHintChange(qIdx, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer (always visible at bottom of modal) */}
        <div className="shrink-0 bg-slate-950/90 border-t border-slate-800 px-5 py-3.5 sm:px-6 flex items-center justify-between gap-3">
          {step === 'upload' ? (
            <>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Hỗ trợ tệp PDF, Word (.docx/.doc) và văn bản thuần (.txt)
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleProcessDocument}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang Trích Xuất...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Tiếp Tục & Trích Xuất Bằng AI
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                ← Tải tệp khác
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveFinal}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Lưu & Phát Hành{' '}
                  {targetType === 'exam' ? 'Đề Thi' : targetType === 'homework' ? 'BTVN' : 'Câu Hỏi'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
