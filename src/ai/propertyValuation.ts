import { GameState } from '../types/game';
import { SQUARES } from '../data/boardData';
import { BOT_PROFILES } from '../data/botProfiles';

export function calculatePropertyValuation(
  state: GameState,
  botId: number,
  propertyIndex: number,
): number {
  const square = SQUARES[propertyIndex];
  const prop = state.properties[propertyIndex];
  if (!square || !square.price) return 0;

  const botProfile = BOT_PROFILES.find((p) => p.id === botId) || BOT_PROFILES[0];
  let baseValue = square.price * (prop.isMortgaged ? 0.5 : 1.0);

  // Preferred color groups multiplier
  if (square.group && botProfile.preferredGroups.includes(square.group)) {
    baseValue *= 1.15;
  }

  // Monopoly completion multiplier
  if (square.group) {
    const groupSquares = SQUARES.filter((s) => s.group === square.group);
    const ownedCount = groupSquares.filter(
      (s) => state.properties[s.index]?.ownerId === botId,
    ).length;

    // If bot already owns (total - 1), acquiring this completes the monopoly!
    if (ownedCount === groupSquares.length - 1 && prop.ownerId !== botId) {
      baseValue *= 2.2;
    } else if (ownedCount > 0 && prop.ownerId !== botId) {
      baseValue *= 1.4;
    }
  }

  // Railroad collection multiplier
  if (square.type === 'RAILROAD') {
    const rrSquares = SQUARES.filter((s) => s.type === 'RAILROAD');
    const ownedRRs = rrSquares.filter((s) => state.properties[s.index]?.ownerId === botId).length;
    baseValue *= 1 + ownedRRs * 0.35;
  }

  // Utility collection multiplier
  if (square.type === 'UTILITY') {
    const utilSquares = SQUARES.filter((s) => s.type === 'UTILITY');
    const ownedUtils = utilSquares.filter((s) => state.properties[s.index]?.ownerId === botId).length;
    baseValue *= 1 + ownedUtils * 0.4;
  }

  // Apply bot personality aggressiveness multiplier
  return Math.round(baseValue * botProfile.auctionAggressiveness);
}
