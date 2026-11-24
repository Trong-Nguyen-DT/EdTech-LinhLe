import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
  ZoomIn,
  AlertCircle,
} from 'lucide-react';
import { EssayAnswerUpload } from '../../types';
import { compressAnswerImage } from '../../utils/imageUpload';

interface StudentUploadProps {
  value?: EssayAnswerUpload;
  onChange: (upload: EssayAnswerUpload | undefined) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const EssayImageUploadBox: React.FC<StudentUploadProps> = ({
  value,
  onChange,
  disabled = false,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showZoom, setShowZoom] = useState(false);

  const handleFile = async (file: File) => {
    setErrorMsg('');
    setIsCompressing(true);
    try {
      const compressed = await compressAnswerImage(file);
      onChange({
        imageDataUrl: compressed.dataUrl,
        fileName: compressed.fileName,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        note: value?.note || '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải ảnh bài làm. Vui lòng thử lại.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {value?.imageDataUrl ? (
        <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã tải ảnh bài làm tự luận</span>
              {value.fileName && (
                <span className="text-[11px] font-normal text-slate-400 truncate max-w-[180px]">
                  ({value.fileName})
                </span>
              )}
            </div>

            {!disabled && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Đổi ảnh
                </button>
                <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              </div>
            )}
          </div>

          <div
            onClick={() => setShowZoom(true)}
            className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-zoom-in max-h-72 flex items-center justify-center"
          >
            <img
              src={value.imageDataUrl}
              alt="Ảnh bài làm tự luận"
              className="max-h-72 w-auto object-contain mx-auto"
            />
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 text-[11px] text-white font-semibold flex items-center gap-1 opacity-90 group-hover:opacity-100">
              <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
              Phóng to
            </div>
          </div>

          {!disabled ? (
            <input
              type="text"
              value={value.note || ''}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder="Ghi chú thêm cho giáo viên (tùy chọn, VD: Em trình bày ở trang 2)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          ) : (
            value.note && (
              <div className="text-xs text-slate-300 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                <strong className="text-indigo-300">Ghi chú của học sinh:</strong> {value.note}
              </div>
            )
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !isCompressing && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl ${
            compact ? 'p-4' : 'p-6'
          } text-center transition-all ${
            disabled
              ? 'border-slate-800 bg-slate-950/40 text-slate-500 cursor-default'
              : isDragging
              ? 'border-amber-400 bg-amber-950/30 cursor-pointer scale-[1.01]'
              : 'border-amber-500/40 hover:border-amber-400 bg-slate-950/70 cursor-pointer'
          }`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="text-xs font-semibold text-amber-200">
                Đang tối ưu ảnh bài làm...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {disabled
                  ? 'Học sinh chưa tải ảnh bài làm cho câu tự luận này'
                  : 'Chụp ảnh hoặc tải ảnh bài làm tự luận lên đây'}
              </div>
              {!disabled && (
                <p className="text-[11px] text-slate-400 max-w-md">
                  Câu hỏi dạng tự luận: hãy giải ra giấy rồi chụp ảnh rõ nét và bấm vào khung này để tải lên (.JPG, .PNG, .WEBP).
                </p>
              )}
              {!disabled && (
                <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Chọn / Chụp Ảnh Bài Làm
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {showZoom && value?.imageDataUrl &&
        createPortal(
          <div
            onClick={() => setShowZoom(false)}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-200">
                  Ảnh bài làm tự luận {value.fileName ? `— ${value.fileName}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setShowZoom(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img
                src={value.imageDataUrl}
                alt="Phóng to ảnh bài làm tự luận"
                className="max-h-[80vh] w-auto object-contain rounded-xl bg-white"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export const EssayUploadSlotPreview: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div
    className={`rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-950/15 ${
      compact ? 'p-3' : 'p-4'
    } flex items-center justify-between gap-3`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
        <Camera className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
          <span>Vị trí Upload Ảnh Bài Làm Tự Luận</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
            Thay cho 4 đáp án A-B-C-D
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Khi làm bài thi hoặc BTVN, học sinh sẽ chụp và tải lên ảnh lời giải viết tay cho câu hỏi này.
        </p>
      </div>
    </div>
  </div>
);
