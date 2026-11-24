import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Increase body parser limits for PDF/Word documents base64 payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize server-side Gemini client per skill instructions
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper: retry transient 503/429 errors with exponential backoff and flash-lite fallback
  async function generateWithRetry(params: Parameters<typeof ai.models.generateContent>[0]) {
    const modelsToTry = [params.model, 'gemini-3.1-flash-lite'];
    let lastErr: any;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return await ai.models.generateContent({
            ...params,
            model: modelName,
          });
        } catch (err: any) {
          lastErr = err;
          const status = err?.status || err?.code;
          const msg = String(err?.message || '');
          const isTransient =
            status === 503 ||
            status === 429 ||
            msg.includes('503') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('high demand');
          if (!isTransient) {
            throw err;
          }
          await new Promise((r) => setTimeout(r, 900 * (attempt + 1)));
        }
      }
    }
    throw lastErr;
  }

  function repairServerMathNotation(input: any): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/\x0c(?=[a-zA-Z])/g, '\\f')
      .replace(/\x08(?=[a-zA-Z])/g, '\\b')
      .replace(/\r(?=[a-zA-Z])/g, '\\r')
      .replace(/\t(?=(?:imes|ext|an|heta|au|riangle|o(?![a-zA-Z])|op|frac|ilde|hick))/g, '\\t')
      .replace(/\\cotg(?![a-zA-Z])/g, '\\cot')
      .replace(/\\tg(?![a-zA-Z])/g, '\\tan')
      .replace(/\\degree(?![a-zA-Z])/g, '^\\circ');
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
  });

  // AI Generate Questions Route (Teacher only)
  app.post('/api/ai/generate-questions', async (req, res) => {
    try {
      const { grade, category, difficulty, topic, count = 3, isInclusive = false } = req.body;

      if (!apiKey) {
        return res.status(503).json({ error: 'Gemini API key is not configured on server' });
      }

      const prompt = `Bạn là chuyên gia sư phạm Toán THCS Việt Nam theo Chương trình GDPT 2018.
Hãy tạo ${count} câu hỏi trắc nghiệm Toán học với các tiêu chuẩn sau:
- Khối lớp: ${grade}
- Phân môn: ${category}
- Mức độ nhận thức: ${difficulty}
- Chủ đề trọng tâm: ${topic || 'Kiến thức trọng tâm chương trình GDPT 2018'}
- Đối tượng học sinh: ${isInclusive ? 'Học sinh hòa nhập (khuyết tật theo Thông tư 03/2018/BGDĐT - câu hỏi tinh gọn, nhận biết - thông hiểu, từ ngữ trong sáng, KHÔNG đánh đố, BẮT BUỘC có gợi ý tư duy từng bước rõ ràng)' : 'Học sinh chuẩn GDPT 2018 (đại trà)'}

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Trả về duy nhất định dạng JSON thuần túy (không bọc trong markdown codeblock \`\`\`json) theo cấu trúc:
{
  "questions": [
    {
      "prompt": "Nội dung câu hỏi rõ ràng, chính xác",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0,
      "explanation": "Lời giải chi tiết từng bước dễ hiểu",
      "hint": "Gợi ý tư duy nhanh cho học sinh",
      "timeLimitSeconds": 30
    }
  ]
}
LƯU Ý: correctAnswer là chỉ số số nguyên 0, 1, 2, hoặc 3 tương ứng với vị trí trong mảng options.`;

      const response = await generateWithRetry({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia biên soạn đề thi và câu hỏi Toán THCS chuẩn Bộ GD&ĐT Việt Nam. Luôn trả về định dạng JSON hợp lệ.',
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      // Add unique IDs and metadata
      const questions = (parsed.questions || []).map((q: any, idx: number) => ({
        id: `ai-gen-${Date.now()}-${idx}`,
        grade,
        category,
        difficulty,
        prompt: q.prompt,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || 'Lời giải chi tiết theo chuẩn SGK Toán.',
        hint: q.hint || (isInclusive ? 'Hãy đọc kĩ đề bài và áp dụng công thức cơ bản.' : undefined),
        timeLimitSeconds: isInclusive ? 45 : (q.timeLimitSeconds || 30)
      }));

      return res.json({ questions });
    } catch (err: any) {
      console.error('Gemini API generate-questions error:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi gọi AI' });
    }
  });

  // AI Generate Mock Exam Route (Teacher only)
  app.post('/api/ai/generate-exam', async (req, res) => {
    try {
      const { title, grade, termType, targetAudience, durationMinutes = 45, topic, count = 8 } = req.body;

      if (!apiKey) {
        return res.status(503).json({ error: 'Gemini API key is not configured on server' });
      }

      const isInclusive = targetAudience === 'inclusive';
      const effectiveDuration = isInclusive ? Math.round(durationMinutes * 1.5) : durationMinutes;

      const prompt = `Bạn là Tổ trưởng bộ môn Toán THCS. Hãy biên soạn một đề thi thử hoàn chỉnh với các thông số:
- Tiêu đề đề thi: ${title || `Đề Kiểm Tra ${grade}`}
- Khối lớp: ${grade}
- Kì thi: ${termType}
- Đối tượng học sinh: ${isInclusive ? 'Giáo dục Hòa nhập (Thông tư 03/2018/BGDĐT - giảm tải tính toán phức tạp, tăng nhận biết, có gợi ý tư duy cho mỗi câu)' : 'Chuẩn GDPT 2018 (Đại trà - ma trận chuẩn nhận biết, thông hiểu, vận dụng)'}
- Số lượng câu hỏi: ${count} câu trắc nghiệm 4 lựa chọn (A, B, C, D)
- Trọng tâm kiến thức: ${topic || 'Kiến thức trọng tâm theo khung phân phối chương trình'}

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
Trả về duy nhất định dạng JSON thuần túy theo cấu trúc:
{
  "examTitle": "Tên đề thi chính thức",
  "description": "Mô tả đề thi và mục tiêu kiến thức",
  "questions": [
    {
      "prompt": "Câu hỏi số 1...",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctAnswer": 0,
      "explanation": "Hướng dẫn giải chi tiết",
      "hint": "Gợi ý tư duy từng bước",
      "difficulty": "Thông hiểu"
    }
  ]
}`;

      const response = await generateWithRetry({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia khảo thí và biên soạn đề kiểm tra Toán THCS Việt Nam. Luôn xuất dữ liệu dạng JSON chuẩn xác.',
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      const formattedQuestions = (parsed.questions || []).map((q: any, idx: number) => ({
        id: `ai-exam-q-${Date.now()}-${idx}`,
        grade,
        category: 'Số học & Đại số',
        difficulty: q.difficulty || (isInclusive ? 'Nhận biết' : 'Thông hiểu'),
        prompt: q.prompt,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || 'Theo định lý và công thức chuẩn SGK Toán.',
        hint: isInclusive ? (q.hint || 'Đọc kỹ yêu cầu và chọn đáp án chính xác.') : q.hint,
        timeLimitSeconds: isInclusive ? 60 : 45
      }));

      const exam = {
        id: `ai-exam-${Date.now()}`,
        title: parsed.examTitle || title || `Đề Thi Thử AI - ${grade}`,
        grade,
        termType,
        targetAudience,
        durationMinutes: effectiveDuration,
        year: '2024 - 2025',
        isInclusiveAdapted: isInclusive,
        timeMultiplier: isInclusive ? 1.5 : 1.0,
        description: parsed.description || (isInclusive 
          ? `Đề thi hòa nhập do AI biên soạn theo Thông tư 03/2018/BGDĐT, thời gian mở rộng x1.5 (${effectiveDuration} phút), tích hợp gợi ý tư duy cho học sinh.`
          : `Đề thi chuẩn GDPT 2018 do Trợ lý AI biên soạn bám sát ma trận kiểm tra định kỳ của Bộ GD&ĐT.`),
        accommodations: isInclusive ? [
          'Tự động cộng thêm 50% thời gian (x1.5)',
          'Có gợi ý tư duy cho mỗi câu hỏi',
          'Độ khó nhận biết - thông hiểu, không gài bẫy'
        ] : undefined,
        questions: formattedQuestions
      };

      return res.json({ exam });
    } catch (err: any) {
      console.error('Gemini API generate-exam error:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi gọi AI' });
    }
  });

  // Helper for offline fallback parsing of Vietnamese exams
  function parseVietnameseExamFallback(text: string, grade: string, isInclusive: boolean) {
    const questions: any[] = [];
    const clean = text.replace(/\r\n/g, '\n');
    
    // Pattern to match question blocks
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
          grade: grade || 'Toán 8',
          category: 'Số học & Đại số',
          difficulty: isInclusive ? 'Nhận biết' : 'Thông hiểu',
          questionType: 'multiple_choice',
          prompt: promptText.replace(/\n+/g, ' ') || `Câu hỏi số ${qNum}`,
          options,
          correctAnswer: correctIdx,
          explanation: expMatch ? expMatch[1].trim() : (isInclusive
            ? 'Áp dụng công thức cơ bản trong SGK Toán THCS.'
            : 'Lời giải chi tiết theo chuẩn SGK và ma trận đề GDPT 2018.'),
          hint: hintMatch ? hintMatch[1].trim() : (isInclusive
            ? 'Đọc kĩ đề bài, xác định dữ kiện đã cho và dùng công thức trực tiếp.'
            : undefined),
          timeLimitSeconds: isInclusive ? 45 : 30
        });
      } else {
        questions.push({
          id: `imported-q-${Date.now()}-${count}`,
          grade: grade || 'Toán 8',
          category: 'Số học & Đại số',
          difficulty: isInclusive ? 'Thông hiểu' : 'Vận dụng',
          questionType: 'essay',
          prompt: promptText.replace(/\n+/g, ' ') || `Bài tự luận số ${qNum}`,
          options: [],
          correctAnswer: -1,
          explanation: expMatch ? expMatch[1].trim() : 'Học sinh trình bày đầy đủ các bước giải trên giấy và tải ảnh bài làm lên hệ thống.',
          hint: hintMatch ? hintMatch[1].trim() : 'Phân tích giả thiết đề bài và trình bày rõ từng bước lập luận.',
          timeLimitSeconds: isInclusive ? 240 : 180
        });
      }
    }

    return questions;
  }

  // AI Import Document Route (PDF & Word .docx)
  app.post('/api/ai/import-document', async (req, res) => {
    try {
      const { 
        fileBase64, 
        fileName, 
        fileType, 
        rawText, 
        customPrompt,
        targetType = 'exam', // 'exam' | 'homework' | 'questions'
        grade = 'Toán 8', 
        termType = 'giua_ki_1',
        targetAudience = 'standard',
        durationMinutes = 45,
        classId = 'class-8a1',
        title: customTitle
      } = req.body;

      let documentText = typeof rawText === 'string' ? rawText : '';
      const isPdf = fileType === 'pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'));
      const isDocx = fileType === 'docx' || (fileName && (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')));
      const isTxt = fileType === 'txt' || (fileName && fileName.toLowerCase().endsWith('.txt'));

      // Extract text for .docx or .txt uploads
      if (fileBase64 && isDocx) {
        try {
          const docBuffer = Buffer.from(fileBase64, 'base64');
          const mammothResult = await mammoth.extractRawText({ buffer: docBuffer });
          if (mammothResult.value && mammothResult.value.trim().length > 0) {
            documentText = mammothResult.value;
          }
        } catch (mErr) {
          console.warn('Mammoth docx extraction notice:', mErr);
        }
      } else if (fileBase64 && isTxt && !documentText.trim()) {
        try {
          documentText = Buffer.from(fileBase64, 'base64').toString('utf-8');
        } catch (tErr) {
          console.warn('TXT decode notice:', tErr);
        }
      }

      if (!(isPdf && fileBase64) && !documentText.trim()) {
        return res.status(400).json({
          error: 'Không đọc được nội dung văn bản từ tệp tải lên (tệp .doc cũ hoặc tệp rỗng). Vui lòng lưu sang .docx / .pdf hoặc dán trực tiếp nội dung đề thi.'
        });
      }

      const isInclusive = targetAudience === 'inclusive';
      const effectiveDuration = isInclusive ? Math.round(durationMinutes * 1.5) : durationMinutes;

      if (apiKey) {
        const systemInstruction = 'Bạn là chuyên gia số hóa đề thi Toán học (chương trình GDPT 2018) từ tệp PDF và Word. Nhiệm vụ bắt buộc: đọc TOÀN BỘ trang tài liệu và trích xuất ĐẦY ĐỦ TẤT CẢ CÁC CÂU HỎI của đề thi đầu tiên từ câu 1 đến câu cuối cùng sang JSON chuẩn hệ thống. Tuyệt đối KHÔNG chỉ trích xuất 1 câu, KHÔNG tóm tắt, và KHÔNG lấy tên tệp làm câu hỏi. GIỮ NGUYÊN ĐỀ GỐC — không sửa đổi số liệu hay giả thiết.';

        const defaultExtractionRules = `I. QUY TẮC ĐỌC VÀ TRÍCH XUẤT TOÀN BỘ ĐỀ:
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

        const effectiveInstructions =
          typeof customPrompt === 'string' && customPrompt.trim().length > 0
            ? customPrompt.trim()
            : defaultExtractionRules;

        const promptGuidelines = `Hãy phân tích tài liệu đề thi / bài tập Toán (tên tệp tham chiếu: ${fileName || 'tailieu'}) và trích xuất TOÀN BỘ danh sách câu hỏi trong đề đầu tiên.
Thông số cấu hình hệ thống:
- Nhãn khối lớp chọn sẵn: ${grade}
- Mục đích nhập: ${targetType === 'exam' ? `Đề kiểm tra (${termType})` : targetType === 'homework' ? 'Bài tập về nhà (BTVN)' : 'Ngân hàng câu hỏi'}
- Đối tượng học sinh: ${isInclusive ? 'Học sinh hòa nhập / khuyết tật (Thông tư 03/2018/BGDĐT - BẮT BUỘC bổ sung "hint" gợi ý tư duy từng bước rõ ràng cho mọi câu)' : 'Chuẩn GDPT 2018 (đại trà)'}

${effectiveInstructions}

LƯU Ý BẮT BUỘC KHI XUẤT JSON:
- Mảng "questions" PHẢI chứa ĐẦY ĐỦ mọi câu hỏi có trong đề thi (từ câu 1 đến câu cuối cùng), mỗi câu là 1 phần tử riêng biệt trong mảng.
- Mỗi phần tử thuộc đúng 1 trong 2 dạng:
  * Trắc nghiệm: questionType = "multiple_choice", options = ["...", "...", "...", "..."] (đúng 4 chuỗi), correctAnswer = 0..3.
  * Tự luận (upload ảnh): questionType = "essay", options = [], correctAnswer = -1.`;

        const contentsPayload =
          isPdf && fileBase64
            ? {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: fileBase64,
                    },
                  },
                  {
                    text: promptGuidelines,
                  },
                ],
              }
            : `${promptGuidelines}\n\n--- NỘI DUNG TÀI LIỆU ---\n${documentText}`;

        const response = await generateWithRetry({
          model: 'gemini-4-hydrogen',
          contents: contentsPayload,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Tên đề thi hoặc tiêu đề tài liệu trích xuất được' },
                description: { type: Type.STRING, description: 'Mô tả ngắn gọn nội dung và phạm vi kiến thức' },
                questions: {
                  type: Type.ARRAY,
                  description: 'Toàn bộ danh sách câu hỏi trích xuất từ đề thi đầu tiên (từ câu 1 đến câu cuối)',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionType: { type: Type.STRING, description: 'Chỉ dùng "multiple_choice" hoặc "essay"' },
                      prompt: { type: Type.STRING, description: 'Nội dung câu hỏi gốc đầy đủ' },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Đúng 4 phương án cho multiple_choice; mảng rỗng [] cho essay',
                      },
                      correctAnswer: {
                        type: Type.INTEGER,
                        description: '0, 1, 2, hoặc 3 cho multiple_choice; -1 cho essay',
                      },
                      explanation: { type: Type.STRING, description: 'Lời giải chi tiết từng bước' },
                      hint: { type: Type.STRING, description: 'Gợi ý tư duy ngắn gọn' },
                      difficulty: { type: Type.STRING, description: 'Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao' },
                      category: { type: Type.STRING, description: 'Số học & Đại số | Hình học & Đo lường | Thống kê & Xác suất | Tính nhanh & Tư duy logic' },
                    },
                    required: ['questionType', 'prompt', 'options', 'correctAnswer', 'explanation', 'difficulty', 'category'],
                  },
                },
                extractionWarnings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Cảnh báo nếu có câu hỏi thiếu hình vẽ hoặc không đủ dữ kiện xác định đáp án',
                },
              },
              required: ['title', 'description', 'questions'],
            },
          },
        });

        const responseText = (response.text || '').trim();
        let parsed: any;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('AI trả về dữ liệu không đúng định dạng JSON. Vui lòng thử lại.');
          }
          parsed = JSON.parse(jsonMatch[0]);
        }

        const ALLOWED_DIFFICULTIES = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
        const ALLOWED_CATEGORIES = [
          'Số học & Đại số',
          'Hình học & Đo lường',
          'Thống kê & Xác suất',
          'Tính nhanh & Tư duy logic',
        ];

        const stripOptPrefix = (s: string) => repairServerMathNotation(s).replace(/^[A-Da-d][.:)\-]\s*/, '').trim();

        const questions = (Array.isArray(parsed.questions) ? parsed.questions : []).map((q: any, idx: number) => {
          const rawOpts = Array.isArray(q.options) ? q.options : [];
          const normalizedOpts = rawOpts
            .map((opt: any) =>
              typeof opt === 'string'
                ? stripOptPrefix(opt)
                : typeof opt?.content === 'string'
                ? stripOptPrefix(opt.content)
                : stripOptPrefix(String(opt ?? ''))
            )
            .filter((s: string) => s.length > 0);

          const isEssay =
            q.questionType === 'essay' ||
            q.questionType === 'short_answer' ||
            q.questionType === 'true_false' ||
            (normalizedOpts.length < 2 && q.questionType !== 'multiple_choice');

          const safeDifficulty = ALLOWED_DIFFICULTIES.includes(q.difficulty)
            ? q.difficulty
            : isEssay
            ? isInclusive ? 'Thông hiểu' : 'Vận dụng'
            : isInclusive ? 'Nhận biết' : 'Thông hiểu';

          const safeCategory = ALLOWED_CATEGORIES.includes(q.category)
            ? q.category
            : 'Số học & Đại số';

          const cleanPrompt = repairServerMathNotation(q.prompt || q.content || '');
          const cleanExplanation = repairServerMathNotation(q.explanation || '');
          const cleanHint = q.hint ? repairServerMathNotation(q.hint) : undefined;

          if (isEssay) {
            return {
              id: `doc-q-${Date.now()}-${idx}`,
              grade,
              category: safeCategory,
              difficulty: safeDifficulty,
              questionType: 'essay',
              prompt: cleanPrompt || `Bài tự luận số ${idx + 1}`,
              options: [],
              correctAnswer: -1,
              explanation: cleanExplanation || 'Học sinh trình bày bài giải chi tiết ra giấy và tải ảnh bài làm lên hệ thống.',
              hint: cleanHint || 'Đọc kĩ giả thiết và trình bày rõ các bước lập luận.',
              timeLimitSeconds: isInclusive ? 240 : 180,
            };
          }

          const finalOpts = normalizedOpts.slice(0, 4);
          while (finalOpts.length < 4) {
            finalOpts.push(`Phương án ${String.fromCharCode(65 + finalOpts.length)}`);
          }
          const safeCorrect =
            typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3
              ? q.correctAnswer
              : 0;

          return {
            id: `doc-q-${Date.now()}-${idx}`,
            grade,
            category: safeCategory,
            difficulty: safeDifficulty,
            questionType: 'multiple_choice',
            prompt: cleanPrompt || `Câu hỏi số ${idx + 1}`,
            options: finalOpts,
            correctAnswer: safeCorrect,
            explanation: cleanExplanation || 'Theo hướng dẫn giải chuẩn chương trình Toán GDPT 2018.',
            hint: cleanHint || (isInclusive ? 'Đọc kĩ dữ kiện và chọn đáp án chính xác.' : undefined),
            timeLimitSeconds: isInclusive ? 45 : 30,
          };
        });

        if (questions.length === 0) {
          return res.status(422).json({
            error: 'AI chưa trích xuất được câu hỏi nào từ tài liệu này. Hãy kiểm tra lại nội dung tệp hoặc thử dán văn bản đề thi trực tiếp.'
          });
        }

        const extractionWarnings = Array.isArray(parsed.extractionWarnings)
          ? parsed.extractionWarnings.filter((w: any) => typeof w === 'string' && w.trim().length > 0)
          : [];

        const docTitle = customTitle || parsed.title || (fileName ? `Đề Trích Xuất: ${fileName.replace(/\.[^/.]+$/, '')}` : `Đề Nhập ${grade}`);
        const docDescription = parsed.description || `Đề thi trích xuất tự động từ file ${fileName || 'tài liệu'} bằng Trợ lý AI.`;

        return res.json({
          success: true,
          source: 'gemini-ai',
          title: docTitle,
          description: docDescription,
          questions,
          extractionWarnings,
          targetType,
          grade,
          termType,
          targetAudience,
          durationMinutes: effectiveDuration,
          classId,
        });
      }

      // Offline fallback ONLY when no API key is configured and plain text is available
      if (isPdf && !documentText.trim()) {
        return res.status(503).json({
          error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để phân tích trực tiếp tệp PDF. Vui lòng thiết lập API key hoặc dán văn bản đề thi.'
        });
      }

      const fallbackQuestions = parseVietnameseExamFallback(documentText, grade, isInclusive);
      if (fallbackQuestions.length === 0) {
        return res.status(422).json({
          error: 'Không nhận diện được cấu trúc câu hỏi (ví dụ: Câu 1: ... A. ... B. ...). Vui lòng kiểm tra định dạng văn bản.'
        });
      }

      const fallbackTitle = customTitle || (fileName ? `Đề Nhập: ${fileName.replace(/\.[^/.]+$/, '')}` : `Đề Nhập ${grade}`);

      return res.json({
        success: true,
        source: 'local-fallback',
        title: fallbackTitle,
        description: `Tài liệu đã được trích xuất ${fallbackQuestions.length} câu hỏi từ ${fileName || 'văn bản'}.`,
        questions: fallbackQuestions,
        targetType,
        grade,
        termType,
        targetAudience,
        durationMinutes: effectiveDuration,
        classId,
      });
    } catch (err: any) {
      console.error('Import document error:', err);
      const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
      const rawMsg = String(err?.message || '');
      let friendlyMsg = rawMsg || 'Lỗi khi phân tích tài liệu bằng AI. Vui lòng thử lại.';
      if (status === 503 || rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
        friendlyMsg = 'Máy chủ AI đang quá tải tạm thời (503). Vui lòng bấm trích xuất lại sau vài giây.';
      } else if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        friendlyMsg = 'Hệ thống AI tạm chạm giới hạn lượt gọi (429). Vui lòng đợi một lát rồi thử lại.';
      }
      return res.status(status).json({
        error: friendlyMsg,
      });
    }
  });

  // AI Generate 10-question 2-option (A/B) Math Quiz for Webcam Face-Control Game
  app.post('/api/ai/generate-face-quiz', async (req, res) => {
    try {
      const { grade = 'Lớp 8', topic = 'Định lí Pythagore' } = req.body;

      if (!apiKey) {
        return res.status(503).json({
          error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để tạo bộ câu hỏi AI.',
        });
      }

      const cleanTopic = String(topic || '').trim() || `Kiến thức trọng tâm ${grade}`;
      const prompt = `Bạn là giáo viên Toán xuất sắc tại Việt Nam đang giảng dạy theo bộ sách "Kết nối tri thức với cuộc sống" (GDPT 2018).
Hãy biên soạn ĐÚNG 10 câu hỏi trắc nghiệm Toán học tương tác trên lớp học cho:
- Khối lớp: ${grade}
- Chủ đề bài học: ${cleanTopic}

YÊU CẦU BẮT BUỘC:
1. Tạo đủ 10 câu hỏi đa dạng từ nhận biết đến thông hiểu và vận dụng nhẹ, bám sát SGK "Kết nối tri thức với cuộc sống".
2. Mỗi câu hỏi CHỈ CÓ ĐÚNG 2 PHƯƠNG ÁN LỰA CHỌN: "optionA" và "optionB" (phương án ngắn gọn, rõ ràng để học sinh đọc nhanh trên máy chiếu và nghiêng đầu chọn trái/phải).
3. Phân bổ đáp án đúng ("correctOption": "A" hoặc "B") xen kẽ tự nhiên, cân bằng khoảng 5 câu A và 5 câu B.
4. Mọi biểu thức, phân số, căn bậc hai, lũy thừa, góc, ký hiệu toán học viết bằng LaTeX chuẩn đặt trong cặp dấu \`$ ... $\` (ví dụ: \`$a^2 + b^2 = c^2$\`, \`$\\frac{3}{4}$\`, \`$\\sqrt{25} = 5$\`) để hiển thị đẹp bằng KaTeX.
5. Mỗi câu có "explanation" là lời giải thích ngắn gọn 1–2 câu súc tích, dễ hiểu để trình chiếu sau khi học sinh trả lời.`;

      const response = await generateWithRetry({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là chuyên gia sư phạm Toán học Việt Nam (chương trình Kết nối tri thức với cuộc sống). Luôn trả về đúng 10 câu hỏi trắc nghiệm 2 phương án A/B định dạng JSON chuẩn, công thức viết trong $...$ cho KaTeX.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING, description: 'Tiêu đề ngắn gọn của bộ câu hỏi' },
              questions: {
                type: Type.ARRAY,
                description: 'Danh sách đúng 10 câu hỏi trắc nghiệm 2 phương án A và B',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    prompt: { type: Type.STRING, description: 'Nội dung câu hỏi rõ ràng, dùng $...$ cho công thức KaTeX' },
                    optionA: { type: Type.STRING, description: 'Nội dung đáp án A (ngắn gọn, dùng $...$ nếu có công thức)' },
                    optionB: { type: Type.STRING, description: 'Nội dung đáp án B (ngắn gọn, dùng $...$ nếu có công thức)' },
                    correctOption: { type: Type.STRING, description: 'Chỉ nhận "A" hoặc "B"' },
                    explanation: { type: Type.STRING, description: 'Lời giải thích ngắn gọn 1-2 câu' },
                  },
                  required: ['prompt', 'optionA', 'optionB', 'correctOption', 'explanation'],
                },
              },
            },
            required: ['quizTitle', 'questions'],
          },
        },
      });

      const responseText = (response.text || '').trim();
      const parsed = JSON.parse(responseText);
      const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

      const questions = rawQuestions.slice(0, 10).map((q: any, idx: number) => ({
        id: `face-q-${Date.now()}-${idx}`,
        prompt: repairServerMathNotation(q.prompt || `Câu hỏi số ${idx + 1}`),
        optionA: repairServerMathNotation(q.optionA || 'Đáp án A').replace(/^A[.:)\-]\s*/i, '').trim(),
        optionB: repairServerMathNotation(q.optionB || 'Đáp án B').replace(/^B[.:)\-]\s*/i, '').trim(),
        correctOption: String(q.correctOption || 'A').trim().toUpperCase() === 'B' ? 'B' : 'A',
        explanation: repairServerMathNotation(q.explanation || 'Áp dụng trực tiếp công thức trong bài học.'),
      }));

      if (questions.length === 0) {
        return res.status(422).json({ error: 'AI chưa tạo được danh sách câu hỏi. Vui lòng thử lại.' });
      }

      return res.json({
        quizTitle: parsed.quizTitle || `${cleanTopic} (${grade})`,
        questions,
      });
    } catch (err: any) {
      console.error('Face quiz generate error:', err);
      const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
      const rawMsg = String(err?.message || '');
      let friendlyMsg = rawMsg || 'Không thể tạo bộ câu hỏi từ AI.';
      if (status === 503 || rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE')) {
        friendlyMsg = 'Máy chủ AI đang quá tải tạm thời (503). Vui lòng bấm tạo lại sau vài giây.';
      }
      return res.status(status).json({ error: friendlyMsg });
    }
  });

  // AI Encouraging Summary Feedback for Webcam Face-Control Math Game
  app.post('/api/ai/face-quiz-feedback', async (req, res) => {
    try {
      const {
        grade = 'Lớp 8',
        topic = '',
        score = 0,
        totalScore = 100,
        correctCount = 0,
        totalQuestions = 10,
        durationSeconds = 0,
      } = req.body;

      const buildFallbackFeedback = () => {
        const rate = totalQuestions > 0 ? correctCount / totalQuestions : 0;
        if (rate >= 0.8) {
          return `Tuyệt vời! Em đã trả lời đúng ${correctCount}/${totalQuestions} câu (${score}/${totalScore} điểm) chủ đề "${topic}" của ${grade} trong ${durationSeconds} giây. Tư duy phản xạ Toán học rất nhạy bén — hãy tiếp tục giữ vững phong độ nhé!`;
        }
        if (rate >= 0.5) {
          return `Rất đáng khen! Em đạt ${score}/${totalScore} điểm (${correctCount}/${totalQuestions} câu đúng) ở chủ đề "${topic}". Em đã nắm được nền tảng chính; hãy xem lại các câu còn nhầm để tự tin chinh phục điểm tối đa ở lượt sau!`;
        }
        return `Cố gắng rất tốt! Em vừa hoàn thành thử thách "${topic}" với ${score}/${totalScore} điểm trong ${durationSeconds} giây. Mỗi lần luyện tập giúp em ghi nhớ công thức lâu hơn — hãy thử chơi lại một lượt nữa để bứt phá nhé!`;
      };

      if (!apiKey) {
        return res.json({ feedback: buildFallbackFeedback() });
      }

      try {
        const prompt = `Bạn là giáo viên Toán thân thiện, truyền cảm hứng. Học sinh vừa hoàn thành trò chơi tương tác Toán học theo chương trình Kết nối tri thức với cuộc sống:
- Khối lớp: ${grade}
- Chủ đề: ${topic}
- Kết quả: ${correctCount}/${totalQuestions} câu đúng (${score}/${totalScore} điểm)
- Thời gian hoàn thành: ${durationSeconds} giây

Hãy viết một lời nhận xét động viên ngắn gọn bằng tiếng Việt (3-4 câu, ấm áp, tích cực, nêu điểm mạnh theo kết quả và một gợi ý nhỏ để em tiến bộ thêm). Chỉ trả về văn bản thuần, không markdown.`;

        const response = await generateWithRetry({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction: 'Bạn là giáo viên Toán tâm lý, luôn động viên học sinh bằng ngôn từ tích cực và súc tích.',
          },
        });

        const text = (response.text || '').trim();
        return res.json({ feedback: text || buildFallbackFeedback() });
      } catch {
        return res.json({ feedback: buildFallbackFeedback() });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Lỗi tạo nhận xét AI' });
    }
  });

  // Mount Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MathMaster THCS Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
