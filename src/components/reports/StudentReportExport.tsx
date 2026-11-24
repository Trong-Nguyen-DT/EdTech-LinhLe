import React, { useRef } from 'react';
import { Printer, Download, X, Award, CheckCircle, FileText, Calendar, User, School } from 'lucide-react';
import { ClassGroup, Student } from '../../types';
import { getCurrentAcademicYear } from '../../utils/academicYear';

interface Props {
  student: Student | null;
  classGroup?: ClassGroup;
  onClose: () => void;
}

export const StudentReportExport: React.FC<Props> = ({ student, classGroup, onClose }) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      title: 'PHIẾU ĐÁNH GIÁ NĂNG LỰC TOÁN HỌC THCS',
      school: 'TRƯỜNG TRUNG HỌC CƠ SỞ',
      academicYear: classGroup?.academicYear || getCurrentAcademicYear(),
      exportDate: new Date().toLocaleDateString('vi-VN'),
      student: {
        id: student.id,
        name: student.name,
        class: classGroup?.name || 'Khối THCS',
        totalPoints: student.totalPoints,
        streakCount: student.streakCount,
        accuracyRate: student.accuracyRate,
        skills: student.skills,
        teacherNotes: student.teacherNotes || 'Học sinh tích cực tham gia các hoạt động toán học trên lớp.'
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BaoCao_Toan_${student.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRankAssessment = (acc: number) => {
    if (acc >= 90) return { label: 'Xuất Sắc', color: 'text-emerald-600', note: 'Nắm vững kiến thức trọng tâm, phản xạ tư duy nhanh nhạy.' };
    if (acc >= 80) return { label: 'Giỏi', color: 'text-blue-600', note: 'Hiểu bài tốt, tính toán cẩn thận và chăm chỉ.' };
    if (acc >= 65) return { label: 'Khá', color: 'text-amber-600', note: 'Có tiến bộ rõ rệt, cần rèn thêm kỹ năng tính nhẩm tốc độ.' };
    return { label: 'Cần Cố Gắng', color: 'text-rose-600', note: 'Cần giáo viên và phụ huynh hỗ trợ ôn lại lý thuyết cơ bản.' };
  };

  const assessment = getRankAssessment(student.accuracyRate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 my-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-white">Xem Trước Phiếu Báo Cáo Học Tập Định Kỳ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Printer className="w-4 h-4" />
              In Phiếu / Xuất PDF
            </button>

            <button
              onClick={handleDownloadJSON}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Tải File Dữ Liệu
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Report Document */}
        <div className="print-card bg-white text-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-600">PHÒNG GIÁO DỤC VÀ ĐÀO TẠO</p>
              <h4 className="text-sm font-black uppercase text-slate-900">TRƯỜNG TRUNG HỌC CƠ SỞ</h4>
              <p className="text-xs text-slate-500 mt-0.5">Tổ Chuyên Môn Toán - Tin Học</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-[11px] italic text-slate-500">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[11px] text-slate-500 mt-1">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black uppercase tracking-wide text-slate-900">
              PHIẾU BÁO CÁO KẾT QUẢ RÈN LUYỆN TOÁN HỌC ĐỊNH KỲ
            </h2>
            <p className="text-xs italic text-slate-600">
              (Theo dõi tiến độ qua hệ thống Đấu trường & Trò chơi toán học trực quan)
            </p>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block">Họ và tên:</span>
              <strong className="text-slate-900 text-sm font-bold">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Lớp:</span>
              <strong className="text-slate-900 font-bold">{classGroup?.name || 'THCS'} ({classGroup?.grade})</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Mã học sinh:</span>
              <strong className="text-slate-900 font-mono font-bold">{student.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Năm học:</span>
              <strong className="text-slate-900 font-bold">{classGroup?.academicYear || getCurrentAcademicYear()}</strong>
            </div>
          </div>

          {/* Summary Metrics */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
              1. TỔNG QUAN THÀNH TÍCH RÈN LUYỆN:
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                <span className="text-[11px] text-slate-500 block">Tổng điểm tích lũy</span>
                <span className="text-lg font-black text-indigo-700">{student.totalPoints} đ</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                <span className="text-[11px] text-slate-500 block">Tỉ lệ chính xác</span>
                <span className="text-lg font-black text-emerald-700">{student.accuracyRate}%</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                <span className="text-[11px] text-slate-500 block">Chuỗi chiến thắng</span>
                <span className="text-lg font-black text-rose-700">{student.streakCount} trận</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                <span className="text-[11px] text-slate-500 block">Đánh giá chung</span>
                <span className={`text-sm font-black ${assessment.color}`}>{assessment.label}</span>
              </div>
            </div>
          </div>

          {/* Competency Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
              2. ĐÁNH GIÁ CÁC NĂNG LỰC TOÁN HỌC CỐT LÕI (GDPT 2018):
            </h4>
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-2 border-r border-slate-300">Lĩnh vực toán học</th>
                  <th className="p-2 border-r border-slate-300 text-center w-28">Mức độ đạt được</th>
                  <th className="p-2">Nhận định chuyên môn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="p-2 border-r border-slate-300 font-bold">Số Học & Đại Số</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold font-mono text-indigo-700">
                    {student.skills.algebra}%
                  </td>
                  <td className="p-2 text-slate-700">
                    Nắm chắc quy tắc dấu, phép biến đổi đa thức và giải phương trình bậc nhất.
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 font-bold">Hình Học & Đo Lường</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold font-mono text-pink-700">
                    {student.skills.geometry}%
                  </td>
                  <td className="p-2 text-slate-700">
                    Nhận biết tốt định lý Pytago, quan hệ góc và các hình đối xứng.
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 font-bold">Thống Kê & Xác Suất</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold font-mono text-emerald-700">
                    {student.skills.statistics}%
                  </td>
                  <td className="p-2 text-slate-700">
                    Thu thập và biểu diễn số liệu trực quan qua biểu đồ chính xác.
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 font-bold">Tốc Độ Tính Nhẩm & Phản Xạ</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold font-mono text-amber-700">
                    {student.skills.speed}%
                  </td>
                  <td className="p-2 text-slate-700">
                    Phản xạ làm bài tập trắc nghiệm nhanh, tự tin khi tham gia đấu đội.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Teacher's Feedback */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              3. Ý KIẾN NHẬN XÉT & HƯỚNG DẪN CỦA GIÁO VIÊN BỘ MÔN:
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 leading-relaxed min-h-[60px]">
              {student.teacherNotes || assessment.note}
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              * Khuyến nghị phụ huynh: Cho con dành 15 phút mỗi ngày làm quen với các thử thách tính nhanh trên ứng dụng ngoại tuyến để duy trì tư duy linh hoạt.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">Ý KIẾN CỦA PHỤ HUYNH</p>
              <p className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
            </div>
            <div>
              <p className="font-bold text-slate-900">GIÁO VIÊN BỘ MÔN TOÁN</p>
              <p className="text-[10px] italic text-slate-500">(Ký và xác nhận)</p>
              <div className="h-16 flex items-end justify-center font-bold text-indigo-900">
                Thầy/Cô Giáo Toán THCS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
