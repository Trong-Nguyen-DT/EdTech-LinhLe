import { QuestionType } from '../types';

export function isEssayQuestion(q?: { questionType?: QuestionType } | null): boolean {
  return q?.questionType === 'essay';
}

export interface CompressedImageResult {
  dataUrl: string;
  fileName: string;
  sizeKB: number;
}

export async function compressAnswerImage(
  file: File,
  maxDimension = 1280,
  quality = 0.78
): Promise<CompressedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ (.jpg, .png, .webp...).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh. Vui lòng thử lại.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Tệp ảnh bị lỗi hoặc không được trình duyệt hỗ trợ.'));
    image.src = rawDataUrl;
  });

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      dataUrl: rawDataUrl,
      fileName: file.name,
      sizeKB: Math.round((rawDataUrl.length * 0.75) / 1024),
    };
  }

  // Fill white background in case of transparent PNG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const compressedUrl = canvas.toDataURL('image/jpeg', quality);
  return {
    dataUrl: compressedUrl,
    fileName: file.name,
    sizeKB: Math.max(1, Math.round((compressedUrl.length * 0.75) / 1024)),
  };
}
