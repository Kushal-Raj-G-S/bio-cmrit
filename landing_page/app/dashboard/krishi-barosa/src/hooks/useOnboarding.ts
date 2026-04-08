// Enhanced onboarding hook
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export interface OnboardingStep {
  stepNumber: number;
  stepName: string;
  isCompleted: boolean;
  isRequired: boolean;
  component: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);

  // Define role-specific onboarding steps
  const getOnboardingSteps = (role: string): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        stepNumber: 1,
        stepName: 'Basic Information',
        isCompleted: false,
        isRequired: true,
        component: 'BasicInfoStep'
      },
      {
        stepNumber: 2,
        stepName: 'Email Verification',
        isCompleted: false,
        isRequired: true,
        component: 'EmailVerificationStep'
      }
    ];

    const roleSpecificSteps: Record<string, OnboardingStep[]> = {
      FARMER: [
        ...baseSteps,
        {
          stepNumber: 3,
          stepName: 'Farm Profile Setup',
          isCompleted: false,
          isRequired: true,
          component: 'FarmerProfileStep'
        },
        {
          stepNumber: 4,
          stepName: 'Land Verification',
          isCompleted: false,
          isRequired: true,
          component: 'LandVerificationStep'
        },
        {
          stepNumber: 5,
          stepName: 'KYC Documents',
          isCompleted: false,
          isRequired: false,
          component: 'KYCDocumentsStep'
        }
      ],
      MANUFACTURER: [
        ...baseSteps,
        {
          stepNumber: 3,
          stepName: 'Company Profile',
          isCompleted: false,
          isRequired: true,
          component: 'ManufacturerProfileStep'
        },
        {
          stepNumber: 4,
          stepName: 'Business License',
          isCompleted: false,
          isRequired: true,
          component: 'BusinessLicenseStep'
        },
        {
          stepNumber: 5,
          stepName: 'Quality Certifications',
          isCompleted: false,
          isRequired: false,
          component: 'CertificationsStep'
        }
      ],
      CONSUMER: [
        ...baseSteps,
        {
          stepNumber: 3,
          stepName: 'Preferences Setup',
          isCompleted: false,
          isRequired: false,
          component: 'ConsumerPreferencesStep'
        },
        {
          stepNumber: 4,
          stepName: 'Location Setup',
          isCompleted: false,
          isRequired: false,
          component: 'LocationSetupStep'
        }
      ]
    };

    return roleSpecificSteps[role] || baseSteps;
  };

  const completeStep = async (stepNumber: number, stepData: any) => {
    try {
      const response = await fetch('/api/onboarding/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber,
          stepData,
          userId: user?.id
        })
      });

      if (response.ok) {
        // Update local state
        setOnboardingSteps(prev => 
          prev.map(step => 
            step.stepNumber === stepNumber 
              ? { ...step, isCompleted: true }
              : step
          )
        );
        
        // Move to next step
        const nextStep = onboardingSteps.find(s => s.stepNumber > stepNumber && !s.isCompleted);
        if (nextStep) {
          setCurrentStep(nextStep.stepNumber);
        }
      }
    } catch (error) {
      console.error('Error completing onboarding step:', error);
    }
  };

  const skipStep = async (stepNumber: number) => {
    const step = onboardingSteps.find(s => s.stepNumber === stepNumber);
    if (step && !step.isRequired) {
      await completeStep(stepNumber, { skipped: true });
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = onboardingSteps.filter(s => s.isCompleted).length;
    return Math.round((completedSteps / onboardingSteps.length) * 100);
  };

  useEffect(() => {
    if (user?.role) {
      const steps = getOnboardingSteps(user.role);
      setOnboardingSteps(steps);
      setCurrentStep(1); // Default to step 1 since onboardingStep doesn't exist in User type
    }
  }, [user]);

  return {
    currentStep,
    onboardingSteps,
    completeStep,
    skipStep,
    getProgressPercentage,
    isOnboardingComplete: user?.onboardingComplete || false
  };
};
