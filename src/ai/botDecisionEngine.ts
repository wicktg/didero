import { GameState, ColorGroup } from "../types/game";
import { SQUARES, COLOR_GROUPS } from "../data/boardData";
import { BOT_PROFILES } from "../data/botProfiles";
import { calculatePropertyValuation } from "./propertyValuation";
import {
  canBuildHouse,
  canMortgageProperty,
  canSellHouse,
  ownsFullGroup,
} from "../engine/gameEngine";

export interface LiquidationPlan {
  canSurvive: boolean;
  actions: Array<
    | { type: "MORTGAGE_PROPERTY"; payload: { propertyIndex: number } }
    | { type: "SELL_HOUSE"; payload: { propertyIndex: number } }
  >;
}

export function evaluateBotBuy(
  state: GameState,
  botId: number,
  propertyIndex: number,
): boolean {
  const square = SQUARES[propertyIndex];
  const bot = state.players[botId];
  const profile = BOT_PROFILES.find((p) => p.id === botId) || BOT_PROFILES[0];

  if (!square || !square.price || bot.money < square.price) {
    return false;
  }

  const remainingCash = bot.money - square.price;
  return remainingCash >= profile.reserveCash;
}

export function evaluateBotAuctionBid(
  state: GameState,
  botId: number,
): number | "PASS" | "EXIT" {
  if (!state.activeAuction) return "PASS";
  const auction = state.activeAuction;
  const square = SQUARES[auction.propertyIndex];
  const bot = state.players[botId];

  if (!square || bot.money < auction.highestBid + auction.minIncrement) {
    return "EXIT";
  }

  const valuation = calculatePropertyValuation(
    state,
    botId,
    auction.propertyIndex,
  );
  const minRequiredBid =
    auction.highestBid === 0 ? 10 : auction.highestBid + auction.minIncrement;

  if (minRequiredBid <= valuation && minRequiredBid <= bot.money) {
    return minRequiredBid;
  }

  return "PASS";
}

export function evaluateBotJail(
  state: GameState,
  botId: number,
): "PAY_FINE" | "USE_CARD" | "ROLL" {
  const bot = state.players[botId];
  const profile = BOT_PROFILES.find((p) => p.id === botId) || BOT_PROFILES[0];

  // Count unowned properties left on board
  const unownedCount = Object.values(state.properties).filter(
    (p) => p.ownerId === null && SQUARES[p.index].price,
  ).length;

  const hasCard =
    bot.getOutOfJailCards.chance > 0 ||
    bot.getOutOfJailCards.communityChest > 0;

  if (hasCard) {
    return "USE_CARD";
  }

  // If unowned properties exist (early game) or profile is early_exit -> pay fine to get out
  if (
    (unownedCount > 10 || profile.jailTolerance === "early_exit") &&
    bot.money >= 100
  ) {
    return "PAY_FINE";
  }

  // Otherwise try to roll doubles
  return "ROLL";
}

export function evaluateBotHouseBuilding(
  state: GameState,
  botId: number,
): number[] {
  const bot = state.players[botId];
  const profile = BOT_PROFILES.find((p) => p.id === botId) || BOT_PROFILES[0];
  const buildTargets: number[] = [];

  let currentMoney = bot.money;

  // Check each color group
  (Object.keys(COLOR_GROUPS) as ColorGroup[]).forEach((group) => {
    if (!ownsFullGroup(state, botId, group)) return;

    const groupSquares = SQUARES.filter((s) => s.group === group);
    const housePrice = COLOR_GROUPS[group].housePrice;

    // Check if any property in group is below target house threshold
    for (const sq of groupSquares) {
      const prop = state.properties[sq.index];
      if (
        prop &&
        prop.houses < profile.housingRushThreshold &&
        currentMoney - housePrice >= profile.reserveCash &&
        canBuildHouse(state, botId, sq.index)
      ) {
        buildTargets.push(sq.index);
        currentMoney -= housePrice;
      }
    }
  });

  return buildTargets;
}

export function evaluateBotDebtLiquidation(
  state: GameState,
  botId: number,
  _debtAmount: number,
): LiquidationPlan {
  const bot = state.players[botId];
  const actions: LiquidationPlan["actions"] = [];
  let fundsRaised = bot.money; // Could be negative

  // 1. Mortgage unmonopolized single properties
  const ownedProps = Object.values(state.properties).filter(
    (p) => p.ownerId === botId && !p.isMortgaged,
  );

  for (const prop of ownedProps) {
    const sq = SQUARES[prop.index];
    // If not a monopoly or railroad/utility, mortgage first
    const isMono = sq.group ? ownsFullGroup(state, botId, sq.group) : false;
    if (!isMono && canMortgageProperty(state, botId, prop.index)) {
      actions.push({
        type: "MORTGAGE_PROPERTY",
        payload: { propertyIndex: prop.index },
      });
      fundsRaised += Math.round((sq.price || 0) * 0.5);
      if (fundsRaised >= 0) {
        return { canSurvive: true, actions };
      }
    }
  }

  // 2. Sell houses evenly
  const developedProps = Object.values(state.properties).filter(
    (p) => p.ownerId === botId && p.houses > 0,
  );

  for (const prop of developedProps) {
    const sq = SQUARES[prop.index];
    if (canSellHouse(state, botId, prop.index)) {
      actions.push({
        type: "SELL_HOUSE",
        payload: { propertyIndex: prop.index },
      });
      fundsRaised += Math.round((sq.housePrice || 0) * 0.5);
      if (fundsRaised >= 0) {
        return { canSurvive: true, actions };
      }
    }
  }

  // 3. Mortgage remaining monopoly properties
  for (const prop of ownedProps) {
    const sq = SQUARES[prop.index];
    if (canMortgageProperty(state, botId, prop.index)) {
      actions.push({
        type: "MORTGAGE_PROPERTY",
        payload: { propertyIndex: prop.index },
      });
      fundsRaised += Math.round((sq.price || 0) * 0.5);
      if (fundsRaised >= 0) {
        return { canSurvive: true, actions };
      }
    }
  }

  return {
    canSurvive: fundsRaised >= 0,
    actions,
  };
}
