import React from 'react';
import { Search, Monitor, HelpCircle, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenSettings?: () => void;
}

export default function Sidebar({ chats, currentChatId, onSelectChat, onNewChat, isOpen, setIsOpen, onOpenSettings }: SidebarProps) {
  const folders = Array.from(new Set(chats.filter(c => c.folder).map(c => c.folder)));
  const historyChats = chats.filter(c => !c.folder);

  if (!isOpen) {
    return (
      <div className={`absolute top-4 left-4 z-50`}>
        <button onClick={() => setIsOpen(true)} className="p-2 rounded-md hover:bg-black/5 text-slate-500">
          <PanelLeftOpen size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] h-full flex flex-col bg-[#111111] text-white overflow-hidden transition-all duration-300">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          Vasudev Copilot
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-[#1A1A1A] text-slate-400">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="px-3 pb-4 space-y-2">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1A1A1A] transition-all text-sm font-medium border border-[#222222] bg-[#1A1A1A]"
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            New chat
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-[#222222] px-1.5 py-0.5 rounded">
            <span>⌘</span><span>N</span>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300">
          <Search size={18} />
          Search chat
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300">
          <Monitor size={18} />
          Community
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
        <div className="px-3 mt-4 mb-2">
          <span className="text-xs font-semibold text-slate-500">Recent</span>
        </div>
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300 truncate">
            Quick access to your lates...
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300 truncate">
            Pick up right where you le...
          </button>
        </div>
      </div>

      <div className="p-4 mt-auto">
        

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300">
            <HelpCircle size={18} />
            Help Center
          </button>
          <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1A1A1A] text-slate-300">
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
