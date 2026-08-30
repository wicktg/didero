import React from 'react';
import { PlayerState } from '../../types/game';

interface TokenBadgeProps {
  player: PlayerState;
  isCurrentTurn?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenBadge: React.FC<TokenBadgeProps> = ({
  player,
  isCurrentTurn = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-200 select-none shadow-sm ${sizeClasses} ${
        isCurrentTurn ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10' : ''
      }`}
      style={{
        backgroundColor: player.token.color,
        color: '#FFFFFF',
      }}
      title={`${player.name} (${player.token.name}) - $${player.money}${player.inJail ? ' [In Jail]' : ''}`}
    >
      <span className="leading-none drop-shadow-xs">{player.token.icon}</span>
      {player.inJail && (
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] px-1 rounded-full text-black font-bold border border-white">
          J
        </span>
      )}
    </div>
  );
};
