
import { Language } from '../types';

type TranslationKey = 
  | 'step1_title' | 'step2_title' | 'step3_title' | 'step4_title'
  | 'entity_details' | 'promoter_details' | 'project_scope' | 'financial_overview'
  | 'report_type' | 'industry_sector' | 'business_structure' | 'govt_scheme'
  | 'entity_name' | 'location' | 'next' | 'back' | 'generate_report'
  | 'promoter_name' | 'background_experience' | 'ai_polish'
  | 'business_description' | 'objectives' | 'target_market'
  | 'project_cost' | 'loan_required' | 'own_contribution' | 'interest_rate'
  | 'revenue_y1' | 'growth_rate' | 'net_margin'
  | 'import_financials' | 'auto_fill' | 'advanced_settings';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    step1_title: 'Entity Details',
    step2_title: 'Promoter & Management',
    step3_title: 'Project Scope & Market',
    step4_title: 'Financial Overview',
    entity_details: 'Entity Details',
    promoter_details: 'Promoter & Management',
    project_scope: 'Project Scope & Market',
    financial_overview: 'Financial Overview',
    report_type: 'Report Type',
    industry_sector: 'Industry Sector',
    business_structure: 'Business Structure',
    govt_scheme: 'Government Scheme',
    entity_name: 'Registered Entity Name',
    location: 'Project Location (City, State)',
    next: 'Next',
    back: 'Back',
    generate_report: 'Generate Comprehensive Report',
    promoter_name: 'Key Promoter Name',
    background_experience: 'Background & Experience',
    ai_polish: 'AI Polish',
    business_description: 'Business Description',
    objectives: 'Specific Objectives',
    target_market: 'Target Market (India)',
    project_cost: 'Project Cost Breakdown (₹ Lakhs)',
    loan_required: 'Loan Requirement (₹ Lakhs)',
    own_contribution: 'Promoter Contribution (₹ Lakhs)',
    interest_rate: 'Expected Interest Rate (%)',
    revenue_y1: 'Year 1 Est. Revenue (₹ Lakhs)',
    growth_rate: 'Annual Growth Rate (%)',
    net_margin: 'Est. Net Profit Margin (%)',
    import_financials: 'Import Financials',
    auto_fill: 'Auto-Fill Estimates',
    advanced_settings: 'Advanced Rules'
  },
  hi: {
    step1_title: 'कंपनी का विवरण (Entity Details)',
    step2_title: 'प्रवर्तक और प्रबंधन (Promoter)',
    step3_title: 'परियोजना और बाजार (Scope)',
    step4_title: 'वित्तीय अवलोकन (Financials)',
    entity_details: 'कंपनी का विवरण',
    promoter_details: 'प्रवर्तक विवरण',
    project_scope: 'परियोजना विवरण',
    financial_overview: 'वित्तीय अवलोकन',
    report_type: 'रिपोर्ट का प्रकार',
    industry_sector: 'उद्योग क्षेत्र (Industry Sector)',
    business_structure: 'व्यापार संरचना',
    govt_scheme: 'सरकारी योजना (Govt Scheme)',
    entity_name: 'पंजीकृत इकाई का नाम',
    location: 'परियोजना का स्थान (शहर, राज्य)',
    next: 'अगला (Next)',
    back: 'पीछे (Back)',
    generate_report: 'रिपोर्ट तैयार करें (Generate)',
    promoter_name: 'मुख्य प्रवर्तक का नाम',
    background_experience: 'अनुभव और पृष्ठभूमि',
    ai_polish: 'AI सुधारें',
    business_description: 'व्यवसाय का विवरण',
    objectives: 'विशिष्ट उद्देश्य',
    target_market: 'लक्ष्य बाजार (Target Market)',
    project_cost: 'परियोजना लागत (₹ लाख)',
    loan_required: 'ऋण आवश्यकता (₹ लाख)',
    own_contribution: 'प्रवर्तक योगदान (₹ लाख)',
    interest_rate: 'ब्याज दर (%)',
    revenue_y1: 'प्रथम वर्ष की आय (₹ लाख)',
    growth_rate: 'वार्षिक वृद्धि दर (%)',
    net_margin: 'शुद्ध लाभ मार्जिन (%)',
    import_financials: 'फाइल अपलोड करें',
    auto_fill: 'स्वतः अनुमान लगाएं',
    advanced_settings: 'उन्नत नियम'
  },
  bilingual: {
    step1_title: 'Entity Details / कंपनी विवरण',
    step2_title: 'Promoter / प्रवर्तक',
    step3_title: 'Scope / परियोजना',
    step4_title: 'Financials / वित्तीय',
    entity_details: 'Entity Details / विवरण',
    promoter_details: 'Promoter / प्रवर्तक',
    project_scope: 'Scope / दायरा',
    financial_overview: 'Financials / वित्तीय',
    report_type: 'Report Type / रिपोर्ट प्रकार',
    industry_sector: 'Sector / उद्योग',
    business_structure: 'Structure / संरचना',
    govt_scheme: 'Scheme / योजना',
    entity_name: 'Entity Name / नाम',
    location: 'Location / स्थान',
    next: 'Next / अगला',
    back: 'Back / पीछे',
    generate_report: 'Generate Report / रिपोर्ट बनाएं',
    promoter_name: 'Promoter Name / नाम',
    background_experience: 'Experience / अनुभव',
    ai_polish: 'AI Polish',
    business_description: 'Description / विवरण',
    objectives: 'Objectives / उद्देश्य',
    target_market: 'Target Market / बाजार',
    project_cost: 'Project Cost / लागत',
    loan_required: 'Loan / ऋण',
    own_contribution: 'Contribution / योगदान',
    interest_rate: 'Interest Rate / ब्याज',
    revenue_y1: 'Revenue Y1 / आय',
    growth_rate: 'Growth / वृद्धि',
    net_margin: 'Net Margin / मार्जिन',
    import_financials: 'Import / आयात',
    auto_fill: 'Auto-Fill / स्वतः भरें',
    advanced_settings: 'Advanced / उन्नत'
  }
};

export const t = (key: TranslationKey, lang: Language): string => {
  return translations[lang][key] || translations['en'][key];
};
