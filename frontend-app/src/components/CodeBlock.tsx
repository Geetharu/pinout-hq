"use client";

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'cpp' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard', err);
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs text-slate-300 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>{language.toUpperCase()} Test Harness</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors duration-150 font-sans"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}