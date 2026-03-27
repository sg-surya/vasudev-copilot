import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Chat from './components/Chat';
import SettingsModal from './components/SettingsModal';
import { ChatSession, Message } from './types';
import { GoogleGenAI } from '@google/genai';
import { AnimatePresence, motion } from 'motion/react';

const initialChats: ChatSession[] = [];

export default function App() {
  const [chats, setChats] = React.useState<ChatSession[]>(() => {
    const stored = localStorage.getItem('vasudev_chats');
    return stored ? JSON.parse(stored) : initialChats;
  });
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Persistence
  React.useEffect(() => {
    localStorage.setItem('vasudev_chats', JSON.stringify(chats));
  }, [chats]);

  React.useEffect(() => {
    // Load theme
    const appearance = localStorage.getItem('app_appearance') || 'system';
    if (appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (appearance === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Load accent color
    const accentColor = localStorage.getItem('app_accent') || 'green';
    const root = document.documentElement;
    if (accentColor === 'green') {
      root.style.setProperty('--accent', '#D4FF00');
    } else {
      root.style.setProperty('--accent', '#3b82f6');
    }

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentChat = useMemo(() => chats.find(c => c.id === currentChatId), [chats, currentChatId]);

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const handleSendMessage = async (content: string, image?: string) => {
    let chatId = currentChatId;
    let updatedChats = [...chats];

    if (!chatId) {
      // Create new chat
      chatId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newChat: ChatSession = {
        id: chatId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        date: 'Just now',
        messages: [],
      };
      updatedChats = [newChat, ...updatedChats];
      setCurrentChatId(chatId);
    }

    const chatIndex = updatedChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    const userMessage: Message = { id: `msg-user-${Date.now()}`, role: 'user', content, image };
    updatedChats[chatIndex].messages.push(userMessage);
    
    // Add placeholder AI message for streaming
    const aiMessageId = `msg-ai-${Date.now()}`;
    const aiMessage: Message = { id: aiMessageId, role: 'ai', content: '' };
    updatedChats[chatIndex].messages.push(aiMessage);
    
    setChats([...updatedChats]);

    // Call Gemini API with streaming
    try {
      const storedKey = localStorage.getItem('gemini_api_key');
      const storedModel = localStorage.getItem('selected_ai_model');
      const apiKey = storedKey || process.env.GEMINI_API_KEY || '';
      
      const validModels = ['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite-preview'];
      const model = (storedModel && validModels.includes(storedModel)) ? storedModel : 'gemini-3-flash-preview';
      
      const ai = new GoogleGenAI({ apiKey });
      
      const history = updatedChats[chatIndex].messages.slice(0, -2).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [
          ...(msg.image ? [{ inlineData: { data: msg.image.split(',')[1], mimeType: 'image/png' } }] : []),
          { text: msg.content }
        ]
      }));

      const contents = [
        ...history,
        { 
          role: 'user', 
          parts: [
            ...(image ? [{ inlineData: { data: image.split(',')[1], mimeType: 'image/png' } }] : []),
            { text: content }
          ] 
        }
      ];

      const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: contents as any,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        setChats(prevChats => {
          const updated = [...prevChats];
          const idx = updated.findIndex(c => c.id === chatId);
          if (idx !== -1) {
            const msgIdx = updated[idx].messages.findIndex(m => m.id === aiMessageId);
            if (msgIdx !== -1) {
              updated[idx].messages[msgIdx].content = fullText;
            }
          }
          return updated;
        });
      }

    } catch (error) {
      console.error("Error calling Gemini:", error);
      const errorMessage = 'Sorry, I encountered an error processing your request.';
      setChats(prevChats => {
        const updated = [...prevChats];
        const idx = updated.findIndex(c => c.id === chatId);
        if (idx !== -1) {
          const msgIdx = updated[idx].messages.findIndex(m => m.id === aiMessageId);
          if (msgIdx !== -1) {
            updated[idx].messages[msgIdx].content = errorMessage;
          }
        }
        return updated;
      });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Main Layout */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar 
          chats={chats} 
          currentChatId={currentChatId} 
          onSelectChat={handleSelectChat} 
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        
        <main className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <AnimatePresence mode="wait">
            {currentChatId ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <Chat 
                  chat={currentChat!} 
                  onSendMessage={handleSendMessage} 
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  isSidebarOpen={isSidebarOpen}
                />
              </motion.div>
            ) : (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <Home 
                  chats={chats} 
                  onSendMessage={handleSendMessage} 
                  onSelectChat={handleSelectChat}
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  isSidebarOpen={isSidebarOpen}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
}
