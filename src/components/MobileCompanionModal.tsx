import React, { useState } from 'react';
import { X, Smartphone, Download, Share2, Tag, Check, MapPin, ShoppingBag, ArrowRight, ShieldCheck, Heart, Sparkles, Bell, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClothingItem, ModelProfile, PrivacyMode } from '../types';
import { STORE_INFO } from '../data/mockData';
import { DewuARTryOnCanvas } from './DewuARTryOnCanvas';

interface MobileCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: ModelProfile;
  selectedItems: ClothingItem[];
  privacyMode: PrivacyMode;
}

export const MobileCompanionModal: React.FC<MobileCompanionModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  selectedItems,
  privacyMode,
}) => {
  const [activeTab, setActiveTab] = useState<'poster' | 'fitting_room' | 'checkout'>('poster');
  const [isCouponClaimed, setIsCouponClaimed] = useState(false);
  const [fittingRoomNumber, setFittingRoomNumber] = useState<'1' | '2' | '3'>('2');
  const [isStaffRequested, setIsStaffRequested] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isPosterSaved, setIsPosterSaved] = useState(false);

  if (!isOpen) return null;

  const primaryItem = selectedItems[0];
  const fittedImageUrl =
    primaryItem?.fittedImageUrl?.[selectedModel.id] ||
    primaryItem?.fittedImageUrl?.default ||
    primaryItem?.imageUrl ||
    selectedModel.poseImageUrl;

  const totalAmount = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const discount = isCouponClaimed ? 60 : 0;
  const finalPrice = Math.max(0, totalAmount - discount);

  // Trigger checkout confetti
  const handleCheckout = () => {
    setIsOrdered(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleClaimCoupon = () => {
    setIsCouponClaimed(true);
  };

  const handleRequestFittingRoom = () => {
    setIsStaffRequested(true);
  };

  const handleSavePoster = () => {
    setIsPosterSaved(true);
    setTimeout(() => setIsPosterSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      {/* Container simulating dual view or focused phone view */}
      <div className="relative w-full max-w-sm bg-stone-950 rounded-[48px] border-4 border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* iPhone Island / Notch */}
        <div className="w-full bg-stone-950 pt-3 pb-2 px-6 flex items-center justify-between z-20 shrink-0">
          <span className="text-[12px] text-stone-300 font-mono font-medium">09:41</span>
          <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-800"></div>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400 text-xs">
            <span className="text-[11px]">5G</span>
            <div className="w-4 h-2.5 border border-stone-400 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400"></div>
            </div>
          </div>
        </div>

        {/* In-app Navigation Bar */}
        <div className="bg-stone-900/90 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-[10px] text-stone-950 font-bold">
              LU
            </div>
            <div>
              <div className="text-xs font-bold text-stone-100">LUMIÈRE 微信小程序</div>
              <div className="text-[10px] text-stone-400 truncate max-w-[150px]">
                {STORE_INFO.kioskLocation}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            title="关闭手机端模拟"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-stone-200 text-xs select-none">
          {/* Top Tabs */}
          <div className="flex rounded-xl bg-stone-900 p-1 border border-stone-800">
            <button
              onClick={() => setActiveTab('poster')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'poster'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              试穿海报
            </button>
            <button
              onClick={() => setActiveTab('fitting_room')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'fitting_room'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              送衣试衣间
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'checkout'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              加购结算
            </button>
          </div>

          {/* TAB 1: Fitting Poster View */}
          {activeTab === 'poster' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Magazine Styled Fitting Card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl relative group">
                <div className="relative aspect-[3/4] bg-stone-950">
                  {selectedModel.isCustomPhoto || selectedModel.id === 'user-custom' || selectedModel.poseImageUrl?.startsWith('data:') ? (
                    <DewuARTryOnCanvas
                      userImageUrl={selectedModel.poseImageUrl}
                      clothingItems={selectedItems}
                      privacyMode={privacyMode}
                      badgeLabel="顾客专属试穿海报"
                      className="w-full h-full"
                      showComparisonSlider={false}
                    />
                  ) : (
                    <>
                      <img
                        src={fittedImageUrl}
                        alt="Fitted Look"
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Privacy overlay simulation on mobile */}
                      {privacyMode === 'blur_face' && (
                        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-14 h-16 rounded-full backdrop-blur-md bg-stone-950/40 border border-white/20 shadow-inner flex items-center justify-center">
                          <span className="text-[8px] text-white/80">隐私模糊</span>
                        </div>
                      )}
                      {privacyMode === 'sunglasses' && (
                        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-stone-950 text-white text-[9px] tracking-widest border border-stone-700">
                          🕶️ 高定墨镜
                        </div>
                      )}
                    </>
                  )}

                  {/* Watermark brand emblem */}
                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-serif text-amber-300 pointer-events-none">
                    LUMIÈRE VIRTUAL ATELIER
                  </div>
                  <div className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-stone-400 font-mono pointer-events-none">
                    试穿码: #{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                </div>

                {/* Poster Footer Info */}
                <div className="p-3 bg-stone-900 space-y-1.5 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-100 text-xs">
                      {primaryItem?.name || '当季新品穿搭'}
                    </span>
                    <span className="text-amber-400 font-bold font-mono">
                      ¥{primaryItem?.price}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    推荐尺码: {selectedModel.recommendedSize} 码 | 身高 {selectedModel.height}cm
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSavePoster}
                  className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isPosterSaved ? '已保存至相册 ✓' : '保存高清海报'}</span>
                </button>
                <button
                  onClick={() => alert('已生成小红书/微信穿搭海报分享卡片')}
                  className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>分享给微信好友</span>
                </button>
              </div>

              {/* In-store Exclusive Coupon Claim */}
              <div className="bg-gradient-to-r from-amber-500/20 to-stone-900 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Tag className="w-3.5 h-3.5" />
                    <span>大屏试穿专享 · 门店立减券</span>
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium mt-0.5">
                    满 ¥500 立减 <strong>¥60</strong> (今日有效)
                  </div>
                </div>

                <button
                  onClick={handleClaimCoupon}
                  disabled={isCouponClaimed}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCouponClaimed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow'
                  }`}
                >
                  {isCouponClaimed ? '已领取 ✓' : '立即领取'}
                </button>
              </div>

              {/* Shelf Location Guide on mobile */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-medium flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    店内导航导引
                  </span>
                  <span className="text-amber-400 font-mono">距大屏约 12 米</span>
                </div>
                <div className="text-xs font-bold text-stone-200">
                  {primaryItem?.shelfLocation}
                </div>
                <div className="w-full h-16 bg-stone-950 rounded-xl border border-stone-800 relative overflow-hidden flex items-center justify-center p-2">
                  <div className="flex items-center gap-3 text-[10px] text-stone-400">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      📍 您所在大屏
                    </span>
                    <span className="text-stone-600">┈┈┈┈▶</span>
                    <span className="px-2 py-1 bg-sky-500/20 text-sky-300 rounded border border-sky-500/30">
                      👗 货架 {primaryItem?.shelfLocation.slice(0, 7)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Send to Fitting Room */}
          {activeTab === 'fitting_room' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Bell className="w-4 h-4" />
                  <span>呼叫门店导购送衣到试衣间</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  无需自己穿梭货架找衣服。选择您的试衣间编号，导购将按您在大屏匹配的【
                  {selectedModel.recommendedSize} 码】将现衣送达！
                </p>

                {/* Fitting Room Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-stone-400">选择您所在的试衣间:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1', '2', '3'] as const).map((num) => (
                      <button
                        key={num}
                        onClick={() => setFittingRoomNumber(num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                          fittingRoomNumber === num
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {num} 号试衣间
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items to send list */}
                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  <span className="text-[11px] text-stone-400">准备送达的单品:</span>
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-[11px]"
                    >
                      <span className="truncate max-w-[170px] text-stone-200">{item.name}</span>
                      <span className="text-amber-400 font-mono">
                        {selectedModel.recommendedSize} 码
                      </span>
                    </div>
                  ))}
                </div>

                {/* Call Staff Action */}
                {!isStaffRequested ? (
                  <button
                    onClick={handleRequestFittingRoom}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    确认并通知导购送衣
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                      <Check className="w-4 h-4" />
                      <span>导购【小雅】已接单！</span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      正在为您调配 2F A区 {selectedModel.recommendedSize} 码实物，预计 2
                      分钟送至 {fittingRoomNumber} 号试衣间，请在试衣间稍候。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Direct Checkout / Buy */}
          {activeTab === 'checkout' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-100 text-xs">门店直发与加购清单</h3>
                  <span className="text-[10px] text-emerald-400">顺丰包邮 / 门店自提</span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-stone-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          尺码: {selectedModel.recommendedSize}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold font-mono text-amber-400">
                          ¥{item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-stone-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-400">
                    <span>商品总金额:</span>
                    <span className="font-mono">¥{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>大屏试穿立减券:</span>
                    <span className="font-mono">{isCouponClaimed ? '-¥60' : '未领取 (点击领券)'}</span>
                  </div>
                  <div className="flex justify-between text-stone-100 font-bold pt-1 border-t border-stone-800 text-xs">
                    <span>实付金额:</span>
                    <span className="font-mono text-sm text-amber-400">¥{finalPrice}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                {!isOrdered ? (
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    微信支付 ¥{finalPrice} (享门店急速配送)
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-1">
                    <div className="text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>支付成功！订单已下发至 IAPM 门店</span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      您可选择凭提货码前往 1F 服务台自提，或等待顺丰当日达配送至家。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Note at Bottom of Mobile App */}
          <div className="text-center text-[10px] text-stone-500 pt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>个人试穿生物特征仅留存手机本地，大屏已同步清空</span>
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="w-full py-2 bg-stone-950 flex justify-center shrink-0">
          <div className="w-32 h-1 bg-stone-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
