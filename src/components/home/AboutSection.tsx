import React, { useRef, useState, useEffect } from "react";
import { SKILLS } from "@/lib/skills";

export const AboutSection: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);

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
    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="about" ref={aboutRef} className="scroll-mt-24 mt-16 md:mt-24">
      <section
        className={`pb-24 transition-all duration-1000 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        }`}
      >
        {/* Avatar + Title */}
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-b from-p3blue to-p3dark p-1 border-2 border-white transform -skew-x-6 shrink-0 shadow-lg">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-p3dark relative overflow-hidden">
              <img src="/images/user_admin.webp" alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black italic tracking-wider">STATUS</h1>
        </div>

        {/* Skill Matrix */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-p3cyan/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold uppercase text-p3cyan mb-6 mt-3 flex items-center">
              <span className="w-2 h-2 bg-white mr-3 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              Skills
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SKILLS.map((skill, skillIndex) => {
                const isExpanded = expandedSkill === skillIndex;
                return (
                  <div
                    key={skill.name}
                    className="group bg-p3dark/60 rounded-xl p-5 border border-white/5 flex flex-col justify-between cursor-pointer md:cursor-default relative overflow-hidden h-36 sm:h-40 shadow-sm"
                    onClick={() => setExpandedSkill(isExpanded ? null : skillIndex)}
                    onMouseLeave={() => expandedSkill === skillIndex && setExpandedSkill(null)}
                  >
                    {/* 当前层内容 */}
                    <div className={`relative z-10 flex flex-col justify-between h-full bg-transparent md:group-hover:opacity-0 transition-opacity duration-300 ${isExpanded ? 'opacity-0' : ''}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-medium tracking-wider text-p3white/90 pr-2">{skill.name}</span>
                        <span className="text-white/30 font-mono font-bold select-none">{'>'}</span>
                      </div>

                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden relative shadow-inner mt-4">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-p3cyan/80 to-p3blue rounded-full shadow-[0_0_8px_rgba(18,105,204,0.6)] transition-transform duration-[1500ms] ease-out will-change-transform origin-left"
                          style={{
                            width: skill.width,
                            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                          }}
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
      </section>
    </div>
  );
};
