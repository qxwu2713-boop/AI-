import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Layers,
  Move,
  Shirt,
  Sun,
  Activity,
  RotateCw,
  Smartphone,
  Check,
  ZoomIn,
} from 'lucide-react';
import { ClothingItem, PrivacyMode } from '../types';
import {
  getTransparentGarmentCanvas,
  STUDIO_GARMENT_MAP,
  GarmentAssetConfig,
  ProcessedGarmentResult,
} from '../utils/dewuTryOnEngine';
import { USER_BASE_PHOTO } from '../data/mockData';

interface DewuARTryOnCanvasProps {
  userImageUrl: string;
  fittedImageUrl?: string;
  clothingItems: ClothingItem[];
  privacyMode: PrivacyMode;
  isZoomActive?: boolean;
  className?: string;
  badgeLabel?: string;
  showComparisonSlider?: boolean;
}

export type FitSilhouette = 'tailored' | 'slim' | 'oversize';
export type LightingMode = 'auto' | 'warm' | 'daylight';

export const DewuARTryOnCanvas: React.FC<DewuARTryOnCanvasProps> = ({
  userImageUrl,
  clothingItems,
  privacyMode,
  isZoomActive = false,
  className = '',
  badgeLabel = '3D-AR 拟真试穿 (部位精确对齐)',
  showComparisonSlider = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active calibration tab: top (shoulders) vs bottom (legs)
  const [activeCalibTab, setActiveCalibTab] = useState<'top' | 'bottom'>('top');

  // 上装肩部微调参数 (Top / Shoulders Calibration)
  const [topOffsetY, setTopOffsetY] = useState<number>(0); // -40px to +40px
  const [topOffsetX, setTopOffsetX] = useState<number>(0); // -30px to +30px
  const [topScale, setTopScale] = useState<number>(1.0); // 0.85 to 1.25
  const [topRotation, setTopRotation] = useState<number>(0); // -6deg to +6deg

  // 下装腿部微调参数 (Bottom / Legs Calibration)
  const [bottomOffsetY, setBottomOffsetY] = useState<number>(0); // -40px to +40px
  const [bottomOffsetX, setBottomOffsetX] = useState<number>(0); // -30px to +30px
  const [bottomScale, setBottomScale] = useState<number>(1.0); // 0.85 to 1.25

  // 风格与渲染参数
  const [fitSilhouette, setFitSilhouette] = useState<FitSilhouette>('tailored');
  const [lightingMode, setLightingMode] = useState<LightingMode>('auto');
  const [preserveForegroundHand, setPreserveForegroundHand] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [showStressHeatmap, setShowStressHeatmap] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [showCalibrationPanel, setShowCalibrationPanel] = useState<boolean>(false);
  const [isRenderReady, setIsRenderReady] = useState<boolean>(false);

  // Partition clothing items by category
  const { topItem, bottomItem } = useMemo(() => {
    let top: ClothingItem | null = null;
    let bottom: ClothingItem | null = null;

    clothingItems.forEach((item) => {
      if (item.category === 'bottom') {
        bottom = item;
      } else {
        // top, outerwear, or dress
        if (!top) top = item;
      }
    });

    // If only a bottom item was passed
    if (!top && !bottom && clothingItems.length > 0) {
      if (clothingItems[0].category === 'bottom') {
        bottom = clothingItems[0];
      } else {
        top = clothingItems[0];
      }
    }

    return { topItem: top, bottomItem: bottom };
  }, [clothingItems]);

  const resolvedUserImageUrl = userImageUrl || USER_BASE_PHOTO;

  // 一键重置至解剖黄金部位吸附对齐 (Reset to Perfect Anatomical Snap)
  const resetToBodySnap = () => {
    setTopOffsetY(0);
    setTopOffsetX(0);
    setTopScale(1.0);
    setTopRotation(0);
    setBottomOffsetY(0);
    setBottomOffsetX(0);
    setBottomScale(1.0);
    setFitSilhouette('tailored');
  };

  // Render on Canvas
  useEffect(() => {
    let isCancelled = false;

    const renderAR = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Load User's 100% Real Photo
      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.src = resolvedUserImageUrl;

      await new Promise<void>((resolve) => {
        if (userImg.complete) resolve();
        else {
          userImg.onload = () => resolve();
          userImg.onerror = () => resolve();
        }
      });

      if (isCancelled) return;

      const cw = userImg.naturalWidth || 800;
      const ch = userImg.naturalHeight || 1000;
      canvas.width = cw;
      canvas.height = ch;

      // 2. Load Processed Garments (Auto-Trimmed with Bounding Box)
      let bottomProcessed: ProcessedGarmentResult | null = null;
      let topProcessed: ProcessedGarmentResult | null = null;

      try {
        if (bottomItem) {
          const config = STUDIO_GARMENT_MAP[bottomItem.id] || STUDIO_GARMENT_MAP['c3'];
          bottomProcessed = await getTransparentGarmentCanvas(config);
        }
        if (topItem) {
          const config = STUDIO_GARMENT_MAP[topItem.id] || STUDIO_GARMENT_MAP['c2'];
          topProcessed = await getTransparentGarmentCanvas(config);
        }
      } catch (err) {
        console.warn('Garment loading notice:', err);
      }

      if (isCancelled) return;

      // 3. Clear & Draw 100% User Original Photo as absolute base
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(userImg, 0, 0, cw, ch);

      // Privacy Mode
      if (privacyMode === 'blur_face') {
        const faceX = cw * 0.38;
        const faceY = ch * 0.04;
        const faceW = cw * 0.24;
        const faceH = ch * 0.16;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(faceX + faceW / 2, faceY + faceH / 2, faceW / 2, faceH / 2, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = 'blur(16px)';
        ctx.drawImage(userImg, 0, 0, cw, ch);
        ctx.restore();
        ctx.filter = 'none';
      }

      // If comparison slider is at 100%, original photo only
      if (showComparisonSlider && sliderPosition >= 100) {
        setIsRenderReady(true);
        return;
      }

      // 4. Clip to right side of split comparison slider
      ctx.save();
      if (showComparisonSlider && sliderPosition > 0) {
        const splitX = (cw * sliderPosition) / 100;
        ctx.beginPath();
        ctx.rect(splitX, 0, cw - splitX, ch);
        ctx.clip();
      }

      // Ambient Lighting Filter function
      const applyLighting = () => {
        if (lightingMode === 'warm') {
          ctx.filter = 'brightness(1.02) contrast(1.03) sepia(0.06)';
        } else if (lightingMode === 'daylight') {
          ctx.filter = 'brightness(1.04) contrast(1.04) saturate(1.02)';
        } else {
          ctx.filter = 'brightness(1.01) contrast(1.02)';
        }
      };

      // ==========================================
      // A. RENDER PANTS (对齐腰部与腿部)
      // ==========================================
      if (bottomProcessed) {
        // Waist level: y ≈ 0.485 * ch
        // Waist/Hip width: cw * 0.37
        const bw = cw * 0.37 * bottomScale;
        const bh = (bw / bottomProcessed.width) * bottomProcessed.height;
        const bx = (cw - bw) / 2 + bottomOffsetX;
        const by = ch * 0.485 + bottomOffsetY;

        ctx.save();

        // Drop shadow onto thighs and legs
        ctx.save();
        ctx.shadowColor = 'rgba(12, 10, 8, 0.45)';
        ctx.shadowBlur = Math.round(cw * 0.018);
        ctx.shadowOffsetY = Math.round(ch * 0.01);
        ctx.globalAlpha = 0.45;
        ctx.drawImage(bottomProcessed.canvas, bx, by, bw, bh);
        ctx.restore();

        // Pants Fabric
        ctx.save();
        applyLighting();
        ctx.drawImage(bottomProcessed.canvas, bx, by, bw, bh);
        ctx.restore();

        ctx.restore();
      }

      // ==========================================
      // B. RENDER TOP / JACKET / DRESS (对齐肩膀与锁骨)
      // ==========================================
      if (topProcessed) {
        let silhouetteFactor = 1.0;
        if (fitSilhouette === 'slim') silhouetteFactor = 0.95;
        else if (fitSilhouette === 'oversize') silhouetteFactor = 1.06;

        // Shoulder span width:
        // Tops (shirts, sweaters): cw * 0.49
        // Outerwear (cashmere coat): cw * 0.54
        // Dress: cw * 0.48
        let targetSpanRatio = 0.49;
        let collarLevelRatio = 0.225; // Top collar rests at neck base / collarbone

        if (topProcessed.category === 'outerwear') {
          targetSpanRatio = 0.53;
          collarLevelRatio = 0.21;
        } else if (topProcessed.category === 'dress') {
          targetSpanRatio = 0.48;
          collarLevelRatio = 0.22;
        }

        const tw = cw * targetSpanRatio * topScale * silhouetteFactor;
        const th = (tw / topProcessed.width) * topProcessed.height;
        const tx = (cw - tw) / 2 + topOffsetX;
        const ty = ch * collarLevelRatio + topOffsetY;

        ctx.save();
        ctx.translate(tx + tw / 2, ty + th / 2);
        if (topRotation !== 0) {
          ctx.rotate((topRotation * Math.PI) / 180);
        }

        // Contact Drop Shadow onto shoulders and chest
        ctx.save();
        ctx.shadowColor = 'rgba(12, 10, 8, 0.42)';
        ctx.shadowBlur = Math.round(cw * 0.02);
        ctx.shadowOffsetY = Math.round(ch * 0.012);
        ctx.globalAlpha = 0.42;
        ctx.drawImage(topProcessed.canvas, -tw / 2, -th / 2, tw, th);
        ctx.restore();

        // Top Fabric
        ctx.save();
        applyLighting();
        ctx.drawImage(topProcessed.canvas, -tw / 2, -th / 2, tw, th);
        ctx.restore();

        // Silk Sheen highlights
        if (topItem?.id === 'c2') {
          const silkSheen = ctx.createLinearGradient(
            -tw * 0.3,
            -th * 0.3,
            tw * 0.4,
            th * 0.5
          );
          silkSheen.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
          silkSheen.addColorStop(0.35, 'rgba(255, 255, 255, 0.16)');
          silkSheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
          silkSheen.addColorStop(0.75, 'rgba(255, 255, 255, 0.12)');
          silkSheen.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = silkSheen;
          ctx.fillRect(-tw / 2, -th / 2, tw, th);
          ctx.restore();
        }

        ctx.restore();
      }

      // ==========================================
      // C. FOREGROUND HAND & PHONE OCCLUSION
      // ==========================================
      // In mirror selfies, the user's hand holds the phone in front of chest/chin
      if (preserveForegroundHand) {
        const handX = cw * 0.46;
        const handY = ch * 0.16;
        const handW = cw * 0.38;
        const handH = ch * 0.28;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          handX + handW / 2,
          handY + handH / 2,
          handW / 2,
          handH / 2,
          -0.1,
          0,
          Math.PI * 2
        );
        ctx.clip();
        ctx.drawImage(userImg, 0, 0, cw, ch);
        ctx.restore();
      }

      ctx.restore(); // end split comparison clipping

      // ==========================================
      // 5. 3D SKELETON & ANATOMICAL BODY ALIGNMENT GUIDES
      // ==========================================
      if (showSkeleton) {
        ctx.save();

        const neckX = cw * 0.5;
        const neckY = ch * 0.225;
        const lShoulderX = cw * 0.255;
        const rShoulderX = cw * 0.745;
        const shoulderY = ch * 0.26;
        const waistY = ch * 0.485;
        const lLegX = cw * 0.44;
        const rLegX = cw * 0.56;
        const ankleY = ch * 0.92;

        // Shoulder Alignment Line (肩部对齐)
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = Math.max(2, cw * 0.0035);
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(lShoulderX, shoulderY);
        ctx.lineTo(rShoulderX, shoulderY);
        ctx.stroke();

        // Waist Alignment Line (裤腰对齐)
        ctx.strokeStyle = '#10B981';
        ctx.beginPath();
        ctx.moveTo(cw * 0.31, waistY);
        ctx.lineTo(cw * 0.69, waistY);
        ctx.stroke();

        // Leg Alignment Lines (腿部铅垂垂坠)
        ctx.strokeStyle = '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(lLegX, waistY);
        ctx.lineTo(lLegX, ankleY);
        ctx.moveTo(rLegX, waistY);
        ctx.lineTo(rLegX, ankleY);
        ctx.stroke();

        ctx.setLineDash([]);

        // Anchor nodes
        const nodes = [
          { x: neckX, y: neckY, label: '领口颈窝锚点 (已对齐)', color: '#F59E0B' },
          { x: lShoulderX, y: shoulderY, label: '左肩峰 (38.5cm 对齐)', color: '#F59E0B' },
          { x: rShoulderX, y: shoulderY, label: '右肩峰 (衣服肩线贴合)', color: '#F59E0B' },
          { x: neckX, y: waistY, label: '高腰节裤腰线 (裤腰已定位)', color: '#10B981' },
          { x: lLegX, y: (waistY + ankleY) / 2, label: '左腿垂坠轴线', color: '#38BDF8' },
          { x: rLegX, y: (waistY + ankleY) / 2, label: '右腿垂坠轴线', color: '#38BDF8' },
        ];

        nodes.forEach((node) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, cw * 0.009, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = `bold ${Math.round(cw * 0.02)}px sans-serif`;
          ctx.fillStyle = 'rgba(15, 10, 8, 0.88)';
          const textW = ctx.measureText(node.label).width;
          ctx.fillRect(node.x + 12, node.y - 11, textW + 10, Math.round(cw * 0.032));
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(node.label, node.x + 17, node.y + Math.round(cw * 0.011));
        });

        ctx.restore();
      }

      // ==========================================
      // 6. FABRIC STRESS HEATMAP
      // ==========================================
      if (showStressHeatmap) {
        ctx.save();
        // Shoulder tension gradient
        const shoulderGrad = ctx.createRadialGradient(
          cw * 0.5,
          ch * 0.28,
          cw * 0.05,
          cw * 0.5,
          ch * 0.28,
          cw * 0.28
        );
        shoulderGrad.addColorStop(0, 'rgba(16, 185, 129, 0.42)');
        shoulderGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.22)');
        shoulderGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shoulderGrad;
        ctx.fillRect(0, ch * 0.18, cw, ch * 0.35);

        // Waist/Legs drape tension gradient
        const legGrad = ctx.createRadialGradient(
          cw * 0.5,
          ch * 0.65,
          cw * 0.05,
          cw * 0.5,
          ch * 0.65,
          cw * 0.25
        );
        legGrad.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
        legGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = legGrad;
        ctx.fillRect(0, ch * 0.48, cw, ch * 0.4);

        ctx.restore();
      }

      // ==========================================
      // 7. DEWU AR SPLIT COMPARISON LINE & HANDLE
      // ==========================================
      if (showComparisonSlider && sliderPosition > 0 && sliderPosition < 100) {
        ctx.save();
        const splitX = (cw * sliderPosition) / 100;

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = Math.max(3, cw * 0.004);
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, ch);
        ctx.stroke();

        const handleY = ch * 0.5;
        const handleR = Math.max(22, cw * 0.035);

        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(splitX, handleY, handleR, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1C1917';
        ctx.font = `bold ${Math.round(handleR * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◀ ▶', splitX, handleY + 1);

        ctx.restore();
      }

      setIsRenderReady(true);
    };

    renderAR();

    return () => {
      isCancelled = true;
    };
  }, [
    resolvedUserImageUrl,
    topItem,
    bottomItem,
    topOffsetY,
    topOffsetX,
    topScale,
    topRotation,
    bottomOffsetY,
    bottomOffsetX,
    bottomScale,
    fitSilhouette,
    lightingMode,
    preserveForegroundHand,
    showSkeleton,
    showStressHeatmap,
    sliderPosition,
    showComparisonSlider,
    privacyMode,
  ]);

  // Pointer dragging on slider
  const handlePointerMove = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPosition(pct);
  }, []);

  const onMouseDown = () => setIsDraggingSlider(true);
  const onMouseUp = () => setIsDraggingSlider(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) handlePointerMove(e.clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX);
  };

  return (
    <div className={`relative flex flex-col bg-stone-900 select-none overflow-hidden ${className}`}>
      {/* Top HUD Overlay: Badges & Calibration Toggle */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Original Photo Badge */}
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-stone-200 text-stone-800 text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>100% 本人实拍</span>
        </div>

        {/* Right: Real Try-on Badge + Calibration Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowCalibrationPanel(!showCalibrationPanel)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              showCalibrationPanel
                ? 'bg-stone-900 text-white'
                : 'bg-white/90 backdrop-blur-md border border-stone-200 text-stone-800 hover:bg-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>肩/腿部位对齐校准</span>
          </button>

          <div className="bg-stone-900 text-white px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-stone-300" />
            <span>{badgeLabel}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        className="relative w-full h-full flex-1 cursor-ew-resize flex items-center justify-center overflow-hidden bg-stone-950"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomActive ? 'scale-150 origin-top' : 'scale-100'
          }`}
        />

        {/* Loading Spinner */}
        {!isRenderReady && (
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
            <RefreshCw className="w-7 h-7 text-stone-300 animate-spin" />
            <span className="text-xs text-stone-300 font-mono">
              3D-AR 引擎对齐肩线与腿部中...
            </span>
          </div>
        )}

        {/* Subtle Bottom Instruction Tip */}
        <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none z-20">
          <div className="bg-white/90 backdrop-blur-md border border-stone-200 px-4 py-1.5 rounded-full text-[11px] text-stone-800 flex items-center gap-2 shadow-sm font-medium">
            <Move className="w-3.5 h-3.5 text-stone-700" />
            <span>衣服精确对齐双肩，裤子精准对齐双腿 · 左右滑动对比</span>
          </div>
        </div>
      </div>

      {/* Expandable Dewu AR Body Alignment Panel (肩/腿部位对齐面板) */}
      {showCalibrationPanel && (
        <div className="relative z-40 bg-stone-900 border-t border-amber-500/30 p-4 flex flex-col gap-3 text-xs shadow-2xl animate-in slide-in-from-bottom duration-200">
          {/* Sub-tab: Choose whether to calibrate Top (Shoulders) or Bottom (Legs) */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">部位微调选择:</span>
              <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800">
                <button
                  onClick={() => setActiveCalibTab('top')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeCalibTab === 'top'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  👕 上装 · 肩部对齐
                </button>
                <button
                  onClick={() => setActiveCalibTab('bottom')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeCalibTab === 'bottom'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  👖 下装 · 腿部对齐
                </button>
              </div>
            </div>

            <button
              onClick={resetToBodySnap}
              className="px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCw className="w-3 h-3" />
              <span>🎯 一键智能吸附 (肩/腿精准归位)</span>
            </button>
          </div>

          {/* Controls for Top (Shoulders) */}
          {activeCalibTab === 'top' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>↕️ 肩高与领窝高低</span>
                  <span className="text-amber-400 font-mono">{topOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={topOffsetY}
                  onChange={(e) => setTopOffsetY(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>↔️ 肩部左右微调</span>
                  <span className="text-amber-400 font-mono">{topOffsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={topOffsetX}
                  onChange={(e) => setTopOffsetX(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>🔍 肩宽比例匹配</span>
                  <span className="text-amber-400 font-mono">{Math.round(topScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.2"
                  step="0.01"
                  value={topScale}
                  onChange={(e) => setTopScale(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>📐 耸肩倾斜角度</span>
                  <span className="text-amber-400 font-mono">{topRotation}°</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.5"
                  value={topRotation}
                  onChange={(e) => setTopRotation(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Controls for Bottom (Pants / Legs) */}
          {activeCalibTab === 'bottom' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>↕️ 裤腰高低位置</span>
                  <span className="text-amber-400 font-mono">{bottomOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={bottomOffsetY}
                  onChange={(e) => setBottomOffsetY(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>↔️ 裤腿左右中缝</span>
                  <span className="text-amber-400 font-mono">{bottomOffsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={bottomOffsetX}
                  onChange={(e) => setBottomOffsetX(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-stone-300 font-medium">
                  <span>🔍 裤长与裤腿粗细</span>
                  <span className="text-amber-400 font-mono">{Math.round(bottomScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.2"
                  step="0.01"
                  value={bottomScale}
                  onChange={(e) => setBottomScale(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Foreground & Info Bar */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-stone-800 gap-2">
            <button
              onClick={() => setPreserveForegroundHand(!preserveForegroundHand)}
              className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 text-xs transition-all ${
                preserveForegroundHand
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-stone-950 border-stone-800 text-stone-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>镜前手部/手机前景遮挡保护: {preserveForegroundHand ? '已开启' : '关闭'}</span>
            </button>

            <span className="text-stone-400 text-[11px]">
              * 衣服上身对齐锁骨与肩膀峰点，裤子腰身对齐腰节并沿双腿垂直垂坠
            </span>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <div className="relative z-30 bg-[#FAF9F6] border-t border-stone-200 p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700">
        {/* Fit Silhouette Selector */}
        <div className="flex items-center gap-2">
          <span className="text-stone-600 font-medium flex items-center gap-1.5">
            <Shirt className="w-4 h-4 text-stone-900" />
            <span>高定剪裁版型:</span>
          </span>
          <div className="flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200">
            {(
              [
                { id: 'tailored', name: '标准合身' },
                { id: 'slim', name: '修身收腰' },
                { id: 'oversize', name: '自然微廓' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setFitSilhouette(item.id)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  fitSilhouette === item.id
                    ? 'bg-stone-900 text-white font-medium shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lighting & Tone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-stone-600 font-medium flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-stone-900" />
            <span>环境光影:</span>
          </span>
          <div className="flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200">
            {(
              [
                { id: 'auto', name: '智能柔光' },
                { id: 'warm', name: '温暖室内' },
                { id: 'daylight', name: '纯净自然' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setLightingMode(item.id)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  lightingMode === item.id
                    ? 'bg-stone-900 text-white font-medium shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Toggles: 3D Skeleton & Stress Heatmap */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs transition-all ${
              showSkeleton
                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>人体解剖锚线</span>
          </button>

          <button
            onClick={() => setShowStressHeatmap(!showStressHeatmap)}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs transition-all ${
              showStressHeatmap
                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>面料张力透视</span>
          </button>
        </div>
      </div>
    </div>
  );
};
