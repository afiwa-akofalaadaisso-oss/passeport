import React, { useState } from 'react';
import Step1WelcomeConsent from './components/merchant/Step1WelcomeConsent';
import Step2ImportData from './components/merchant/Step2ImportData';
import Step3ChatAssistant from './components/merchant/Step3ChatAssistant';
import AuthLoginScreen from './components/security/AuthLoginScreen';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('passeport_app_unlocked') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('passeport_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [operatorData, setOperatorData] = useState({
    operator: 'wave',
    selected: 'Wave Sénégal (0 FCFA)',
    plan: 'right'
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsUnlocked(true);
    localStorage.setItem('passeport_app_unlocked', 'true');
    if (user) {
      localStorage.setItem('passeport_auth_user', JSON.stringify(user));
      if (user.merchant_id) {
        localStorage.setItem('passeport_merchant_id', user.merchant_id);
      }
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setCurrentUser(null);
    localStorage.removeItem('passeport_app_unlocked');
    localStorage.removeItem('passeport_auth_token');
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
        <AuthLoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {currentStep === 1 && (
            <Step1WelcomeConsent 
              onCompleteStep={handleCompleteStep1}
              initialPlan={operatorData?.plan || 'right'}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          )}
          {currentStep === 2 && (
            <Step2ImportData 
              operatorData={operatorData}
              onBack={handleBackToStep1}
              onProceedToChat={handleProceedToChat}
              onReset={handleReset}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          )}
          {currentStep === 3 && (
            <Step3ChatAssistant 
              operatorData={operatorData}
              onBack={handleBackToStep2}
              onReset={handleReset}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          )}
        </>
      )}
    </div>
  );
}


