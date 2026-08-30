import React from 'react';
import { SQUARES } from '../../data/boardData';
import { PlayerState } from '../../types/game';
import { TokenBadge } from './TokenBadge';
import { ArrowLeft, ShieldAlert, Car, Building2 } from 'lucide-react';

interface CornerCellProps {
  index: number;
  playersOnSquare: PlayerState[];
  currentTurnPlayerId: number;
  gridAreaClass: string;
}

export const CornerCell: React.FC<CornerCellProps> = ({
  index,
  playersOnSquare,
  currentTurnPlayerId,
  gridAreaClass,
}) => {
  const square = SQUARES[index];

  // Specific corner renderers
  const renderCornerContent = () => {
    switch (index) {
      case 0: // GO
        return (
          <div className="flex flex-col items-center justify-center h-full p-2 text-center bg-emerald-50/60">
            <span className="text-[10px] font-semibold text-emerald-800 tracking-wider uppercase">Collect $200</span>
            <span className="text-xl font-extrabold text-emerald-700 tracking-tight flex items-center gap-1">
              GO <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="text-[9px] text-emerald-600 font-medium">As you pass</span>
          </div>
        );

      case 10: { // JAIL / Just Visiting
        const inJailPlayers = playersOnSquare.filter((p) => p.inJail);
        const visitingPlayers = playersOnSquare.filter((p) => !p.inJail);

        return (
          <div className="relative w-full h-full flex flex-col justify-between p-1 bg-amber-50/40 text-neutral-800">
            {/* Just Visiting outer label */}
            <div className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider text-center">
              Visiting
            </div>

            {/* In Jail Center Box */}
            <div className="flex-1 my-1 border border-neutral-700 bg-neutral-900/90 rounded p-1 flex flex-col items-center justify-center text-white shadow-xs">
              <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">In Jail</span>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 max-w-[50px]">
                {inJailPlayers.map((p) => (
                  <TokenBadge
                    key={p.id}
                    player={p}
                    size="sm"
                    isCurrentTurn={p.id === currentTurnPlayerId}
                  />
                ))}
              </div>
            </div>

            {/* Visiting tokens tray */}
            <div className="flex flex-wrap gap-0.5 justify-center min-h-[16px]">
              {visitingPlayers.map((p) => (
                <TokenBadge
                  key={p.id}
                  player={p}
                  size="sm"
                  isCurrentTurn={p.id === currentTurnPlayerId}
                />
              ))}
            </div>
          </div>
        );
      }

      case 20: // FREE PARKING
        return (
          <div className="flex flex-col items-center justify-center h-full p-2 text-center bg-blue-50/60">
            <Car className="w-5 h-5 text-blue-700 mb-0.5" />
            <span className="text-xs font-bold text-blue-900 leading-tight uppercase">Free</span>
            <span className="text-xs font-bold text-blue-900 leading-tight uppercase">Parking</span>
            <span className="text-[8px] text-blue-600 font-medium mt-0.5">Rest Stop</span>
          </div>
        );

      case 30: // GO TO JAIL
        return (
          <div className="flex flex-col items-center justify-center h-full p-2 text-center bg-red-50/70">
            <ShieldAlert className="w-5 h-5 text-red-700 mb-0.5 animate-bounce" />
            <span className="text-xs font-extrabold text-red-900 leading-tight uppercase">Go To</span>
            <span className="text-xs font-extrabold text-red-900 leading-tight uppercase">Jail</span>
            <span className="text-[8px] text-red-600 font-medium mt-0.5">Directly</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`border border-neutral-300 bg-white relative overflow-hidden flex flex-col select-none shadow-xs ${gridAreaClass}`}
    >
      {renderCornerContent()}

      {/* Non-jail Corner Tokens Display (for 0, 20, 30) */}
      {index !== 10 && playersOnSquare.length > 0 && (
        <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 max-w-[48px] justify-end">
          {playersOnSquare.map((p) => (
            <TokenBadge
              key={p.id}
              player={p}
              size="sm"
              isCurrentTurn={p.id === currentTurnPlayerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
