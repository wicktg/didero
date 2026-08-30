export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const AGENT_MODELS = {
  primary: "qwen/qwen3.8-27b",
} as const;

export const AGENT_API_KEYS: Record<number, string> = {
  0: "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",
  1: "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",
};

export interface AgentAction {
  type: string;
  payload?: Record<string, any>;
  [key: string]: any;
}

export interface AgentDecisionResponse {
  thought: string;
  action: AgentAction;
  rawResponse?: string;
  error?: string;
}

/**
 * Returns the designated Groq API key for an agent ID (0 or 1).
 */
export function getApiKeyForAgent(agentId: number): string {
  if (agentId in AGENT_API_KEYS) {
    return AGENT_API_KEYS[agentId];
  }
  return AGENT_API_KEYS[0];
}

/**
 * Builds the system prompt enforcing structured JSON responses with thought & action.
 */
export function buildAgentSystemPrompt(): string {
  return `You are an elite, highly strategic Monopoly AI Agent competing in a head-to-head match.
Analyze the current game state, finances, board position, opponent threats, and legal actions.

You MUST reply with a strictly valid JSON object ONLY, formatted as follows:
{
  "thought": "<Strategic reasoning explaining your tactical logic and why you chose this action>",
  "action": {
    "type": "<ONE_OF_THE_LEGAL_ACTION_TYPES>",
    "payload": { ... } // optional payload if the action requires parameters (e.g. propertyIndex, amount, etc.)
  }
}

Do NOT include any markdown code fences, extra text, or formatting outside of the single JSON object.`;
}

/**
 * Requests an autonomous decision from Groq using the agent's dedicated API key and qwen/qwen3.8-27b.
 */
export async function requestAgentDecision(
  agentId: number,
  stateContext: any,
  options?: { apiKeyOverride?: string; timeoutMs?: number; model?: string },
): Promise<AgentDecisionResponse> {
  const apiKey = options?.apiKeyOverride || getApiKeyForAgent(agentId);
  const model = options?.model || AGENT_MODELS.primary;
  const timeoutMs = options?.timeoutMs || 15000;

  const systemPrompt = buildAgentSystemPrompt();
  const userContent =
    typeof stateContext === "string"
      ? stateContext
      : JSON.stringify(stateContext, null, 2);

  const requestBody = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let rawResponseText = "";

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let errorMessage = `Groq API Error (HTTP ${response.status}): ${response.statusText}`;
      if (response.status === 429) {
        errorMessage =
          "Groq API Rate Limit Exceeded (HTTP 429). Please wait before retrying.";
      }
      return {
        thought: `API request failed with status ${response.status}. Defaulting to safe fallback.`,
        action: { type: "SAFE_FALLBACK" },
        rawResponse: errorText,
        error: errorMessage,
      };
    }

    const data = await response.json();
    const messageContent = data?.choices?.[0]?.message?.content;
    rawResponseText =
      typeof messageContent === "string"
        ? messageContent
        : JSON.stringify(messageContent);

    if (!messageContent) {
      return {
        thought: "Empty response content received from agent model.",
        action: { type: "SAFE_FALLBACK" },
        rawResponse: rawResponseText,
        error: "Missing choices[0].message.content in API response",
      };
    }

    let parsed: any;
    try {
      parsed =
        typeof messageContent === "object"
          ? messageContent
          : JSON.parse(messageContent);
    } catch (parseError: any) {
      return {
        thought: "Failed to parse model response as valid JSON.",
        action: { type: "SAFE_FALLBACK" },
        rawResponse: rawResponseText,
        error: `JSON Parse Error: ${parseError?.message || "Invalid JSON"}`,
      };
    }

    const thought =
      typeof parsed?.thought === "string" && parsed.thought.trim().length > 0
        ? parsed.thought.trim()
        : "Executing strategic decision.";

    let action: AgentAction;
    if (typeof parsed?.action === "string") {
      action = { type: parsed.action };
    } else if (
      parsed?.action &&
      typeof parsed.action === "object" &&
      typeof parsed.action.type === "string"
    ) {
      action = parsed.action;
    } else if (typeof parsed?.type === "string") {
      action = { type: parsed.type, payload: parsed.payload };
    } else {
      action = { type: "SAFE_FALLBACK" };
    }

    return {
      thought,
      action,
      rawResponse: rawResponseText,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isAbort = err?.name === "AbortError";
    const errorMessage = isAbort
      ? `Groq API request timed out after ${timeoutMs}ms`
      : `Network Error: ${err?.message || "Failed to reach Groq API"}`;

    return {
      thought: `Agent request error: ${errorMessage}. Falling back to default engine decision.`,
      action: { type: "SAFE_FALLBACK" },
      rawResponse: rawResponseText,
      error: errorMessage,
    };
  }
}
