
import { GoogleGenAI, Schema, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { BusinessData, ReportContent, YearProjection, FinancialMetrics, FinancialInputs, ReportMetadata, Language, AIConfig } from "../types";

// ARCHITECTURE CONFIGURATION
// Since we now support BYOK (Bring Your Own Key), the backend proxy is optional/configurable.
// For the purpose of this implementation, we default to direct client-side calls if no backend URL is set in the code.
const USE_SECURE_BACKEND = false; 
const BACKEND_URL: string = ""; 

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
// Note: We use the Google GenAI Schema format as the source of truth,
// but we will convert/stringify it for OpenAI/Anthropic providers.

const financialEstimatesSchema: Schema = {
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

const reportContentSchema: Schema = {
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

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAIConfig = (): AIConfig => {
  const stored = localStorage.getItem('finstruct_ai_config');
  if (stored) return JSON.parse(stored);
  // Fallback to legacy
  const legacyKey = localStorage.getItem('user_gemini_key') || process.env.API_KEY || '';
  return {
    provider: 'gemini',
    apiKey: legacyKey,
    modelId: 'gemini-2.5-flash'
  };
};

// --- ADAPTERS ---

// 1. GEMINI ADAPTER (Google SDK)
async function callGeminiAdapter(config: AIConfig, prompt: string, schema?: Schema): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const res = await ai.models.generateContent({
        model: config.modelId,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { 
            responseMimeType: "application/json",
            responseSchema: schema,
            systemInstruction: SYSTEM_INSTRUCTION_FINANCIAL,
            temperature: 0.1,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
            ]
        }
    });
    return JSON.parse(res.text || "{}");
}

// 2. OPENAI-COMPATIBLE ADAPTER (Works for OpenAI, Grok, DeepSeek, Local Ollama)
async function callOpenAICompatibleAdapter(config: AIConfig, prompt: string, schema?: Schema): Promise<any> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const url = `${baseUrl}/chat/completions`;
    
    // Construct System Message
    const messages = [
        { role: "system", content: SYSTEM_INSTRUCTION_FINANCIAL },
        { role: "user", content: prompt }
    ];

    // Handle JSON Schema for OpenAI (Simplified for compatibility)
    // We append the schema instruction to the system prompt to ensure compliance across different models
    // as strict JSON mode varies by provider.
    if (schema) {
        messages[0].content += "\n\nCRITICAL: Output MUST be valid JSON matching this structure exactly. Do not wrap in markdown blocks.\n" + JSON.stringify(schema, null, 2);
    }

    const payload = {
        model: config.modelId,
        messages: messages,
        temperature: 0.2,
        // response_format: { type: "json_object" } // Only supported by some, safer to prompt-engineer json
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`AI Provider Error (${res.status}): ${err}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || "{}";
    
    // Cleanup markdown code blocks if present
    const cleanJson = content.replace(/```json\n?|```/g, '');
    return JSON.parse(cleanJson);
}

// 3. ANTHROPIC ADAPTER
async function callAnthropicAdapter(config: AIConfig, prompt: string, schema?: Schema): Promise<any> {
    // Note: Calling Anthropic directly from browser usually fails due to CORS unless using a proxy.
    // We implement the standard fetch here assuming user has a proxy or browser extension, or we route via backend.
    
    const url = 'https://api.anthropic.com/v1/messages';
    
    let finalSystem = SYSTEM_INSTRUCTION_FINANCIAL;
    if (schema) {
        finalSystem += "\n\nCRITICAL: Output MUST be valid JSON matching this structure exactly.\n" + JSON.stringify(schema, null, 2);
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'dangerously-allow-browser': 'true' // Required for client-side demo, strictly strictly for dev
        },
        body: JSON.stringify({
            model: config.modelId,
            max_tokens: 4000,
            system: finalSystem,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic Error (${res.status}): ${err}`);
    }

    const json = await res.json();
    const text = json.content?.[0]?.text || "{}";
    const cleanJson = text.replace(/```json\n?|```/g, '');
    return JSON.parse(cleanJson);
}

// --- MAIN AI GATEWAY ---

async function callAI(prompt: string, schema: Schema | undefined, taskType: string): Promise<{ data: any, meta: Partial<ReportMetadata> }> {
    const startTime = Date.now();
    const config = getAIConfig();
    
    if (!config.apiKey && config.provider !== 'custom') { // Custom local might not need key
        throw new Error("API Key Missing. Configure Intelligence Hub.");
    }

    let resultData;

    try {
        switch (config.provider) {
            case 'gemini':
                resultData = await callGeminiAdapter(config, prompt, schema);
                break;
            case 'openai':
            case 'custom': // Handles Grok, Ollama, etc via OpenAI compatible endpoint
                resultData = await callOpenAICompatibleAdapter(config, prompt, schema);
                break;
            case 'anthropic':
                resultData = await callAnthropicAdapter(config, prompt, schema);
                break;
            default:
                throw new Error("Unknown AI Provider");
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
                    promptUsed: prompt,
                    modelConfig: `${config.provider}/${config.modelId}`,
                    generationTimeMs: duration
                }
            }
        };

    } catch (e) {
        console.error("AI Gateway Error", e);
        // Retry logic for Gemini specifically or general error
        return { data: {}, meta: { generatedAt: new Date().toISOString() } };
    }
}

// --- PUBLIC METHODS ---

export const enhanceBusinessField = async (label: string, roughInput: string, context: BusinessData): Promise<string> => {
    // Check if key exists
    const config = getAIConfig();
    if(!config.apiKey && config.provider !== 'custom') return roughInput;
    
    const prompt = `Rewrite '${roughInput}' for a formal business report section '${label}'. Entity: ${context.entityName}. Professional tone only. JSON Output: {"text": "..."}`;
    
    try {
        const { data } = await callAI(prompt, undefined, 'ENHANCE');
        return data.text || roughInput; // Fallback if direct string
    } catch(e) { return roughInput; }
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
