import React, { useState, useEffect } from 'react';
import { Key, ArrowRight, ExternalLink, ShieldCheck, X, Save } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
  onClose: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, onClose }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem("GEMINI_API_KEY");
    if (stored) setKey(stored);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(key.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-100 animate-in slide-in-from-bottom-2 duration-300">
        
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                        <Key className="w-5 h-5 text-charcoal" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-charcoal">
                        Configure API
                    </h2>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-charcoal transition-colors p-1 rounded-full hover:bg-stone-50">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                Enter your Google Gemini API Key to enable live intelligence. 
                This key is stored securely in your browser's session storage.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Gemini API Key</label>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="AIza..."
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-charcoal focus:border-transparent outline-none transition-all font-mono text-sm bg-stone-50"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={key.length < 5}
                        className="flex-1 bg-charcoal text-white font-bold py-3 rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Key
                    </button>
                </div>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100">
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors gap-1.5"
                >
                    Get a key from Google AI Studio
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;