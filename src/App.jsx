import React, { useState } from 'react';
import Step1WelcomeConsent from './components/merchant/Step1WelcomeConsent';
import Step2ImportData from './components/merchant/Step2ImportData';
import Step3ChatAssistant from './components/merchant/Step3ChatAssistant';
import PinLockScreen from './components/security/PinLockScreen';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('passeport_app_unlocked') === 'true';
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [operatorData, setOperatorData] = useState({
    operator: 'wave',
    selected: 'Wave Sénégal (0 FCFA)',
    plan: 'right'
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('passeport_app_unlocked', 'true');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('passeport_app_unlocked');
  };

  const handleCompleteStep1 = (data) => {
    setOperatorData(data || {
      operator: 'wave',
      selected: 'Wave Sénégal (0 FCFA)',
      plan: 'right'
    });
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleProceedToChat = () => {
    setCurrentStep(3);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setOperatorData({
      operator: 'wave',
      selected: 'Wave Sénégal (0 FCFA)',
      plan: 'right'
    });
  };

  return (
    <div className="app-wrapper">
      {!isUnlocked ? (
        <PinLockScreen onUnlock={handleUnlock} />
      ) : (
        <>
          {currentStep === 1 && (
            <Step1WelcomeConsent 
              onCompleteStep={handleCompleteStep1}
              initialPlan={operatorData?.plan || 'right'}
            />
          )}
          {currentStep === 2 && (
            <Step2ImportData 
              operatorData={operatorData}
              onBack={handleBackToStep1}
              onProceedToChat={handleProceedToChat}
              onReset={handleReset}
            />
          )}
          {currentStep === 3 && (
            <Step3ChatAssistant 
              operatorData={operatorData}
              onBack={handleBackToStep2}
              onReset={handleReset}
            />
          )}
        </>
      )}
    </div>
  );
}


