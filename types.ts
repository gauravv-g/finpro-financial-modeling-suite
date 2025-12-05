
export type UserMode = 'business' | 'professional';
export type PlanType = 'free' | 'pro';
export type Language = 'en' | 'hi' | 'bilingual';

// --- AI CONFIGURATION ---
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string; // Optional override (e.g., https://api.groq.com/openai/v1)
  modelId: string;  // e.g., 'gpt-4-turbo', 'claude-3-opus'
}

export enum EntityType {
  PROPRIETORSHIP = 'Proprietorship',
  PARTNERSHIP = 'Partnership Firm',
  LLP = 'LLP',
  PVT_LTD = 'Private Limited',
  LTD = 'Public Limited',
  OPC = 'One Person Company'
}

export enum GovtScheme {
  NONE = 'None (General Bank Loan)',
  PMEGP = 'PMEGP (Prime Minister Employment Generation Programme)',
  MUDRA = 'PMMY (Mudra Loan)',
  CGTMSE = 'CGTMSE (Collateral Free)',
  STANDUP_INDIA = 'Stand-Up India',
  STARTUP_INDIA = 'Startup India (Tax Benefits)'
}

export interface IPAsset {
  id: string;
  type: 'Certification' | 'Trademark' | 'Patent' | 'Copyright' | 'License';
  name: string;
  status: 'Obtained' | 'Applied';
  image?: string; // base64
}

export interface FinancialInputs {
  landCost: number;
  buildingCost: number;
  machineryCost: number;
  workingCapitalCost: number;
  otherCost: number;
  projectCost: number; // Derived total
  
  ownContribution: number;
  loanRequired: number;
  
  interestRate: number;
  year1Revenue: number;
  revenueGrowthRate: number;
  netMargin: number; // Est Net Profit %

  // Configurable Rules / Assumptions
  incomeTaxRate: number;        // Default 25%
  depreciationBuilding: number; // Default 5%
  depreciationMachinery: number;// Default 15%
  depreciationOther: number;    // Default 10%
  loanTenure: number;           // Default 7 Years
}

export interface BusinessData {
  reportType: string;
  language: Language;
  entityName: string;
  entityType: EntityType;
  sector?: string;
  scheme: GovtScheme;
  location: string;
  promoterName: string;
  promoterExperience: string;
  businessDescription: string;
  projectObjectives: string;
  targetMarket: string;
  financials: FinancialInputs;
  ipAssets: IPAsset[];
  logo?: string;
}

export interface YearProjection {
  year: number;
  revenue: number;
  expense: number;
  ebitda: number;
  interest: number;
  depreciation: number;
  pbt: number;
  tax: number;
  pat: number;
  cashFlow: number;
  dscr: number;
  
  // Balance Sheet Items
  shareCapital: number;
  reserves: number;
  longTermLoan: number;
  totalLiabilities: number;
  
  netFixedAssets: number;
  currentAssets: number;
  totalAssets: number;
}

export interface AmortizationEntry {
  year: number;
  openingBalance: number;
  interest: number;
  principal: number;
  closingBalance: number;
}

export interface WorkingCapitalAssessment {
  year: number;
  inventory: number;
  receivables: number;
  payables: number;
  netWorkingCapital: number;
  bankFinance: number;
}

export interface BreakEvenPoint {
  fixedCost: number;
  variableCostPerUnit: number;
  bepRevenue: number;
  bepPercentage: number;
}

export interface FinancialMetrics {
  irr: number;
  npv: number;
  avgDscr: number;
  paybackPeriod: number;
  roi: number;
}

export interface ReportContent {
  executiveSummary: string;
  companyProfile: string;
  promoterBackground: string;
  marketAnalysis: string;
  technicalAnalysis: string;
  marketingStrategy: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  financialCommentary: string;
  riskMitigation: { risk: string; mitigation: string }[];
  conclusion: string;
  schemeAnalysis?: string;
  ratioInterpretation: string;
  implementationTimeline?: string;
}

export interface CADetails {
  caName: string;
  firmName: string;
  membershipNo: string;
  frn: string;
  location: string;
  date: string;
  udin?: string;
}

export interface AuditLog {
  promptUsed: string;
  modelConfig: string;
  safetyRatings?: string[];
  generationTimeMs?: number;
}

export interface ReportMetadata {
  modelName: string;
  apiVersion: string;
  attemptCount: number;
  generatedAt: string;
  auditLog?: AuditLog;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFlag {
  id: string;
  level: RiskLevel;
  metric: string;
  value: string;
  message: string;
}

export interface FullReport {
  data: BusinessData;
  projections: YearProjection[];
  metrics: FinancialMetrics;
  amortization: AmortizationEntry[];
  workingCapital: WorkingCapitalAssessment[];
  breakEven: BreakEvenPoint;
  content: ReportContent;
  generatedAt: string;
  caDetails?: CADetails;
  meta: ReportMetadata;
  risks?: RiskFlag[];
}

// --- COLLABORATION & VERSIONING TYPES ---

export interface ReportVersion {
  id: string;
  timestamp: string;
  author: string;
  description: string;
  dataSnapshot: BusinessData;
}

export interface Comment {
  id: string;
  timestamp: string;
  author: string;
  role: 'owner' | 'ca' | 'viewer';
  text: string;
  resolved: boolean;
}

export interface SavedReport {
  id: string;
  clientName: string;
  projectCost: number;
  date: string;
  type: string;
  status: string;
  versions: ReportVersion[];
  comments: Comment[];
  collaborators: string[];
  dataSnapshot?: BusinessData;
}

export interface ScenarioResult {
  type: 'Base' | 'Optimistic' | 'Pessimistic';
  inputs: FinancialInputs;
  projections: YearProjection[];
  metrics: FinancialMetrics;
}

export interface DiagnosticMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'Pass' | 'Warning' | 'Fail';
  valueDisplay: string;
  benchmark: string;
  feedback: string;
  fixAction?: string;
}

export interface LoanReadinessReport {
  totalScore: number;
  readinessStatus: 'Approved' | 'Borderline' | 'Rejected';
  probability: number;
  metrics: DiagnosticMetric[];
  summary: string;
}
