import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import Login from './components/Login';
import Header from './components/Layout/Header';
import StepIndicator from './components/Layout/StepIndicator';
import Step1Research from './components/Steps/Step1Research';
import Step2Hooks from './components/Steps/Step2Hooks';
import Step3Script from './components/Steps/Step3Script';
import Step4Captions from './components/Steps/Step4Captions';
import History from './components/History';
import LoadingSpinner from './components/UI/LoadingSpinner';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentStep, setCurrentStep } = useApp();
  const [currentPage, setCurrentPage] = useState<'app' | 'history'>('app');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading ReelWriterAI..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    setCurrentPage('app');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'app' | 'history');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Research />;
      case 2:
        return <Step2Hooks />;
      case 3:
        return <Step3Script />;
      case 4:
        return <Step4Captions />;
      default:
        return <Step1Research />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      
      {currentPage === 'app' && (
        <>
          <StepIndicator 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
            completedSteps={[]} // You can implement completion tracking
          />
          <main className="pb-8">
            {renderCurrentStep()}
          </main>
        </>
      )}
      
      {currentPage === 'history' && (
        <main className="pb-8">
          <History onNavigate={handleNavigate} />
        </main>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;