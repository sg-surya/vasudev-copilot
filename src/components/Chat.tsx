import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message } from '../types';
import { Mic, ArrowUp, Copy, RotateCcw, ThumbsUp, ThumbsDown, Share, PanelLeftOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  chat: ChatSession;
  onSendMessage: (msg: string) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSettings?: () => void;
}

export default function Chat({ chat, onSendMessage, toggleSidebar, isSidebarOpen, onOpenSettings }: ChatProps) {
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
    <div className="flex flex-col h-full w-full relative glass-panel rounded-3xl text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 glass-panel border-b border-border">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-md transition-all">
              <PanelLeftOpen size={20} />
            </button>
          )}
          <select className="text-sm font-medium px-3 py-1.5 rounded-lg outline-none border-none cursor-pointer bg-transparent hover:bg-muted text-foreground">
            <option>Vasudev 1.0</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors glass-panel shadow-sm flex items-center gap-2 px-3">
            <Share size={16} />
            <span className="text-xs font-medium">Export</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
          {chat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
              <p>Send a message to start the conversation.</p>
            </div>
          ) : (
            chat.messages.map((msg, index) => (
              <div key={`${msg.id}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-primary text-xs font-bold mr-4 shrink-0 mt-1 shadow-sm">
                    V
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-muted text-foreground rounded-3xl rounded-tr-sm px-6 py-4 shadow-sm' : 'glass-panel text-foreground rounded-3xl rounded-tl-sm px-6 py-4 shadow-sm'}`}>
                  <div className={`prose max-w-none text-[15px] leading-relaxed dark:prose-invert ${msg.role === 'user' ? 'text-foreground' : 'text-foreground'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                  
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border text-muted-foreground">
                      <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Copy">
                        <Copy size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Regenerate">
                        <RotateCcw size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Good response">
                        <ThumbsUp size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Bad response">
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
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="w-full rounded-2xl shadow-lg border border-border p-2 glass-panel transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anything..."
              className="w-full bg-transparent resize-none outline-none p-4 min-h-[60px] max-h-[200px] text-foreground placeholder:text-muted-foreground text-lg"
              rows={1}
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-border transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-border transition-colors">
                  <Mic size={16} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${input.trim() ? 'bg-foreground text-card hover:opacity-90' : 'bg-foreground/50 text-card'}`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className="text-[11px] font-medium text-muted-foreground">Vasudev can make mistakes. Check important info.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
