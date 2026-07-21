import { Logo } from "@/components/Logo";
import MatrixFilterGrid from "@/components/MatrixFilterGrid";

// Tells Next.js to skip static build caching and run this page dynamically on every request
export const dynamic = 'force-dynamic';

// Define the TypeScript interface matching our MongoDB schema
interface HardwareComponent {
  _id: string;
  name: string;
  category: string;
  vendor: string;
  pinCount: number;
  specifications: Record<string, any>;
  inStock: boolean;
  createdAt: string;
}

// Fetch live data directly from your PinoutHQ backend engine
async function getComponents(): Promise<HardwareComponent[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/v1/components`, {
      cache: 'no-store', // Ensures fresh data is pulled immediately after every automated scrape
    });

    if (!res.ok) {
      throw new Error('Failed to fetch hardware components from backend engine');
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('API Fetch Error:', error);
    return [];
  }
}

export default async function Home() {
  const components = await getComponents();

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 md:p-16 bg-slate-900 text-slate-50">
      {/* Header & Hero Section */}
      <div className="flex flex-col items-center gap-6 max-w-2xl text-center my-8 md:my-12">
        <Logo className="w-16 h-16" />
        
        <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Autonomous Hardware Hub
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Enterprise data aggregation and real time specification matrix for developers, engineers, and IoT makers.
        </p>

        {/* Live System Status Badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <div className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
            System Status: ONLINE
          </div>
          <div className="px-4 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            Redis Cache: ACTIVE
          </div>
          <div className="px-4 py-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400">
            Database Records: {components.length}
          </div>
        </div>
      </div>

      {/* Interactive Scraped Hardware Matrix Grid Section */}
      <div className="w-full max-w-6xl mt-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-2">
          <h2 className="text-lg md:text-xl font-mono font-semibold text-slate-200">
            Scraped Hardware Matrix
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            Live MongoDB Feed
          </span>
        </div>

        {/* Client side Live Search, Vendor Filtering, and Grid Display */}
        <MatrixFilterGrid initialComponents={components} />
      </div>
    </main>
  );
}