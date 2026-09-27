import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#080c14]">
      {/* Deep ambient base gradient */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(20, 40, 60, 0.4) 0%, rgba(8, 12, 20, 0.95) 75%)',
        }}
      />

      {/* Floating fluid liquid light orbs */}
      <div 
        className="absolute -top-[10%] left-[15%] w-[580px] h-[580px] rounded-full blur-[130px] animate-liquid-1"
        style={{
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.22) 0%, rgba(13, 148, 136, 0.08) 50%, transparent 75%)',
        }}
      />

      <div 
        className="absolute top-[35%] -right-[8%] w-[640px] h-[640px] rounded-full blur-[140px] animate-liquid-2"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(79, 70, 229, 0.06) 50%, transparent 75%)',
        }}
      />

      <div 
        className="absolute -bottom-[15%] left-[25%] w-[700px] h-[700px] rounded-full blur-[150px] animate-liquid-3"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(14, 116, 144, 0.06) 55%, transparent 80%)',
        }}
      />

      {/* Subtle liquid refraction highlights */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top ambient illumination glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/20 to-transparent" />
    </div>
  );
};
