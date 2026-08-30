import React from 'react';
import { SQUARES } from '../../data/boardData';
import { PlayerState, PropertyState } from '../../types/game';
import { HouseHotelPips } from './HouseHotelPips';
import { TokenBadge } from './TokenBadge';
import { Train, Zap, Droplets, HelpCircle, Box, DollarSign } from 'lucide-react';

interface SquareCellProps {
  index: number;
  propState: PropertyState;
  playersOnSquare: PlayerState[];
  currentTurnPlayerId: number;
  allPlayers: PlayerState[];
  gridAreaClass: string;
  onInspect: (index: number) => void;
}

export const SquareCell: React.FC<SquareCellProps> = ({
  index,
  propState,
  playersOnSquare,
  currentTurnPlayerId,
  allPlayers,
  gridAreaClass,
  onInspect,
}) => {
  const square = SQUARES[index];
  if (!square) return null;

  let orientation: 'bottom' | 'left' | 'top' | 'right' = 'bottom';
  if (index > 0 && index < 10) orientation = 'bottom';
  else if (index > 10 && index < 20) orientation = 'left';
  else if (index > 20 && index < 30) orientation = 'top';
  else if (index > 30 && index < 40) orientation = 'right';

  const owner = propState.ownerId !== null ? allPlayers[propState.ownerId] : null;

  const renderSquareIcon = () => {
    switch (square.type) {
      case 'RAILROAD':
        return <Train className="w-4 h-4 text-neutral-700" />;
      case 'UTILITY':
        return index === 12 ? (
          <Zap className="w-4 h-4 text-amber-600" />
        ) : (
          <Droplets className="w-4 h-4 text-blue-600" />
        );
      case 'CHANCE':
        return <HelpCircle className="w-4 h-4 text-amber-700" />;
      case 'COMMUNITY_CHEST':
        return <Box className="w-4 h-4 text-blue-800" />;
      case 'TAX':
        return <DollarSign className="w-4 h-4 text-neutral-700" />;
      default:
        return null;
    }
  };

  const renderColorBand = () => {
    if (square.type !== 'STREET' || !square.color) return null;

    const bandClasses = {
      bottom: 'h-[18px] w-full border-b border-black/15 shrink-0',
      left: 'w-[18px] h-full border-l border-black/15 shrink-0',
      top: 'h-[18px] w-full border-t border-black/15 shrink-0',
      right: 'w-[18px] h-full border-r border-black/15 shrink-0',
    }[orientation];

    return (
      <div
        className={`relative flex items-center justify-center ${bandClasses}`}
        style={{ backgroundColor: square.color }}
      >
        <HouseHotelPips houses={propState.houses} orientation={orientation} />
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={() => onInspect(index)}
      className={`group relative flex select-none text-left transition-colors duration-150 hover:bg-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white overflow-hidden ${
        orientation === 'left' || orientation === 'right'
          ? 'flex-row'
          : 'flex-col'
      } ${gridAreaClass}`}
      title={`${square.name}${owner ? ` — Owned by ${owner.name}` : ''}`}
    >
      {/* Color band placed on the inner board edge */}
      {(orientation === 'bottom' || orientation === 'right') && renderColorBand()}

      <div className="flex-1 flex flex-col justify-between p-1 w-full h-full min-h-0 min-w-0">
        <div className="flex flex-col items-center text-center">
          {renderSquareIcon()}
          <span className="text-[8px] font-bold text-neutral-800 leading-tight line-clamp-2 mt-0.5 max-w-full tracking-tight font-sans">
            {square.shortName || square.name}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-0.5 w-full text-[7px] font-sans">
          {owner ? (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-white shadow-xs"
              style={{ backgroundColor: owner.token.color }}
              title={`Owner: ${owner.name}`}
            />
          ) : (
            <span className="text-neutral-300 font-normal">—</span>
          )}

          {square.price ? (
            <span className="font-bold text-neutral-800 tabular-nums">
              ${square.price}
            </span>
          ) : square.taxAmount ? (
            <span className="font-bold text-neutral-700 tabular-nums">
              ${square.taxAmount}
            </span>
          ) : null}
        </div>
      </div>

      {/* Color band placed on the inner board edge for top/left */}
      {(orientation === 'top' || orientation === 'left') && renderColorBand()}

      {/* Mortgaged Overlay */}
      {propState.isMortgaged && (
        <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center text-white backdrop-blur-[0.5px] z-10">
          <span className="bg-red-700 text-white text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-wider -rotate-12 shadow-xs">
            Mortgaged
          </span>
        </div>
      )}

      {/* Player Tokens on this square */}
      {playersOnSquare.length > 0 && (
        <div className="absolute top-0.5 right-0.5 flex flex-wrap gap-0.5 max-w-[38px] justify-end pointer-events-none z-10">
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
    </button>
  );
};
