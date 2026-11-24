import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, Check, X } from 'lucide-react';
import { Storage } from '../../utils/storage';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const TeacherPinModal: React.FC<Props> = ({ isOpen, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentSavedPin = Storage.getTeacherPin();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === currentSavedPin) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setError(true);
      return;
    }
    if (newPin !== confirmPin) {
      setError(true);
      return;
    }
    Storage.setTeacherPin(newPin);
    setSuccessMsg('Đã đổi mã PIN bảo mật thành công!');
    setTimeout(() => {
      setIsChangingPin(false);
      setSuccessMsg('');
      setNewPin('');
      setConfirmPin('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Xác Thực Giáo Viên</h3>
              <p className="text-xs text-slate-400">Bảo mật dữ liệu điểm số & đề thi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isChangingPin ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-xs text-slate-300">
              Nhập mã PIN giáo viên để truy cập tính năng Quản lý Lớp học, Soạn đề thi và Xuất báo cáo (Mã mặc định: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">1234</code>):
            </p>

            <div className="space-y-1">
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                autoFocus
                placeholder="Nhập 4 số PIN..."
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
              />
              {error && (
                <p className="text-xs text-rose-400 flex items-center gap-1 justify-center pt-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Mã PIN không đúng. Vui lòng thử lại!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPin(true)}
                className="py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Đổi mã PIN
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Mở Khóa
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePin} className="space-y-3">
            <p className="text-xs text-slate-300">Nhập mã PIN mới (ít nhất 4 chữ số):</p>
            
            <input
              type="password"
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Mã PIN mới..."
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              maxLength={8}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Nhập lại mã PIN mới..."
              className="w-full py-2 px-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />

            {successMsg && (
              <p className="text-xs text-emerald-400 text-center font-medium">{successMsg}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPin(false)}
                className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Lưu PIN Mới
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
