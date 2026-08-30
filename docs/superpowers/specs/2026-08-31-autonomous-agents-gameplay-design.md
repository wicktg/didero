# Autonomous Agent-vs-Agent Gameplay Design Specification

## 1. Overview & Objective

Transition the game from human-vs-bot to a fully autonomous, head-to-head AI agent match (Agent 1 vs Agent 2) powered by Groq LLM API with `qwen/qwen3.8-27b`. The system operates on a strict **Engine → State Serialization → LLM Agent Action → Engine Validation/Application** loop, maintaining the Monopoly game engine as the immutable, sole source of truth.

---

## 2. API & Model Configuration

- **Model**: `qwen/qwen3.8-27b`
- **Provider**: Groq Chat Completions API (`https://api.groq.com/openai/v1/chat/completions`)
- **Agent 1 (Player 0)** API Key: `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`
- **Agent 2 (Player 1)** API Key: `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`
- **Interval**: 5 seconds between consecutive agent API turns to allow visual observation, deliberate decision-making, and rate-limit compliance.

---

## 3. Communication Protocol & JSON Schema

### 3.1 State Serialization (`Engine -> Agent`)

The engine serializes comprehensive situational awareness into JSON:

```json
{
  "activePlayerId": 0,
  "turnPhase": "LANDED_ACTION",
  "turnNumber": 12,
  "myState": {
    "id": 0,
    "name": "Agent Alpha",
    "money": 1340,
    "position": 16,
    "positionName": "St. James Place",
    "inJail": false,
    "jailTurns": 0,
    "jailCards": 0,
    "ownedProperties": [1, 3, 16],
    "monopolies": ["BROWN"]
  },
  "opponentState": {
    "id": 1,
    "name": "Agent Beta",
    "money": 1420,
    "position": 10,
    "positionName": "Jail",
    "inJail": true,
    "ownedProperties": [6, 8],
    "monopolies": []
  },
  "boardContext": {
    "currentSquare": {
      "index": 16,
      "name": "St. James Place",
      "price": 180,
      "group": "ORANGE",
      "ownerId": null
    },
    "unownedPropertiesRemaining": 22,
    "opponentNearbyDanger": [
      { "square": "Oriental Avenue", "distance": 2, "rent": 30 }
    ]
  },
  "legalActions": [
    { "type": "BUY_PROPERTY", "description": "Buy St. James Place for $180" },
    {
      "type": "DECLINE_BUY",
      "description": "Decline purchase and trigger public auction"
    }
  ]
}
```

### 3.2 Agent Action Response (`Agent -> Engine`)

The agent returns a structured JSON object containing strategic reasoning and the desired action:

```json
{
  "thought": "St. James Place is the first Orange street. Owning it blocks Agent Beta from building a monopoly and fits within my $1340 cash buffer.",
  "action": {
    "type": "BUY_PROPERTY",
    "payload": { "propertyIndex": 16 }
  }
}
```

---

## 4. Engine Validation & Safety Fallbacks

1. **Source of Truth**: The LLM output is purely advisory; the game engine validates every payload before dispatch.
2. **Affordability**: Ensures `player.money >= price` before purchases, house construction, or auction bids.
3. **Phase Legality**: Checks that proposed actions match `state.turnPhase` (`ROLL`, `LANDED_ACTION`, `AUCTION`, `DEBT_RESOLUTION`, `END_TURN`).
4. **Graceful Fallbacks**:
   - Malformed JSON / Network Failure ➔ Executes deterministic safe move (e.g. `ROLL_DICE`, `DECLINE_BUY`, `PASS_AUCTION`, `END_TURN`).
   - Rate limit (429) ➔ Automatically pauses runner with user-facing retry prompt.

---

## 5. User Interface & Controls

1. **Top-Right "Play Game" / "Pause Game" Button**:
   - Positioned at `fixed top-3 right-4 z-40`.
   - Green (`#a5cd39`) when autonomous match is active with a live 5-second countdown ticker.
   - Gold Yellow (`#ffc905`) when paused.
2. **Agent Thought & Telemetry Feed** (Replaces `EventLog` under the sidebar's **Feed** tab):
   - Streams recent decisions for both Agent 1 and Agent 2.
   - Shows player identicon badge, turn phase, plain-text `thought` deliberation, and executed action.
   - Expandable JSON accordion showing the exact state prompt delivered to the agent.
3. **Design Compliance**:
   - Zero AI slop, no glow effects or drop shadows.
   - Solid 2px black borders, crisp `#c9daf8` and `#ffc905` accent headers, and pure white cards.

---

## 6. Verification & Testing Plan

- **Unit Tests**:
  - `agentStateSerializer.test.ts`: Validates serialization completeness and legal actions generator.
  - `agentActionValidator.test.ts`: Verifies rejection of illegal moves (e.g., buying without funds, bidding out of phase) and fallback execution.
  - `groqClient.test.ts`: Tests schema parsing, mock responses, and fallback handling on network error.
- **Integration Test**:
  - `autonomousMatch.test.ts`: Simulates autonomous agent decision turns end-to-end.
