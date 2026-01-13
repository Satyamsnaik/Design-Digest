
import React, { useState } from 'react';
import { Key, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 10) { 
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 md:p-8">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Key className="w-6 h-6 text-charcoal" />
            </div>
            <h2 className="text-2xl font-sans font-bold text-center text-charcoal mb-3">Enter Access Key</h2>
            <p className="text-center text-stone-500 text-sm mb-8 leading-relaxed px-4">
                This app requires a Google Gemini API Key. <br/>
                Your key is stored securely in your browser's local storage.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="password"
                        placeholder="Paste API Key (starts with AIza...)"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-charcoal focus:border-transparent outline-none transition-all font-mono text-sm shadow-sm"
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    disabled={key.length < 10}
                    className="w-full bg-charcoal text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group shadow-md hover:shadow-lg"
                >
                    Start Digest
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-charcoal transition-colors font-medium">
                    Get a free key <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                 <div className="flex items-center" title="Your key never leaves your device except to call Google's API">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Local Storage
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
