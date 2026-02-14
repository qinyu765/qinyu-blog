import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto space-y-8">
      {/* Avatar + Title */}
      <div className="flex items-center gap-6">
        <div className="bg-gradient-to-b from-p3blue to-p3dark p-1 border-2 border-white transform -skew-x-6 shrink-0">
          <div className="w-24 h-24 bg-p3dark relative overflow-hidden">
            <img src="/images/user_admin.jpg" alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
        <h1 className="text-5xl font-display font-black italic">STATUS</h1>
      </div>

      {/* Info */}
      <div className="bg-white/5 p-8 border-l-4 border-p3cyan space-y-8">
        <div className="space-y-6 text-p3white/80 font-light text-lg">
          <p>欢迎来到我的数字认知世界。我是一名前端工程师，专注于打造沉浸式的 Web 体验，模糊实用与艺术之间的边界。</p>
          <p>本站致敬 Persona 3 Reload 的 UI 美学，完全基于 React 与 Tailwind CSS 构建。</p>
        </div>

        {/* Skill Matrix */}
        <div>
          <h2 className="text-xl font-bold uppercase text-p3cyan mb-4 flex items-center">
            <span className="w-2 h-2 bg-white mr-2" />
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ['React / Next.js', '90%'],
              ['TypeScript', '85%'],
              ['Tailwind CSS', '80%'],
              ['Three.js', '60%'],
              ['Node.js', '75%'],
              ['UI/UX Design', '70%'],
            ] as const).map(([skill, width]) => (
              <div key={skill} className="bg-p3dark/50 p-3 border border-white/10 flex items-center justify-between group hover:bg-p3blue/20 transition-colors cursor-default">
                <span>{skill}</span>
                <div className="w-12 h-1 bg-p3blue/30 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-p3red to-p3cyan" style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};