import React, { useState } from 'react';
import { Globe, Mic, ArrowUp, PanelLeftOpen, Share, MoreVertical, BookOpen, Laptop } from 'lucide-react';
import { ChatSession } from '../types';

interface HomeProps {
  chats: ChatSession[];
  onSendMessage: (msg: string) => void;
  onSelectChat: (id: string) => void;
  toggleSidebar: () => void;
}

export default function Home({ chats, onSendMessage, onSelectChat, toggleSidebar }: HomeProps) {
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
    <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto relative bg-[#F9F9F9] text-[#111111]">
      <div className="w-full flex justify-between items-center mb-16">
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md">
            <PanelLeftOpen size={20} />
          </button>
          <select className="text-sm font-medium px-3 py-1.5 rounded-lg outline-none border-none cursor-pointer bg-transparent hover:bg-black/5 text-slate-800">
            <option>Vasudev 1.0</option>
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
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center mt-4 mb-10 text-center">
        <h1 className="text-5xl font-semibold mb-3 tracking-tight text-black">Hello, Vasudev</h1>
        <h2 className="text-4xl font-medium text-[#CCCCCC] mb-4">Let's make your research easier.</h2>
        <p className="text-sm text-[#888888]">Your personal AI assistant for documents, research, and knowledge.</p>
      </div>

      <div className="w-full max-w-3xl rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-2 mb-6 bg-white transition-all focus-within:ring-2 focus-within:ring-slate-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Anything..."
          className="w-full bg-transparent resize-none outline-none p-4 min-h-[100px] max-h-[200px] text-slate-900 placeholder:text-slate-400 text-lg"
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

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#D4FF00] flex items-center justify-center mb-4 text-black">
            <BookOpen size={20} />
          </div>
          <h3 className="font-semibold text-sm mb-2 text-black">Legal Insights</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Explore the latest updates and key discussions on legal topics today.</p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#D4FF00] flex items-center justify-center mb-4 text-black">
            <Laptop size={20} />
          </div>
          <h3 className="font-semibold text-sm mb-2 text-black">Global Justice</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Discover important trends and changes shaping international law.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#D4FF00] flex items-center justify-center mb-4 text-black">
            <Globe size={20} />
          </div>
          <h3 className="font-semibold text-sm mb-2 text-black">Modern Law & Technology</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Explore the latest updates and key discussions on legal topics today.</p>
        </div>
      </div>
    </div>
  );
}
