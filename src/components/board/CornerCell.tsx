import React from 'react';
import { PlayerState } from '../../types/game';
import { TokenBadge } from './TokenBadge';
import { ArrowLeft, Car, ShieldAlert } from 'lucide-react';

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
  const renderCornerContent = () => {
    switch (index) {
      case 0: // GO
        return (
          <div className="w-full h-full relative flex flex-col items-center justify-center p-1.5 text-center bg-[#edf7ee] select-none">
            <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">
              Collect $200
            </span>
            <span className="text-xl font-black text-emerald-700 tracking-tight flex items-center gap-0.5 my-0.5">
              GO <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </span>
            <span className="text-[7px] text-emerald-600/90 font-semibold">
              As you pass
            </span>
          </div>
        );

      case 10: {
        // JAIL
        const inJailPlayers = playersOnSquare.filter((p) => p.inJail);
        const visitingPlayers = playersOnSquare.filter((p) => !p.inJail);

        return (
          <div className="w-full h-full relative flex flex-col justify-between p-1 bg-[#fbf6ec] select-none">
            <div className="text-[7px] font-bold text-neutral-500 uppercase tracking-wider text-center">
              Visiting
            </div>

            {/* In Jail Center Box */}
            <div
              className="my-auto border border-neutral-700 bg-neutral-900/90 rounded p-1 flex flex-col items-center justify-center text-white shadow-xs"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.06) 3px, rgba(255,255,255,0.06) 4px)',
              }}
            >
              <span className="text-[8px] font-bold tracking-widest text-amber-300 uppercase">
                In Jail
              </span>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 max-w-[45px]">
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
            <div className="flex flex-wrap gap-0.5 justify-center min-h-[14px]">
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
          <div className="w-full h-full relative flex flex-col items-center justify-center p-1.5 text-center bg-[#eaf4fb] select-none">
            <Car className="w-5 h-5 text-sky-700 mb-0.5" />
            <span className="text-[9px] font-black text-sky-900 uppercase leading-tight">
              Free
            </span>
            <span className="text-[9px] font-black text-sky-900 uppercase leading-tight">
              Parking
            </span>
          </div>
        );

      case 30: // GO TO JAIL
        return (
          <div className="w-full h-full relative flex flex-col items-center justify-center p-1.5 text-center bg-[#fdeeee] select-none">
            <ShieldAlert className="w-5 h-5 text-red-700 mb-0.5" />
            <span className="text-[9px] font-black text-red-900 uppercase leading-tight">
              Go To
            </span>
            <span className="text-[9px] font-black text-red-900 uppercase leading-tight">
              Jail
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white relative overflow-hidden flex flex-col select-none ${gridAreaClass}`}
    >
      {renderCornerContent()}

      {/* Non-jail corner player tokens */}
      {index !== 10 && playersOnSquare.length > 0 && (
        <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 max-w-[48px] justify-end z-20">
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
