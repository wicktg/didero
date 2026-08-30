import { GameState, TradeOffer } from '../types/game';
import { SQUARES } from '../data/boardData';
import { createLogEntry } from './gameEngine';

export function validateTradeOffer(
  state: GameState,
  trade: TradeOffer,
): { valid: boolean; reason?: string } {
  const initiator = state.players[trade.initiatorId];
  const recipient = state.players[trade.recipientId];

  if (!initiator || !recipient) return { valid: false, reason: 'Invalid players' };
  if (initiator.isBankrupt || recipient.isBankrupt) return { valid: false, reason: 'Cannot trade with bankrupt player' };

  if (trade.offeredMoney < 0 || trade.offeredMoney > initiator.money) {
    return { valid: false, reason: 'Insufficient funds for offer' };
  }
  if (trade.requestedMoney < 0 || trade.requestedMoney > recipient.money) {
    return { valid: false, reason: 'Recipient lacks requested funds' };
  }

  // Check initiator properties
  for (const pIndex of trade.offeredProperties) {
    const prop = state.properties[pIndex];
    const sq = SQUARES[pIndex];
    if (!prop || prop.ownerId !== trade.initiatorId) {
      return { valid: false, reason: `Initiator does not own ${sq?.name || pIndex}` };
    }
    // Check no houses in the color group
    if (sq.group) {
      const groupSquares = SQUARES.filter((s) => s.group === sq.group);
      const hasHouses = groupSquares.some((s) => (state.properties[s.index]?.houses || 0) > 0);
      if (hasHouses) {
        return { valid: false, reason: `Cannot trade ${sq.name} while properties in the ${sq.group} group have houses` };
      }
    }
  }

  // Check recipient properties
  for (const pIndex of trade.requestedProperties) {
    const prop = state.properties[pIndex];
    const sq = SQUARES[pIndex];
    if (!prop || prop.ownerId !== trade.recipientId) {
      return { valid: false, reason: `Recipient does not own ${sq?.name || pIndex}` };
    }
    // Check no houses in the color group
    if (sq.group) {
      const groupSquares = SQUARES.filter((s) => s.group === sq.group);
      const hasHouses = groupSquares.some((s) => (state.properties[s.index]?.houses || 0) > 0);
      if (hasHouses) {
        return { valid: false, reason: `Cannot trade ${sq.name} while properties in the ${sq.group} group have houses` };
      }
    }
  }

  // Check Jail cards
  if (trade.offeredJailCards.chance && initiator.getOutOfJailCards.chance < 1) {
    return { valid: false, reason: 'Initiator lacks Chance Jail Card' };
  }
  if (trade.offeredJailCards.communityChest && initiator.getOutOfJailCards.communityChest < 1) {
    return { valid: false, reason: 'Initiator lacks Community Chest Jail Card' };
  }
  if (trade.requestedJailCards.chance && recipient.getOutOfJailCards.chance < 1) {
    return { valid: false, reason: 'Recipient lacks Chance Jail Card' };
  }
  if (trade.requestedJailCards.communityChest && recipient.getOutOfJailCards.communityChest < 1) {
    return { valid: false, reason: 'Recipient lacks Community Chest Jail Card' };
  }

  return { valid: true };
}

export function proposeTrade(state: GameState, trade: TradeOffer): GameState {
  const validation = validateTradeOffer(state, trade);
  if (!validation.valid) {
    return state;
  }

  const initiator = state.players[trade.initiatorId];
  const recipient = state.players[trade.recipientId];

  return {
    ...state,
    activeTrade: trade,
    gameLog: [
      createLogEntry(
        `${initiator.name} proposed a trade with ${recipient.name}.`,
        'trade',
        initiator.id,
      ),
      ...state.gameLog,
    ],
  };
}

export function acceptTrade(state: GameState): GameState {
  if (!state.activeTrade) return state;
  const trade = state.activeTrade;

  const validation = validateTradeOffer(state, trade);
  if (!validation.valid) {
    return rejectTrade(state);
  }

  const nextState: GameState = {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      getOutOfJailCards: { ...p.getOutOfJailCards },
    })),
    properties: { ...state.properties },
    activeTrade: null,
  };

  const initiator = nextState.players[trade.initiatorId];
  const recipient = nextState.players[trade.recipientId];

  // Transfer Money
  initiator.money -= trade.offeredMoney;
  recipient.money += trade.offeredMoney;

  recipient.money -= trade.requestedMoney;
  initiator.money += trade.requestedMoney;

  // Transfer Offered Properties
  for (const pIdx of trade.offeredProperties) {
    nextState.properties[pIdx] = {
      ...nextState.properties[pIdx],
      ownerId: recipient.id,
    };
  }

  // Transfer Requested Properties
  for (const pIdx of trade.requestedProperties) {
    nextState.properties[pIdx] = {
      ...nextState.properties[pIdx],
      ownerId: initiator.id,
    };
  }

  // Transfer Jail Cards
  if (trade.offeredJailCards.chance) {
    initiator.getOutOfJailCards.chance -= 1;
    recipient.getOutOfJailCards.chance += 1;
  }
  if (trade.offeredJailCards.communityChest) {
    initiator.getOutOfJailCards.communityChest -= 1;
    recipient.getOutOfJailCards.communityChest += 1;
  }
  if (trade.requestedJailCards.chance) {
    recipient.getOutOfJailCards.chance -= 1;
    initiator.getOutOfJailCards.chance += 1;
  }
  if (trade.requestedJailCards.communityChest) {
    recipient.getOutOfJailCards.communityChest -= 1;
    initiator.getOutOfJailCards.communityChest += 1;
  }

  nextState.gameLog = [
    createLogEntry(
      `Trade between ${initiator.name} and ${recipient.name} was accepted!`,
      'trade',
    ),
    ...nextState.gameLog,
  ];

  return nextState;
}

export function rejectTrade(state: GameState): GameState {
  if (!state.activeTrade) return state;
  const initiator = state.players[state.activeTrade.initiatorId];
  const recipient = state.players[state.activeTrade.recipientId];

  return {
    ...state,
    activeTrade: null,
    gameLog: [
      createLogEntry(
        `${recipient?.name || 'Player'} rejected the trade offer from ${initiator?.name || 'Player'}.`,
        'trade',
      ),
      ...state.gameLog,
    ],
  };
}
