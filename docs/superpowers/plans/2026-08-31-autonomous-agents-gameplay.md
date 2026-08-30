# Autonomous Agent-vs-Agent Gameplay Implementation Plan

> **Goal:** Transition gameplay to fully autonomous AI Agent vs AI Agent matches using Groq (`qwen/qwen3.8-27b`) with independent API keys, a strict Engine-as-Source-of-Truth validation loop, 5-second pacing, an Agent Thought & Telemetry Feed, and a top-right "Play Game" toggle.
>
> **Architecture:** A client-side agent orchestrator serializes deep surrounding state into JSON, prompts Groq with the active player's key, parses the structured action and reasoning (`thought`), validates the action engine-side against Monopoly rules, and dispatches the action with a 5-second cadence while streaming thoughts to the UI feed.
>
> **Tech Stack:** React 18, TypeScript, Tailwind CSS, Groq Chat Completions API (`qwen/qwen3.8-27b`), Vitest.
>
> **Spec:** [`docs/superpowers/specs/2026-08-31-autonomous-agents-gameplay-design.md`](file:///c:/Users/hamma/blue/docs/superpowers/specs/2026-08-31-autonomous-agents-gameplay-design.md)

---

## Global Constraints
- Engine is the immutable sole source of truth; LLM never mutates state directly.
- Agent 1 (Player 0) Key: `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`
- Agent 2 (Player 1) Key: `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`
- Model: `qwen/qwen3.8-27b`
- Pacing: 5 seconds between consecutive API turns when auto-play is enabled.
- Design: Clean board palette, solid 2px black borders, no drop shadows, no AI slop.

---

### Task 1: Groq API Client with Agent Key Routing
**Files:**
- Create: `src/ai/groqClient.ts`
- Test: `src/tests/groqClient.test.ts`

**Interfaces:**
- Produces: `requestAgentDecision(agentId: number, stateContext: AgentStateContext): Promise<AgentDecisionResponse>`
```ts
export interface AgentDecisionResponse {
  thought: string;
  action: {
    type: string;
    payload?: Record<string, any>;
  };
  rawResponse?: string;
  error?: string;
}
```

- [ ] **Step 1: Write the failing test**
```ts
import { describe, it, expect, vi } from "vitest";
import { requestAgentDecision, getApiKeyForAgent } from "../ai/groqClient";

describe("Groq API Client", () => {
  it("routes correct API key per agent ID", () => {
    expect(getApiKeyForAgent(0)).toBe("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");
    expect(getApiKeyForAgent(1)).toBe("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");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/tests/groqClient.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/ai/groqClient.ts`**
Implement the Groq client with fetch handling, JSON mode, timeout, and key routing.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/tests/groqClient.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/ai/groqClient.ts src/tests/groqClient.test.ts
git commit -m "feat(ai): add Groq client with agent key routing"
```

---

### Task 2: Deep State Serializer & Legal Action Generator
**Files:**
- Create: `src/ai/agentStateSerializer.ts`
- Test: `src/tests/agentStateSerializer.test.ts`

**Interfaces:**
- Produces: `serializeStateForAgent(state: GameState, agentId: number): AgentStateContext`
- Produces: `getLegalActionsForAgent(state: GameState, agentId: number): LegalActionDescriptor[]`

- [ ] **Step 1: Write the failing test**
```ts
import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import { serializeStateForAgent, getLegalActionsForAgent } from "../ai/agentStateSerializer";

describe("Agent State Serializer", () => {
  it("serializes complete financial, property, and surrounding board context", () => {
    const state = createInitialGameState();
    const context = serializeStateForAgent(state, 0);

    expect(context.activePlayerId).toBe(0);
    expect(context.myState.money).toBe(1500);
    expect(context.opponentState.money).toBe(1500);
    expect(context.legalActions.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/tests/agentStateSerializer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/ai/agentStateSerializer.ts`**
Implement full board radar, danger zones, monopolies, trade values, and legal actions calculation.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/tests/agentStateSerializer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/ai/agentStateSerializer.ts src/tests/agentStateSerializer.test.ts
git commit -m "feat(ai): add deep state serializer and legal actions generator"
```

---

### Task 3: Engine Action Validator & Safe Fallback Executor
**Files:**
- Create: `src/ai/agentActionValidator.ts`
- Test: `src/tests/agentActionValidator.test.ts`

**Interfaces:**
- Produces: `validateAndSanitizeAgentAction(state: GameState, agentId: number, proposedAction: any): GameAction`

- [ ] **Step 1: Write the failing test**
```ts
import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import { validateAndSanitizeAgentAction } from "../ai/agentActionValidator";

describe("Agent Action Validator", () => {
  it("validates legal actions and falls back gracefully on illegal actions", () => {
    const state = createInitialGameState(); // turnPhase = ROLL
    const validRoll = validateAndSanitizeAgentAction(state, 0, { type: "ROLL_DICE" });
    expect(validRoll.type).toBe("ROLL_DICE");

    // Illegal action during ROLL phase
    const fallback = validateAndSanitizeAgentAction(state, 0, { type: "BUY_PROPERTY", payload: { propertyIndex: 39 } });
    expect(fallback.type).toBe("ROLL_DICE");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/tests/agentActionValidator.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/ai/agentActionValidator.ts`**
Implement validation against `state.turnPhase`, affordability, property ownership, and safe fallback rules.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/tests/agentActionValidator.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/ai/agentActionValidator.ts src/tests/agentActionValidator.test.ts
git commit -m "feat(ai): add engine action validator with safe fallbacks"
```

---

### Task 4: Autonomous Match Orchestrator Hook with 5-Second Timer
**Files:**
- Create: `src/hooks/useAutonomousRunner.ts`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/types/game.ts`

**Interfaces:**
- Produces: `useAutonomousRunner()` hook managing 5s turn timer, LLM requests, thought telemetry records, and match status.

- [ ] **Step 1: Extend GameState & Context for Telemetry**
Add `agentTelemetryLogs: AgentTelemetryEntry[]` and `isAutonomousRunning: boolean` to `GameState` and `GameContext`.

- [ ] **Step 2: Implement `src/hooks/useAutonomousRunner.ts`**
Implement the 5-second interval execution loop connecting `serializeStateForAgent`, `requestAgentDecision`, `validateAndSanitizeAgentAction`, and engine dispatch.

- [ ] **Step 3: Run full vitest suite**
Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add src/hooks/useAutonomousRunner.ts src/context/GameContext.tsx src/types/game.ts
git commit -m "feat(ai): implement autonomous runner hook with 5s turn loop"
```

---

### Task 5: UI Integration — Agent Thought Telemetry Feed & Top-Right Play Game Button
**Files:**
- Create: `src/components/sidebar/AgentThoughtFeed.tsx`
- Modify: `src/components/layout/GameLayout.tsx`
- Modify: `src/components/ui/TopNav.tsx`

- [ ] **Step 1: Create `AgentThoughtFeed.tsx`**
Render thought cards with agent avatar, turn phase, `thought` reasoning, formatted action badge, and expandable state JSON inspector.

- [ ] **Step 2: Update `GameLayout.tsx`**
Replace the old `EventLog` with `AgentThoughtFeed` under the **Feed** tab.

- [ ] **Step 3: Add Top-Right "Play Game" / "Pause Game" Button**
Position at `fixed top-3 right-4 z-40` with 5s countdown indicator and play/pause controls.

- [ ] **Step 4: Run tests and build**
Run: `npm test -- --run && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/sidebar/AgentThoughtFeed.tsx src/components/layout/GameLayout.tsx src/components/ui/TopNav.tsx
git commit -m "feat(ui): add agent thought telemetry feed and play game button"
```

---

### Task 6: End-to-End Autonomous Match Simulation & Verification
**Files:**
- Create: `src/tests/autonomousMatch.test.ts`

- [ ] **Step 1: Write integration test for autonomous turn cycle**
Verify state serialization, mock Groq response, validation, telemetry recording, and state transition.

- [ ] **Step 2: Run full test suite & production build**
Run: `npm test -- --run && npm run build`
Expected: PASS (All tests pass, 0 build errors).

- [ ] **Step 3: Commit**
```bash
git add src/tests/autonomousMatch.test.ts
git commit -m "test: add end-to-end autonomous agent match integration tests"
```
