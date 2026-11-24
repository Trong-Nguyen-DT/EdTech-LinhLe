import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, Plus, Trash2, Edit2, Search, UserPlus, 
  Award, FileText, ChevronRight, GraduationCap, School, 
  KeyRound, Copy, Check, Printer, X, Calendar 
} from 'lucide-react';
import { ClassGroup, GradeLevel, Student } from '../../types';
import { Storage } from '../../utils/storage';
import {
  getCurrentAcademicYear,
  getPresetAcademicYears,
  normalizeAcademicYear,
} from '../../utils/academicYear';

interface Props {
  classes: ClassGroup[];
  students: Student[];
  onUpdateClasses: (classes: ClassGroup[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onSelectStudent: (student: Student) => void;
  onOpenReport: (student: Student) => void;
}

const AVATAR_OPTIONS = ['👨‍🎓', '👩‍🎓', '🧑‍🎓', '👧', '🧒', '👦', '🦸‍♂️', '🦸‍♀️', '🥷', '🧙‍♂️'];

export const ClassManagement: React.FC<Props> = ({
  classes,
  students,
  onUpdateClasses,
  onUpdateStudents,
  onSelectStudent,
  onOpenReport
}) => {
  const currentAcademicYear = useMemo(() => getCurrentAcademicYear(), []);
  const presetAcademicYears = useMemo(() => getPresetAcademicYears(), []);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => getCurrentAcademicYear());
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>('Toán 8');
  const [newClassAcademicYear, setNewClassAcademicYear] = useState<string>(() => getCurrentAcademicYear());
  const [newClassRoom, setNewClassRoom] = useState('');

  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState<GradeLevel>('Toán 8');
  const [editClassAcademicYear, setEditClassAcademicYear] = useState<string>(() => getCurrentAcademicYear());
  const [editClassRoom, setEditClassRoom] = useState('');

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('123456');
  const [newStudentAvatar, setNewStudentAvatar] = useState('👨‍🎓');

  // Codes Roster Modal
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const academicYearOptions = useMemo(() => {
    const yearSet = new Set<string>(presetAcademicYears);
    classes.forEach((c) => yearSet.add(normalizeAcademicYear(c.academicYear)));
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [classes, presetAcademicYears]);

  const filteredClasses = useMemo(() => {
    if (selectedAcademicYear === 'all') return classes;
    return classes.filter(
      (c) => normalizeAcademicYear(c.academicYear) === selectedAcademicYear
    );
  }, [classes, selectedAcademicYear]);

  const selectedClass =
    filteredClasses.find((c) => c.id === selectedClassId) || filteredClasses[0] || null;

  useEffect(() => {
    if (filteredClasses.length > 0 && !filteredClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [filteredClasses, selectedClassId]);

  const classStudents = selectedClass
    ? students.filter(s => {
        const matchClass = s.classId === selectedClass.id;
        const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.parentCode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchClass && matchSearch;
      })
    : [];

  const openAddClassModal = (targetYear?: string) => {
    const defaultYear =
      targetYear ||
      (selectedAcademicYear !== 'all' ? selectedAcademicYear : currentAcademicYear);
    setNewClassAcademicYear(defaultYear);
    setNewClassName('');
    setNewClassRoom('');
    setShowAddClass(true);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const normalizedYear = normalizeAcademicYear(newClassAcademicYear);
    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      grade: newClassGrade,
      academicYear: normalizedYear,
      room: newClassRoom.trim() || 'Phòng học'
    };

    const updated = [...classes, newClass];
    onUpdateClasses(updated);
    Storage.saveClasses(updated);
    if (selectedAcademicYear !== 'all' && selectedAcademicYear !== normalizedYear) {
      setSelectedAcademicYear(normalizedYear);
    }
    setSelectedClassId(newClass.id);
    setShowAddClass(false);
    setNewClassName('');
    setNewClassRoom('');
  };

  const openEditClassModal = (cls: ClassGroup) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setEditClassGrade(cls.grade);
    setEditClassAcademicYear(normalizeAcademicYear(cls.academicYear));
    setEditClassRoom(cls.room || '');
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;

    const normalizedYear = normalizeAcademicYear(editClassAcademicYear);
    const updated = classes.map((c) =>
      c.id === editingClass.id
        ? {
            ...c,
            name: editClassName.trim(),
            grade: editClassGrade,
            academicYear: normalizedYear,
            room: editClassRoom.trim() || 'Phòng học',
          }
        : c
    );

    onUpdateClasses(updated);
    Storage.saveClasses(updated);
    if (selectedAcademicYear !== 'all' && selectedAcademicYear !== normalizedYear) {
      setSelectedAcademicYear(normalizedYear);
    }
    setSelectedClassId(editingClass.id);
    setEditingClass(null);
  };

  const handleDeleteClass = (classId: string) => {
    if (classes.length <= 1) {
      alert('Phải giữ lại ít nhất 1 lớp học trong hệ thống!');
      return;
    }
    if (confirm('Thầy/Cô có chắc chắn muốn xóa lớp này không?')) {
      const updated = classes.filter(c => c.id !== classId);
      onUpdateClasses(updated);
      Storage.saveClasses(updated);
      const remainingInYear = updated.filter(
        (c) => selectedAcademicYear === 'all' || normalizeAcademicYear(c.academicYear) === selectedAcademicYear
      );
      setSelectedClassId(remainingInYear[0]?.id || updated[0]?.id || '');
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedClass) return;

    const randNum = Math.floor(100 + Math.random() * 900);
    const code = `HS${randNum}`;
    const pCode = `PH${randNum}`;
    const username = newStudentUsername.trim().toLowerCase() || code.toLowerCase();
    const password = newStudentPassword.trim() || '123456';
    const newStudent: Student = {
      id: `hs-${Date.now().toString().slice(-4)}`,
      name: newStudentName.trim(),
      classId: selectedClass.id,
      avatar: newStudentAvatar,
      studentCode: code,
      parentCode: pCode,
      username,
      password,
      parentUsername: pCode.toLowerCase(),
      parentPassword: '123456',
      totalPoints: 0,
      streakCount: 0,
      gamesPlayed: 0,
      accuracyRate: 0,
      skills: {
        algebra: 70,
        geometry: 70,
        statistics: 70,
        speed: 70
      },
      recentResults: [],
      teacherNotes: 'Học sinh mới tham gia lớp học.'
    };

    const updated = [...students, newStudent];
    onUpdateStudents(updated);
    Storage.saveStudents(updated);
    setShowAddStudent(false);
    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentPassword('123456');
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Thầy/Cô có muốn xóa học sinh này khỏi danh sách không?')) {
      const updated = students.filter(s => s.id !== studentId);
      onUpdateStudents(updated);
      Storage.saveStudents(updated);
    }
  };

  const handleCopyAllCodes = () => {
    if (!selectedClass) return;
    const lines = [
      `DANH SÁCH MÃ ĐĂNG NHẬP HỌC SINH & PHỤ HUYNH - ${selectedClass.name} (${selectedClass.grade} - Niên khóa ${selectedClass.academicYear})`,
      '-------------------------------------------------------',
      'STT | Họ và Tên | TK Học Sinh | TK Phụ Huynh | Mã HS | Mã PH',
      ...classStudents.map((s, i) => `${i + 1}. ${s.name} | HS: ${s.username}/${s.password} | PH: ${s.parentUsername}/${s.parentPassword} | Mã HS: ${s.studentCode} | Mã PH: ${s.parentCode}`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <School className="w-6 h-6 text-indigo-400" />
            Hệ Thống Quản Lý Lớp Học & Học Sinh THCS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi sĩ số, năng lực học tập và quản lý mã bảo mật cho từng học sinh và phụ huynh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedClass && (
            <button
              onClick={() => setShowCodesModal(true)}
              className="py-2.5 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
              title="Xem danh sách mã học sinh và phụ huynh của lớp"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Mã HS & PH Của Lớp</span>
            </button>
          )}

          <button
            onClick={() => openAddClassModal()}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Thêm Lớp Mới
          </button>
        </div>
      </div>

      {/* Academic Year Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Niên khóa:</span>
          </div>

          <select
            aria-label="Lọc lớp theo niên khóa"
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {academicYearOptions.map((yr) => {
              const count = classes.filter(
                (c) => normalizeAcademicYear(c.academicYear) === yr
              ).length;
              return (
                <option key={yr} value={yr}>
                  {yr}
                  {yr === currentAcademicYear ? ' (Năm nay)' : ''} ({count} lớp)
                </option>
              );
            })}
            <option value="all">Tất cả niên khóa ({classes.length} lớp)</option>
          </select>

          {selectedAcademicYear !== currentAcademicYear && (
            <button
              type="button"
              onClick={() => setSelectedAcademicYear(currentAcademicYear)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
            >
              Về năm nay ({currentAcademicYear})
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400">
          Hiển thị <strong className="text-white font-mono">{filteredClasses.length}</strong> / {classes.length} lớp học
        </span>
      </div>

      {/* Class Selector Tabs */}
      {filteredClasses.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredClasses.map(cls => {
            const studentCount = students.filter(s => s.classId === cls.id).length;
            const isActive = cls.id === selectedClass?.id;

            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`py-3 px-5 rounded-2xl border text-left whitespace-nowrap transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-slate-800 border-indigo-500 shadow-md text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs">
                  {cls.grade.replace('Toán ', 'K')}
                </div>
                <div>
                  <span className="font-extrabold text-sm block">{cls.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {studentCount} học sinh • {cls.room || 'Phòng học'} • {cls.academicYear}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-300 font-semibold">
            Chưa có lớp học nào thuộc niên khóa <strong className="text-indigo-300">{selectedAcademicYear}</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openAddClassModal(selectedAcademicYear)}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo lớp cho niên khóa {selectedAcademicYear}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedAcademicYear('all')}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Xem tất cả niên khóa
            </button>
          </div>
        </div>
      )}

      {/* Selected Class Panel */}
      {selectedClass && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Class Overview Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white">{selectedClass.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  {selectedClass.grade}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Niên khóa: {selectedClass.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sĩ số: {classStudents.length} học sinh • {selectedClass.room || 'Phòng học'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditClassModal(selectedClass)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                title="Chỉnh sửa tên lớp, khối lớp hoặc niên khóa"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sửa Lớp</span>
              </button>

              <button
                onClick={() => setShowAddStudent(true)}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
              >
                <UserPlus className="w-4 h-4" />
                Thêm Học Sinh
              </button>

              <button
                onClick={() => handleDeleteClass(selectedClass.id)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 transition"
                title="Xóa lớp này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm học sinh theo tên, mã HS hoặc mã PH..."
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {classStudents.map(student => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer flex flex-col justify-between group space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{student.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{student.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          Mã HS: {student.studentCode}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          Mã PH: {student.parentCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold">
                    {student.totalPoints}đ
                  </span>
                </div>

                {/* Accuracy & Game mini bar */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Chính xác: <strong className="text-emerald-400">{student.accuracyRate}%</strong></span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReport(student);
                      }}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      Báo cáo
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student.id);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {classStudents.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Chưa có học sinh nào trong lớp này hoặc không khớp với tìm kiếm.
            </div>
          )}
        </div>
      )}

      {/* MODAL CODES ROSTER (TEACHER VIEW) */}
      {showCodesModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Danh Sách Mã Học Sinh & Mã Phụ Huynh - {selectedClass.name}
                </h3>
              </div>
              <button
                onClick={() => setShowCodesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Thầy/Cô gửi <strong>Mã Học Sinh</strong> cho các em để đăng nhập làm bài và <strong>Mã Phụ Huynh</strong> cho gia đình để tra cứu sổ liên lạc điện tử riêng của con:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900 font-bold uppercase">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Học Sinh</th>
                    <th className="py-2.5 px-3">TK Học Sinh</th>
                    <th className="py-2.5 px-3">TK Phụ Huynh</th>
                    <th className="py-2.5 px-3 text-center">Mã HS</th>
                    <th className="py-2.5 px-3 text-center">Mã PH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {classStudents.map((st, i) => (
                    <tr key={st.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                        <span>{st.avatar}</span>
                        <span>{st.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-300 font-semibold">
                        {st.username} <span className="text-slate-500">/</span> <span className="text-amber-300">{st.password}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-300 font-semibold">
                        {st.parentUsername} <span className="text-slate-500">/</span> <span className="text-amber-300">{st.parentPassword}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                          {st.studentCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                          {st.parentCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleCopyAllCodes}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedCodes ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCodes ? 'Đã sao chép toàn bộ danh sách!' : 'Sao chép văn bản gửi lớp'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Printer className="w-4 h-4" />
                In Danh Sách Mã
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Class */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-400" />
              Tạo Lớp Học Mới
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Tên Lớp:</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: Lớp 8A4"
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Khối Lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value as GradeLevel)}
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Toán 6">Toán 6</option>
                  <option value="Toán 7">Toán 7</option>
                  <option value="Toán 8">Toán 8</option>
                  <option value="Toán 9">Toán 9</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Niên Khóa:
                </label>
                <input
                  type="text"
                  required
                  value={newClassAcademicYear}
                  onChange={(e) => setNewClassAcademicYear(e.target.value)}
                  placeholder={`Ví dụ: ${currentAcademicYear}`}
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {presetAcademicYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setNewClassAcademicYear(yr)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                        normalizeAcademicYear(newClassAcademicYear) === yr
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Phòng Học (tùy chọn):</label>
                <input
                  type="text"
                  value={newClassRoom}
                  onChange={(e) => setNewClassRoom(e.target.value)}
                  placeholder="Ví dụ: Phòng 303"
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Tạo Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Class */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" />
              Chỉnh Sửa Thông Tin Lớp
            </h3>

            <form onSubmit={handleUpdateClass} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Tên Lớp:</label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  placeholder="Ví dụ: Lớp 8A3"
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Khối Lớp:</label>
                <select
                  value={editClassGrade}
                  onChange={(e) => setEditClassGrade(e.target.value as GradeLevel)}
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Toán 6">Toán 6</option>
                  <option value="Toán 7">Toán 7</option>
                  <option value="Toán 8">Toán 8</option>
                  <option value="Toán 9">Toán 9</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Niên Khóa:
                </label>
                <input
                  type="text"
                  required
                  value={editClassAcademicYear}
                  onChange={(e) => setEditClassAcademicYear(e.target.value)}
                  placeholder={`Ví dụ: ${currentAcademicYear}`}
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {presetAcademicYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setEditClassAcademicYear(yr)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                        normalizeAcademicYear(editClassAcademicYear) === yr
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Phòng Học (tùy chọn):</label>
                <input
                  type="text"
                  value={editClassRoom}
                  onChange={(e) => setEditClassRoom(e.target.value)}
                  placeholder="Ví dụ: Phòng 302"
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Student */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Thêm Học Sinh Vào {selectedClass?.name}
            </h3>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Họ Và Tên Học Sinh:</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Gia Huy"
                  className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Username (tùy chọn):</label>
                  <input
                    type="text"
                    value={newStudentUsername}
                    onChange={(e) => setNewStudentUsername(e.target.value)}
                    placeholder="Tự động nếu để trống"
                    className="w-full py-2 px-3 text-sm font-mono rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Mật khẩu:</label>
                  <input
                    type="text"
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full py-2 px-3 text-sm font-mono rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Chọn Biểu Tượng Avatar:</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewStudentAvatar(av)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition ${
                        newStudentAvatar === av
                          ? 'bg-indigo-600/30 border-indigo-400 scale-110'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Hệ thống sẽ tự động tạo tài khoản đăng nhập, Mã Học Sinh và Mã Phụ Huynh bảo mật cho em.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Thêm Vào Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
