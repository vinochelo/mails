import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full max-w-lg">
      <div className="flex items-start">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={label} className="flex items-center w-full">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition-colors duration-300',
                    isCompleted ? 'bg-primary text-primary-foreground' : 'border-2',
                    isCurrent ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : stepNumber}
                </div>
                <p
                  className={cn(
                    'mt-2 text-sm text-center font-medium w-24 transition-colors duration-300',
                    isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-auto mx-4 mb-8 transition-colors duration-300',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
