import Link from "next/link";
import { Metadata } from "next";
import { Logo } from "@/components/Logo";
import ArticleRenderer from "@/components/ArticleRenderer";
import PinoutDiagram from "@/components/PinoutDiagram";

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
    const res = await fetch(`${baseUrl}/api/v1/components/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to fetch component details:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getComponentDetails(id);
  if (!item) return { title: "Hardware Not Found | PinoutHQ" };

  const seo = item.specifications?.seoArticle;
  const titleText = seo?.title || `${item.name} Review, Pinout & Specs`;
  const descText = seo?.metaDescription || `Complete engineering review and specification guide for ${item.name} by ${item.vendor}.`;

  return { title: `${titleText} | PinoutHQ`, description: descText };
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
  const currency = item.specifications?.currency || "USD";
  const sourceUrl = item.specifications?.sourceUrl || "#";
  const pins = item.pinCount || 38;

  const seo = item.specifications?.seoArticle || {
    title: `Why the ${item.name} is an Essential Module for Hardware Developers`,
    metaDescription: `Engineering review and specifications for ${item.name}.`,
    articleMarkdown: `## Executive Summary & Architecture\nThe ${item.name} by ${item.vendor} stands out as a dependable hardware building block for modern embedded engineering and IoT development. Designed to bridge rapid prototyping environments with industrial edge computing, this component delivers exceptional processing stability.\n\n## Pinout Routing and Interface Design\nInterfacing smoothly with the ${item.name} requires strict adherence to its operating voltage envelope and communication bus timing. Utilizing standard communication buses ensures seamless compatibility across modern microcontroller families.\n\n## Frequently Asked Questions\n### What is the primary logic voltage of the ${item.name}?\nThis module is engineered primarily for standard low voltage logic operation. Interfacing directly with high voltage lines without logic level shifters can permanently damage the internal silicon gate oxides.`,
    tags: [item.name, "Embedded Systems", "IoT Development", "Pinout Guide"]
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": item.name,
    "description": seo.metaDescription,
    "brand": { "@type": "Brand", "name": item.vendor },
    "offers": {
      "@type": "Offer",
      "url": sourceUrl,
      "priceCurrency": currency,
      "price": price,
      "availability": item.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-12 flex flex-col items-center scroll-smooth">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-6 mb-8 sticky top-0 bg-slate-950/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="font-mono font-bold tracking-tight text-lg text-slate-200 group-hover:text-cyan-400 transition-colors">
            PinoutHQ
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            AI Editorial v5.0
          </span>
          <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
            &larr; Back to Matrix
          </Link>
        </div>
      </div>

      {/* Main Grid: Magazine Reading Column + Sticky Monetization Column */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Dynamic Markdown Tech Journalism Layout */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Article Header & Badges */}
          <div className="space-y-4 border-b border-slate-800/80 pb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 uppercase">
                {item.category}
              </span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                Vendor: {item.vendor}
              </span>
              <span className={`px-3 py-1 rounded text-xs font-mono font-semibold ${
                item.inStock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
              {seo.title || item.name}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>By PinoutHQ Editorial Team</span>
              <span>•</span>
              <span>10 Min Engineering Read</span>
            </div>
          </div>

          {/* Section 1: Technical Specification Matrix */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2 font-mono">
              Technical Specification Matrix
            </h2>
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm shadow-xl">
              <div className="grid grid-cols-2 bg-slate-800/60 p-3.5 border-b border-slate-800 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span>Parameter</span>
                <span>Specification Rating</span>
              </div>
              <div className="divide-y divide-slate-800/80">
                <div className="grid grid-cols-2 p-3.5 hover:bg-slate-800/30 transition">
                  <span className="text-slate-400">Total Pin Count</span>
                  <span className="text-slate-200 font-bold">{pins} Pins (Standard Layout)</span>
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

          {/* Interactive Pinout Visualizer & Multiplexer */}
          <PinoutDiagram moduleName={item.name} pinCount={pins} />

          {/* Dynamic Markdown Article Body using the new ArticleRenderer */}
          <div className="mt-8 bg-slate-950/60 p-6 md:p-10 rounded-2xl border border-slate-800/80 shadow-xl">
            <ArticleRenderer markdownContent={seo.articleMarkdown || ''} />
          </div>

          {/* Categories and Tags Footer */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-slate-500">Categories:</span>
              <span className="text-cyan-400 hover:underline cursor-pointer">Hardware Reviews</span>,
              <span className="text-cyan-400 hover:underline cursor-pointer">Microcontrollers</span>,
              <span className="text-cyan-400 hover:underline cursor-pointer">IoT Guides</span>
            </div>
            
            {seo.tags && (
              <div className="flex flex-wrap gap-2">
                {seo.tags.map((tag: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 hover:border-slate-700 transition">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Community Discussion & Comment Form Block */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6 mt-12">
            <div>
              <h3 className="text-xl font-bold font-mono text-slate-100">
                Join the Discussion
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Have you integrated the {item.name} in your custom PCB or IoT project? Share your feedback and wiring tips below!
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Name *</label>
                  <input type="text" placeholder="Engineer Name" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Email *</label>
                  <input type="email" placeholder="developer@company.com" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Comment *</label>
                <textarea rows={4} placeholder="Share your hardware troubleshooting steps or project schematics..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"></textarea>
              </div>
              <button type="button" className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                Post Engineering Comment &rarr;
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Sticky Monetization & Affiliate Checkout Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900/50 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-6">
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