import { DifficultyLevel, GradeLevel, MathCategory, MockExam, Question, TargetAudience, ExamType } from '../types';

export interface GenerateQuestionsParams {
  grade: GradeLevel;
  category: MathCategory;
  difficulty: DifficultyLevel;
  topic?: string;
  count: number;
  isInclusive?: boolean;
}

export interface GenerateExamParams {
  title: string;
  grade: GradeLevel;
  termType: ExamType;
  targetAudience: TargetAudience;
  durationMinutes: number;
  topic?: string;
  count: number;
}

// Fallback generator for 100% offline environments or when Gemini API is unreachable
function generateFallbackQuestions(params: GenerateQuestionsParams): Question[] {
  const { grade, category, difficulty, topic, count, isInclusive } = params;
  const questions: Question[] = [];

  const templatesByGrade: Record<GradeLevel, Array<{ prompt: string; options: string[]; correct: number; explanation: string; hint: string }>> = {
    'Toán 6': [
      {
        prompt: `Tính giá trị của biểu thức: A = (-15) + 28 - (-7)`,
        options: ['20', '16', '36', '-14'],
        correct: 0,
        explanation: 'Ta có: A = (-15) + 28 + 7 = 13 + 7 = 20.',
        hint: 'Quy tắc dấu ngoặc: trừ của số âm trở thành cộng số dương: -(-7) = +7.'
      },
      {
        prompt: `Tìm x biết: 3x - 12 = 18`,
        options: ['x = 10', 'x = 6', 'x = 8', 'x = 2'],
        correct: 0,
        explanation: 'Ta có: 3x = 18 + 12 => 3x = 30 => x = 10.',
        hint: 'Chuyển -12 sang vế phải đổi dấu thành +12, sau đó chia cả hai vế cho 3.'
      },
      {
        prompt: `Trong các số sau, số nào chia hết cho cả 2, 3 và 5?`,
        options: ['120', '125', '144', '152'],
        correct: 0,
        explanation: 'Số chia hết cho 2 và 5 có tận cùng là 0. Số 120 có 1 + 2 + 0 = 3 chia hết cho 3 nên 120 chia hết cho cả 2, 3 và 5.',
        hint: 'Số tận cùng bằng 0 chia hết cho 2 và 5; tổng các chữ số chia hết cho 3 thì chia hết cho 3.'
      },
      {
        prompt: `Hình vuông có chu vi bằng 36 cm. Diện tích của hình vuông đó là:`,
        options: ['81 cm²', '64 cm²', '36 cm²', '144 cm²'],
        correct: 0,
        explanation: 'Cạnh hình vuông là: 36 : 4 = 9 cm. Diện tích là: 9 x 9 = 81 cm².',
        hint: 'Chu vi hình vuông = cạnh x 4. Diện tích = cạnh x cạnh.'
      }
    ],
    'Toán 7': [
      {
        prompt: `Cho tam giác ABC có góc A = 70°, góc B = 50°. Số đo của góc C là:`,
        options: ['60°', '50°', '70°', '80°'],
        correct: 0,
        explanation: 'Tổng ba góc trong một tam giác bằng 180°. Góc C = 180° - (70° + 50°) = 60°.',
        hint: 'Áp dụng định lý tổng ba góc trong một tam giác bằng 180°.'
      },
      {
        prompt: `Kết quả của phép tính (-2/3)² là:`,
        options: ['4/9', '-4/9', '4/6', '-4/6'],
        correct: 0,
        explanation: '(-2/3)² = (-2)² / 3² = 4/9.',
        hint: 'Lũy thừa bậc chẵn của một số âm luôn cho kết quả là số dương.'
      },
      {
        prompt: `Nếu đại lượng y tỉ lệ thuận với đại lượng x theo hệ số tỉ lệ k = 3, khi x = 4 thì y bằng:`,
        options: ['12', '7', '4/3', '1'],
        correct: 0,
        explanation: 'Vì y tỉ lệ thuận với x theo hệ số k = 3 nên y = 3x = 3 * 4 = 12.',
        hint: 'Công thức tỉ lệ thuận: y = k * x.'
      },
      {
        prompt: `Thu gọn đơn thức M = 2x²y · 3xy³ ta được:`,
        options: ['6x³y⁴', '5x³y⁴', '6x²y³', '5x²y³'],
        correct: 0,
        explanation: 'M = (2 · 3) · (x² · x) · (y · y³) = 6x³y⁴.',
        hint: 'Nhân hệ số với hệ số, nhân các lũy thừa cùng cơ số bằng cách cộng các số mũ.'
      }
    ],
    'Toán 8': [
      {
        prompt: `Khai triển hằng đẳng thức (x + 3)² ta được kết quả là:`,
        options: ['x² + 6x + 9', 'x² + 3x + 9', 'x² + 9', 'x² + 6x + 6'],
        correct: 0,
        explanation: '(x + 3)² = x² + 2·x·3 + 3² = x² + 6x + 9.',
        hint: 'Áp dụng hằng đẳng thức bình phương của một tổng: (A + B)² = A² + 2AB + B².'
      },
      {
        prompt: `Hình chóp tam giác đều có mặt đáy là hình gì?`,
        options: ['Tam giác đều', 'Tam giác vuông', 'Tam giác cân', 'Tứ giác đều'],
        correct: 0,
        explanation: 'Theo định nghĩa, hình chóp tam giác đều có đáy là một tam giác đều và các mặt bên là các tam giác cân bằng nhau.',
        hint: 'Nhớ lại tính chất của hình chóp đều: đa giác đáy luôn là đa giác đều.'
      },
      {
        prompt: `Nghiệm của phương trình 2x - 8 = 0 là:`,
        options: ['x = 4', 'x = -4', 'x = 2', 'x = 8'],
        correct: 0,
        explanation: '2x = 8 => x = 8 / 2 = 4.',
        hint: 'Chuyển -8 sang vế phải thành +8 rồi chia cả hai vế cho 2.'
      },
      {
        prompt: `Định lý Thalès trong tam giác: Nếu một đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại thì nó:`,
        options: ['Định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ', 'Chia tam giác thành 2 phần bằng nhau', 'Cắt vuông góc với hai cạnh đó', 'Đi qua trung điểm của hai cạnh đó'],
        correct: 0,
        explanation: 'Định lý Thalès phát biểu: Nếu một đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại thì nó định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ.',
        hint: 'Từ khóa trọng tâm của định lý Thalès là "đoạn thẳng tương ứng tỉ lệ".'
      }
    ],
    'Toán 9': [
      {
        prompt: `Điều kiện xác định của biểu thức √(2x - 6) là:`,
        options: ['x ≥ 3', 'x > 3', 'x ≤ 3', 'x ≥ 0'],
        correct: 0,
        explanation: 'Căn thức √A có nghĩa khi A ≥ 0 <=> 2x - 6 ≥ 0 <=> 2x ≥ 6 <=> x ≥ 3.',
        hint: 'Biểu thức dưới dấu căn bậc hai không âm: A ≥ 0.'
      },
      {
        prompt: `Hệ số góc của đường thẳng (d): y = -3x + 5 là:`,
        options: ['-3', '5', '3', '-5'],
        correct: 0,
        explanation: 'Đường thẳng có dạng y = ax + b thì a là hệ số góc. Ở đây a = -3.',
        hint: 'Trong phương trình hàm số bậc nhất y = ax + b, a chính là hệ số góc.'
      },
      {
        prompt: `Tam giác ABC vuông tại A có đường cao AH. Hệ thức lượng nào sau đây là đúng?`,
        options: ['AH² = BH · CH', 'AH² = AB · AC', 'AB² = AH · BC', 'AC² = BH · BC'],
        correct: 0,
        explanation: 'Trong tam giác vuông, bình phương đường cao ứng với cạnh huyền bằng tích hai hình chiếu của hai cạnh góc vuông trên cạnh huyền: AH² = BH · CH.',
        hint: 'Hệ thức liên quan đến bình phương đường cao: h² = b\' · c\'.'
      },
      {
        prompt: `Góc nội tiếp chắn nửa đường tròn có số đo bằng:`,
        options: ['90°', '180°', '60°', '45°'],
        correct: 0,
        explanation: 'Định lý: Góc nội tiếp chắn nửa đường tròn là góc vuông (số đo bằng 90°).',
        hint: 'Góc nội tiếp có số đo bằng một nửa số đo của cung bị chắn. Nửa đường tròn có số đo 180°.'
      }
    ]
  };

  const pool = templatesByGrade[grade] || templatesByGrade['Toán 8'];

  for (let i = 0; i < count; i++) {
    const tmpl = pool[i % pool.length];
    const prefix = topic ? `[${topic}] ` : '';
    
    // Shuffle options so correct answer isn't always at index 0
    const originalOptions = [...tmpl.options];
    const targetCorrectText = originalOptions[tmpl.correct];
    const shuffled = [...originalOptions].sort(() => Math.random() - 0.5);
    const newCorrectIdx = shuffled.indexOf(targetCorrectText);

    questions.push({
      id: `ai-q-${Date.now()}-${i}`,
      grade,
      category,
      difficulty,
      prompt: `${prefix}${tmpl.prompt}${count > 4 ? ` (Dạng bài tập ${i + 1})` : ''}`,
      options: shuffled,
      correctAnswer: newCorrectIdx,
      explanation: tmpl.explanation,
      hint: isInclusive ? `💡 Gợi ý tư duy: ${tmpl.hint}` : tmpl.hint,
      timeLimitSeconds: isInclusive ? 45 : 30
    });
  }

  return questions;
}

export const aiService = {
  // Generate a set of questions for the question bank
  async generateQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
    try {
      const response = await fetch('./api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch (err) {
      console.warn('AI Server API unreachable or offline, using curriculum generator fallback.', err);
    }

    // Fallback
    return generateFallbackQuestions(params);
  },

  // Generate a full mock exam
  async generateExam(params: GenerateExamParams): Promise<MockExam> {
    const isInclusive = params.targetAudience === 'inclusive';
    const effectiveDuration = isInclusive ? Math.round(params.durationMinutes * 1.5) : params.durationMinutes;

    try {
      const response = await fetch('./api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exam && Array.isArray(data.exam.questions)) {
          return data.exam;
        }
      }
    } catch (err) {
      console.warn('AI Server API unreachable or offline, using exam builder fallback.', err);
    }

    // Fallback Exam Generation
    const questions = generateFallbackQuestions({
      grade: params.grade,
      category: 'Số học & Đại số',
      difficulty: isInclusive ? 'Nhận biết' : 'Thông hiểu',
      topic: params.topic || params.title,
      count: params.count || (isInclusive ? 4 : 8),
      isInclusive
    });

    const newExam: MockExam = {
      id: `ai-exam-${Date.now()}`,
      title: params.title || `Đề Ôn Tập AI - ${params.grade} (${isInclusive ? 'Hòa Nhập' : 'Chuẩn GDPT'})`,
      grade: params.grade,
      termType: params.termType,
      targetAudience: params.targetAudience,
      durationMinutes: effectiveDuration,
      year: '2024 - 2025',
      isInclusiveAdapted: isInclusive,
      timeMultiplier: isInclusive ? 1.5 : 1.0,
      description: isInclusive 
        ? `Đề thi do Trợ Lý AI biên soạn theo Thông tư 03/2018/BGDĐT: Đã tối ưu hóa cho học sinh hòa nhập, thời gian mở rộng x1.5 (${effectiveDuration} phút), tích hợp gợi ý tư duy trực quan cho từng câu.`
        : `Đề thi do Trợ Lý AI biên soạn chuẩn GDPT 2018: Đầy đủ ma trận nhận biết - thông hiểu - vận dụng, bám sát cấu trúc đề kiểm tra của Bộ GD&ĐT.`,
      accommodations: isInclusive ? [
        'Cộng thêm 50% thời gian làm bài (x1.5)',
        'Gợi ý tư duy từng bước cho mỗi câu hỏi',
        'Câu từ tinh gọn, rõ nghĩa, không bẫy phức tạp'
      ] : undefined,
      questions
    };

    return newExam;
  },

  async importDocument(params: ImportDocumentParams): Promise<ImportDocumentResult> {
    const isInclusive = params.targetAudience === 'inclusive';
    const effectiveDuration = isInclusive ? Math.round((params.durationMinutes || 45) * 1.5) : (params.durationMinutes || 45);

    try {
      const response = await fetch('./api/ai/import-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (data.questions && data.questions.length > 0) {
          return data;
        }
        throw new Error('Không trích xuất được câu hỏi nào từ tài liệu này.');
      }

      throw new Error(data.error || `Lỗi máy chủ (${response.status}) khi phân tích tài liệu.`);
    } catch (err: any) {
      // Only fall back to client regex parser if network itself failed AND rawText was provided
      const isNetworkError = err instanceof TypeError;
      if (!isNetworkError || !params.rawText?.trim()) {
        throw err;
      }
      console.warn('AI Server Document Import unreachable, using client offline parser fallback.', err);
    }

    // Client-side offline fallback parser if server call fails on raw text
    const rawContent = params.rawText || '';
    const clean = rawContent.replace(/\r\n/g, '\n');
    const questions: Question[] = [];

    const qRegex = /(?:Câu|Bài|\bQ)\s*(\d+)[\s.:-]+([\s\S]*?)(?=(?:Câu|Bài|\bQ)\s*\d+[\s.:-]|BẢNG ĐÁP ÁN|ĐÁP ÁN|LỜI GIẢI|$)/gi;
    let match;
    let count = 0;

    while ((match = qRegex.exec(clean)) !== null) {
      count++;
      const qNum = match[1];
      const qContent = match[2].trim();
      
      const optA = qContent.match(/[A|a][.:)]\s*([^\n\rBCD]+?)(?=[B|b][.:)]|$)/);
      const optB = qContent.match(/[B|b][.:)]\s*([^\n\rCD]+?)(?=[C|c][.:)]|$)/);
      const optC = qContent.match(/[C|c][.:)]\s*([^\n\rD]+?)(?=[D|d][.:)]|$)/);
      const optD = qContent.match(/[D|d][.:)]\s*([^\n\r]+?)(?=(?:Đáp án|Lời giải|Gợi ý|$))/i);

      const hasMultipleChoiceOpts = Boolean(optA && optB);
      const expMatch = qContent.match(/Lời giải[:\s]*([\s\S]*?)(?=Gợi ý[:\s]|$)/i);
      const hintMatch = qContent.match(/Gợi ý[:\s]*([\s\S]*?)$/i);

      let promptText = qContent;
      if (hasMultipleChoiceOpts) {
        const firstOptIndex = qContent.search(/[A|a][.:)]\s*/);
        if (firstOptIndex > 0) {
          promptText = qContent.substring(0, firstOptIndex).trim();
        }
      } else {
        const metaStart = qContent.search(/(?:Đáp án|Lời giải|Gợi ý)[:\s]/i);
        if (metaStart > 0) {
          promptText = qContent.substring(0, metaStart).trim();
        }
      }

      if (hasMultipleChoiceOpts) {
        let correctIdx = 0;
        const ansMatch = qContent.match(/(?:Đáp án|Chọn|Key|ĐA)[:\s]*([A-D])/i);
        if (ansMatch) {
          const letter = ansMatch[1].toUpperCase();
          if (letter === 'A') correctIdx = 0;
          else if (letter === 'B') correctIdx = 1;
          else if (letter === 'C') correctIdx = 2;
          else if (letter === 'D') correctIdx = 3;
        }

        const options = [
          optA ? optA[1].trim() : 'Đáp án A',
          optB ? optB[1].trim() : 'Đáp án B',
          optC ? optC[1].trim() : 'Đáp án C',
          optD ? optD[1].trim() : 'Đáp án D'
        ];

        questions.push({
          id: `imported-q-${Date.now()}-${count}`,
          grade: params.grade,
          category: 'Số học & Đại số',
          difficulty: isInclusive ? 'Nhận biết' : 'Thông hiểu',
          questionType: 'multiple_choice',
          prompt: promptText.replace(/\n+/g, ' ') || `Câu hỏi số ${qNum}`,
          options,
          correctAnswer: correctIdx,
          explanation: expMatch ? expMatch[1].trim() : (isInclusive
            ? 'Áp dụng công thức cơ bản và suy luận từng bước theo SGK.'
            : 'Lời giải chi tiết theo chuẩn ma trận kiến thức GDPT 2018.'),
          hint: hintMatch ? hintMatch[1].trim() : (isInclusive ? 'Đọc kĩ giả thiết và yêu cầu của câu hỏi.' : undefined),
          timeLimitSeconds: isInclusive ? 45 : 30
        });
      } else {
        questions.push({
          id: `imported-q-${Date.now()}-${count}`,
          grade: params.grade,
          category: 'Số học & Đại số',
          difficulty: isInclusive ? 'Thông hiểu' : 'Vận dụng',
          questionType: 'essay',
          prompt: promptText.replace(/\n+/g, ' ') || `Bài tự luận số ${qNum}`,
          options: [],
          correctAnswer: -1,
          explanation: expMatch ? expMatch[1].trim() : 'Học sinh trình bày bài giải chi tiết ra giấy và tải ảnh bài làm lên hệ thống.',
          hint: hintMatch ? hintMatch[1].trim() : 'Đọc kĩ giả thiết và trình bày rõ các bước lập luận.',
          timeLimitSeconds: isInclusive ? 240 : 180
        });
      }
    }

    if (questions.length === 0) {
      // Generate sample questions matching requested grade
      const fallbacks = generateFallbackQuestions({
        grade: params.grade,
        category: 'Số học & Đại số',
        difficulty: isInclusive ? 'Nhận biết' : 'Thông hiểu',
        topic: params.title || 'Kiến thức trọng tâm',
        count: isInclusive ? 4 : 6,
        isInclusive
      });
      questions.push(...fallbacks);
    }

    const title = params.title || (params.fileName ? `Đề Trích Xuất: ${params.fileName.replace(/\.[^/.]+$/, '')}` : `Đề Nhập ${params.grade}`);

    return {
      success: true,
      source: 'local-fallback',
      title,
      description: `Đã trích xuất ${questions.length} câu hỏi trắc nghiệm từ tài liệu ${params.fileName || 'tải lên'}.`,
      questions,
      targetType: params.targetType,
      grade: params.grade,
      termType: params.termType,
      targetAudience: params.targetAudience,
      durationMinutes: effectiveDuration,
      classId: params.classId
    };
  }
};

export interface ImportDocumentParams {
  fileBase64?: string;
  fileName?: string;
  fileType?: 'pdf' | 'docx' | 'doc' | 'txt';
  rawText?: string;
  customPrompt?: string;
  targetType: 'exam' | 'homework' | 'questions';
  grade: GradeLevel;
  termType?: ExamType;
  targetAudience?: TargetAudience;
  durationMinutes?: number;
  classId?: string;
  title?: string;
}

export interface ImportDocumentResult {
  success: boolean;
  source: 'gemini-ai' | 'local-fallback';
  title: string;
  description: string;
  questions: Question[];
  extractionWarnings?: string[];
  targetType: 'exam' | 'homework' | 'questions';
  grade: GradeLevel;
  termType?: ExamType;
  targetAudience?: TargetAudience;
  durationMinutes?: number;
  classId?: string;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
