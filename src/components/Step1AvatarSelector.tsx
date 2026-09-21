import React, { useState, useRef } from 'react';
import { Camera, ShieldCheck, Upload, Check, RefreshCw, Eye, EyeOff, Sparkles, ArrowRight, User } from 'lucide-react';
import { ModelProfile, Gender, PrivacyMode } from '../types';
import { AVATAR_PROFILES, USER_BASE_PHOTO } from '../data/mockData';

interface Step1AvatarSelectorProps {
  selectedModel: ModelProfile;
  privacyMode: PrivacyMode;
  onSelectModel: (model: ModelProfile) => void;
  onUpdatePrivacyMode: (mode: PrivacyMode) => void;
  onUpdateCustomMetrics?: (height: number, weight: number) => void;
  onNextStep: () => void;
}

export const Step1AvatarSelector: React.FC<Step1AvatarSelectorProps> = ({
  selectedModel,
  privacyMode,
  onSelectModel,
  onUpdatePrivacyMode,
  onNextStep,
}) => {
  const isCustomOrMirror = Boolean(
    selectedModel.isCustomPhoto ||
    selectedModel.id === 'user-mirror' ||
    selectedModel.id === 'user-custom'
  );
  const [activeTab, setActiveTab] = useState<'photo' | 'preset'>(
    isCustomOrMirror ? 'photo' : 'photo'
  );

  const [activeGender, setActiveGender] = useState<Gender>(selectedModel.gender);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filter preset models by gender
  const presetModels = AVATAR_PROFILES.filter((m) => m.gender === activeGender);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSelectModel({
          id: 'user-custom',
          name: '我的实拍照片',
          gender: 'female',
          bodyType: 'standard',
          height: 168,
          weight: 52,
          avatarUrl: dataUrl,
          poseImageUrl: dataUrl,
          isCustomPhoto: true,
          description: '用户本地上传照片 · 100% 真实原貌',
          recommendedSize: 'M',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('无法访问摄像头，建议直接上传照片体验。');
    }
  };

  // Take Snapshot from Camera
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      onSelectModel({
        id: 'user-custom',
        name: '现场拍摄照片',
        gender: 'female',
        bodyType: 'standard',
        height: 168,
        weight: 52,
        avatarUrl: dataUrl,
        poseImageUrl: dataUrl,
        isCustomPhoto: true,
        description: '现场高清拍摄 · 100% 真实原貌',
        recommendedSize: 'M',
      });
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Select Default Real Mirror Photo
  const selectDefaultMirrorPhoto = () => {
    stopCamera();
    onSelectModel({
      id: 'user-mirror',
      name: '本人镜前实拍照',
      gender: 'female',
      bodyType: 'standard',
      height: 168,
      weight: 52,
      avatarUrl: USER_BASE_PHOTO,
      poseImageUrl: USER_BASE_PHOTO,
      isCustomPhoto: true,
      description: '原身实拍试衣镜照 · 100% 保留体态',
      recommendedSize: 'M',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      {/* Step Header Banner */}
      <div className="bg-white border border-stone-900/10 rounded-3xl p-6 md:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-stone-950"></span>
            第 1 步 / 共 4 步 · 形象采集与隐私保护
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-950 mt-1 tracking-tight">
            准备您的试衣形象
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            推荐使用实拍照体验原身穿戴效果，亦可随时开启隐私保护遮挡面部。
          </p>
        </div>

        {/* Tab Switcher: Real Photo vs Standard Models */}
        <div className="flex items-center bg-[#ECEAE4] p-1 rounded-full border border-stone-900/5 shrink-0">
          <button
            onClick={() => {
              setActiveTab('photo');
              if (!selectedModel.isCustomPhoto) selectDefaultMirrorPhoto();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'photo'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>实拍照试穿 (推荐)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('preset');
              stopCamera();
              onSelectModel(presetModels[0] || AVATAR_PROFILES[0]);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'preset'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>标准模特试穿</span>
          </button>
        </div>
      </div>

      {/* Main Mode Content */}
      {activeTab === 'photo' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-stone-900/10 rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          {/* Left: Photo Preview or Camera View */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-900/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center">
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3 z-20">
                    <button
                      onClick={takeSnapshot}
                      className="px-5 py-2 rounded-full bg-stone-950 text-white font-medium text-xs shadow-lg active:scale-95 transition-all"
                    >
                      点击拍摄
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-full bg-white/90 text-stone-800 text-xs border border-stone-200"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selectedModel.poseImageUrl || USER_BASE_PHOTO}
                    alt="实拍照"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 border border-stone-200 px-3 py-1 rounded-full text-[11px] text-stone-900 font-medium flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>100% 本人实拍原照</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions & Photo Controls */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-stone-950 tracking-tight">
                使用本人真实照片
              </h2>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                无需繁琐测量，算法直接识别锁骨颈窝、肩峰点与裤腰线，衣服与裤子将精准贴合于您真实的肩部与双腿上。
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-full bg-stone-950 hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:scale-98"
              >
                <Upload className="w-4 h-4 text-stone-300" />
                <span>上传我的手机照片</span>
              </button>

              <button
                onClick={startCamera}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-900 font-medium text-xs flex items-center justify-center gap-2 border border-stone-900/15 transition-all shadow-sm active:scale-98"
              >
                <Camera className="w-4 h-4 text-stone-700" />
                <span>开启摄像头现场实拍</span>
              </button>

              <button
                onClick={selectDefaultMirrorPhoto}
                className="w-full py-2.5 px-4 rounded-full bg-[#F5F4F0] hover:bg-[#EBE9E4] text-stone-700 text-xs flex items-center justify-center gap-1.5 border border-stone-900/5 transition-colors font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>使用系统内置标准实拍照</span>
              </button>
            </div>

            {cameraError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                {cameraError}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preset Models Selector */
        <div className="bg-white border border-stone-900/10 rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-950 tracking-tight">
              选择推荐模特身型
            </h2>
            {/* Gender Toggle */}
            <div className="flex items-center bg-[#ECEAE4] p-1 rounded-full border border-stone-900/5 text-xs">
              <button
                onClick={() => {
                  setActiveGender('female');
                  const firstFemale = AVATAR_PROFILES.find((m) => m.gender === 'female');
                  if (firstFemale) onSelectModel(firstFemale);
                }}
                className={`px-3 py-1 rounded-full transition-all font-medium ${
                  activeGender === 'female'
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'text-stone-600'
                }`}
              >
                女士模特
              </button>
              <button
                onClick={() => {
                  setActiveGender('male');
                  const firstMale = AVATAR_PROFILES.find((m) => m.gender === 'male');
                  if (firstMale) onSelectModel(firstMale);
                }}
                className={`px-3 py-1 rounded-full transition-all font-medium ${
                  activeGender === 'male'
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'text-stone-600'
                }`}
              >
                男士模特
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {presetModels.map((model) => {
              const isSelected = selectedModel.id === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => onSelectModel(model)}
                  className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all p-2 text-left bg-white ${
                    isSelected
                      ? 'border-stone-950 shadow-md ring-1 ring-stone-950'
                      : 'border-stone-900/10 hover:border-stone-900/30'
                  }`}
                >
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100 mb-2">
                    <img
                      src={model.poseImageUrl}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="font-semibold text-xs text-stone-900">{model.name}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-stone-950 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono px-1">
                    {model.height}cm · {model.weight}kg
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy and Security Settings (保留且突出) */}
      <div className="bg-white border border-stone-900/10 rounded-3xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-stone-950 tracking-tight">面部与身份隐私保护</span>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            🔒 纯本地 NPU 运算 · 绝不上云不存人脸
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'clear' as PrivacyMode,
              title: '清晰自然呈现',
              desc: '保留原貌与五官神态，试穿效果最真实自然',
              icon: Eye,
            },
            {
              id: 'blur_face' as PrivacyMode,
              title: '面部柔化模糊',
              desc: '智能定位并柔化面部区域，保护肖像隐私',
              icon: EyeOff,
            },
            {
              id: 'sunglasses' as PrivacyMode,
              title: '轻奢墨镜遮挡',
              desc: '佩戴高定黑超墨镜遮蔽眼部，时尚且护隐',
              icon: Sparkles,
            },
          ].map((mode) => {
            const isCurrent = privacyMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onUpdatePrivacyMode(mode.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-stone-50/70 border-stone-950 text-stone-950 shadow-sm'
                    : 'bg-white border-stone-900/10 text-stone-600 hover:border-stone-900/25'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-900">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-stone-950' : 'text-stone-500'}`} />
                    <span>{mode.title}</span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />}
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating / Sticky Bottom CTA Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-stone-500">
          已就绪形象：<span className="text-stone-950 font-semibold">{selectedModel.name}</span>
        </div>

        <button
          onClick={onNextStep}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-stone-950 hover:bg-black text-white font-medium text-sm transition-all shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95"
        >
          <span>下一步：挑选服饰</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
