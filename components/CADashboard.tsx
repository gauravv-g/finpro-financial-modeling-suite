import React, { useEffect, useState } from 'react';
import { CADetails, SavedReport } from '../types';
import { FilePlus, History, Briefcase, UserCheck, Search, FileText, ChevronRight, ShieldCheck } from 'lucide-react';
import { formatLakhs } from '../utils/financials';

interface Props {
  onNewReport: () => void;
  onSelectReport: (report: SavedReport) => void;
  caDetails?: CADetails;
}

export const CADashboard: React.FC<Props> = ({ onNewReport, onSelectReport, caDetails }) => {
  const [history, setHistory] = useState<SavedReport[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('finstruct_reports_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved).reverse());
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in px-4">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-xs mb-3">
              <ShieldCheck size={14} /> Verified Workspace
            </div>
            <h1 className="text-4xl font-serif font-bold mb-2">
              Welcome, {caDetails?.caName || 'Professional'}
            </h1>
            <p className="text-slate-400 max-w-xl">
              {caDetails?.firmName ? `${caDetails.firmName} • FRN: ${caDetails.frn}` : 'Manage client portfolios, compliance, and automated DPR generation.'}
            </p>
          </div>
          
          <button 
            onClick={onNewReport}
            className="flex items-center gap-2 bg-white text-slate-900 hover:bg-amber-50 px-6 py-3 rounded-lg font-bold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FilePlus size={20} className="text-amber-600" /> New Project Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Firm Profile & Stats */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Briefcase size={16} className="text-slate-400"/> Firm Profile
              </h3>
              
              {caDetails ? (
                <div className="space-y-4">
                   <div className="pb-4 border-b border-slate-100">
                     <p className="text-xs text-slate-500 mb-1">Firm Name</p>
                     <p className="font-serif font-bold text-lg text-slate-800">{caDetails.firmName}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Membership</p>
                        <p className="font-mono text-sm font-semibold text-slate-800">{caDetails.membershipNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">FRN</p>
                        <p className="font-mono text-sm font-semibold text-slate-800">{caDetails.frn}</p>
                      </div>
                   </div>
                   <div className="pt-2">
                     <p className="text-xs text-slate-500 mb-1">Location</p>
                     <p className="text-sm font-medium text-slate-800">{caDetails.location}</p>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-100">
                     <span className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                        <UserCheck size={12} /> Verified Auditor
                     </span>
                   </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <UserCheck size={24} />
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Profile Incomplete</p>
                  <button className="text-xs text-amber-600 font-bold hover:underline">Complete Setup</button>
                </div>
              )}
           </div>
        </div>

        {/* Right Column: Client List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History size={18} className="text-slate-400"/> Client Portfolio
              </h3>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search clients, industries..." 
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {history.length > 0 ? (
                <div className="divide-y divide-slate-100">
                    {history.map((report) => (
                    <button 
                        key={report.id} 
                        onClick={() => onSelectReport(report)}
                        className="w-full p-5 hover:bg-slate-50 transition flex items-center justify-between group text-left"
                    >
                        <div className="flex items-start gap-4">
                        <div className="bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white p-3 rounded-lg transition-colors">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-base">{report.clientName}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{report.type}</span>
                            <span>•</span>
                            <span>{formatLakhs(report.projectCost)}</span>
                            <span>•</span>
                            <span>{new Date(report.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${report.status === 'Signed Off' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {report.status}
                            </span>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition" />
                        </div>
                    </button>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <FilePlus size={32} className="opacity-50"/>
                    </div>
                    <p className="font-medium text-slate-600">No active projects.</p>
                    <p className="text-sm">Start a new analysis to populate your dashboard.</p>
                </div>
                )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};