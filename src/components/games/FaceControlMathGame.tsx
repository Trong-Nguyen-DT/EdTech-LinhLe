import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { MathText } from '../common/MathText';

interface FaceQuizQuestion {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  correctOption: 'A' | 'B';
  explanation: string;
}

interface AnswerRecord {
  questionId: string;
  selected: 'A' | 'B';
  correct: 'A' | 'B';
  isCorrect: boolean;
}

interface FaceControlMathGameProps {
  onBack?: () => void;
  backLabel?: string;
}

const GRADES = [
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
];

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  'Lớp 3': ['Phép chia có dư Toán 3', 'Bảng nhân chia và giải toán có lời văn', 'Chu vi hình chữ nhật, hình vuông'],
  'Lớp 4': ['Phân số và quy đồng mẫu số Toán 4', 'Phép tính với số tự nhiên', 'Hình bình hành và hình thoi'],
  'Lớp 5': ['Tỉ số phần trăm Toán 5', 'Diện tích hình tam giác, hình thang', 'Số thập phân và các phép tính'],
  'Lớp 6': ['Ước chung lớn nhất và Bội chung nhỏ nhất Toán 6', 'Số nguyên và quy tắc dấu ngoặc', 'Phân số và số thập phân Toán 6'],
  'Lớp 7': ['Tỉ lệ thức và dãy tỉ số bằng nhau Toán 7', 'Tổng ba góc của một tam giác', 'Tam giác bằng nhau Toán 7'],
  'Lớp 8': ['Định lí Pythagore Toán 8', 'Hằng đẳng thức đáng nhớ Toán 8', 'Phương trình bậc nhất một ẩn'],
  'Lớp 9': ['Hàm số bậc nhất Toán 9', 'Hệ thức lượng trong tam giác vuông', 'Phương trình bậc hai và định lí Vi-ét'],
  'Lớp 10': ['Mệnh đề và tập hợp Toán 10', 'Hệ bất phương trình bậc nhất hai ẩn', 'Hệ thức lượng trong tam giác Toán 10'],
};

const HOLD_SELECT_MS = 1000; // Hold tilt >= 13 deg for 1.0s
const MOUTH_ADVANCE_MS = 240; // Brief open-mouth confirmation to avoid blinks/noise
const EXPLANATION_GRACE_MS = 700; // Wait before mouth-open trigger activates
const TILT_THRESHOLD_DEG = 13; // ~15 degrees comfortable trigger zone

type GamePhase = 'setup' | 'playing' | 'explanation' | 'summary';

export const FaceControlMathGame: React.FC<FaceControlMathGameProps> = ({
  onBack,
  backLabel = 'Quay lại',
}) => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [grade, setGrade] = useState<string>('Lớp 8');
  const [topic, setTopic] = useState<string>('Định lí Pythagore Toán 8');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [questions, setQuestions] = useState<FaceQuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string>('');

  // Gameplay state
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lastSelected, setLastSelected] = useState<'A' | 'B' | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Summary AI feedback
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);

  // Camera & MediaPipe state
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('');
  const [headAngleDeg, setHeadAngleDeg] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [tiltSide, setTiltSide] = useState<'A' | 'B' | null>(null);
  const [tiltProgress, setTiltProgress] = useState<number>(0); // 0..1
  const [mouthOpenScore, setMouthOpenScore] = useState<number>(0);
  const [mouthHoldProgress, setMouthHoldProgress] = useState<number>(0); // 0..1

  // Refs for RAF loop and clean teardown
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const phaseRef = useRef<GamePhase>(phase);
  phaseRef.current = phase;

  const currentIdxRef = useRef<number>(currentIdx);
  currentIdxRef.current = currentIdx;

  const questionsRef = useRef<FaceQuizQuestion[]>(questions);
  questionsRef.current = questions;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const smoothedAngleRef = useRef<number>(0);
  const tiltStartRef = useRef<{ side: 'A' | 'B' | null; startedAt: number }>({
    side: null,
    startedAt: 0,
  });
  const explanationEnteredAtRef = useRef<number>(0);
  const mouthHoldStartRef = useRef<number>(0);
  const selectionLockedRef = useRef<boolean>(false);

  // Web Audio API Synthesized Sound Effects
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback(
    (type: 'correct' | 'wrong' | 'advance' | 'finish') => {
      if (!soundEnabledRef.current) return;
      const ctx = getAudioCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, duration: number, wave: OscillatorType = 'sine', vol = 0.14) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      };

      if (type === 'correct') {
        playTone(523.25, now, 0.16, 'triangle', 0.16); // C5
        playTone(659.25, now + 0.09, 0.18, 'triangle', 0.16); // E5
        playTone(783.99, now + 0.18, 0.28, 'triangle', 0.18); // G5
      } else if (type === 'wrong') {
        playTone(260, now, 0.18, 'sine', 0.12);
        playTone(210, now + 0.14, 0.24, 'sine', 0.12);
      } else if (type === 'advance') {
        playTone(587.33, now, 0.12, 'sine', 0.1);
      } else if (type === 'finish') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
          playTone(f, now + idx * 0.1, 0.3, 'triangle', 0.16);
        });
      }
    },
    [getAudioCtx]
  );

  // Timer during playing & explanation phases
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'explanation') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Fetch AI Feedback upon reaching summary
  const requestSummaryFeedback = useCallback(
    async (finalScore: number, finalCorrect: number, finalDuration: number, totalQ: number) => {
      setIsLoadingFeedback(true);
      try {
        const res = await fetch('./api/ai/face-quiz-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade,
            topic,
            score: finalScore,
            totalScore: totalQ * 10,
            correctCount: finalCorrect,
            totalQuestions: totalQ,
            durationSeconds: finalDuration,
          }),
        });
        const data = await res.json();
        if (data?.feedback) {
          setAiFeedback(data.feedback);
        } else {
          setAiFeedback(
            `Em đã hoàn thành ${finalCorrect}/${totalQ} câu với ${finalScore} điểm. Tiếp tục phát huy tinh thần học tập tích cực nhé!`
          );
        }
      } catch {
        setAiFeedback(
          `Em đã hoàn thành ${finalCorrect}/${totalQ} câu với ${finalScore} điểm. Cố gắng rất tốt!`
        );
      } finally {
        setIsLoadingFeedback(false);
      }
    },
    [grade, topic]
  );

  const handleSelectAnswer = useCallback(
    (choice: 'A' | 'B') => {
      if (phaseRef.current !== 'playing' || selectionLockedRef.current) return;
      const q = questionsRef.current[currentIdxRef.current];
      if (!q) return;

      selectionLockedRef.current = true;
      const isCorrect = choice === q.correctOption;

      setLastSelected(choice);
      setTiltSide(null);
      setTiltProgress(0);
      tiltStartRef.current = { side: null, startedAt: 0 };
      mouthHoldStartRef.current = 0;
      setMouthHoldProgress(0);

      if (isCorrect) {
        setScore((prev) => prev + 10);
        playSound('correct');
      } else {
        playSound('wrong');
      }

      setAnswers((prev) => [
        ...prev,
        {
          questionId: q.id,
          selected: choice,
          correct: q.correctOption,
          isCorrect,
        },
      ]);

      explanationEnteredAtRef.current = performance.now();
      setPhase('explanation');
    },
    [playSound]
  );

  const handleAdvanceQuestion = useCallback(() => {
    if (phaseRef.current !== 'explanation') return;
    mouthHoldStartRef.current = 0;
    setMouthHoldProgress(0);
    tiltStartRef.current = { side: null, startedAt: 0 };
    setTiltSide(null);
    setTiltProgress(0);
    selectionLockedRef.current = false;

    const nextIdx = currentIdxRef.current + 1;
    if (nextIdx >= questionsRef.current.length) {
      playSound('finish');
      setPhase('summary');
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
      });

      const finalCorrect = answers.filter((a) => a.isCorrect).length;
      const finalScore = finalCorrect * 10;
      requestSummaryFeedback(finalScore, finalCorrect, elapsedSeconds, questionsRef.current.length);
    } else {
      playSound('advance');
      setLastSelected(null);
      setCurrentIdx(nextIdx);
      setPhase('playing');
    }
  }, [answers, elapsedSeconds, playSound, requestSummaryFeedback]);

  // Ref wrappers so RAF loop always invokes freshest handlers
  const handleSelectAnswerRef = useRef(handleSelectAnswer);
  handleSelectAnswerRef.current = handleSelectAnswer;

  const handleAdvanceQuestionRef = useRef(handleAdvanceQuestion);
  handleAdvanceQuestionRef.current = handleAdvanceQuestion;

  // Cleanup camera & MediaPipe
  const stopCameraAndLandmarker = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close();
      } catch {
        // ignore close errors
      }
      landmarkerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCameraAndLandmarker();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopCameraAndLandmarker]);

  // Initialize Webcam + MediaPipe FaceLandmarker whenever entering playing/explanation
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'explanation') return;
    if (streamRef.current && landmarkerRef.current) return;

    let cancelled = false;

    const initVision = async () => {
      setCameraStatus('loading');
      setCameraErrorMsg('');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Trình duyệt không hỗ trợ truy cập Camera.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        const vision = await FilesetResolver.forVisionTasks('./mediapipe/wasm');
        if (cancelled) return;

        let landmarker: FaceLandmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: './mediapipe/face_landmarker.task',
              delegate: 'GPU',
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        } catch {
          // CPU delegate fallback if WebGL/GPU unavailable
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: './mediapipe/face_landmarker.task',
              delegate: 'CPU',
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        }

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setCameraStatus('ready');

        let lastVideoTime = -1;

        const detectLoop = () => {
          if (cancelled) return;
          const videoEl = videoRef.current;
          const lm = landmarkerRef.current;

          if (videoEl && lm && videoEl.readyState >= 2) {
            const nowMs = performance.now();
            if (videoEl.currentTime !== lastVideoTime) {
              lastVideoTime = videoEl.currentTime;
              try {
                const result = lm.detectForVideo(videoEl, nowMs);
                const landmarks = result.faceLandmarks?.[0];

                if (landmarks && landmarks.length > 263) {
                  setFaceDetected(true);

                  // Mirrored video screen coordinates:
                  // screenX_leftEye (anatomical left eye #263 -> left on mirrored screen)
                  // screenX_rightEye (anatomical right eye #33 -> right on mirrored screen)
                  const leftEyeScreenX = 1 - landmarks[263].x;
                  const rightEyeScreenX = 1 - landmarks[33].x;
                  const dx = rightEyeScreenX - leftEyeScreenX;
                  const dy = landmarks[33].y - landmarks[263].y;

                  const rawDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
                  const smoothed = smoothedAngleRef.current * 0.72 + rawDeg * 0.28;
                  smoothedAngleRef.current = smoothed;
                  setHeadAngleDeg(Math.round(smoothed));

                  // Handle Tilt Hold during 'playing'
                  if (phaseRef.current === 'playing' && !selectionLockedRef.current) {
                    let activeSide: 'A' | 'B' | null = null;
                    if (smoothed <= -TILT_THRESHOLD_DEG) {
                      activeSide = 'A';
                    } else if (smoothed >= TILT_THRESHOLD_DEG) {
                      activeSide = 'B';
                    }

                    if (activeSide) {
                      if (tiltStartRef.current.side !== activeSide) {
                        tiltStartRef.current = { side: activeSide, startedAt: nowMs };
                        setTiltSide(activeSide);
                        setTiltProgress(0);
                      } else {
                        const heldMs = nowMs - tiltStartRef.current.startedAt;
                        const progress = Math.min(1, heldMs / HOLD_SELECT_MS);
                        setTiltSide(activeSide);
                        setTiltProgress(progress);
                        if (progress >= 1) {
                          handleSelectAnswerRef.current(activeSide);
                        }
                      }
                    } else {
                      if (tiltStartRef.current.side !== null) {
                        tiltStartRef.current = { side: null, startedAt: 0 };
                        setTiltSide(null);
                        setTiltProgress(0);
                      }
                    }
                  }

                  // Handle Open Mouth during 'explanation'
                  const categories = result.faceBlendshapes?.[0]?.categories;
                  const jawOpenCat = categories?.find(
                    (c: { categoryName: string; score: number }) => c.categoryName === 'jawOpen'
                  );
                  let jawScore = jawOpenCat ? jawOpenCat.score : 0;

                  // Geometric fallback using upper/lower inner lip distance (#13, #14) vs face height (#10, #152)
                  if (!jawOpenCat && landmarks[14] && landmarks[13] && landmarks[152] && landmarks[10]) {
                    const lipGap = Math.abs(landmarks[14].y - landmarks[13].y);
                    const faceHeight = Math.max(0.05, Math.hypot(landmarks[152].x - landmarks[10].x, landmarks[152].y - landmarks[10].y));
                    jawScore = Math.min(1, (lipGap / faceHeight) * 5.2);
                  }

                  setMouthOpenScore(jawScore);

                  if (phaseRef.current === 'explanation') {
                    const sinceExplanation = nowMs - explanationEnteredAtRef.current;
                    if (sinceExplanation >= EXPLANATION_GRACE_MS && jawScore >= 0.42) {
                      if (mouthHoldStartRef.current === 0) {
                        mouthHoldStartRef.current = nowMs;
                      }
                      const mProgress = Math.min(1, (nowMs - mouthHoldStartRef.current) / MOUTH_ADVANCE_MS);
                      setMouthHoldProgress(mProgress);
                      if (mProgress >= 1) {
                        handleAdvanceQuestionRef.current();
                      }
                    } else {
                      mouthHoldStartRef.current = 0;
                      setMouthHoldProgress(0);
                    }
                  }
                } else {
                  setFaceDetected(false);
                  tiltStartRef.current = { side: null, startedAt: 0 };
                  setTiltSide(null);
                  setTiltProgress(0);
                  mouthHoldStartRef.current = 0;
                  setMouthHoldProgress(0);
                }
              } catch {
                // Keep loop resilient across dropped frames
              }
            }
          }
          rafRef.current = requestAnimationFrame(detectLoop);
        };

        rafRef.current = requestAnimationFrame(detectLoop);
      } catch (err: unknown) {
        if (!cancelled) {
          setCameraStatus('error');
          const msg = err instanceof Error ? err.message : 'Không thể bật camera.';
          setCameraErrorMsg(
            msg.includes('Permission') || msg.includes('NotAllowed')
              ? 'Chưa được cấp quyền Camera. Bạn vẫn có thể chọn đáp án bằng chuột hoặc phím mũi tên ← / →.'
              : `${msg} Bạn vẫn có thể chơi bằng chuột hoặc phím ← / →.`
          );
        }
      }
    };

    initVision();

    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Attach stream whenever video element mounts
  useEffect(() => {
    if ((phase === 'playing' || phase === 'explanation') && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [phase, cameraStatus]);

  // Keyboard fallback: Left Arrow -> A, Right Arrow -> B, Space/Enter -> Next
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current === 'playing') {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          e.preventDefault();
          handleSelectAnswer('A');
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'b') {
          e.preventDefault();
          handleSelectAnswer('B');
        }
      } else if (phaseRef.current === 'explanation') {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleAdvanceQuestion();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAdvanceQuestion, handleSelectAnswer]);

  // Generate 10 questions via Gemini API
  const handleStartGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setGenerateError('Vui lòng nhập tên chủ đề bài học.');
      return;
    }

    setGenerateError('');
    setIsGenerating(true);
    // Warm up AudioContext inside user gesture
    getAudioCtx();

    try {
      const res = await fetch('./api/ai/generate-face-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, topic: topic.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể tạo bộ câu hỏi từ AI.');
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Dữ liệu câu hỏi trả về không hợp lệ.');
      }

      setQuizTitle(data.quizTitle || `${topic.trim()} (${grade})`);
      setQuestions(data.questions);
      setCurrentIdx(0);
      setScore(0);
      setAnswers([]);
      setLastSelected(null);
      setElapsedSeconds(0);
      setAiFeedback('');
      selectionLockedRef.current = false;
      setPhase('playing');
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplaySameQuiz = () => {
    setCurrentIdx(0);
    setScore(0);
    setAnswers([]);
    setLastSelected(null);
    setElapsedSeconds(0);
    setAiFeedback('');
    selectionLockedRef.current = false;
    setPhase('playing');
  };

  const handleChangeTopic = () => {
    stopCameraAndLandmarker();
    setCameraStatus('idle');
    setPhase('setup');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];
  const suggestions = useMemo(() => TOPIC_SUGGESTIONS[grade] || TOPIC_SUGGESTIONS['Lớp 8'], [grade]);

  const activeCorrectCount = answers.filter((a) => a.isCorrect).length;

  // Perimeter progress ring helper (SVG rect pathLength="100")
  const renderCardProgressBorder = (side: 'A' | 'B') => {
    if (phase !== 'playing' || tiltSide !== side || tiltProgress <= 0) return null;
    const strokeDashoffset = Math.max(0, 100 - tiltProgress * 100);
    return (
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full z-20"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="6"
          ry="6"
          fill="none"
          stroke={side === 'A' ? '#2563EB' : '#0284C7'}
          strokeWidth="3.5"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // ============================================================================
  // RENDER: SETUP SCREEN (Blue & White Classroom UI)
  // ============================================================================
  if (phase === 'setup') {
    return (
      <div data-theme-locked="light" className="min-h-screen bg-gradient-to-b from-[#EFF6FF] via-[#F8FBFF] to-[#E0EEFF] text-slate-900 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-blue-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-3 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{backLabel}</span>
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
                    Toán Tương Tác Khuôn Mặt
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kết nối tri thức với cuộc sống · Trình chiếu lớp học
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="px-3 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
            </button>
          </div>
        </header>

        {/* Setup Main Content */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form */}
          <form
            onSubmit={handleStartGame}
            className="lg:col-span-7 bg-white rounded-3xl border-2 border-blue-200 shadow-xl shadow-blue-900/5 p-6 sm:p-8 space-y-6"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Thiết lập bộ 10 câu hỏi AI
              </p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Chọn Khối Lớp & Chủ Đề Bài Học
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Hệ thống tự động tạo 10 câu hỏi trắc nghiệm 2 phương án (A / B) kèm công thức toán học và lời giải ngắn gọn.
              </p>
            </div>

            {/* Grade Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800">
                1. Chọn Khối Lớp (Lớp 3 – Lớp 10)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => {
                  const isActive = grade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setGrade(g);
                        const firstHint = TOPIC_SUGGESTIONS[g]?.[0];
                        if (firstHint) setTopic(firstHint);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-sm font-bold transition whitespace-nowrap shrink-0 border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-blue-50/60 text-slate-700 border-blue-200 hover:bg-blue-100/70'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2.5">
              <label htmlFor="face-quiz-topic" className="block text-sm font-bold text-slate-800">
                2. Chủ đề bài học (SGK Kết nối tri thức với cuộc sống)
              </label>
              <input
                id="face-quiz-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Định lí Pythagore Toán 8, Phép chia có dư Toán 3..."
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-blue-200 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />

              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition text-left ${
                      topic === sug
                        ? 'bg-blue-100 border-blue-400 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {generateError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generateError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-wait"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tạo 10 câu hỏi Toán bằng AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Tạo Bộ Câu Hỏi & Bật Camera</span>
                </>
              )}
            </button>
          </form>

          {/* Right: Classroom Gesture Guide */}
          <aside className="lg:col-span-5 bg-white rounded-3xl border-2 border-blue-200 shadow-lg shadow-blue-900/5 p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-blue-100">
              <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900">
                Hướng dẫn điều khiển bằng khuôn mặt
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0">
                  A
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Nghiêng đầu sang trái (~15°)</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Giữ trong <strong>1 giây</strong> đến khi viền xanh chạy đủ vòng để chốt chọn <strong>Đáp án A</strong> (bên trái).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center shrink-0">
                  B
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Nghiêng đầu sang phải (~15°)</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Giữ trong <strong>1 giây</strong> đến khi viền xanh chạy đủ vòng để chốt chọn <strong>Đáp án B</strong> (bên phải).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  😮
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Há miệng sau khi xem giải thích</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Sau khi chọn đáp án và đọc lời giải thích ngắn gọn, chỉ cần <strong>mở miệng</strong> để chuyển nhanh sang câu tiếp theo.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100 text-xs text-slate-500 leading-relaxed">
              Mỗi câu đúng cộng <strong className="text-blue-700">+10 điểm</strong>. Nếu lớp học chưa gắn webcam, giáo viên hoặc học sinh vẫn có thể bấm chuột vào thẻ A/B hoặc dùng phím mũi tên ← / →.
            </div>
          </aside>
        </main>
      </div>
    );
  }

  // ============================================================================
  // RENDER: SUMMARY SCREEN
  // ============================================================================
  if (phase === 'summary') {
    const totalQ = questions.length || 10;
    const accuracy = Math.round((activeCorrectCount / totalQ) * 100);

    return (
      <div data-theme-locked="light" className="min-h-screen bg-gradient-to-b from-[#EFF6FF] via-[#F8FBFF] to-[#E0EEFF] text-slate-900 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-xl shadow-blue-900/5 p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/25">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Tổng kết kết quả · {grade} · {quizTitle || topic}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                Hoàn Thành Xuất Sắc!
              </h2>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-xs font-bold text-blue-700 block">Tổng điểm</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-700 tabular-nums mt-1 block">
                  {score}/{totalQ * 10}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 block">Số câu đúng</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums mt-1 block">
                  {activeCorrectCount}/{totalQ} ({accuracy}%)
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <span className="text-xs font-bold text-sky-700 block">Thời gian</span>
                <span className="text-2xl sm:text-3xl font-black text-sky-700 tabular-nums mt-1 block">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* AI Encouraging Feedback */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-700">
                <Sparkles className="w-4 h-4" />
                <span>Nhận xét động viên từ AI</span>
              </div>
              {isLoadingFeedback ? (
                <div className="flex items-center gap-2 text-sm text-slate-600 py-1">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Đang viết lời nhận xét riêng cho em...</span>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                  {aiFeedback}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReplaySameQuiz}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 transition whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Bộ Này</span>
              </button>
              <button
                type="button"
                onClick={handleChangeTopic}
                className="px-6 py-3 rounded-xl bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold text-sm flex items-center gap-2 transition whitespace-nowrap shrink-0"
              >
                <Play className="w-4 h-4" />
                <span>Đổi Chủ Đề Mới</span>
              </button>
              {onBack && (
                <button
                  type="button"
                  onClick={() => {
                    stopCameraAndLandmarker();
                    onBack();
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2 transition whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{backLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* Review All 10 Questions */}
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-lg p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Xem lại 10 câu hỏi và lời giải thích
            </h3>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const rec = answers[idx];
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      rec?.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        <span className="text-blue-700 mr-1.5">Câu {idx + 1}:</span>
                        <MathText text={q.prompt} />
                      </p>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
                          rec?.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec?.isCorrect ? 'Đúng (+10)' : `Chọn ${rec?.selected || '—'} · Đúng ${q.correctOption}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-2">
                      <strong>Đáp án đúng ({q.correctOption}):</strong>{' '}
                      <MathText text={q.correctOption === 'A' ? q.optionA : q.optionB} />
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Giải thích:</strong> <MathText text={q.explanation} />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PLAYING & EXPLANATION STAGE (Camera top-center, Card A left, Card B right)
  // ============================================================================
  const lastRecord = answers[answers.length - 1];
  const isCurrentCorrect = lastRecord?.isCorrect ?? false;

  const getCardStyle = (side: 'A' | 'B') => {
    if (phase === 'explanation' && currentQuestion) {
      const isRightAnswer = currentQuestion.correctOption === side;
      const isChosen = lastSelected === side;
      if (isRightAnswer) {
        return 'bg-emerald-50 border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-400/30';
      }
      if (isChosen && !isRightAnswer) {
        return 'bg-rose-50 border-rose-500 shadow-rose-500/20 ring-4 ring-rose-400/30';
      }
      return 'bg-white/70 border-slate-200 opacity-75';
    }

    if (tiltSide === side) {
      return 'bg-blue-50 border-blue-600 shadow-xl shadow-blue-600/20 scale-[1.015]';
    }
    return 'bg-white border-blue-200 hover:border-blue-500 hover:shadow-xl shadow-lg shadow-blue-900/5';
  };

  return (
    <div data-theme-locked="light" className="min-h-screen bg-gradient-to-b from-[#EFF6FF] via-[#F8FBFF] to-[#DBEAFE] text-slate-900 flex flex-col">
      {/* Compact Classroom Top Header */}
      <header className="bg-white/95 border-b border-blue-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleChangeTopic}
              className="px-3 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Đổi chủ đề</span>
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-700 truncate">
                {grade} · {quizTitle || topic}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-28 sm:w-40 h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentIdx + (phase === 'explanation' ? 1 : 0)) / Math.max(1, questions.length)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
                  Câu {currentIdx + 1}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Live Score & Timer */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-sm tabular-nums shadow-sm whitespace-nowrap">
              {score} điểm
            </div>
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-sm tabular-nums flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 transition shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Arena: Top-center Camera + Question Banner + Left A / Right B */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
        {/* TOP-CENTER: Webcam Frame + Live Head Angle Calibration */}
        <section className="flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm aspect-[4/3] max-h-[235px] rounded-3xl overflow-hidden border-4 border-blue-500 bg-slate-900 shadow-xl shadow-blue-900/15">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {/* Top Camera Overlay Badges */}
            <div className="absolute top-2.5 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
              <span
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 ${
                  cameraStatus === 'ready'
                    ? faceDetected
                      ? 'bg-blue-600/85 text-white'
                      : 'bg-amber-500/90 text-slate-950'
                    : 'bg-slate-900/80 text-white'
                }`}
              >
                {cameraStatus === 'ready' ? (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>{faceDetected ? `Góc nghiêng: ${headAngleDeg > 0 ? `+${headAngleDeg}` : headAngleDeg}°` : 'Hãy nhìn vào camera'}</span>
                  </>
                ) : cameraStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang khởi tạo AI khuôn mặt...</span>
                  </>
                ) : (
                  <>
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Chế độ bấm phím / chuột</span>
                  </>
                )}
              </span>

              {cameraStatus === 'ready' && faceDetected && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 text-blue-800 backdrop-blur-md tabular-nums">
                  {tiltSide === 'A'
                    ? `← Giữ A ${Math.round(tiltProgress * 100)}%`
                    : tiltSide === 'B'
                    ? `Giữ B ${Math.round(tiltProgress * 100)}% →`
                    : 'Thẳng đầu'}
                </span>
              )}
            </div>

            {/* Bottom Tilt Meter Bar inside Camera */}
            {cameraStatus === 'ready' && phase === 'playing' && (
              <div className="absolute bottom-2.5 inset-x-4 pointer-events-none space-y-1">
                <div className="flex justify-between text-[10px] font-extrabold text-white drop-shadow">
                  <span>← NGHIÊNG TRÁI (A)</span>
                  <span>NGHIÊNG PHẢI (B) →</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900/70 border border-white/30 relative overflow-hidden">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/70 -translate-x-1/2" />
                  <div
                    className="absolute top-0 bottom-0 w-4 rounded-full bg-sky-400 shadow transition-all duration-75"
                    style={{
                      left: `calc(${Math.max(5, Math.min(95, 50 + (headAngleDeg / 30) * 45))}% - 8px)`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Camera Error Overlay */}
            {cameraStatus === 'error' && (
              <div className="absolute inset-0 bg-slate-900/90 text-white p-4 flex flex-col items-center justify-center text-center gap-2">
                <CameraOff className="w-8 h-8 text-blue-300" />
                <p className="text-xs font-medium text-blue-100 leading-relaxed">{cameraErrorMsg}</p>
              </div>
            )}
          </div>
        </section>

        {/* CENTER: Question Prompt Card */}
        {currentQuestion && (
          <section className="bg-white rounded-3xl border-2 border-blue-200 shadow-lg shadow-blue-900/5 px-6 py-5 sm:px-8 sm:py-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Câu hỏi {currentIdx + 1} / {questions.length}
            </p>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
              <MathText text={currentQuestion.prompt} />
            </div>
          </section>
        )}

        {/* EXPLANATION BANNER (Shown after picking A or B) */}
        {phase === 'explanation' && currentQuestion && (
          <section
            className={`rounded-3xl border-2 p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isCurrentCorrect
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              {isCurrentCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-black">
                  {isCurrentCorrect
                    ? 'Chính xác! +10 điểm'
                    : `Chưa chính xác! Đáp án đúng là ${currentQuestion.correctOption}`}
                </p>
                <p className="text-sm sm:text-base font-medium leading-relaxed">
                  <strong>Giải thích: </strong>
                  <MathText text={currentQuestion.explanation} />
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAdvanceQuestion}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                {currentIdx + 1 >= questions.length ? 'Xem Tổng Kết →' : 'Câu Tiếp Theo →'}
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <span>😮 Há miệng để chuyển nhanh</span>
                {mouthOpenScore > 0.25 && (
                  <span className="px-2 py-0.5 rounded bg-blue-200/80 tabular-nums">
                    {Math.round(mouthHoldProgress * 100)}%
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* LEFT (OPTION A) & RIGHT (OPTION B) CARDS */}
        {currentQuestion && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1">
            {/* OPTION A - LEFT */}
            <button
              type="button"
              disabled={phase !== 'playing'}
              onClick={() => handleSelectAnswer('A')}
              className={`relative text-left p-6 sm:p-8 rounded-3xl border-4 transition-all flex flex-col justify-between min-h-[170px] cursor-pointer disabled:cursor-default overflow-hidden ${getCardStyle(
                'A'
              )}`}
            >
              {renderCardProgressBorder('A')}

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
                    A
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    ← Nghiêng đầu trái (1s)
                  </span>
                </div>

                {phase === 'playing' && tiltSide === 'A' && (
                  <span className="text-sm font-black text-blue-700 tabular-nums">
                    {Math.round(tiltProgress * 100)}%
                  </span>
                )}
              </div>

              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                <MathText text={currentQuestion.optionA} />
              </div>

              {/* Bottom Linear Hold Bar */}
              <div className="mt-5 h-2.5 w-full rounded-full bg-blue-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-75"
                  style={{ width: `${phase === 'playing' && tiltSide === 'A' ? tiltProgress * 100 : 0}%` }}
                />
              </div>
            </button>

            {/* OPTION B - RIGHT */}
            <button
              type="button"
              disabled={phase !== 'playing'}
              onClick={() => handleSelectAnswer('B')}
              className={`relative text-left p-6 sm:p-8 rounded-3xl border-4 transition-all flex flex-col justify-between min-h-[170px] cursor-pointer disabled:cursor-default overflow-hidden ${getCardStyle(
                'B'
              )}`}
            >
              {renderCardProgressBorder('B')}

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-sky-600/25 shrink-0">
                    B
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    Nghiêng đầu phải (1s) →
                  </span>
                </div>

                {phase === 'playing' && tiltSide === 'B' && (
                  <span className="text-sm font-black text-sky-700 tabular-nums">
                    {Math.round(tiltProgress * 100)}%
                  </span>
                )}
              </div>

              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                <MathText text={currentQuestion.optionB} />
              </div>

              {/* Bottom Linear Hold Bar */}
              <div className="mt-5 h-2.5 w-full rounded-full bg-sky-100 overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-75"
                  style={{ width: `${phase === 'playing' && tiltSide === 'B' ? tiltProgress * 100 : 0}%` }}
                />
              </div>
            </button>
          </section>
        )}
      </main>
    </div>
  );
};
