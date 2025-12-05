import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, AlertTriangle, Fingerprint, Cloud, RefreshCw, Key, Database, LogOut } from 'lucide-react';
import { encryptData, decryptData, hashPassword, exportRecoveryKey } from '../utils/crypto';
import { authenticateWithGoogle, findVaultFile, downloadVault, uploadVault } from '../services/googleDrive';

interface SecurityContextType {
  isAuthenticated: boolean;
  isCloudConnected: boolean;
  passphrase: string;
  encryptAndSave: (key: string, data: any) => Promise<void>;
  loadAndDecrypt: (key: string) => Promise<any>;
  logout: () => void;
  saveToCloud: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error("useSecurity must be used within SecurityVault");
  return context;
};

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; 

export const SecurityVault: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  
  const [passphrase, setPassphrase] = useState('');
  const [inputPass, setInputPass] = useState('');
  
  const [mode, setMode] = useState<'LOGIN' | 'SETUP' | 'CONNECT'>('CONNECT');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
        lastActivityRef.current = Date.now();
    };

    const checkIdle = setInterval(() => {
        if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT_MS) {
            logout("Session timed out due to inactivity.");
        }
    }, 30000);

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
        clearInterval(checkIdle);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
        window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated]);

  const handleConnectGoogle = async () => {
      setStatus("Connecting to Google Drive...");
      setError('');
      try {
          const token = await authenticateWithGoogle();
          setAuthToken(token);
          setIsCloudConnected(true);
          
          setStatus(token === 'SIMULATED_TOKEN' ? "Simulated Cloud Connected." : "Searching for encrypted vault...");
          const fileId = await findVaultFile(token);
          
          if (fileId) {
              setDriveFileId(fileId);
              setMode('LOGIN');
              setStatus("Vault found. Enter password to decrypt.");
          } else {
              setMode('SETUP');
              setStatus("No vault found. Create a Master Password.");
          }
      } catch (e: any) {
          setError("Connection Failed: " + (e.message || 'Could not authenticate. Check popup blockers.'));
          setStatus('');
      }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPass.length < 6) {
      setError("Passphrase must be at least 6 characters.");
      return;
    }
    
    setStatus("Initializing new Vault...");
    setError('');
    try {
        const initialData = JSON.stringify({ finstruct_reports_history: [] });
        const encrypted = await encryptData(initialData, inputPass);
        
        if (authToken) {
            const newId = await uploadVault(encrypted, authToken);
            setDriveFileId(newId);
            setPassphrase(inputPass);
            setIsAuthenticated(true);
        } else {
            setError("Google Auth lost. Please reconnect.");
        }
    } catch (e) {
        setError("Setup Failed.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Downloading and Decrypting...");
    setError('');
    
    try {
        if (!authToken || !driveFileId) throw new Error("Drive disconnected");
        
        const encryptedContent = await downloadVault(driveFileId, authToken);
        if (!encryptedContent) { // Handle empty vault file
            setMode('SETUP');
            setStatus("Vault is empty. Please set up a new password.");
            return;
        }

        const data = await decryptData(encryptedContent, inputPass);
        setPassphrase(inputPass);
        setIsAuthenticated(true);
        
        if (data) {
            const parsed = JSON.parse(data);
            Object.keys(parsed).forEach(k => {
                if (parsed[k]) {
                    localStorage.setItem(k, typeof parsed[k] === 'string' ? parsed[k] : JSON.stringify(parsed[k]));
                }
            });
        }

    } catch (e) {
        console.error(e);
        setError("Incorrect Password or Corrupted Vault.");
        setStatus("");
    }
  };

  const logout = (reason?: string) => {
    setPassphrase('');
    setIsAuthenticated(false);
    setInputPass('');
    localStorage.removeItem('finstruct_reports_history');
    localStorage.removeItem('finstruct_ca_details');
    if (reason) alert(reason);
  };

  const encryptAndSave = async (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    await saveToCloud();
  };
  
  const saveToCloud = async () => {
      if (!authToken || !passphrase) return;
      
      const allData = {
          finstruct_reports_history: JSON.parse(localStorage.getItem('finstruct_reports_history') || '[]'),
          finstruct_ca_details: JSON.parse(localStorage.getItem('finstruct_ca_details') || 'null')
      };
      
      const jsonStr = JSON.stringify(allData);
      const encrypted = await encryptData(jsonStr, passphrase);
      
      await uploadVault(encrypted, authToken, driveFileId || undefined);
  };

  const loadAndDecrypt = async (key: string) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  };
  
  const getRecoveryKey = async () => {
      if (passphrase) {
          const key = await exportRecoveryKey(passphrase);
          alert(`YOUR RECOVERY KEY:\n\n${key}\n\nSave this in a safe place. If you forget your password, this is the only way to prove ownership.`);
      }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8">
             <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600 shadow-inner">
               <Cloud className={isCloudConnected ? "text-emerald-500" : "text-slate-500"} size={32} />
             </div>
             <h1 className="text-2xl font-serif font-bold text-white mb-2">
               FinPro Cloud Vault
             </h1>
             <p className="text-slate-400 text-sm">
               {mode === 'CONNECT'
                 ? 'Connect your Google Drive to access your secure financial vault.' 
                 : mode === 'SETUP' ? 'Create a Master Password to encrypt your vault.' 
                 : 'Enter Master Password to decrypt your vault.'}
             </p>
          </div>

          {mode === 'CONNECT' ? (
              <button 
                onClick={handleConnectGoogle}
                className="w-full py-3 rounded-lg font-bold text-slate-900 bg-white hover:bg-slate-100 transition flex items-center justify-center gap-2"
              >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                  Connect Google Drive
              </button>
          ) : (
              <form onSubmit={mode === 'SETUP' ? handleSetup : handleLogin} className="space-y-6">
                <div className="relative">
                  <input 
                    type="password"
                    value={inputPass}
                    onChange={(e) => setInputPass(e.target.value)}
                    placeholder={mode === 'SETUP' ? "Create Master Password" : "Enter Master Password"}
                    className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition text-center tracking-widest font-mono"
                    autoFocus
                  />
                  <Fingerprint className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>

                <button 
                  type="submit"
                  className={`w-full py-3 rounded-lg font-bold text-slate-900 transition flex items-center justify-center gap-2 ${mode === 'SETUP' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {mode === 'SETUP' ? <Lock size={18} /> : <Unlock size={18} />}
                  {mode === 'SETUP' ? 'Initialize & Encrypt' : 'Decrypt & Sync'}
                </button>
              </form>
          )}

          {status && (
              <div className="text-center text-xs text-amber-500 animate-pulse flex justify-center gap-2 mt-4">
                  <RefreshCw size={12} className="animate-spin" /> {status}
              </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-xs flex items-center gap-2 mt-4">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          
          <div className="mt-6 text-center border-t border-slate-800 pt-4">
             <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck size={12} />
                <span>Zero-Knowledge Encryption • AES-256</span>
             </div>
             <p className="text-[10px] text-slate-600 mt-2">
               Your password never leaves this device. 
               Data is stored in your Google Drive as 'finstruct_vault.enc'.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SecurityContext.Provider value={{ isAuthenticated, isCloudConnected, passphrase, encryptAndSave, loadAndDecrypt, logout, saveToCloud }}>
      {children}
      <div className="fixed bottom-0 right-0 bg-slate-900 text-slate-500 text-[10px] px-3 py-1 rounded-tl-lg flex items-center gap-2 z-[100] opacity-50 hover:opacity-100 transition-opacity cursor-default">
          <Cloud size={10} className={isCloudConnected ? "text-green-500" : "text-red-500"} />
          {authToken === 'SIMULATED_TOKEN' ? "Demo Sync Active" : (isCloudConnected ? "Synced to Drive" : "Offline Mode")}
          <button onClick={getRecoveryKey} className="ml-2 text-amber-600 hover:text-amber-500 flex items-center gap-1 cursor-pointer" title="Show Key">
            <Key size={10} /> Key
          </button>
      </div>
    </SecurityContext.Provider>
  );
};