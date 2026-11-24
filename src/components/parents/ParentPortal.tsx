import React, { useState } from 'react';
import { 
  HeartHandshake, Search, Trophy, CheckCircle2, 
  XCircle, Clock, FileText, Send, User, Award, 
  Sparkles, Calendar, MessageSquare, AlertCircle, Phone, 
  KeyRound, ShieldCheck, LogOut, Lock, Heart, Lightbulb, Star 
} from 'lucide-react';
import { ClassGroup, ExamSubmission, HomeworkAssignment, HomeworkSubmission, ParentFeedback, Student } from '../../types';
import { Storage } from '../../utils/storage';
import { WeekendHonorsModal } from '../reports/WeekendHonorsModal';

interface Props {
  students: Student[];
  classes: ClassGroup[];
  isTeacherUnlocked?: boolean;
  lockedStudentId?: string | null;
  onOpenReport: (student: Student) => void;
}

export const ParentPortal: React.FC<Props> = ({ 
  students, 
  classes, 
  isTeacherUnlocked,
  lockedStudentId,
  onOpenReport 
}) => {
  // Parent Authentication State
  const [parentCodeInput, setParentCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticatedStudentId, setAuthenticatedStudentId] = useState<string | null>(() => {
    return localStorage.getItem('mathmaster_parent_authed_student_id') || null;
  });

  // Parent feedback form
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbacks, setFeedbacks] = useState<ParentFeedback[]>(() => Storage.getParentFeedbacks());
  const [showWeekendHonorsModal, setShowWeekendHonorsModal] = useState(false);

  // Data from storage
  const homeworks = Storage.getHomeworks();
  const hwSubmissions = Storage.getHomeworkSubmissions();
  const examSubmissions = Storage.getExamSubmissions();

  // Matched student (use lockedStudentId when logged in directly as Parent role)
  const effectiveStudentId = lockedStudentId || authenticatedStudentId;
  const verifiedStudent = students.find(s => s.id === effectiveStudentId);
  const studentClass = classes.find(c => c.id === verifiedStudent?.classId);

  // Submissions
  const studentHwSubmissions = hwSubmissions.filter(s => s.studentId === verifiedStudent?.id);
  const studentExamSubmissions = examSubmissions.filter(s => s.studentId === verifiedStudent?.id);
  const classHomeworks = homeworks.filter(h => h.classId === verifiedStudent?.classId);

  const handleVerifyParentCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = parentCodeInput.trim().toUpperCase();
    if (!clean) {
      setAuthError('Vui lòng nhập Mã Phụ Huynh!');
      return;
    }

    const matched = students.find(s => s.parentCode.toUpperCase() === clean);
    if (matched) {
      setAuthError('');
      setAuthenticatedStudentId(matched.id);
      localStorage.setItem('mathmaster_parent_authed_student_id', matched.id);
    } else {
      setAuthError('Mã Phụ Huynh không chính xác. Quý phụ huynh vui lòng kiểm tra lại với Giáo viên bộ môn!');
    }
  };

  const handleLogoutParent = () => {
    setAuthenticatedStudentId(null);
    localStorage.removeItem('mathmaster_parent_authed_student_id');
    setParentCodeInput('');
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim() || !parentName.trim() || !verifiedStudent) return;

    const newFb: ParentFeedback = {
      id: `pf-${Date.now()}`,
      studentId: verifiedStudent.id,
      studentName: verifiedStudent.name,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim() || undefined,
      content: feedbackContent.trim(),
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      seenByTeacher: false
    };

    Storage.addParentFeedback(newFb);
    setFeedbacks(prev => [newFb, ...prev]);
    setFeedbackContent('');
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const getRankAssessment = (acc: number) => {
    if (acc >= 90) return { label: 'Xuất Sắc', color: 'text-emerald-400' };
    if (acc >= 80) return { label: 'Giỏi', color: 'text-indigo-400' };
    if (acc >= 65) return { label: 'Khá', color: 'text-amber-400' };
    return { label: 'Cần Động Viên Thêm', color: 'text-rose-400' };
  };

  const assessment = verifiedStudent ? getRankAssessment(verifiedStudent.accuracyRate) : { label: 'Khá', color: 'text-amber-400' };

  // --- SCREEN 1: PARENT CODE LOGIN REQUIRED ---
  if (!verifiedStudent) {
    return (
      <div className="max-w-lg mx-auto py-8 space-y-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl shadow-lg shadow-emerald-950/40">
            🛡️
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              Bảo Mật Sổ Liên Lạc Điện Tử
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Xác Thực Mã Phụ Huynh
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto mt-2 leading-relaxed">
              Để bảo vệ quyền riêng tư tuyệt đối cho học sinh, Quý phụ huynh vui lòng nhập <strong>Mã Phụ Huynh</strong> riêng biệt của con để xem kết quả học tập.
            </p>
          </div>

          <form onSubmit={handleVerifyParentCode} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Nhập Mã Phụ Huynh (Do giáo viên cấp):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={12}
                  value={parentCodeInput}
                  onChange={(e) => {
                    setParentCodeInput(e.target.value.toUpperCase());
                    setAuthError('');
                  }}
                  placeholder="VD: PH801, PH802..."
                  className="w-full text-center text-xl font-mono font-bold tracking-widest py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 uppercase placeholder:text-slate-600"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            {/* Test Sample Codes Hint */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Mã mẫu của các em học sinh trong lớp (Thử nghiệm):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {students.slice(0, 6).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setParentCodeInput(s.parentCode)}
                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] hover:border-emerald-500 hover:text-white"
                  >
                    {s.parentCode} (PH em {s.name.split(' ').pop()})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30"
            >
              <KeyRound className="w-4 h-4" />
              Tra Cứu Kết Quả Con Em
            </button>
          </form>

          {/* Quick link to Class Honors for all parents */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowWeekendHonorsModal(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Xem Bảng Vinh Danh Top 5 & Ngôi Sao Hòa Nhập Tuần Này</span>
            </button>
          </div>

          {isTeacherUnlocked && (
            <div className="pt-1">
              <p className="text-[11px] text-slate-400 italic">
                (Thầy/Cô đang mở quyền Giáo viên: có thể vào Quản Lý Lớp Học để xem toàn bộ danh sách mã cấp cho lớp)
              </p>
            </div>
          )}
        </div>

        {/* Honors Modal for Screen 1 */}
        <WeekendHonorsModal
          isOpen={showWeekendHonorsModal}
          onClose={() => setShowWeekendHonorsModal(false)}
          classes={classes}
          currentStudentId={null}
        />
      </div>
    );
  }

  // --- SCREEN 2: VERIFIED PARENT DASHBOARD (STRICTLY FOR THAT STUDENT ONLY) ---
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Đã Xác Thực Mã Phụ Huynh: {verifiedStudent.parentCode}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-emerald-400" />
            Sổ Liên Lạc Điện Tử - {verifiedStudent.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Theo dõi tiến độ làm bài tập về nhà, điểm thi thử giữa kì/cuối kì và nhận xét của giáo viên bộ môn Toán.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowWeekendHonorsModal(true)}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            Top 5 Cuối Tuần
          </button>

          {!lockedStudentId && (
            <button
              onClick={handleLogoutParent}
              className="py-2 px-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
              title="Đăng xuất khỏi sổ liên lạc của con"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đổi Mã Phụ Huynh</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl">
            {verifiedStudent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{verifiedStudent.name}</h3>
              <span className="px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-300 text-xs font-bold">
                {studentClass?.name} ({studentClass?.grade})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mã Học Sinh: <strong className="font-mono text-white">{verifiedStudent.studentCode}</strong> • Niên khóa: {studentClass?.academicYear}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenReport(verifiedStudent)}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <FileText className="w-4 h-4" />
          In Phiếu Liên Lạc / Xuất Báo Cáo A4
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Tổng Điểm Tích Lũy</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{verifiedStudent.totalPoints} đ</p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Qua bài tập & trò chơi toán</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Tỉ Lệ Trả Lời Đúng</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{verifiedStudent.accuracyRate}%</p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Mức độ hiểu bài</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Chuỗi Trận Thắng</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{verifiedStudent.streakCount} 🔥</p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Sự ổn định và tự tin</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Đánh Giá Học Lực</span>
          <p className={`text-xl font-black mt-1 ${assessment.color}`}>{assessment.label}</p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Chuẩn GDPT 2018</span>
        </div>
      </div>

      {/* Sổ Theo Dõi & Kế Hoạch Giáo Dục Hòa Nhập (Nếu là học sinh hòa nhập) */}
      {verifiedStudent.isInclusive && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950/70 via-slate-900 to-emerald-950/40 border border-teal-500/40 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-3xl shrink-0">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-white text-base">
                    Sổ Theo Dõi & Kế Hoạch Giáo Dục Hòa Nhập Cá Nhân
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                    Thông tư 03/2018/BGDĐT
                  </span>
                </div>
                <p className="text-xs text-teal-200/90 mt-0.5 leading-relaxed">
                  Chế độ hỗ trợ hòa nhập dành riêng cho em <strong>{verifiedStudent.name}</strong> nhằm phát huy tối đa năng lực cá nhân trong môi trường giáo dục yêu thương, không rào cản.
                </p>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-bold flex items-center gap-1.5 shrink-0">
              <Heart className="w-4 h-4 text-teal-400 fill-teal-400" />
              Được Bảo Trợ Hòa Nhập
            </span>
          </div>

          {/* Kế hoạch giáo dục cá nhân & Lời dặn của giáo viên */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Kế hoạch giáo dục cá nhân (KHGDCN) & Lời nhắn Thầy/Cô:
              </span>
              <span className="text-[10px] text-teal-400 font-mono">Cập nhật học kỳ này</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic bg-teal-950/30 p-3 rounded-xl border border-teal-900/50">
              "{verifiedStudent.inclusiveNotes || 'Học sinh đang theo học chương trình giáo dục hòa nhập. Thầy cô luôn đồng hành, giảm tải yêu cầu tính toán phức tạp và động viên em tích cực tham gia.'}"
            </p>
          </div>

          {/* 3 Trụ cột hỗ trợ trên hệ thống */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Cộng Thêm 50% Thời Gian
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Đề thi thử và bài kiểm tra tự động nhân hệ số thời gian x1.5 (VD: Đề 45 phút thành 68 phút) để bé không bị áp lực tốc độ.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Trợ Năng Gợi Ý & Chữ Lớn
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tích hợp công cụ cỡ chữ lớn (A / A+ / A++) và phím tắt "💡 Gợi ý tư duy từng bước" để con giải toán tự tin, nhẹ nhàng.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" />
                Ngôi Sao Nỗ Lực Hòa Nhập
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Vào cuối tuần, nhà trường luôn có bảng vinh danh đặc biệt ghi nhận tinh thần tự học kiên trì, không so đo áp lực điểm số.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section A: Homework Tracker for Parents */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tình Hình Làm Bài Tập Về Nhà (BTVN) Của Con
          </h4>
          <span className="text-xs text-slate-400">
            Đã hoàn thành: <strong className="text-emerald-400">{studentHwSubmissions.length}/{classHomeworks.length}</strong> bài
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classHomeworks.map(hw => {
            const sub = studentHwSubmissions.find(s => s.homeworkId === hw.id);

            return (
              <div key={hw.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">{hw.title}</h5>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Hạn chót: {hw.dueDate}</span>
                </div>

                <div>
                  {sub ? (
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                        Đã nộp • {sub.score}/10đ
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{sub.submittedAt}</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[11px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Chưa nộp bài
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {classHomeworks.length === 0 && (
            <p className="text-xs text-slate-500 col-span-2 text-center py-4">Chưa có bài tập về nhà nào cho lớp này.</p>
          )}
        </div>
      </div>

      {/* Section B: Exam Results */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Award className="w-4 h-4 text-amber-400" />
          Kết Quả Các Bài Thi Thử Giữa Kì & Cuối Kì Gần Nhất
        </h4>

        {studentExamSubmissions.length > 0 ? (
          <div className="space-y-2.5">
            {studentExamSubmissions.map(ex => (
              <div key={ex.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">{ex.examTitle}</h5>
                  <span className="text-[10px] text-slate-400">Thời gian làm: {Math.round(ex.timeSpentSeconds / 60)} phút • Ngày thi: {ex.submittedAt}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-amber-400">{ex.score} / 10đ</span>
                  <span className="block text-[10px] text-emerald-400">Đúng {ex.correctCount}/{ex.totalQuestions} câu</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            Cháu chưa tham gia làm bài thi thử nào trên hệ thống. Phụ huynh hãy nhắc con vào mục "Thi Thử Giữa & Cuối Kì" để luyện đề nhé!
          </p>
        )}
      </div>

      {/* Section C: Teacher Feedback & Guidance */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Lời Nhắn Nhủ Của Giáo Viên Dành Cho Phụ Huynh:
        </h4>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
          {verifiedStudent.teacherNotes || 'Học sinh chăm ngoan, tích cực tham gia các bài rèn luyện. Gia đình tiếp tục động viên con duy trì thói quen làm bài tập mỗi tối.'}
        </div>
      </div>

      {/* Section D: Parent Interactive Feedback to Teacher */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          Gửi Phản Hồi / Lời Nhắn Đến Giáo Viên Bộ Môn Toán:
        </h4>

        <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Họ tên Phụ huynh:</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Ví dụ: Trần Văn Long (Bố cháu)"
                className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Số điện thoại liên hệ (tùy chọn):</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Ví dụ: 0987.654.321"
                className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nội dung phản hồi / chia sẻ cùng giáo viên:</label>
            <textarea
              rows={3}
              required
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Gia đình đã xem kết quả học tập của con. Nhờ Thầy/Cô hỗ trợ thêm cho cháu phần..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {feedbackSent && (
            <p className="text-emerald-400 font-bold text-center">
              ✓ Lời nhắn của Phụ huynh đã được chuyển đến Giáo viên thành công!
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi Phản Hồi Cho Giáo Viên
            </button>
          </div>
        </form>
      </div>

      {/* Weekend Top 5 Honors Announcement Modal */}
      <WeekendHonorsModal
        isOpen={showWeekendHonorsModal}
        onClose={() => setShowWeekendHonorsModal(false)}
        classes={classes}
        currentStudentId={verifiedStudent.id}
        lockedClassId={lockedStudentId ? verifiedStudent.classId : undefined}
      />
    </div>
  );
};

