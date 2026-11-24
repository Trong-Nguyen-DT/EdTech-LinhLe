import React, { Suspense, lazy, useState } from 'react';
import { 
  BookMarked, Gamepad2, FileCheck2, ClipboardList, 
  Sparkles, Award, User, Flame 
} from 'lucide-react';
import { ClassGroup, GameHistoryItem, KnowledgeLesson, Question, Student } from '../../types';
import { KnowledgeHub } from '../knowledge/KnowledgeHub';
import { GameHub } from '../games/GameHub';
import { KnowledgeClimbGame } from '../games/KnowledgeClimbGame';
import { SpeedFlashMathGame } from '../games/SpeedFlashMathGame';
import { FormulaMatchGame } from '../games/FormulaMatchGame';
import { TeamArenaGame } from '../games/TeamArenaGame';
import { LuckyWheelGame } from '../games/LuckyWheelGame';
import { MockExamRoom } from '../exams/MockExamRoom';
import { HomeworkModule } from '../homework/HomeworkModule';

const FaceControlMathGame = lazy(() =>
  import('../games/FaceControlMathGame').then((m) => ({
    default: m.FaceControlMathGame,
  }))
);

export type StudentSubTab = 'knowledge' | 'games' | 'exams' | 'homework';

interface Props {
  students: Student[];
  classes: ClassGroup[];
  questions: Question[];
  knowledgeLessons?: KnowledgeLesson[];
  history: GameHistoryItem[];
  activeStudentId: string | null;
  onStudentSelect: (id: string) => void;
  isTeacherUnlocked: boolean;
  onRequestTeacherUnlock?: (target?: string) => void;
  onRequestChangeStudent?: () => void;
  initialSubTab?: StudentSubTab;
  lockedClassId?: string | null;
}

export const StudentCorner: React.FC<Props> = ({
  students,
  classes,
  questions,
  knowledgeLessons,
  history,
  activeStudentId,
  onStudentSelect,
  isTeacherUnlocked,
  onRequestTeacherUnlock,
  onRequestChangeStudent,
  initialSubTab = 'games',
  lockedClassId
}) => {
  const [subTab, setSubTab] = useState<StudentSubTab>(initialSubTab);
  const [currentGame, setCurrentGame] = useState<'climb' | 'speed' | 'match' | 'team_arena' | 'wheel' | 'face_quiz' | null>(null);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];
  const effectiveClassId = lockedClassId || activeStudent?.classId;
  const activeClass = classes.find(c => c.id === effectiveClassId);
  const scopedClasses = lockedClassId && activeClass ? [activeClass] : classes;
  const scopedStudents = lockedClassId ? students.filter(s => s.classId === lockedClassId) : students;
  const lockedGrade = lockedClassId ? activeClass?.grade : undefined;
  const lockedClassName = lockedClassId ? activeClass?.name : undefined;

  const handleSelectGame = (gameId: 'climb' | 'speed' | 'match' | 'team_arena' | 'wheel' | 'face_quiz') => {
    setCurrentGame(gameId);
  };

  const handleBackToHub = () => {
    setCurrentGame(null);
  };

  const subTabs = [
    {
      id: 'knowledge' as StudentSubTab,
      label: 'Kiến Thức Trọng Tâm',
      shortLabel: 'Kiến Thức',
      icon: BookMarked,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Toán 6-9'
    },
    {
      id: 'games' as StudentSubTab,
      label: 'Thi Đua Tự Học',
      shortLabel: 'Thi Đua',
      icon: Gamepad2,
      color: 'from-purple-600 to-pink-600',
      badge: `${activeStudent?.streakCount || 0} ngày 🔥`
    },
    {
      id: 'exams' as StudentSubTab,
      label: 'Thi Thử Giữa & Cuối Kì',
      shortLabel: 'Thi Thử',
      icon: FileCheck2,
      color: 'from-amber-600 to-orange-600',
      badge: 'Đại trà & Hòa nhập'
    },
    {
      id: 'homework' as StudentSubTab,
      label: 'Bài Tập Về Nhà',
      shortLabel: 'BTVN',
      icon: ClipboardList,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Hạn nộp'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Student Corner Top Control Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Active Student Info Pill */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
            {activeStudent?.avatar || '👨‍🎓'}
          </div>
          <div>
            {onRequestChangeStudent && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md mb-1">
                Chế độ Giáo viên xem thử góc nhìn học sinh
              </span>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-white text-base sm:text-lg">
                {activeStudent?.name || 'Học Sinh Toán THCS'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                {activeClass?.name || 'Lớp 8A3'} ({activeClass?.grade || 'Toán 8'})
              </span>
              {activeStudent?.isInclusive && (
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30 flex items-center gap-1">
                  🌱 Hòa Nhập
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
              <span>Mã HS: <strong className="font-mono text-slate-200">{activeStudent?.studentCode}</strong></span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{activeStudent?.totalPoints || 0} XP</span>
              {onRequestChangeStudent && (
                <>
                  <span>•</span>
                  <button
                    onClick={onRequestChangeStudent}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                  >
                    Đổi mã HS
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* 4-Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto max-w-full">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSubTab(tab.id);
                  if (currentGame !== null) setCurrentGame(null);
                }}
                className={`relative px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg shadow-indigo-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive ? 'bg-black/25 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB CONTENT AREA */}
      <div>
        {/* 1. KIẾN THỨC TRỌNG TÂM */}
        {subTab === 'knowledge' && (
          <KnowledgeHub
            students={scopedStudents}
            lessons={knowledgeLessons}
            activeStudentId={activeStudentId}
            onStudentSelect={onStudentSelect}
            onRequestChangeStudent={onRequestChangeStudent}
            lockedGrade={lockedGrade}
            lockedClassName={lockedClassName}
          />
        )}

        {/* 2. THI ĐUA TỰ HỌC TẠI NHÀ (GAME HUB & GAMES) */}
        {subTab === 'games' && (
          <>
            {currentGame === null && (
              <GameHub
                students={scopedStudents}
                classes={scopedClasses}
                activeStudentId={activeStudentId}
                onStudentSelect={onStudentSelect}
                onSelectGame={handleSelectGame}
                onRequestChangeStudent={onRequestChangeStudent}
                onNavigateToKnowledge={() => setSubTab('knowledge')}
                lockedClassId={lockedClassId}
              />
            )}

            {currentGame === 'climb' && (
              <KnowledgeClimbGame
                students={scopedStudents}
                questions={questions}
                activeStudentId={activeStudentId}
                onStudentSelect={onStudentSelect}
                onBackToHub={handleBackToHub}
                lockedGrade={lockedGrade}
                lockedClassName={lockedClassName}
              />
            )}

            {currentGame === 'speed' && (
              <SpeedFlashMathGame
                students={scopedStudents}
                activeStudentId={activeStudentId}
                onStudentSelect={onStudentSelect}
                onBackToHub={handleBackToHub}
              />
            )}

            {currentGame === 'match' && (
              <FormulaMatchGame
                students={scopedStudents}
                activeStudentId={activeStudentId}
                onStudentSelect={onStudentSelect}
                onBackToHub={handleBackToHub}
              />
            )}

            {currentGame === 'team_arena' && (
              <TeamArenaGame
                students={scopedStudents}
                questions={questions}
                onBackToHub={handleBackToHub}
                lockedGrade={lockedGrade}
                lockedClassName={lockedClassName}
              />
            )}

            {currentGame === 'wheel' && (
              <LuckyWheelGame
                students={scopedStudents}
                questions={lockedGrade ? questions.filter(q => q.grade === lockedGrade) : questions}
                onBackToHub={handleBackToHub}
              />
            )}

            {currentGame === 'face_quiz' && (
              <div className="rounded-3xl overflow-hidden border border-blue-200 shadow-2xl">
                <Suspense
                  fallback={
                    <div className="min-h-[420px] bg-[#EFF6FF] text-blue-900 flex items-center justify-center p-6 font-bold">
                      Đang tải trò chơi Toán tương tác khuôn mặt...
                    </div>
                  }
                >
                  <FaceControlMathGame
                    onBack={handleBackToHub}
                    backLabel="Quay lại Thi Đua"
                  />
                </Suspense>
              </div>
            )}
          </>
        )}

        {/* 3. THI THỬ GIỮA & CUỐI KÌ */}
        {subTab === 'exams' && (
          <MockExamRoom
            students={scopedStudents}
            classes={scopedClasses}
            activeStudentId={activeStudentId}
            onStudentSelect={onStudentSelect}
            isTeacherUnlocked={isTeacherUnlocked}
            onRequestTeacherUnlock={onRequestTeacherUnlock ? () => onRequestTeacherUnlock('exams') : undefined}
            onRequestChangeStudent={onRequestChangeStudent}
            lockedGrade={lockedGrade}
            lockedClassId={lockedClassId}
          />
        )}

        {/* 4. BÀI TẬP VỀ NHÀ */}
        {subTab === 'homework' && (
          <HomeworkModule
            students={scopedStudents}
            classes={scopedClasses}
            activeStudentId={activeStudentId}
            onStudentSelect={onStudentSelect}
            isTeacherUnlocked={isTeacherUnlocked}
            onRequestTeacherUnlock={onRequestTeacherUnlock ? () => onRequestTeacherUnlock('homework') : undefined}
            onRequestChangeStudent={onRequestChangeStudent}
            lockedClassId={lockedClassId}
          />
        )}
      </div>
    </div>
  );
};
