import React, { useState } from 'react';
import { KeyRound, UserCheck, ShieldAlert, X, Sparkles } from 'lucide-react';
import { Student } from '../../types';

interface Props {
  isOpen: boolean;
  students: Student[];
  currentStudent: Student | null;
  onSuccess: (student: Student) => void;
  onClose: () => void;
}

export const StudentCodeModal: React.FC<Props> = ({
  isOpen,
  students,
  currentStudent,
  onSuccess,
  onClose
}) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập mã học sinh!');
      return;
    }

    const matched = students.find(s => s.studentCode.toUpperCase() === cleanCode);
    if (matched) {
      setErrorMsg('');
      setCode('');
      onSuccess(matched);
    } else {
      setErrorMsg('Mã học sinh không đúng hoặc chưa được cấp. Vui lòng liên hệ Thầy/Cô bộ môn!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-100 space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Xác Thực Mã Học Sinh</h3>
              <p className="text-xs text-slate-400">Bảo mật bài làm cá nhân</p>
            </div>
          </div>
          {currentStudent && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Nhập <strong>Mã Học Sinh</strong> được giáo viên cấp để vào đúng bài làm của mình. Em sẽ không thể xem hoặc sửa bài làm của bạn khác.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Mã Học Sinh Của Em:
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={12}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMsg('');
              }}
              placeholder="VD: HS801, HS802..."
              className="w-full text-center text-xl font-mono font-bold tracking-widest py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 uppercase placeholder:text-slate-600"
            />

            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Mã mẫu để thử nghiệm:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {students.slice(0, 5).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCode(s.studentCode)}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] hover:border-indigo-500 hover:text-white"
                >
                  {s.studentCode} ({s.name.split(' ').pop()})
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <UserCheck className="w-4 h-4" />
            Đăng Nhập Làm Bài
          </button>
        </form>
      </div>
    </div>
  );
};
