import React, { useState, useEffect, useCallback } from 'react';
import { ScreenHeader } from './components/ScreenHeader';
import { Step1AvatarSelector } from './components/Step1AvatarSelector';
import { Step2ClothingSelector } from './components/Step2ClothingSelector';
import { Step3WaitAndFailure } from './components/Step3WaitAndFailure';
import { Step4FittingResult } from './components/Step4FittingResult';
import { PrivacyModal } from './components/PrivacyModal';
import { ModelProfile, ClothingItem, PrivacyMode } from './types';
import { CLOTHING_ITEMS, USER_BASE_PHOTO } from './data/mockData';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  // Wizard steps: 1 to 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Default to real mirror user photo for natural posture
  const defaultUserPhotoModel: ModelProfile = {
    id: 'user-mirror',
    name: '本人实拍镜前照',
    gender: 'female',
    bodyType: 'standard',
    height: 168,
    weight: 52,
    avatarUrl: USER_BASE_PHOTO,
    poseImageUrl: USER_BASE_PHOTO,
    isCustomPhoto: true,
    description: '本人镜前自拍实拍 · 100% 保留真实体态',
    recommendedSize: 'M',
  };

  // Selected Model / User Photo
  const [selectedModel, setSelectedModel] = useState<ModelProfile>(defaultUserPhotoModel);

  // Selected Clothing Items (default: 2 pieces)
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([
    CLOTHING_ITEMS[1], // c2 重磅真丝衬衫
    CLOTHING_ITEMS[2], // c3 高腰羊毛阔腿西裤
  ]);

  // Privacy Protection Mode: 'clear' | 'blur_face' | 'sunglasses'
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('clear');

  // 30-Second Inactivity Auto-Reset
  const [countdownSeconds, setCountdownSeconds] = useState<number>(30);
  const [showAutoWipedToast, setShowAutoWipedToast] = useState(false);

  // Privacy Policy Modal
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Reset Countdown on interaction
  const resetCountdown = useCallback(() => {
    setCountdownSeconds(30);
  }, []);

  // Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          handleResetSession(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Activity Listeners
  useEffect(() => {
    const handleActivity = () => resetCountdown();
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [resetCountdown]);

  // Reset Session
  const handleResetSession = (isAuto: boolean = false) => {
    setCurrentStep(1);
    setSelectedModel(defaultUserPhotoModel);
    setSelectedItems([CLOTHING_ITEMS[1], CLOTHING_ITEMS[2]]);
    setPrivacyMode('clear');
    setCountdownSeconds(30);
    if (isAuto) {
      setShowAutoWipedToast(true);
      setTimeout(() => setShowAutoWipedToast(false), 3500);
    }
  };

  // Toggle Clothing Selection
  const handleToggleClothingItem = (item: ClothingItem) => {
    resetCountdown();
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Batch Select Items
  const handleSelectItemsBatch = (items: ClothingItem[]) => {
    resetCountdown();
    setSelectedItems(items);
  };

  // Switch Model
  const handleSelectModel = (model: ModelProfile) => {
    resetCountdown();
    setSelectedModel(model);
    const validItems = CLOTHING_ITEMS.filter((c) => c.gender === model.gender);
    if (validItems.length > 0 && selectedItems.length === 0) {
      setSelectedItems([validItems[0]]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white font-sans antialiased">
      {/* Clean Screen Header with Apple Luxury Aesthetic */}
      <ScreenHeader
        currentStep={currentStep}
        privacyMode={privacyMode}
        countdownSeconds={countdownSeconds}
        onResetSession={() => handleResetSession(false)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Auto-Wipe Notification Toast */}
      {showAutoWipedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-950/90 text-white px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.18)] flex items-center gap-3 backdrop-blur-md border border-stone-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-stone-100">隐私无痕清理完成：</span>
            <span className="text-stone-300 ml-1">顾客离场超时，所有照片与体态数据已安全物理销毁。</span>
          </div>
        </div>
      )}

      {/* Main 4-Step Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {currentStep === 1 && (
          <Step1AvatarSelector
            selectedModel={selectedModel}
            privacyMode={privacyMode}
            onSelectModel={handleSelectModel}
            onUpdatePrivacyMode={setPrivacyMode}
            onNextStep={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2ClothingSelector
            selectedModel={selectedModel}
            selectedItems={selectedItems}
            onToggleItem={handleToggleClothingItem}
            onSelectItemsBatch={handleSelectItemsBatch}
            onPrevStep={() => setCurrentStep(1)}
            onNextStep={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3WaitAndFailure
            selectedModel={selectedModel}
            selectedItems={selectedItems}
            onFinishSuccess={() => setCurrentStep(4)}
            onBackToSelect={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4FittingResult
            selectedModel={selectedModel}
            selectedItems={selectedItems}
            privacyMode={privacyMode}
            onTryAnotherOutfit={() => setCurrentStep(2)}
            onResetSession={() => handleResetSession(false)}
          />
        )}
      </main>

      {/* Privacy Guarantee & Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onWipeDataImmediately={() => handleResetSession(false)}
      />
    </div>
  );
}
