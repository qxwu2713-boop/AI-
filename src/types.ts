export type Gender = 'female' | 'male';

export type BodyType = 'standard' | 'tall' | 'curvy' | 'athletic' | 'petite';

export type PrivacyMode = 'clear' | 'blur_face' | 'sunglasses' | 'avatar_3d';

export interface ModelProfile {
  id: string;
  name: string;
  gender: Gender;
  bodyType: BodyType;
  height: number; // cm
  weight: number; // kg
  bust?: number;
  waist?: number;
  hip?: number;
  recommendedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  avatarUrl: string;
  poseImageUrl: string; // Base photo before fitting
  isCustomPhoto?: boolean; // Whether captured by camera or uploaded by user
  description: string;
}

export type ClothingCategory = 'all' | 'set' | 'top' | 'bottom' | 'outerwear' | 'dress';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  gender: Gender;
  price: number;
  originalPrice: number;
  imageUrl: string;
  studioGarmentUrl?: string; // Isolated studio ghost mannequin garment asset for true AR try-on
  fittedImageUrl: Record<string, string>; // Maps model ID or bodyType to fitted image
  material: string; // e.g. "100% 澳大利亚美利奴羊毛"
  materialHighlight: string; // Quick bullet for waiting screen
  careInstruction: string;
  colors: { name: string; hex: string }[];
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  inStock: boolean;
  stockCount: number;
  shelfLocation: string; // e.g. "2F A区-08挂架"
  tags: string[];
}

export interface WaitingKnowledge {
  title: string;
  category: 'fabric' | 'styling' | 'brand';
  content: string;
  tip: string;
}

export type FittingStatus = 'idle' | 'processing' | 'success' | 'failed';

export interface FailureReason {
  code: string;
  title: string;
  description: string;
  solution1: string;
  solution2: string;
}

export interface FittingSession {
  id: string;
  model: ModelProfile;
  selectedItems: ClothingItem[];
  privacyMode: PrivacyMode;
  createdAt: number;
  resultImageUrl?: string;
  couponCode?: string;
  discountAmount?: number;
}
