import React, { useRef, useState, useEffect } from "react";
import { CategoryGroup } from "@/lib/favorites";

interface FavoritesSectionProps {
  favorites: CategoryGroup[];
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ favorites: categorizedFavorites }) => {
  const favoritesRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 记录当前鼠标悬浮的图片组，用于展开扇面
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  // 记录每个图片组当前在第一层（排头）的图片 index
  const [headIndexMap, setHeadIndexMap] = useState<Record<string, number>>({});
  // 记录当前处于"抽出"动画第一阶段的目标图片
  const [animatingTarget, setAnimatingTarget] = useState<{groupKey: string, imgIdx: number} | null>(null);

  const handleGroupClick = (groupKey: string, count: number) => {
    // 动画正在进行或只有1张图片时，不响应点击
    if (count <= 1 || animatingTarget?.groupKey === groupKey) return;

    // 获取当前排头
    const currentHead = headIndexMap[groupKey] || 0;
    // 获取最底层的图片
    const bottomImgIdx = (currentHead + count - 1) % count;

    // 阶段1：将其向右抽出
    setAnimatingTarget({ groupKey, imgIdx: bottomImgIdx });

    // 阶段2：更新排头
    setTimeout(() => {
      setHeadIndexMap(prev => ({ ...prev, [groupKey]: bottomImgIdx }));
      setAnimatingTarget(null);
    }, 400);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // 单向触发：显示后不再隐藏
          }
        });
      },
      { threshold: 0.05 }
    );
    if (favoritesRef.current) observer.observe(favoritesRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="favorites" ref={favoritesRef} className="scroll-mt-8">
      <section
        className={`pb-24 transition-all duration-1000 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        }`}
      >
        <div className="space-y-16 mt-8">
          {categorizedFavorites.map((categoryData) => (
            <div key={categoryData.category} className="space-y-6">
              {/* 类别标题 */}
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-wider text-white/80 uppercase border-b border-white/10 pb-4 inline-block pr-12">
                {categoryData.category}
              </h2>

              {/* 类别下的图片卡片组展示区域 */}
              <div className="flex flex-wrap gap-14 pl-2">
                {categoryData.groups.map((group, idx) => {
                  const groupKey = `${categoryData.category}-${idx}`;
                  const isMultiple = group.images.length > 1;
                  const count = group.images.length;

                  return (
                    <div
                      key={idx}
                      className="relative perspective-1000 w-56 h-56 sm:w-56 sm:h-56 md:w-64 md:h-64 shrink-0"
                      style={{ cursor: isMultiple ? 'pointer' : 'default' }}
                      onMouseEnter={() => isMultiple && setHoveredGroup(groupKey)}
                      onMouseLeave={() => setHoveredGroup(null)}
                      onClick={() => handleGroupClick(groupKey, count)}
                    >
                      {group.images.map((imgSrc, imgIdx) => {
                        const currentHead = headIndexMap[groupKey] || 0;
                        const posIdx = (imgIdx - currentHead + count) % count;
                        const isPoppingOut = animatingTarget?.groupKey === groupKey && animatingTarget.imgIdx === imgIdx;
                        const isHovered = hoveredGroup === groupKey;

                        const isCardVisible = posIdx < 3 || isPoppingOut;
                        const zIndex = 10 - posIdx;

                        const offsetBase = isMultiple ? posIdx * 10 : 0;
                        const rotations = ['-2deg', '3deg', '-1deg', '0deg'];
                        const defaultRotate = isMultiple ? (rotations[posIdx] || '0deg') : '0deg';

                        const hoverTranslateX = isMultiple ? posIdx * 80 : 0;
                        const hoverTranslateY = isMultiple ? posIdx * 20 : 0;
                        const hoverRotate = isMultiple ? posIdx * 6 : 0;

                        let transform = `translate(${offsetBase}px, ${offsetBase}px) rotate(${defaultRotate})`;
                        if (isPoppingOut) {
                          transform = `translate(100px, 40px) rotate(12deg)`;
                        } else if (isHovered) {
                          transform = `translate(${hoverTranslateX}px, ${hoverTranslateY}px) rotate(${hoverRotate}deg)`;
                        }

                        return (
                          <div
                            key={imgIdx}
                            className="absolute inset-0 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl bg-p3dark"
                            style={{
                              zIndex,
                              opacity: isCardVisible ? 1 : 0,
                              pointerEvents: isCardVisible ? 'auto' : 'none',
                              transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease, box-shadow 0.4s',
                              transform,
                              boxShadow: posIdx === 0 && !isPoppingOut
                                ? '0 0 15px rgba(18,105,204,0.3)'
                                : undefined,
                            }}
                          >
                            <img src={imgSrc} alt={group.prefix} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
