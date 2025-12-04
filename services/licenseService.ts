
// In a real production app, this validation happens on a backend server (Node.js/Python).
// The frontend sends the key, and the server returns a JWT token.

// For this frontend-only architecture, we simulate the logic.

interface LicenseStatus {
  isValid: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  owner?: string;
  expiry?: string;
  message?: string;
}

// Hardcoded valid keys for demonstration
const VALID_KEYS: Record<string, Partial<LicenseStatus>> = {
  'DEMO-BUSINESS': { plan: 'free', owner: 'Demo User' },
  'PRO-CA-2025': { plan: 'pro', owner: 'Verified CA Firm' },
  'ENT-BANK-X': { plan: 'enterprise', owner: 'Partner Bank' }
};

export const validateLicenseKey = async (key: string): Promise<LicenseStatus> => {
  // Simulate network delay to mimic server call
  await new Promise(resolve => setTimeout(resolve, 1500));

  const cleanKey = key.toUpperCase().trim();

  if (VALID_KEYS[cleanKey]) {
    return {
      isValid: true,
      ...VALID_KEYS[cleanKey]
    } as LicenseStatus;
  }

  return {
    isValid: false,
    plan: 'free',
    message: "Invalid License Key. Please purchase a valid license from FinStruct India."
  };
};

export const getWatermarkText = (plan: string): string => {
  if (plan === 'pro') return "FinStruct India - Professional License";
  return "FinStruct India - Free Trial (Draft Only)";
};
