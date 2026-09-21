import React from 'react';
import { X, Sparkles, CheckCircle2, Shield, Clock, AlertTriangle, ArrowRight, Smartphone, Zap, Eye } from 'lucide-react';

interface DesignInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (step: number) => void;
  onTriggerFailureSimulation: () => void;
  onOpenMobileCompanion: () => void;
}

export const DesignInsightsDrawer: React.FC<DesignInsightsDrawerProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
  onTriggerFailureSimulation,
  onOpenMobileCompanion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-stone-900 border-l border-stone-800 h-full overflow-y-auto p-6 space-y-6 text-stone-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>题目要求深度解构与设计策略说明</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-white mt-1">
              AI 虚拟试衣大屏 · 核心解法看板
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Pillars Accordion/Card System */}
        <div className="space-y-4">
          {/* Criterion 1: 操作门槛 */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>重点一：极低操作门槛 (Low Barrier & Zero Learning Curve)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                10秒完成
              </span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>免繁琐脱衣/量体</strong>：提供男女各类型快速预设模特（标准、高挑、丰满、健美），辅以极简身高体重微调。
              </li>
              <li>
                <strong>大屏触控人机工程学</strong>：超大触摸响应区域、底部常驻悬浮决策栏，避免顾客踮脚或弯腰按不到。
              </li>
              <li>
                <strong>一键成套试穿</strong>：解决“不知怎么搭”的痛点，提供法式通勤、名媛晚礼等专业造型师成套预设。
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => {
                  onJumpToStep(1);
                  onClose();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                跳转体验【步骤1：身型与形象选择】→
              </button>
            </div>
          </div>

          {/* Criterion 2: 等待体验与失败兜底 */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>重点二：生成等待与失败容错 (Waiting & Failure Resilience)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                拒绝对客尴尬
              </span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>四阶段布料动力学解算进度</strong>：将枯燥等待拆解为骨骼对齐、重力悬垂、光影微纹理，提升专业质感。
              </li>
              <li>
                <strong>面料黑科技与穿搭知识伴读</strong>：等待期间轮播阿尔巴斯羊绒、真丝工艺与黄金穿搭心法，建立高奢品牌心智。
              </li>
              <li>
                <strong>商场多重失败平滑降级</strong>：针对商场强顶光或遮挡，不弹粗暴错误码，提供：
                <ol className="pl-4 pt-1 list-decimal space-y-1 text-stone-400">
                  <li>快速智能平滑降噪重试</li>
                  <li>一键秒切至同身材官方 Lookbook 真人实拍（试衣不中断）</li>
                  <li>呼叫现场导购协助送现货</li>
                </ol>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => {
                  onJumpToStep(3);
                  onTriggerFailureSimulation();
                  onClose();
                }}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                跳转测试【步骤3：等待流与失败容错演练】→
              </button>
            </div>
          </div>

          {/* Criterion 3: 隐私保护 */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                <span>重点三：商场大屏多重隐私防护 (Privacy by Design)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                阅后即焚
              </span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>人走即焚 (30秒倒计时)</strong>：顶部常驻倒计时，顾客离开后显存数据瞬时粉碎，避免被后续顾客围观。
              </li>
              <li>
                <strong>面部自主脱敏</strong>：支持自然原貌、轻雾模糊、高定墨镜遮挡及3D虚拟超模面容四级隐私策略。
              </li>
              <li>
                <strong>全边缘计算架构</strong>：骨骼网格纯在本地 NPU 推理，生物特征绝不上云，消除用户数据泄露恐惧。
              </li>
            </ul>
          </div>

          {/* Criterion 4: 从试穿到购买的转化路径 */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>重点四：从试穿到购买的全链路转化 (Conversion Loop)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                O2O全闭环
              </span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>店内在架实物即刻导引</strong>：试衣单品清晰标记具体挂架（如“2F A区-03”），距离大屏步行仅12米。
              </li>
              <li>
                <strong>智能体态尺码匹配置信度</strong>：结合试穿推算最佳合体尺码，减少现场翻找或退换成本。
              </li>
              <li>
                <strong>大屏专属即时立减券</strong>：现场专享 -¥60 券，营造稀缺感加速到店决策。
              </li>
              <li>
                <strong>扫码带走到手机端 (H5/小程序)</strong>：
                <ol className="pl-4 pt-1 list-decimal space-y-1 text-stone-400">
                  <li>保存/分享穿搭海报（社交裂变）</li>
                  <li>一键呼叫导购送推荐尺码到指定试衣间（无感试衣）</li>
                  <li>线上支付包邮到家 / 门店自提</li>
                </ol>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenMobileCompanion();
                  onClose();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                直接唤起【手机端闭环演示】→
              </button>
            </div>
          </div>
        </div>

        {/* Quick Footer Action */}
        <div className="pt-2 border-t border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
          >
            返回大屏原型体验
          </button>
        </div>
      </div>
    </div>
  );
};
