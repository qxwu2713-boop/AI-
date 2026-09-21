import React from 'react';
import { ClothingItem, PrivacyMode } from '../types';
import { DewuARTryOnCanvas } from './DewuARTryOnCanvas';

interface CustomTryOnCanvasProps {
  userImageUrl: string;
  fittedImageUrl?: string;
  clothingItems: ClothingItem[];
  privacyMode: PrivacyMode;
  isZoomActive?: boolean;
  offsetY?: number;
  scale?: number;
  opacity?: number;
  showSkeleton?: boolean;
  className?: string;
  badgeLabel?: string;
  showComparisonSlider?: boolean;
}

export const CustomTryOnCanvas: React.FC<CustomTryOnCanvasProps> = ({
  userImageUrl,
  fittedImageUrl,
  clothingItems,
  privacyMode,
  isZoomActive = false,
  className = '',
  badgeLabel = '3D-AR 实感试穿 (无损肤色)',
  showComparisonSlider = true,
}) => {
  return (
    <DewuARTryOnCanvas
      userImageUrl={userImageUrl}
      fittedImageUrl={fittedImageUrl}
      clothingItems={clothingItems}
      privacyMode={privacyMode}
      isZoomActive={isZoomActive}
      className={className}
      badgeLabel={badgeLabel}
      showComparisonSlider={showComparisonSlider}
    />
  );
};
