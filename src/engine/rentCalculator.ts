import { SQUARES, GROUP_MEMBERS } from '../data/boardData';
import { ColorGroup, PropertyState } from '../types/game';

export function getOwnedCountInGroup(
  ownerId: number,
  groupNumber: number,
  properties: Record<number, PropertyState>,
): number {
  const members = GROUP_MEMBERS[groupNumber] || [];
  return members.filter((idx) => properties[idx]?.ownerId === ownerId).length;
}

export function doesPlayerOwnMonopoly(
  ownerId: number,
  group: ColorGroup,
  properties: Record<number, PropertyState>,
): boolean {
  const groupSquares = SQUARES.filter((s) => s.group === group);
  if (groupSquares.length === 0) return false;
  return groupSquares.every((s) => properties[s.index]?.ownerId === ownerId);
}

export function calculateRent(
  squareIndex: number,
  landingPlayerId: number,
  diceTotal: number,
  properties: Record<number, PropertyState>,
  utilityMultiplierOverride?: number, // e.g. from Chance card 10x dice
  railroadMultiplierOverride?: number, // e.g. from Chance card 2x rent
): number {
  const square = SQUARES[squareIndex];
  if (!square) return 0;

  const propState = properties[squareIndex];
  if (!propState || propState.ownerId === null || propState.ownerId === landingPlayerId || propState.isMortgaged) {
    return 0;
  }

  const ownerId = propState.ownerId;

  // 1. Street Property Rent
  if (square.type === 'STREET' && square.rent && square.group) {
    // If developed with houses (1-4) or hotel (5)
    if (propState.houses > 0) {
      return square.rent[propState.houses] || 0;
    }

    // Unimproved street
    const hasMonopoly = doesPlayerOwnMonopoly(ownerId, square.group, properties);
    const baseRent = square.rent[0] || 0;
    return hasMonopoly ? baseRent * 2 : baseRent;
  }

  // 2. Railroad Rent
  if (square.type === 'RAILROAD') {
    const railroadsOwned = getOwnedCountInGroup(ownerId, 2, properties); // Group 2 = Railroads
    // 1 RR: 25, 2 RR: 50, 3 RR: 100, 4 RR: 200
    const standardRentTable = [0, 25, 50, 100, 200];
    const baseRent = standardRentTable[Math.min(railroadsOwned, 4)] || 25;
    return railroadMultiplierOverride ? baseRent * railroadMultiplierOverride : baseRent;
  }

  // 3. Utility Rent
  if (square.type === 'UTILITY') {
    if (utilityMultiplierOverride) {
      return diceTotal * utilityMultiplierOverride;
    }
    const utilitiesOwned = getOwnedCountInGroup(ownerId, 1, properties); // Group 1 = Utilities
    // 1 Utility: 4x dice, 2 Utilities: 10x dice
    const multiplier = utilitiesOwned >= 2 ? 10 : 4;
    return diceTotal * multiplier;
  }

  return 0;
}
