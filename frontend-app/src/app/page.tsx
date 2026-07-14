import Link from "next/link";
import { Logo } from "@/components/Logo";

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

      {/* Scraped Hardware Matrix Grid Section */}
      <div className="w-full max-w-6xl mt-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
          <h2 className="text-lg md:text-xl font-mono font-semibold text-slate-200">
            Scraped Hardware Matrix
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            Live MongoDB Feed
          </span>
        </div>

        {components.length === 0 ? (
          <div className="w-full py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <p className="text-slate-500 font-mono text-sm">
              No hardware components found in the database. Trigger your n8n automation pipeline to populate the grid!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((item) => (
              <Link 
                href={`/component/${item._id}`} 
                key={item._id}
                className="flex flex-col justify-between p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-cyan-500/80 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all duration-300 shadow-lg group backdrop-blur-sm cursor-pointer"
              >
                <div>
                  {/* Category and Stock Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-slate-700/80 text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium ${
                      item.inStock 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </div>

                  {/* Component Title */}
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 mb-1">
                    {item.name}
                  </h3>
                  
                  <p className="text-xs font-mono text-slate-400 mb-4">
                    Vendor: <span className="text-slate-300 font-semibold">{item.vendor}</span>
                  </p>

                  {/* Dynamic Specifications Table */}
                  <div className="space-y-1.5 my-4 border-t border-slate-700/40 pt-3">
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                      Technical Specs
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {item.specifications && Object.entries(item.specifications).map(([key, value]) => {
                        if (key === 'sourceUrl' || key === 'lastScrapedAt' || key === 'scrapedPrice' || key === 'currency') return null;
                        return (
                          <div key={key} className="flex justify-between text-xs py-1 border-b border-slate-800/60 font-mono">
                            <span className="text-slate-400 truncate max-w-[120px]">{key}:</span>
                            <span className="text-slate-200 font-medium truncate max-w-[140px]">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer Details */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-500">
                    Pins: <span className="text-slate-300 font-semibold">{item.pinCount || 'N/A'}</span>
                  </span>
                  {item.specifications?.scrapedPrice ? (
                    <span className="text-emerald-400 font-bold text-sm bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      ${item.specifications.scrapedPrice}
                    </span>
                  ) : (
                    <span className="text-cyan-400 text-xs font-bold group-hover:underline">
                      View Specs &rarr;
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}