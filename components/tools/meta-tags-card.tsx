'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MetaTagsResult } from '@/lib/tools';
import { 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle,
  Code2
} from 'lucide-react';

interface MetaTagsCardProps {
  data: MetaTagsResult;
}

export function MetaTagsCard({ data }: MetaTagsCardProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-purple-900/40 p-5 shadow-2xl backdrop-blur-xl space-y-5 text-slate-100 overflow-hidden relative">
      {/* Top Bar: URL & Scores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/30 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-md">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white truncate">{data.siteName}</span>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline"
              >
                <span className="truncate max-w-[200px]">{data.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
            <p className="text-xs text-slate-400">Scraped & Inspected Meta Tags</p>
          </div>
        </div>

        {/* Dual Metric Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span>SEO Score:</span>
            <span className="font-bold font-mono text-sm">{data.seoScore}/100</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span>Performance:</span>
            <span className="font-bold font-mono text-sm">{data.performanceScore}/100</span>
          </div>
        </div>
      </div>

      {/* Social Card Preview (Open Graph Mockup) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          Social Share Card Preview (Open Graph)
        </h4>

        <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-xl max-w-lg transition-all hover:border-purple-800/60">
          {data.ogImage && (
            <div className="h-40 w-full overflow-hidden relative bg-slate-900">
              {/* eslint-disable-next-html-next-image */}
              <img
                src={data.ogImage}
                alt="Open Graph Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-mono uppercase">
                og:image
              </div>
            </div>
          )}
          <div className="p-3.5 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">{new URL(data.url).hostname}</span>
            <h5 className="font-bold text-sm text-slate-100 line-clamp-1">{data.title}</h5>
            <p className="text-xs text-slate-400 line-clamp-2">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Security Headers Checklist */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          HTTP Security Headers Audit
        </h4>

        <div className="rounded-xl bg-purple-950/20 border border-purple-900/30 divide-y divide-purple-900/30 overflow-hidden">
          {data.securityHeaders.map((header, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {header.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-slate-200 block">{header.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate block max-w-md">{header.details}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                header.status === 'pass' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {header.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Key-Value Meta Tags Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            Raw Meta Tags ({Object.keys(data.metaTags).length})
          </h4>

          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
          >
            <span>{showAllTags ? 'Collapse' : 'Expand All'}</span>
            {showAllTags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <motion.div
          animate={{ height: showAllTags ? 'auto' : '100px' }}
          className="rounded-xl bg-purple-950/40 border border-purple-900/40 p-3 overflow-hidden font-mono text-xs text-purple-200 space-y-1.5 relative"
        >
          {Object.entries(data.metaTags).map(([key, val], idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-indigo-400 font-semibold min-w-[130px] flex-shrink-0">&lt;meta name=&quot;{key}&quot;&gt;</span>
              <span className="text-slate-300 truncate">&quot;{val}&quot;</span>
            </div>
          ))}

          {!showAllTags && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0818] to-transparent pointer-events-none" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
