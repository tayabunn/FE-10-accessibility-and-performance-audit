'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LeadScoreResult } from '@/lib/tools';
import { 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck,
  Target
} from 'lucide-react';

interface LeadScoreCardProps {
  data: LeadScoreResult;
  onExecuteAction?: (actionName: string, targetName: string) => void;
}

export function LeadScoreCard({ data, onExecuteAction }: LeadScoreCardProps) {
  const isHot = data.tier === 'Hot';
  const isWarm = data.tier === 'Warm';

  const scoreColor = isHot
    ? 'from-emerald-400 to-teal-500'
    : isWarm
    ? 'from-amber-400 to-orange-500'
    : 'from-blue-400 to-indigo-500';

  const badgeBg = isHot
    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
    : isWarm
    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
    : 'bg-blue-500/15 border-blue-500/40 text-blue-300';

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.leadScore / 100) * circumference;

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-purple-900/40 p-5 shadow-2xl backdrop-blur-xl space-y-5 text-slate-100 overflow-hidden relative">
      {/* Background Subtle Gradient Orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/30 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white tracking-wide">{data.companyName}</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold tracking-wide ${badgeBg}`}>
                {data.tier} Tier ({data.leadScore}/100)
              </span>
            </div>
            <p className="text-xs text-slate-400">{data.industry} • Est. Deal: <span className="text-purple-300 font-semibold">{data.dealEstimate}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Evaluated just now</span>
        </div>
      </div>

      {/* Main Grid: Gauge Ring & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
        {/* Lead Score Radial Ring */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-purple-950/30 border border-purple-900/40 shadow-inner">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-purple-950"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-purple-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white">{data.leadScore}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Lead Score</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{data.conversionProbability}% Conversion Probability</span>
            </div>
          </div>
        </div>

        {/* Fit Metrics Breakdown */}
        <div className="md:col-span-8 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Fit & Qualification Metrics
          </h4>

          {[
            { label: 'Budget & Willingness', value: data.metrics.budgetFit },
            { label: 'Tech Stack Compatibility', value: data.metrics.techStackFit },
            { label: 'Website Intent & Engagement', value: data.metrics.engagementRate },
            { label: 'Decision Maker Access', value: data.metrics.decisionMakerAccess },
          ].map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{m.label}</span>
                <span className="font-mono text-purple-300">{m.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-950/80 overflow-hidden border border-purple-900/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Conversion Forecast Chart (Stretch Goal) */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 text-purple-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Conversion Trajectory Forecast (4 Months)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Predicted Velocity</span>
        </div>

        {/* SVG Sparkline Chart */}
        <div className="h-24 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="15" x2="300" y2="15" stroke="#332a4d" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2="300" y2="45" stroke="#332a4d" strokeWidth="1" strokeDasharray="3 3" />

            {/* Area under curve */}
            <polygon
              points="0,70 0,45 100,30 200,18 300,10 300,70"
              fill="url(#chartGradient)"
            />

            {/* Line path */}
            <motion.path
              d="M 0 45 L 100 30 L 200 18 L 300 10"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />

            {/* Data Dots */}
            {[
              { x: 0, y: 45, val: '35%' },
              { x: 100, y: 30, val: '65%' },
              { x: 200, y: 18, val: '88%' },
              { x: 300, y: 10, val: '94%' },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="4" className="fill-purple-400 stroke-purple-950 stroke-2" />
                <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="#e9d5ff" fontSize="9" className="font-mono font-bold">
                  {pt.val}
                </text>
              </g>
            ))}
          </svg>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
            <span>M1 (Initial)</span>
            <span>M2 (POC)</span>
            <span>M3 (Security)</span>
            <span>M4 (Close)</span>
          </div>
        </div>
      </div>

      {/* Key Intent Signals & Risk Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs relative z-10">
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-2">
          <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Observed Buying Signals
          </h5>
          <ul className="space-y-1.5 text-slate-300">
            {data.keySignals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-2">
          <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Evaluation Risk Factors
          </h5>
          <ul className="space-y-1.5 text-slate-300">
            {data.riskFactors.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-700/50 flex items-center justify-between gap-3 relative z-10 shadow-lg">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Recommended Next Step</span>
          <p className="text-xs font-semibold text-white truncate">{data.recommendedNextAction}</p>
        </div>

        {onExecuteAction && (
          <button
            onClick={() => onExecuteAction('export_lead_report', data.companyName)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-md shadow-purple-900/50 active:scale-95"
          >
            <span>Export Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
