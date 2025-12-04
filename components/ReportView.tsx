import React, { useState, useEffect } from 'react';
import { FullReport, CADetails, UserMode, PlanType, SavedReport, RiskFlag, LoanReadinessReport } from '../types';
import { RevenueChart } from './FinancialCharts';
import { assessFinancialRisks } from '../utils/financials';
import { calculateLoanReadiness } from '../utils/loanReadiness';
import { Printer, FileSpreadsheet, ShieldCheck, ArrowLeft, AlertTriangle, FileSignature, X, PieChart, Calculator, Eye, Edit2, Activity } from 'lucide-react';
import { generateCMAExcel } from '../utils/excelGenerator';
import { CollaborationPanel } from './CollaborationPanel';
import { LoanReadinessCheck } from './LoanReadinessCheck';

interface Props {
  report: FullReport;
  onBack: () => void;
  userMode: UserMode;
  plan: PlanType;
  onUpgrade: () => void;
  savedReportState?: SavedReport;
  onUpdateSavedReport?: (updated: SavedReport) => void;
}

// --- HELPER FOR EDITABLE CONTENT ---
const EditableSection: React.FC<{ 
  title: string, 
  content: string, 
  sectionKey: string,
  onSave: (newContent: string) => void 
}> = ({ title, content, sectionKey, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);

  const handleSave = () => {
     if (value !== content) onSave(value);
     setIsEditing(false);
  };

  return (
    <section className="mb-10 group relative">
       <div className="flex justify-between items-end border-b border-slate-900/10 pb-3 mb-6">
          <h2 className="text-2xl font-serif font-bold text-slate-900">{title}</h2>
          {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Edit2 size={12} /> Edit
              </button>
          )}
       </div>

       {isEditing ? (
          <div>
            <textarea 
              className="w-full border border-slate-300 rounded-lg p-4 text-sm leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none font-serif" 
              rows={8}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-3">
               <button onClick={() => { setIsEditing(false); setValue(content); }} className="text-xs text-slate-500 hover:text-slate-800 px-4 py-2 font-medium">Cancel</button>
               <button onClick={handleSave} className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 font-bold">Save Changes</button>
            </div>
          </div>
       ) : (
          <div className="prose prose-slate max-w-none text-justify whitespace-pre-line text-[15px] leading-relaxed font-light text-slate-700">
              {value}
          </div>
       )}
    </section>
  );
};

export const ReportView: React.FC<Props> = ({ report, onBack, userMode, plan, onUpgrade, savedReportState, onUpdateSavedReport }) => {
  const { data, content, projections, metrics, amortization, workingCapital, breakEven, meta } = report;
  
  const [localContent, setLocalContent] = useState(content);
  const [viewMode, setViewMode] = useState<'standard' | 'investor' | 'ca'>('standard');
  const [showCAModal, setShowCAModal] = useState(false);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  const [caDetails, setCaDetails] = useState<CADetails | undefined>(report.caDetails);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [risks, setRisks] = useState<RiskFlag[]>([]);
  const [readinessReport, setReadinessReport] = useState<LoanReadinessReport | null>(null);

  useEffect(() => {
     setRisks(assessFinancialRisks(metrics, projections, data.financials));
     setReadinessReport(calculateLoanReadiness(data.financials, metrics, projections, breakEven));
  }, []);

  useEffect(() => {
    if (userMode === 'professional' && !caDetails) {
      const savedCA = localStorage.getItem('finstruct_ca_details');
      if (savedCA) {
        setCaDetails({ ...JSON.parse(savedCA), location: data.location, date: new Date().toISOString().split('T')[0] });
      } else {
        setTimeout(() => setShowCAModal(true), 500);
      }
    }
  }, [userMode]);

  const handlePrint = () => {
      if (plan === 'free') {
          onUpgrade(); 
          return;
      }
      window.print();
  };

  const handleExportExcel = () => {
      if (plan === 'free') {
          onUpgrade(); 
          return;
      }
      try {
        generateCMAExcel(report);
      } catch (e) {
          alert("Could not generate Excel.");
      }
  };

  const handleCASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userMode === 'professional') localStorage.setItem('finstruct_ca_details', JSON.stringify(caDetails));
    setShowCAModal(false);
  };
  
  // Header Component
  const SectionHeader = () => (
    <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-10 relative">
      <div className="flex items-center gap-4">
        {data.logo && <img src={data.logo} alt="Company Logo" className="h-12 w-auto object-contain" />}
        <div>
          <h3 className="font-serif font-bold text-slate-900 text-xl leading-tight">{data.entityName}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{data.reportType} • STRICTLY CONFIDENTIAL</p>
        </div>
      </div>
      <div className="text-right hidden sm:block">
         <p className="text-[10px] text-slate-400 font-mono">REF: {data.entityType.substring(0, 3).toUpperCase()}-{new Date().getFullYear()}/001</p>
         {caDetails && (
             <div className="flex items-center justify-end gap-1 mt-1 text-emerald-700">
                 <ShieldCheck size={12} />
                 <p className="text-[10px] font-bold uppercase tracking-widest">Verified by {caDetails.firmName}</p>
             </div>
         )}
      </div>
    </div>
  );

  const VerifiedStamp = () => {
    if (!caDetails) return null;
    return (
        <div className="absolute top-8 right-8 z-0 pointer-events-none opacity-10 mix-blend-multiply">
            <div className="border-4 border-slate-900 rounded-lg p-2 transform -rotate-12">
                <div className="text-4xl font-black uppercase text-slate-900 tracking-widest font-serif">Verified</div>
                <div className="text-center text-xs font-bold uppercase mt-1">{caDetails.firmName}</div>
            </div>
        </div>
    );
  };

  const Footer = () => (
    <div className="mt-auto border-t border-slate-200 pt-6 text-center text-slate-400 text-[10px] flex flex-col items-center gap-1 font-medium">
        <p>© {new Date().getFullYear()} {data.entityName}. All Rights Reserved.</p>
        <div className="flex items-center gap-3 opacity-60">
           <span>Model: FinPro {meta.modelName}</span>
           <span>•</span>
           <span>ID: {meta.generatedAt.substring(0,10)}</span>
        </div>
        <p className="italic mt-1">Generated by FinPro Enterprise. Requires professional validation.</p>
    </div>
  );

  const Page = ({ children, className, hideHeader, hideFooter }: { children?: React.ReactNode, className?: string, hideHeader?: boolean, hideFooter?: boolean }) => (
    <div className={`a4-page ${className || ''} relative`}>
       {!hideHeader && <SectionHeader />}
       {!hideHeader && <VerifiedStamp />}
       <div className="flex-grow flex flex-col relative z-10">
           {children}
       </div>
       {!hideFooter && <Footer />}
    </div>
  );

  return (
    <div className="pb-12 print:pb-0 relative">
      
      {/* Modals */}
      {showReadiness && readinessReport && (
          <LoanReadinessCheck report={readinessReport} onClose={() => setShowReadiness(false)} />
      )}
      
      {showProvenance && meta.auditLog && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Eye size={18}/> Technical Audit Log</h3>
                    <button onClick={() => setShowProvenance(false)}><X size={20}/></button>
                </div>
                <div className="p-6 font-mono text-xs overflow-auto max-h-[60vh] bg-slate-50">
                     <pre>{JSON.stringify(meta.auditLog, null, 2)}</pre>
                </div>
             </div>
        </div>
      )}

      {savedReportState && (
          <CollaborationPanel 
            isOpen={showCollaboration}
            onClose={() => setShowCollaboration(false)}
            savedReport={savedReportState}
            currentUser={userMode === 'professional' ? caDetails?.caName || 'Auditor' : 'Business Owner'}
            userRole={userMode === 'professional' ? 'ca' : 'owner'}
            onAddComment={(txt) => {
                 if(onUpdateSavedReport && savedReportState) {
                     onUpdateSavedReport({
                         ...savedReportState,
                         comments: [...savedReportState.comments, { id: Date.now().toString(), text: txt, author: 'Me', timestamp: new Date().toISOString(), role: userMode === 'professional'?'ca':'owner', resolved: false }]
                     })
                 }
            }}
            onResolveComment={() => {}}
            onRestoreVersion={() => {}}
            onInvite={() => {}}
          />
      )}

      {/* Control Bar */}
      <div className="no-print sticky top-20 z-30 mb-8 mx-auto max-w-[210mm]">
        <div className="bg-slate-900/95 backdrop-blur text-white p-3 rounded-xl shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-4 border border-slate-700/50">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button onClick={() => setViewMode('standard')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition ${viewMode === 'standard' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Report</button>
                <button onClick={() => setViewMode('ca')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition flex items-center gap-2 ${viewMode === 'ca' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Calculator size={14} /> Schedules</button>
                <button onClick={() => setViewMode('investor')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition flex items-center gap-2 ${viewMode === 'investor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><PieChart size={14} /> Analytics</button>
            </div>
            
            <div className="flex gap-2 items-center">
            {risks.length > 0 && (
                <div className="bg-red-500/20 text-red-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-500/30">
                    <AlertTriangle size={14} /> {risks.length} Risks
                </div>
            )}
            <button onClick={() => setShowReadiness(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition border border-slate-700">
                <Activity size={14} /> Check Eligibility
            </button>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            <button onClick={() => {
                if(!caDetails) setCaDetails({ caName: '', firmName: '', membershipNo: '', frn: '', location: data.location, date: new Date().toISOString().split('T')[0] });
                setShowCAModal(true);
            }} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition font-bold ${caDetails ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                <FileSignature size={14} /> {caDetails ? 'Verified' : 'Verify'}
            </button>
            
            <button onClick={handleExportExcel} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition font-bold border ${plan === 'pro' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {plan === 'pro' ? <FileSpreadsheet size={14} /> : <ShieldCheck size={14} />} Excel
            </button>

            <button onClick={handlePrint} className={`flex items-center gap-2 font-bold px-3 py-2 rounded-lg transition text-xs shadow-lg ${plan === 'pro' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                {plan === 'pro' ? <Printer size={14} /> : <ShieldCheck size={14} />} PDF
            </button>
            </div>
        </div>
      </div>

      <div className="print:w-full">
        {viewMode === 'investor' ? (
            <div className="max-w-[210mm] mx-auto p-12 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800">
                 <div className="text-center mb-12 border-b border-slate-800 pb-8">
                    <h1 className="text-5xl font-serif font-bold text-amber-500 mb-3">{data.entityName}</h1>
                    <p className="text-2xl text-slate-400 font-light">Investment Memorandum</p>
                 </div>
                 <div className="grid grid-cols-4 gap-6 text-center">
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-bold">ROI</p>
                        <p className="text-4xl font-serif font-bold text-emerald-400">{metrics.roi}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-bold">Payback</p>
                        <p className="text-4xl font-serif font-bold text-blue-400">{metrics.paybackPeriod} Yrs</p>
                    </div>
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-bold">IRR</p>
                        <p className="text-4xl font-serif font-bold text-amber-400">{metrics.irr}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-bold">BEP</p>
                        <p className="text-4xl font-serif font-bold text-purple-400">{breakEven.bepPercentage}%</p>
                    </div>
                 </div>
                 <div className="mt-12 bg-white p-6 rounded-2xl h-96 text-slate-900 shadow-xl">
                    <RevenueChart data={projections} />
                 </div>
            </div>
        ) : (
            <>
              {/* COVER PAGE */}
              <Page hideHeader hideFooter className="justify-center items-center bg-slate-900 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10 w-full max-w-2xl border-y-2 border-amber-500/50 py-12">
                    <p className="text-amber-500 uppercase tracking-[0.3em] text-sm font-bold mb-6">Detailed Project Report</p>
                    <h1 className="text-6xl font-serif font-bold mb-4 leading-tight">{data.entityName}</h1>
                    <p className="text-xl text-slate-300 font-light">{data.location}</p>
                </div>

                <div className="mt-20 grid grid-cols-2 gap-12 text-left">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Project Cost</p>
                        <p className="text-3xl font-serif font-bold text-white">₹ {data.financials.projectCost} Lakhs</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Bank Loan Required</p>
                        <p className="text-3xl font-serif font-bold text-white">₹ {data.financials.loanRequired} Lakhs</p>
                    </div>
                </div>

                <div className="absolute bottom-12 text-xs text-slate-500 uppercase tracking-widest">
                    Prepared for Bank Finance • {new Date().getFullYear()}
                </div>
              </Page>

              {/* EXECUTIVE SUMMARY */}
              <Page>
                 <EditableSection title="1. Executive Summary" content={localContent.executiveSummary} sectionKey="executiveSummary" onSave={(val) => setLocalContent({...localContent, executiveSummary: val})} />
                 <div className="grid grid-cols-2 gap-6 mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                     <div>
                         <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">Key Promoter</h4>
                         <p className="font-serif text-lg">{data.promoterName}</p>
                     </div>
                     <div>
                         <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">Location</h4>
                         <p className="font-serif text-lg">{data.location}</p>
                     </div>
                 </div>
              </Page>

              {/* COMPANY & MARKET */}
              <Page>
                <EditableSection title="2. Company Profile" content={localContent.companyProfile} sectionKey="companyProfile" onSave={(val) => setLocalContent({...localContent, companyProfile: val})} />
                <div className="h-12 border-b border-dashed border-slate-200 mb-12"></div>
                <EditableSection title="3. Market Analysis" content={localContent.marketAnalysis} sectionKey="marketAnalysis" onSave={(val) => setLocalContent({...localContent, marketAnalysis: val})} />
              </Page>
            </>
        )}
      </div>
    </div>
  );
};