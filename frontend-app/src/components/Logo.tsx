import React from 'react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className="flex items-center gap-2.5 select-none">
    <svg 
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <rect x="6" y="6" width="24" height="24" rx="4" className="fill-slate-800 stroke-slate-400" strokeWidth="2" />
      <rect x="12" y="12" width="12" height="12" rx="2" className="fill-slate-900 stroke-cyan-400" strokeWidth="1.5" />
      <path d="M2 14H6M2 22H6" className="stroke-slate-500" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 34V30M22 34V30" className="stroke-slate-500" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 14H34M30 22H34" className="stroke-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 2V6M22 2V6" className="stroke-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]" strokeWidth="2" strokeLinecap="round" />
    </svg>

    <span className="font-mono text-xl font-bold tracking-tight text-slate-50">
      Pinout<span className="text-cyan-400">HQ</span>
    </span>
  </div>
);