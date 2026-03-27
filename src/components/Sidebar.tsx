import React, { useState } from 'react';
import { Search, HelpCircle, Settings, LogOut, PanelLeftClose, X } from 'lucide-react';
import { ChatSession } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredChats = chats.filter(chat => 
    (chat.title || 'Untitled Chat').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`h-full flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'w-[280px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full pointer-events-none'
      }`}
    >
      <div className="p-4 flex items-center justify-between min-w-[280px]">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
            <div className="w-2 h-2 bg-current rounded-full"></div>
          </div>
          Vasudev Copilot
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="px-3 pb-4 space-y-2 min-w-[280px]">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted transition-all text-sm font-medium border border-border/30 bg-muted/30 shadow-sm active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            New chat
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            <span>⌘</span><span>N</span>
          </div>
        </button>

        <div className="relative group">
          {isSearching ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border"
            >
              <Search size={16} className="text-muted-foreground" />
              <input 
                autoFocus
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
              />
              <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <button 
              onClick={() => setIsSearching(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground"
            >
              <Search size={18} />
              Search chat
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar min-w-[280px]">
        <div className="px-3 mt-4 mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-50">
            {searchQuery ? 'Search Results' : 'Recent'}
          </span>
        </div>
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredChats.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2 text-xs text-muted-foreground italic"
              >
                {searchQuery ? 'No matches found' : 'No recent chats'}
              </motion.div>
            ) : (
              filteredChats.map((chat, index) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all truncate group relative ${
                    currentChatId === chat.id
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {chat.title || 'Untitled Chat'}
                  {currentChatId === chat.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" 
                    />
                  )}
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 mt-auto min-w-[280px]">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground">
            <HelpCircle size={18} />
            Help Center
          </button>
          <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground">
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
