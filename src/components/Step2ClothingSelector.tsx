import React, { useState } from 'react';
import { Sparkles, Check, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { ClothingItem, ClothingCategory, ModelProfile } from '../types';
import { CLOTHING_ITEMS } from '../data/mockData';

interface Step2ClothingSelectorProps {
  selectedModel: ModelProfile;
  selectedItems: ClothingItem[];
  onToggleItem: (item: ClothingItem) => void;
  onSelectItemsBatch: (items: ClothingItem[]) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step2ClothingSelector: React.FC<Step2ClothingSelectorProps> = ({
  selectedModel,
  selectedItems,
  onToggleItem,
  onSelectItemsBatch,
  onPrevStep,
  onNextStep,
}) => {
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('all');

  // Filter items matching gender
  const filteredItems = CLOTHING_ITEMS.filter((item) => {
    const matchesGender = item.gender === selectedModel.gender;
    if (!matchesGender) return false;
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const categories: { id: ClothingCategory; label: string }[] = [
    { id: 'all', label: '全部单品' },
    { id: 'outerwear', label: '外套大衣' },
    { id: 'top', label: '衬衫上装' },
    { id: 'bottom', label: '高定西裤' },
    { id: 'dress', label: '优雅礼裙' },
  ];

  // Quick 1-Click Total Look Bundle
  const applyPresetBundle = () => {
    if (selectedModel.gender === 'female') {
      const coat = CLOTHING_ITEMS.find((c) => c.id === 'c1');
      const shirt = CLOTHING_ITEMS.find((c) => c.id === 'c2');
      const pants = CLOTHING_ITEMS.find((c) => c.id === 'c3');
      const bundle = [coat, shirt, pants].filter(Boolean) as ClothingItem[];
      onSelectItemsBatch(bundle);
    } else {
      const jacket = CLOTHING_ITEMS.find((c) => c.id === 'c5');
      const sweater = CLOTHING_ITEMS.find((c) => c.id === 'c6');
      const bundle = [jacket, sweater].filter(Boolean) as ClothingItem[];
      onSelectItemsBatch(bundle);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-28">
      {/* Top Banner */}
      <div className="bg-white border border-stone-900/10 rounded-3xl p-6 md:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-stone-950"></span>
            第 2 步 / 共 4 步 · 挑选心仪服饰
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-950 mt-1 tracking-tight">
            挑选欲试穿的当季服饰
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1">
            点击卡片可自由搭配上装、外套或裤装，支持单件或多件组合上身试穿。
          </p>
        </div>

        {/* Quick Outfit Combo */}
        <button
          onClick={applyPresetBundle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-900/15 text-xs font-medium transition-all shadow-sm shrink-0"
        >
          <Layers className="w-4 h-4 text-stone-800" />
          <span>一键穿搭全套造型</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:text-stone-950 border border-stone-900/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {filteredItems.map((item) => {
          const isSelected = selectedItems.some((i) => i.id === item.id);
          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(item)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all p-3 flex flex-col bg-white ${
                isSelected
                  ? 'border-stone-950 shadow-md ring-1 ring-stone-950'
                  : 'border-stone-900/10 hover:border-stone-900/30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Selected Checkmark Badge */}
                <div
                  className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-stone-950 text-white scale-100 shadow-md'
                      : 'bg-white/80 text-stone-400 border border-stone-200 shadow-sm'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-stone-950 line-clamp-1 tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{item.material}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                  <span className="text-xs md:text-sm font-semibold text-stone-950 font-mono">
                    ¥{item.price}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? 'bg-stone-950 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {isSelected ? '已加入' : '点击试穿'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Summary & Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-stone-900/10 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-900/15 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回重设形象</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-xs text-stone-500 hidden sm:block">
              已挑选 <span className="text-stone-950 font-semibold">{selectedItems.length}</span> 件服装
            </div>

            <button
              onClick={onNextStep}
              disabled={selectedItems.length === 0}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium text-sm transition-all shadow-[0_4px_16px_rgba(0,0,0,0.12)] ${
                selectedItems.length > 0
                  ? 'bg-stone-950 hover:bg-black text-white active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>下一步：开始 3D 试穿</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
