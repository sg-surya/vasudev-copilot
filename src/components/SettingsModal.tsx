import React, { useState, useEffect } from 'react';
import { X, Settings, Bell, Palette, LayoutGrid, Database, Shield, Cpu, User, ChevronDown, Play, ShieldCheck, Globe, Zap, Server } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'apps', label: 'Apps', icon: LayoutGrid },
  { id: 'data', label: 'Data controls', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai-provider', label: 'AI Provider', icon: Cpu },
  { id: 'account', label: 'Account', icon: User },
];

const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', icon: Globe, description: 'Google\'s most capable AI models' },
  { id: 'claude', name: 'Anthropic Claude', icon: Zap, description: 'Safe and reliable conversational AI' },
  { id: 'openai', name: 'OpenAI ChatGPT', icon: Cpu, description: 'Industry leading language models' },
  { id: 'ollama', name: 'Ollama (Local)', icon: Server, description: 'Run LLMs locally on your machine' },
  { id: 'lm-studio', name: 'LM Studio (Local)', icon: Server, description: 'Discover and run local LLMs' },
  { id: 'mistral', name: 'Mistral AI', icon: Zap, description: 'Open-weight models from Europe' },
];

const AI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast)' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Powerful)' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  
  // General Settings State
  const [appearance, setAppearance] = useState('system');
  const [accentColor, setAccentColor] = useState('green');
  const [language, setLanguage] = useState('Auto-detect');
  const [spokenLanguage, setSpokenLanguage] = useState('Auto-detect');
  const [voice, setVoice] = useState('Arbor');

  // Load settings
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('selected_ai_model');
    const storedProvider = localStorage.getItem('selected_ai_provider');
    const storedAppearance = localStorage.getItem('app_appearance');
    const storedAccent = localStorage.getItem('app_accent');
    const storedLanguage = localStorage.getItem('app_language');
    const storedSpokenLanguage = localStorage.getItem('app_spoken_language');
    const storedVoice = localStorage.getItem('app_voice');
    
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setSelectedModel(storedModel);
    if (storedProvider) setSelectedProvider(storedProvider);
    if (storedAppearance) setAppearance(storedAppearance);
    if (storedAccent) setAccentColor(storedAccent);
    if (storedLanguage) setLanguage(storedLanguage);
    if (storedSpokenLanguage) setSpokenLanguage(storedSpokenLanguage);
    if (storedVoice) setVoice(storedVoice);
  }, [isOpen]);

  // Auto-save and apply settings
  useEffect(() => {
    if (!isOpen) return;

    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('selected_ai_model', selectedModel);
    localStorage.setItem('selected_ai_provider', selectedProvider);
    localStorage.setItem('app_appearance', appearance);
    localStorage.setItem('app_accent', accentColor);
    localStorage.setItem('app_language', language);
    localStorage.setItem('app_spoken_language', spokenLanguage);
    localStorage.setItem('app_voice', voice);
    
    // Apply appearance
    if (appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (appearance === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Apply accent color
    const root = document.documentElement;
    if (accentColor === 'green') {
      root.style.setProperty('--accent', '#D4FF00');
    } else {
      root.style.setProperty('--accent', '#3b82f6'); // Blue
    }
  }, [apiKey, selectedModel, selectedProvider, appearance, accentColor, language, spokenLanguage, voice, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card text-foreground rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden flex border border-border">
        {/* Sidebar */}
        <div className="w-64 border-r border-border flex flex-col p-4 bg-sidebar">
          <button onClick={onClose} className="mb-6 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors self-start">
            <X size={20} />
          </button>
          
          <div className="space-y-1">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : ''} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <h2 className="text-2xl font-semibold mb-8 capitalize text-foreground">
              {activeTab === 'ai-provider' ? <span className="text-primary">AI Provider</span> : activeTab}
            </h2>

            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* Settings Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Appearance</span>
                    <select 
                      value={appearance}
                      onChange={(e) => setAppearance(e.target.value)}
                      className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Accent color</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${accentColor === 'green' ? 'bg-[#D4FF00]' : 'bg-blue-500'}`}></div>
                      <select 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                      >
                        <option value="green">Vasudev Green</option>
                        <option value="blue">Classic Blue</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Language</span>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      <option value="Auto-detect">Auto-detect</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Spoken language</span>
                    <select 
                      value={spokenLanguage}
                      onChange={(e) => setSpokenLanguage(e.target.value)}
                      className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      <option value="Auto-detect">Auto-detect</option>
                      <option value="English (US)">English (US)</option>
                      <option value="English (UK)">English (UK)</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Voice</span>
                      <span className="text-xs text-muted-foreground">For best results, select the language you mainly speak.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium hover:bg-border transition-colors">
                        <Play size={12} fill="currentColor" /> Play
                      </button>
                      <select 
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                      >
                        <option value="Arbor">Arbor</option>
                        <option value="Nova">Nova</option>
                        <option value="Echo">Echo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-provider' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AI_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                        selectedProvider === provider.id
                          ? 'bg-muted border-primary shadow-sm'
                          : 'bg-card border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedProvider === provider.id ? 'bg-primary text-black' : 'bg-muted text-muted-foreground'
                      }`}>
                        <provider.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-foreground">{provider.name}</h4>
                        <p className="text-xs text-muted-foreground">{provider.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-6 text-foreground">Configuration</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-muted-foreground">API Key / Endpoint</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${selectedProvider} API key...`}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/50"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Your credentials are stored locally in your browser.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-muted-foreground">Model Selection</label>
                      <div className="grid grid-cols-1 gap-2">
                        {AI_MODELS.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                              selectedModel === model.id
                                ? 'bg-muted border-primary text-foreground'
                                : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/30'
                            }`}
                          >
                            <span className="text-sm font-medium">{model.name}</span>
                            {selectedModel === model.id && (
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'ai-provider' && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Settings for {activeTab} will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
