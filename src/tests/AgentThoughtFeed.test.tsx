import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  AgentThoughtFeed,
  formatActionDisplay,
  getPhaseBadge,
} from "../components/sidebar/AgentThoughtFeed";
import { GameProvider } from "../context/GameContext";
import { AgentTelemetryEntry } from "../types/game";
import { GameAction } from "../engine/gameReducer";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe("AgentThoughtFeed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatActionDisplay helper", () => {
    it("formats various game action types accurately", () => {
      expect(formatActionDisplay({ type: "ROLL_DICE" })).toBe("ROLL_DICE");
      expect(
        formatActionDisplay({
          type: "BUY_PROPERTY",
          payload: { propertyIndex: 1 },
        }),
      ).toBe("BUY_PROPERTY: Mediterranean Avenue ($60)");
      expect(
        formatActionDisplay({
          type: "DECLINE_BUY",
          payload: { propertyIndex: 3 },
        }),
      ).toBe("DECLINE_BUY: Baltic Avenue (Send to Auction)");
      expect(
        formatActionDisplay({
          type: "PLACE_AUCTION_BID",
          payload: { playerId: 1, amount: 150 },
        }),
      ).toBe("BID_AUCTION: $150");
      expect(
        formatActionDisplay({
          type: "BID_AUCTION",
          payload: { amount: 150 },
        } as any),
      ).toBe("BID_AUCTION: $150");
      expect(
        formatActionDisplay({
          type: "PASS_AUCTION_BID",
          payload: { playerId: 1 },
        }),
      ).toBe("PASS_AUCTION");
      expect(formatActionDisplay({ type: "PASS_AUCTION" } as any)).toBe(
        "PASS_AUCTION",
      );
      expect(formatActionDisplay({ type: "ACCEPT_TRADE" })).toBe(
        "ACCEPT_TRADE",
      );
      expect(formatActionDisplay({ type: "REJECT_TRADE" })).toBe(
        "REJECT_TRADE",
      );
      expect(
        formatActionDisplay({
          type: "BUILD_HOUSE",
          payload: { propertyIndex: 1 },
        }),
      ).toBe("BUILD_HOUSE: Mediterranean Avenue");
      expect(
        formatActionDisplay({
          type: "SELL_HOUSE",
          payload: { propertyIndex: 1 },
        }),
      ).toBe("SELL_HOUSE: Mediterranean Avenue");
      expect(
        formatActionDisplay({
          type: "MORTGAGE_PROPERTY",
          payload: { propertyIndex: 1 },
        }),
      ).toBe("MORTGAGE: Mediterranean Avenue");
      expect(
        formatActionDisplay({
          type: "UNMORTGAGE_PROPERTY",
          payload: { propertyIndex: 1 },
        }),
      ).toBe("UNMORTGAGE: Mediterranean Avenue");
      expect(formatActionDisplay({ type: "PAY_JAIL_FINE" })).toBe(
        "PAY_JAIL_FINE ($50)",
      );
      expect(
        formatActionDisplay({
          type: "USE_JAIL_CARD",
          payload: { cardType: "chance" },
        }),
      ).toBe("USE_JAIL_CARD (Chance)");
      expect(formatActionDisplay({ type: "RESOLVE_DEBT" })).toBe(
        "RESOLVE_DEBT",
      );
      expect(
        formatActionDisplay({
          type: "DECLARE_BANKRUPTCY",
          payload: { playerId: 1 },
        }),
      ).toBe("DECLARE_BANKRUPTCY");
      expect(formatActionDisplay({ type: "END_TURN" })).toBe("END_TURN");
      expect(formatActionDisplay({ type: "FALLBACK" } as any)).toBe(
        "FALLBACK ACTION",
      );
      expect(formatActionDisplay(null as any)).toBe("UNKNOWN");
    });
  });

  describe("getPhaseBadge helper", () => {
    it("returns correct badges and labels for phases", () => {
      expect(getPhaseBadge("ROLL").label).toBe("ROLL");
      expect(getPhaseBadge("LANDED_ACTION").label).toBe("LANDED");
      expect(getPhaseBadge("AUCTION").label).toBe("AUCTION");
      expect(getPhaseBadge("TRADE").label).toBe("TRADE");
      expect(getPhaseBadge("DEBT_RESOLUTION").label).toBe("DEBT");
      expect(getPhaseBadge("END_TURN").label).toBe("END TURN");
      expect(getPhaseBadge("GAME_OVER").label).toBe("GAME OVER");
    });
  });

  describe("Component Rendering & Interactions", () => {
    it("renders empty state invitation when no telemetry logs exist", () => {
      render(
        <GameProvider>
          <AgentThoughtFeed />
        </GameProvider>,
      );

      expect(
        screen.getByText(/Autonomous Thought Stream/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Autonomous agents' reasoning, tactical deliberations, and state snapshots will stream here in real time/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Clear/i })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Start Match/i }),
      ).toBeInTheDocument();
    });

    it("renders telemetry entry details, thought, action, and handles expand/copy", async () => {
      const sampleEntry: AgentTelemetryEntry = {
        id: "telem-test-1",
        timestamp: 1700000000000,
        agentId: 1,
        agentName: "Tycoon AI",
        turnNumber: 4,
        phase: "LANDED_ACTION",
        thought:
          "Mediterranean Avenue is cheap and helps secure the Brown color group. I will purchase it.",
        action: {
          type: "BUY_PROPERTY",
          payload: { propertyIndex: 1 },
        } as GameAction,
        isValid: true,
        stateSnapshot: {
          activePlayerId: 1,
          isMyTurn: true,
          turnPhase: "LANDED_ACTION",
          turnNumber: 4,
          myState: {
            id: 1,
            name: "Tycoon AI",
            money: 1440,
            position: 1,
            positionName: "Mediterranean Avenue",
            inJail: false,
            jailTurns: 0,
            jailCards: 0,
            ownedProperties: [],
            monopolies: [],
            netWorth: 1440,
          },
          opponentState: {
            id: 0,
            name: "Player 1",
            money: 1500,
            position: 0,
            positionName: "GO",
            inJail: false,
            jailTurns: 0,
            jailCards: 0,
            ownedProperties: [],
            monopolies: [],
            netWorth: 1500,
          },
          boardContext: {
            currentSquare: {
              index: 1,
              name: "Mediterranean Avenue",
              type: "STREET",
              price: 60,
              ownerId: null,
            },
            unownedPropertiesRemaining: 28,
            unownedStreetsRemaining: 22,
            opponentNearbyDanger: [],
          },
          legalActions: [
            {
              type: "BUY_PROPERTY",
              description: "Buy Mediterranean Avenue for $60",
            },
            {
              type: "DECLINE_BUY",
              description: "Send Mediterranean Avenue to auction",
            },
          ],
        },
      };

      const fallbackEntry: AgentTelemetryEntry = {
        id: "telem-test-2",
        timestamp: 1700000005000,
        agentId: 2,
        agentName: "Risk Taker",
        turnNumber: 5,
        phase: "ROLL",
        thought: "Attempted illegal move.",
        action: { type: "ROLL_DICE" },
        isValid: false,
        validationReason: "Agent proposed action invalid during ROLL phase.",
        stateSnapshot: {} as any,
        error: "Action was rejected by validator",
      };

      // Render directly with mock logs prop
      render(
        <GameProvider>
          <AgentThoughtFeed logs={[sampleEntry, fallbackEntry]} />
        </GameProvider>,
      );

      // Verify header and entry 1
      expect(screen.getByText("Tycoon AI")).toBeInTheDocument();
      expect(screen.getByText("Turn #4")).toBeInTheDocument();
      expect(screen.getByText("LANDED")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Mediterranean Avenue is cheap and helps secure the Brown color group/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/BUY_PROPERTY: Mediterranean Avenue \(\$60\)/i),
      ).toBeInTheDocument();

      // Verify entry 2 fallback & error status
      expect(screen.getByText("Risk Taker")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Fallback Applied: Agent proposed action invalid during ROLL phase./i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Error: Action was rejected by validator/i),
      ).toBeInTheDocument();

      // Test Expand Accordion for State JSON
      const viewStateButtons = screen.getAllByRole("button", {
        name: /View State JSON & Prompt/i,
      });
      await act(async () => {
        fireEvent.click(viewStateButtons[0]);
      });

      expect(screen.getByText(/State Snapshot/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Mediterranean Avenue/i, { selector: "code" }),
      ).toBeInTheDocument();

      // Test Copy JSON button
      const copyBtn = screen.getByRole("button", { name: /Copy JSON/i });
      await act(async () => {
        fireEvent.click(copyBtn);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
});
