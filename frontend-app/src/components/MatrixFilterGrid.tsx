"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Cpu, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

interface ComponentItem {
  _id: string;
  name: string;
  category: string;
  vendor: string;
  pinCount?: number;
  inStock?: boolean;
}

interface MatrixFilterGridProps {
  initialComponents: ComponentItem[];
}

export default function MatrixFilterGrid({ initialComponents = [] }: MatrixFilterGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('ALL');
  const [stockOnly, setStockOnly] = useState(false);

  const vendors = useMemo(() => {
    const list = initialComponents.map(c => c.vendor).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, [initialComponents]);

  const filteredComponents = useMemo(() => {
    return initialComponents.filter(item => {
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVendor = selectedVendor === 'ALL' || item.vendor === selectedVendor;
      const matchesStock = !stockOnly || item.inStock;

      return matchesSearch && matchesVendor && matchesStock;
    });
  }, [initialComponents, searchQuery, selectedVendor, stockOnly]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 my-8 font-mono">
      
      {/* Search and Filter Control Bar */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Live Text Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by architecture, vendor, or module name (e.g. ESP32, Adafruit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner font-mono"
            />
          </div>

          {/* Stock Toggle Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>Verified In Stock Only</span>
          </label>
        </div>

        {/* Vendor Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-900 pb-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> Vendor:
          </span>
          {vendors.map(vendor => (
            <button
              key={vendor}
              onClick={() => setSelectedVendor(vendor)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition duration-200 border ${
                selectedVendor === vendor
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {vendor}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Results Counters */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span>Showing <strong className="text-cyan-400 font-bold">{filteredComponents.length}</strong> verified hardware modules</span>
        <span>Telemetry Matrix Live</span>
      </div>

      {/* Dynamic Grid Layout */}
      {filteredComponents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 space-y-3">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-base font-bold text-slate-300">No matching microcontrollers detected in the matrix</div>
          <div className="text-xs text-slate-500">Try loosening your vendor filters or clearing your text search query above.</div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedVendor('ALL'); setStockOnly(false); }}
            className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map(item => (
            <Link
              key={item._id}
              href={`/component/${item._id}`} // Adjust to /components/${item._id} if your route folder is plural!
              className="group p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    {item.vendor || 'Generic'}
                  </span>
                  {item.inStock ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition duration-200 leading-snug">
                  {item.name}
                </h3>
                <div className="text-xs text-slate-400 font-sans line-clamp-2">
                  Comprehensive engineering review, pinout routing table, and C++ PlatformIO test harness for rapid IoT edge prototyping.
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200 transition">
                <span>{item.pinCount || 38} Physical Pins</span>
                <span className="flex items-center gap-1 font-bold text-cyan-400 group-hover:translate-x-1 transition duration-200">
                  Inspect Matrix <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}