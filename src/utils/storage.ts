import { 
  ClassGroup, 
  ExamSubmission, 
  GameHistoryItem, 
  HomeworkAssignment, 
  HomeworkSubmission, 
  MockExam, 
  ParentFeedback, 
  Question, 
  Student,
  DailyQuest,
  DailyQuestState,
  HomeStudyBadge,
  TopStudentAward,
  WeekendTopReport,
  UserRole,
  TeacherAccount,
  StudentGradeRecord,
  KnowledgeLesson
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_QUESTIONS, 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS,
  INITIAL_MOCK_EXAMS, 
  INITIAL_HOMEWORKS, 
  INITIAL_HOMEWORK_SUBMISSIONS, 
  INITIAL_PARENT_FEEDBACKS,
  INITIAL_GRADEBOOK
} from '../data/initialData';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { normalizeAcademicYear } from './academicYear';

const STORAGE_KEYS = {
  CLASSES: 'mathmaster_classes_v1',
  STUDENTS: 'mathmaster_students_v1',
  QUESTIONS: 'mathmaster_questions_v1',
  HISTORY: 'mathmaster_history_v1',
  TEACHER_PIN: 'mathmaster_teacher_pin_v1',
  CURRENT_USER_ROLE: 'mathmaster_current_role_v1',
  ACTIVE_STUDENT_ID: 'mathmaster_active_student_id_v1',
  MOCK_EXAMS: 'mathmaster_mock_exams_v1',
  EXAM_SUBMISSIONS: 'mathmaster_exam_submissions_v1',
  HOMEWORKS: 'mathmaster_homeworks_v1',
  HOMEWORK_SUBMISSIONS: 'mathmaster_hw_submissions_v1',
  PARENT_FEEDBACKS: 'mathmaster_parent_feedbacks_v1',
  LEARNED_LESSONS: 'mathmaster_learned_lessons_v1',
  DAILY_QUESTS: 'mathmaster_daily_quests_v1',
  STUDY_BADGES: 'mathmaster_study_badges_v1',
  WEEKEND_REPORTS: 'mathmaster_weekend_reports_v1',
  AUTH_SESSION: 'mathmaster_auth_session_v1',
  GRADEBOOK: 'mathmaster_gradebook_v1',
  KNOWLEDGE_LESSONS: 'mathmaster_knowledge_lessons_v1',
};

export interface AuthSession {
  role: UserRole;
  studentId?: string;
  username: string;
  displayName?: string;
  loggedInAt: string;
}

// Safe JSON parser
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading key "${key}":`, e);
    return fallback;
  }
}

export const Storage = {
  getClasses(): ClassGroup[] {
    const loaded = safeParse<ClassGroup[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    return loaded.map((c) => ({
      ...c,
      academicYear: normalizeAcademicYear(c.academicYear),
    }));
  },

  saveClasses(classes: ClassGroup[]): void {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  },

  getStudents(): Student[] {
    const loaded = safeParse<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    let migrated = false;
    const normalized = loaded.map((st, idx) => {
      if (st.username && st.password && st.parentUsername && st.parentPassword) return st;
      migrated = true;
      const fallbackMatch = INITIAL_STUDENTS.find(init => init.id === st.id);
      const defaultUsername = fallbackMatch?.username || (st.studentCode ? st.studentCode.toLowerCase() : `hs${idx + 1}`);
      const defaultPassword = fallbackMatch?.password || '123456';
      const defaultParentUsername = fallbackMatch?.parentUsername || (st.parentCode ? st.parentCode.toLowerCase() : `ph${idx + 1}`);
      const defaultParentPassword = fallbackMatch?.parentPassword || '123456';
      return {
        ...st,
        username: st.username || defaultUsername,
        password: st.password || defaultPassword,
        parentUsername: st.parentUsername || defaultParentUsername,
        parentPassword: st.parentPassword || defaultParentPassword,
      };
    });
    if (migrated) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(normalized));
    }
    return normalized;
  },

  getTeachers(): TeacherAccount[] {
    const pin = this.getTeacherPin();
    return INITIAL_TEACHERS.map(t => ({ ...t, password: pin || t.password }));
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getAuthSession(): AuthSession | null {
    const parsed = safeParse<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed.role !== 'student' && parsed.role !== 'parent' && parsed.role !== 'teacher')
    ) {
      return null;
    }
    return parsed;
  },

  setAuthSession(session: AuthSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  },

  clearAuthSession(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  getQuestions(): Question[] {
    const raw = safeParse<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    return raw.map(q => ({
      ...q,
      questionType: q.questionType === 'essay' ? 'essay' : 'multiple_choice',
      options: q.questionType === 'essay' ? [] : Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.questionType === 'essay' ? -1 : typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
    }));
  },

  saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getHistory(): GameHistoryItem[] {
    return safeParse<GameHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  },

  saveHistory(history: GameHistoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  getTeacherPin(): string {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || '1234';
  },

  setTeacherPin(newPin: string): void {
    localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, newPin);
  },

  getActiveStudentId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID) || null;
  },

  setActiveStudentId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
    }
  },

  // --- MOCK EXAMS ---
  getMockExams(): MockExam[] {
    return safeParse<MockExam[]>(STORAGE_KEYS.MOCK_EXAMS, INITIAL_MOCK_EXAMS);
  },

  saveMockExams(exams: MockExam[]): void {
    localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));
  },

  addMockExam(exam: MockExam): void {
    const list = this.getMockExams();
    list.unshift(exam);
    this.saveMockExams(list);
  },

  getExamSubmissions(): ExamSubmission[] {
    return safeParse<ExamSubmission[]>(STORAGE_KEYS.EXAM_SUBMISSIONS, []);
  },

  saveExamSubmissions(submissions: ExamSubmission[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAM_SUBMISSIONS, JSON.stringify(submissions));
  },

  recordExamSubmission(sub: ExamSubmission): void {
    const list = this.getExamSubmissions();
    list.unshift(sub);
    this.saveExamSubmissions(list);

    // Also update student total points and skill stats
    const students = this.getStudents();
    const st = students.find(s => s.id === sub.studentId);
    if (st) {
      st.totalPoints += Math.round(sub.score * 50);
      st.gamesPlayed += 1;
      st.accuracyRate = Math.round(
        (st.accuracyRate * (st.gamesPlayed - 1) + (sub.correctCount / sub.totalQuestions) * 100) / st.gamesPlayed
      );
      this.saveStudents(students);
    }
  },

  // --- HOMEWORK (BTVN) ---
  getHomeworks(): HomeworkAssignment[] {
    return safeParse<HomeworkAssignment[]>(STORAGE_KEYS.HOMEWORKS, INITIAL_HOMEWORKS);
  },

  saveHomeworks(homeworks: HomeworkAssignment[]): void {
    localStorage.setItem(STORAGE_KEYS.HOMEWORKS, JSON.stringify(homeworks));
  },

  addHomework(hw: HomeworkAssignment): void {
    const list = this.getHomeworks();
    list.unshift(hw);
    this.saveHomeworks(list);
  },

  getHomeworkSubmissions(): HomeworkSubmission[] {
    return safeParse<HomeworkSubmission[]>(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, INITIAL_HOMEWORK_SUBMISSIONS);
  },

  saveHomeworkSubmissions(submissions: HomeworkSubmission[]): void {
    localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(submissions));
  },

  recordHomeworkSubmission(sub: HomeworkSubmission): void {
    const list = this.getHomeworkSubmissions();
    // Replace if existing submission by this student for this homework
    const existingIndex = list.findIndex(s => s.homeworkId === sub.homeworkId && s.studentId === sub.studentId);
    if (existingIndex >= 0) {
      list[existingIndex] = sub;
    } else {
      list.unshift(sub);
    }
    this.saveHomeworkSubmissions(list);

    // Update student points & accuracy
    const students = this.getStudents();
    const st = students.find(s => s.id === sub.studentId);
    if (st) {
      st.totalPoints += Math.round(sub.score * 30);
      this.saveStudents(students);
    }
  },

  updateHomeworkSubmission(updatedSub: HomeworkSubmission): void {
    const list = this.getHomeworkSubmissions();
    const idx = list.findIndex(s => s.id === updatedSub.id);
    if (idx >= 0) {
      list[idx] = updatedSub;
    } else {
      list.unshift(updatedSub);
    }
    this.saveHomeworkSubmissions(list);
  },

  updateExamSubmission(updatedSub: ExamSubmission): void {
    const list = this.getExamSubmissions();
    const idx = list.findIndex(s => s.id === updatedSub.id);
    if (idx >= 0) {
      list[idx] = updatedSub;
    } else {
      list.unshift(updatedSub);
    }
    this.saveExamSubmissions(list);
  },

  // --- PARENT FEEDBACK ---
  getParentFeedbacks(): ParentFeedback[] {
    return safeParse<ParentFeedback[]>(STORAGE_KEYS.PARENT_FEEDBACKS, INITIAL_PARENT_FEEDBACKS);
  },

  saveParentFeedbacks(fbs: ParentFeedback[]): void {
    localStorage.setItem(STORAGE_KEYS.PARENT_FEEDBACKS, JSON.stringify(fbs));
  },

  addParentFeedback(fb: ParentFeedback): void {
    const list = this.getParentFeedbacks();
    list.unshift(fb);
    this.saveParentFeedbacks(list);
  },

  recordGameResult(
    studentId: string,
    gameType: 'climb' | 'speed' | 'match' | 'team_arena',
    score: number,
    maxScore: number,
    timeSpentSeconds: number,
    accuracy: number,
    categoryScores?: { algebra?: number; geometry?: number; statistics?: number; speed?: number }
  ): void {
    const students = this.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newResult: GameHistoryItem = {
      id: `gh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      studentId: student.id,
      studentName: student.name,
      gameType,
      score,
      maxScore,
      timeSpentSeconds,
      accuracy,
      playedAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Update student stats
    student.totalPoints += score;
    student.gamesPlayed += 1;
    student.streakCount = accuracy >= 70 ? student.streakCount + 1 : 1;
    student.accuracyRate = Math.round(
      (student.accuracyRate * (student.gamesPlayed - 1) + accuracy) / student.gamesPlayed
    );

    if (categoryScores) {
      if (categoryScores.algebra !== undefined) {
        student.skills.algebra = Math.min(100, Math.round((student.skills.algebra + categoryScores.algebra) / 2));
      }
      if (categoryScores.geometry !== undefined) {
        student.skills.geometry = Math.min(100, Math.round((student.skills.geometry + categoryScores.geometry) / 2));
      }
      if (categoryScores.statistics !== undefined) {
        student.skills.statistics = Math.min(100, Math.round((student.skills.statistics + categoryScores.statistics) / 2));
      }
      if (categoryScores.speed !== undefined) {
        student.skills.speed = Math.min(100, Math.round((student.skills.speed + categoryScores.speed) / 2));
      }
    }

    if (!student.recentResults) student.recentResults = [];
    student.recentResults.unshift(newResult);
    if (student.recentResults.length > 20) {
      student.recentResults = student.recentResults.slice(0, 20);
    }

    this.saveStudents(students);

    // Also update global history log
    const history = this.getHistory();
    history.unshift(newResult);
    if (history.length > 100) {
      this.saveHistory(history.slice(0, 100));
    } else {
      this.saveHistory(history);
    }
  },

  // Export full local database to JSON file
  exportBackup(): void {
    const data = {
      classes: this.getClasses(),
      students: this.getStudents(),
      questions: this.getQuestions(),
      history: this.getHistory(),
      mockExams: this.getMockExams(),
      homeworks: this.getHomeworks(),
      homeworkSubmissions: this.getHomeworkSubmissions(),
      parentFeedbacks: this.getParentFeedbacks(),
      gradebook: this.getGradebook(),
      knowledgeLessons: this.getKnowledgeLessons(),
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MathMaster_THCS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Restore database from JSON
  importBackup(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.classes)) this.saveClasses(parsed.classes);
      if (Array.isArray(parsed.students)) this.saveStudents(parsed.students);
      if (Array.isArray(parsed.questions)) this.saveQuestions(parsed.questions);
      if (Array.isArray(parsed.history)) this.saveHistory(parsed.history);
      if (Array.isArray(parsed.mockExams)) this.saveMockExams(parsed.mockExams);
      if (Array.isArray(parsed.homeworks)) this.saveHomeworks(parsed.homeworks);
      if (Array.isArray(parsed.homeworkSubmissions)) this.saveHomeworkSubmissions(parsed.homeworkSubmissions);
      if (Array.isArray(parsed.parentFeedbacks)) this.saveParentFeedbacks(parsed.parentFeedbacks);
      if (Array.isArray(parsed.gradebook)) this.saveGradebook(parsed.gradebook);
      if (Array.isArray(parsed.knowledgeLessons)) this.saveKnowledgeLessons(parsed.knowledgeLessons);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  // --- KIẾN THỨC TRỌNG TÂM / GIÁO ÁN (KNOWLEDGE LESSONS) ---
  getKnowledgeLessons(): KnowledgeLesson[] {
    const loaded = safeParse<KnowledgeLesson[]>(STORAGE_KEYS.KNOWLEDGE_LESSONS, KNOWLEDGE_BASE);
    return loaded.map((lesson, idx) => ({
      ...lesson,
      chapterNumber: typeof lesson.chapterNumber === 'number' && !isNaN(lesson.chapterNumber) ? lesson.chapterNumber : 1,
      lessonNumber: typeof lesson.lessonNumber === 'number' && !isNaN(lesson.lessonNumber) ? lesson.lessonNumber : idx + 1,
      readingTimeMinutes: typeof lesson.readingTimeMinutes === 'number' && !isNaN(lesson.readingTimeMinutes) ? lesson.readingTimeMinutes : 5,
      coreTheory: Array.isArray(lesson.coreTheory) ? lesson.coreTheory : [],
      goldenFormulas: Array.isArray(lesson.goldenFormulas) ? lesson.goldenFormulas : [],
      problemTypes: Array.isArray(lesson.problemTypes) ? lesson.problemTypes : [],
      commonMistakes: Array.isArray(lesson.commonMistakes) ? lesson.commonMistakes : [],
      miniQuiz: Array.isArray(lesson.miniQuiz) ? lesson.miniQuiz : [],
    }));
  },

  saveKnowledgeLessons(lessons: KnowledgeLesson[]): void {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_LESSONS, JSON.stringify(lessons));
  },

  // --- KIẾN THỨC TRỌNG TÂM (LEARNED LESSONS) ---
  getLearnedLessons(studentId: string): string[] {
    const map = safeParse<Record<string, string[]>>(STORAGE_KEYS.LEARNED_LESSONS, {});
    return map[studentId] || [];
  },

  toggleLearnedLesson(studentId: string, lessonId: string): boolean {
    const map = safeParse<Record<string, string[]>>(STORAGE_KEYS.LEARNED_LESSONS, {});
    const current = map[studentId] || [];
    const isLearned = current.includes(lessonId);
    let updated: string[];
    if (isLearned) {
      updated = current.filter(id => id !== lessonId);
    } else {
      updated = [...current, lessonId];
    }
    map[studentId] = updated;
    localStorage.setItem(STORAGE_KEYS.LEARNED_LESSONS, JSON.stringify(map));

    // If just marked learned, award XP and progress quest
    if (!isLearned) {
      this.updateDailyQuestProgress(studentId, 'knowledge', 1);
      const students = this.getStudents();
      const st = students.find(s => s.id === studentId);
      if (st) {
        st.totalPoints += 50;
        this.saveStudents(students);
      }
    }
    return !isLearned;
  },

  // --- THI ĐUA TỰ HỌC TẠI NHÀ (DAILY QUESTS & MOTIVATION) ---
  getDailyQuests(studentId: string): DailyQuestState {
    const todayStr = new Date().toISOString().slice(0, 10);
    const key = `${STORAGE_KEYS.DAILY_QUESTS}_${studentId}`;
    const saved = safeParse<DailyQuestState | null>(key, null);

    if (saved && saved.date === todayStr) {
      return saved;
    }

    // Default quests for a new day
    const defaultQuests: DailyQuest[] = [
      {
        id: 'q_knowledge',
        title: 'Ôn 1 Bài Kiến Thức Trọng Tâm',
        description: 'Đọc lý thuyết, công thức vàng và làm bài tập mẫu',
        rewardPoints: 50,
        icon: '📖',
        targetCount: 1,
        currentCount: 0,
        completed: false,
        category: 'knowledge'
      },
      {
        id: 'q_speed',
        title: 'Luyện Thần Tốc Tính Nhẩm (60s)',
        description: 'Đạt từ 50 điểm trở lên để kích hoạt phản xạ số học',
        rewardPoints: 80,
        icon: '⚡',
        targetCount: 1,
        currentCount: 0,
        completed: false,
        category: 'speed'
      },
      {
        id: 'q_climb',
        title: 'Chinh Phục Leo Núi Tri Thức',
        description: 'Vượt qua các trạm câu hỏi trắc nghiệm Toán THCS',
        rewardPoints: 100,
        icon: '🏔️',
        targetCount: 1,
        currentCount: 0,
        completed: false,
        category: 'climb'
      },
      {
        id: 'q_quiz',
        title: 'Vượt Qua Mini-Quiz Trọng Tâm',
        description: 'Trả lời đúng các câu hỏi củng cố trong phần bài học',
        rewardPoints: 60,
        icon: '🧪',
        targetCount: 1,
        currentCount: 0,
        completed: false,
        category: 'quiz'
      }
    ];

    const students = this.getStudents();
    const st = students.find(s => s.id === studentId);
    const streak = st ? st.streakCount : 1;

    const newState: DailyQuestState = {
      date: todayStr,
      studentId,
      quests: defaultQuests,
      claimedDailyChest: false,
      streakCount: streak,
      totalXpEarnedToday: 0
    };

    localStorage.setItem(key, JSON.stringify(newState));
    return newState;
  },

  updateDailyQuestProgress(
    studentId: string, 
    category: 'knowledge' | 'speed' | 'climb' | 'match' | 'quiz' | 'homework', 
    increment: number = 1
  ): { state: DailyQuestState; pointsAwarded: number } {
    const state = this.getDailyQuests(studentId);
    let pointsAwarded = 0;

    const updatedQuests = state.quests.map(q => {
      if (q.category === category && !q.completed) {
        const newCount = Math.min(q.targetCount, q.currentCount + increment);
        const isDone = newCount >= q.targetCount;
        if (isDone) {
          pointsAwarded += q.rewardPoints;
        }
        return {
          ...q,
          currentCount: newCount,
          completed: isDone
        };
      }
      return q;
    });

    state.quests = updatedQuests;
    state.totalXpEarnedToday += pointsAwarded;

    const key = `${STORAGE_KEYS.DAILY_QUESTS}_${studentId}`;
    localStorage.setItem(key, JSON.stringify(state));

    if (pointsAwarded > 0) {
      const students = this.getStudents();
      const st = students.find(s => s.id === studentId);
      if (st) {
        st.totalPoints += pointsAwarded;
        this.saveStudents(students);
      }
    }

    return { state, pointsAwarded };
  },

  claimDailyRewardChest(studentId: string): number {
    const state = this.getDailyQuests(studentId);
    const allDone = state.quests.every(q => q.completed);
    if (!allDone || state.claimedDailyChest) {
      return 0;
    }

    const BONUS_XP = 120;
    state.claimedDailyChest = true;
    state.totalXpEarnedToday += BONUS_XP;

    const key = `${STORAGE_KEYS.DAILY_QUESTS}_${studentId}`;
    localStorage.setItem(key, JSON.stringify(state));

    const students = this.getStudents();
    const st = students.find(s => s.id === studentId);
    if (st) {
      st.totalPoints += BONUS_XP;
      st.streakCount += 1; // reward streak on day completion
      this.saveStudents(students);
    }

    return BONUS_XP;
  },

  getHomeStudyBadges(studentId: string): HomeStudyBadge[] {
    const key = `${STORAGE_KEYS.STUDY_BADGES}_${studentId}`;
    const saved = safeParse<HomeStudyBadge[] | null>(key, null);
    
    const students = this.getStudents();
    const st = students.find(s => s.id === studentId);
    const learnedCount = this.getLearnedLessons(studentId).length;
    const totalPts = st?.totalPoints || 0;
    const streak = st?.streakCount || 0;

    const baseBadges: HomeStudyBadge[] = [
      {
        id: 'b1',
        title: 'Khởi Đầu Tự Giác',
        description: 'Đã hoàn thành và nắm chắc ít nhất 1 bài kiến thức trọng tâm',
        icon: '🌱',
        requirement: 'Nắm vững 1 bài',
        unlocked: learnedCount >= 1
      },
      {
        id: 'b2',
        title: 'Bão Táp Tính Nhanh',
        description: 'Phản xạ toán học xuất sắc trong Thần Tốc Tính Nhẩm',
        icon: '⚡',
        requirement: 'Đạt kỹ năng tốc độ ≥ 75%',
        unlocked: (st?.skills?.speed || 0) >= 75
      },
      {
        id: 'b3',
        title: 'Ngọn Lửa Kiên Trì',
        description: 'Duy trì chuỗi tự học liên tục 3 ngày trở lên tại nhà',
        icon: '🔥',
        requirement: 'Chuỗi tự học ≥ 3 ngày',
        unlocked: streak >= 3
      },
      {
        id: 'b4',
        title: 'Nhà Thông Thái THCS',
        description: 'Nắm vững từ 3 bài kiến thức trọng tâm các khối lớp',
        icon: '📚',
        requirement: 'Nắm vững ≥ 3 bài',
        unlocked: learnedCount >= 3
      },
      {
        id: 'b5',
        title: 'Bậc Thầy Tự Học',
        description: 'Tích lũy từ 1,500 điểm thi đua tự giác tại nhà',
        icon: '👑',
        requirement: 'Điểm tích lũy ≥ 1500 XP',
        unlocked: totalPts >= 1500
      },
      {
        id: 'b6',
        title: 'Hiệp Sĩ Hình Học',
        description: 'Làm chủ kỹ năng hình học và đo lường trực quan',
        icon: '📐',
        requirement: 'Kỹ năng hình học ≥ 80%',
        unlocked: (st?.skills?.geometry || 0) >= 80
      }
    ];

    if (!saved) {
      localStorage.setItem(key, JSON.stringify(baseBadges));
      return baseBadges;
    }

    // Merge unlock status
    const merged = baseBadges.map(b => {
      const existing = saved.find(s => s.id === b.id);
      return {
        ...b,
        unlocked: b.unlocked || existing?.unlocked || false,
        unlockedAt: existing?.unlockedAt || (b.unlocked ? new Date().toISOString() : undefined)
      };
    });

    localStorage.setItem(key, JSON.stringify(merged));
    return merged;
  },

  // --- BẢN TIN CUỐI TUẦN & TOP 5 HỌC SINH XUẤT SẮC ---
  getWeekendTopReports(): WeekendTopReport[] {
    const list = safeParse<WeekendTopReport[]>(STORAGE_KEYS.WEEKEND_REPORTS, []);
    if (list.length === 0) {
      // Auto-generate initial report
      const initialReport = this.generateWeekendTopReport();
      return [initialReport];
    }
    return list;
  },

  saveWeekendTopReports(reports: WeekendTopReport[]): void {
    localStorage.setItem(STORAGE_KEYS.WEEKEND_REPORTS, JSON.stringify(reports));
  },

  generateWeekendTopReport(classId?: string): WeekendTopReport {
    const allStudents = this.getStudents();
    const classes = this.getClasses();
    
    // Top 5 CHỈ tranh thứ hạng trong lớp: Luôn gán về một lớp cụ thể
    const effectiveClassId = (classId && classId !== 'all') ? classId : (classes[0]?.id || 'class-8a3');
    const targetClass = classes.find(c => c.id === effectiveClassId);
    const targetClassName = targetClass ? `${targetClass.name} (${targetClass.grade})` : 'Lớp Học';

    // Chỉ lọc các học sinh thuộc đúng lớp đó
    const studentsPool = allStudents.filter(s => s.classId === effectiveClassId);

    // Rank formulas: totalPoints (50%) + accuracyRate*10 (30%) + streakCount*50 (20%)
    const sorted = [...studentsPool].sort((a, b) => {
      const scoreA = a.totalPoints * 0.5 + a.accuracyRate * 8 + a.streakCount * 40;
      const scoreB = b.totalPoints * 0.5 + b.accuracyRate * 8 + b.streakCount * 40;
      return scoreB - scoreA;
    });

    const rankTitles = [
      'Quán Quân Lớp - Xuất Sắc Toàn Diện 🥇',
      'Á Quân 1 Lớp - Tự Học Siêu Đẳng 🥈',
      'Á Quân 2 Lớp - Bứt Phá Vượt Trội 🥉',
      'Ngôi Sao Kiên Trì - Chuỗi Học Bền Bỉ ⭐',
      'Chiến Binh Toán Học - Tốc Độ Đột Phá ⚡'
    ];

    const top5: TopStudentAward[] = sorted.slice(0, 5).map((st, idx) => ({
      rank: idx + 1,
      studentId: st.id,
      studentName: st.name,
      className: targetClass?.name || 'Lớp Toán THCS',
      avatar: st.avatar,
      weeklyPoints: st.totalPoints,
      streakCount: st.streakCount,
      accuracyRate: st.accuracyRate,
      highlightTitle: rankTitles[idx] || 'Học Sinh Tiêu Biểu Của Lớp',
      isInclusive: st.isInclusive
    }));

    // Find star student for inclusive education in this class
    const inclusiveCandidates = studentsPool.filter(s => s.isInclusive);
    let inclusiveStar: TopStudentAward | undefined = undefined;
    if (inclusiveCandidates.length > 0) {
      const bestInc = [...inclusiveCandidates].sort((a, b) => (b.totalPoints + b.streakCount * 50) - (a.totalPoints + a.streakCount * 50))[0];
      inclusiveStar = {
        rank: 99,
        studentId: bestInc.id,
        studentName: bestInc.name,
        className: targetClass?.name || 'Lớp Toán THCS',
        avatar: bestInc.avatar,
        weeklyPoints: bestInc.totalPoints,
        streakCount: bestInc.streakCount,
        accuracyRate: bestInc.accuracyRate,
        highlightTitle: 'Ngôi Sao Nỗ Lực Tự Học Hòa Nhập Của Lớp 🌈',
        isInclusive: true
      };
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const teacherMessage = `📢 BẢN TIN CUỐI TUẦN - VINH DANH TOP 5 HỌC SINH XUẤT SẮC
🏫 Đơn vị: Thi Đua Nội Bộ Lớp ${targetClassName}
📅 Ngày công bố: ${formattedDate}

Kính gửi Quý Phụ Huynh và các em học sinh lớp ${targetClassName},
Thầy/Cô xin chúc mừng các em học sinh trong lớp đã nỗ lực không ngừng trong tuần học vừa qua. Dưới đây là kết quả thi đua tranh thứ hạng nội bộ của lớp:

🏆 TOP 5 HỌC SINH DẪN ĐẦU LỚP TUẦN NÀY:
${top5.map(t => `${t.rank === 1 ? '🥇' : t.rank === 2 ? '🥈' : t.rank === 3 ? '🥉' : '🎖️'} Hạng ${t.rank}: ${t.studentName}
   ✦ Danh hiệu: ${t.highlightTitle}
   ✦ Điểm tích lũy: ${t.weeklyPoints} XP | Tỉ lệ đúng: ${t.accuracyRate}% | Chuỗi tự học: ${t.streakCount} ngày`).join('\n\n')}${inclusiveStar ? `\n\n🌟 TUYÊN DƯƠNG ĐẶC BIỆT LỚP - NGÔI SAO NỖ LỰC HÒA NHẬP:
🌈 Em: ${inclusiveStar.studentName} (${targetClassName})
✦ Tuyên dương: Tinh thần tự giác bền bỉ, kiên trì vượt khó và hoàn thành xuất sắc nhiệm vụ học tập theo kế hoạch giáo dục cá nhân!` : ''}

💐 Lời nhắn từ Thầy/Cô chủ nhiệm / bộ môn Toán:
"Thầy/Cô rất tự hào về tinh thần tự giác của tập thể lớp ${targetClassName}. Chúc các em và Quý Phụ Huynh có kì nghỉ cuối tuần vui vẻ, ấm áp!"`;

    const report: WeekendTopReport = {
      id: `report-${effectiveClassId}-${Date.now()}`,
      weekTitle: `Bản Tin Thi Đua Lớp ${targetClassName} (${formattedDate})`,
      generatedDate: formattedDate,
      topStudents: top5,
      inclusiveStar,
      teacherMessage,
      classId: effectiveClassId
    };

    return report;
  },

  // Auto-backup feature: triggers a JSON download every 24 hours
  checkAndTriggerAutoBackup(): boolean {
    const KEY = 'mathmaster_last_auto_backup';
    const lastBackupStr = localStorage.getItem(KEY);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!lastBackupStr || (now - parseInt(lastBackupStr, 10)) >= TWENTY_FOUR_HOURS) {
      try {
        this.exportBackup();
        localStorage.setItem(KEY, now.toString());
        return true;
      } catch (err) {
        console.error('Auto backup error:', err);
        return false;
      }
    }
    return false;
  },

  getLastAutoBackupTime(): string | null {
    const val = localStorage.getItem('mathmaster_last_auto_backup');
    if (!val) return null;
    return new Date(parseInt(val, 10)).toLocaleString('vi-VN');
  },

  // --- BẢNG ĐIỂM MÔN TOÁN (GRADEBOOK) ---
  getGradebook(): StudentGradeRecord[] {
    const records = safeParse<StudentGradeRecord[]>(STORAGE_KEYS.GRADEBOOK, INITIAL_GRADEBOOK);
    return records.map(r => ({
      ...r,
      regularScores: Array.from({ length: 5 }, (_, idx) => {
        const val = r.regularScores?.[idx];
        return typeof val === 'number' && !isNaN(val) ? val : null;
      }),
      midtermScore: typeof r.midtermScore === 'number' && !isNaN(r.midtermScore) ? r.midtermScore : null,
      finalScore: typeof r.finalScore === 'number' && !isNaN(r.finalScore) ? r.finalScore : null,
    }));
  },

  saveGradebook(records: StudentGradeRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.GRADEBOOK, JSON.stringify(records));
  },

  upsertGradeRecord(record: StudentGradeRecord): StudentGradeRecord[] {
    const list = this.getGradebook();
    const idx = list.findIndex(r => r.studentId === record.studentId && r.semester === record.semester);
    const normalized: StudentGradeRecord = {
      ...record,
      regularScores: Array.from({ length: 5 }, (_, i) => {
        const v = record.regularScores?.[i];
        return typeof v === 'number' && !isNaN(v) ? v : null;
      }),
      updatedAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    if (idx >= 0) {
      list[idx] = normalized;
    } else {
      list.push(normalized);
    }
    this.saveGradebook(list);
    return list;
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(INITIAL_MOCK_EXAMS));
    localStorage.setItem(STORAGE_KEYS.HOMEWORKS, JSON.stringify(INITIAL_HOMEWORKS));
    localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(INITIAL_HOMEWORK_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.PARENT_FEEDBACKS, JSON.stringify(INITIAL_PARENT_FEEDBACKS));
    localStorage.setItem(STORAGE_KEYS.GRADEBOOK, JSON.stringify(INITIAL_GRADEBOOK));
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_LESSONS, JSON.stringify(KNOWLEDGE_BASE));
    localStorage.removeItem(STORAGE_KEYS.LEARNED_LESSONS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_QUESTS);
    localStorage.removeItem(STORAGE_KEYS.STUDY_BADGES);
    localStorage.removeItem(STORAGE_KEYS.WEEKEND_REPORTS);
  }
};
