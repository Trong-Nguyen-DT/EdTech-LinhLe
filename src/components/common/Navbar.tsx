import React, { useState } from 'react';
import { 
  Gamepad2, Trophy, Compass, School, BookOpen, 
  Lock, Unlock, ShieldCheck, Download, Upload, 
  Menu, X, RefreshCw, Smartphone, FileCheck2, ClipboardList, HeartHandshake,
  BookMarked, GraduationCap, Sparkles, LogOut, FileSpreadsheet
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Storage } from '../../utils/storage';

import { Student, UserRole } from '../../types';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: UserRole;
  accountDisplayName?: string;
  accountUsername?: string;
  isTeacherUnlocked: boolean;
  onRequestTeacherUnlock: () => void;
  onLockTeacher: () => void;
  onDataRestored: () => void;
  activeStudent?: Student | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  userRole = 'student',
  accountDisplayName,
  accountUsername,
  isTeacherUnlocked,
  onRequestTeacherUnlock,
  onLockTeacher,
  onDataRestored,
  activeStudent,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  const handleTabClick = (tabId: string) => {
    // If teacher temporarily locked teacher mode, prompt PIN for teacher tabs
    if ((tabId === 'classes' || tabId === 'questions' || tabId === 'lesson_plans') && !isTeacherUnlocked) {
      onRequestTeacherUnlock();
      return;
    }
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleBackupExport = () => {
    Storage.exportBackup();
    setShowBackupMenu(false);
  };

  const handleBackupImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = Storage.importBackup(text);
          if (success) {
            alert('Khôi phục dữ liệu sao lưu thành công!');
            onDataRestored();
          } else {
            alert('Tệp dữ liệu không hợp lệ!');
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
    setShowBackupMenu(false);
  };

  const handleResetData = () => {
    if (confirm('Thầy/Cô có chắc chắn muốn đặt lại dữ liệu mẫu ban đầu không?')) {
      Storage.resetToDefault();
      onDataRestored();
      setShowBackupMenu(false);
    }
  };

  const allNavItems = [
    { id: 'student_corner', label: 'Góc Học Sinh', icon: GraduationCap, roles: ['student', 'teacher'] as UserRole[] },
    { id: 'parents', label: 'Góc Phụ Huynh', icon: HeartHandshake, roles: ['parent', 'teacher'] as UserRole[] },
    { id: 'gradebook', label: 'Bảng Điểm', icon: FileSpreadsheet, roles: ['student', 'parent', 'teacher'] as UserRole[] },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng Lớp', icon: Trophy, roles: ['student', 'parent', 'teacher'] as UserRole[] },
    { id: 'classes', label: 'Quản Lý Lớp', icon: School, teacherOnly: true, roles: ['teacher'] as UserRole[] },
    { id: 'lesson_plans', label: 'Quản Lý Giáo Án', icon: BookOpen, teacherOnly: true, roles: ['teacher'] as UserRole[] },
    { id: 'questions', label: 'Ngân Hàng Đề & AI', icon: Sparkles, teacherOnly: true, roles: ['teacher'] as UserRole[] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));
  const homeTab = userRole === 'parent' ? 'parents' : 'student_corner';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => handleTabClick(homeTab)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/30">
              <div className="w-full h-full bg-white text-indigo-700 dark:bg-slate-950 dark:text-white rounded-[14px] flex items-center justify-center text-lg font-black">
                ∑
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                  MathMaster
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-black">
                  THCS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Đấu Trường & Quản Lý Lớp Học</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = item.teacherOnly && !isTeacherUnlocked;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-amber-400 ml-0.5 shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Theme Toggle, PWA, Role Identity, Backup, Logout */}
          <div className="flex items-center gap-2">
            <ThemeToggleButton compactOnMobile />

            {/* In-App PWA Install */}
            <PWAInstallButton />

            {/* Role Identity & Account Pill */}
            {userRole === 'teacher' && isTeacherUnlocked ? (
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBackupMenu(!showBackupMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs font-bold hover:bg-emerald-500/20 transition"
                    title="Tài khoản Giáo viên & Sao lưu dữ liệu"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[130px] sm:max-w-[160px]">
                      {accountDisplayName || 'Giáo Viên Toán THCS'}
                    </span>
                    <Unlock className="w-3 h-3 text-emerald-400 shrink-0" />
                  </button>

                  {showBackupMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 text-xs space-y-1">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 mb-1 text-[11px]">
                        <span className="text-white font-bold block truncate">
                          👩‍🏫 {accountDisplayName || 'Giáo Viên Toán THCS'}
                        </span>
                        <span className="text-emerald-400 font-medium block text-[10px]">
                          Vai trò: Giáo viên {accountUsername ? `(@${accountUsername})` : ''}
                        </span>
                        <div className="border-t border-slate-800 my-1.5" />
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Tự động sao lưu mỗi 24 giờ
                        </span>
                        <span className="text-slate-400 block text-[10px] mt-0.5">
                          {Storage.getLastAutoBackupTime() ? `Gần nhất: ${Storage.getLastAutoBackupTime()}` : 'Hệ thống tự động tải file JSON dự phòng'}
                        </span>
                      </div>

                      <button
                        onClick={handleBackupExport}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2"
                      >
                        <Download className="w-4 h-4 text-indigo-400" />
                        Sao lưu thủ công ngay (JSON)
                      </button>
                      <button
                        onClick={handleBackupImport}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        Phục hồi từ file JSON
                      </button>
                      <button
                        onClick={handleResetData}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-amber-400 font-medium flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Khôi phục dữ liệu mẫu
                      </button>
                      <div className="border-t border-slate-800 my-1" />
                      <button
                        onClick={() => {
                          onLockTeacher();
                          setShowBackupMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-300 font-bold flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Khóa Tạm Quyền Giáo Viên
                      </button>
                      {onLogout && (
                        <button
                          onClick={() => {
                            setShowBackupMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/50 text-rose-400 font-bold flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng Xuất
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 text-xs font-semibold transition"
                    title="Đăng xuất về trang đăng nhập"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng Xuất</span>
                  </button>
                )}
              </div>
            ) : userRole === 'teacher' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onRequestTeacherUnlock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition"
                  title="Mở khóa lại quyền Giáo viên"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                    {accountDisplayName || 'Giáo Viên'}
                  </span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 text-xs font-semibold transition"
                    title="Đăng xuất về trang đăng nhập"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng Xuất</span>
                  </button>
                )}
              </div>
            ) : userRole === 'parent' ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[170px]">
                    {accountDisplayName || `PH em ${activeStudent?.name || 'Học sinh'}`}
                  </span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 text-xs font-semibold transition"
                    title="Đăng xuất về trang đăng nhập"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng Xuất</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {activeStudent && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
                    <span>{activeStudent.avatar}</span>
                    <span className="font-bold truncate max-w-[110px] sm:max-w-[140px]">
                      {accountDisplayName || activeStudent.name}
                    </span>
                    <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold">
                      {activeStudent.studentCode}
                    </span>
                  </div>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 text-xs font-semibold transition"
                    title="Đăng xuất về trang đăng nhập"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng Xuất</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.teacherOnly && !isTeacherUnlocked;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition flex items-center justify-between ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {isLocked && <Lock className="w-4 h-4 text-amber-400" />}
              </button>
            );
          })}
          {onLogout && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full px-4 py-3 rounded-xl text-sm font-bold text-rose-300 hover:bg-rose-950/40 transition flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng Xuất</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
