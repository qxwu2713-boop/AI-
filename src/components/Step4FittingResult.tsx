import React, { useState } from 'react';
import { Sparkles, RefreshCw, Smartphone, RotateCcw, ShieldCheck, QrCode, X } from 'lucide-react';
import { ClothingItem, ModelProfile, PrivacyMode } from '../types';
import { DewuARTryOnCanvas } from './DewuARTryOnCanvas';

interface Step4FittingResultProps {
  selectedModel: ModelProfile;
  selectedItems: ClothingItem[];
  privacyMode: PrivacyMode;
  onOpenMobileView?: () => void;
  onTryAnotherOutfit: () => void;
  onResetSession: () => void;
}

export const Step4FittingResult: React.FC<Step4FittingResultProps> = ({
  selectedModel,
  selectedItems,
  privacyMode,
  onTryAnotherOutfit,
  onResetSession,
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const totalAmount = selectedItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      {/* Top Banner */}
      <div className="bg-white border border-stone-900/10 rounded-3xl p-6 md:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            第 4 步 / 共 4 步 · 试穿效果呈现
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-950 mt-1 tracking-tight">
            试穿效果已生成
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            拖动中央分界线可实时对比穿衣前后形态。上衣精准对齐肩峰，裤装自然垂坠于双腿。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onTryAnotherOutfit}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium border border-stone-900/15 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
            <span>更换服装搭配</span>
          </button>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-950 hover:bg-black text-white text-xs font-medium transition-all shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>扫码带走效果照</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas with Before/After Slider */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-stone-900/10 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)] relative aspect-[3/4] flex flex-col">
            <DewuARTryOnCanvas
              userImageUrl={selectedModel.poseImageUrl}
              clothingItems={selectedItems}
              privacyMode={privacyMode}
              badgeLabel="3D-AR 拟真试穿 · 原身体态精确对齐"
              className="w-full h-full flex-1"
              showComparisonSlider={true}
            />
          </div>
        </div>

        {/* Right: Items Details & Clean Actions */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Item List Card */}
          <div className="bg-white border border-stone-900/10 rounded-3xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-semibold text-stone-950 tracking-tight flex items-center gap-2">
                <span>当前试穿造型</span>
                <span className="text-xs text-stone-500 font-normal">
                  ({selectedItems.length} 件单品)
                </span>
              </h2>
              <span className="text-xs text-stone-500">
                推荐尺码：<span className="text-stone-950 font-semibold">{selectedModel.recommendedSize || 'M'}</span>
              </span>
            </div>

            {/* Selected Items */}
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50/70 border border-stone-900/5"
                >
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-stone-950 truncate tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{item.material}</p>
                    <div className="text-xs font-semibold text-stone-950 font-mono mt-1">
                      ¥{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
              <span className="text-stone-500">单品总计:</span>
              <span className="text-lg font-semibold text-stone-950 font-mono">
                ¥{totalAmount}
              </span>
            </div>
          </div>

          {/* Privacy Reassurance Card */}
          <div className="bg-[#F0FDF4] border border-emerald-200 rounded-3xl p-4 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-emerald-900">隐私无痕试衣保障已激活</div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                您的体态特征与试穿画面仅在现场显存内即时渲染，离屏 30 秒或点击下方「结束试穿」将即刻彻底销毁，绝不上云存储。
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-full bg-stone-950 hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>扫码保存高清效果至微信</span>
            </button>

            <button
              onClick={onResetSession}
              className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-950 text-xs flex items-center justify-center gap-1.5 border border-stone-900/15 transition-colors font-medium shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>完成试穿并立即销毁个人数据</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Apple Minimalist QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white border border-stone-900/10 rounded-3xl p-6 md:p-7 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 text-stone-500 hover:text-stone-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center mx-auto border border-stone-200">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-stone-950 tracking-tight">微信扫码带走效果照</h2>
              <p className="text-xs text-stone-500 mt-1">
                使用手机微信扫描下方二维码，在手机端查看高清试穿海报与专属立减券
              </p>
            </div>

            {/* Apple Minimalist QR Code Frame */}
            <div className="w-44 h-44 bg-white rounded-2xl mx-auto p-3 flex flex-col items-center justify-center shadow-sm border border-stone-200">
              <div className="w-full h-full border border-stone-950 p-2 flex flex-col items-center justify-between">
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 border-4 border-stone-950"></div>
                  <div className="w-8 h-8 border-4 border-stone-950"></div>
                </div>
                <div className="font-semibold text-stone-950 text-xs tracking-widest">
                  LUMIÈRE
                </div>
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 border-4 border-stone-950"></div>
                  <div className="w-5 h-5 bg-stone-950"></div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-500">
              扫码后可直接呼叫店员送现货至试衣间
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
            >
              返回试衣镜
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
