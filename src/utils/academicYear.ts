/**
 * Tính niên khóa mặc định theo thời điểm hiện tại.
 * Năm học tại Việt Nam bắt đầu từ tháng 8–9 hàng năm (VD: 11/2026 -> "2026 - 2027").
 */
export function getCurrentAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear} - ${startYear + 1}`;
}

export function normalizeAcademicYear(value?: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return getCurrentAcademicYear();
  return trimmed.replace(/\s*[-–]\s*/g, ' - ');
}

export function getPresetAcademicYears(date: Date = new Date()): string[] {
  const current = getCurrentAcademicYear(date);
  const startYear = parseInt(current.slice(0, 4), 10) || date.getFullYear();
  return [
    `${startYear + 1} - ${startYear + 2}`,
    `${startYear} - ${startYear + 1}`,
    `${startYear - 1} - ${startYear}`,
    `${startYear - 2} - ${startYear - 1}`,
  ];
}
