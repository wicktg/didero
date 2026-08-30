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

  // Determine edge orientation
  let orientation: 'bottom' | 'left' | 'top' | 'right' = 'bottom';
  if (index > 0 && index < 10) orientation = 'bottom';
  else if (index > 10 && index < 20) orientation = 'left';
  else if (index > 20 && index < 30) orientation = 'top';
  else if (index > 30 && index < 40) orientation = 'right';

  const owner = propState.ownerId !== null ? allPlayers[propState.ownerId] : null;

  // Render specific icon for special types
  const renderSquareIcon = () => {
    switch (square.type) {
      case 'RAILROAD':
        return <Train className="w-3.5 h-3.5 text-neutral-700" />;
      case 'UTILITY':
        return index === 12 ? (
          <Zap className="w-3.5 h-3.5 text-amber-600" />
        ) : (
          <Droplets className="w-3.5 h-3.5 text-blue-600" />
        );
      case 'CHANCE':
        return <HelpCircle className="w-4 h-4 text-amber-700" />;
      case 'COMMUNITY_CHEST':
        return <Box className="w-3.5 h-3.5 text-blue-800" />;
      case 'TAX':
        return <DollarSign className="w-3.5 h-3.5 text-neutral-800" />;
      default:
        return null;
    }
  };

  // Color Band styling based on orientation
  const renderColorBand = () => {
    if (square.type !== 'STREET' || !square.color) return null;

    const bandClasses = {
      bottom: 'h-4 w-full border-b border-neutral-300',
      left: 'w-4 h-full border-l border-neutral-300 order-last',
      top: 'h-4 w-full border-t border-neutral-300 order-last',
      right: 'w-4 h-full border-r border-neutral-300',
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
      className={`group border border-neutral-300 bg-white relative flex select-none text-left transition-all duration-150 hover:bg-neutral-50/90 focus:outline-none focus:ring-1 focus:ring-blue-500 overflow-hidden shadow-2xs ${
        orientation === 'left' || orientation === 'right' ? 'flex-row' : 'flex-col'
      } ${gridAreaClass}`}
      title={`Click to inspect ${square.name}${owner ? ` (Owned by ${owner.name})` : ''}`}
    >
      {/* Top or Right Color Band */}
      {(orientation === 'bottom' || orientation === 'right') && renderColorBand()}

      {/* Main Square Body */}
      <div className="flex-1 flex flex-col justify-between p-1 w-full h-full min-h-0 min-w-0">
        {/* Name & Special Icon */}
        <div className="flex flex-col items-center text-center">
          {renderSquareIcon()}
          <span className="text-[9px] font-semibold text-neutral-800 leading-tight line-clamp-2 mt-0.5 max-w-full">
            {square.shortName || square.name}
          </span>
        </div>

        {/* Owner Indicator Pip & Price/Tax */}
        <div className="flex items-center justify-between mt-auto pt-0.5 border-t border-neutral-100 w-full text-[8px]">
          {owner ? (
            <div className="flex items-center gap-0.5" title={`Owner: ${owner.name}`}>
              <span
                className="w-2 h-2 rounded-full inline-block border border-white shadow-xs"
                style={{ backgroundColor: owner.token.color }}
              />
              <span className="truncate max-w-[36px] text-neutral-600 font-medium">{owner.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span className="text-neutral-400 font-normal">Unowned</span>
          )}

          {square.price ? (
            <span className="font-bold text-neutral-900 tabular-nums">${square.price}</span>
          ) : square.taxAmount ? (
            <span className="font-bold text-neutral-700 tabular-nums">${square.taxAmount}</span>
          ) : null}
        </div>
      </div>

      {/* Bottom or Left Color Band */}
      {(orientation === 'top' || orientation === 'left') && renderColorBand()}

      {/* Mortgaged Overlay Banner */}
      {propState.isMortgaged && (
        <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center text-white backdrop-blur-xs">
          <span className="bg-red-700 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider -rotate-12">
            Mortgaged
          </span>
        </div>
      )}

      {/* Tokens tray on cell */}
      {playersOnSquare.length > 0 && (
        <div className="absolute top-1 right-1 flex flex-wrap gap-0.5 max-w-[40px] justify-end pointer-events-none z-10">
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
