import React, { useState } from 'react';
import { X, ShieldCheck, Trash2, CheckCircle2, Lock, Cpu, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWipeDataImmediately: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onWipeDataImmediately,
}) => {
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleWipe = () => {
    setWipeConfirmed(true);
    setTimeout(() => {
      onWipeDataImmediately();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-stone-900/10 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-stone-900">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-950 tracking-tight">
                商场大屏交互隐私安全与数据合规承诺
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                严守《中华人民共和国个人信息保护法》· 纯边缘安全计算架构
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Pillars of Privacy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-900/5 space-y-1.5">
            <div className="flex items-center gap-2 text-stone-950 font-semibold text-xs">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>1. 本地边缘 NPU 即时计算</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              现场搭载独立边缘算力芯片，所有 3D 布料贴合及体态渲染均在单机沙盒中完成，绝不上载至外部云端或公开网络。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-900/5 space-y-1.5">
            <div className="flex items-center gap-2 text-stone-950 font-semibold text-xs">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              <span>2. 绝对不采集不沉淀人脸</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              系统仅提取颈窝与肩峰骨骼几何坐标用于衣物对齐；面部肖像支持面部模糊与黑超遮挡，不进行任何生物识别特征库构建。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-900/5 space-y-1.5">
            <div className="flex items-center gap-2 text-stone-950 font-semibold text-xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>3. 离屏 30 秒物理级销毁</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              红外感应探知顾客离开镜头视野 30 秒后，系统将自动触发内存数据清空指令，缓存显存强制释放，不留任何痕迹。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-900/5 space-y-1.5">
            <div className="flex items-center gap-2 text-stone-950 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. 微信扫码端对端加密带走</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              试穿高清图片采用端对端临时加密通道，仅在微信扫码确认后直达顾客个人手机端，大屏端传输完成即刻覆写销毁。
            </p>
          </div>
        </div>

        {/* Immediate Wipe Section */}
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-semibold text-red-900">即刻安全销毁：</span>
            <span className="text-red-700 ml-1">
              您可随时主动终止试衣并彻底抹除所有照片与骨骼定位数据。
            </span>
          </div>

          <button
            onClick={handleWipe}
            disabled={wipeConfirmed}
            className={`px-4 py-2 rounded-full font-medium text-xs flex items-center gap-1.5 shrink-0 transition-all ${
              wipeConfirmed
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
            }`}
          >
            {wipeConfirmed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>数据已彻底销毁并复位</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>立即一键物理销毁</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-stone-950 hover:bg-black text-white text-xs font-medium transition-colors shadow-sm"
          >
            我已知晓并返回试衣
          </button>
        </div>
      </div>
    </div>
  );
};
