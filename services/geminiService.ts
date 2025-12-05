import { GoogleGenAI, Type } from "@google/genai";
import { BusinessData, ReportContent, YearProjection, FinancialMetrics, FinancialInputs, ReportMetadata, Language, AIConfig } from "../types";

// ARCHITECTURE CONFIGURATION
// Paranoid-safe check for environment variables to prevent startup crashes.
const getEnvVar = (name: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[name] || "";
  }
  return "";
};

const BACKEND_URL: string = getEnvVar('VITE_APP_BACKEND_URL');
const USE_SECURE_BACKEND = !!BACKEND_URL;

// --- UNIVERSAL SYSTEM PROMPTS ---
const SYSTEM_INSTRUCTION_FINANCIAL = `
CRITICAL ROLE DEFINITION:
You are FinPro AI, a Senior Chartered Accountant (CA) and Investment Banker specializing in Indian MSME Project Finance.
You are NOT a creative writer, storyteller, or novelist. You DO NOT write fiction.
Your ONLY output is strictly professional, clinical, and banking-compliant financial documentation.

STRICT GUIDELINES:
1. Tone: Highly Formal, Dry, Objective, and Bank-Ready.
2. Context: Reserve Bank of India (RBI) guidelines, Indian Banking norms, and MSME Govt Schemes.
3. Language: Use professional financial terminology (e.g., "Revenue Operations," "Capital Expenditure," "DSCR").
4. FILTER: If user input contains casual, slang, or non-business text, REWRITE it to be professional.
5. PROHIBITED: Do not use flowery, emotive, or sensory language. Do not tell a story. Just report the facts.

NEGATIVE CONSTRAINTS (ABSOLUTE PROHIBITION):
- DO NOT mention "plots", "characters", "scenes", "dialogue", "tension", or "romance".
- DO NOT use words like "sensual", "erotic", "arousal", "climax", "intimacy", "story", "narrative".
- If the input is ambiguous or nonsensical, generate a standard description for a "General Trading Business" or "Manufacturing Unit".
`;

// --- SCHEMAS (Universal) ---
const financialEstimatesSchema = {
  type: Type.OBJECT,
  properties: {
    landCost: { type: Type.NUMBER },
    buildingCost: { type: Type.NUMBER },
    machineryCost: { type: Type.NUMBER },
    workingCapitalCost: { type: Type.NUMBER },
    otherCost: { type: Type.NUMBER },
    projectCost: { type: Type.NUMBER },
    ownContribution: { type: Type.NUMBER },
    loanRequired: { type: Type.NUMBER },
    year1Revenue: { type: Type.NUMBER },
    revenueGrowthRate: { type: Type.NUMBER },
    netMargin: { type: Type.NUMBER }
  },
  required: ["landCost", "buildingCost", "machineryCost", "workingCapitalCost", "otherCost", "projectCost", "ownContribution", "loanRequired", "year1Revenue", "revenueGrowthRate", "netMargin"]
};

const reportContentSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING },
    companyProfile: { type: Type.STRING },
    promoterBackground: { type: Type.STRING },
    marketAnalysis: { type: Type.STRING },
    technicalAnalysis: { type: Type.STRING },
    marketingStrategy: { type: Type.STRING },
    swotAnalysis: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"],
    },
    financialCommentary: { type: Type.STRING },
    riskMitigation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          mitigation: { type: Type.STRING },
        },
        required: ["risk", "mitigation"],
      },
    },
    conclusion: { type: Type.STRING },
    schemeAnalysis: { type: Type.STRING },
    ratioInterpretation: { type: Type.STRING },
    implementationTimeline: { type: Type.STRING },
  },
  required: ["executiveSummary", "companyProfile", "promoterBackground", "marketAnalysis", "technicalAnalysis", "marketingStrategy", "swotAnalysis", "financialCommentary", "riskMitigation", "conclusion", "schemeAnalysis", "ratioInterpretation", "implementationTimeline"],
};

// --- HELPER UTILS ---
const getAIConfig = (): AIConfig => {
  const stored = localStorage.getItem('finstruct_ai_config');
  if (stored) return JSON.parse(stored);
  return { provider: 'gemini', apiKey: '', modelId: 'gemini-2.5-flash' };
};

// --- BACKEND PROXY ADAPTER ---
async function callSecureBackend(config: AIConfig, prompt: string, schema?: object): Promise<any> {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");

    const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Api-Key': config.apiKey,
            'X-Provider': config.provider,
        },
        body: JSON.stringify({
            prompt,
            modelId: config.modelId,
            schema,
            baseUrl: config.baseUrl
        })
    });

    if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`Secure Backend Error (${res.status}): ${errorBody.error || 'Unknown error'}`);
    }
    
    const data = await res.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || data.text || "{}";
    return JSON.parse(textContent);
}


// --- MAIN AI GATEWAY ---
async function callAI(prompt: string, schema: object | undefined, taskType: string): Promise<{ data: any, meta: Partial<ReportMetadata> }> {
    const startTime = Date.now();
    const config = getAIConfig();
    
    if (!config.apiKey && config.provider !== 'custom') {
        const err = new Error("API Key Missing. Configure Intelligence Hub.");
        (err as any).code = 'NO_API_KEY';
        throw err;
    }

    let resultData;

    try {
        if (USE_SECURE_BACKEND) {
            resultData = await callSecureBackend(config, prompt, schema);
        } else {
            // Direct client-side calls (less secure, for local dev)
            const ai = new GoogleGenAI({ apiKey: config.apiKey });
            const res = await ai.models.generateContent({
                model: config.modelId,
                contents: prompt,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    systemInstruction: SYSTEM_INSTRUCTION_FINANCIAL,
                    temperature: 0.1
                }
            });
            resultData = JSON.parse(res.text || "{}");
        }
        
        const duration = Date.now() - startTime;
        
        return {
            data: resultData,
            meta: {
                modelName: config.modelId,
                apiVersion: config.provider,
                attemptCount: 1,
                generatedAt: new Date().toISOString(),
                auditLog: {
                    promptUsed: USE_SECURE_BACKEND ? "REDACTED (Server-Side)" : prompt,
                    modelConfig: `${config.provider}/${config.modelId}`,
                    generationTimeMs: duration
                }
            }
        };

    } catch (e) {
        console.error("AI Gateway Error", e);
        throw e;
    }
}

// --- PUBLIC METHODS ---

export const enhanceBusinessField = async (label: string, roughInput: string, context: BusinessData): Promise<string> => {
    try {
        const config = getAIConfig();
        if(!config.apiKey && config.provider !== 'custom') {
            const err = new Error("API Key Missing.");
            (err as any).code = 'NO_API_KEY';
            throw err;
        }
        
        const prompt = `Rewrite '${roughInput}' for a formal business report section '${label}'. Entity: ${context.entityName}. Professional tone only. JSON Output: {"text": "..."}`;
        
        const { data } = await callAI(prompt, undefined, 'ENHANCE');
        return data.text || roughInput;
    } catch(e) {
        // Re-throw specific errors for the UI to catch
        if ((e as any).code === 'NO_API_KEY') throw e;
        // Otherwise, fail gracefully for this non-critical feature
        console.error("Enhance field failed:", e);
        return roughInput;
    }
};

export const getFinancialEstimates = async (description: string, location: string): Promise<FinancialInputs> => {
    const prompt = `Estimate financial parameters for: ${description} in ${location}. Return JSON matching schema.`;
    const { data } = await callAI(prompt, financialEstimatesSchema, 'ESTIMATE');
    
    return {
        landCost: data.landCost || 0,
        buildingCost: data.buildingCost || 5,
        machineryCost: data.machineryCost || 10,
        workingCapitalCost: data.workingCapitalCost || 5,
        otherCost: data.otherCost || 2,
        projectCost: data.projectCost || 22,
        ownContribution: data.ownContribution || 5.5,
        loanRequired: data.loanRequired || 16.5,
        interestRate: 11,
        year1Revenue: data.year1Revenue || 40,
        revenueGrowthRate: data.revenueGrowthRate || 15,
        netMargin: data.netMargin || 10,
        incomeTaxRate: 25,
        depreciationBuilding: 5,
        depreciationMachinery: 15,
        depreciationOther: 10,
        loanTenure: 7
    };
};

export const generateReportContent = async (
  data: BusinessData, 
  projections: YearProjection[], 
  metrics: FinancialMetrics
): Promise<{ content: ReportContent, meta: ReportMetadata }> => {
    
    const financialSummary = `Cost: ${data.financials.projectCost}, Rev: ${projections[0].revenue}, DSCR: ${metrics.avgDscr}`;
    const prompt = `Generate DPR Content for ${data.entityName}. Description: ${data.businessDescription}. Financials: ${financialSummary}. Language: ${data.language}. Return strictly JSON.`;
    
    const { data: res, meta } = await callAI(prompt, reportContentSchema, 'REPORT');

    const content = {
        executiveSummary: res.executiveSummary || "Generated Report...",
        companyProfile: res.companyProfile || "Company details...",
        promoterBackground: res.promoterBackground || "Promoter details...",
        marketAnalysis: res.marketAnalysis || "Market analysis...",
        technicalAnalysis: res.technicalAnalysis || "Technical details...",
        marketingStrategy: res.marketingStrategy || "Marketing strategy...",
        swotAnalysis: res.swotAnalysis || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        financialCommentary: res.financialCommentary || "Financial overview...",
        riskMitigation: res.riskMitigation || [],
        conclusion: res.conclusion || "Conclusion...",
        schemeAnalysis: res.schemeAnalysis || "",
        ratioInterpretation: res.ratioInterpretation || "",
        implementationTimeline: res.implementationTimeline || ""
    };

    return { content, meta: meta as ReportMetadata };
};