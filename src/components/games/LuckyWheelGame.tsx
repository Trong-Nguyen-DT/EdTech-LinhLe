import React, { useState } from 'react';
import { Sparkles, Trophy, Play, RotateCcw, UserCheck, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Student } from '../../types';
import { MathText } from '../common/MathText';

interface Props {
  students: Student[];
  questions: Question[];
  onBackToHub: () => void;
}

export const LuckyWheelGame: React.FC<Props> = ({ students, questions, onBackToHub }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<Question | null>(null);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning || students.length === 0 || questions.length === 0) return;
    setIsSpinning(true);
    setSelectedStudent(null);
    setChallengeQuestion(null);

    // Pick random student and question
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];

    // Calculate rotation angle
    const extraRotations = 5 * 360;
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotation + extraRotations + randomAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedStudent(randomStudent);
      setChallengeQuestion(randomQ);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 3500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
            🎡
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Vòng Quay May Mắn - Kiểm Tra Bài Cũ</h2>
            <p className="text-xs text-slate-400">Bốc thăm học sinh ngẫu nhiên & câu hỏi thử thách đầu giờ</p>
          </div>
        </div>

        <button
          onClick={onBackToHub}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
        >
          ← Trở Về Sảnh Game
        </button>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-8">
        {/* Animated Wheel */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-md" />

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-8 border-slate-800 shadow-2xl shadow-indigo-950 flex items-center justify-center overflow-hidden transition-all duration-[3500ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(#6366f1 0deg 45deg, #ec4899 45deg 90deg, #eab308 90deg 135deg, #10b981 135deg 180deg, #3b82f6 180deg 225deg, #8b5cf6 225deg 270deg, #f43f5e 270deg 315deg, #06b6d4 315deg 360deg)'
            }}
          >
            <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center font-black text-amber-400 text-lg shadow-inner">
              🎯
            </div>
          </div>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning || students.length === 0}
          className="py-4 px-10 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base shadow-xl shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isSpinning ? 'Đang quay...' : 'Quay Bốc Thăm Ngẫu Nhiên'}</span>
        </button>

        {/* Selected Result */}
        {selectedStudent && challengeQuestion && (
          <div className="p-6 rounded-3xl bg-slate-950 border-2 border-amber-500/40 space-y-4 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedStudent.avatar}</span>
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Học sinh được gọi lên bảng:</span>
                  <h3 className="text-xl font-black text-white">{selectedStudent.name}</h3>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                {selectedStudent.totalPoints} điểm tích lũy
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Câu Hỏi Kiểm Tra Bài Cũ ({challengeQuestion.grade} - {challengeQuestion.category}):
              </span>
              <p className="text-base font-bold text-white bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed">
                <MathText text={challengeQuestion.prompt} />
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 leading-relaxed">
              {challengeQuestion.questionType === 'essay' || !challengeQuestion.options?.[challengeQuestion.correctAnswer] ? (
                <>
                  <strong className="text-amber-400 font-bold">Câu tự luận — Gợi ý lời giải: </strong>
                  <MathText text={challengeQuestion.explanation} />
                </>
              ) : (
                <>
                  <strong className="text-emerald-400 font-bold">Đáp án chuẩn: </strong>
                  <MathText text={challengeQuestion.options[challengeQuestion.correctAnswer]} />{' '}
                  (<MathText text={challengeQuestion.explanation} />)
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
