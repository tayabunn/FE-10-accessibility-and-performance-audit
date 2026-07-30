'use client';

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Repairs dangling unclosed markdown constructs during active streaming.
 * E.g., unclosed ``` code blocks, hanging asterisks **.
 */
function repairStreamingMarkdown(raw: string, isStreaming?: boolean): string {
  if (!isStreaming || !raw) return raw;

  let text = raw;

  // 1. Repair unclosed code fences ```
  const codeFenceMatches = text.match(/```/g);
  if (codeFenceMatches && codeFenceMatches.length % 2 !== 0) {
    text += '\n```';
  }

  // 2. Repair dangling unclosed bold ** syntax
  const boldMatches = text.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0 && text.endsWith('*')) {
    text += '*';
  }

  return text;
}

/**
 * Code Block component with Copy-to-Clipboard functionality.
 */
function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-cyan-300 border border-slate-700/60"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/90 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
        <span className="text-cyan-400 font-medium">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
}

export function StreamingMarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const safeContent = useMemo(
    () => repairStreamingMarkdown(content, isStreaming),
    [content, isStreaming]
  );

  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:font-bold prose-headings:text-slate-100 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-cyan-500 prose-blockquote:bg-cyan-950/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-hr:border-slate-800 text-slate-200 text-sm md:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            return (
              <CodeBlock inline={isInline} className={className} {...props}>
                {children}
              </CodeBlock>
            );
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-slate-800">
                <table className="w-full text-left text-sm border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="bg-slate-900/90 text-cyan-400 px-4 py-2 font-semibold border-b border-slate-800">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-4 py-2 border-b border-slate-800/50">{children}</td>;
          },
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}
