import React, { useState } from 'react';
import { Check, X, Crown, FileText, Zap, ShieldCheck, CreditCard, Building2, User, Star } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: 'one-time' | 'subscription') => void;
}

export const PricingModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'business' | 'professional'>('business');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
        setProcessing(false);
        onUpgrade(activeTab === 'business' ? 'one-time' : 'subscription');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col md:flex-row relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full z-20 transition">
            <X size={20} className="text-slate-600"/>
        </button>

        {/* Sidebar Selector */}
        <div className="md:w-1/3 bg-slate-50 border-r border-slate-200 p-8 flex flex-col">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">Select Plan</h2>
            
            <button 
                onClick={() => setActiveTab('business')}
                className={`p-5 rounded-xl border-2 text-left mb-4 transition-all relative group ${activeTab === 'business' ? 'border-amber-500 bg-white shadow-lg scale-105 z-10' : 'border-transparent hover:bg-white hover:shadow-sm opacity-60 hover:opacity-100'}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${activeTab === 'business' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                        <User size={20} />
                    </div>
                    <span className="font-bold text-slate-800">Business Owner</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Single Report License</p>
            </button>

            <button 
                onClick={() => setActiveTab('professional')}
                className={`p-5 rounded-xl border-2 text-left transition-all relative group ${activeTab === 'professional' ? 'border-slate-900 bg-slate-900 text-white shadow-xl scale-105 z-10' : 'border-transparent hover:bg-white hover:shadow-sm opacity-60 hover:opacity-100'}`}
            >
                {activeTab === 'professional' && (
                    <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        BEST VALUE
                    </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${activeTab === 'professional' ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-500'}`}>
                        <Building2 size={20} />
                    </div>
                    <span className={`font-bold ${activeTab === 'professional' ? 'text-white' : 'text-slate-800'}`}>Professional CA</span>
                </div>
                <p className={`text-xs font-medium ${activeTab === 'professional' ? 'text-slate-400' : 'text-slate-500'}`}>Unlimited Client Reports</p>
            </button>
        </div>

        {/* Content Area */}
        <div className="md:w-2/3 p-10 bg-white flex flex-col justify-center relative">
           {/* Background Deco */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full pointer-events-none"></div>

           {activeTab === 'business' ? (
               <div className="animate-fade-in space-y-6 relative z-10">
                   <div>
                       <span className="text-amber-600 font-bold tracking-widest text-xs uppercase mb-2 block">Transactional</span>
                       <h1 className="text-4xl font-serif font-bold text-slate-900">Single DPR Download</h1>
                       <p className="text-slate-500 mt-2">Perfect for one-time loan applications.</p>
                   </div>

                   <div className="flex items-baseline gap-3 border-b border-slate-100 pb-6">
                       <span className="text-5xl font-bold text-slate-900">₹499</span>
                       <span className="text-slate-400 text-lg line-through decoration-slate-300">₹2,500</span>
                       <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Save 80%</span>
                   </div>

                   <ul className="space-y-4">
                       {['Bank-Ready PDF Report', 'Editable Excel (CMA Data)', '5-Year Financial Projections', 'Instant Download'].map((feat, i) => (
                           <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                               <div className="bg-amber-100 text-amber-600 p-1 rounded-full"><Check size={12} /></div>
                               {feat}
                           </li>
                       ))}
                   </ul>

                   <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 transition flex items-center justify-center gap-3 mt-4"
                   >
                       {processing ? 'Processing...' : (
                           <>Unlock Report <CreditCard size={20} className="text-amber-500" /></>
                       )}
                   </button>
               </div>
           ) : (
               <div className="animate-fade-in space-y-6 relative z-10">
                   <div>
                       <span className="text-amber-600 font-bold tracking-widest text-xs uppercase mb-2 block flex items-center gap-1"><Star size={12} fill="currentColor"/> Pro License</span>
                       <h1 className="text-4xl font-serif font-bold text-slate-900">Unlimited Access</h1>
                       <p className="text-slate-500 mt-2">Automate your practice. Scale your firm.</p>
                   </div>

                   <div className="flex items-baseline gap-3 border-b border-slate-100 pb-6">
                       <span className="text-5xl font-bold text-slate-900">₹1,499</span>
                       <span className="text-slate-500 font-medium">/ month</span>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                       <ul className="space-y-4">
                           <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                               <Zap size={16} className="text-amber-500" /> Unlimited Generations
                           </li>
                           <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                               <Crown size={16} className="text-amber-500" /> White-Label Reports
                           </li>
                       </ul>
                       <ul className="space-y-4">
                           <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                               <ShieldCheck size={16} className="text-amber-500" /> Client Management
                           </li>
                           <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                               <FileText size={16} className="text-amber-500" /> Premium Templates
                           </li>
                       </ul>
                   </div>

                   <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-amber-200 transition flex items-center justify-center gap-3 mt-4"
                   >
                       {processing ? 'Processing...' : (
                           <>Start 7-Day Free Trial <CreditCard size={20} /></>
                       )}
                   </button>
                   <p className="text-center text-xs text-slate-400">No commitment. Cancel anytime.</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};