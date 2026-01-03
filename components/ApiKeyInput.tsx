
import React, { useState, useEffect } from 'react';
import { Key, ArrowRight, Clipboard, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [isClipboardSupported, setIsClipboardSupported] = useState(false);

  useEffect(() => {
    // Check if the clipboard API is supported and available in this context
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
      setIsClipboardSupported(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  const handlePaste = async () => {
    if (!isClipboardSupported) return;
    
    try {
      const text = await navigator.clipboard.readText();
      if (text) setKey(text);
    } catch (err) {
      console.warn('Clipboard access denied or failed:', err);
      const input = document.getElementById('api-key-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
      alert("Unable to access clipboard automatically. Please paste manually.");
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center p-4">
      <div 
        className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-stone-100 overflow-hidden relative"
        style={{ zIndex: 60, backgroundColor: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <div className="p-8 md:p-10">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Key className="w-7 h-7 text-charcoal" />
          </div>
          
          <h2 className="font-serif text-3xl text-center text-charcoal mb-3">
            API Key Required
          </h2>
          
          <p className="text-center text-stone-500 mb-8 leading-relaxed">
             Please enter your Google Gemini API key to access the digest.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input
                id="api-key-input"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste key here..."
                className="w-full pl-4 pr-12 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all font-mono text-sm"
                required
              />
              
              {isClipboardSupported && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-3 top-3 bottom-3 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors active:scale-95"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!key}
              className="w-full bg-charcoal text-white py-4 rounded-xl font-bold hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <span>Initialize App</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col gap-3">
             <div className="flex items-start gap-3 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Keys are stored locally and never sent to our servers.</p>
             </div>
             
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-charcoal transition-colors mt-2"
             >
                <span>Get a Gemini API Key</span>
                <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
