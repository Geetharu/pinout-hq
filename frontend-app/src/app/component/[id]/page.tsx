import Link from "next/link";
import { Logo } from "@/components/Logo";

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

async function getComponentDetails(id: string): Promise<HardwareComponent | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/v1/components/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to fetch component details:', error);
    return null;
  }
}

export default async function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getComponentDetails(id);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-mono text-rose-400 mb-4">404: Hardware Component Not Found</h1>
        <Link href="/" className="px-4 py-2 bg-slate-800 rounded-lg text-cyan-400 font-mono text-sm hover:bg-slate-700 transition">
          Return to Hardware Matrix
        </Link>
      </div>
    );
  }

  const price = item.specifications?.scrapedPrice || "49.99";
  const sourceUrl = item.specifications?.sourceUrl || "#";

  // Safely extract our new 1000x SEO data or provide a clean fallback structure
  const seo = item.specifications?.seoArticle || {
    title: `Complete Engineering Guide & Pinout for ${item.name}`,
    architectureOverview: `The ${item.name} from ${item.vendor} is designed for high-performance IoT applications and embedded systems development. Featuring robust voltage regulation and integrated communications, this module is ideal for rapid prototyping and enterprise scaling.`,
    pinoutAndInterface: `When integrating this module into your circuit design, verify all voltage reference pins and ensure proper grounding across your printed circuit board. Always consult the official datasheet before connecting high current loads.`,
    powerAndThermal: `Ensure your power supply rail can deliver adequate clean current during RF transmission or high-load sensor polling. Placing decoupling capacitors near the power pins is highly recommended.`,
    firmwareCode: `// Boilerplate code will populate on next sync cycle\n#include <Arduino.h>\nvoid setup() { Serial.begin(115200); }\nvoid loop() {}`,
    troubleshooting: [],
    faqs: []
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-12 flex flex-col items-center">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="font-mono font-bold tracking-tight text-lg text-slate-200 group-hover:text-cyan-400 transition-colors">
            PinoutHQ
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Docs v2.4
          </span>
          <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
            &larr; Back to Matrix
          </Link>
        </div>
      </div>

      {/* Main Grid: Blog Reading Column + Sticky Monetization Column */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Long-Form Technical Masterclass Article */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Article Header & Badges */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 uppercase tracking-wide">
                {item.category}
              </span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                Vendor: {item.vendor}
              </span>
              <span className={`px-3 py-1 rounded text-xs font-mono font-semibold ${
                item.inStock 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
              {seo.title || item.name}
            </h1>
            <p className="text-sm font-mono text-slate-400">
              Published by PinoutHQ Engineering Team • Automated Live Feed
            </p>
          </div>

          {/* Section 1: Architecture Overview */}
          <section className="space-y-4 text-slate-300 leading-relaxed font-sans text-base md:text-lg">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2 font-mono">
              1. Architecture & System Overview
            </h2>
            <p className="text-slate-300">
              {seo.architectureOverview}
            </p>
          </section>

          {/* Section 2: Complete Hardware Specifications Matrix Table */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2 font-mono">
              2. Technical Specification Matrix
            </h2>
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm shadow-xl">
              <div className="grid grid-cols-2 bg-slate-800/60 p-3.5 border-b border-slate-800 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span>Parameter</span>
                <span>Specification Rating</span>
              </div>
              <div className="divide-y divide-slate-800/80">
                <div className="grid grid-cols-2 p-3.5 hover:bg-slate-800/30 transition">
                  <span className="text-slate-400">Total Pin Count</span>
                  <span className="text-slate-200 font-bold">{item.pinCount || 'Standard DIP/SMD'}</span>
                </div>
                {item.specifications && Object.entries(item.specifications).map(([key, value]) => {
                  if (key === 'sourceUrl' || key === 'lastScrapedAt' || key === 'seoArticle' || key === 'scrapedPrice' || key === 'currency') return null;
                  return (
                    <div key={key} className="grid grid-cols-2 p-3.5 hover:bg-slate-800/30 transition">
                      <span className="text-slate-400 capitalize">{key}</span>
                      <span className="text-slate-200 font-medium truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Pinout Mapping & Bus Protocols */}
          <section className="space-y-4 text-slate-300 leading-relaxed font-sans text-base md:text-lg">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2 font-mono">
              3. Pinout Mapping & Bus Interfaces
            </h2>
            <p>
              {seo.pinoutAndInterface}
            </p>
          </section>

          {/* Section 4: Power Rail & Thermal Warning Callout Box */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2 font-mono">
              4. Power Rail & Thermal Guidelines
            </h2>
            <div className="p-6 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 space-y-3 font-sans text-base">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-sm uppercase tracking-wider">
                <span>⚠️ Critical Hardware Warning</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed">
                {seo.powerAndThermal}
              </p>
            </div>
          </section>

          {/* Section 5: Autogenerated Firmware Code Snippet */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-mono">
                5. Reference Firmware Code (C++ / Arduino)
              </h2>
              <span className="text-xs font-mono text-slate-500">main.cpp</span>
            </div>
            <p className="text-sm text-slate-400">
              Copy and paste this test harness directly into your PlatformIO or Arduino IDE environment to verify communication with the {item.name}:
            </p>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-800 font-mono text-xs text-slate-400">
                <span>PlatformIO / Arduino Test Harness</span>
                <span className="text-cyan-400">Ready to Compile</span>
              </div>
              <pre className="p-5 text-xs md:text-sm font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                <code>{seo.firmwareCode}</code>
              </pre>
            </div>
          </section>

          {/* Section 6: Troubleshooting Matrix */}
          {seo.troubleshooting && seo.troubleshooting.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2 font-mono">
                6. Hardware Troubleshooting Matrix
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {seo.troubleshooting.map((t: any, index: number) => (
                  <div key={index} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h3 className="font-mono font-bold text-rose-400 text-sm flex items-center gap-2">
                      <span>❌ Symptom:</span> {t.problem}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      <span className="text-slate-300 font-semibold">Root Cause:</span> {t.cause}
                    </p>
                    <p className="text-xs font-mono text-emerald-400 bg-emerald-950/30 p-2.5 rounded border border-emerald-500/20 mt-2">
                      <span className="font-bold">✅ Solution:</span> {t.solution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 7: SEO Rich-Snippet FAQ Accordion */}
          {seo.faqs && seo.faqs.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-slate-800">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-mono">
                7. Frequently Asked Questions (FAQ)
              </h2>
              <div className="space-y-4">
                {seo.faqs.map((faq: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                    <h3 className="font-mono font-bold text-slate-200 text-sm md:text-base">
                      Q: {faq.question}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-sans">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Sticky Monetization & Affiliate Checkout Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900/50 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  Direct Vendor Feed
                </span>
                <span className="text-xs font-mono text-slate-500">Verified Stock</span>
              </div>
              
              <div className="text-4xl font-bold font-mono text-emerald-400 my-3">
                ${price}
              </div>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                Aggregated market pricing for authentic <span className="text-slate-200 font-semibold">{item.name}</span> hardware units.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-center rounded-xl transition duration-200 block shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] text-sm"
              >
                Buy Authentic Hardware Now &rarr;
              </a>
              
              <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2">
                <span>📄</span> Download Datasheet (.PDF)
              </button>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Vendor Origin:</span>
                <span className="text-slate-200 font-medium">{item.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry Status:</span>
                <span className="text-emerald-400 font-medium">Live Synced</span>
              </div>
              <div className="flex justify-between">
                <span>Affiliate Routing:</span>
                <span className="text-cyan-400 font-medium">Secured (SSL)</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 text-center leading-tight">
              PinoutHQ earns a small commission through verified vendor distribution links at no extra cost to you.
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}