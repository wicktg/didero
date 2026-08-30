import React from 'react';
import { useGame } from '../../context/GameContext';
import { SQUARES } from '../../data/boardData';
import { Gavel, ArrowRight, UserX } from 'lucide-react';

export const AuctionModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const auction = state.activeAuction;

  if (state.turnPhase !== 'AUCTION' || !auction) return null;

  const square = SQUARES[auction.propertyIndex];
  const highestBidder = auction.highestBidderId !== null ? state.players[auction.highestBidderId] : null;
  const currentBidder = state.players[auction.currentBidderId];
  const isHumanCurrentBidder = auction.currentBidderId === 0;
  const human = state.players[0];

  const minRequiredBid = auction.highestBid === 0 ? 10 : auction.highestBid + auction.minIncrement;

  const handlePlaceBid = (amount: number) => {
    if (amount >= minRequiredBid && amount <= human.money) {
      dispatch({ type: 'PLACE_AUCTION_BID', payload: { playerId: 0, amount } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-800 rounded-lg">
              <Gavel className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Public Property Auction</h3>
              <p className="text-[10px] text-neutral-400">Official tournament bidding rules</p>
            </div>
          </div>

          {square.color && (
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-2xs"
              style={{ backgroundColor: square.color }}
            >
              {square.name}
            </span>
          )}
        </div>

        {/* Current Bid Arena */}
        <div className="p-5 flex flex-col items-center text-center border-b border-neutral-200 bg-neutral-50/50">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
            Highest Bid
          </span>
          <div className="text-3xl font-extrabold text-neutral-900 tracking-tight my-1 tabular-nums">
            ${auction.highestBid}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-700 mt-0.5">
            <span>Held by:</span>
            {highestBidder ? (
              <span className="font-bold flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: highestBidder.token.color }}
                />
                {highestBidder.name}
              </span>
            ) : (
              <span className="text-neutral-400 font-medium">No bids yet</span>
            )}
          </div>
        </div>

        {/* Participant Turn Indicator */}
        <div className="p-4 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-neutral-700">Current Turn:</span>
            <span className="flex items-center gap-1.5 font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
              <span
                className="w-2 h-2 rounded-full inline-block animate-ping"
                style={{ backgroundColor: currentBidder?.token.color || '#3B82F6' }}
              />
              {currentBidder?.name} {isHumanCurrentBidder && '(You)'}
            </span>
          </div>

          {/* Active Participants Pills */}
          <div className="flex flex-wrap gap-1">
            {state.players.map((p) => {
              if (p.isBankrupt) return null;
              const isActive = auction.activeParticipants.includes(p.id);
              const isTurn = auction.currentBidderId === p.id;

              return (
                <div
                  key={p.id}
                  className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                    isTurn
                      ? 'bg-blue-600 text-white font-bold shadow-xs scale-105'
                      : isActive
                      ? 'bg-neutral-100 text-neutral-700 font-medium border border-neutral-200'
                      : 'bg-neutral-50 text-neutral-400 line-through'
                  }`}
                >
                  <span>{p.token.icon}</span>
                  <span>{p.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Human Interactive Controls */}
        {isHumanCurrentBidder ? (
          <div className="p-4 bg-neutral-50 flex flex-col gap-3">
            <div className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
              <span>Your Turn to Bid</span>
              <span className="text-emerald-700 font-bold tabular-nums">Balance: ${human.money}</span>
            </div>

            {/* Quick Bid Increment Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={human.money < minRequiredBid}
                onClick={() => handlePlaceBid(minRequiredBid)}
                className="py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-neutral-200 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1"
              >
                Bid ${minRequiredBid}
              </button>

              <button
                type="button"
                disabled={human.money < auction.highestBid + 50}
                onClick={() => handlePlaceBid(Math.max(minRequiredBid, auction.highestBid + 50))}
                className="py-2 bg-neutral-800 hover:bg-neutral-900 disabled:bg-neutral-200 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
              >
                + $50
              </button>

              <button
                type="button"
                disabled={human.money < auction.highestBid + 100}
                onClick={() => handlePlaceBid(Math.max(minRequiredBid, auction.highestBid + 100))}
                className="py-2 bg-neutral-800 hover:bg-neutral-900 disabled:bg-neutral-200 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
              >
                + $100
              </button>
            </div>

            {/* Pass / Exit Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => dispatch({ type: 'PASS_AUCTION_BID', payload: { playerId: 0 } })}
                className="py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Pass This Round
              </button>

              <button
                type="button"
                onClick={() => dispatch({ type: 'EXIT_AUCTION', payload: { playerId: 0 } })}
                className="py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1"
              >
                <UserX className="w-3.5 h-3.5" /> Exit Auction
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-neutral-50 text-center flex flex-col items-center justify-center text-neutral-600 text-xs gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
            <span className="font-semibold">{currentBidder?.name} is evaluating their bid...</span>
          </div>
        )}
      </div>
    </div>
  );
};
