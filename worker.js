
// This is your Cloudflare Worker script.
// It acts as a secure, multi-provider AI backend for your FinPro application.

// --- INTELLECTUAL PROPERTY PROTECTION ---
// This is your "Secret Sauce". It's stored securely here and never exposed to the client.
const SYSTEM_INSTRUCTION_FINANCIAL = `
CRITICAL ROLE DEFINITION:
You are FinPro AI, a Senior Chartered Accountant (CA) and Investment Banker specializing in Indian MSME Project Finance.
You are NOT a creative writer, storyteller, or novelist. You DO NOT write fiction.
Your ONLY output is strictly professional, clinical, and banking-compliant financial documentation in JSON format.

STRICT GUIDELINES:
1. Tone: Highly Formal, Dry, Objective, and Bank-Ready.
2. Context: Adhere to Reserve Bank of India (RBI) guidelines and Indian Banking norms.
3. Language: Use professional financial terminology.
4. FILTER: If user input is casual or non-business related, REWRITE it to be professional.
5. PROHIBITED: Do not use flowery, emotive, or sensory language. Do not tell a story. Just report the facts.
`;

// --- MAIN WORKER LOGIC ---
export default {
  async fetch(request) {
    // 1. Handle CORS Pre-flight requests for security
    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    // 2. We only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // 3. Extract user credentials and task details from headers and body
    const userApiKey = request.headers.get("X-User-Api-Key");
    const provider = request.headers.get("X-Provider"); // 'gemini', 'openai', 'anthropic', 'custom'

    if (!userApiKey) {
      return new Response("Error: Missing User API Key.", { status: 401 });
    }
    if (!provider) {
      return new Response("Error: Missing AI Provider header.", { status: 400 });
    }

    const { prompt, modelId, schema, baseUrl } = await request.json();

    let aiResponse;
    try {
      // 4. Route the request to the appropriate AI provider's adapter
      switch (provider) {
        case 'gemini':
          aiResponse = await callGemini(userApiKey, prompt, modelId, schema);
          break;
        case 'openai':
        case 'custom':
          aiResponse = await callOpenAICompatible(userApiKey, prompt, modelId, schema, baseUrl);
          break;
        case 'anthropic':
          aiResponse = await callAnthropic(userApiKey, prompt, modelId, schema);
          break;
        default:
          return new Response("Error: Unsupported AI Provider.", { status: 400 });
      }

      // 5. Return the successful response from the AI provider to the frontend
      return new Response(JSON.stringify(aiResponse), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });

    } catch (error) {
      // 6. Handle any errors during the process
      console.error(`Error calling ${provider} API:`, error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    }
  },
};

// --- ADAPTER FUNCTIONS FOR EACH AI PROVIDER ---

async function callGemini(apiKey, userPrompt, modelId, schema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "user", parts: [{ text: SYSTEM_INSTRUCTION_FINANCIAL }] },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function callOpenAICompatible(apiKey, userPrompt, modelId, schema, baseUrl = 'https://api.openai.com/v1') {
  const url = `${baseUrl}/chat/completions`;
  let systemContent = SYSTEM_INSTRUCTION_FINANCIAL;
  if (schema) {
    systemContent += `\n\nCRITICAL: Output MUST be valid JSON matching this schema:\n${JSON.stringify(schema)}`;
  }

  const payload = {
    model: modelId,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI-Compatible API Error (${response.status}): ${errorText}`);
  }
  
  // OpenAI wraps the content differently than Gemini, so we normalize it
  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content || '{}';
  return { text: textContent }; // Simulate Gemini's { text: "..." } structure
}

async function callAnthropic(apiKey, userPrompt, modelId, schema) {
  const url = 'https://api.anthropic.com/v1/messages';
  let systemContent = SYSTEM_INSTRUCTION_FINANCIAL;
  if (schema) {
    systemContent += `\n\nCRITICAL: Output MUST be valid JSON matching this schema:\n${JSON.stringify(schema)}\nRespond ONLY with the JSON object.`;
  }

  const payload = {
    model: modelId,
    system: systemContent,
    messages: [{ role: "user", content: userPrompt }],
    max_tokens: 4096,
    temperature: 0.1,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API Error (${response.status}): ${errorText}`);
  }
  
  // Anthropic also wraps content differently
  const data = await response.json();
  const textContent = data.content?.[0]?.text || '{}';
  return { text: textContent }; // Simulate Gemini's { text: "..." } structure
}

// --- CORS UTILITY FUNCTIONS ---

const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-User-Api-Key, X-Provider",
});

function handleOptions() {
  return new Response(null, {
    headers: corsHeaders(),
  });
}
