import { GameState, TradeOffer } from '../types/game';
import { calculatePropertyValuation } from './propertyValuation';
import { BOT_PROFILES } from '../data/botProfiles';

export function evaluateTradeForBot(
  state: GameState,
  botId: number,
  trade: TradeOffer,
): boolean {
  const botProfile = BOT_PROFILES.find((p) => p.id === botId) || BOT_PROFILES[0];
  const isRecipient = trade.recipientId === botId;

  const offeredCash = isRecipient ? trade.offeredMoney : trade.requestedMoney;
  const requestedCash = isRecipient ? trade.requestedMoney : trade.offeredMoney;

  const gainedProperties = isRecipient ? trade.offeredProperties : trade.requestedProperties;
  const lostProperties = isRecipient ? trade.requestedProperties : trade.offeredProperties;

  const gainedJailCards = isRecipient
    ? (trade.offeredJailCards.chance ? 1 : 0) + (trade.offeredJailCards.communityChest ? 1 : 0)
    : (trade.requestedJailCards.chance ? 1 : 0) + (trade.requestedJailCards.communityChest ? 1 : 0);

  const lostJailCards = isRecipient
    ? (trade.requestedJailCards.chance ? 1 : 0) + (trade.requestedJailCards.communityChest ? 1 : 0)
    : (trade.offeredJailCards.chance ? 1 : 0) + (trade.offeredJailCards.communityChest ? 1 : 0);

  // Calculate value of gained assets
  let gainedValue = offeredCash + gainedJailCards * 40;
  for (const pIdx of gainedProperties) {
    gainedValue += calculatePropertyValuation(state, botId, pIdx);
  }

  // Calculate value of lost assets
  let lostValue = requestedCash + lostJailCards * 40;
  for (const pIdx of lostProperties) {
    lostValue += calculatePropertyValuation(state, botId, pIdx) * 1.1; // Premium to give away assets
  }

  // Multiply by bot's trade willingness
  return gainedValue >= lostValue * botProfile.tradeWillingness;
}
