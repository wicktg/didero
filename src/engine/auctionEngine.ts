import { GameState, AuctionState } from "../types/game";
import { SQUARES } from "../data/boardData";
import { createLogEntry } from "./gameEngine";

export function startAuction(
  state: GameState,
  propertyIndex: number,
): GameState {
  const square = SQUARES[propertyIndex];
  if (!square) return state;

  // Active bidders: all non-bankrupt players
  const activeParticipants = state.players
    .filter((p) => !p.isBankrupt && p.money > 0)
    .map((p) => p.id);

  if (activeParticipants.length === 0) {
    return {
      ...state,
      turnPhase: "END_TURN",
    };
  }

  // Next bidder starts after current player
  let currentBidderId = state.currentTurnPlayerId;

  const auction: AuctionState = {
    propertyIndex,
    highestBid: 0,
    highestBidderId: null,
    currentBidderId,
    activeParticipants,
    minIncrement: 10,
  };

  const nextState: GameState = {
    ...state,
    turnPhase: "AUCTION",
    activeAuction: auction,
    gameLog: [
      createLogEntry(
        `Auction started for ${square.name}! Starting bid is $10.`,
        "auction",
      ),
      ...state.gameLog,
    ],
  };

  return nextState;
}

export function placeBid(
  state: GameState,
  playerId: number,
  amount: number,
): GameState {
  if (!state.activeAuction) return state;
  const auction = { ...state.activeAuction };
  const player = state.players[playerId];
  const square = SQUARES[auction.propertyIndex];

  if (!player || player.isBankrupt || player.money < amount) {
    return state;
  }

  const minRequired =
    auction.highestBid === 0 ? 10 : auction.highestBid + auction.minIncrement;
  if (amount < minRequired) {
    return state;
  }

  auction.highestBid = amount;
  auction.highestBidderId = playerId;

  // Advance bidder to next in active list
  const currentIdx = auction.activeParticipants.indexOf(playerId);
  const nextIdx = (currentIdx + 1) % auction.activeParticipants.length;
  auction.currentBidderId = auction.activeParticipants[nextIdx];

  const nextState: GameState = {
    ...state,
    activeAuction: auction,
    gameLog: [
      createLogEntry(
        `${player.name} bid $${amount} for ${square.name}.`,
        "auction",
        playerId,
      ),
      ...state.gameLog,
    ],
  };

  return nextState;
}

export function passBid(state: GameState, playerId: number): GameState {
  if (!state.activeAuction) return state;
  const auction = { ...state.activeAuction };

  const currentIdx = auction.activeParticipants.indexOf(playerId);
  if (currentIdx === -1) return state;

  const nextIdx = (currentIdx + 1) % auction.activeParticipants.length;
  const nextBidderId = auction.activeParticipants[nextIdx];

  // If next bidder is the current highest bidder, they won!
  if (
    auction.highestBidderId !== null &&
    nextBidderId === auction.highestBidderId
  ) {
    return finalizeAuction(state);
  }

  // If everyone passed without any bids and we completed a full circle
  if (
    auction.highestBidderId === null &&
    nextIdx === 0 &&
    playerId ===
      auction.activeParticipants[auction.activeParticipants.length - 1]
  ) {
    return finalizeAuction(state);
  }

  auction.currentBidderId = nextBidderId;

  return {
    ...state,
    activeAuction: auction,
  };
}

export function exitAuction(state: GameState, playerId: number): GameState {
  if (!state.activeAuction) return state;
  const auction = { ...state.activeAuction };
  const player = state.players[playerId];
  const square = SQUARES[auction.propertyIndex];

  auction.activeParticipants = auction.activeParticipants.filter(
    (id) => id !== playerId,
  );

  const nextState: GameState = {
    ...state,
    gameLog: [
      createLogEntry(
        `${player.name} withdrew from the auction for ${square.name}.`,
        "auction",
        playerId,
      ),
      ...state.gameLog,
    ],
  };

  // If only 1 bidder left and there's a bid
  if (
    auction.activeParticipants.length === 1 &&
    auction.highestBidderId === auction.activeParticipants[0]
  ) {
    return finalizeAuction(nextState);
  }

  // If 0 bidders left
  if (auction.activeParticipants.length === 0) {
    return finalizeAuction(nextState);
  }

  // Advance current bidder if exited player was current
  if (auction.currentBidderId === playerId) {
    auction.currentBidderId = auction.activeParticipants[0];
  }

  return {
    ...nextState,
    activeAuction: auction,
  };
}

export function finalizeAuction(state: GameState): GameState {
  if (!state.activeAuction) return state;
  const auction = state.activeAuction;
  const square = SQUARES[auction.propertyIndex];

  let nextState: GameState = {
    ...state,
    activeAuction: null,
  };

  if (auction.highestBidderId !== null && auction.highestBid > 0) {
    const winner = { ...nextState.players[auction.highestBidderId] };
    winner.money -= auction.highestBid;

    nextState.players = [...nextState.players];
    nextState.players[auction.highestBidderId] = winner;

    nextState.properties = {
      ...nextState.properties,
      [auction.propertyIndex]: {
        ...nextState.properties[auction.propertyIndex],
        ownerId: auction.highestBidderId,
      },
    };

    nextState.gameLog = [
      createLogEntry(
        `${winner.name} won the auction for ${square.name} with a winning bid of $${auction.highestBid}!`,
        "auction",
        winner.id,
      ),
      ...nextState.gameLog,
    ];
  } else {
    nextState.gameLog = [
      createLogEntry(
        `No bids placed on ${square.name}. Property remains unowned with the Bank.`,
        "auction",
      ),
      ...nextState.gameLog,
    ];
  }

  const currentTurnPlayer = nextState.players[nextState.currentTurnPlayerId];
  const isDoubles =
    nextState.dice[0] === nextState.dice[1] &&
    !currentTurnPlayer.inJail &&
    nextState.consecutiveDoubles > 0;
  nextState.turnPhase = isDoubles ? "ROLL" : "END_TURN";

  return nextState;
}
