import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900 text-slate-50">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <Logo className="w-12 h-12" />
        
        <h1 className="text-3xl font-mono font-bold tracking-tight">
          Autonomous Hardware Hub
        </h1>
        
        <p className="text-slate-400 text-sm leading-relaxed">
          Enterprise data aggregation and real time specification matrix for developers, engineers, and IoT makers.
        </p>

        <div className="flex gap-4 mt-4">
          <div className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
            System Status: ONLINE
          </div>
          <div className="px-4 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            Redis Cache: ACTIVE
          </div>
        </div>
      </div>
    </main>
  );
}