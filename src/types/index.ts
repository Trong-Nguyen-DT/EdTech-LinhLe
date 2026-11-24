export type GradeLevel = 'Toán 6' | 'Toán 7' | 'Toán 8' | 'Toán 9';

export type MathCategory = 
  | 'Số học & Đại số' 
  | 'Hình học & Đo lường' 
  | 'Thống kê & Xác suất' 
  | 'Tính nhanh & Tư duy logic';

export type DifficultyLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type QuestionType = 'multiple_choice' | 'essay';

export interface EssayAnswerUpload {
  imageDataUrl: string;
  fileName?: string;
  uploadedAt?: string;
  note?: string;
}

export interface Question {
  id: string;
  grade: GradeLevel;
  category: MathCategory;
  difficulty: DifficultyLevel;
  questionType?: QuestionType; // 'multiple_choice' (mặc định) | 'essay' (tự luận trả lời bằng upload ảnh)
  prompt: string;
  options: string[]; // 4 phương án nếu trắc nghiệm; [] nếu tự luận
  correctAnswer: number; // 0-based index (0..3) cho trắc nghiệm; -1 cho tự luận
  explanation: string;
  hint?: string;
  timeLimitSeconds?: number;
}

export interface StudentPersonalProfile {
  dateOfBirth?: string;
  cccdNumber?: string;
  address?: string;
  placeOfBirth?: string;
  healthStatus?: string;
  weightKg?: string;
  heightCm?: string;
  hobbies?: string;
  notes?: string;
}

export interface StudentParentInfo {
  id: string;
  relationship: string;
  fullName: string;
  address: string;
  phone: string;
  cccdNumber: string;
  ptaRole: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  avatar: string;
  totalPoints: number;
  streakCount: number;
  gamesPlayed: number;
  accuracyRate: number; // 0 - 100
  skills: {
    algebra: number;    // 0 - 100
    geometry: number;   // 0 - 100
    statistics: number; // 0 - 100
    speed: number;      // 0 - 100
  };
  recentResults: GameHistoryItem[];
  teacherNotes?: string;
  personalInfo?: StudentPersonalProfile;
  parentInfos?: StudentParentInfo[];
  studentCode: string; // Mã học sinh bảo mật (VD: HS-801)
  parentCode: string;  // Mã phụ huynh bảo mật (VD: PH-801)
  username: string;    // Tên đăng nhập của học sinh
  password: string;    // Mật khẩu đăng nhập của học sinh
  parentUsername: string; // Tên đăng nhập của phụ huynh
  parentPassword: string; // Mật khẩu đăng nhập của phụ huynh
  isInclusive?: boolean; // Học sinh hòa nhập / khuyết tật
  inclusiveNotes?: string; // Ghi chú hòa nhập (KHGD cá nhân, dạng trợ giúp)
}

export type UserRole = 'student' | 'parent' | 'teacher';

export interface TeacherAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  subject: string;
}

export type TargetAudience = 'all' | 'standard' | 'inclusive';

export interface ClassGroup {
  id: string;
  name: string;
  grade: GradeLevel;
  academicYear: string;
  room?: string;
}

export interface GameHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  gameType: 'climb' | 'speed' | 'match' | 'team_arena' | 'exam' | 'homework';
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  accuracy: number;
  playedAt: string;
}

export interface TeamScore {
  id: string;
  name: string;
  color: string;
  score: number;
  members: string[]; // student names or IDs
  streak: number;
  lastAnswerTime?: number;
}

export interface FormulaCard {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'formula';
  matchId: string; // pairs share the same matchId
  category: string;
}

export interface StudentReportData {
  student: Student;
  classGroup: ClassGroup;
  term: string;
  schoolName: string;
  teacherName: string;
  evaluationDate: string;
  generalComment: string;
  actionPlan: string;
}

// --- MOCK EXAMS (Đề thi thử giữa kì & cuối kì) ---
export type ExamType = 'giua_ki_1' | 'cuoi_ki_1' | 'giua_ki_2' | 'cuoi_ki_2';

export interface MockExam {
  id: string;
  title: string;
  termType: ExamType;
  grade: GradeLevel;
  durationMinutes: number;
  questions: Question[];
  description: string;
  year: string;
  targetAudience?: TargetAudience; // 'all' | 'standard' | 'inclusive'
  isInclusiveAdapted?: boolean;     // Đề điều chỉnh giảm tải cho học sinh hòa nhập
  timeMultiplier?: number;          // Hệ số thời gian (mặc định 1.5x cho hòa nhập)
  accommodations?: string[];        // Các hỗ trợ trợ năng: ['Cỡ chữ lớn', 'Xem gợi ý từng bước', 'Thêm 50% thời gian']
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  answers: Record<number, number>; // question index -> chosen option
  essayAnswers?: Record<number, EssayAnswerUpload>; // question index -> uploaded image answer
  hasEssayQuestions?: boolean;
  essayReviewStatus?: 'pending' | 'graded';
  teacherEssayFeedback?: string;
  score: number; // 0 - 10 scale
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  submittedAt: string;
  isInclusiveSubmission?: boolean;
}

// --- HOMEWORK (Bài tập về nhà) ---
export interface HomeworkAssignment {
  id: string;
  title: string;
  classId: string;
  grade: GradeLevel;
  description: string;
  assignedDate: string;
  dueDate: string;
  questions: Question[];
  targetAudience?: TargetAudience; // 'all' | 'standard' | 'inclusive'
  isInclusiveAdapted?: boolean;
  inclusiveNotes?: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  answers: Record<number, number>;
  essayAnswers?: Record<number, EssayAnswerUpload>;
  hasEssayQuestions?: boolean;
  essayReviewStatus?: 'pending' | 'graded';
  score: number; // 0 - 10 scale
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  submittedAt: string;
  status: 'submitted' | 'late';
  teacherFeedback?: string;
  isInclusiveSubmission?: boolean;
}

// --- PARENT FEEDBACK ---
export interface ParentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone?: string;
  content: string;
  createdAt: string;
  seenByTeacher: boolean;
}

// --- BẢN TIN CUỐI TUẦN & TOP 5 HỌC SINH XUẤT SẮC (WEEKEND HONORS) ---
export interface TopStudentAward {
  rank: number;
  studentId: string;
  studentName: string;
  className: string;
  avatar: string;
  weeklyPoints: number;
  streakCount: number;
  accuracyRate: number;
  highlightTitle: string; // VD: 'Bậc thầy Đại số', 'Tốc độ kỷ lục'
  isInclusive?: boolean;
}

export interface WeekendTopReport {
  id: string;
  weekTitle: string; // VD: 'Tuần 10 - Tháng 5/2025'
  generatedDate: string;
  topStudents: TopStudentAward[];
  inclusiveStar?: TopStudentAward; // Ngôi sao nỗ lực vượt khó (dành cho học sinh hòa nhập)
  teacherMessage: string;
  classId?: string; // Nếu lọc theo lớp hoặc 'all'
}

// --- KIẾN THỨC TRỌNG TÂM (CORE KNOWLEDGE BASE) ---
export interface GoldenFormula {
  title: string;
  formula: string;
  note?: string;
  highlight?: boolean;
}

export interface ProblemTypeMethod {
  name: string;
  method: string;
  example: {
    problem: string;
    solution: string;
    tips?: string;
  };
}

export interface CommonMistake {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface MiniQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface KnowledgeLesson {
  id: string;
  grade: GradeLevel;
  chapter: string;
  chapterNumber: number;
  lessonNumber: number;
  title: string;
  category: MathCategory;
  readingTimeMinutes: number;
  coreTheory: string[];
  goldenFormulas: GoldenFormula[];
  problemTypes: ProblemTypeMethod[];
  commonMistakes: CommonMistake[];
  miniQuiz: MiniQuizQuestion[];
  examRelevance?: string; // Ví dụ: 'Thường xuất hiện trong câu 1-2 đề thi giữa kì'
}

// --- THI ĐUA TỰ HỌC TẠI NHÀ (HOME STUDY COMPETITION) ---
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  icon: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  category: 'knowledge' | 'speed' | 'climb' | 'match' | 'quiz' | 'homework';
}

export interface DailyQuestState {
  date: string; // YYYY-MM-DD
  studentId: string;
  quests: DailyQuest[];
  claimedDailyChest: boolean;
  streakCount: number;
  totalXpEarnedToday: number;
}

export interface HomeStudyBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

// --- BẢNG ĐIỂM MÔN TOÁN (GRADEBOOK) ---
export type GradebookSemester = 'hk1' | 'hk2';

export interface StudentGradeRecord {
  studentId: string;
  semester: GradebookSemester;
  regularScores: (number | null)[]; // Kiểm tra thường xuyên - 5 lần (hệ số 1)
  midtermScore: number | null;       // Kiểm tra giữa kì - 1 lần (hệ số 2)
  finalScore: number | null;         // Kiểm tra cuối kì - 1 lần (hệ số 3)
  updatedAt?: string;
}
