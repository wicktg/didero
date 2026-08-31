import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import {
  serializeStateForAgent,
  getLegalActionsForAgent,
  calculateDangerZones,
  calculatePlayerMonopolies,
  summarizePlayer,
} from "../ai/agentStateSerializer";
import { TradeOffer } from "../types/game";

describe("Agent State Serializer", () => {
  describe("Player Summary & Monopolies", () => {
    it("serializes initial state for Player 0 and Player 1 accurately", () => {
      const state = createInitialGameState();
      const p0Context = serializeStateForAgent(state, 0);

      expect(p0Context.activePlayerId).toBe(0);
      expect(p0Context.isMyTurn).toBe(true);
      expect(p0Context.turnPhase).toBe("ROLL");
      expect(p0Context.turnNumber).toBe(1);

      // My state (Player 0)
      expect(p0Context.myState.id).toBe(0);
      expect(p0Context.myState.name).toContain("did:key:");
      expect(p0Context.myState.money).toBe(1500);
      expect(p0Context.myState.position).toBe(0);
      expect(p0Context.myState.positionName).toBe("GO");
      expect(p0Context.myState.inJail).toBe(false);
      expect(p0Context.myState.jailTurns).toBe(0);
      expect(p0Context.myState.jailCards).toBe(0);
      expect(p0Context.myState.ownedProperties).toEqual([]);
      expect(p0Context.myState.monopolies).toEqual([]);
      expect(p0Context.myState.netWorth).toBe(1500);

      // Opponent state (Player 1)
      expect(p0Context.opponentState.id).toBe(1);
      expect(p0Context.opponentState.money).toBe(1500);
      expect(p0Context.opponentState.position).toBe(0);
      expect(p0Context.opponentState.positionName).toBe("GO");
      expect(p0Context.opponentState.inJail).toBe(false);
      expect(p0Context.opponentState.ownedProperties).toEqual([]);
      expect(p0Context.opponentState.monopolies).toEqual([]);
      expect(p0Context.opponentState.netWorth).toBe(1500);
    });

    it("serializes from Player 1 perspective correctly", () => {
      const state = createInitialGameState();
      const p1Context = serializeStateForAgent(state, 1);

      expect(p1Context.activePlayerId).toBe(0);
      expect(p1Context.isMyTurn).toBe(false);
      expect(p1Context.myState.id).toBe(1);
      expect(p1Context.opponentState.id).toBe(0);
    });

    it("detects completed color monopolies and updates net worth", () => {
      const state = createInitialGameState();
      // Give Player 0 the Brown monopoly (indices 1 & 3: Mediterranean $60 & Baltic $60)
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };
      state.properties[3] = {
        index: 3,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };
      state.players[0].money = 1380;

      const summary = summarizePlayer(state, 0);
      expect(summary.ownedProperties).toEqual([1, 3]);
      expect(summary.monopolies).toContain("BROWN");
      expect(summary.netWorth).toBe(1380 + 60 + 60);

      const monopolies = calculatePlayerMonopolies(state, 0);
      expect(monopolies).toEqual(["BROWN"]);
    });

    it("includes house value in net worth calculation", () => {
      const state = createInitialGameState();
      // Give Player 0 Dark Blue monopoly (37: Park Place $350, 39: Boardwalk $400)
      state.properties[37] = {
        index: 37,
        ownerId: 0,
        houses: 2,
        isMortgaged: false,
      }; // housePrice = 200 -> 2*100 = 200
      state.properties[39] = {
        index: 39,
        ownerId: 0,
        houses: 2,
        isMortgaged: false,
      }; // housePrice = 200 -> 2*100 = 200
      state.players[0].money = 1000;

      const summary = summarizePlayer(state, 0);
      expect(summary.monopolies).toContain("DARK_BLUE");
      // Net worth = 1000 + 350 + 400 + (2 * 100) + (2 * 100) = 2150
      expect(summary.netWorth).toBe(2150);
    });
  });

  describe("Board Context & Danger Zones", () => {
    it("reports remaining unowned properties and streets count", () => {
      const state = createInitialGameState();
      const context = serializeStateForAgent(state, 0);

      // Total buyable = 22 streets + 4 railroads + 2 utilities = 28
      expect(context.boardContext.unownedPropertiesRemaining).toBe(28);
      expect(context.boardContext.unownedStreetsRemaining).toBe(22);
      expect(context.boardContext.currentSquare.name).toBe("GO");
      expect(context.boardContext.currentSquare.index).toBe(0);
    });

    it("calculates danger zones within 2-12 dice distance accurately", () => {
      const state = createInitialGameState();
      // Set Player 0 at position 10 (Jail)
      state.players[0].position = 10;

      // Player 1 owns St. James Place (pos 16, distance 6 from 10, Orange street, rent base = 14)
      state.properties[16] = {
        index: 16,
        ownerId: 1,
        houses: 0,
        isMortgaged: false,
      };

      // Player 1 owns Electric Company (pos 12, distance 2 from 10, Utility, 1 owned = 4x roll = 4 * 2 = 8)
      state.properties[12] = {
        index: 12,
        ownerId: 1,
        houses: 0,
        isMortgaged: false,
      };

      // Player 1 owns Tennessee Ave (pos 18, distance 8 from 10), but it's MORTGAGED
      state.properties[18] = {
        index: 18,
        ownerId: 1,
        houses: 0,
        isMortgaged: true,
      };

      // Player 0 owns States Ave (pos 13, distance 3 from 10) - own property, not danger!
      state.properties[13] = {
        index: 13,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };

      const dangerZones = calculateDangerZones(state, 0);

      // Should include Electric Company (distance 2) and St. James Place (distance 6)
      // Should NOT include Tennessee Ave (mortgaged) or States Ave (owned by Player 0)
      expect(dangerZones.length).toBe(2);

      const electricCoDanger = dangerZones.find((d) => d.squareIndex === 12);
      expect(electricCoDanger).toBeDefined();
      expect(electricCoDanger?.distance).toBe(2);
      expect(electricCoDanger?.rent).toBe(8); // 4 * 2
      expect(electricCoDanger?.probability).toBeCloseTo(1 / 36, 4);
      expect(electricCoDanger?.ownerId).toBe(1);

      const stJamesDanger = dangerZones.find((d) => d.squareIndex === 16);
      expect(stJamesDanger).toBeDefined();
      expect(stJamesDanger?.distance).toBe(6);
      expect(stJamesDanger?.rent).toBe(14);
      expect(stJamesDanger?.probability).toBeCloseTo(5 / 36, 4);
      expect(stJamesDanger?.expectedRent).toBeCloseTo((5 / 36) * 14, 2);
    });

    it("computes double rent for unimproved monopolies in danger zones", () => {
      const state = createInitialGameState();
      // Player 0 at position 0 (GO)
      state.players[0].position = 0;

      // Player 1 owns full Brown monopoly (1 & 3: Mediterranean base 2 -> 4, Baltic base 4 -> 8)
      state.properties[1] = {
        index: 1,
        ownerId: 1,
        houses: 0,
        isMortgaged: false,
      };
      state.properties[3] = {
        index: 3,
        ownerId: 1,
        houses: 0,
        isMortgaged: false,
      };

      const dangerZones = calculateDangerZones(state, 0);
      const balticDanger = dangerZones.find((d) => d.squareIndex === 3);

      expect(balticDanger).toBeDefined();
      expect(balticDanger?.distance).toBe(3);
      expect(balticDanger?.rent).toBe(8); // 4 * 2 due to monopoly
    });
  });

  describe("Legal Actions Generator", () => {
    describe("ROLL phase", () => {
      it("allows standard ROLL_DICE when active player is not in Jail", () => {
        const state = createInitialGameState();
        state.turnPhase = "ROLL";
        state.currentTurnPlayerId = 0;

        const actions = getLegalActionsForAgent(state, 0);
        expect(actions).toEqual([
          { type: "ROLL_DICE", description: "Roll the dice" },
        ]);
      });

      it("returns empty actions for inactive player during ROLL phase", () => {
        const state = createInitialGameState();
        state.turnPhase = "ROLL";
        state.currentTurnPlayerId = 0;

        const actions = getLegalActionsForAgent(state, 1);
        expect(actions).toEqual([]);
      });

      it("offers jail escape options when player is in Jail", () => {
        const state = createInitialGameState();
        state.turnPhase = "ROLL";
        state.currentTurnPlayerId = 0;
        state.players[0].inJail = true;
        state.players[0].money = 1500;
        state.players[0].getOutOfJailCards = { chance: 1, communityChest: 1 };

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("ROLL_DICE");
        expect(actionTypes).toContain("PAY_JAIL_FINE");
        expect(actionTypes).toContain("USE_JAIL_CARD");

        const useCards = actions.filter((a) => a.type === "USE_JAIL_CARD");
        expect(useCards.length).toBe(2);
      });

      it("does not offer PAY_JAIL_FINE if player has insufficient cash", () => {
        const state = createInitialGameState();
        state.turnPhase = "ROLL";
        state.currentTurnPlayerId = 0;
        state.players[0].inJail = true;
        state.players[0].money = 30; // Less than $50
        state.players[0].getOutOfJailCards = { chance: 0, communityChest: 0 };

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toEqual(["ROLL_DICE"]);
      });
    });

    describe("LANDED_ACTION phase", () => {
      it("allows BUY_PROPERTY and DECLINE_BUY when property is affordable", () => {
        const state = createInitialGameState();
        state.turnPhase = "LANDED_ACTION";
        state.currentTurnPlayerId = 0;
        state.players[0].position = 16; // St. James Place ($180)
        state.players[0].money = 500;

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("BUY_PROPERTY");
        expect(actionTypes).toContain("DECLINE_BUY");

        const buyAction = actions.find((a) => a.type === "BUY_PROPERTY");
        expect(buyAction?.payload?.propertyIndex).toBe(16);
      });

      it("only allows DECLINE_BUY when player cannot afford property", () => {
        const state = createInitialGameState();
        state.turnPhase = "LANDED_ACTION";
        state.currentTurnPlayerId = 0;
        state.players[0].position = 39; // Boardwalk ($400)
        state.players[0].money = 200; // Cannot afford

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toEqual(["DECLINE_BUY"]);
        expect(actionTypes).not.toContain("BUY_PROPERTY");
      });
    });

    describe("AUCTION phase", () => {
      it("provides BID, PASS_AUCTION, and EXIT_AUCTION for active bidder", () => {
        const state = createInitialGameState();
        state.turnPhase = "AUCTION";
        state.activeAuction = {
          propertyIndex: 5, // Reading RR ($200)
          highestBid: 0,
          highestBidderId: null,
          currentBidderId: 0,
          activeParticipants: [0, 1],
          minIncrement: 10,
        };
        state.players[0].money = 1500;

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("BID");
        expect(actionTypes).toContain("PASS_AUCTION");
        expect(actionTypes).toContain("EXIT_AUCTION");

        const bidAction = actions.find((a) => a.type === "BID");
        expect(bidAction?.payload?.minAmount).toBe(10);
        expect(bidAction?.payload?.maxAmount).toBe(1500);
      });

      it("calculates correct minimum bid increment in active auction", () => {
        const state = createInitialGameState();
        state.turnPhase = "AUCTION";
        state.activeAuction = {
          propertyIndex: 39,
          highestBid: 150,
          highestBidderId: 1,
          currentBidderId: 0,
          activeParticipants: [0, 1],
          minIncrement: 10,
        };
        state.players[0].money = 500;

        const actions = getLegalActionsForAgent(state, 0);
        const bidAction = actions.find((a) => a.type === "BID");
        expect(bidAction?.payload?.amount).toBe(160);
        expect(bidAction?.payload?.minAmount).toBe(160);
        expect(bidAction?.payload?.maxAmount).toBe(500);
      });

      it("disallows BID when minimum bid exceeds player money", () => {
        const state = createInitialGameState();
        state.turnPhase = "AUCTION";
        state.activeAuction = {
          propertyIndex: 39,
          highestBid: 300,
          highestBidderId: 1,
          currentBidderId: 0,
          activeParticipants: [0, 1],
          minIncrement: 10,
        };
        state.players[0].money = 200; // Cannot afford min bid $310

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).not.toContain("BID");
        expect(actionTypes).toContain("PASS_AUCTION");
        expect(actionTypes).toContain("EXIT_AUCTION");
      });
    });

    describe("DEBT_RESOLUTION phase", () => {
      it("offers MORTGAGE_PROPERTY, SELL_HOUSE, and DECLARE_BANKRUPTCY when cash is negative", () => {
        const state = createInitialGameState();
        state.turnPhase = "DEBT_RESOLUTION";
        state.debtInfo = {
          debtorId: 0,
          creditorId: 1,
          amountOwed: 200,
        };
        state.players[0].money = -100;
        // Player 0 owns Baltic (pos 3) with 1 house
        state.properties[1] = {
          index: 1,
          ownerId: 0,
          houses: 1,
          isMortgaged: false,
        };
        state.properties[3] = {
          index: 3,
          ownerId: 0,
          houses: 1,
          isMortgaged: false,
        };
        // Player 0 owns Reading RR (pos 5) unimproved
        state.properties[5] = {
          index: 5,
          ownerId: 0,
          houses: 0,
          isMortgaged: false,
        };

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("MORTGAGE_PROPERTY");
        expect(actionTypes).toContain("SELL_HOUSE");
        expect(actionTypes).toContain("DECLARE_BANKRUPTCY");
        expect(actionTypes).not.toContain("RESOLVE_DEBT");

        // Reading RR can be mortgaged directly
        const mortgageRR = actions.find(
          (a) =>
            a.type === "MORTGAGE_PROPERTY" && a.payload?.propertyIndex === 5,
        );
        expect(mortgageRR).toBeDefined();
      });

      it("offers RESOLVE_DEBT when player has raised sufficient funds (money >= 0)", () => {
        const state = createInitialGameState();
        state.turnPhase = "DEBT_RESOLUTION";
        state.debtInfo = {
          debtorId: 0,
          creditorId: 1,
          amountOwed: 200,
        };
        state.players[0].money = 50; // Successfully raised funds

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("RESOLVE_DEBT");
      });
    });

    describe("END_TURN phase", () => {
      it("allows END_TURN and PROPOSE_TRADE by default", () => {
        const state = createInitialGameState();
        state.turnPhase = "END_TURN";
        state.currentTurnPlayerId = 0;

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("END_TURN");
        expect(actionTypes).toContain("PROPOSE_TRADE");
      });

      it("allows BUILD_HOUSE when player owns a complete monopoly and has funds", () => {
        const state = createInitialGameState();
        state.turnPhase = "END_TURN";
        state.currentTurnPlayerId = 0;
        state.players[0].money = 1000;
        // Complete Brown group (1 & 3, house price $50)
        state.properties[1] = {
          index: 1,
          ownerId: 0,
          houses: 0,
          isMortgaged: false,
        };
        state.properties[3] = {
          index: 3,
          ownerId: 0,
          houses: 0,
          isMortgaged: false,
        };

        const actions = getLegalActionsForAgent(state, 0);
        const buildActions = actions.filter((a) => a.type === "BUILD_HOUSE");

        expect(buildActions.length).toBe(2);
        expect(buildActions.map((b) => b.payload?.propertyIndex)).toEqual([
          1, 3,
        ]);
      });

      it("allows UNMORTGAGE_PROPERTY when player has mortgaged property and funds", () => {
        const state = createInitialGameState();
        state.turnPhase = "END_TURN";
        state.currentTurnPlayerId = 0;
        state.players[0].money = 1000;
        // Mortgaged Reading RR ($200 -> unmortgage cost is $110)
        state.properties[5] = {
          index: 5,
          ownerId: 0,
          houses: 0,
          isMortgaged: true,
        };

        const actions = getLegalActionsForAgent(state, 0);
        const unmortgageActions = actions.filter(
          (a) => a.type === "UNMORTGAGE_PROPERTY",
        );

        expect(unmortgageActions.length).toBe(1);
        expect(unmortgageActions[0].payload?.propertyIndex).toBe(5);
      });
    });

    describe("TRADE phase", () => {
      it("allows ACCEPT_TRADE and REJECT_TRADE when agent is trade recipient", () => {
        const state = createInitialGameState();
        state.turnPhase = "TRADE";
        const trade: TradeOffer = {
          id: "trade-1",
          initiatorId: 1,
          recipientId: 0,
          offeredMoney: 100,
          requestedMoney: 0,
          offeredProperties: [6],
          requestedProperties: [1],
          offeredJailCards: { chance: false, communityChest: false },
          requestedJailCards: { chance: false, communityChest: false },
        };
        state.activeTrade = trade;

        const actions = getLegalActionsForAgent(state, 0);
        const actionTypes = actions.map((a) => a.type);

        expect(actionTypes).toContain("ACCEPT_TRADE");
        expect(actionTypes).toContain("REJECT_TRADE");
      });
    });
  });
});
