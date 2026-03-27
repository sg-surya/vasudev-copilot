import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message } from '../types';
import { Mic, ArrowUp, Copy, RotateCcw, ThumbsUp, ThumbsDown, Share, PanelLeftOpen, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  chat: ChatSession;
  onSendMessage: (msg: string) => void;
  toggleSidebar: () => void;
  onOpenSettings?: () => void;
}

export default function Chat({ chat, onSendMessage, toggleSidebar, onOpenSettings }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-[#F9F9F9] text-[#111111]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-[#F9F9F9]">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md">
            <PanelLeftOpen size={20} />
          </button>
          <select className="text-sm font-medium px-3 py-1.5 rounded-lg outline-none border-none cursor-pointer bg-transparent hover:bg-black/5 text-slate-800">
            <option>EchoAI 1.0</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-black/5 text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Share size={16} />
          </button>
          <button className="p-2 rounded-md hover:bg-black/5 text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <MoreVertical size={16} />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 ml-2 overflow-hidden border border-slate-200">
            <img src="https://picsum.photos/seed/olivia/100/100" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
          {chat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
              <p>Send a message to start the conversation.</p>
            </div>
          ) : (
            chat.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#D4FF00] text-xs font-bold mr-4 shrink-0 mt-1 shadow-sm">
                    E
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#F0F0F0] text-black rounded-3xl rounded-tr-sm px-6 py-4 shadow-sm' : 'bg-white text-black rounded-3xl rounded-tl-sm px-6 py-4 shadow-sm border border-slate-100'}`}>
                  <div className={`prose max-w-none text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-black prose-p:text-black prose-headings:text-black prose-strong:text-black' : 'text-black'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                  
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 text-slate-400">
                      <button className="p-1.5 hover:bg-black/5 rounded-md transition-colors" title="Copy">
                        <Copy size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-black/5 rounded-md transition-colors" title="Regenerate">
                        <RotateCcw size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-black/5 rounded-md transition-colors" title="Good response">
                        <ThumbsUp size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-black/5 rounded-md transition-colors" title="Bad response">
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9] to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="w-full rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-2 bg-white transition-all focus-within:ring-2 focus-within:ring-slate-200">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anything..."
              className="w-full bg-transparent resize-none outline-none p-4 min-h-[60px] max-h-[200px] text-slate-900 placeholder:text-slate-400 text-lg"
              rows={1}
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F5F5F5] text-slate-600 hover:bg-[#EBEBEB] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F5F5F5] text-slate-600 hover:bg-[#EBEBEB] transition-colors">
                  <Mic size={16} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${input.trim() ? 'bg-black text-white hover:bg-slate-800' : 'bg-black text-white'}`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className="text-[11px] font-medium text-slate-400">EchoAI can make mistakes. Check important info.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
