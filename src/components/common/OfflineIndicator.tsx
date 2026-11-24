import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 pointer-events-none select-none">
      {!isOnline ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-semibold text-xs shadow-lg backdrop-blur-md animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Chế độ Ngoại tuyến (Đã lưu dữ liệu trên máy)</span>
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-[11px] backdrop-blur-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bảo mật thiết bị</span>
        </div>
      )}
    </div>
  );
};
