"use client";

import React, { useState } from 'react';
import { Cpu, Radio, Zap, Activity, Layers } from 'lucide-react';

interface PinDefinition {
  number: number;
  name: string;
  type: 'POWER' | 'I2C' | 'SPI' | 'UART' | 'ANALOG' | 'GPIO';
  description: string;
}

interface PinoutDiagramProps {
  moduleName?: string;
  pinCount?: number;
}

export default function PinoutDiagram({ moduleName = "ESP32-S3 Module", pinCount = 14 }: PinoutDiagramProps) {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedPin, setSelectedPin] = useState<PinDefinition | null>(null);

  // Standardized pin mappings for modern IoT edge hardware
  const defaultPins: PinDefinition[] = [
    { number: 1, name: '3V3', type: 'POWER', description: '3.3V Regulated Power Output (Max 600mA draw)' },
    { number: 2, name: 'GND', type: 'POWER', description: 'Common Ground reference for all electrical circuits' },
    { number: 3, name: 'A0 / GPIO 1', type: 'ANALOG', description: '12-bit ADC Channel 0 with touch capacitive sensing' },
    { number: 4, name: 'A1 / GPIO 2', type: 'ANALOG', description: '12-bit ADC Channel 1 with internal strapping resistor' },
    { number: 5, name: 'SDA / GPIO 3', type: 'I2C', description: 'I2C Serial Data line level shifted to 3.3V logic' },
    { number: 6, name: 'SCL / GPIO 4', type: 'I2C', description: 'I2C Serial Clock line level shifted to 3.3V logic' },
    { number: 7, name: 'TX / GPIO 5', type: 'UART', description: 'Hardware Serial Transmit line for asynchronous data' },
    { number: 8, name: 'RX / GPIO 6', type: 'UART', description: 'Hardware Serial Receive line for asynchronous data' },
    { number: 9, name: 'SCK / GPIO 7', type: 'SPI', description: 'High speed SPI Bus Clock line for external displays' },
    { number: 10, name: 'MISO / GPIO 8', type: 'SPI', description: 'Master In Slave Out data line for high speed bus' },
    { number: 11, name: 'MOSI / GPIO 9', type: 'SPI', description: 'Master Out Slave In data line for high speed bus' },
    { number: 12, name: 'GPIO 10', type: 'GPIO', description: 'General purpose input output pin with PWM support' },
    { number: 13, name: '5V IN', type: 'POWER', description: '5V DC Power Input direct from USB or external battery' },
    { number: 14, name: 'RST', type: 'POWER', description: 'Hardware Reset pin (Pull low to reboot silicon)' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'POWER': return 'bg-rose-500 text-slate-950 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
      case 'I2C': return 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]';
      case 'SPI': return 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]';
      case 'UART': return 'bg-purple-400 text-slate-950 border-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.4)]';
      case 'ANALOG': return 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]';
      default: return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'POWER': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'I2C': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'SPI': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'UART': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ANALOG': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filteredPins = activeFilter === 'ALL' 
    ? defaultPins 
    : defaultPins.filter(pin => pin.type === activeFilter);

  return (
    <div className="my-12 p-6 md:p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-8 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Cpu className="w-4 h-4" />
            <span>Interactive Telemetry Layer</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 font-mono">
            {moduleName} Pinout Multiplexer
          </h3>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'POWER', 'I2C', 'SPI', 'UART', 'ANALOG'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 border ${
                activeFilter === filter
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Microchip Board Layout */}
      <div className="relative py-10 px-4 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center overflow-x-auto">
        <div className="w-full max-w-2xl bg-slate-950 border-2 border-slate-700 rounded-2xl p-6 shadow-inner relative flex items-center justify-between gap-8 my-4">
          
          {/* Left Castellated Edge Pins */}
          <div className="flex flex-col gap-3 z-10">
            {defaultPins.slice(0, 7).map((pin) => {
              const isHighlighted = activeFilter === 'ALL' || pin.type === activeFilter;
              return (
                <button
                  key={pin.number}
                  onClick={() => setSelectedPin(pin)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-md border font-bold text-xs transition-all duration-200 ${
                    isHighlighted ? getTypeColor(pin.type) : 'bg-slate-900 text-slate-600 border-slate-800 opacity-40'
                  } hover:scale-105`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-slate-200 flex items-center justify-center text-[10px] border border-slate-700">
                    {pin.number}
                  </span>
                  <span>{pin.name}</span>
                </button>
              );
            })}
          </div>

          {/* Central Silicon Branding */}
          <div className="text-center space-y-2 py-8 px-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl">
            <Radio className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
            <div className="text-sm font-bold text-slate-200 uppercase tracking-widest">{moduleName}</div>
            <div className="text-[10px] text-slate-500">32-Bit Dual Core Architecture</div>
            <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold">
              Logic 3.3V
            </div>
          </div>

          {/* Right Castellated Edge Pins */}
          <div className="flex flex-col gap-3 z-10">
            {defaultPins.slice(7, 14).map((pin) => {
              const isHighlighted = activeFilter === 'ALL' || pin.type === activeFilter;
              return (
                <button
                  key={pin.number}
                  onClick={() => setSelectedPin(pin)}
                  className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-md border font-bold text-xs transition-all duration-200 ${
                    isHighlighted ? getTypeColor(pin.type) : 'bg-slate-900 text-slate-600 border-slate-800 opacity-40'
                  } hover:scale-105`}
                >
                  <span>{pin.name}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-slate-200 flex items-center justify-center text-[10px] border border-slate-700">
                    {pin.number}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
        <div className="text-[11px] text-slate-500 mt-2">Click any pin above to inspect electrical limits and routing notes</div>
      </div>

      {/* Interactive Pin Details Panel */}
      {selectedPin ? (
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_25px_rgba(0,229,255,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">Pin #{selectedPin.number}: {selectedPin.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeColor(selectedPin.type)}`}>
                {selectedPin.type} Bus
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans">{selectedPin.description}</p>
          </div>
          <button
            onClick={() => setSelectedPin(null)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition whitespace-nowrap"
          >
            Clear Selection
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400">
          Select any physical pin on the interactive board above to display real-time electrical specs and routing warnings.
        </div>
      )}
    </div>
  );
}