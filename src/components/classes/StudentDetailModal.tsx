import React, { useState } from 'react';
import {
  X,
  Target,
  FileText,
  Edit3,
  Save,
  User,
  Users,
  Plus,
  Trash2,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';
import {
  ClassGroup,
  Student,
  StudentParentInfo,
  StudentPersonalProfile,
} from '../../types';
import { getCurrentAcademicYear } from '../../utils/academicYear';

interface Props {
  student: Student | null;
  classGroup?: ClassGroup;
  onClose: () => void;
  onOpenReport: (student: Student) => void;
  onUpdateNotes: (studentId: string, notes: string) => void;
  onUpdateStudent?: (student: Student) => void;
}

type DetailTab = 'overview' | 'personal' | 'parent';

const RELATIONSHIP_OPTIONS = [
  'Cha',
  'Mẹ',
  'Ông',
  'Bà',
  'Anh/Chị',
  'Người giám hộ',
  'Khác',
];

const PTA_ROLE_SUGGESTIONS = [
  'Không',
  'Hội trưởng hội phụ huynh',
  'Hội phó hội phụ huynh',
  'Ủy viên ban đại diện',
  'Thủ quỹ hội phụ huynh',
];

const createEmptyParent = (index = 0): StudentParentInfo => ({
  id: `parent-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
  relationship: index === 0 ? 'Cha' : 'Mẹ',
  fullName: '',
  address: '',
  phone: '',
  cccdNumber: '',
  ptaRole: 'Không',
});

const StudentDetailModalContent: React.FC<
  Omit<Props, 'student'> & { student: Student }
> = ({
  student,
  classGroup,
  onClose,
  onOpenReport,
  onUpdateNotes,
  onUpdateStudent,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  // Tab 1: Teacher Notes
  const [notes, setNotes] = useState(student.teacherNotes || '');
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // Tab 2: Personal Info
  const [fullName, setFullName] = useState(student.name || '');
  const [personalInfo, setPersonalInfo] = useState<StudentPersonalProfile>({
    dateOfBirth: student.personalInfo?.dateOfBirth || '',
    cccdNumber: student.personalInfo?.cccdNumber || '',
    address: student.personalInfo?.address || '',
    placeOfBirth: student.personalInfo?.placeOfBirth || '',
    healthStatus: student.personalInfo?.healthStatus || '',
    weightKg: student.personalInfo?.weightKg || '',
    heightCm: student.personalInfo?.heightCm || '',
    hobbies: student.personalInfo?.hobbies || '',
    notes: student.personalInfo?.notes || '',
  });
  const [isPersonalSaved, setIsPersonalSaved] = useState(false);

  // Tab 3: Parent Info
  const [parentInfos, setParentInfos] = useState<StudentParentInfo[]>(() =>
    student.parentInfos && student.parentInfos.length > 0
      ? student.parentInfos.map((p, idx) => ({
          id: p.id || `parent-${idx}`,
          relationship: p.relationship || 'Cha',
          fullName: p.fullName || '',
          address: p.address || '',
          phone: p.phone || '',
          cccdNumber: p.cccdNumber || '',
          ptaRole: p.ptaRole || 'Không',
        }))
      : [createEmptyParent(0)]
  );
  const [isParentSaved, setIsParentSaved] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(student.id, notes);
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 1800);
  };

  const handlePersonalFieldChange = (
    field: keyof StudentPersonalProfile,
    value: string
  ) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim() || student.name;
    const updatedStudent: Student = {
      ...student,
      name: trimmedName,
      personalInfo: {
        dateOfBirth: personalInfo.dateOfBirth?.trim() || '',
        cccdNumber: personalInfo.cccdNumber?.trim() || '',
        address: personalInfo.address?.trim() || '',
        placeOfBirth: personalInfo.placeOfBirth?.trim() || '',
        healthStatus: personalInfo.healthStatus?.trim() || '',
        weightKg: personalInfo.weightKg?.trim() || '',
        heightCm: personalInfo.heightCm?.trim() || '',
        hobbies: personalInfo.hobbies?.trim() || '',
        notes: personalInfo.notes?.trim() || '',
      },
    };
    setFullName(trimmedName);
    onUpdateStudent?.(updatedStudent);
    setIsPersonalSaved(true);
    setTimeout(() => setIsPersonalSaved(false), 1800);
  };

  const handleParentFieldChange = (
    parentId: string,
    field: keyof Omit<StudentParentInfo, 'id'>,
    value: string
  ) => {
    setParentInfos((prev) =>
      prev.map((item) => (item.id === parentId ? { ...item, [field]: value } : item))
    );
  };

  const handleAddParent = () => {
    setParentInfos((prev) => [...prev, createEmptyParent(prev.length)]);
  };

  const handleRemoveParent = (parentId: string) => {
    setParentInfos((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== parentId);
    });
  };

  const handleSaveParentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedParents = parentInfos.map((p) => ({
      ...p,
      relationship: p.relationship.trim() || 'Cha',
      fullName: p.fullName.trim(),
      address: p.address.trim(),
      phone: p.phone.trim(),
      cccdNumber: p.cccdNumber.trim(),
      ptaRole: p.ptaRole.trim() || 'Không',
    }));

    const updatedStudent: Student = {
      ...student,
      parentInfos: cleanedParents,
    };
    setParentInfos(cleanedParents);
    onUpdateStudent?.(updatedStudent);
    setIsParentSaved(true);
    setTimeout(() => setIsParentSaved(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl shadow-inner">
              {student.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white">
                  {fullName.trim() || student.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  {classGroup?.name || 'THCS'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mã định danh:{' '}
                <span className="font-mono text-slate-300">{student.id}</span> • Niên khóa:{' '}
                {classGroup?.academicYear || getCurrentAcademicYear()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết học sinh"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Đánh giá & Năng lực</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'parent'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thông tin phụ huynh</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & COMPETENCY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Highlight Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Tổng Điểm Tích Lũy
                </span>
                <p className="text-xl font-black text-amber-400 mt-0.5">
                  {student.totalPoints}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Chuỗi Trận Thắng
                </span>
                <p className="text-xl font-black text-rose-400 mt-0.5">
                  {student.streakCount} 🔥
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Tỉ Lệ Trả Lời Đúng
                </span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  {student.accuracyRate}%
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Số Trận Đã Đấu
                </span>
                <p className="text-xl font-black text-indigo-400 mt-0.5">
                  {student.gamesPlayed}
                </p>
              </div>
            </div>

            {/* Detailed Competency & Skill Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Đánh Giá Năng Lực Toán Học Chi Tiết
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Số Học & Đại Số:</span>
                    <span className="text-indigo-400 font-mono font-bold">
                      {student.skills.algebra}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${student.skills.algebra}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Hình Học & Đo Lường:</span>
                    <span className="text-pink-400 font-mono font-bold">
                      {student.skills.geometry}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                      style={{ width: `${student.skills.geometry}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Thống Kê & Xác Suất:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {student.skills.statistics}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: `${student.skills.statistics}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Tốc Độ Tính Nhẩm & Phản Xạ:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {student.skills.speed}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                      style={{ width: `${student.skills.speed}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher's Notes Form */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Nhận Xét Của Giáo Viên (Sẽ in vào báo cáo phụ huynh):
                </label>
                {isNotesSaved && (
                  <span className="text-xs text-emerald-400 font-bold">Đã lưu!</span>
                )}
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi nhận xét về sự tiến bộ, điểm mạnh, hoặc dạng bài học sinh cần ôn thêm..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu Nhận Xét
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSavePersonalInfo} className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  Hồ Sơ Thông Tin Cá Nhân Học Sinh
                </h4>
                {isPersonalSaved && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã lưu!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên học sinh"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Ngày tháng năm sinh
                  </label>
                  <input
                    type="date"
                    value={personalInfo.dateOfBirth || ''}
                    onChange={(e) =>
                      handlePersonalFieldChange('dateOfBirth', e.target.value)
                    }
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Số căn cước công dân
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={personalInfo.cccdNumber || ''}
                    onChange={(e) =>
                      handlePersonalFieldChange('cccdNumber', e.target.value)
                    }
                    placeholder="Ví dụ: 079213001234"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Nơi sinh
                  </label>
                  <input
                    type="text"
                    value={personalInfo.placeOfBirth || ''}
                    onChange={(e) =>
                      handlePersonalFieldChange('placeOfBirth', e.target.value)
                    }
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={personalInfo.address || ''}
                    onChange={(e) =>
                      handlePersonalFieldChange('address', e.target.value)
                    }
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Health & Physical Metrics */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  Thể chất & Sức khỏe
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Sức khỏe
                    </label>
                    <input
                      type="text"
                      value={personalInfo.healthStatus || ''}
                      onChange={(e) =>
                        handlePersonalFieldChange('healthStatus', e.target.value)
                      }
                      placeholder="VD: Tốt, Cận thị nhẹ..."
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Cân nặng (kg)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={personalInfo.weightKg || ''}
                      onChange={(e) =>
                        handlePersonalFieldChange('weightKg', e.target.value)
                      }
                      placeholder="VD: 45"
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Chiều cao (cm)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={personalInfo.heightCm || ''}
                      onChange={(e) =>
                        handlePersonalFieldChange('heightCm', e.target.value)
                      }
                      placeholder="VD: 155"
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hobbies & Personal Notes */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Sở thích
                  </label>
                  <input
                    type="text"
                    value={personalInfo.hobbies || ''}
                    onChange={(e) =>
                      handlePersonalFieldChange('hobbies', e.target.value)
                    }
                    placeholder="VD: Đọc sách, giải rubik, cờ vua, đá bóng..."
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Lưu ý
                  </label>
                  <textarea
                    rows={3}
                    value={personalInfo.notes || ''}
                    onChange={(e) =>
                      handlePersonalFieldChange('notes', e.target.value)
                    }
                    placeholder="Lưu ý về dị ứng, thị lực, vị trí chỗ ngồi hoặc đặc điểm cá nhân cần quan tâm..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu Thông Tin Cá Nhân
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: PARENT INFORMATION */}
        {activeTab === 'parent' && (
          <form onSubmit={handleSaveParentInfo} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Danh Sách Thông Tin Phụ Huynh / Người Giám Hộ
                </h4>
                {isParentSaved && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã lưu!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddParent}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-300 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm phụ huynh
              </button>
            </div>

            <div className="space-y-4">
              {parentInfos.map((parent, idx) => (
                <div
                  key={parent.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-extrabold text-white">
                      Phụ huynh #{idx + 1}
                      {parent.relationship ? ` (${parent.relationship})` : ''}
                    </span>

                    {parentInfos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParent(parent.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Mối quan hệ với học sinh
                      </label>
                      <select
                        value={
                          RELATIONSHIP_OPTIONS.includes(parent.relationship)
                            ? parent.relationship
                            : 'Khác'
                        }
                        onChange={(e) =>
                          handleParentFieldChange(
                            parent.id,
                            'relationship',
                            e.target.value
                          )
                        }
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        {RELATIONSHIP_OPTIONS.map((rel) => (
                          <option key={rel} value={rel}>
                            {rel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Tên phụ huynh
                      </label>
                      <input
                        type="text"
                        value={parent.fullName}
                        onChange={(e) =>
                          handleParentFieldChange(
                            parent.id,
                            'fullName',
                            e.target.value
                          )
                        }
                        placeholder="Nhập họ và tên phụ huynh"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={parent.phone}
                        onChange={(e) =>
                          handleParentFieldChange(parent.id, 'phone', e.target.value)
                        }
                        placeholder="VD: 0901234567"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Số căn cước công dân
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={parent.cccdNumber}
                        onChange={(e) =>
                          handleParentFieldChange(
                            parent.id,
                            'cccdNumber',
                            e.target.value
                          )
                        }
                        placeholder="VD: 079085001234"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={parent.address}
                        onChange={(e) =>
                          handleParentFieldChange(
                            parent.id,
                            'address',
                            e.target.value
                          )
                        }
                        placeholder="Địa chỉ thường trú hoặc nơi ở hiện tại"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-300 font-semibold block mb-1">
                        Chức vụ trong hội phụ huynh
                      </label>
                      <input
                        type="text"
                        list={`pta-roles-${parent.id}`}
                        value={parent.ptaRole}
                        onChange={(e) =>
                          handleParentFieldChange(
                            parent.id,
                            'ptaRole',
                            e.target.value
                          )
                        }
                        placeholder="VD: Không, Hội trưởng hội phụ huynh, Ủy viên..."
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                      <datalist id={`pta-roles-${parent.id}`}>
                        {PTA_ROLE_SUGGESTIONS.map((role) => (
                          <option key={role} value={role} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu Thông Tin Phụ Huynh
              </button>
            </div>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onOpenReport(student)}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <FileText className="w-4 h-4" />
            Xuất Phiếu Báo Cáo Gửi Phụ Huynh (PDF / In Ấn)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentDetailModal: React.FC<Props> = ({ student, ...rest }) => {
  if (!student) return null;
  return <StudentDetailModalContent key={student.id} student={student} {...rest} />;
};
