import React from 'react';
import { User, Briefcase, ChevronRight, ShieldCheck, TrendingUp, Award, BarChart3, Lock } from 'lucide-react';
import { UserMode } from '../types';

interface Props {
  onSelectMode: (mode: UserMode) => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onSelectMode }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row animate-fade-in bg-white">
      
      {/* Left Panel: Value Proposition (Authority) */}
      <div className="md:w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-8">
            <ShieldCheck size={12} /> Institutional Standard
          </div>
          <h1 className="text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
            Financial Modeling <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Reimagined.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md font-light">
            FinPro replaces expensive consultants with intelligent automation. Generate bank-ready Detailed Project Reports (DPR), CMA Data, and Financial Projections in minutes.
          </p>
        </div>

        <div className="relative z-10 space-y-8 mt-16">
           <div className="flex items-center gap-4 group">
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 group-hover:border-amber-500/50 transition-colors">
                 <TrendingUp size={24} className="text-emerald-400" />
              </div>
              <div>
                 <h4 className="font-bold text-white text-sm">95% Faster Turnaround</h4>
                 <p className="text-slate-500 text-xs">From client intake to final PDF in minutes.</p>
              </div>
           </div>
           <div className="flex items-center gap-4 group">
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 group-hover:border-amber-500/50 transition-colors">
                 <Award size={24} className="text-amber-400" />
              </div>
              <div>
                 <h4 className="font-bold text-white text-sm">Bank-Compliant Formats</h4>
                 <p className="text-slate-500 text-xs">Aligned with RBI & Nayak Committee norms.</p>
              </div>
           </div>
        </div>

        <div className="relative z-10 mt-16 pt-8 border-t border-slate-800">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Trusted Infrastructure</p>
           <div className="flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Trust signals */}
               <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold"><Lock size={12}/> AES-256 ENCRYPTION</div>
               <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold"><BarChart3 size={12}/> BASEL III COMPLIANT</div>
           </div>
        </div>
      </div>

      {/* Right Panel: Action (Conversion) */}
      <div className="md:w-7/12 p-8 md:p-20 flex flex-col justify-center bg-slate-50/50">
         <div className="max-w-lg mx-auto w-full">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">Initialize Workspace</h2>
            <p className="text-slate-500 mb-10 font-light">Select your operational role to configure the security vault.</p>

            <div className="grid gap-6">
               {/* Business Owner Option */}
               <button 
                 onClick={() => onSelectMode('business')}
                 className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 text-left relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="text-amber-500" />
                 </div>
                 <div className="flex items-start gap-5">
                    <div className="bg-amber-50 text-amber-600 p-4 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                       <User size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-700 transition-colors">Business Owner</h3>
                       <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                         I need a project report for my own business loan application.
                       </p>
                    </div>
                 </div>
               </button>

               {/* Professional Option */}
               <button 
                 onClick={() => onSelectMode('professional')}
                 className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-900 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 text-left relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">PRO SUITE</div>
                 
                 <div className="flex items-start gap-5">
                    <div className="bg-slate-100 text-slate-600 p-4 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                       <Briefcase size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 text-lg group-hover:text-slate-900 transition-colors">Chartered Accountant</h3>
                       <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                         I manage financial compliance & reporting for multiple clients.
                       </p>
                    </div>
                 </div>
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};