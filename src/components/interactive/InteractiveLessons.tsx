import React, { useState } from 'react';
import { Sparkles, Sliders, Scale, Triangle, Compass, Lightbulb, Play, RotateCcw } from 'lucide-react';

export const InteractiveLessons: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pythagoras' | 'balance' | 'triangle_angle'>('pythagoras');

  // --- Pythagoras State ---
  const [sideA, setSideA] = useState(6);
  const [sideB, setSideB] = useState(8);
  const sideC = Math.sqrt(sideA * sideA + sideB * sideB);
  const isTriple = Number.isInteger(sideC);

  const setPythagoreanTriple = (a: number, b: number) => {
    setSideA(a);
    setSideB(b);
  };

  // --- Balance Scale State ---
  const [coeffA, setCoeffA] = useState(2); // 2x + 6 = 14 => x = 4
  const [constB, setConstB] = useState(6);
  const [constC, setConstC] = useState(14);
  const [scaleStep, setScaleStep] = useState(1); // 1: initial, 2: subtracted b, 3: divided a

  const resetScale = () => {
    setScaleStep(1);
  };

  // --- Triangle Angle State ---
  const [angleA, setAngleA] = useState(60);
  const [angleB, setAngleB] = useState(70);
  const angleC = 180 - angleA - angleB;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Bài Giảng Tương Tác & Mô Phỏng Trực Quan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Công cụ hỗ trợ giáo viên trực quan hóa các định lý và phương trình toán học THCS trên lớp.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pythagoras')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeTab === 'pythagoras'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Triangle className="w-3.5 h-3.5" />
            Định Lý Pytago
          </button>

          <button
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeTab === 'balance'
                ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Cân Thăng Bằng (Phương Trình)
          </button>

          <button
            onClick={() => setActiveTab('triangle_angle')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeTab === 'triangle_angle'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tổng 3 Góc Tam Giác = 180°
          </button>
        </div>
      </div>

      {/* TAB 1: PYTHAGORAS THEOREM */}
      {activeTab === 'pythagoras' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Điều Chỉnh Độ Dài Cạnh Góc Vuông
            </h3>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Cạnh góc vuông a:</span>
                  <span className="text-indigo-400 font-mono text-sm">{sideA} cm</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="16"
                  value={sideA}
                  onChange={(e) => setSideA(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Cạnh góc vuông b:</span>
                  <span className="text-pink-400 font-mono text-sm">{sideB} cm</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="16"
                  value={sideB}
                  onChange={(e) => setSideB(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Triples */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-semibold block mb-2">Bộ 3 số Pytago mẫu:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { a: 3, b: 4, name: '3 - 4 - 5' },
                  { a: 6, b: 8, name: '6 - 8 - 10' },
                  { a: 5, b: 12, name: '5 - 12 - 13' },
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => setPythagoreanTriple(item.a, item.b)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Hệ Thức Tính Toán</h4>
              
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <p>a² = {sideA}² = <strong className="text-indigo-400">{sideA * sideA}</strong> cm²</p>
                <p>b² = {sideB}² = <strong className="text-pink-400">{sideB * sideB}</strong> cm²</p>
                <div className="pt-1 border-t border-slate-800 text-white font-bold">
                  a² + b² = {sideA * sideA} + {sideB * sideB} = <span className="text-emerald-400">{sideA * sideA + sideB * sideB}</span>
                </div>
                <div className="text-sm font-black text-amber-400 pt-1">
                  Cạnh huyền c = √({sideA * sideA + sideB * sideB}) ≈ {sideC.toFixed(2)} cm {isTriple ? '✨ (Số nguyên)' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Canvas */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between items-center min-h-[380px]">
            <span className="text-xs text-slate-400 font-semibold mb-2">Mô hình dựng diện tích hình vuông trên 3 cạnh:</span>

            {/* SVG Visual Model */}
            <svg viewBox="0 0 400 320" className="w-full max-w-sm h-64 select-none">
              <defs>
                <linearGradient id="gradA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="100%" stop-color="#4338ca" />
                </linearGradient>
                <linearGradient id="gradB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ec4899" />
                  <stop offset="100%" stop-color="#be185d" />
                </linearGradient>
                <linearGradient id="gradC" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="100%" stop-color="#047857" />
                </linearGradient>
              </defs>

              {/* Square on side A (Left) */}
              <rect
                x="80"
                y="140"
                width="60"
                height={Math.min(100, sideA * 8)}
                fill="url(#gradA)"
                opacity="0.8"
                rx="4"
              />
              <text x="110" y={140 + Math.min(100, sideA * 8) / 2} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                a² = {sideA * sideA}
              </text>

              {/* Square on side B (Bottom) */}
              <rect
                x="140"
                y="140"
                width={Math.min(130, sideB * 8)}
                height="60"
                fill="url(#gradB)"
                opacity="0.8"
                rx="4"
              />
              <text x={140 + Math.min(130, sideB * 8) / 2} y="175" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                b² = {sideB * sideB}
              </text>

              {/* The Right Triangle */}
              <polygon
                points={`140,140 140,${140 - Math.min(90, sideA * 6)} ${140 + Math.min(130, sideB * 8)},140`}
                fill="#facc15"
                opacity="0.4"
                stroke="#eab308"
                strokeWidth="3"
              />

              {/* Right angle marker */}
              <rect x="140" y="125" width="15" height="15" fill="none" stroke="#ffffff" strokeWidth="2" />

              {/* Hypotenuse Label */}
              <text x="190" y="80" fill="#34d399" fontSize="13" fontWeight="bold">
                c = {sideC.toFixed(1)} cm
              </text>
            </svg>

            <div className="w-full p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs text-center font-medium">
              💡 <strong>Định lý:</strong> Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông: <code className="font-mono font-bold text-amber-300">c² = a² + b²</code>.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALGEBRA BALANCE SCALE */}
      {activeTab === 'balance' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-white">
              Cân Thăng Bằng - Giải Phương Trình Bậc Nhất: {coeffA}x + {constB} = {constC}
            </h3>
            <p className="text-xs text-slate-400">
              Trực quan hóa nguyên lý biến đổi tương đương: thực hiện cùng một phép tính trên cả hai vế để giữ cân bằng.
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => setScaleStep(1)}
              className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                scaleStep === 1
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              1. Trạng thái ban đầu:
              <span className="block text-sm font-mono text-white mt-1">{coeffA}x + {constB} = {constC}</span>
            </button>

            <button
              onClick={() => setScaleStep(2)}
              className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                scaleStep === 2
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              2. Trừ cả 2 vế cho {constB}:
              <span className="block text-sm font-mono text-white mt-1">{coeffA}x = {constC - constB}</span>
            </button>

            <button
              onClick={() => setScaleStep(3)}
              className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                scaleStep === 3
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              3. Chia cả 2 vế cho {coeffA}:
              <span className="block text-sm font-mono text-white mt-1">x = {(constC - constB) / coeffA}</span>
            </button>
          </div>

          {/* Animated Balance Scale Graphic */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
            <div className="relative w-full max-w-md h-40 flex items-center justify-center">
              {/* Central Fulcrum / Pivot */}
              <div className="absolute bottom-0 w-12 h-20 bg-slate-800 border border-slate-700 rounded-t-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
              </div>

              {/* Horizontal Beam */}
              <div className="absolute top-16 w-80 h-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full shadow-lg" />

              {/* Left Pan */}
              <div className="absolute top-16 left-6 flex flex-col items-center">
                <div className="w-0.5 h-14 bg-slate-500" />
                <div className="w-28 p-2 rounded-xl bg-slate-900 border-2 border-indigo-500 text-center shadow-lg">
                  <span className="text-[10px] text-indigo-400 font-bold block">VẾ TRÁI</span>
                  <span className="text-sm font-extrabold text-white font-mono">
                    {scaleStep === 1 && `${coeffA}x + ${constB}`}
                    {scaleStep === 2 && `${coeffA}x`}
                    {scaleStep === 3 && 'x'}
                  </span>
                </div>
              </div>

              {/* Right Pan */}
              <div className="absolute top-16 right-6 flex flex-col items-center">
                <div className="w-0.5 h-14 bg-slate-500" />
                <div className="w-28 p-2 rounded-xl bg-slate-900 border-2 border-pink-500 text-center shadow-lg">
                  <span className="text-[10px] text-pink-400 font-bold block">VẾ PHẢI</span>
                  <span className="text-sm font-extrabold text-white font-mono">
                    {scaleStep === 1 && `${constC}`}
                    {scaleStep === 2 && `${constC - constB}`}
                    {scaleStep === 3 && `${(constC - constB) / coeffA}`}
                  </span>
                </div>
              </div>
            </div>

            {scaleStep === 3 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-bounce">
                🎉 Nghiệm của phương trình: x = {(constC - constB) / coeffA}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRIANGLE ANGLES EXPLORER */}
      {activeTab === 'triangle_angle' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-white">
              Định Lý Tổng Ba Góc Của Một Tam Giác
            </h3>
            <p className="text-xs text-slate-400">
              Tổng ba góc của một tam giác trong hình học phẳng luôn luôn bằng 180°.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Sliders */}
            <div className="space-y-4 p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Góc ∠A:</span>
                  <span className="text-indigo-400 font-mono text-sm">{angleA}°</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={angleA}
                  onChange={(e) => {
                    const newA = Number(e.target.value);
                    if (newA + angleB < 170) setAngleA(newA);
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Góc ∠B:</span>
                  <span className="text-pink-400 font-mono text-sm">{angleB}°</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={angleB}
                  onChange={(e) => {
                    const newB = Number(e.target.value);
                    if (angleA + newB < 170) setAngleB(newB);
                  }}
                  className="w-full accent-pink-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Góc ∠C tự động tính:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{angleC}°</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-sm font-extrabold text-white text-center">
                  ∠A + ∠B + ∠C = {angleA}° + {angleB}° + {angleC}° = <span className="text-amber-400 font-black">180°</span>
                </div>
              </div>
            </div>

            {/* Triangle Display */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[260px]">
              <svg viewBox="0 0 300 200" className="w-full max-w-xs h-48">
                <polygon
                  points="50,160 250,160 140,40"
                  fill="#4f46e5"
                  fillOpacity="0.25"
                  stroke="#818cf8"
                  strokeWidth="3"
                />
                <circle cx="50" cy="160" r="5" fill="#facc15" />
                <circle cx="250" cy="160" r="5" fill="#facc15" />
                <circle cx="140" cy="40" r="5" fill="#facc15" />

                <text x="35" y="180" fill="#ffffff" fontSize="12" fontWeight="bold">A ({angleA}°)</text>
                <text x="240" y="180" fill="#ffffff" fontSize="12" fontWeight="bold">B ({angleB}°)</text>
                <text x="130" y="25" fill="#34d399" fontSize="12" fontWeight="bold">C ({angleC}°)</text>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
