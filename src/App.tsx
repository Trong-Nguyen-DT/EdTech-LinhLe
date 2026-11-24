import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthSession, Storage } from './utils/storage';
import { ClassGroup, GameHistoryItem, KnowledgeLesson, Question, Student, StudentGradeRecord, TeacherAccount, UserRole } from './types';
import { Navbar } from './components/common/Navbar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { TeacherPinModal } from './components/common/TeacherPinModal';
import { StudentCorner } from './components/student/StudentCorner';
import { LeaderboardView } from './components/games/LeaderboardView';
import { ClassManagement } from './components/classes/ClassManagement';
import { StudentDetailModal } from './components/classes/StudentDetailModal';
import { QuestionBankEditor } from './components/questions/QuestionBankEditor';
import { LessonPlanManager } from './components/lessons/LessonPlanManager';
import { StudentReportExport } from './components/reports/StudentReportExport';
import { ParentPortal } from './components/parents/ParentPortal';
import { StudentCodeModal } from './components/common/StudentCodeModal';
import { LoginPage } from './components/auth/LoginPage';
import { GradebookView } from './components/grades/GradebookView';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

const FaceControlMathGame = lazy(() =>
  import('./components/games/FaceControlMathGame').then((m) => ({
    default: m.FaceControlMathGame,
  }))
);

const FACE_GAME_ROUTE = '/tro-choi-khuon-mat';

const TAB_ROUTES: Record<string, string> = {
  student_corner: '/goc-hoc-sinh',
  parents: '/phu-huynh',
  gradebook: '/bang-diem',
  leaderboard: '/bang-xep-hang',
  classes: '/quan-ly-lop',
  lesson_plans: '/quan-ly-giao-an',
  questions: '/ngan-hang-de',
};

function getRouteFromHash(): string {
  const raw = (window.location.hash || '').replace(/^#/, '').split('?')[0].trim();
  if (!raw || raw === '/') return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function setHashRoute(path: string, replace = false) {
  const normalized = !path || path === '/' ? '#/' : `#${path.startsWith('/') ? path : `/${path}`}`;
  if (window.location.hash === normalized) return;
  if (replace) {
    try {
      window.history.replaceState(null, '', normalized);
    } catch {
      window.location.hash = normalized;
    }
  } else {
    window.location.hash = normalized;
  }
}

function getTabFromPath(pathname: string): string {
  switch (pathname) {
    case '/phu-huynh':
      return 'parents';
    case '/bang-diem':
      return 'gradebook';
    case '/bang-xep-hang':
      return 'leaderboard';
    case '/quan-ly-lop':
      return 'classes';
    case '/quan-ly-giao-an':
      return 'lesson_plans';
    case '/ngan-hang-de':
      return 'questions';
    default:
      return 'student_corner';
  }
}

function isTabAllowedForRole(tab: string, role: UserRole): boolean {
  if (role === 'teacher') return true;
  if (role === 'parent') return tab === 'parents' || tab === 'leaderboard' || tab === 'gradebook';
  return tab === 'student_corner' || tab === 'leaderboard' || tab === 'gradebook' || tab === 'games' || tab === 'knowledge' || tab === 'exams' || tab === 'homework';
}

function getDefaultRouteForRole(role: UserRole): { path: string; tab: string } {
  if (role === 'teacher') return { path: '/quan-ly-lop', tab: 'classes' };
  if (role === 'parent') return { path: '/phu-huynh', tab: 'parents' };
  return { path: '/goc-hoc-sinh', tab: 'student_corner' };
}

export default function App() {
  // Synchronous initialization so components NEVER crash on first render!
  const [classes, setClasses] = useState<ClassGroup[]>(() => Storage.getClasses());
  const [students, setStudents] = useState<Student[]>(() => Storage.getStudents());
  const [questions, setQuestions] = useState<Question[]>(() => Storage.getQuestions());
  const [knowledgeLessons, setKnowledgeLessons] = useState<KnowledgeLesson[]>(() => Storage.getKnowledgeLessons());
  const [history, setHistory] = useState<GameHistoryItem[]>(() => Storage.getHistory());
  const [gradebookRecords, setGradebookRecords] = useState<StudentGradeRecord[]>(() => Storage.getGradebook());

  // Auth & Hash Routing ("#/" is the Home / Login Page)
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => Storage.getAuthSession());
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hashPath = getRouteFromHash();
    const session = Storage.getAuthSession();
    if (hashPath === FACE_GAME_ROUTE) {
      return FACE_GAME_ROUTE;
    }
    if (hashPath !== '/' && !session) {
      return '/';
    }
    if (hashPath !== '/' && session) {
      const requestedTab = getTabFromPath(hashPath);
      if (!isTabAllowedForRole(requestedTab, session.role)) {
        return getDefaultRouteForRole(session.role).path;
      }
    }
    return hashPath;
  });

  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => {
    const session = Storage.getAuthSession();
    const all = Storage.getStudents();
    if ((session?.role === 'student' || session?.role === 'parent') && session.studentId && all.some(s => s.id === session.studentId)) {
      return session.studentId;
    }
    const saved = Storage.getActiveStudentId();
    if (saved && all.some(s => s.id === saved)) return saved;
    return all[0]?.id || 'hs-01';
  });

  // Default to the role-matched tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    const session = Storage.getAuthSession();
    const tab = getTabFromPath(getRouteFromHash());
    if (session && !isTabAllowedForRole(tab, session.role)) {
      return getDefaultRouteForRole(session.role).tab;
    }
    return tab;
  });
  const [autoBackupMessage, setAutoBackupMessage] = useState<string | null>(null);

  // Sync browser hash navigation (HashRouter behavior)
  useEffect(() => {
    const normalizeCurrentHash = () => {
      const path = getRouteFromHash();
      if (path === FACE_GAME_ROUTE) {
        setCurrentPath(FACE_GAME_ROUTE);
        return;
      }
      const session = Storage.getAuthSession();
      if (path !== '/' && !session) {
        setHashRoute('/', true);
        setCurrentPath('/');
        return;
      }
      if (path === '/' && !window.location.hash) {
        setHashRoute('/', true);
      }
      if (path !== '/' && session) {
        const requestedTab = getTabFromPath(path);
        if (!isTabAllowedForRole(requestedTab, session.role)) {
          const fallback = getDefaultRouteForRole(session.role);
          setHashRoute(fallback.path, true);
          setCurrentPath(fallback.path);
          setActiveTab(fallback.tab);
          return;
        }
        setActiveTab(requestedTab);
      }
      setCurrentPath(path);
    };

    normalizeCurrentHash();
    window.addEventListener('hashchange', normalizeCurrentHash);
    window.addEventListener('popstate', normalizeCurrentHash);
    return () => {
      window.removeEventListener('hashchange', normalizeCurrentHash);
      window.removeEventListener('popstate', normalizeCurrentHash);
    };
  }, []);

  const navigateTo = (path: string, tab?: string) => {
    setHashRoute(path, false);
    setCurrentPath(path);
    if (tab) {
      setActiveTab(tab);
    }
  };

  // Auto-backup 24h check when authenticated
  useEffect(() => {
    if (!authSession || currentPath === '/') return;
    const didTrigger = Storage.checkAndTriggerAutoBackup();
    if (didTrigger) {
      setAutoBackupMessage('Hệ thống đã tự động sao lưu và tải xuống tệp JSON định kỳ 24 giờ để đảm bảo an toàn dữ liệu cho Thầy/Cô!');
      const timer = setTimeout(() => setAutoBackupMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [authSession, currentPath]);

  // Security & Modals
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState<boolean>(() => {
    return Storage.getAuthSession()?.role === 'teacher';
  });
  const [showTeacherPinModal, setShowTeacherPinModal] = useState(false);
  const [showStudentCodeModal, setShowStudentCodeModal] = useState(false);
  const [targetTabAfterUnlock, setTargetTabAfterUnlock] = useState<string | null>(null);
  
  // Student detail & report modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  // Reload data helper
  const reloadData = () => {
    const loadedClasses = Storage.getClasses();
    const loadedStudents = Storage.getStudents();
    const loadedQuestions = Storage.getQuestions();
    const loadedKnowledgeLessons = Storage.getKnowledgeLessons();
    const loadedHistory = Storage.getHistory();
    const loadedGradebook = Storage.getGradebook();
    const savedActiveStudent = Storage.getActiveStudentId();

    setClasses(loadedClasses);
    setStudents(loadedStudents);
    setQuestions(loadedQuestions);
    setKnowledgeLessons(loadedKnowledgeLessons);
    setHistory(loadedHistory);
    setGradebookRecords(loadedGradebook);

    if (savedActiveStudent && loadedStudents.some(s => s.id === savedActiveStudent)) {
      setActiveStudentId(savedActiveStudent);
    } else if (loadedStudents.length > 0) {
      setActiveStudentId(loadedStudents[0].id);
    }
  };

  const handleStudentSelect = (id: string) => {
    setActiveStudentId(id);
    Storage.setActiveStudentId(id);
  };

  const handleRequestTeacherUnlock = (targetTab?: string) => {
    if (authSession?.role !== 'teacher') return;
    if (targetTab) setTargetTabAfterUnlock(targetTab);
    setShowTeacherPinModal(true);
  };

  const handlePinSuccess = () => {
    setIsTeacherUnlocked(true);
    setShowTeacherPinModal(false);
    if (targetTabAfterUnlock) {
      const targetPath = TAB_ROUTES[targetTabAfterUnlock] || '/goc-hoc-sinh';
      navigateTo(targetPath, targetTabAfterUnlock);
      setTargetTabAfterUnlock(null);
    }
  };

  const handleLockTeacher = () => {
    setIsTeacherUnlocked(false);
    if (activeTab === 'classes' || activeTab === 'questions' || activeTab === 'lesson_plans') {
      navigateTo('/goc-hoc-sinh', 'student_corner');
    }
  };

  const handleLoginStudent = (student: Student) => {
    const session: AuthSession = {
      role: 'student',
      studentId: student.id,
      username: student.username,
      displayName: student.name,
      loggedInAt: new Date().toISOString(),
    };
    Storage.setAuthSession(session);
    Storage.setActiveStudentId(student.id);
    localStorage.removeItem('mathmaster_parent_authed_student_id');
    setAuthSession(session);
    setActiveStudentId(student.id);
    setIsTeacherUnlocked(false);
    navigateTo('/goc-hoc-sinh', 'student_corner');
  };

  const handleLoginParent = (student: Student) => {
    const session: AuthSession = {
      role: 'parent',
      studentId: student.id,
      username: student.parentUsername,
      displayName: `Phụ huynh em ${student.name}`,
      loggedInAt: new Date().toISOString(),
    };
    Storage.setAuthSession(session);
    Storage.setActiveStudentId(student.id);
    localStorage.setItem('mathmaster_parent_authed_student_id', student.id);
    setAuthSession(session);
    setActiveStudentId(student.id);
    setIsTeacherUnlocked(false);
    navigateTo('/phu-huynh', 'parents');
  };

  const handleLoginTeacher = (teacher: TeacherAccount) => {
    const session: AuthSession = {
      role: 'teacher',
      username: teacher.username,
      displayName: teacher.name,
      loggedInAt: new Date().toISOString(),
    };
    Storage.setAuthSession(session);
    localStorage.removeItem('mathmaster_parent_authed_student_id');
    setAuthSession(session);
    setIsTeacherUnlocked(true);
    navigateTo('/quan-ly-lop', 'classes');
  };

  const handleContinueSession = () => {
    if (!authSession) return;
    if (authSession.role === 'teacher') {
      setIsTeacherUnlocked(true);
    } else {
      setIsTeacherUnlocked(false);
    }
    const target = getDefaultRouteForRole(authSession.role);
    navigateTo(target.path, target.tab);
  };

  const handleLogout = () => {
    Storage.clearAuthSession();
    localStorage.removeItem('mathmaster_parent_authed_student_id');
    setAuthSession(null);
    setIsTeacherUnlocked(false);
    navigateTo('/');
  };

  const handleUpdateStudentNotes = (studentId: string, notes: string) => {
    const updated = students.map(s => (s.id === studentId ? { ...s, teacherNotes: notes } : s));
    setStudents(updated);
    Storage.saveStudents(updated);
    if (selectedStudentForDetail?.id === studentId) {
      setSelectedStudentForDetail(prev => prev ? { ...prev, teacherNotes: notes } : null);
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map(s => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    Storage.saveStudents(updated);
    if (selectedStudentForDetail?.id === updatedStudent.id) {
      setSelectedStudentForDetail(updatedStudent);
    }
  };

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0] || null;
  const selectedClassForStudent = classes.find(c => c.id === (selectedStudentForDetail || selectedStudentForReport)?.classId);

  // Direct route for Webcam Face-Control Math Game
  if (currentPath === FACE_GAME_ROUTE) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#EFF6FF] text-blue-900 flex items-center justify-center p-6 font-bold">
            Đang tải trò chơi Toán tương tác khuôn mặt...
          </div>
        }
      >
        <FaceControlMathGame
          onBack={() => {
            if (authSession) {
              const target = getDefaultRouteForRole(authSession.role);
              navigateTo(target.path, target.tab);
            } else {
              navigateTo('/');
            }
          }}
          backLabel={authSession ? 'Quay lại hệ thống' : 'Về trang chủ'}
        />
      </Suspense>
    );
  }

  // Render Login Page at URL "#/" (or when unauthenticated)
  if (currentPath === '/' || !authSession) {
    return (
      <LoginPage
        students={students}
        classes={classes}
        existingSession={authSession}
        onLoginStudent={handleLoginStudent}
        onLoginParent={handleLoginParent}
        onLoginTeacher={handleLoginTeacher}
        onContinueSession={handleContinueSession}
        onLaunchFaceQuiz={() => navigateTo(FACE_GAME_ROUTE)}
      />
    );
  }

  const effectiveTeacherUnlocked = authSession.role === 'teacher' && isTeacherUnlocked;
  const activeStudentClass = classes.find(c => c.id === activeStudent?.classId);
  const isNonTeacher = authSession.role !== 'teacher';
  const lockedClassId = isNonTeacher ? (activeStudent?.classId || null) : null;
  const scopedClasses = isNonTeacher && activeStudentClass ? [activeStudentClass] : classes;
  const scopedStudents = isNonTeacher && activeStudent
    ? students.filter(s => s.classId === activeStudent.classId)
    : students;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (!isTabAllowedForRole(tab, authSession.role)) {
            const fallback = getDefaultRouteForRole(authSession.role);
            navigateTo(fallback.path, fallback.tab);
            return;
          }
          navigateTo(TAB_ROUTES[tab] || '/goc-hoc-sinh', tab);
        }}
        userRole={authSession.role}
        accountDisplayName={authSession.displayName}
        accountUsername={authSession.username}
        isTeacherUnlocked={effectiveTeacherUnlocked}
        onRequestTeacherUnlock={() => handleRequestTeacherUnlock()}
        onLockTeacher={handleLockTeacher}
        onDataRestored={reloadData}
        activeStudent={activeStudent}
        onLogout={handleLogout}
      />

      {/* 24-Hour Automatic Backup Notification Banner */}
      {autoBackupMessage && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 text-xs shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {autoBackupMessage}
            </span>
            <button
              onClick={() => setAutoBackupMessage(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: GÓC HỌC SINH (KIẾN THỨC, THI ĐUA, THI THỬ, BTVN) */}
        {(authSession.role === 'student' || authSession.role === 'teacher') &&
          (activeTab === 'student_corner' || activeTab === 'games' || activeTab === 'knowledge' || activeTab === 'exams' || activeTab === 'homework') && (
          <StudentCorner
            students={scopedStudents}
            classes={scopedClasses}
            questions={questions}
            knowledgeLessons={knowledgeLessons}
            history={history}
            activeStudentId={activeStudentId}
            onStudentSelect={handleStudentSelect}
            isTeacherUnlocked={effectiveTeacherUnlocked}
            onRequestTeacherUnlock={authSession.role === 'teacher' ? handleRequestTeacherUnlock : undefined}
            onRequestChangeStudent={authSession.role === 'teacher' ? () => setShowStudentCodeModal(true) : undefined}
            lockedClassId={authSession.role === 'student' ? lockedClassId : undefined}
            initialSubTab={
              activeTab === 'knowledge' ? 'knowledge' : 
              activeTab === 'exams' ? 'exams' : 
              activeTab === 'homework' ? 'homework' : 'games'
            }
          />
        )}

        {/* TAB 2: PARENT PORTAL (GÓC PHỤ HUYNH) */}
        {(authSession.role === 'parent' || authSession.role === 'teacher') && activeTab === 'parents' && (
          <ParentPortal
            students={students}
            classes={classes}
            isTeacherUnlocked={effectiveTeacherUnlocked}
            lockedStudentId={authSession.role === 'parent' ? authSession.studentId : undefined}
            onOpenReport={(st) => setSelectedStudentForReport(st)}
          />
        )}

        {/* TAB 3: LEADERBOARD (BẢNG XẾP HẠNG LỚP) */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            students={scopedStudents}
            classes={scopedClasses}
            history={history}
            lockedClassId={lockedClassId}
            onSelectStudent={(st) => {
              if (authSession.role === 'teacher' || st.id === activeStudentId) {
                setSelectedStudentForDetail(st);
              }
            }}
          />
        )}

        {/* TAB 4: CLASS MANAGEMENT (TEACHER ONLY) */}
        {authSession.role === 'teacher' && activeTab === 'classes' && (
          <ClassManagement
            classes={classes}
            students={students}
            onUpdateClasses={(newClasses) => {
              setClasses(newClasses);
              Storage.saveClasses(newClasses);
            }}
            onUpdateStudents={(newStudents) => {
              setStudents(newStudents);
              Storage.saveStudents(newStudents);
            }}
            onSelectStudent={(st) => setSelectedStudentForDetail(st)}
            onOpenReport={(st) => setSelectedStudentForReport(st)}
          />
        )}

        {/* TAB: BẢNG ĐIỂM MÔN TOÁN */}
        {activeTab === 'gradebook' && (
          <GradebookView
            students={scopedStudents}
            classes={scopedClasses}
            records={gradebookRecords}
            onUpdateRecords={setGradebookRecords}
            userRole={authSession.role}
            isTeacherUnlocked={effectiveTeacherUnlocked}
            onRequestTeacherUnlock={authSession.role === 'teacher' ? () => handleRequestTeacherUnlock('gradebook') : undefined}
            lockedStudentId={isNonTeacher ? (authSession.studentId || activeStudent?.id) : undefined}
          />
        )}

        {/* TAB 5: LESSON PLAN MANAGER (TEACHER ONLY) */}
        {authSession.role === 'teacher' && activeTab === 'lesson_plans' && (
          <LessonPlanManager
            lessons={knowledgeLessons}
            onUpdateLessons={(newLessons) => {
              setKnowledgeLessons(newLessons);
              Storage.saveKnowledgeLessons(newLessons);
            }}
            isTeacherUnlocked={effectiveTeacherUnlocked}
            onRequestTeacherUnlock={() => handleRequestTeacherUnlock('lesson_plans')}
          />
        )}

        {/* TAB 6: QUESTION BANK & AI QUIZ BUILDER (TEACHER ONLY) */}
        {authSession.role === 'teacher' && activeTab === 'questions' && (
          <QuestionBankEditor
            questions={questions}
            onUpdateQuestions={(newQuestions) => {
              setQuestions(newQuestions);
              Storage.saveQuestions(newQuestions);
            }}
            isTeacherUnlocked={effectiveTeacherUnlocked}
            onRequestTeacherUnlock={() => handleRequestTeacherUnlock('questions')}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        hidden
        aria-hidden="true"
        className="hidden no-print border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <p>© 2025 MathMaster THCS • Nền Tảng Dạy & Học Toán Trực Quan Chuẩn GDPT</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Hoạt động 100% Offline • Dữ liệu lưu an toàn trên máy</span>
          </p>
        </div>
      </footer>

      {/* Floating Offline & Security Status Indicator */}
      <OfflineIndicator />

      {/* Teacher PIN Modal */}
      <TeacherPinModal
        isOpen={showTeacherPinModal}
        onSuccess={handlePinSuccess}
        onClose={() => setShowTeacherPinModal(false)}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        classGroup={selectedClassForStudent}
        onClose={() => setSelectedStudentForDetail(null)}
        onOpenReport={(st) => {
          setSelectedStudentForDetail(null);
          setSelectedStudentForReport(st);
        }}
        onUpdateNotes={handleUpdateStudentNotes}
        onUpdateStudent={handleUpdateStudent}
      />

      {/* Printable Report Export Modal */}
      <StudentReportExport
        student={selectedStudentForReport}
        classGroup={selectedClassForStudent}
        onClose={() => setSelectedStudentForReport(null)}
      />

      {/* Student Access Code Verification Modal */}
      <StudentCodeModal
        isOpen={showStudentCodeModal}
        students={students}
        currentStudent={activeStudent}
        onSuccess={(st) => {
          setActiveStudentId(st.id);
          Storage.setActiveStudentId(st.id);
          setShowStudentCodeModal(false);
        }}
        onClose={() => setShowStudentCodeModal(false)}
      />
    </div>
  );
}
