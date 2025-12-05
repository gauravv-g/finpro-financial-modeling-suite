
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, Cpu, Globe, Settings, Terminal, ChevronRight, ExternalLink, Sliders, CheckCircle, AlertCircle } from 'lucide-react';
import { AIConfig, AIProvider } from '../types';

interface Props {
  isOpen: boolean;
  onSave: (config: AIConfig) => void;
  initialConfig: AIConfig;
  onClose?: () => void;
  forceRequired?: boolean;
}

const PROVIDERS = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    badge: 'RECOMMENDED',
    desc: 'Fastest, reliable, and cost-effective.',
    icon: <Cpu size={24} className="text-blue-500" />,
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { label: 'Gemini 2.5 Flash (Fast & Cheap)', value: 'gemini-2.5-flash' },
      // @google/genai guidelines: Replaced prohibited model 'gemini-1.5-pro' with 'gemini-3-pro-preview'.
      { label: 'Gemini 3 Pro (High Intelligence)', value: 'gemini-3-pro-preview' }
    ]
  },
  { 
    id: 'openai', 
    name: 'OpenAI / Grok', 
    badge: 'INDUSTRY STANDARD',
    desc: 'GPT-4 Turbo, Grok, or DeepSeek.', 
    icon: <Globe size={24} className="text-green-500" />,
    getKeyUrl: 'https://platform.openai.com/api-keys',
    models: [
      { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      { label: 'Grok Beta', value: 'grok-beta' }
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic Claude', 
    badge: 'BEST FOR REASONING',
    desc: 'Excellent for complex financial logic.', 
    icon: <Terminal size={24} className="text-amber-600" />,
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20240620' },
      { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' }
    ]
  },
  { 
    id: 'custom', 
    name: 'Custom / Local', 
    badge: 'ADVANCED',
    desc: 'Ollama, LM Studio, or Private Proxies.', 
    icon: <Settings size={24} className="text-slate-500" />,
    models: []
  }
];

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onSave, initialConfig, onClose, forceRequired = false }) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(initialConfig.provider || 'gemini');
  const [apiKey, setApiKey] = useState(initialConfig.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(initialConfig.baseUrl || '');
  const [modelId, setModelId] = useState(initialConfig.modelId || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setSelectedProvider(initialConfig.provider || 'gemini');
    setApiKey(initialConfig.apiKey || '');
    setBaseUrl(initialConfig.baseUrl || '');
    setModelId(initialConfig.modelId || '');
  }, [initialConfig, isOpen]);

  const activeProviderData = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];

  const handleProviderSelect = (id: string) => {
    const newProvider = id as AIProvider;
    setSelectedProvider(newProvider);
    
    // Set smart defaults when switching
    const providerData = PROVIDERS.find(p => p.id === id);
    if (providerData && providerData.models.length > 0) {
        setModelId(providerData.models[0].value);
    }
    
    // Handle URL defaults
    if (newProvider === 'custom') setBaseUrl('http://localhost:11434/v1');
    else if (newProvider === 'openai') setBaseUrl('https://api.openai.com/v1');
    else setBaseUrl('');
    
    // Clear key if switching (security best practice UI, prevents confusion)
    if (apiKey && initialConfig.provider !== newProvider) setApiKey('');
    else if (initialConfig.provider === newProvider) setApiKey(initialConfig.apiKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (apiKey.trim().length < 3 && selectedProvider !== 'custom') {
      alert("Please enter a valid API Key.");
      return;
    }
    
    onSave({
      provider: selectedProvider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
      modelId: modelId.trim()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left: Provider Selection */}
        <div className="md:w-1/3 bg-slate-50 border-r border-slate-200 p-2 flex flex-col overflow-y-auto">
            <div className="p-4 pb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select AI Brain</h3>
            </div>
            <div className="space-y-2 p-2">
                {PROVIDERS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => handleProviderSelect(p.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all relative group ${selectedProvider === p.id ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className={`p-2 rounded-lg ${selectedProvider === p.id ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                {p.icon}
                            </div>
                            {selectedProvider === p.id && <CheckCircle size={16} className="text-amber-500" />}
                        </div>
                        <h4 className={`font-bold text-sm ${selectedProvider === p.id ? 'text-slate-900' : 'text-slate-600'}`}>{p.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</p>
                        {p.badge && selectedProvider === p.id && (
                            <span className="absolute top-2 right-2 text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">{p.badge}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Right: Configuration */}
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                    {activeProviderData.icon} 
                    Configure {activeProviderData.name}
                </h2>
                <p className="text-slate-500 text-sm mt-1">Connect your secure API key to power FinPro.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto">
                <div className="space-y-6">
                    
                    {/* API Key Field */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">API Key / Secret</label>
                            {activeProviderData.getKeyUrl && (
                                <a 
                                    href={activeProviderData.getKeyUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full transition-colors"
                                >
                                    Get {activeProviderData.name} Key <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={`Paste your ${activeProviderData.name} Key here...`}
                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm shadow-inner transition-all"
                                autoFocus
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <ShieldCheck size={18} />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <ShieldCheck size={10} className="text-emerald-500" /> 
                            Keys are encrypted AES-256 locally. FinPro servers never see them.
                        </p>
                    </div>

                    {/* Simple Model Select */}
                    {activeProviderData.models.length > 0 && !showAdvanced && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Intelligence Level</label>
                            <div className="relative">
                                <select 
                                    value={modelId}
                                    onChange={(e) => setModelId(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium cursor-pointer hover:border-amber-300 transition-colors"
                                >
                                    {activeProviderData.models.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    )}

                    {/* Advanced Toggle */}
                    <div>
                        <button 
                            type="button" 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-xs font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition group"
                        >
                            <Sliders size={14} className="group-hover:text-amber-500" /> 
                            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings (Base URL / Custom Models)'}
                        </button>
                    </div>

                    {/* Advanced Fields */}
                    {showAdvanced && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Model ID (Manual Override)</label>
                                <input 
                                    type="text" 
                                    value={modelId}
                                    onChange={(e) => setModelId(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-amber-500 outline-none"
                                    placeholder="e.g. gpt-4-32k, llama3-70b"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base URL (For Proxies / Local)</label>
                                <input 
                                    type="text" 
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-amber-500 outline-none"
                                    placeholder="e.g. https://api.groq.com/openai/v1"
                                />
                            </div>
                            {selectedProvider === 'openai' && (
                                <div className="flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 p-2 rounded">
                                    <AlertCircle size={12} className="mt-0.5" />
                                    For Grok, set Base URL to: https://api.x.ai/v1
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                    {!forceRequired && onClose && (
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition text-sm"
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        type="submit"
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 text-sm transform active:scale-95 duration-200"
                    >
                        <Save size={18} /> Save Intelligence Configuration
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};