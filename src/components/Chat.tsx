import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message } from '../types';
import { Mic, ArrowUp, Copy, RotateCcw, ThumbsUp, ThumbsDown, Share, PanelLeftOpen, Volume2, Image as ImageIcon, X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatProps {
  chat: ChatSession;
  onSendMessage: (msg: string, image?: string) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSettings?: () => void;
}

export default function Chat({ chat, onSendMessage, toggleSidebar, isSidebarOpen, onOpenSettings }: ChatProps) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSend = () => {
    if (input.trim() || image) {
      onSendMessage(input, image || undefined);
      setInput('');
      setImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportChat = () => {
    const content = chat.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title || 'chat'}.md`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-card text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-card border-b border-border">
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
          <button onClick={exportChat} className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors bg-card border border-border shadow-sm flex items-center gap-2 px-3">
            <Download size={16} />
            <span className="text-xs font-medium">Export</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10 pb-32">
          {chat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
              <p>Send a message to start the conversation.</p>
            </div>
          ) : (
            chat.messages.map((msg, index) => (
              <div key={`${msg.id}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-4'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-1 shadow-sm">
                    V
                  </div>
                )}
                <div className={`${msg.role === 'user' ? 'max-w-[80%] bg-muted text-foreground rounded-2xl px-5 py-3 shadow-sm' : 'flex-1 max-w-none'}`}>
                  {msg.image && (
                    <img src={msg.image} alt="User upload" className="max-w-sm rounded-xl mb-3 border border-border" referrerPolicy="no-referrer" />
                  )}
                  <div className={`prose max-w-none text-[16px] leading-relaxed dark:prose-invert ${msg.role === 'user' ? 'text-foreground' : 'text-foreground/90'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0 font-medium">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  
                  {msg.role === 'ai' && msg.content && (
                    <div className="flex items-center gap-3 mt-4 text-muted-foreground/60">
                      <button onClick={() => copyToClipboard(msg.content)} className="p-1 hover:text-foreground transition-colors" title="Copy">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => speak(msg.content)} className="p-1 hover:text-foreground transition-colors" title="Listen">
                        <Volume2 size={14} />
                      </button>
                      <button className="p-1 hover:text-foreground transition-colors" title="Regenerate">
                        <RotateCcw size={14} />
                      </button>
                      <button className="p-1 hover:text-foreground transition-colors" title="Good response">
                        <ThumbsUp size={14} />
                      </button>
                      <button className="p-1 hover:text-foreground transition-colors" title="Bad response">
                        <ThumbsDown size={14} />
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
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-card via-card to-transparent">
        <div className="max-w-5xl mx-auto">
          {image && (
            <div className="relative inline-block mb-4">
              <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-primary" referrerPolicy="no-referrer" />
              <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-foreground text-card rounded-full p-1 shadow-lg">
                <X size={12} />
              </button>
            </div>
          )}
          <div className="w-full rounded-2xl shadow-lg border border-border p-2 bg-card transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anything..."
              className="w-full bg-transparent resize-none outline-none p-4 min-h-[60px] max-h-[200px] text-foreground placeholder:text-muted-foreground text-lg"
              rows={1}
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-border transition-colors">
                  <ImageIcon size={16} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleVoiceInput}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:bg-border'}`}
                >
                  <Mic size={16} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() && !image}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${input.trim() || image ? 'bg-foreground text-card hover:opacity-90' : 'bg-foreground/50 text-card'}`}
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
