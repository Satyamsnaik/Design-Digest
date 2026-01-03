import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, Circle, BrainCircuit, PenTool, Search, Share2 } from 'lucide-react';

interface SkeletonLoaderProps {
  mode?: 'feed' | 'url';
}

const FEED_STEPS = [
  { text: "Scanning knowledge graph", icon: BrainCircuit },
  { text: "Sourcing reputable articles", icon: Search },
  { text: "Extracting insights", icon: Share2 },
  { text: "Synthesizing briefing", icon: Sparkles },
  { text: "Final polish", icon: PenTool }
];

const URL_STEPS = [
  { text: "Analyzing resource", icon: Search },
  { text: "Decoding structure", icon: BrainCircuit },
  { text: "Extracting core value", icon: Sparkles },
  { text: "Generating action tips", icon: PenTool },
  { text: "Finalizing", icon: CheckCircle2 }
];

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ mode = 'feed' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = mode === 'url' ? URL_STEPS : FEED_STEPS;
  const progress = Math.min(((currentStep + 0.5) / steps.length) * 100, 100);

  useEffect(() => {
    // Variable timing to make it feel more "real"
    const times = [1500, 2000, 1800, 1500, 1000];
    
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
        }, times[stepIndex] || 1500);
      }
    };

    scheduleNext(0);

    return () => clearTimeout(timeoutId);
  }, [steps.length]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="w-full max-w-2xl mx-auto py-24 px-4">
      <div className="text-center mb-12 relative">
        {/* Central Pulse Animation */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-stone-200 rounded-full animate-[ping_2s_ease-in-out_infinite] opacity-40"></div>
          <div className="absolute inset-0 bg-stone-100 rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="relative bg-white p-4 rounded-full shadow-sm border border-stone-100">
             <CurrentIcon className="w-8 h-8 text-charcoal animate-[spin_4s_linear_infinite]" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="font-serif text-3xl text-charcoal mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500 key={currentStep}">
          {steps[currentStep].text}...
        </h3>
        
        {/* Progress Bar */}
        <div className="max-w-xs mx-auto mt-6">
          <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-charcoal transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-stone-100 p-8 shadow-sm max-w-lg mx-auto space-y-5">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div 
              key={index} 
              className={`flex items-center transition-all duration-500 ${
                index > currentStep ? 'opacity-30 blur-[0.5px]' : 'opacity-100'
              }`}
            >
              <div className={`mr-4 flex-shrink-0 transition-all duration-500 ${
                isCompleted ? 'text-green-600 scale-110' : isActive ? 'text-charcoal scale-110' : 'text-stone-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span className={`text-sm font-medium font-sans transition-colors duration-300 ${
                isActive ? 'text-charcoal' : 'text-stone-500'
              }`}>
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkeletonLoader;