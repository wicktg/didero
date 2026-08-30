import React from 'react';
import { Card } from '../../types/game';
import { HelpCircle, Box } from 'lucide-react';

interface CardRevealProps {
  card: Card | null;
}

export const CardReveal: React.FC<CardRevealProps> = ({ card }) => {
  if (!card) return null;

  const isChance = card.deck === 'chance';

  return (
    <div className="w-full max-w-[280px] bg-white border-2 border-neutral-300 rounded-xl p-3 shadow-md flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-1.5 mb-1.5">
        {isChance ? (
          <div className="flex items-center gap-1 text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" /> Chance
          </div>
        ) : (
          <div className="flex items-center gap-1 text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Box className="w-3.5 h-3.5 text-blue-800" /> Community Chest
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-800 font-medium leading-relaxed my-1">
        {card.text}
      </p>
    </div>
  );
};
