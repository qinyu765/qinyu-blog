import React from 'react';

interface P3RDialogUIProps {
  name?: string;
  text: React.ReactNode;
}

export const P3RDialogUI: React.FC<P3RDialogUIProps> = ({ 
  name, 
  text
}) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      
      {/* 整个对话框的外层定位容器，固定于画面的底端，高度合理 */}
      <div className="absolute bottom-[5%] left-[5%] right-[5%] h-[28%] z-10 flex items-center justify-center">

        {/* =========================================
            Layer 1: 第一层 (Bottom Layer) 
            由于原图左下方露出极多的大倾斜尖角，我们用大范围的块来雕刻斜率
        ========================================= */}
        <div 
          className="absolute bg-[#0B1BEB] z-10" 
          style={{
             // 放大底层限制以容纳长距剪切
             width: '110%',
             height: '180%',
             left: '-5%',
             top: '-20%',
             // 核心形状：左侧的尖锋破界而出，上边缘整体上翘至右上，下边缘从左下倾泻
             clipPath: 'polygon(0% 40%, 15% 25%, 100% 10%, 100% 80%, 20% 100%, 8% 70%)',
             opacity: 0.95
          }}
        />
        {/* 深蓝色辅底加强层叠感 */}
        <div 
          className="absolute w-[112%] h-[190%] left-[-6%] top-[-25%] bg-[#00045e] z-0" 
          style={{
             clipPath: 'polygon(0% 45%, 18% 28%, 100% 15%, 100% 85%, 22% 100%, 5% 75%)',
             opacity: 0.8
          }}
        />

        {/* =========================================
            Layer 2: 第二层 (Middle Layer) 
            类长方形：
        ========================================= */}


      </div>
    </div>
  );
};
