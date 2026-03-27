import React, { useState } from 'react';
import { Globe, Mic, ArrowUp, PanelLeftOpen, Share, BookOpen, Laptop } from 'lucide-react';
import { ChatSession } from '../types';

interface HomeProps {
  chats: ChatSession[];
  onSendMessage: (msg: string) => void;
  onSelectChat: (id: string) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Home({ chats, onSendMessage, onSelectChat, toggleSidebar, isSidebarOpen }: HomeProps) {
  const [input, setInput] = useState('');
  const recentChats = chats.slice(0, 3);

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
    <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto relative glass-panel rounded-3xl text-foreground">
      <div className="w-full flex justify-center gap-4 items-center mb-16 sticky top-0 z-10 bg-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-all bg-card border border-border shadow-sm">
              <PanelLeftOpen size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm">
            <Globe size={14} className="text-primary" />
            <span className="text-sm font-semibold tracking-tight">Vasudev 1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors bg-card border border-border shadow-sm flex items-center gap-2 px-3">
            <Share size={16} />
            <span className="text-xs font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center mt-4 mb-10 text-center">
        <h1 className="text-5xl font-semibold mb-3 tracking-tight text-foreground">Hello, Vasudev</h1>
        <h2 className="text-4xl font-medium text-muted-foreground/40 mb-4">Let's make your research easier.</h2>
        <p className="text-sm text-muted-foreground">Your personal AI assistant for documents, research, and knowledge.</p>
      </div>

      <div className="w-full max-w-3xl rounded-2xl shadow-lg border border-border p-2 mb-6 glass-panel transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Anything..."
          className="w-full bg-transparent resize-none outline-none p-4 min-h-[100px] max-h-[200px] text-foreground placeholder:text-muted-foreground text-lg"
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

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="glass-panel rounded-2xl p-5 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4 text-black">
            <BookOpen size={20} />
          </div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Legal Insights</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Explore the latest updates and key discussions on legal topics today.</p>
        </div>
        
        <div className="glass-panel rounded-2xl p-5 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4 text-black">
            <Laptop size={20} />
          </div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Global Justice</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Discover important trends and changes shaping international law.</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4 text-black">
            <Globe size={20} />
          </div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Modern Law & Technology</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Explore the latest updates and key discussions on legal topics today.</p>
        </div>
      </div>
    </div>
  );
}
