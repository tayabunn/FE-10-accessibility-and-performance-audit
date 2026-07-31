'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by React ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyDetails = () => {
    const errorDetails = `[Astrine AI Error Diagnostics]
Error: ${this.state.error?.message || 'Unknown Error'}
Stack: ${this.state.error?.stack || 'No stack trace available'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack available'}
Timestamp: ${new Date().toISOString()}
UserAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'}`;

    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-[#06050c] flex items-center justify-center p-4 text-slate-100 font-sans">
          <div className="w-full max-w-2xl bg-purple-950/40 border border-purple-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono text-rose-400 uppercase tracking-widest block">
                  Application Exception
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Something went wrong in the component tree
                </h1>
              </div>
            </div>

            {/* Error Summary Box */}
            <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-700/40 text-rose-200 text-sm font-mono break-all">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </div>

            {/* Diagnostic Action Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800/60 text-xs font-medium text-purple-300 transition-colors border border-purple-700/40"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{this.state.showDetails ? 'Hide Stack Trace' : 'View Stack Trace'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={this.handleCopyDetails}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 text-xs font-medium text-purple-200 transition-colors border border-purple-700/50"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Diagnostics</span>
                    </>
                  )}
                </button>

                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload App</span>
                </button>
              </div>
            </div>

            {/* Expandable Stack Trace */}
            {this.state.showDetails && (
              <div className="mt-4 p-4 rounded-xl bg-black/60 border border-purple-900/80 max-h-60 overflow-y-auto font-mono text-xs text-purple-300/80 space-y-2 leading-relaxed">
                <div>
                  <span className="text-rose-400 font-bold">Error Stack:</span>
                  <pre className="mt-1 whitespace-pre-wrap text-[11px] text-slate-300">
                    {this.state.error?.stack || 'No stack trace available.'}
                  </pre>
                </div>
                {this.state.errorInfo?.componentStack && (
                  <div className="pt-2 border-t border-purple-900/40">
                    <span className="text-purple-400 font-bold">Component Stack:</span>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] text-purple-300/70">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
