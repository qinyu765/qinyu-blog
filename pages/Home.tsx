import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BLOG_POSTS } from "../constants";
import { ArrowRight, Star } from "lucide-react";
import { P3RDialogUI } from "../components/P3RDialogUI";
import { useSEO } from "../lib/use-seo";

// 使用 import.meta.glob 自动获取 public/images/Favorites 下的所有文件
// 键为形如 "/public/images/Favorites/LaLaLand_Movie.jpg" 的路径
const favoritesFiles = import.meta.glob('/public/images/Favorites/*.{jpg,jpeg,png,gif,webp}', { eager: true });

interface FavoriteGroup {
  prefix: string;
  images: string[];
}

interface CategoryGroup {
  category: string;
  groups: FavoriteGroup[];
}

const categorizedFavorites: CategoryGroup[] = [];

Object.keys(favoritesFiles).forEach(filepath => {
  // filepath like "/public/images/Favorites/LaLaLand_Movie.jpg"
  const filename = filepath.split('/').pop();
  if (!filename) return;
  
  // 按照 "_” 切割
  const nameWithoutExt = filename.split('.')[0];
  const parts = nameWithoutExt.split('_');
  const category = parts.pop() || 'Other';
  const prefix = parts[0] || nameWithoutExt; // 第一部分作为相同前缀判断依据
  const imgSrc = filepath.replace('/public', '');

  let categoryObj = categorizedFavorites.find(c => c.category === category);
  if (!categoryObj) {
    categoryObj = { category, groups: [] };
    categorizedFavorites.push(categoryObj);
  }

  let groupObj = categoryObj.groups.find(g => g.prefix === prefix);
  if (groupObj) {
    groupObj.images.push(imgSrc);
  } else {
    categoryObj.groups.push({ prefix, images: [imgSrc] });
  }
});

// 对外提供，为了保证分类展示顺序的一致性，按字母顺序进行排序
categorizedFavorites.sort((a, b) => a.category.localeCompare(b.category));

export const Home: React.FC = () => {
  useSEO({ title: '首页', description: 'HF 的技术博客 — 前端开发、React、TypeScript 技术分享与实践记录', path: '/' });
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const favoritesRef = useRef<HTMLElement>(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isFavoritesVisible, setIsFavoritesVisible] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);
  
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
    // 获取最底层的图片（无论该组由多少图片构成，将序列最后的一张拿出放置首部以进行反向轮替循环）
    const bottomImgIdx = (currentHead + count - 1) % count;

    // 阶段1：将其向右抽出（暂仍不改变排头，保持原低层 z-index 且外移脱离遮盖）
    setAnimatingTarget({ groupKey, imgIdx: bottomImgIdx });

    // 阶段2：更新排头由于 React 响应使得 z-index 跳变最高，同时坐标清零自动触发放回过渡动画
    setTimeout(() => {
      setHeadIndexMap(prev => ({ ...prev, [groupKey]: bottomImgIdx }));
      setAnimatingTarget(null);
    }, 400); 
  };

  useEffect(() => {
    if (location.hash === '#about' || location.hash === '#favorites') {
      // 简单而粗暴的重试机制，确保组件完全挂载后能找到并滚动到 ref
      const scrollAttempt = () => {
        let targetRef = location.hash === '#about' ? aboutRef.current : favoritesRef.current;
        if (targetRef) {
          targetRef.scrollIntoView({ behavior: 'smooth' });
        } else {
          setTimeout(scrollAttempt, 50);
        }
      };
      // 等待初始渲染流完成
      setTimeout(scrollAttempt, 100);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target.id === 'about') {
            setIsAboutVisible(entry.isIntersecting);
          } else if (entry.target.id === 'favorites') {
            setIsFavoritesVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (favoritesRef.current) observer.observe(favoritesRef.current);
    return () => observer.disconnect();
  }, []);

  if (!BLOG_POSTS.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-display font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-p3mid">
          PERSONA
          <br />
          BLOG
        </h1>
        <p className="mt-8 text-xl text-p3cyan font-light tracking-widest">
          No records found in the archive.
        </p>
      </div>
    );
  }

  const latestPost = BLOG_POSTS[0];
  const otherPosts = BLOG_POSTS.slice(1);

  // 构造足够长的数据以支撑无限循环跑马灯，且前后两半必须完全相同
  let base1 = [...otherPosts];
  while (base1.length < 5) base1 = [...base1, ...otherPosts];
  
  let base2 = [...otherPosts].reverse();
  while (base2.length < 5) base2 = [...base2, ...otherPosts].reverse();

  const finalRow1 = [...base1, ...base1];
  const finalRow2 = [...base2, ...base2];

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-16 items-center">
          {/* Typography Graphic */}
          <div className="space-y-6 z-10">
            {/* <div className="flex justify-center max-w-md">
              <div className="relative">
                <div className="absolute -inset-4 bg-p3cyan/10 blur-3xl rounded-full animate-pulse" />
                <img src="/logo.svg" alt="Logo" className="relative w-48 sm:w-64 md:w-80 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" />
              </div>
            </div> */}
            <p className="text-sm md:text-base font-light border border-p3blue/30 border-l-[4px] border-l-p3blue bg-p3dark/90 px-6 py-5 backdrop-blur-md max-w-lg text-p3white/90 leading-relaxed shadow-[3px_3px_0_0_rgba(18,105,204,0.5)]">
              简单写写博客，记录一些想法和经历。偶尔也会分享一些有趣的资源和工具。欢迎来到我的个人博客！希望你能在这里找到一些有价值的内容。
            </p>
          </div>

          {/* Featured Post Card (High Impact) */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-p3cyan/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Link
              to={`/blog/${latestPost.id}`}
              className="block relative transform transition-transform duration-300"
            >
              {/* Header Label */}
              <div className="absolute -top-4 -left-4 z-20 bg-p3red text-p3black px-4 py-1 transform -skew-x-12 font-bold shadow-lg">
                FEATURED ENTRY
              </div>

              <div className="bg-p3dark/90 backdrop-blur-md border border-white/20 p-8 relative overflow-hidden group-hover:border-p3cyan transition-colors">
                {/* 粗犷的背景纹理与大字 */}
                <div className="absolute inset-0 bg-gradient-to-br from-p3blue/10 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 text-8xl md:text-9xl font-display font-black text-white/5 transform -skew-x-12 select-none uppercase pointer-events-none">
                  {latestPost.category || 'ENTRY'}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center text-p3cyan/80 text-sm font-mono mb-6 border-b border-white/10 pb-4">
                    <span className="bg-p3cyan/10 px-2 py-1">{latestPost.date}</span>
                    <span className="border border-p3cyan/30 px-2 py-1 -skew-x-12"><span className="inline-block skew-x-12">{latestPost.category}</span></span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6 text-white transition-colors leading-tight">
                    {latestPost.title}
                  </h2>
                  <p className="text-p3mid font-light text-base md:text-lg leading-relaxed border-l-4 border-p3red pl-4">
                    {latestPost.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Entries List */}
      <section className="space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-1 flex-grow bg-white/20"></div>
          <h3 className="text-2xl font-display italic text-white/80">
            RECENT LOGS
          </h3>
          <div className="h-1 w-12 bg-p3cyan"></div>
        </div>

        <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden flex flex-col gap-6 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-16 md:before:w-32 before:bg-gradient-to-r before:from-p3dark before:to-transparent before:z-20 before:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-16 md:after:w-32 after:bg-gradient-to-l after:from-p3dark after:to-transparent after:z-20 after:pointer-events-none">
          {/* Row 1 - Marquee Left */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-4">
            {finalRow1.map((post, index) => (
              <Link
                key={`row1-${post.id}-${index}`}
                to={`/blog/${post.id}`}
                className="w-[280px] md:w-[380px] shrink-0 group relative block bg-p3dark/70 border-l-4 border-white hover:border-p3cyan transition-colors overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-p3blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 relative z-10 flex flex-col h-full justify-between min-h-[200px]">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star size={12} className="text-p3red" />
                      <span className="text-xs font-mono text-p3cyan">
                        {post.date}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold uppercase mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-p3mid/70 line-clamp-3">{post.excerpt}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs font-bold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                    <span>Read Protocol</span>
                    <ArrowRight
                      size={14}
                      className="ml-2 transform group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2 - Marquee Right */}
          <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] gap-6 px-4">
            {finalRow2.map((post, index) => (
              <Link
                key={`row2-${post.id}-${index}`}
                to={`/blog/${post.id}`}
                className="w-[280px] md:w-[380px] shrink-0 group relative block bg-p3dark/70 border-l-4 border-white hover:border-p3cyan transition-colors overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-p3blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 relative z-10 flex flex-col h-full justify-between min-h-[200px]">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star size={12} className="text-p3red" />
                      <span className="text-xs font-mono text-p3cyan">
                        {post.date}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold uppercase mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-p3mid/70 line-clamp-3">{post.excerpt}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs font-bold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                    <span>Read Protocol</span>
                    <ArrowRight
                      size={14}
                      className="ml-2 transform group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <div id="about" ref={aboutRef} className="scroll-mt-24 mt-16 md:mt-24">
        <section 
          className={`pb-24 transition-all duration-1000 ease-out transform ${
            isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
        {/* <div className="max-w-3xl mx-auto space-y-8 px-4 md:px-0"> */}
          {/* Avatar + Title */}
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-b from-p3blue to-p3dark p-1 border-2 border-white transform -skew-x-6 shrink-0 shadow-lg">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-p3dark relative overflow-hidden">
                <img src="/images/user_admin.webp" alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black italic tracking-wider">STATUS</h1>
          </div>

          {/* Info */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-p3cyan/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none" />
            {/* <div className="space-y-6 text-p3white/90 font-light text-lg relative z-10 leading-relaxed">
              <p>欢迎来到我的数字认知世界。我是一名前端工程师，专注于打造沉浸式的 Web 体验，模糊实用与艺术之间的边界。</p>
              <p>本站致敬 Persona 3 Reload 的 UI 美学，完全基于 React 与 Tailwind CSS 构建。</p>
            </div> */}

            {/* Skill Matrix */}
            <div className="relative z-10">
              <h2 className="text-xl font-bold uppercase text-p3cyan mb-6 mt-3 flex items-center">
                <span className="w-2 h-2 bg-white mr-3 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'React / React Native / Expo', width: '70%', desc: '使用 Expo 参与完成教育软件 步刻AI 等等项目开发，主要负责APP前端部分' },
                  { name: 'Vue / uniapp', width: '70%', desc: '使用 Vue 进行项目前端开发，曾用 uniapp 开发跨端 线上商城 前端项目，着重小程序端开发；以及会议室门锁后台管理系统的前端开发' },
                  { name: 'JavaScript / TypeScript', width: '65%', desc: '扎实的 JS 基础抽象能力，非常喜爱并习惯使用 TypeScript 进行类型安全的开发以减少潜在的边界边缘错误。' },
                  { name: 'Python', width: '40%', desc: '熟悉其基本语法规则集，曾在日常生活中作为写自动化脚本、简单正则文本批处理和网络数据采集抓取的工具。' },
                  { name: 'Node.js / Nest.js', width: '40%', desc: '能够用以开发服务化的 API 和工具脚手架层，对 Nest 生态的依赖注入与装饰器等抽象服务端设计有着基本了解。曾完成会议室门锁后台管理系统的后端部分' },
                  { name: 'C / C++', width: '60%', desc: '作为我参与算法竞赛的主要语言；系统性地学习了底层开发概念，包括基础指针语法和内存的手动管理边界。' },
                ].map((skill, skillIndex) => {
                  const isExpanded = expandedSkill === skillIndex;
                  return (
                  <div 
                    key={skill.name} 
                    className="group bg-p3dark/60 rounded-xl p-5 border border-white/5 flex flex-col justify-between cursor-pointer md:cursor-default relative overflow-hidden h-36 sm:h-40 shadow-sm"
                    onClick={() => setExpandedSkill(isExpanded ? null : skillIndex)}
                  >
                    {/* 当前层内容 (展开或桌面端悬停时淡出) */}
                    <div className={`relative z-10 flex flex-col justify-between h-full bg-transparent md:group-hover:opacity-0 transition-opacity duration-300 ${isExpanded ? 'opacity-0' : ''}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-medium tracking-wider text-p3white/90 pr-2">{skill.name}</span>
                        <span className="text-white/30 font-mono font-bold select-none">{'>'}</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden relative shadow-inner mt-4">
                        <div 
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-p3cyan/80 to-p3blue transition-all duration-[1500ms] ease-out rounded-full shadow-[0_0_8px_rgba(18,105,204,0.6)]" 
                          style={{ width: isAboutVisible ? skill.width : '0%' }} 
                        />
                      </div>
                    </div>

                    {/* 悬浮/展开介绍卡片 */}
                    <div className={`absolute inset-0 bg-slate-600/95 backdrop-blur-sm p-5 flex flex-col justify-center rounded-xl z-20 
                                  transition-all duration-300 ease-out origin-bottom-right
                                  ${isExpanded 
                                    ? 'opacity-100 scale-100 pointer-events-auto' 
                                    : 'opacity-0 scale-95 pointer-events-none'
                                  }
                                  md:opacity-0 md:pointer-events-none md:-rotate-12 md:translate-x-[-10%] md:translate-y-[10%]
                                  md:group-hover:opacity-100 md:group-hover:rotate-0 md:group-hover:translate-x-0 md:group-hover:translate-y-0 md:group-hover:scale-100 md:group-hover:pointer-events-auto`}>
                      <span className="font-bold text-white mb-3 text-base">{skill.name}</span>
                      <p className="text-white/90 text-sm font-light leading-relaxed line-clamp-5">
                        {skill.desc}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        {/* </div> */}
        </section>
      </div>

      {/* Favorites Section */}
      <div id="favorites" ref={favoritesRef} className="scroll-mt-8">
        <section 
          className={`pb-24 transition-all duration-1000 ease-out transform ${
            isFavoritesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
        {/* <div className="flex items-center gap-6 mb-12">
            <div className="bg-gradient-to-b from-p3cyan to-p3blue p-1 border-2 border-white transform skew-x-6 shrink-0 shadow-lg flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
               <Star size={40} className="text-p3dark animate-pulse absolute" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black italic tracking-wider uppercase">Favorites</h1>
        </div> */}

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
                        // imgIdx 相对于 currentHead 的层叠深度（0代表最上层）
                        const posIdx = (imgIdx - currentHead + count) % count;
                        // 判定是否正在向右抽出 (第一阶段)
                        const isPoppingOut = animatingTarget?.groupKey === groupKey && animatingTarget.imgIdx === imgIdx;
                        const isHovered = hoveredGroup === groupKey;
                        
                        // 保证最多三张层叠卡可见，如果正在抽拉中强制设为可见
                        const isVisible = posIdx < 3 || isPoppingOut;
                        
                        // posIdx 越低（靠前），层级越高
                        const zIndex = 10 - posIdx;
                        
                        // 依据展示深度计算静态的偏移效果 (永远按照位置 0, 1, 2 展示)
                        const offsetBase = isMultiple ? posIdx * 10 : 0;
                        const rotations = ['-2deg', '3deg', '-1deg', '0deg'];
                        const defaultRotate = isMultiple ? (rotations[posIdx] || '0deg') : '0deg';

                        // 鼠标悬浮时展开的扇形效果
                        const hoverTranslateX = isMultiple ? posIdx * 80 : 0;
                        const hoverTranslateY = isMultiple ? posIdx * 20 : 0;
                        const hoverRotate = isMultiple ? posIdx * 6 : 0;

                        // 抽出则做向外的短促滑出，随后再归位
                        let transform = `translate(${offsetBase}px, ${offsetBase}px) rotate(${defaultRotate})`;
                        if (isPoppingOut) {
                          transform = `translate(100px, 40px) rotate(12deg)`; // 明显抽出但不会甩离屏幕，更连贯
                        } else if (isHovered) {
                          transform = `translate(${hoverTranslateX}px, ${hoverTranslateY}px) rotate(${hoverRotate}deg)`;
                        }

                        return (
                          <div 
                            key={imgIdx} 
                            className="absolute inset-0 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl bg-p3dark"
                            style={{
                              zIndex,
                              opacity: isVisible ? 1 : 0,
                              pointerEvents: isVisible ? 'auto' : 'none',
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
    </div>
  );
};
