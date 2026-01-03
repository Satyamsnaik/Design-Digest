import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface SkeletonLoaderProps {
  message?: string; // Kept for backward compatibility, though we'll use internal logic mainly
  mode?: 'feed' | 'url';
}

const FEED_STEPS = [
  "Connecting to design knowledge base...",
  "Scanning top tier publications (NNGroup, UX Collective)...",
  "Filtering for relevance and complexity...",
  "Synthesizing key insights & mental models...",
  "Formatting your editorial briefing..."
];

const URL_STEPS = [
  "Fetching content from source...",
  "Parsing document structure...",
  "Extracting core arguments and examples...",
  "Generating actionable application tips...",
  "Finalizing summary card..."
];

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ mode = 'feed' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = mode === 'url' ? URL_STEPS : FEED_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800); // Change step every 1.8 seconds

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full max-w-2xl mx-auto py-20 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-stone-100 rounded-full mb-6 relative">
          <div className="absolute inset-0 bg-stone-200 rounded-full animate-ping opacity-25"></div>
          <Loader2 className="w-8 h-8 text-charcoal animate-spin" />
        </div>
        <h3 className="font-serif text-3xl text-charcoal mb-2 animate-pulse">
          {steps[currentStep]}
        </h3>
        <p className="text-stone-400 text-sm uppercase tracking-widest font-medium">
          AI Processing • {Math.min(((currentStep + 1) / steps.length) * 100, 100).toFixed(0)}% Complete
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm max-w-lg mx-auto space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex items-center transition-all duration-500 ${
              index > currentStep ? 'opacity-30 blur-[1px]' : 'opacity-100'
            }`}
          >
            <div className={`mr-4 flex-shrink-0 transition-colors duration-500 ${
              index < currentStep ? 'text-green-600' : index === currentStep ? 'text-charcoal' : 'text-stone-300'
            }`}>
              {index < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : index === currentStep ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-current" />
              )}
            </div>
            <span className={`text-sm font-medium ${
              index === currentStep ? 'text-charcoal' : 'text-stone-500'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;