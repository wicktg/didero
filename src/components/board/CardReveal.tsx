import React from "react";
import { useGame } from "../../context/GameContext";
import { Card } from "../../types/game";
import { HelpCircle, Box } from "lucide-react";

interface CardRevealProps {
  card?: Card | null;
}

export const CardReveal: React.FC<CardRevealProps> = ({ card: propCard }) => {
  const { state } = useGame();
  const card = propCard !== undefined ? propCard : state.lastDrawnCard;

  if (!card) return null;

  const isChance = card.deck === "chance";

  return (
    <div className="w-full bg-white border-[1.5px] border-black rounded-lg p-2.5 animate-card-slide-in flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 mb-1">
        {isChance ? (
          <div className="flex items-center gap-1 text-black bg-[#ffc905] border border-black px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3 text-black" /> Chance
          </div>
        ) : (
          <div className="flex items-center gap-1 text-black bg-[#6ccef5] border border-black px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
            <Box className="w-3 h-3 text-black" /> Community Chest
          </div>
        )}
      </div>

      <p className="text-xs text-black font-semibold leading-snug my-1">
        {card.text}
      </p>
    </div>
  );
};
