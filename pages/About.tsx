import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar/Stats */}
        <div className="md:col-span-1 space-y-6">
           {/* Avatar Box */}
           <div className="bg-gradient-to-b from-p3blue to-black p-1 border-2 border-white transform -skew-x-6">
              <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                 {/* Placeholder for user avatar */}
                 <img src="/images/user_admin.jpg" alt="Avatar" className="w-full h-full object-cover" />
                 <div className="absolute bottom-0 left-0 right-0 bg-p3cyan/90 text-black p-2 font-display font-bold text-center text-xl">
                    USER_ADMIN
                 </div>
              </div>
           </div>

           {/* Stats */}
           <div className="bg-black/50 p-4 border border-white/20 font-mono text-sm space-y-2">
              <div className="flex justify-between border-b border-white/10 pb-1">
                 <span className="text-gray-400">ROLE</span>
                 <span className="text-p3cyan">DEVELOPER</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                 <span className="text-gray-400">LVL</span>
                 <span className="text-white">99</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                 <span className="text-gray-400">EXP</span>
                 <span className="text-white">MAX</span>
              </div>
           </div>
        </div>

        {/* Right Column: Info */}
        <div className="md:col-span-2 space-y-8">
           <div className="bg-white/5 p-8 border-l-4 border-p3cyan relative">
              <h1 className="text-5xl font-display font-black italic mb-6">STATUS</h1>
              
              <div className="space-y-6 text-gray-200 font-light text-lg">
                <p>
                  Welcome to my digital cognitive world. I am a frontend engineer focused on creating immersive web experiences that blur the line between utility and art.
                </p>
                <p>
                  This site is a tribute to the UI aesthetics of Persona 3 Reload, built entirely with React and Tailwind CSS.
                </p>
              </div>

              {/* Skill Matrix */}
              <div className="mt-12">
                 <h2 className="text-xl font-bold uppercase text-p3cyan mb-4 flex items-center">
                    <span className="w-2 h-2 bg-white mr-2" />
                    Technical Skills
                 </h2>
                 <div className="grid grid-cols-2 gap-4">
                    {['React / Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Node.js', 'UI/UX Design'].map(skill => (
                       <div key={skill} className="bg-black/40 p-3 border border-white/10 flex items-center justify-between group hover:bg-p3blue/20 transition-colors cursor-default">
                          <span>{skill}</span>
                          <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                             <div className="h-full bg-p3cyan w-[80%]" />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};