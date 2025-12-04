
import React from 'react';
import { LoanReadinessReport, DiagnosticMetric } from '../types';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, ArrowRight } from 'lucide-react';

interface Props {
  report: LoanReadinessReport;
  onClose: () => void;
}

export const LoanReadinessCheck: React.FC<Props> = ({ report, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status: DiagnosticMetric['status']) => {
    switch (status) {
      case 'Pass': return <CheckCircle size={20} className="text-emerald-500" />;
      case 'Warning': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'Fail': return <XCircle size={20} className="text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white sticky top-0 z-10 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                    <TrendingUp className="text-amber-500" /> Loan Readiness Diagnostic
                </h2>
                <p className="text-slate-400 text-sm">Automated Bank Eligibility Check (Tandon/Nayak Committee Norms)</p>
            </div>
            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition">
                <XCircle size={24} />
            </button>
        </div>

        <div className="p-8">
            
            {/* Top Score Section */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-center justify-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                     {/* Circular Progress (CSS simplified) */}
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                        <circle 
                            cx="96" cy="96" r="88" fill="none" 
                            stroke={report.totalScore >= 75 ? '#10b981' : report.totalScore >= 50 ? '#f59e0b' : '#ef4444'} 
                            strokeWidth="12" 
                            strokeDasharray={`${report.totalScore * 5.5} 999`}
                            strokeLinecap="round"
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <span className={`text-5xl font-bold ${getScoreColor(report.totalScore)}`}>{report.totalScore}</span>
                         <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">/ 100 Score</span>
                     </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h3 className={`text-3xl font-bold mb-2 ${getScoreColor(report.totalScore)}`}>
                        {report.readinessStatus} Probability ({report.probability}%)
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed mb-4">
                        {report.summary}
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 italic">
                        Note: This is an algorithmic assessment based on your financial projections. Actual bank approval depends on CIBIL score, collateral value, and bank policy.
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4">
                {report.metrics.map((metric, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:shadow-md ${
                        metric.status === 'Pass' ? 'bg-emerald-50 border-emerald-500' :
                        metric.status === 'Warning' ? 'bg-amber-50 border-amber-500' : 'bg-red-50 border-red-500'
                    }`}>
                        <div className="flex items-center gap-4 flex-1">
                            {getStatusIcon(metric.status)}
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{metric.name}</h4>
                                <div className="flex items-center gap-2 text-sm mt-1">
                                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                                        Current: {metric.valueDisplay}
                                    </span>
                                    <span className="text-slate-500">Target: {metric.benchmark}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 text-sm text-slate-700">
                             {metric.feedback}
                        </div>

                        {metric.fixAction && (
                            <div className="bg-white/80 p-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2 max-w-xs">
                                <ArrowRight size={14} className="text-amber-600 shrink-0" />
                                {metric.fixAction}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={onClose}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
                >
                    Back to Report
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};