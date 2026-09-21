import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ClothingItem, ModelProfile } from '../types';

interface Step3WaitAndFailureProps {
  selectedModel: ModelProfile;
  selectedItems: ClothingItem[];
  onFinishSuccess: () => void;
  onFallbackToLookbook?: () => void;
  onCallStaffAssistance?: () => void;
  onBackToSelect: () => void;
}

export const Step3WaitAndFailure: React.FC<Step3WaitAndFailureProps> = ({
  selectedModel,
  selectedItems,
  onFinishSuccess,
  onBackToSelect,
}) => {
  const [progress, setProgress] = useState(15);
  const [stageText, setStageText] = useState('正在识别真实肩峰与锁骨中窝锚点...');

  // Smooth 2.8s progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinishSuccess();
          }, 350);
          return 100;
        }

        const next = prev + 3;
        if (next < 40) {
          setStageText('正在识别真实肩峰与锁骨中窝锚点...');
        } else if (next < 75) {
          setStageText('高腰节裤腰对齐与布料重力悬垂仿真中...');
        } else {
          setStageText('织物光泽与室内光影融合完成，即将呈现...');
        }

        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onFinishSuccess]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Visual Apple Minimalist Pulse Ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-stone-950/20 animate-ping opacity-40"></div>
        <div className="w-16 h-16 rounded-full bg-stone-950 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
          <Sparkles className="w-7 h-7 text-stone-200 animate-pulse" />
        </div>
      </div>

      {/* Progress & Stage Status */}
      <div className="text-center space-y-2.5 max-w-md w-full">
        <div className="text-xs text-stone-500 font-medium tracking-wide uppercase">
          STEP 3 / 4 · 智能物理试穿计算中
        </div>
        <h2 className="text-2xl font-semibold text-stone-950 tracking-tight">
          正在为您生成真实试衣效果
        </h2>
        <p className="text-xs text-stone-500 min-h-[20px] font-mono">
          {stageText}
        </p>

        {/* Clean Apple Minimalist Progress Bar */}
        <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden mt-4">
          <div
            className="bg-stone-950 h-full rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[11px] text-stone-400 font-mono pt-1">
          <span>解剖网格对齐</span>
          <span className="font-semibold text-stone-800">{progress}%</span>
          <span>完成呈现</span>
        </div>
      </div>

      {/* Selected Outfits Mini Preview */}
      <div className="bg-white border border-stone-900/10 rounded-2xl p-4 flex items-center gap-3 w-full max-w-md shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="w-12 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
          <img
            src={selectedModel.poseImageUrl}
            alt="用户形象"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-stone-950 truncate">
            {selectedModel.name}
          </div>
          <div className="text-[11px] text-stone-500 truncate mt-0.5">
            试穿 {selectedItems.map((i) => i.name).join(' + ')}
          </div>
        </div>

        <button
          onClick={onFinishSuccess}
          className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium border border-stone-200 transition-colors shrink-0"
        >
          立即呈现
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={onBackToSelect}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-950 transition-colors pt-2 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>返回重新挑选服装</span>
      </button>
    </div>
  );
};
