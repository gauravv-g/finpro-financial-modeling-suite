
import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InputWizard } from './components/InputWizard';
import { ReportView } from './components/ReportView';
import { CADashboard } from './components/CADashboard';
import { PricingModal } from './components/PricingModal';
import { LearningCenter } from './components/LearningCenter';
import { SecurityVault, useSecurity } from './components/SecurityVault';
import { ProjectManager } from './components/ProjectManager';
import { LegalModal } from './components/LegalModal'; 
import { ApiKeyModal } from './components/ApiKeyModal'; // Added Import
import { generateReportContent } from './services/geminiService';
import { calculateProjections, calculateMetrics, calculateAmortization, calculateWorkingCapital, calculateBreakEven } from './utils/financials';
import { BusinessData, FullReport, UserMode, PlanType, SavedReport, AIConfig } from './types';
import { BookOpen, LogOut, ShieldCheck, Crown, LayoutGrid, Library, Lock, Home, Settings } from 'lucide-react'; // Added Settings icon

const APP_VERSION = "v2.5 (Enterprise)";

// --- MAIN APP (Authenticated) ---
const MainApp = ({ userMode, onExit }: { userMode: UserMode, onExit: () => void }) => {
    const [plan, setPlan] = useState<PlanType>('free');
    const [showPricing, setShowPricing] = useState(false);
    const [showSettings, setShowSettings] = useState(false); // New State
    
    // Default view logic: CAs go to Dashboard, Business Owners go to Project Manager
    const [view, setView] = useState<'wizard' | 'report' | 'dashboard' | 'projects'>(
        userMode === 'professional' ? 'dashboard' : 'projects'
    );
    
    const [report, setReport] = useState<FullReport | null>(null);
    const [savedReport, setSavedReport] = useState<SavedReport | undefined>(undefined);
    const [showLearning, setShowLearning] = useState(false);
    
    const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: 'gemini', apiKey: '', modelId: 'gemini-2.5-flash' });

    const { isAuthenticated, logout, encryptAndSave, loadAndDecrypt } = useSecurity();

    // RESTORE SUBSCRIPTION & AI CONFIG
    useEffect(() => {
        const loadData = async () => {
            if (isAuthenticated) {
                const sub = await loadAndDecrypt('finstruct_user_plan');
                if (sub && sub.plan === 'pro') setPlan('pro');

                const storedConfig = localStorage.getItem('finstruct_ai_config');
                if (storedConfig) {
                    setAiConfig(JSON.parse(storedConfig));
                } else {
                    // Legacy fallback
                    const legacyKey = localStorage.getItem('user_gemini_key') || process.env.API_KEY || '';
                    if (!legacyKey) setShowSettings(true); // Prompt setup if missing
                }
            }
        };
        loadData();
    }, [isAuthenticated]);

    // AUTO SAVE HISTORY
    useEffect(() => {
        if (savedReport && isAuthenticated) {
            const save = async () => {
                const stored = await loadAndDecrypt('finstruct_reports_history');
                let reports: SavedReport[] = stored ? stored : [];
                const index = reports.findIndex(r => r.id === savedReport.id);
                if (index >= 0) {
                    reports[index] = savedReport;
                } else {
                    reports.push(savedReport);
                }
                await encryptAndSave('finstruct_reports_history', reports);
            };
            save();
        }
    }, [savedReport, isAuthenticated]);

    const handleUpgrade = async (type: 'one-time' | 'subscription') => {
        setPlan('pro');
        setShowPricing(false);
        await encryptAndSave('finstruct_user_plan', { plan: 'pro', type, date: new Date().toISOString() });
        alert(type === 'subscription' ? "🌟 FinPro Enterprise Active!" : "✅ Report Unlocked.");
    };

    const handleSaveAiConfig = (config: AIConfig) => {
        setAiConfig(config);
        localStorage.setItem('finstruct_ai_config', JSON.stringify(config));
        setShowSettings(false);
    };

    // --- NAVIGATION HANDLERS ---

    const handleLockVault = () => {
        if (confirm("Securely Lock Vault and Exit FinPro?")) {
            logout(); 
            onExit(); 
        }
    };

    const handleGoHome = () => {
        const targetView = userMode === 'professional' ? 'dashboard' : 'projects';
        if (view === targetView) return; // Already there
        
        if (view === 'wizard') {
             if (confirm("Discard unsaved changes and return to dashboard?")) {
                 setView(targetView);
             }
        } else {
             setView(targetView);
        }
    };

    const handleWizardComplete = async (data: BusinessData) => {
        // Calculation Engine
        const projections = calculateProjections(data.financials);
        const metrics = calculateMetrics(projections, data.financials);
        const amortization = calculateAmortization(data.financials);
        const workingCapital = calculateWorkingCapital(projections, data.financials);
        const breakEven = calculateBreakEven(data.financials, projections[0]);

        try {
            // AI Narrative Engine
            const { content, meta } = await generateReportContent(data, projections, metrics);
            
            const fullReport: FullReport = {
                data, projections, metrics, amortization, workingCapital, breakEven, content,
                generatedAt: new Date().toISOString(), meta
            };
            
            setReport(fullReport);
            setView('report');
            
            // Create Saved State
            setSavedReport({
                id: Date.now().toString(),
                clientName: data.entityName,
                projectCost: data.financials.projectCost,
                date: new Date().toISOString(),
                type: data.reportType,
                status: 'Draft',
                versions: [],
                comments: [],
                collaborators: [],
                dataSnapshot: data
            });
        } catch (e) {
            console.error("Report Generation Failed", e);
            alert("Failed to generate report. Please check your AI Settings.");
            setShowSettings(true); // Open settings on failure
        }
    };

    const handleLoadProject = (saved: SavedReport) => {
        if (!saved.dataSnapshot) {
            alert("Error: Corrupted project file.");
            return;
        }
        handleWizardComplete(saved.dataSnapshot);
        setSavedReport(saved);
    };

    const handleNewProject = () => {
        setReport(null);
        setSavedReport(undefined);
        setView('wizard');
    };

    // Derived State
    const isDashboard = (userMode === 'professional' && view === 'dashboard') || (userMode === 'business' && view === 'projects');

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
           {/* STICKY HEADER */}
           <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 print:hidden shadow-sm">
              <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                 
                 <div className="flex items-center gap-8">
                     {/* LOGO (HOME) */}
                     <button 
                        onClick={handleGoHome}
                        className="flex items-center gap-2 group"
                        title="Go to Dashboard"
                     >
                        <div className="w-9 h-9 bg-slate-900 text-white rounded flex items-center justify-center font-serif font-bold text-lg group-hover:bg-amber-600 transition-colors shadow-lg">FP</div>
                        <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">FinPro</span>
                     </button>

                     {/* BREADCRUMB */}
                     {!isDashboard && (
                         <div className="hidden md:flex items-center gap-2 text-sm">
                            <div className="h-4 w-px bg-slate-300"></div>
                            <button onClick={handleGoHome} className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Dashboard</button>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                                {view === 'wizard' ? 'New Project' : 'Report View'}
                            </span>
                         </div>
                     )}
                 </div>

                 <div className="flex items-center gap-3">
                    {/* PLAN BADGE */}
                    <div className={`hidden sm:flex text-[10px] font-bold px-3 py-1.5 rounded-full items-center gap-1.5 uppercase tracking-wider cursor-pointer transition-colors ${plan === 'pro' ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}`} onClick={() => setShowPricing(true)}>
                        {plan === 'pro' ? <Crown size={12} fill="currentColor" /> : <ShieldCheck size={12} />}
                        {plan === 'pro' ? 'Enterprise Plan' : 'Basic License'}
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    
                    {/* AI SETTINGS */}
                    <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition" title="AI Intelligence Hub">
                        <Settings size={20} />
                    </button>

                    {/* LEARNING */}
                    <button onClick={() => setShowLearning(true)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Knowledge Center">
                        <BookOpen size={20} />
                    </button>
                    
                    {/* DASHBOARD NAV */}
                    <button onClick={handleGoHome} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition" title="My Projects">
                        {userMode === 'professional' ? <LayoutGrid size={20} /> : <Library size={20} />}
                    </button>

                    {/* LOGOUT / LOCK */}
                    <button onClick={handleLockVault} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-2 ml-2 shadow-md hover:shadow-lg transform active:scale-95">
                        <Lock size={14} /> Lock Vault
                    </button>
                 </div>
              </div>
           </header>

           <main className="max-w-[1400px] mx-auto px-4 py-8">
              {view === 'projects' && <ProjectManager onSelect={handleLoadProject} onNew={handleNewProject} />}
              {view === 'dashboard' && <CADashboard onNewReport={handleNewProject} onSelectReport={handleLoadProject} />}
              {view === 'wizard' && <InputWizard onComplete={handleWizardComplete} userMode={userMode} />}
              {view === 'report' && report && (
                  <ReportView 
                    report={report} 
                    onBack={() => setView('wizard')} 
                    userMode={userMode}
                    plan={plan}
                    onUpgrade={() => setShowPricing(true)}
                    savedReportState={savedReport}
                    onUpdateSavedReport={setSavedReport}
                  />
              )}
           </main>

           <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={handleUpgrade} />
           <LearningCenter isOpen={showLearning} onClose={() => setShowLearning(false)} />
           <ApiKeyModal isOpen={showSettings} onSave={handleSaveAiConfig} initialConfig={aiConfig} onClose={() => setShowSettings(false)} forceRequired={!aiConfig.apiKey && aiConfig.provider !== 'custom'} />
        </div>
    );
}

// --- ROOT COMPONENT ---
const App = () => {
    const [userMode, setUserMode] = useState<UserMode | null>(null);
    const [legalAccepted, setLegalAccepted] = useState(false);

    useEffect(() => {
        const accepted = sessionStorage.getItem('finstruct_tos_accepted');
        if (accepted) setLegalAccepted(true);
    }, []);

    const handleAcceptTerms = () => {
        setLegalAccepted(true);
        sessionStorage.setItem('finstruct_tos_accepted', 'true');
    };

    if (!legalAccepted) {
        return <LegalModal onAccept={handleAcceptTerms} />;
    }

    if (!userMode) {
        return (
            <>
                {/* Landing Header */}
                <header className="bg-white py-6 border-b border-slate-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                             <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-serif font-bold text-xl shadow-xl shadow-slate-900/20">FP</div>
                             <span className="font-serif font-bold text-2xl text-slate-900 tracking-tight">FinPro</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            Secure Environment
                        </div>
                    </div>
                </header>
                
                <WelcomeScreen onSelectMode={setUserMode} />
                
                <footer className="bg-white border-t border-slate-100 py-10 text-center text-slate-400 text-sm">
                    <div className="flex justify-center items-center gap-2 mb-2 font-serif font-bold text-slate-900">
                        FinPro
                    </div>
                    <p className="text-xs opacity-70">Institutional Financial Modeling Platform • {APP_VERSION}</p>
                    <p className="text-[10px] mt-4 opacity-50">&copy; {new Date().getFullYear()} FinPro Inc. All Rights Reserved.</p>
                </footer>
            </>
        );
    }

    return (
        <SecurityVault>
            <MainApp userMode={userMode} onExit={() => setUserMode(null)} />
        </SecurityVault>
    );
};

export default App;
