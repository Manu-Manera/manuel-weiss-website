import { useAppStore } from '../store';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  key: string;
}

interface LayoutProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
}

export default function Layout({ steps, currentStep, children }: LayoutProps) {
  const setStep = useAppStore((s) => s.setStep);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const setError = useAppStore((s) => s.setError);

  const canNavigateTo = (stepId: number): boolean => {
    if (stepId <= currentStep) return true;
    if (stepId === currentStep + 1) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TX</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Tempus Excel Mapper</h1>
              <p className="text-xs text-gray-500">Intelligenter Excel → Tempus Import</p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-primary-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Verarbeitung...</span>
            </div>
          )}
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-1">
            {steps.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              const isClickable = canNavigateTo(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  {idx > 0 && <div className={`w-8 h-px mx-1 ${isComplete ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                  <button
                    onClick={() => isClickable && setStep(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all
                      ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : ''}
                      ${isComplete ? 'text-primary-600' : ''}
                      ${!isActive && !isComplete ? 'text-gray-400' : ''}
                      ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed'}
                    `}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-primary-500" />
                    ) : (
                      <Circle className={`w-4 h-4 ${isActive ? 'text-primary-500' : 'text-gray-300'}`} />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{idx + 1}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
