import { GameState, Card } from "../types/game";
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from "../data/cardsData";
import { SQUARES } from "../data/boardData";
import { createLogEntry, shuffleArray } from "./gameEngine";
import { calculateRent } from "./rentCalculator";

export function drawCard(
  state: GameState,
  deckType: "chance" | "communityChest",
): { state: GameState; card: Card } {
  let deck =
    deckType === "chance"
      ? [...state.chanceDeck]
      : [...state.communityChestDeck];
  let discard =
    deckType === "chance"
      ? [...state.chanceDiscard]
      : [...state.communityChestDiscard];
  const fullDeck = deckType === "chance" ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;

  if (deck.length === 0) {
    deck = shuffleArray(
      discard.length > 0 ? discard : fullDeck.map((_, i) => i),
    );
    discard = [];
  }

  const cardIndex = deck.shift()!;
  const card = fullDeck[cardIndex];

  // If not Get Out of Jail Free, add to discard
  if (card.action.type !== "GET_OUT_OF_JAIL_FREE") {
    discard.push(cardIndex);
  }

  const nextState: GameState = {
    ...state,
    chanceDeck: deckType === "chance" ? deck : state.chanceDeck,
    chanceDiscard: deckType === "chance" ? discard : state.chanceDiscard,
    communityChestDeck:
      deckType === "communityChest" ? deck : state.communityChestDeck,
    communityChestDiscard:
      deckType === "communityChest" ? discard : state.communityChestDiscard,
    lastDrawnCard: card,
  };

  return { state: nextState, card };
}

export function applyCardEffect(
  state: GameState,
  card: Card,
  playerId: number,
): GameState {
  let nextState = { ...state };
  const player = { ...nextState.players[playerId] };
  nextState.players = [...nextState.players];
  nextState.players[playerId] = player;

  const deckName = card.deck === "chance" ? "Chance" : "Community Chest";
  nextState.gameLog = [
    createLogEntry(
      `${player.name} drew ${deckName}: "${card.text}"`,
      "card",
      playerId,
    ),
    ...nextState.gameLog,
  ];

  switch (card.action.type) {
    case "ADVANCE_TO": {
      const target = card.action.targetIndex;
      const oldPos = player.position;
      player.position = target;

      // Check if passing GO (e.g. oldPos > target or target === 0)
      if (card.action.passGoCheck && (target < oldPos || target === 0)) {
        player.money += 200;
        nextState.gameLog = [
          createLogEntry(
            `${player.name} passed GO and collected $200.`,
            "move",
            playerId,
          ),
          ...nextState.gameLog,
        ];
      }

      // Handle landing on new square
      return handleLanding(nextState, playerId);
    }

    case "ADVANCE_TO_NEAREST_RAILROAD": {
      // Railroads are at 5, 15, 25, 35
      const railroads = [5, 15, 25, 35];
      let target = railroads.find((r) => r > player.position);
      if (target === undefined) {
        target = 5; // Wrap around to Reading Railroad
        player.money += 200; // Passed GO
        nextState.gameLog = [
          createLogEntry(
            `${player.name} passed GO and collected $200.`,
            "move",
            playerId,
          ),
          ...nextState.gameLog,
        ];
      }
      player.position = target;
      return handleLanding(nextState, playerId, { railroadMultiplier: 2 });
    }

    case "ADVANCE_TO_NEAREST_UTILITY": {
      // Utilities are at 12, 28
      const utilities = [12, 28];
      let target = utilities.find((u) => u > player.position);
      if (target === undefined) {
        target = 12; // Wrap around
        player.money += 200; // Passed GO
        nextState.gameLog = [
          createLogEntry(
            `${player.name} passed GO and collected $200.`,
            "move",
            playerId,
          ),
          ...nextState.gameLog,
        ];
      }
      player.position = target;
      return handleLanding(nextState, playerId, { utilityMultiplier: 10 });
    }

    case "COLLECT_MONEY": {
      player.money += card.action.amount;
      break;
    }

    case "PAY_MONEY": {
      player.money -= card.action.amount;
      if (player.money < 0) {
        nextState.turnPhase = "DEBT_RESOLUTION";
        nextState.debtInfo = {
          debtorId: playerId,
          creditorId: null,
          amountOwed: card.action.amount,
        };
      }
      break;
    }

    case "PAY_EACH_PLAYER": {
      const amount = card.action.amount;
      let totalPaid = 0;
      nextState.players.forEach((other, idx) => {
        if (idx !== playerId && !other.isBankrupt) {
          other.money += amount;
          totalPaid += amount;
        }
      });
      player.money -= totalPaid;
      if (player.money < 0) {
        nextState.turnPhase = "DEBT_RESOLUTION";
        nextState.debtInfo = {
          debtorId: playerId,
          creditorId: null,
          amountOwed: totalPaid,
        };
      }
      break;
    }

    case "COLLECT_FROM_EACH_PLAYER": {
      const amount = card.action.amount;
      let totalCollected = 0;
      nextState.players.forEach((other, idx) => {
        if (idx !== playerId && !other.isBankrupt) {
          other.money -= amount;
          totalCollected += amount;
        }
      });
      player.money += totalCollected;
      break;
    }

    case "GENERAL_REPAIRS": {
      let totalCost = 0;
      const perHouse = card.action.perHouse;
      const perHotel = card.action.perHotel;

      Object.values(nextState.properties).forEach((prop) => {
        if (prop.ownerId === playerId && prop.houses > 0) {
          if (prop.houses === 5) {
            totalCost += perHotel;
          } else {
            totalCost += prop.houses * perHouse;
          }
        }
      });

      player.money -= totalCost;
      nextState.gameLog = [
        createLogEntry(
          `${player.name} paid $${totalCost} for property repairs.`,
          "card",
          playerId,
        ),
        ...nextState.gameLog,
      ];
      if (player.money < 0) {
        nextState.turnPhase = "DEBT_RESOLUTION";
        nextState.debtInfo = {
          debtorId: playerId,
          creditorId: null,
          amountOwed: totalCost,
        };
      }
      break;
    }

    case "GO_BACK_3_SPACES": {
      player.position = (player.position - 3 + 40) % 40;
      return handleLanding(nextState, playerId);
    }

    case "GO_TO_JAIL": {
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      nextState.consecutiveDoubles = 0;
      nextState.turnPhase = "END_TURN";
      nextState.gameLog = [
        createLogEntry(
          `${player.name} was sent directly to Jail!`,
          "jail",
          playerId,
        ),
        ...nextState.gameLog,
      ];
      break;
    }

    case "GET_OUT_OF_JAIL_FREE": {
      if (card.deck === "chance") {
        player.getOutOfJailCards.chance += 1;
      } else {
        player.getOutOfJailCards.communityChest += 1;
      }
      break;
    }
  }

  if (
    nextState.turnPhase !== "DEBT_RESOLUTION" &&
    nextState.turnPhase !== "LANDED_ACTION"
  ) {
    const isDoubles =
      nextState.dice[0] === nextState.dice[1] &&
      !player.inJail &&
      nextState.consecutiveDoubles > 0;
    nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";
  }

  return nextState;
}

// Landing helper for movement & cards
export function handleLanding(
  state: GameState,
  playerId: number,
  overrides?: { railroadMultiplier?: number; utilityMultiplier?: number },
): GameState {
  let nextState = { ...state };
  const player = nextState.players[playerId];
  const square = SQUARES[player.position];
  const prop = nextState.properties[player.position];

  const isDoubles =
    nextState.dice[0] === nextState.dice[1] &&
    !player.inJail &&
    nextState.consecutiveDoubles > 0;

  switch (square.type) {
    case "GO":
    case "JAIL":
    case "FREE_PARKING": {
      nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";
      break;
    }

    case "GO_TO_JAIL": {
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      nextState.consecutiveDoubles = 0;
      nextState.turnPhase = "END_TURN";
      nextState.gameLog = [
        createLogEntry(
          `${player.name} landed on Go To Jail and was arrested!`,
          "jail",
          playerId,
        ),
        ...nextState.gameLog,
      ];
      break;
    }

    case "TAX": {
      const taxAmount = square.taxAmount || 100;
      player.money -= taxAmount;
      nextState.gameLog = [
        createLogEntry(
          `${player.name} paid $${taxAmount} for ${square.name}.`,
          "rent",
          playerId,
        ),
        ...nextState.gameLog,
      ];
      if (player.money < 0) {
        nextState.turnPhase = "DEBT_RESOLUTION";
        nextState.debtInfo = {
          debtorId: playerId,
          creditorId: null,
          amountOwed: taxAmount,
        };
      } else {
        nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";
      }
      break;
    }

    case "CHANCE": {
      const { state: sAfterDraw, card } = drawCard(nextState, "chance");
      return applyCardEffect(sAfterDraw, card, playerId);
    }

    case "COMMUNITY_CHEST": {
      const { state: sAfterDraw, card } = drawCard(nextState, "communityChest");
      return applyCardEffect(sAfterDraw, card, playerId);
    }

    case "STREET":
    case "RAILROAD":
    case "UTILITY": {
      if (prop.ownerId === null) {
        // Unowned property: landing action
        nextState.turnPhase = "LANDED_ACTION";
      } else if (prop.ownerId === playerId) {
        // Own property
        nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";
      } else {
        // Owned by another player: calculate rent
        const diceTotal = nextState.dice[0] + nextState.dice[1];
        const rent = calculateRent(
          player.position,
          playerId,
          diceTotal,
          nextState.properties,
          overrides?.utilityMultiplier,
          overrides?.railroadMultiplier,
        );

        if (rent > 0) {
          const owner = nextState.players[prop.ownerId];
          player.money -= rent;
          owner.money += rent;
          nextState.gameLog = [
            createLogEntry(
              `${player.name} paid $${rent} rent to ${owner.name} for ${square.name}.`,
              "rent",
              playerId,
            ),
            ...nextState.gameLog,
          ];

          if (player.money < 0) {
            nextState.turnPhase = "DEBT_RESOLUTION";
            nextState.debtInfo = {
              debtorId: playerId,
              creditorId: prop.ownerId,
              amountOwed: rent,
            };
          } else {
            nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";
          }
        } else {
          nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";
        }
      }
      break;
    }
  }

  return nextState;
}
