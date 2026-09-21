import React from 'react';
import { ShieldCheck, RotateCcw, Store } from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { PrivacyMode } from '../types';

interface ScreenHeaderProps {
  currentStep: number;
  privacyMode: PrivacyMode;
  countdownSeconds: number;
  onResetSession: () => void;
  onOpenPrivacyModal: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  currentStep,
  privacyMode,
  countdownSeconds,
  onResetSession,
  onOpenPrivacyModal,
}) => {
  const steps = [
    { num: 1, name: '形象与隐私' },
    { num: 2, name: '挑选服装' },
    { num: 3, name: '智能试衣' },
    { num: 4, name: '试穿效果' },
  ];

  return (
    <header className="w-full bg-[#F8F7F4]/85 backdrop-blur-xl border-b border-stone-900/10 text-stone-900 px-4 py-3 select-none sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Store Location */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-950 flex items-center justify-center text-white font-medium tracking-widest text-xs shadow-sm">
            LU
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-950 tracking-tight text-base sm:text-lg">
                {STORE_INFO.brandName}
              </span>
              <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-stone-900/5 text-stone-700 border border-stone-900/10 hidden sm:inline-block">
                AI 试衣镜
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Store className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-none">{STORE_INFO.kioskLocation}</span>
            </div>
          </div>
        </div>

        {/* Center: Apple Segmented Pill Step Navigation */}
        <nav className="flex items-center gap-1 bg-[#ECEAE4] p-1 rounded-full border border-stone-900/5 text-xs">
          {steps.map((item) => {
            const isActive = currentStep === item.num;
            const isCompleted = currentStep > item.num;
            return (
              <div
                key={item.num}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-stone-950 text-white font-medium shadow-sm'
                    : isCompleted
                    ? 'text-stone-800 font-medium'
                    : 'text-stone-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                    isActive
                      ? 'bg-white text-stone-950'
                      : isCompleted
                      ? 'bg-stone-950/10 text-stone-700'
                      : 'bg-stone-300 text-stone-500'
                  }`}
                >
                  {item.num}
                </span>
                <span className="hidden sm:inline tracking-tight">{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Right Actions: Privacy Setting & Quick Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy Modal Trigger Button */}
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-900/10 text-stone-800 text-xs font-medium hover:bg-stone-50 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            title="查看隐私安全承诺与保护模式"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden md:inline">隐私安全保障</span>
            <span className="md:hidden text-[11px]">隐私安全</span>
          </button>

          {/* Auto Reset Inactivity Timer */}
          <div
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono border ${
              countdownSeconds <= 10
                ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                : 'bg-white border-stone-900/10 text-stone-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
            }`}
            title="无人操作 30 秒后自动清空数据"
          >
            <span className="text-[10px] text-stone-400">离屏清空:</span>
            <span className="font-semibold text-stone-800">{countdownSeconds}s</span>
          </div>

          {/* Reset Session */}
          <button
            onClick={onResetSession}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-950 border border-stone-900/10 transition-colors text-xs shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            title="清空并重置会话"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-medium">重置</span>
          </button>
        </div>
      </div>
    </header>
  );
};
