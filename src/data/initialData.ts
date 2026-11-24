import { ClassGroup, FormulaCard, HomeworkAssignment, HomeworkSubmission, MockExam, ParentFeedback, Question, Student, StudentGradeRecord, TeacherAccount } from '../types';
import { getCurrentAcademicYear } from '../utils/academicYear';

const CURRENT_ACADEMIC_YEAR = getCurrentAcademicYear();

export const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    id: 'gv-01',
    name: 'Giáo Viên Toán THCS',
    username: 'giaovien',
    password: '1234',
    subject: 'Toán học THCS (6 - 9)'
  }
];

export const INITIAL_CLASSES: ClassGroup[] = [
  { id: 'class-6a1', name: 'Lớp 6A1', grade: 'Toán 6', academicYear: CURRENT_ACADEMIC_YEAR, room: 'Phòng 201' },
  { id: 'class-7b2', name: 'Lớp 7B2', grade: 'Toán 7', academicYear: CURRENT_ACADEMIC_YEAR, room: 'Phòng 204' },
  { id: 'class-8a3', name: 'Lớp 8A3', grade: 'Toán 8', academicYear: CURRENT_ACADEMIC_YEAR, room: 'Phòng 302' },
  { id: 'class-9c1', name: 'Lớp 9C1', grade: 'Toán 9', academicYear: CURRENT_ACADEMIC_YEAR, room: 'Phòng 305' },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'hs-01',
    name: 'Nguyễn Minh Quân',
    classId: 'class-8a3',
    avatar: '👨‍🎓',
    totalPoints: 1250,
    streakCount: 6,
    gamesPlayed: 14,
    accuracyRate: 92,
    studentCode: 'HS801',
    parentCode: 'PH801',
    username: 'hs801',
    password: '123456',
    parentUsername: 'ph801',
    parentPassword: '123456',
    skills: { algebra: 95, geometry: 88, statistics: 90, speed: 94 },
    recentResults: [
      { id: 'res-1', studentId: 'hs-01', studentName: 'Nguyễn Minh Quân', gameType: 'climb', score: 950, maxScore: 1000, timeSpentSeconds: 110, accuracy: 95, playedAt: '2025-05-10 08:30' },
      { id: 'res-2', studentId: 'hs-01', studentName: 'Nguyễn Minh Quân', gameType: 'speed', score: 300, maxScore: 300, timeSpentSeconds: 45, accuracy: 100, playedAt: '2025-05-12 14:15' }
    ],
    teacherNotes: 'Tư duy logic rất nhanh, nắm vững 7 hằng đẳng thức đáng nhớ.'
  },
  {
    id: 'hs-02',
    name: 'Trần Thị Mai Anh',
    classId: 'class-8a3',
    avatar: '👩‍🎓',
    totalPoints: 1120,
    streakCount: 5,
    gamesPlayed: 12,
    accuracyRate: 88,
    studentCode: 'HS802',
    parentCode: 'PH802',
    username: 'hs802',
    password: '123456',
    parentUsername: 'ph802',
    parentPassword: '123456',
    skills: { algebra: 90, geometry: 92, statistics: 85, speed: 82 },
    recentResults: [
      { id: 'res-3', studentId: 'hs-02', studentName: 'Trần Thị Mai Anh', gameType: 'match', score: 480, maxScore: 500, timeSpentSeconds: 68, accuracy: 96, playedAt: '2025-05-11 09:10' }
    ],
    teacherNotes: 'Hình học vẽ hình chuẩn, cần rèn luyện tốc độ bấm máy và tính nhẩm.'
  },
  {
    id: 'hs-03',
    name: 'Lê Hoàng Nam',
    classId: 'class-8a3',
    avatar: '🧑‍🎓',
    totalPoints: 890,
    streakCount: 3,
    gamesPlayed: 10,
    accuracyRate: 78,
    studentCode: 'HS803',
    parentCode: 'PH803',
    username: 'hs803',
    password: '123456',
    parentUsername: 'ph803',
    parentPassword: '123456',
    isInclusive: true,
    inclusiveNotes: 'Học sinh hòa nhập (tiếp thu cần trợ giúp phương pháp, giảm tải 30% bài tập, tăng x1.5 thời gian làm bài)',
    skills: { algebra: 75, geometry: 80, statistics: 82, speed: 76 },
    recentResults: [],
    teacherNotes: 'Rất chăm chỉ, tiến bộ rõ rệt trong phần phân tích đa thức thành nhân tử khi có gợi ý.'
  },
  {
    id: 'hs-04',
    name: 'Phạm Bảo Châu',
    classId: 'class-8a3',
    avatar: '👧',
    totalPoints: 980,
    streakCount: 4,
    gamesPlayed: 11,
    accuracyRate: 85,
    studentCode: 'HS804',
    parentCode: 'PH804',
    username: 'hs804',
    password: '123456',
    parentUsername: 'ph804',
    parentPassword: '123456',
    skills: { algebra: 86, geometry: 84, statistics: 89, speed: 80 },
    recentResults: [],
    teacherNotes: 'Chăm chỉ, tích cực tham gia các thử thách nhóm.'
  },
  {
    id: 'hs-05',
    name: 'Vũ Đức Trọng',
    classId: 'class-8a3',
    avatar: '🧒',
    totalPoints: 760,
    streakCount: 2,
    gamesPlayed: 8,
    accuracyRate: 72,
    studentCode: 'HS805',
    parentCode: 'PH805',
    username: 'hs805',
    password: '123456',
    parentUsername: 'ph805',
    parentPassword: '123456',
    skills: { algebra: 70, geometry: 68, statistics: 75, speed: 74 },
    recentResults: [],
    teacherNotes: 'Cần chú ý dấu ngoặc khi nhân đơn thức với đa thức.'
  },
  {
    id: 'hs-06',
    name: 'Đặng Ngọc Linh',
    classId: 'class-7b2',
    avatar: '👩‍🏫',
    totalPoints: 1040,
    streakCount: 5,
    gamesPlayed: 11,
    accuracyRate: 90,
    studentCode: 'HS701',
    parentCode: 'PH701',
    username: 'hs701',
    password: '123456',
    parentUsername: 'ph701',
    parentPassword: '123456',
    skills: { algebra: 92, geometry: 88, statistics: 89, speed: 90 },
    recentResults: [],
    teacherNotes: 'Thuộc kỹ các tính chất tỉ lệ thức và dãy tỉ số bằng nhau.'
  },
  {
    id: 'hs-07',
    name: 'Hoàng Quốc Việt',
    classId: 'class-7b2',
    avatar: '👨‍🎓',
    totalPoints: 830,
    streakCount: 3,
    gamesPlayed: 9,
    accuracyRate: 80,
    studentCode: 'HS702',
    parentCode: 'PH702',
    username: 'hs702',
    password: '123456',
    parentUsername: 'ph702',
    parentPassword: '123456',
    skills: { algebra: 82, geometry: 79, statistics: 80, speed: 78 },
    recentResults: [],
    teacherNotes: 'Nắm chắc kiến thức số hữu tỉ.'
  },
  {
    id: 'hs-08',
    name: 'Ngô Thu Trang',
    classId: 'class-6a1',
    avatar: '👧',
    totalPoints: 920,
    streakCount: 4,
    gamesPlayed: 10,
    accuracyRate: 86,
    studentCode: 'HS601',
    parentCode: 'PH601',
    username: 'hs601',
    password: '123456',
    parentUsername: 'ph601',
    parentPassword: '123456',
    skills: { algebra: 88, geometry: 82, statistics: 85, speed: 88 },
    recentResults: [],
    teacherNotes: 'Làm tốt phép tính cộng trừ số nguyên âm và phân số.'
  },
  {
    id: 'hs-09',
    name: 'Bùi Tuấn Kiệt',
    classId: 'class-9c1',
    avatar: '🧑‍🎓',
    totalPoints: 1380,
    streakCount: 7,
    gamesPlayed: 16,
    accuracyRate: 94,
    studentCode: 'HS901',
    parentCode: 'PH901',
    username: 'hs901',
    password: '123456',
    parentUsername: 'ph901',
    parentPassword: '123456',
    skills: { algebra: 96, geometry: 95, statistics: 92, speed: 92 },
    recentResults: [],
    teacherNotes: 'Giải phương trình bậc hai và hệ thức Vi-ét rất xuất sắc.'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- TOÁN 6 ---
  {
    id: 'q-6-01',
    grade: 'Toán 6',
    category: 'Số học & Đại số',
    difficulty: 'Nhận biết',
    prompt: 'Kết quả của phép tính (-15) + (-25) là bao nhiêu?',
    options: ['-40', '40', '-10', '10'],
    correctAnswer: 0,
    explanation: 'Tổng của hai số nguyên âm là một số nguyên âm: (-15) + (-25) = -(15 + 25) = -40.',
    hint: 'Cộng phần số tự nhiên rồi đặt dấu trừ trước kết quả.',
    timeLimitSeconds: 20
  },
  {
    id: 'q-6-02',
    grade: 'Toán 6',
    category: 'Số học & Đại số',
    difficulty: 'Thông hiểu',
    prompt: 'Ước chung lớn nhất của 24 và 36 là bao nhiêu?',
    options: ['6', '8', '12', '72'],
    correctAnswer: 2,
    explanation: '24 = 2³ × 3; 36 = 2² × 3². ƯCLN(24, 36) = 2² × 3 = 12.',
    hint: 'Phân tích ra thừa số nguyên tố và lấy thừa số chung với số mũ nhỏ nhất.',
    timeLimitSeconds: 25
  },
  {
    id: 'q-6-03',
    grade: 'Toán 6',
    category: 'Hình học & Đo lường',
    difficulty: 'Nhận biết',
    prompt: 'Hình nào sau đây có tâm đối xứng?',
    options: ['Tam giác đều', 'Hình chữ nhật', 'Hình thang cân', 'Tam giác vuông'],
    correctAnswer: 1,
    explanation: 'Hình chữ nhật có tâm đối xứng chính là giao điểm của hai đường chéo.',
    hint: 'Điểm giao nhau của hai đường chéo là tâm quay 180 độ.',
    timeLimitSeconds: 20
  },
  {
    id: 'q-6-04',
    grade: 'Toán 6',
    category: 'Số học & Đại số',
    difficulty: 'Vận dụng',
    prompt: 'Tìm x biết: 2x - 17 = -5',
    options: ['x = 6', 'x = 11', 'x = -11', 'x = -6'],
    correctAnswer: 0,
    explanation: '2x = -5 + 17 => 2x = 12 => x = 12 : 2 = 6.',
    hint: 'Chuyển vế -17 sang vế phải đổi dấu thành +17.',
    timeLimitSeconds: 30
  },

  // --- TOÁN 7 ---
  {
    id: 'q-7-01',
    grade: 'Toán 7',
    category: 'Số học & Đại số',
    difficulty: 'Nhận biết',
    prompt: 'Số nào sau đây là số vô tỉ?',
    options: ['0.75', '√9', '√5', '-3/4'],
    correctAnswer: 2,
    explanation: '√5 là số thập phân vô hạn không tuần hoàn, do đó là số vô tỉ. Còn √9 = 3 là số hữu tỉ.',
    hint: 'Căn bậc hai số học của một số không phải số chính phương là số vô tỉ.',
    timeLimitSeconds: 20
  },
  {
    id: 'q-7-02',
    grade: 'Toán 7',
    category: 'Hình học & Đo lường',
    difficulty: 'Thông hiểu',
    prompt: 'Tổng ba góc trong một tam giác bất kỳ luôn bằng bao nhiêu độ?',
    options: ['90°', '180°', '360°', '270°'],
    correctAnswer: 1,
    explanation: 'Theo định lý tổng ba góc của một tam giác: A + B + C = 180°.',
    hint: 'Bằng góc bẹt (nửa vòng tròn).',
    timeLimitSeconds: 15
  },
  {
    id: 'q-7-03',
    grade: 'Toán 7',
    category: 'Số học & Đại số',
    difficulty: 'Thông hiểu',
    prompt: 'Nếu x / 4 = 9 / 12 thì x bằng bao nhiêu?',
    options: ['3', '6', '2', '4'],
    correctAnswer: 0,
    explanation: 'Ta có 12x = 4 × 9 = 36 => x = 36 / 12 = 3.',
    hint: 'Nhân chéo: x = (4 × 9) / 12.',
    timeLimitSeconds: 25
  },
  {
    id: 'q-7-04',
    grade: 'Toán 7',
    category: 'Thống kê & Xác suất',
    difficulty: 'Vận dụng',
    prompt: 'Gieo một con xúc xắc 6 mặt cân đối. Xác suất xuất hiện mặt có số chấm chia hết cho 3 là:',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctAnswer: 1,
    explanation: 'Các mặt chia hết cho 3 là {3; 6} (2 kết quả). Tổng số kết quả có thể xảy ra là 6. Xác suất = 2/6 = 1/3.',
    hint: 'Tìm số chấm trên xúc xắc chia hết cho 3 rồi chia cho 6.',
    timeLimitSeconds: 25
  },

  // --- TOÁN 8 ---
  {
    id: 'q-8-01',
    grade: 'Toán 8',
    category: 'Số học & Đại số',
    difficulty: 'Nhận biết',
    prompt: 'Khai triển hằng đẳng thức (a - b)² ta được kết quả là:',
    options: ['a² - b²', 'a² - 2ab + b²', 'a² + 2ab + b²', 'a² - ab + b²'],
    correctAnswer: 1,
    explanation: 'Bình phương của một hiệu: (a - b)² = a² - 2ab + b².',
    hint: 'Bình phương số thứ nhất trừ hai lần tích cộng bình phương số thứ hai.',
    timeLimitSeconds: 20
  },
  {
    id: 'q-8-02',
    grade: 'Toán 8',
    category: 'Hình học & Đo lường',
    difficulty: 'Thông hiểu',
    prompt: 'Một tam giác vuông có hai cạnh góc vuông lần lượt là 6 cm và 8 cm. Độ dài cạnh huyền là:',
    options: ['14 cm', '10 cm', '12 cm', '48 cm'],
    correctAnswer: 1,
    explanation: 'Áp dụng định lý Pytago: c² = a² + b² = 6² + 8² = 36 + 64 = 100 => c = √100 = 10 cm.',
    hint: 'Bộ ba số Pytago cơ bản: 6 - 8 - 10 (gấp đôi bộ 3 - 4 - 5).',
    timeLimitSeconds: 25
  },
  {
    id: 'q-8-03',
    grade: 'Toán 8',
    category: 'Số học & Đại số',
    difficulty: 'Thông hiểu',
    prompt: 'Phân tích đa thức x² - 9 thành nhân tử:',
    options: ['(x - 3)²', '(x + 3)²', '(x - 3)(x + 3)', '(x - 9)(x + 1)'],
    correctAnswer: 2,
    explanation: 'Hiệu hai bình phương: x² - 9 = x² - 3² = (x - 3)(x + 3).',
    hint: 'Dạng a² - b² = (a - b)(a + b).',
    timeLimitSeconds: 20
  },
  {
    id: 'q-8-04',
    grade: 'Toán 8',
    category: 'Hình học & Đo lường',
    difficulty: 'Vận dụng',
    prompt: 'Tứ giác có hai đường chéo vuông góc với nhau tại trung điểm của mỗi đường là hình gì?',
    options: ['Hình chữ nhật', 'Hình bình hành', 'Hình thoi', 'Hình thang cân'],
    correctAnswer: 2,
    explanation: 'Tứ giác có hai đường chéo cắt nhau tại trung điểm là hình bình hành; hình bình hành có hai đường chéo vuông góc là hình thoi.',
    hint: 'Hai đường chéo vừa cắt nhau tại trung điểm vừa vuông góc.',
    timeLimitSeconds: 25
  },

  // --- TOÁN 9 ---
  {
    id: 'q-9-01',
    grade: 'Toán 9',
    category: 'Số học & Đại số',
    difficulty: 'Nhận biết',
    prompt: 'Biểu thức √(2x - 4) xác định khi và chỉ khi:',
    options: ['x > 2', 'x ≥ 2', 'x ≤ 2', 'x ≠ 2'],
    correctAnswer: 1,
    explanation: 'Căn bậc hai √A xác định khi A ≥ 0 => 2x - 4 ≥ 0 => 2x ≥ 4 => x ≥ 2.',
    hint: 'Biểu thức dưới dấu căn phải không âm.',
    timeLimitSeconds: 20
  },
  {
    id: 'q-9-02',
    grade: 'Toán 9',
    category: 'Số học & Đại số',
    difficulty: 'Thông hiểu',
    prompt: 'Hàm số bậc nhất y = (m - 3)x + 5 đồng biến trên R khi:',
    options: ['m > 3', 'm < 3', 'm ≥ 3', 'm ≠ 3'],
    correctAnswer: 0,
    explanation: 'Hàm số bậc nhất y = ax + b đồng biến khi a > 0 => m - 3 > 0 => m > 3.',
    hint: 'Hệ số a của biến x phải lớn hơn 0.',
    timeLimitSeconds: 20
  },
  {
    id: 'q-9-03',
    grade: 'Toán 9',
    category: 'Hình học & Đo lường',
    difficulty: 'Thông hiểu',
    prompt: 'Góc nội tiếp chắn nửa đường tròn là góc:',
    options: ['Góc nhọn', 'Góc tù', 'Góc vuông (90°)', 'Góc bẹt (180°)'],
    correctAnswer: 2,
    explanation: 'Định lý: Góc nội tiếp chắn nửa đường tròn luôn là góc vuông (số đo bằng 1/2 số đo cung bị chắn 180° = 90°).',
    hint: 'Số đo góc nội tiếp bằng nửa số đo cung bị chắn (nửa đường tròn là 180°).',
    timeLimitSeconds: 20
  },
  {
    id: 'q-9-04',
    grade: 'Toán 9',
    category: 'Số học & Đại số',
    difficulty: 'Vận dụng',
    questionType: 'multiple_choice',
    prompt: 'Nghiệm của hệ phương trình: { x + y = 5 ; 2x - y = 4 } là:',
    options: ['(x=3; y=2)', '(x=2; y=3)', '(x=4; y=1)', '(x=1; y=4)'],
    correctAnswer: 0,
    explanation: 'Cộng vế với vế: (x + y) + (2x - y) = 5 + 4 => 3x = 9 => x = 3. Thay vào: 3 + y = 5 => y = 2.',
    hint: 'Dùng phương pháp cộng đại số để triệt tiêu biến y.',
    timeLimitSeconds: 30
  },
  {
    id: 'q-8-essay-01',
    grade: 'Toán 8',
    category: 'Số học & Đại số',
    difficulty: 'Vận dụng',
    questionType: 'essay',
    prompt: 'Bài tự luận: Giải phương trình sau và trình bày chi tiết từng bước vào giấy rồi chụp ảnh tải lên: (2x - 3)/4 - (x + 1)/3 = 1/2',
    options: [],
    correctAnswer: -1,
    explanation: 'Quy đồng mẫu chung 12: 3(2x - 3) - 4(x + 1) = 6 ⇔ 6x - 9 - 4x - 4 = 6 ⇔ 2x - 13 = 6 ⇔ 2x = 19 ⇔ x = 19/2.',
    hint: 'Nhân cả hai vế với mẫu thức chung BCNN(4, 3, 2) = 12 để khử mẫu.',
    timeLimitSeconds: 180
  },
  {
    id: 'q-9-essay-01',
    grade: 'Toán 9',
    category: 'Hình học & Đo lường',
    difficulty: 'Vận dụng cao',
    questionType: 'essay',
    prompt: 'Bài tự luận: Cho tam giác ABC vuông tại A, đường cao AH. Biết AB = 6cm, AC = 8cm. Tính độ dài cạnh huyền BC, đường cao AH và hình chiếu BH, CH.',
    options: [],
    correctAnswer: -1,
    explanation: 'Áp dụng định lý Pytago: BC = √(6² + 8²) = 10cm. Hệ thức lượng: AH·BC = AB·AC ⇒ AH = (6·8)/10 = 4,8cm. BH = AB²/BC = 36/10 = 3,6cm; CH = BC - BH = 6,4cm.',
    hint: 'Dùng định lý Pytago tính BC, sau đó dùng công thức AB·AC = AH·BC và AB² = BH·BC.',
    timeLimitSeconds: 240
  }
];

export const FORMULA_CARDS: FormulaCard[] = [
  { id: 'f-1a', title: 'Hằng đẳng thức số 1', content: '(a + b)²', type: 'concept', matchId: 'm1', category: 'Đại số 8' },
  { id: 'f-1b', title: 'Khai triển', content: 'a² + 2ab + b²', type: 'formula', matchId: 'm1', category: 'Đại số 8' },
  
  { id: 'f-2a', title: 'Hiệu hai bình phương', content: 'a² - b²', type: 'concept', matchId: 'm2', category: 'Đại số 8' },
  { id: 'f-2b', title: 'Khai triển', content: '(a - b)(a + b)', type: 'formula', matchId: 'm2', category: 'Đại số 8' },

  { id: 'f-3a', title: 'Định lý Pytago', content: 'Tam giác vuông cạnh a, b, huyền c', type: 'concept', matchId: 'm3', category: 'Hình học 8' },
  { id: 'f-3b', title: 'Hệ thức', content: 'c² = a² + b²', type: 'formula', matchId: 'm3', category: 'Hình học 8' },

  { id: 'f-4a', title: 'Diện tích hình tròn', content: 'Hình tròn bán kính R', type: 'concept', matchId: 'm4', category: 'Hình học 9' },
  { id: 'f-4b', title: 'Công thức diện tích', content: 'S = π × R²', type: 'formula', matchId: 'm4', category: 'Hình học 9' },

  { id: 'f-5a', title: 'Định lý Vi-ét (Tổng)', content: 'Phương trình ax² + bx + c = 0', type: 'concept', matchId: 'm5', category: 'Đại số 9' },
  { id: 'f-5b', title: 'Tổng hai nghiệm', content: 'x₁ + x₂ = -b / a', type: 'formula', matchId: 'm5', category: 'Đại số 9' },

  { id: 'f-6a', title: 'Diện tích tam giác', content: 'Đáy a, chiều cao tương ứng h', type: 'concept', matchId: 'm6', category: 'Hình học 7' },
  { id: 'f-6b', title: 'Công thức diện tích', content: 'S = (1/2) × a × h', type: 'formula', matchId: 'm6', category: 'Hình học 7' },
];

export const INITIAL_MOCK_EXAMS: MockExam[] = [
  {
    id: 'exam-8-inclusive-gk1',
    title: 'Đề Thi Thử Giữa Kì 1 - Toán 8 (Chương Trình Hòa Nhập)',
    termType: 'giua_ki_1',
    grade: 'Toán 8',
    durationMinutes: 45,
    timeMultiplier: 1.5,
    year: '2024 - 2025',
    targetAudience: 'inclusive',
    isInclusiveAdapted: true,
    accommodations: ['Thêm 50% thời gian (68 phút)', 'Cỡ chữ phóng to', 'Xem gợi ý từng bước', 'Giảm tải câu hỏi phức tạp'],
    description: 'Đề thi trắc nghiệm được tinh gọn và điều chỉnh theo Thông tư 03/2018/BGDĐT, tập trung nhận biết và thông hiểu, có kèm gợi ý phương pháp giải.',
    questions: [
      {
        id: 'ex-inc-801-1',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Trong các biểu thức sau, đâu là đơn thức nhiều biến?',
        options: ['3x²y', 'x + y', '2x - 3y', 'x / (y + 1)'],
        correctAnswer: 0,
        explanation: 'Đơn thức là biểu thức đại số chỉ gồm một số, một biến hoặc tích giữa các số và các biến. 3x²y là đơn thức.',
        hint: 'Đơn thức không chứa phép tính cộng (+) hoặc trừ (-).',
        timeLimitSeconds: 90
      },
      {
        id: 'ex-inc-801-2',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Khai triển hằng đẳng thức bình phương của một tổng (a + b)² bằng:',
        options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² - b²'],
        correctAnswer: 0,
        explanation: 'Hằng đẳng thức số 1: (a + b)² = a² + 2ab + b².',
        hint: 'Bình phương số thứ nhất + 2 lần tích hai số + bình phương số thứ hai.',
        timeLimitSeconds: 90
      },
      {
        id: 'ex-inc-801-3',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Nhận biết',
        prompt: 'Tổng số đo 4 góc trong một tứ giác lồi luôn bằng bao nhiêu độ?',
        options: ['360°', '180°', '90°', '720°'],
        correctAnswer: 0,
        explanation: 'Định lý: Tổng bốn góc của một tứ giác luôn bằng 360°.',
        hint: 'Một tam giác có tổng 3 góc bằng 180°, tứ giác ghép từ 2 tam giác nên bằng 360°.',
        timeLimitSeconds: 90
      },
      {
        id: 'ex-inc-801-4',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Thông hiểu',
        prompt: 'Hình bình hành có hai đường chéo vuông góc với nhau là hình gì?',
        options: ['Hình thoi', 'Hình chữ nhật', 'Hình thang cân', 'Hình tam giác'],
        correctAnswer: 0,
        explanation: 'Dấu hiệu nhận biết: Hình bình hành có hai đường chéo vuông góc là hình thoi.',
        hint: 'Hình này có 4 cạnh bằng nhau và 2 đường chéo vuông góc tại trung điểm.',
        timeLimitSeconds: 90
      }
    ]
  },
  {
    id: 'exam-8-gk1',
    title: 'Đề Thi Thử Giữa Kì 1 - Toán 8 (Mã Đề 801 - Chuẩn GDPT)',
    termType: 'giua_ki_1',
    grade: 'Toán 8',
    durationMinutes: 45,
    year: '2024 - 2025',
    targetAudience: 'standard',
    isInclusiveAdapted: false,
    description: 'Bao quát kiến thức Đa thức, 7 Hằng đẳng thức đáng nhớ, Phân tích đa thức và Tứ giác (Hình thang, Hình bình hành).',
    questions: [
      {
        id: 'ex-801-1',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Đơn thức nào sau đây đồng dạng với đơn thức -3x²y?',
        options: ['2xy²', '5x²y', '-3x²y²', '4xy'],
        correctAnswer: 1,
        explanation: 'Hai đơn thức đồng dạng là hai đơn thức có hệ số khác 0 và có cùng phần biến (x²y).',
        timeLimitSeconds: 60
      },
      {
        id: 'ex-801-2',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Khai triển (x + 2y)² ta được kết quả:',
        options: ['x² + 4y²', 'x² + 4xy + 4y²', 'x² + 2xy + 4y²', 'x² + 4xy + 2y²'],
        correctAnswer: 1,
        explanation: '(x + 2y)² = x² + 2·x·(2y) + (2y)² = x² + 4xy + 4y².',
        timeLimitSeconds: 60
      },
      {
        id: 'ex-801-3',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Thông hiểu',
        prompt: 'Giá trị của biểu thức x² - 4x + 4 tại x = 102 là:',
        options: ['10000', '10404', '10200', '100'],
        correctAnswer: 0,
        explanation: 'Ta có x² - 4x + 4 = (x - 2)². Thay x = 102 vào: (102 - 2)² = 100² = 10000.',
        timeLimitSeconds: 90
      },
      {
        id: 'ex-801-4',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Nhận biết',
        prompt: 'Tổng số đo bốn góc trong một tứ giác lồi luôn bằng:',
        options: ['180°', '360°', '270°', '540°'],
        correctAnswer: 1,
        explanation: 'Định lý: Tổng các góc của một tứ giác luôn bằng 360°.',
        timeLimitSeconds: 45
      },
      {
        id: 'ex-801-5',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Thông hiểu',
        prompt: 'Hình thang cân là hình thang có:',
        options: ['Hai góc kề một cạnh đáy bằng nhau', 'Hai cạnh đáy bằng nhau', 'Hai góc đối bằng nhau', 'Hai cạnh bên vuông góc'],
        correctAnswer: 0,
        explanation: 'Định nghĩa: Hình thang cân là hình thang có hai góc kề một đáy bằng nhau (hoặc hai đường chéo bằng nhau).',
        timeLimitSeconds: 60
      },
      {
        id: 'ex-801-6',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Vận dụng',
        prompt: 'Phân tích đa thức x³ - 4x thành nhân tử:',
        options: ['x(x - 2)²', 'x(x - 2)(x + 2)', 'x(x² - 4x)', '(x - 2)(x + 2)'],
        correctAnswer: 1,
        explanation: 'x³ - 4x = x(x² - 4) = x(x - 2)(x + 2).',
        timeLimitSeconds: 90
      },
      {
        id: 'ex-801-7',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Vận dụng cao',
        prompt: 'Giá trị nhỏ nhất của biểu thức A = x² - 6x + 15 là:',
        options: ['6', '9', '15', '0'],
        correctAnswer: 0,
        explanation: 'A = (x² - 6x + 9) + 6 = (x - 3)² + 6 ≥ 6 với mọi x. Dấu "=" xảy ra khi x = 3. Vậy GTNN là 6.',
        timeLimitSeconds: 120
      }
    ]
  },
  {
    id: 'exam-8-ck1',
    title: 'Đề Thi Thử Cuối Kì 1 - Toán 8 (Mã Đề 802)',
    termType: 'cuoi_ki_1',
    grade: 'Toán 8',
    durationMinutes: 60,
    year: '2024 - 2025',
    description: 'Đề tổng hợp kì 1 gồm Phân thức đại số, Định lý Pytago, Tam giác đồng dạng và Thống kê số liệu.',
    questions: [
      {
        id: 'ex-802-1',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Điều kiện xác định của phân thức (2x + 1) / (x - 3) là:',
        options: ['x ≠ 3', 'x ≠ -3', 'x ≠ -1/2', 'x > 3'],
        correctAnswer: 0,
        explanation: 'Mẫu thức phải khác 0: x - 3 ≠ 0 <=> x ≠ 3.',
        timeLimitSeconds: 60
      },
      {
        id: 'ex-802-2',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Thông hiểu',
        prompt: 'Cho tam giác ABC vuông tại A có AB = 9cm, AC = 12cm. Độ dài đường cao AH là:',
        options: ['7.2 cm', '6.8 cm', '7.5 cm', '8 cm'],
        correctAnswer: 0,
        explanation: 'Cạnh huyền BC = √(9² + 12²) = 15 cm. Diện tích S = (1/2)AB·AC = (1/2)AH·BC => AH = (9 × 12) / 15 = 7.2 cm.',
        timeLimitSeconds: 90
      },
      {
        id: 'ex-802-3',
        grade: 'Toán 8',
        category: 'Thống kê & Xác suất',
        difficulty: 'Thông hiểu',
        prompt: 'Để biểu diễn tỉ lệ phần trăm các loại học lực của học sinh toàn khối, biểu đồ thích hợp nhất là:',
        options: ['Biểu đồ tranh', 'Biểu đồ hình quạt tròn', 'Biểu đồ đoạn thẳng', 'Biểu đồ cột kép'],
        correctAnswer: 1,
        explanation: 'Biểu đồ hình quạt tròn (pie chart) là biểu đồ tối ưu nhất để biểu diễn phần trăm từng thành phần so với tổng thể 100%.',
        timeLimitSeconds: 60
      }
    ]
  },
  {
    id: 'exam-9-ck1',
    title: 'Đề Thi Thử Cuối Kì 1 - Toán 9 (Mã Đề 901)',
    termType: 'cuoi_ki_1',
    grade: 'Toán 9',
    durationMinutes: 90,
    year: '2024 - 2025',
    description: 'Đề chuẩn ôn luyện tuyển sinh 10: Căn thức bậc hai, Hàm số bậc nhất, Hệ thức lượng và Đường tròn.',
    questions: [
      {
        id: 'ex-901-1',
        grade: 'Toán 9',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Căn bậc hai số học của 81 là:',
        options: ['9', '-9', '±9', '81'],
        correctAnswer: 0,
        explanation: 'Căn bậc hai số học của một số dương a là số không âm √a. Do đó √81 = 9.',
        timeLimitSeconds: 45
      },
      {
        id: 'ex-901-2',
        grade: 'Toán 9',
        category: 'Số học & Đại số',
        difficulty: 'Thông hiểu',
        prompt: 'Đường thẳng y = 2x + 3 song song với đường thẳng nào sau đây?',
        options: ['y = 2x - 5', 'y = -2x + 3', 'y = 3x + 2', 'y = (1/2)x + 3'],
        correctAnswer: 0,
        explanation: 'Hai đường thẳng y = ax + b và y = a\'x + b\' song song khi a = a\' và b ≠ b\'. Ở đây a = a\' = 2 và 3 ≠ -5.',
        timeLimitSeconds: 60
      },
      {
        id: 'ex-901-3',
        grade: 'Toán 9',
        category: 'Hình học & Đo lường',
        difficulty: 'Thông hiểu',
        prompt: 'Nếu khoảng cách từ tâm O đến đường thẳng d bằng bán kính R thì đường thẳng d và đường tròn (O; R):',
        options: ['Cắt nhau tại 2 điểm', 'Tiếp xúc nhau (tiếp tuyến)', 'Không giao nhau', 'Đi qua tâm'],
        correctAnswer: 1,
        explanation: 'Khi d = R, đường thẳng tiếp xúc với đường tròn tại đúng một điểm (gọi là tiếp tuyến).',
        timeLimitSeconds: 60
      }
    ]
  },
  {
    id: 'exam-7-gk1',
    title: 'Đề Thi Thử Giữa Kì 1 - Toán 7 (Mã Đề 701)',
    termType: 'giua_ki_1',
    grade: 'Toán 7',
    durationMinutes: 45,
    year: '2024 - 2025',
    description: 'Kiểm tra tập hợp số hữu tỉ, các phép tính luỹ thừa và hai góc đối đỉnh, tia phân giác.',
    questions: [
      {
        id: 'ex-701-1',
        grade: 'Toán 7',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Số đối của số hữu tỉ -4/7 là:',
        options: ['4/7', '-7/4', '7/4', '-4/7'],
        correctAnswer: 0,
        explanation: 'Số đối của số hữu tỉ a là -a. Do đó số đối của -4/7 là 4/7.',
        timeLimitSeconds: 45
      },
      {
        id: 'ex-701-2',
        grade: 'Toán 7',
        category: 'Hình học & Đo lường',
        difficulty: 'Nhận biết',
        prompt: 'Hai góc đối đỉnh thì:',
        options: ['Bằng nhau', 'Bù nhau', 'Kề nhau', 'Phụ nhau'],
        correctAnswer: 0,
        explanation: 'Tính chất: Hai góc đối đỉnh thì bằng nhau.',
        timeLimitSeconds: 40
      }
    ]
  }
];

export const INITIAL_HOMEWORKS: HomeworkAssignment[] = [
  {
    id: 'hw-8a3-inclusive-w8',
    title: 'BTVN Tuần 8 (Hòa Nhập): Nhận Biết Hằng Đẳng Thức & Tứ Giác Cơ Bản',
    classId: 'class-8a3',
    grade: 'Toán 8',
    targetAudience: 'inclusive',
    isInclusiveAdapted: true,
    inclusiveNotes: 'Bài tập giảm tải theo KHGD cá nhân: 2 câu nhận biết then chốt, có kèm gợi ý chi tiết.',
    description: 'Rèn luyện củng cố nhận biết dạng hằng đẳng thức hiệu hai bình phương và tính chất cơ bản của hình vuông.',
    assignedDate: '2025-05-08',
    dueDate: '2025-05-16 21:00',
    questions: [
      {
        id: 'hw-inc-q1',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Nhận biết',
        prompt: 'Công thức hằng đẳng thức hiệu hai bình phương a² - b² là:',
        options: ['(a - b)(a + b)', '(a - b)²', '(a + b)²', 'a² - 2ab + b²'],
        correctAnswer: 0,
        explanation: 'a² - b² = (a - b)(a + b).',
        hint: 'Hiệu hai bình phương bằng tích của hiệu và tổng.',
        timeLimitSeconds: 90
      },
      {
        id: 'hw-inc-q2',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Nhận biết',
        prompt: 'Tứ giác có 4 cạnh bằng nhau và 4 góc vuông là hình gì?',
        options: ['Hình vuông', 'Hình thoi', 'Hình chữ nhật', 'Hình bình hành'],
        correctAnswer: 0,
        explanation: 'Hình vuông vừa có 4 cạnh bằng nhau (hình thoi) vừa có 4 góc vuông (hình chữ nhật).',
        hint: 'Hình này là hình đặc biệt nhất trong các tứ giác, có 4 góc 90° và 4 cạnh đều bằng nhau.',
        timeLimitSeconds: 90
      }
    ]
  },
  {
    id: 'hw-8a3-w8',
    title: 'BTVN Tuần 8: 7 Hằng Đẳng Thức Đáng Nhớ & Tứ Giác (Chuẩn GDPT)',
    classId: 'class-8a3',
    grade: 'Toán 8',
    targetAudience: 'standard',
    isInclusiveAdapted: false,
    description: 'Các em hoàn thành 4 bài tập trắc nghiệm và điền kết quả trước 21h00 Chủ Nhật để giáo viên tổng kết.',
    assignedDate: '2025-05-08',
    dueDate: '2025-05-15 21:00',
    questions: [
      {
        id: 'hw-q1',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Thông hiểu',
        prompt: 'Rút gọn biểu thức (x + 3)² - (x - 3)² ta được:',
        options: ['12x', '6x', '18', '2x² + 18'],
        correctAnswer: 0,
        explanation: 'Áp dụng a² - b² = (a - b)(a + b) = [(x + 3) - (x - 3)][(x + 3) + (x - 3)] = 6 × 2x = 12x.',
        timeLimitSeconds: 90
      },
      {
        id: 'hw-q2',
        grade: 'Toán 8',
        category: 'Số học & Đại số',
        difficulty: 'Vận dụng',
        prompt: 'Tìm x biết: (x - 2)² - x(x - 1) = 0',
        options: ['x = 4/3', 'x = 4', 'x = -4/3', 'x = 2'],
        correctAnswer: 0,
        explanation: 'x² - 4x + 4 - x² + x = 0 <=> -3x + 4 = 0 <=> 3x = 4 <=> x = 4/3.',
        timeLimitSeconds: 120
      },
      {
        id: 'hw-q3',
        grade: 'Toán 8',
        category: 'Hình học & Đo lường',
        difficulty: 'Thông hiểu',
        prompt: 'Một hình thoi có độ dài hai đường chéo là 12cm và 16cm. Độ dài cạnh của hình thoi là:',
        options: ['10 cm', '14 cm', '20 cm', '9.6 cm'],
        correctAnswer: 0,
        explanation: 'Hai đường chéo hình thoi vuông góc và cắt nhau tại trung điểm. Nửa độ dài 2 đường chéo là 6cm và 8cm. Cạnh = √(6² + 8²) = 10 cm.',
        timeLimitSeconds: 90
      }
    ]
  },
  {
    id: 'hw-7b2-w7',
    title: 'BTVN Tuần 7: Tỉ Lệ Thức & Dãy Tỉ Số Bằng Nhau',
    classId: 'class-7b2',
    grade: 'Toán 7',
    targetAudience: 'standard',
    isInclusiveAdapted: false,
    description: 'Ôn tập tính chất của tỉ lệ thức và áp dụng tìm hai số x, y khi biết tổng và tỉ số.',
    assignedDate: '2025-05-09',
    dueDate: '2025-05-16 21:00',
    questions: [
      {
        id: 'hw-7-1',
        grade: 'Toán 7',
        category: 'Số học & Đại số',
        difficulty: 'Thông hiểu',
        prompt: 'Tìm x biết: x / (-3) = 8 / 12',
        options: ['x = -2', 'x = 2', 'x = -3', 'x = -4'],
        correctAnswer: 0,
        explanation: 'x = (-3 × 8) / 12 = -24 / 12 = -2.',
        timeLimitSeconds: 60
      }
    ]
  }
];

export const INITIAL_HOMEWORK_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'sub-01',
    homeworkId: 'hw-8a3-w8',
    studentId: 'hs-01',
    studentName: 'Nguyễn Minh Quân',
    answers: { 0: 0, 1: 0, 2: 0 },
    score: 10,
    correctCount: 3,
    totalQuestions: 3,
    timeSpentSeconds: 140,
    submittedAt: '2025-05-10 19:30',
    status: 'submitted',
    teacherFeedback: 'Làm bài xuất sắc, trình bày logic và nộp rất đúng hạn!'
  },
  {
    id: 'sub-02',
    homeworkId: 'hw-8a3-w8',
    studentId: 'hs-02',
    studentName: 'Trần Thị Mai Anh',
    answers: { 0: 0, 1: 0, 2: 0 },
    score: 10,
    correctCount: 3,
    totalQuestions: 3,
    timeSpentSeconds: 185,
    submittedAt: '2025-05-11 20:15',
    status: 'submitted',
    teacherFeedback: 'Bài làm rất tốt, nắm vững công thức hình thoi.'
  },
  {
    id: 'sub-03',
    homeworkId: 'hw-8a3-w8',
    studentId: 'hs-03',
    studentName: 'Lê Hoàng Nam',
    answers: { 0: 0, 1: 1, 2: 0 },
    score: 6.7,
    correctCount: 2,
    totalQuestions: 3,
    timeSpentSeconds: 210,
    submittedAt: '2025-05-12 16:40',
    status: 'submitted',
    teacherFeedback: 'Em cần chú ý chuyển vế đổi dấu ở câu 2 nhé.'
  }
];

export const INITIAL_PARENT_FEEDBACKS: ParentFeedback[] = [
  {
    id: 'pf-01',
    studentId: 'hs-01',
    studentName: 'Nguyễn Minh Quân',
    parentName: 'Nguyễn Văn Hùng (Bố)',
    parentPhone: '0912.345.678',
    content: 'Cảm ơn Thầy/Cô đã tạo trang web rất trực quan, cháu Quân ở nhà hào hứng làm bài tập và chơi thi đua hơn hẳn!',
    createdAt: '2025-05-11 21:00',
    seenByTeacher: true
  }
];

export const INITIAL_GRADEBOOK: StudentGradeRecord[] = [
  {
    studentId: 'hs-01',
    semester: 'hk1',
    regularScores: [9, 9.5, 8.5, 10, 9],
    midtermScore: 9,
    finalScore: 9.5,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-02',
    semester: 'hk1',
    regularScores: [8.5, 9, 8, 9, null],
    midtermScore: 8.5,
    finalScore: 9,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-03',
    semester: 'hk1',
    regularScores: [7, 7.5, 8, null, null],
    midtermScore: 7.5,
    finalScore: 8,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-04',
    semester: 'hk1',
    regularScores: [8, 8.5, 7.5, 8, null],
    midtermScore: 8,
    finalScore: 8.5,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-05',
    semester: 'hk1',
    regularScores: [6, 8, 9, 1, null],
    midtermScore: 7,
    finalScore: 8,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-06',
    semester: 'hk1',
    regularScores: [9, 8.5, 9.5, 9, null],
    midtermScore: 9,
    finalScore: 9,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-07',
    semester: 'hk1',
    regularScores: [7.5, 8, 7, 8, null],
    midtermScore: 7.5,
    finalScore: 8,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-08',
    semester: 'hk1',
    regularScores: [8.5, 8, 9, 8.5, null],
    midtermScore: 8.5,
    finalScore: 8.5,
    updatedAt: '2025-05-12 08:00'
  },
  {
    studentId: 'hs-09',
    semester: 'hk1',
    regularScores: [9.5, 9, 10, 9.5, 9.5],
    midtermScore: 9.5,
    finalScore: 9.5,
    updatedAt: '2025-05-12 08:00'
  }
];
