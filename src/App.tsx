import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Chat from './components/Chat';
import SettingsModal from './components/SettingsModal';
import { ChatSession, Message } from './types';
import { GoogleGenAI } from '@google/genai';

const initialChats: ChatSession[] = [];

export default function App() {
  const [chats, setChats] = React.useState<ChatSession[]>(initialChats);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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

    // Load Personalization
    const bgImage = localStorage.getItem('app_bg_image') || 'none';
    const blurIntensity = localStorage.getItem('app_blur_intensity') || '16';
    const glassOpacity = localStorage.getItem('app_glass_opacity') || '0.15';

    root.style.setProperty('--bg-image', bgImage === 'none' ? 'none' : `url(${bgImage})`);
    root.style.setProperty('--blur-intensity', `${blurIntensity}px`);
    root.style.setProperty('--glass-opacity', glassOpacity);
  }, []);

  const currentChat = useMemo(() => chats.find(c => c.id === currentChatId), [chats, currentChatId]);

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const handleSendMessage = async (content: string) => {
    let chatId = currentChatId;
    let newChats = [...chats];

    if (!chatId) {
      // Create new chat
      chatId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newChat: ChatSession = {
        id: chatId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        date: 'Just now',
        messages: [],
      };
      newChats = [newChat, ...newChats];
      setCurrentChatId(chatId);
    }

    const chatIndex = newChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    const userMessage: Message = { id: `msg-user-${Date.now()}`, role: 'user', content };
    newChats[chatIndex].messages.push(userMessage);
    setChats([...newChats]);

    // Call Gemini API
    try {
      const storedKey = localStorage.getItem('gemini_api_key');
      const storedModel = localStorage.getItem('selected_ai_model');
      const apiKey = storedKey || process.env.GEMINI_API_KEY || '';
      
      const validModels = ['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite-preview'];
      const model = (storedModel && validModels.includes(storedModel)) ? storedModel : 'gemini-3-flash-preview';
      
      const ai = new GoogleGenAI({ apiKey });
      
      const history = newChats[chatIndex].messages.slice(0, -1).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      history.push({ role: 'user', parts: [{ text: content }] });

      const response = await ai.models.generateContent({
        model: model,
        contents: history as any,
      });

      const aiMessage: Message = { id: `msg-ai-${Date.now()}`, role: 'ai', content: response.text || 'No response' };
      
      setChats(prevChats => {
        const updated = [...prevChats];
        const idx = updated.findIndex(c => c.id === chatId);
        if (idx !== -1) {
          updated[idx].messages.push(aiMessage);
        }
        return updated;
      });

    } catch (error) {
      console.error("Error calling Gemini:", error);
      const errorMessage: Message = { id: `msg-error-${Date.now()}`, role: 'ai', content: 'Sorry, I encountered an error processing your request.' };
      setChats(prevChats => {
        const updated = [...prevChats];
        const idx = updated.findIndex(c => c.id === chatId);
        if (idx !== -1) {
          updated[idx].messages.push(errorMessage);
        }
        return updated;
      });
    }
  };

  return (
    <div className="flex h-screen w-full p-2 overflow-hidden bg-transparent text-foreground">
      {/* Main Layout */}
      <div className="relative z-10 flex h-full w-full gap-2">
        <Sidebar 
          chats={chats} 
          currentChatId={currentChatId} 
          onSelectChat={handleSelectChat} 
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        
        <main className="flex-1 flex flex-col h-full rounded-3xl overflow-hidden">
          {currentChatId ? (
            <Chat 
              chat={currentChat!} 
              onSendMessage={handleSendMessage} 
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
          ) : (
            <Home 
              chats={chats} 
              onSendMessage={handleSendMessage} 
              onSelectChat={handleSelectChat}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
          )}
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
}
