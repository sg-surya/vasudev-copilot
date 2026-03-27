import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message } from '../types';
import { Mic, ArrowUp, Copy, RotateCcw, ThumbsUp, ThumbsDown, PanelLeftOpen, Volume2, Image as ImageIcon, X, Download, Sparkles, Plus, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import confetti from 'canvas-confetti';

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
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // If the user is within 100px of the bottom, enable auto-scroll
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isAtBottom);
    }
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom('smooth');
    }
  }, [chat.messages]);

  // Initial scroll to bottom when chat loads
  useEffect(() => {
    scrollToBottom('auto');
  }, [chat.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (input.trim() || image) {
      onSendMessage(input, image || undefined);
      setInput('');
      setImage(null);
      
      // Force scroll to bottom when user sends a message
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom('smooth'), 100);
      
      // Fun celebration for first message or just randomly
      if (chat.messages.length === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4FF00', '#3b82f6', '#ffffff']
        });
      }
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
        setIsPlusMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

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
      <header className="flex items-center justify-center gap-4 px-6 py-4 sticky top-0 z-10 bg-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-all bg-card border border-border shadow-sm">
              <PanelLeftOpen size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-sm">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-semibold tracking-tight">Vasudev 1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={exportChat} className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors bg-card border border-border shadow-sm flex items-center gap-2 px-3 group">
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-xs font-medium">Export</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 custom-scrollbar"
      >
        <div className="max-w-5xl mx-auto space-y-10 pb-32">
          {chat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-6 shadow-inner">
                <Sparkles size={32} className="text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground/80">Start a conversation or upload an image to begin.</p>
            </div>
          ) : (
            chat.messages.map((msg, index) => (
              <div key={`${msg.id}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-4'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mt-1 shadow-sm">
                    V
                  </div>
                )}
                <div className={`${msg.role === 'user' ? 'max-w-[80%] bg-muted text-foreground rounded-2xl px-5 py-3 shadow-sm' : 'flex-1 max-w-none'}`}>
                  {msg.image && (
                    <img src={msg.image} alt="User upload" className="max-w-sm rounded-xl mb-3 border border-border shadow-md" referrerPolicy="no-referrer" />
                  )}
                  <div className={`prose max-w-none text-[16px] leading-relaxed dark:prose-invert ${msg.role === 'user' ? 'text-foreground' : 'text-foreground/90'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0 font-medium">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <div className="relative group my-4">
                                <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => copyToClipboard(String(children))}
                                    className="p-1.5 bg-card/80 backdrop-blur border border-border rounded-md hover:bg-card transition-colors"
                                    title="Copy code"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-xl !bg-[#1E1E1E] !p-6 border border-border/50 shadow-lg"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono border border-border/50" {...props}>
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
          <div className={`relative w-full shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.05)] border border-border/50 bg-muted/30 backdrop-blur-2xl transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 flex flex-col p-2 ${image ? 'rounded-[32px]' : 'rounded-full'}`}>
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] opacity-50" />
            
            {image && (
              <div className="relative inline-block ml-4 mt-2 mb-2 animate-in zoom-in-95 duration-200 self-start">
                <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-2xl border border-border shadow-lg" referrerPolicy="no-referrer" />
                <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-foreground text-card rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                  <X size={12} />
                </button>
              </div>
            )}
            
            <div className="flex items-center w-full">
              {/* Plus Button & Menu */}
              <div className="relative" ref={plusMenuRef}>
                <button 
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isPlusMenuOpen ? 'bg-muted text-foreground rotate-45' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Plus size={20} />
                </button>
                
                {isPlusMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-4 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                    <div className="p-2">
                      <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors text-left">
                        <Paperclip size={18} className="text-blue-500" />
                        <span>Add photos & files</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="flex-1 bg-transparent resize-none outline-none px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 text-base leading-tight min-h-[44px] max-h-[200px]"
                rows={1}
                style={{ height: 'auto' }}
              />

              <div className="flex items-center gap-1 pr-1">
                <button 
                  onClick={handleVoiceInput}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Mic size={18} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() && !image}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${input.trim() || image ? 'bg-foreground text-card hover:scale-105 active:scale-95 shadow-lg' : 'bg-foreground/20 text-card cursor-not-allowed'}`}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <span className="text-[11px] font-medium text-muted-foreground/60">Vasudev can make mistakes. Check important info.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
