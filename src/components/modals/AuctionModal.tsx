import React from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES } from "../../data/boardData";
import { Gavel, UserX } from "lucide-react";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { formatDID } from "../../utils/didUtils";

export const AuctionModal: React.FC = () => {
  const { state, dispatch } = useGame();
  const auction = state.activeAuction;

  if (state.turnPhase !== "AUCTION" || !auction) return null;

  const square = SQUARES[auction.propertyIndex];
  const highestBidder =
    auction.highestBidderId !== null
      ? state.players[auction.highestBidderId]
      : null;
  const currentBidder = state.players[auction.currentBidderId];
  const isHumanCurrentBidder = auction.currentBidderId === 0;
  const human = state.players[0];

  const minRequiredBid =
    auction.highestBid === 0
      ? 10
      : auction.highestBid + auction.minIncrement;

  const handlePlaceBid = (amount: number) => {
    if (amount >= minRequiredBid && amount <= human.money) {
      dispatch({
        type: "PLACE_AUCTION_BID",
        payload: { playerId: 0, amount },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border-2 border-black overflow-hidden select-none">
        {/* Light Header with Board Blue */}
        <div className="p-3.5 bg-[#c9daf8] text-black flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-black" />
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">
                Public Auction
              </h3>
              <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
                Tournament Bidding
              </p>
            </div>
          </div>

          {square.color && (
            <span
              className="px-2.5 py-1 rounded text-xs font-bold text-white uppercase border border-black"
              style={{ backgroundColor: square.color }}
            >
              {square.name}
            </span>
          )}
        </div>

        {/* Current Bid Arena */}
        <div className="p-4 flex flex-col items-center text-center border-b-2 border-black bg-white">
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-neutral-600">
            Highest Bid
          </span>
          <div className="text-3xl font-black text-black tracking-tight my-1 tabular-nums">
            ${auction.highestBid}
          </div>

          <div className="flex items-center gap-2 text-xs text-black mt-0.5 font-bold">
            <span>Leader:</span>
            {highestBidder ? (
              <div className="flex items-center gap-1.5 uppercase font-mono font-black">
                <IdenticonAvatar
                  name={highestBidder.did || highestBidder.name}
                  size={18}
                  color={highestBidder.token.color}
                />
                <span>{formatDID(highestBidder.did || highestBidder.name, highestBidder.id)}</span>
                {highestBidder.id === 0 && (
                  <span className="bg-[#ffc905] text-black text-[8px] font-black px-1.5 py-0.5 rounded-xs border border-black uppercase tracking-wider">
                    YOU
                  </span>
                )}
              </div>
            ) : (
              <span className="text-neutral-500 uppercase font-medium">
                No bids yet
              </span>
            )}
          </div>
        </div>

        {/* Turn Status */}
        <div className="p-3 bg-[#c9daf8]/40 border-b-2 border-black">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-extrabold uppercase tracking-wider text-black">
              Current Turn:
            </span>
            <div className="flex items-center gap-1.5 font-bold text-black uppercase bg-[#ffc905] px-2 py-0.5 rounded border border-black text-[11px]">
              {currentBidder && (
                <IdenticonAvatar
                  name={currentBidder.did || currentBidder.name}
                  size={16}
                  color={currentBidder.token.color}
                />
              )}
              <span className="font-mono font-black">
                {formatDID(currentBidder?.did || currentBidder?.name, currentBidder?.id)}
              </span>
              {isHumanCurrentBidder && (
                <span className="bg-[#ffc905] text-black text-[8px] font-black px-1 py-0.2 rounded-xs border border-black uppercase tracking-wider">
                  YOU
                </span>
              )}
            </div>
          </div>

          {/* Active Participants */}
          <div className="flex flex-wrap gap-1">
            {auction.activeParticipants.map((pid: number) => {
              const p = state.players[pid];
              const isTurn = pid === auction.currentBidderId;
              const isLeader = pid === auction.highestBidderId;

              return (
                <div
                  key={pid}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border-[1.5px] border-black transition-colors ${
                    isTurn
                      ? "bg-[#008ed2] text-white"
                      : isLeader
                      ? "bg-[#a5cd39] text-black"
                      : "bg-white text-black"
                  }`}
                >
                  <IdenticonAvatar
                    name={p.did || p.name}
                    size={14}
                    color={p.token.color}
                  />
                  <span className="font-mono font-black">{formatDID(p.did || p.name, p.id)}</span>
                  {pid === 0 && (
                    <span className="bg-[#ffc905] text-black text-[7px] font-black px-1 py-px rounded-xs border border-black uppercase">
                      YOU
                    </span>
                  )}
                  {isLeader && <span>★</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Human Interactive Controls */}
        {isHumanCurrentBidder ? (
          <div className="p-4 bg-white flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-black">
                Your Balance:{" "}
                <strong className="text-black tabular-nums">
                  ${human.money}
                </strong>
              </span>
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                Min Bid:{" "}
                <strong className="text-black tabular-nums">
                  ${minRequiredBid}
                </strong>
              </span>
            </div>

            {/* Bid Amount Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {[minRequiredBid, minRequiredBid + 25, minRequiredBid + 50].map(
                (amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={amt > human.money}
                    onClick={() => handlePlaceBid(amt)}
                    className={`py-2 rounded-md font-extrabold text-xs uppercase tracking-wider border-[1.5px] border-black transition-colors active:translate-y-px ${
                      amt <= human.money
                        ? "bg-[#a5cd39] hover:bg-[#94b833] text-black"
                        : "bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed"
                    }`}
                  >
                    Bid ${amt}
                  </button>
                )
              )}
            </div>

            {/* Pass & Exit Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t-2 border-black">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "PASS_AUCTION_BID",
                    payload: { playerId: 0 },
                  })
                }
                className="py-2 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded-md text-xs font-extrabold uppercase tracking-wider transition-colors active:translate-y-px"
              >
                Pass Round
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "EXIT_AUCTION",
                    payload: { playerId: 0 },
                  })
                }
                className="py-2 bg-[#eb1c24] hover:bg-[#d61920] text-white border-[1.5px] border-black rounded-md text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors active:translate-y-px"
              >
                <UserX className="w-3.5 h-3.5" /> Drop Out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white text-center flex flex-col items-center justify-center gap-1.5 text-xs text-black">
            <span className="font-extrabold uppercase tracking-wide">
              {currentBidder?.name} is deciding...
            </span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Automated AI Decision Engine
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
