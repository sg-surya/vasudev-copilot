import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Chat from './components/Chat';
import SettingsModal from './components/SettingsModal';
import { ChatSession, Message } from './types';
import { GoogleGenAI } from '@google/genai';

const initialChats: ChatSession[] = [];

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>(initialChats);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      chatId = Date.now().toString();
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

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content };
    newChats[chatIndex].messages.push(userMessage);
    setChats([...newChats]);

    // Call Gemini API
    try {
      const storedKey = localStorage.getItem('gemini_api_key');
      const apiKey = storedKey || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      
      const history = newChats[chatIndex].messages.slice(0, -1).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      history.push({ role: 'user', parts: [{ text: content }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: history as any,
      });

      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response.text || 'No response' };
      
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
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: 'Sorry, I encountered an error processing your request.' };
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
    <div className="flex h-screen w-full p-2 overflow-hidden bg-[#111111] text-slate-900">
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
        
        <main className="flex-1 flex flex-col h-full rounded-3xl overflow-hidden bg-[#F9F9F9]">
          {currentChatId ? (
            <Chat 
              chat={currentChat!} 
              onSendMessage={handleSendMessage} 
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          ) : (
            <Home 
              chats={chats} 
              onSendMessage={handleSendMessage} 
              onSelectChat={handleSelectChat}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
