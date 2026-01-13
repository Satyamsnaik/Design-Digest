import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, BrainCircuit, PenTool, Search, Globe, FileSearch, Link, Code, Zap, Layers } from 'lucide-react';

interface SkeletonLoaderProps {
  mode?: 'feed' | 'url';
}

const FEED_STEPS = [
  { text: "Calibrating design intelligence...", icon: BrainCircuit },
  { text: "Scanning global trusted sources...", icon: Globe },
  { text: "Filtering for depth & relevance...", icon: Layers },
  { text: "Synthesizing key insights...", icon: Sparkles },
  { text: "Formatting editorial briefing...", icon: PenTool }
];

const URL_STEPS = [
  { text: "Resolving resource destination...", icon: Link },
  { text: "Extracting semantic content...", icon: FileSearch },
  { text: "Identifying code & technical patterns...", icon: Code },
  { text: "Generating actionable takeaways...", icon: Zap },
  { text: "Finalizing deep dive analysis...", icon: CheckCircle2 }
];

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ mode = 'feed' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = mode === 'url' ? URL_STEPS : FEED_STEPS;
  // Calculate progress: (currentStep / totalSteps) * 100, but smoother
  const progress = Math.min(((currentStep + 0.5) / steps.length) * 100, 100);

  useEffect(() => {
    // Timing configuration (ms) - varied for realism
    const times = [800, 1200, 1000, 800, 600];
    
    const advance = () => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    
    const scheduleNext = (stepIndex: number) => {
      if (stepIndex < steps.length - 1) {
        timeoutId = setTimeout(() => {
          advance();
          scheduleNext(stepIndex + 1);
        }, times[stepIndex] || 800);
      }
    };

    scheduleNext(0);

    return () => clearTimeout(timeoutId);
  }, [steps.length]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="w-full max-w-2xl mx-auto py-24 px-4">
      <div className="text-center mb-12 relative">
        
        {/* Main Central Interaction */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Outer Ripple */}
          <div className="absolute inset-0 bg-stone-200 rounded-full animate-[ping_2s_ease-out_infinite] opacity-30 scale-150"></div>
          {/* Inner Pulse */}
          <div className="absolute inset-0 bg-stone-100 rounded-full animate-[pulse_2s_ease-in-out_infinite] scale-110"></div>
          
          {/* Icon Container */}
          <div className="relative bg-white p-5 rounded-full shadow-lg border border-stone-100 z-10 transition-all duration-500 ease-out transform">
             <CurrentIcon 
               className="w-10 h-10 text-charcoal transition-all duration-500" 
               strokeWidth={1.5} 
               key={currentStep} // Triggers animation on change
             />
             {/* Spinning ring around icon */}
             <div className="absolute inset-0 rounded-full border-2 border-charcoal/10 border-t-charcoal animate-spin duration-[3s]"></div>
          </div>
        </div>

        <h3 className="font-display text-3xl font-bold text-charcoal mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 key={currentStep}">
          {steps[currentStep].text}
        </h3>
        <p className="text-stone-400 text-sm font-medium uppercase tracking-widest animate-pulse">
           AI Processing
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-xs mx-auto mt-8 relative">
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-charcoal rounded-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
                {/* Shimmer inside progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;