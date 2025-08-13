import React from 'react';
import { Search, Zap, FileText, MessageSquare, Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

const steps = [
  { id: 1, title: 'Research', icon: Search, description: 'Find viral content ideas' },
  { id: 2, title: 'Hooks', icon: Zap, description: 'Generate engaging hooks' },
  { id: 3, title: 'Script', icon: FileText, description: 'Write the full script' },
  { id: 4, title: 'Captions', icon: MessageSquare, description: 'Create social media captions' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  onStepClick,
  completedSteps = []
}) => {
  return (
    <div className="bg-bg-secondary border-b border-border-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isClickable = onStepClick && (isCompleted || step.id <= currentStep);
              const Icon = step.icon;

              return (
                <li key={step.id} className="relative flex-1">
                  {/* Connector Line */}
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-border-primary">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          currentStep > step.id ? 'bg-success-500' : 'bg-gray-200'
                        }`}
                        style={{ 
                          width: currentStep > step.id ? '100%' : '0%' 
                        }}
                      />
                    </div>
                  )}

                  {/* Step Button */}
                  <button
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={`relative flex flex-col items-center group ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Step Circle */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        isCompleted
                          ? 'bg-success-500 border-success-500 text-white'
                          : isCurrent
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-bg-secondary border-border-secondary text-text-tertiary'
                      } ${
                        isClickable && !isCurrent && !isCompleted
                          ? 'group-hover:border-primary-400 group-hover:text-primary-600 dark:group-hover:border-primary-500'
                          : ''
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="mt-2 text-center">
                      <div
                        className={`text-sm font-medium transition-colors ${
                          isCurrent
                            ? 'text-primary-600'
                            : isCompleted
                            ? 'text-success-600'
                            : 'text-text-tertiary'
                        } ${
                          isClickable && !isCurrent && !isCompleted
                            ? 'group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            : ''
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default StepIndicator;