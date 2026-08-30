import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getApiKeyForAgent,
  requestAgentDecision,
  AGENT_MODELS,
  GROQ_API_URL,
  AGENT_API_KEYS,
  buildAgentSystemPrompt,
} from "../ai/groqClient";

describe("Groq Client & Multi-Agent Key Routing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("API Key Routing & Constants", () => {
    it("routes designated API key for Agent 1 (Player ID 0)", () => {
      const key = getApiKeyForAgent(0);
      expect(key).toBe(
        "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",
      );
      expect(AGENT_API_KEYS[0]).toBe(
        "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",
      );
    });

    it("routes designated API key for Agent 2 (Player ID 1)", () => {
      const key = getApiKeyForAgent(1);
      expect(key).toBe(
        "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",
      );
      expect(AGENT_API_KEYS[1]).toBe(
        "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",
      );
    });

    it("defaults gracefully to Agent 0 key for unrecognized IDs", () => {
      expect(getApiKeyForAgent(99)).toBe(
        "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",
      );
    });

    it("specifies correct Groq model and endpoint", () => {
      expect(AGENT_MODELS.primary).toBe("qwen/qwen3.8-27b");
      expect(GROQ_API_URL).toBe(
        "https://api.groq.com/openai/v1/chat/completions",
      );
    });

    it("formats system prompt with JSON contract", () => {
      const prompt = buildAgentSystemPrompt();
      expect(prompt).toContain("thought");
      expect(prompt).toContain("action");
      expect(prompt).toContain("JSON");
    });
  });

  describe("requestAgentDecision API Requests & Response Parsing", () => {
    it("calls Groq endpoint with model qwen/qwen3.8-27b, json_object mode, and Agent 0 key", async () => {
      const mockResponseBody = {
        id: "chatcmpl-test-0",
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: JSON.stringify({
                thought:
                  "I should purchase Mediterranean Avenue to establish early board presence and start building a brown monopoly.",
                action: {
                  type: "BUY_PROPERTY",
                  payload: { propertyIndex: 1 },
                },
              }),
            },
            finish_reason: "stop",
          },
        ],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockResponseBody,
      });
      vi.stubGlobal("fetch", fetchMock);

      const stateContext = {
        activePlayerId: 0,
        turnPhase: "LANDED_ACTION",
        myState: { money: 1500, position: 1 },
        legalActions: [{ type: "BUY_PROPERTY" }, { type: "DECLINE_BUY" }],
      };

      const result = await requestAgentDecision(0, stateContext);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, requestOptions] = fetchMock.mock.calls[0];

      expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
      expect(requestOptions.method).toBe("POST");
      expect(requestOptions.headers["Authorization"]).toBe(
        "Bearer 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",
      );
      expect(requestOptions.headers["Content-Type"]).toBe("application/json");

      const parsedBody = JSON.parse(requestOptions.body);
      expect(parsedBody.model).toBe("qwen/qwen3.8-27b");
      expect(parsedBody.response_format).toEqual({ type: "json_object" });
      expect(parsedBody.messages.length).toBe(2);
      expect(parsedBody.messages[0].role).toBe("system");
      expect(parsedBody.messages[1].role).toBe("user");

      expect(result.thought).toContain("Mediterranean Avenue");
      expect(result.action).toEqual({
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(result.error).toBeUndefined();
    });

    it("calls Groq endpoint with Agent 1 key when requesting for agentId 1", async () => {
      const mockResponseBody = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                thought:
                  "Rolling dice is the only legal action at the start of my turn.",
                action: {
                  type: "ROLL_DICE",
                },
              }),
            },
          },
        ],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockResponseBody,
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await requestAgentDecision(1, { turnPhase: "ROLL" });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, requestOptions] = fetchMock.mock.calls[0];
      expect(requestOptions.headers["Authorization"]).toBe(
        "Bearer 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",
      );

      expect(result.thought).toContain("Rolling dice");
      expect(result.action.type).toBe("ROLL_DICE");
    });

    it("handles plain action string in LLM response gracefully", async () => {
      const mockResponseBody = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                thought: "Passing auction turn to conserve cash.",
                action: "PASS_AUCTION",
              }),
            },
          },
        ],
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockResponseBody,
        }),
      );

      const result = await requestAgentDecision(0, { turnPhase: "AUCTION" });
      expect(result.thought).toBe("Passing auction turn to conserve cash.");
      expect(result.action).toEqual({ type: "PASS_AUCTION" });
    });
  });

  describe("Error Handling & Fallbacks", () => {
    it("handles 429 Rate Limit responses gracefully", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          text: async () => "Rate limit reached",
        }),
      );

      const result = await requestAgentDecision(0, { turnPhase: "ROLL" });

      expect(result.action.type).toBe("SAFE_FALLBACK");
      expect(result.error).toContain("Rate Limit Exceeded");
      expect(result.error).toContain("429");
      expect(result.thought).toContain("429");
    });

    it("handles 500 server error responses gracefully", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          text: async () => "Internal server error occurred",
        }),
      );

      const result = await requestAgentDecision(1, { turnPhase: "ROLL" });

      expect(result.action.type).toBe("SAFE_FALLBACK");
      expect(result.error).toContain("500");
    });

    it("handles network failure (fetch throws error) gracefully", async () => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockRejectedValue(new Error("Failed to fetch / Connection reset")),
      );

      const result = await requestAgentDecision(0, { turnPhase: "ROLL" });

      expect(result.action.type).toBe("SAFE_FALLBACK");
      expect(result.error).toContain("Connection reset");
      expect(result.thought).toContain("Agent request error");
    });

    it("handles malformed JSON in model response gracefully", async () => {
      const mockResponseBody = {
        choices: [
          {
            message: {
              content: "This is not JSON: { thought: unquoted, action: ...",
            },
          },
        ],
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockResponseBody,
        }),
      );

      const result = await requestAgentDecision(0, { turnPhase: "ROLL" });

      expect(result.action.type).toBe("SAFE_FALLBACK");
      expect(result.error).toContain("JSON Parse Error");
      expect(result.thought).toContain("Failed to parse model response");
      expect(result.rawResponse).toContain("This is not JSON");
    });

    it("handles missing content in response choices gracefully", async () => {
      const mockResponseBody = {
        choices: [],
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockResponseBody,
        }),
      );

      const result = await requestAgentDecision(0, { turnPhase: "ROLL" });

      expect(result.action.type).toBe("SAFE_FALLBACK");
      expect(result.error).toContain("Missing choices[0].message.content");
    });
  });
});
