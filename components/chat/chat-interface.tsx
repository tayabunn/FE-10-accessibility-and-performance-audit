'use client';

import React, { useState } from 'react';
import { useChatStream } from '@/hooks/use-chat-stream';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Sidebar } from './sidebar';
import { AI_PERSONAS, AI_MODELS, AIPersona, AIModelConfig } from '@/lib/ai-config';
import { PanelLeft, RefreshCw, Sparkles } from 'lucide-react';

export function ChatInterface() {
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [selectedModel, setSelectedModel] = useState<AIModelConfig>(AI_MODELS[0]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const {
    messages,
    status,
    sendMessage,
    stop,
    regenerate,
    clearMessages,
    handleConfirmAction,
    handleRetryTool,
  } = useChatStream({
    personaId: selectedPersona.id,
    modelId: selectedModel.id,
  });

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt, selectedPersona.id, selectedModel.id);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#06050c] text-slate-100 font-sans">
      {/* Radial Purple Glow Background Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-gradient-to-t from-violet-600/15 via-purple-900/10 to-transparent blur-[100px] pointer-events-none z-0" />

      {/* Sidebar Drawer */}
      <Sidebar
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onClearHistory={clearMessages}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-14 md:h-16 px-4 md:px-6 border-b border-purple-900/30 bg-[#080614]/80 backdrop-blur-xl flex items-center justify-between z-20 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 hover:text-white transition-all border border-purple-800/40 shadow-sm"
              title="Toggle sidebar settings"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-base shadow-lg shadow-purple-500/20">
                {selectedPersona.avatar}
              </div>
              <div>
                <h2 className="font-bold text-sm md:text-base text-slate-100 flex items-center gap-2">
                  <span>{selectedPersona.name}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono shadow-sm">
                    {selectedModel.name}
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {status !== 'idle' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-mono shadow-md shadow-purple-950/50">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="capitalize">{status}...</span>
              </div>
            )}

            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-2 rounded-xl bg-purple-950/40 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-300 transition-all border border-purple-800/40 hover:border-rose-800/50"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Messages Feed Viewport */}
        <MessageList
          messages={messages}
          persona={selectedPersona}
          status={status}
          onRegenerate={regenerate}
          onSelectPrompt={handleSelectPrompt}
          onConfirmAction={handleConfirmAction}
          onRetryTool={handleRetryTool}
        />

        {/* Multiline Input & Quick Action Chips */}
        <ChatInput
          onSend={(msg) => sendMessage(msg, selectedPersona.id, selectedModel.id)}
          onStop={stop}
          status={status}
        />
      </div>
    </div>
  );
}
