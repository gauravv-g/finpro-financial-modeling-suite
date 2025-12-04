import React, { useState, useEffect } from 'react';
import { BusinessData, EntityType, GovtScheme, IPAsset, UserMode, Language } from '../types';
import { ChevronRight, ChevronLeft, Sparkles, HelpCircle, Loader2, Check, AlertCircle, FileSpreadsheet, Calculator } from 'lucide-react';
import { enhanceBusinessField, getFinancialEstimates } from '../services/geminiService';
import { validateBusinessData } from '../utils/validation';
import { parseFinancialFile } from '../utils/importHelper';
import { SECTOR_TEMPLATES, SectorType } from '../utils/sectorData';
import { t } from '../utils/translations';

interface Props {
  onComplete: (data: BusinessData) => void;
  userMode: UserMode;
}

const initialData: BusinessData = {
  reportType: 'DPR',
  language: 'en',
  entityName: '',
  entityType: EntityType.PVT_LTD,
  sector: '',
  scheme: GovtScheme.NONE,
  location: '',
  promoterName: '',
  promoterExperience: '',
  businessDescription: '',
  projectObjectives: '',
  targetMarket: '',
  financials: {
    landCost: 0,
    buildingCost: 0,
    machineryCost: 0,
    workingCapitalCost: 0,
    otherCost: 0,
    projectCost: 0,
    ownContribution: 25,
    loanRequired: 75,
    interestRate: 11,
    year1Revenue: 50,
    revenueGrowthRate: 15,
    netMargin: 12,
    incomeTaxRate: 25,
    depreciationBuilding: 5,
    depreciationMachinery: 15,
    depreciationOther: 10,
    loanTenure: 7
  },
  ipAssets: []
};

export const InputWizard: React.FC<Props> = ({ onComplete, userMode }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BusinessData>(initialData);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateSuccess, setEstimateSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [sectorToast, setSectorToast] = useState<string | null>(null);
  
  const lang = formData.language;

  useEffect(() => {
    const total = 
      (formData.financials.landCost || 0) +
      (formData.financials.buildingCost || 0) +
      (formData.financials.machineryCost || 0) +
      (formData.financials.workingCapitalCost || 0) +
      (formData.financials.otherCost || 0);
      
    if (total !== formData.financials.projectCost) {
      setFormData(prev => ({
        ...prev,
        financials: { ...prev.financials, projectCost: total }
      }));
    }
  }, [formData.financials]);

  const updateField = (field: keyof BusinessData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectorKey = e.target.value as SectorType;
    updateField('sector', sectorKey);
    if (sectorKey && SECTOR_TEMPLATES[sectorKey]) {
      setFormData(prev => ({
        ...prev,
        financials: { ...prev.financials, ...SECTOR_TEMPLATES[sectorKey].financials }
      }));
      setSectorToast(`Applied norms for ${SECTOR_TEMPLATES[sectorKey].label}`);
      setTimeout(() => setSectorToast(null), 3000);
    }
  };

  const updateFinancial = (field: keyof typeof initialData.financials, value: number) => {
    setFormData(prev => ({
      ...prev,
      financials: { ...prev.financials, [field]: value }
    }));
  };

  const handleEnhance = async (field: keyof BusinessData, label: string) => {
    const currentValue = formData[field] as string;
    if (!currentValue || currentValue.length < 3) return;
    setEnhancingField(field);
    try {
      const enhancedText = await enhanceBusinessField(label, currentValue, formData);
      updateField(field, enhancedText);
    } finally {
      setEnhancingField(null);
    }
  };

  const handleAutoFill = async () => {
    setIsEstimating(true);
    try {
        const estimates = await getFinancialEstimates(formData.businessDescription, formData.location);
        setFormData(prev => ({ ...prev, financials: estimates }));
        setEstimateSuccess(true);
        setTimeout(() => setEstimateSuccess(false), 3000);
    } finally {
        setIsEstimating(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const importedData = await parseFinancialFile(file);
      setFormData(prev => ({ ...prev, financials: { ...prev.financials, ...importedData } }));
      alert(`Import Successful!`);
    } catch (error) {
      alert("Could not import file.");
    } finally {
      setIsImporting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateBusinessData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    onComplete(formData);
  };

  const inputClass = "w-full p-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all shadow-sm input-premium";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative">
      {sectorToast && (
        <div className="absolute top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-bold animate-fade-in flex items-center gap-2">
           <Check size={14} className="text-emerald-400" /> {sectorToast}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="flex justify-between items-start mb-4">
             <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                {step === 1 && t('step1_title', lang)}
                {step === 2 && t('step2_title', lang)}
                {step === 3 && t('step3_title', lang)}
                {step === 4 && t('step4_title', lang)}
             </h2>
             <select 
                value={formData.language} 
                onChange={(e) => updateField('language', e.target.value as Language)}
                className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500"
              >
                <option value="en" className="text-slate-900">English</option>
                <option value="hi" className="text-slate-900">हिंदी</option>
                <option value="bilingual" className="text-slate-900">Bilingual</option>
             </select>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
            ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-10" autoComplete="off">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className={labelClass}>{t('report_type', lang)}</label>
                <select className={inputClass} value={formData.reportType} onChange={e => updateField('reportType', e.target.value)}>
                  <option value="DPR">Detailed Project Report (DPR)</option>
                  <option value="BPR">Business Project Report (BPR)</option>
                </select>
              </div>
              <div>
                 <label className={labelClass}>{t('industry_sector', lang)}</label>
                 <select className={inputClass} value={formData.sector || ''} onChange={handleSectorChange}>
                    <option value="">Select Industry...</option>
                    {Object.entries(SECTOR_TEMPLATES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
                 </select>
              </div>
              <div>
                <label className={labelClass}>{t('business_structure', lang)}</label>
                <select className={inputClass} value={formData.entityType} onChange={e => updateField('entityType', e.target.value)}>
                  {Object.values(EntityType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                 <label className={labelClass}>{t('govt_scheme', lang)}</label>
                 <select className={inputClass} value={formData.scheme} onChange={e => updateField('scheme', e.target.value)}>
                    {Object.values(GovtScheme).map(scheme => <option key={scheme} value={scheme}>{scheme}</option>)}
                 </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t('entity_name', lang)}</label>
                <input type="text" required className={`${inputClass} text-lg font-serif`} placeholder="e.g. Acme Industries Pvt Ltd" value={formData.entityName} onChange={e => updateField('entityName', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t('location', lang)}</label>
                <input type="text" required className={inputClass} placeholder="City, State" value={formData.location} onChange={e => updateField('location', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition font-bold shadow-lg shadow-slate-900/20">{t('next', lang)} <ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
             <div>
                <label className={labelClass}>{t('promoter_name', lang)}</label>
                <input type="text" required className={inputClass} value={formData.promoterName} onChange={e => updateField('promoterName', e.target.value)} />
             </div>
             <div>
                <div className="flex justify-between items-center mb-1"><label className={labelClass}>{t('background_experience', lang)}</label></div>
                <textarea required rows={6} className={inputClass} placeholder="List education and experience..." value={formData.promoterExperience} onChange={e => updateField('promoterExperience', e.target.value)} />
             </div>
             <div className="flex justify-between pt-6">
               <button type="button" onClick={prevStep} className="text-slate-500 font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:text-slate-800"><ChevronLeft size={16} /> {t('back', lang)}</button>
               <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition font-bold shadow-lg shadow-slate-900/20">{t('next', lang)} <ChevronRight size={18} /></button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
              <div>
                <label className={labelClass}>{t('business_description', lang)}</label>
                <textarea required rows={4} className={inputClass} placeholder="Describe product & process..." value={formData.businessDescription} onChange={e => updateField('businessDescription', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>{t('objectives', lang)}</label>
                <textarea required rows={3} className={inputClass} value={formData.projectObjectives} onChange={e => updateField('projectObjectives', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>{t('target_market', lang)}</label>
                <textarea required rows={3} className={inputClass} value={formData.targetMarket} onChange={e => updateField('targetMarket', e.target.value)} />
              </div>
              <div className="flex justify-between pt-6">
                <button type="button" onClick={prevStep} className="text-slate-500 font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:text-slate-800"><ChevronLeft size={16} /> {t('back', lang)}</button>
                <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition font-bold shadow-lg shadow-slate-900/20">{t('next', lang)} <ChevronRight size={18} /></button>
              </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <div className="flex gap-2">
                   <label className="flex items-center gap-2 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      {isImporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} {t('import_financials', lang)}
                      <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleImportFile} />
                   </label>
                   <button type="button" onClick={handleAutoFill} disabled={isEstimating} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg">
                      {isEstimating ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} {t('auto_fill', lang)}
                   </button>
                </div>
             </div>

             {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-3 text-xs text-red-600">
                   <AlertCircle size={16} className="shrink-0" />
                   <div>{validationErrors.map((e, i) => <div key={i}>{e}</div>)}</div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Investment</h4>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className={labelClass}>Land</label><input type="number" className={inputClass} value={formData.financials.landCost} onChange={e => updateFinancial('landCost', parseFloat(e.target.value))} /></div>
                           <div><label className={labelClass}>Building</label><input type="number" className={inputClass} value={formData.financials.buildingCost} onChange={e => updateFinancial('buildingCost', parseFloat(e.target.value))} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className={labelClass}>Machinery</label><input type="number" className={inputClass} value={formData.financials.machineryCost} onChange={e => updateFinancial('machineryCost', parseFloat(e.target.value))} /></div>
                           <div><label className={labelClass}>Working Capital</label><input type="number" className={inputClass} value={formData.financials.workingCapitalCost} onChange={e => updateFinancial('workingCapitalCost', parseFloat(e.target.value))} /></div>
                        </div>
                        <div><label className={labelClass}>Other Assets</label><input type="number" className={inputClass} value={formData.financials.otherCost} onChange={e => updateFinancial('otherCost', parseFloat(e.target.value))} /></div>
                        <div className="flex justify-between items-center pt-2 font-bold text-slate-900">
                            <span>Total</span>
                            <span>₹ {formData.financials.projectCost.toFixed(2)}</span>
                        </div>
                     </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Means of Finance</h4>
                     <div className="space-y-4">
                        <div><label className={labelClass}>{t('loan_required', lang)}</label><input type="number" className={inputClass} value={formData.financials.loanRequired} onChange={e => updateFinancial('loanRequired', parseFloat(e.target.value))} /></div>
                        <div><label className={labelClass}>{t('own_contribution', lang)}</label><input type="number" className={inputClass} value={formData.financials.ownContribution} onChange={e => updateFinancial('ownContribution', parseFloat(e.target.value))} /></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className={labelClass}>{t('interest_rate', lang)}</label><input type="number" className={inputClass} value={formData.financials.interestRate} onChange={e => updateFinancial('interestRate', parseFloat(e.target.value))} /></div>
                           <div><label className={labelClass}>Tenure (Yrs)</label><input type="number" className={inputClass} value={formData.financials.loanTenure} onChange={e => updateFinancial('loanTenure', parseFloat(e.target.value))} /></div>
                        </div>
                     </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-3 gap-6">
                <div><label className={labelClass}>{t('revenue_y1', lang)}</label><input type="number" className={inputClass} value={formData.financials.year1Revenue} onChange={e => updateFinancial('year1Revenue', parseFloat(e.target.value))} /></div>
                <div><label className={labelClass}>{t('growth_rate', lang)}</label><input type="number" className={inputClass} value={formData.financials.revenueGrowthRate} onChange={e => updateFinancial('revenueGrowthRate', parseFloat(e.target.value))} /></div>
                <div><label className={labelClass}>{t('net_margin', lang)}</label><input type="number" className={inputClass} value={formData.financials.netMargin} onChange={e => updateFinancial('netMargin', parseFloat(e.target.value))} /></div>
             </div>

             <div className="flex justify-between pt-8 border-t border-slate-100">
               <button type="button" onClick={prevStep} className="text-slate-500 font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:text-slate-800"><ChevronLeft size={16} /> {t('back', lang)}</button>
               <button type="submit" className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg transition font-bold shadow-lg shadow-amber-600/20">{t('generate_report', lang)} <ChevronRight size={18} /></button>
             </div>
          </div>
        )}
      </form>
    </div>
  );
};