import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { NasaAsset, SpacecraftComponent } from '../../types';
import { soundManager } from '../../utils/sound';

interface AiScienceAssistantProps {
  currentAsset: NasaAsset;
  selectedComponent: SpacecraftComponent | null;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiScienceAssistant: React.FC<AiScienceAssistantProps> = ({
  currentAsset,
  selectedComponent,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Greetings. I am the NASA Orbital Lab Science Specialist for the ${currentAsset.name} mission. Ask me about scientific instruments, orbital dynamics, thermal engineering, or mission history.`,
      timestamp: 'DSN T+00:01',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickQuestions: string[] = [
    `How does ${currentAsset.name} stay thermally stable in deep space?`,
    `What are the primary scientific discoveries of ${currentAsset.name}?`,
    `Why is the orbital path at ${currentAsset.destination.split('—')[0]} significant?`,
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    soundManager.playClick();
    setInput('');

    const userMsg: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          spacecraftContext: {
            name: currentAsset.name,
            mission: currentAsset.mission,
            destination: currentAsset.destination,
            scientificPurpose: currentAsset.scientificPurpose,
            selectedComponent: selectedComponent ? selectedComponent.name : undefined,
          },
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        role: 'assistant',
        text: data.answer || 'No telemetry response returned from science database.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      soundManager.playTelemetryPing();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Deep Space Network downlink delay. Please verify connection and try query again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="panel-ai-assistant" className="space-y-2.5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono-sci font-bold text-slate-200 tracking-wider">
            MISSION AI SCIENCE SPECIALIST
          </span>
        </div>
        <span className="text-[9px] font-mono-sci px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          GEMINI 3.8 FLASH
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-col gap-1">
        {quickQuestions.slice(0, 2).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-left text-[11px] font-mono-sci text-cyan-400/90 hover:text-cyan-200 bg-slate-900/60 hover:bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-all truncate"
          >
            → {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs font-mono-sci">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-cyan-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-2 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-100'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="text-[9px] text-slate-500 mb-0.5 flex justify-between gap-2">
                <span>{m.role === 'user' ? 'FLIGHT RESEARCHER' : 'SCIENCE AI'}</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>

            {m.role === 'user' && (
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3 h-3 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono-sci py-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Consulting NASA science repository...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-1.5"
      >
        <input
          type="text"
          id="input-ai-question"
          placeholder="Ask a scientific or engineering question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900/90 text-xs font-mono-sci text-slate-200 placeholder-slate-500 px-3 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          type="submit"
          id="btn-send-ai-question"
          disabled={loading || !input.trim()}
          className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono-sci disabled:opacity-40 transition-all flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
