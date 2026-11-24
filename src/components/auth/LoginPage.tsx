import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  School,
  Camera
} from 'lucide-react';
import { ClassGroup, Student, TeacherAccount, UserRole } from '../../types';
import { AuthSession, Storage } from '../../utils/storage';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

interface Props {
  students: Student[];
  classes: ClassGroup[];
  existingSession: AuthSession | null;
  onLoginStudent: (student: Student) => void;
  onLoginParent: (student: Student) => void;
  onLoginTeacher: (teacher: TeacherAccount) => void;
  onContinueSession: () => void;
  onLaunchFaceQuiz?: () => void;
}

const ROLE_OPTIONS: Array<{
  id: UserRole;
  label: string;
  placeholder: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'student',
    label: 'Học sinh',
    placeholder: 'VD: hs801, hs802...',
    description: 'Vào Góc Học Sinh để học bài, làm BTVN và luyện đề thi thử.',
    icon: GraduationCap
  },
  {
    id: 'parent',
    label: 'Phụ huynh',
    placeholder: 'VD: ph801, ph802...',
    description: 'Xem Sổ liên lạc điện tử, tiến độ học tập và điểm số của con.',
    icon: HeartHandshake
  },
  {
    id: 'teacher',
    label: 'Giáo viên',
    placeholder: 'VD: giaovien',
    description: 'Quản lý lớp học, ngân hàng câu hỏi, soạn đề AI và nhập PDF/Word.',
    icon: School
  }
];

export const LoginPage: React.FC<Props> = ({
  students,
  classes,
  existingSession,
  onLoginStudent,
  onLoginParent,
  onLoginTeacher,
  onContinueSession,
  onLaunchFaceQuiz
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoList, setShowDemoList] = useState(true);

  const teachers = Storage.getTeachers();
  const activeRoleMeta = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password;

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const lowerUser = cleanUser.toLowerCase();

    if (selectedRole === 'student') {
      const matchedStudent = students.find(
        (s) => s.username.toLowerCase() === lowerUser && s.password === cleanPass
      );
      if (matchedStudent) {
        setErrorMsg('');
        onLoginStudent(matchedStudent);
        return;
      }

      if (students.some((s) => s.parentUsername.toLowerCase() === lowerUser)) {
        setErrorMsg('Tên đăng nhập này thuộc tài khoản Phụ huynh. Vui lòng chọn vai trò "Phụ huynh" ở trên.');
        return;
      }
      if (teachers.some((t) => t.username.toLowerCase() === lowerUser)) {
        setErrorMsg('Tên đăng nhập này thuộc tài khoản Giáo viên. Vui lòng chọn vai trò "Giáo viên" ở trên.');
        return;
      }
    }

    if (selectedRole === 'parent') {
      const matchedParent = students.find(
        (s) => s.parentUsername.toLowerCase() === lowerUser && s.parentPassword === cleanPass
      );
      if (matchedParent) {
        setErrorMsg('');
        onLoginParent(matchedParent);
        return;
      }

      if (students.some((s) => s.username.toLowerCase() === lowerUser)) {
        setErrorMsg('Tên đăng nhập này thuộc tài khoản Học sinh. Vui lòng chọn vai trò "Học sinh" ở trên.');
        return;
      }
      if (teachers.some((t) => t.username.toLowerCase() === lowerUser)) {
        setErrorMsg('Tên đăng nhập này thuộc tài khoản Giáo viên. Vui lòng chọn vai trò "Giáo viên" ở trên.');
        return;
      }
    }

    if (selectedRole === 'teacher') {
      const matchedTeacher = teachers.find(
        (t) =>
          (t.username.toLowerCase() === lowerUser || lowerUser === 'teacher' || lowerUser === 'admin') &&
          t.password === cleanPass
      );
      if (matchedTeacher) {
        setErrorMsg('');
        onLoginTeacher(matchedTeacher);
        return;
      }

      if (students.some((s) => s.username.toLowerCase() === lowerUser)) {
        setErrorMsg('Tên đăng nhập này thuộc tài khoản Học sinh. Vui lòng chọn vai trò "Học sinh" ở trên.');
        return;
      }
      if (students.some((s) => s.parentUsername.toLowerCase() === lowerUser)) {
        setErrorMsg('Tên đăng nhập này thuộc tài khoản Phụ huynh. Vui lòng chọn vai trò "Phụ huynh" ở trên.');
        return;
      }
    }

    setErrorMsg('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
  };

  const fillCredentials = (u: string, p: string, role?: UserRole) => {
    if (role) setSelectedRole(role);
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id === classId)?.name || 'THCS';
  };

  const existingStudent =
    existingSession?.studentId
      ? students.find((s) => s.id === existingSession.studentId)
      : null;

  const existingRoleLabel =
    existingSession?.role === 'teacher'
      ? 'Giáo viên'
      : existingSession?.role === 'parent'
      ? 'Phụ huynh'
      : 'Học sinh';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-12">
      {/* Top Minimal Brand Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-950/50">
            ∑
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
              MathMaster THCS
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Nền tảng học tập & quản lý Toán 6 – 9
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Chương trình GDPT 2018
          </span>
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main Split Content */}
      <main className="max-w-6xl w-full mx-auto my-8 lg:my-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Editorial Column */}
        <section className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-indigo-400">
              Hệ thống phân quyền 3 vai trò: Học sinh · Phụ huynh · Giáo viên
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight [text-wrap:balance]">
              Kết nối Học sinh, Phụ huynh và Giáo viên trên cùng một nền tảng Toán THCS
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Mỗi vai trò có không gian làm việc và phân quyền bảo mật riêng: học sinh làm bài cá nhân, phụ huynh theo dõi tiến độ của con và giáo viên quản lý lớp học.
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Học sinh (Góc Học Sinh & Thi Đua)</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Học kiến thức trọng tâm Toán 6–9, luyện thi thử, nộp BTVN và xếp hạng trong lớp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Phụ huynh (Sổ Liên Lạc Điện Tử)</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Chỉ xem được kết quả, bài làm và nhận xét giáo viên của riêng con em mình.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Giáo viên (Quản Lý Lớp & Ngân Hàng Đề)</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Quản lý sĩ số, cấp tài khoản học sinh/phụ huynh, tạo đề bằng AI và nhập từ PDF/Word.
                </p>
              </div>
            </div>

            {onLaunchFaceQuiz && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onLaunchFaceQuiz}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-600/20 dark:via-sky-600/15 dark:to-indigo-600/20 dark:hover:from-blue-600/30 dark:hover:to-indigo-600/30 border border-blue-200 dark:border-blue-500/40 flex items-center justify-between gap-4 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25 dark:shadow-blue-950/50">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-sky-300 transition">
                        Toán Tương Tác Khuôn Mặt (Webcam AI)
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Nghiêng đầu chọn A/B, há miệng chuyển câu — trình chiếu trực tiếp trên lớp.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 group-hover:translate-x-1 transition" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Login Form Column */}
        <section className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            {/* Existing Session Resume Banner */}
            {existingSession && (
              <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-slate-300 block">
                    Phiên đang mở ({existingRoleLabel}):
                  </span>
                  <strong className="text-white font-bold">
                    {existingSession.role === 'teacher'
                      ? existingSession.displayName || 'Giáo Viên Toán THCS'
                      : existingSession.role === 'parent'
                      ? `Phụ huynh em ${existingStudent?.name || existingSession.username}`
                      : `${existingStudent?.name || existingSession.username} (${existingSession.username})`}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={onContinueSession}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Đăng Nhập</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Chọn vai trò và nhập tài khoản được cấp để truy cập hệ thống.
              </p>
            </div>

            {/* 3-Role Selector */}
            <div
              role="tablist"
              aria-label="Chọn vai trò đăng nhập"
              className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl"
            >
              {ROLE_OPTIONS.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setSelectedRole(role.id);
                      setErrorMsg('');
                    }}
                    className={`min-h-[40px] px-2.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">{activeRoleMeta.description}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Tên đăng nhập ({activeRoleMeta.label})
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder={activeRoleMeta.placeholder}
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Mật khẩu (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Nhập mật khẩu"
                    className="w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập ({activeRoleMeta.label})</span>
              </button>
            </form>

            {/* Quick Account Reference Directory filtered by selected role */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <button
                type="button"
                onClick={() => setShowDemoList((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <span>
                  Tài khoản mẫu – {activeRoleMeta.label} (Nhấn để điền nhanh)
                </span>
                {showDemoList ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showDemoList && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="max-h-44 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/70">
                          <th className="py-2 px-3 font-semibold">
                            {selectedRole === 'teacher'
                              ? 'Giáo viên'
                              : selectedRole === 'parent'
                              ? 'Phụ huynh của em'
                              : 'Học sinh'}
                          </th>
                          <th className="py-2 px-3 font-semibold">Username</th>
                          <th className="py-2 px-3 font-semibold">Password</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {selectedRole === 'teacher' &&
                          teachers.map((t) => (
                            <tr
                              key={t.id}
                              onClick={() => fillCredentials(t.username, t.password, 'teacher')}
                              className="hover:bg-indigo-950/40 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-3 font-semibold text-amber-300">
                                {t.name}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-indigo-300">
                                {t.username}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-300">
                                {t.password}
                              </td>
                            </tr>
                          ))}

                        {selectedRole === 'student' &&
                          students.slice(0, 6).map((st) => (
                            <tr
                              key={st.id}
                              onClick={() => fillCredentials(st.username, st.password, 'student')}
                              className="hover:bg-indigo-950/40 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-3 text-slate-200">
                                <span className="font-medium">{st.name}</span>
                                <span className="text-slate-500 ml-1.5">
                                  ({getClassName(st.classId)})
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-indigo-300">
                                {st.username}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-300">
                                {st.password}
                              </td>
                            </tr>
                          ))}

                        {selectedRole === 'parent' &&
                          students.slice(0, 6).map((st) => (
                            <tr
                              key={st.id}
                              onClick={() =>
                                fillCredentials(st.parentUsername, st.parentPassword, 'parent')
                              }
                              className="hover:bg-indigo-950/40 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-3 text-slate-200">
                                <span className="font-medium">PH em {st.name}</span>
                                <span className="text-slate-500 ml-1.5">
                                  ({getClassName(st.classId)})
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-emerald-300">
                                {st.parentUsername}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-300">
                                {st.parentPassword}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer
        hidden
        aria-hidden="true"
        className="hidden max-w-6xl w-full mx-auto flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-4 border-t border-slate-900"
      >
        <span>© 2025 MathMaster THCS</span>
        <span>Dữ liệu học tập lưu trữ an toàn trên trình duyệt</span>
      </footer>
    </div>
  );
};
