"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

interface ArticleRendererProps {
  markdownContent?: string;
}

export default function ArticleRenderer({ markdownContent = '' }: ArticleRendererProps) {
  return (
    <article className="prose prose-invert max-w-none prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-100 prose-blockquote:border-l-amber-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }: any) => (
            <h1 className="text-4xl md:text-6xl font-extrabold font-mono text-slate-100 mt-12 mb-6 tracking-tight border-b border-slate-800 pb-5 leading-tight" {...props} />
          ),
          h2: ({ node, ...props }: any) => (
            <h2 className="text-2xl md:text-4xl font-bold font-mono text-amber-400 mt-14 mb-6 border-b border-slate-800/80 pb-3 leading-snug" {...props} />
          ),
          h3: ({ node, ...props }: any) => (
            <h3 className="text-xl md:text-2xl font-bold font-mono text-cyan-400 mt-10 mb-4 leading-normal" {...props} />
          ),
          h4: ({ node, ...props }: any) => (
            <h4 className="text-lg md:text-xl font-bold font-mono text-slate-200 mt-8 mb-3" {...props} />
          ),
          p: ({ node, ...props }: any) => (
            <p className="text-base md:text-lg text-slate-300 leading-relaxed my-5 font-sans" {...props} />
          ),
          ul: ({ node, ...props }: any) => (
            <ul className="list-disc list-inside space-y-2.5 text-slate-300 my-5 pl-2 font-sans text-base md:text-lg" {...props} />
          ),
          ol: ({ node, ...props }: any) => (
            <ol className="list-decimal list-inside space-y-2.5 text-slate-300 my-5 pl-2 font-sans text-base md:text-lg" {...props} />
          ),
          code(props: any) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            
            if (match || codeText.includes('\n')) {
              return <CodeBlock code={codeText} language={match ? match[1] : 'cpp'} />;
            }
            
            return (
              <code className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono text-sm border border-slate-700/60 font-semibold" {...rest}>
                {children}
              </code>
            );
          },
          table({ children }: any) {
            return (
              <div className="my-10 overflow-x-auto rounded-xl border border-slate-700 shadow-2xl bg-slate-900/90">
                <table className="w-full text-left border-collapse font-mono text-sm">{children}</table>
              </div>
            );
          },
          th({ children }: any) {
            return <th className="bg-slate-800 p-4 text-sm font-bold text-cyan-400 border-b border-slate-700 tracking-wider uppercase">{children}</th>;
          },
          td({ children }: any) {
            return <td className="p-4 text-sm text-slate-300 border-b border-slate-800/80 font-medium">{children}</td>;
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </article>
  );
}