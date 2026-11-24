import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-950/30 transition transform active:scale-95"
        title="Cài đặt ứng dụng về máy để chơi mượt mà khi không có mạng"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài Đặt App Offline</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cài trên iPad/iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  Cài Đặt Trên iOS (iPhone/iPad)
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">1</span>
                  <span>Nhấn nút <strong>Chia sẻ (Share)</strong> trên thanh công cụ Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">2</span>
                  <span>Cuộn xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">3</span>
                  <span>Nhấn <strong>Thêm</strong> để mở ứng dụng toàn màn hình không cần mạng!</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
