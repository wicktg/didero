import React from "react";
import { PlayerState } from "../../types/game";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";

interface TokenBadgeProps {
  player: PlayerState;
  isCurrentTurn?: boolean;
  size?: "sm" | "md" | "lg";
}

export const TokenBadge: React.FC<TokenBadgeProps> = ({
  player,
  isCurrentTurn = false,
  size = "md",
}) => {
  const pixelSize = {
    sm: 18,
    md: 24,
    lg: 32,
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isCurrentTurn ? "scale-110 z-10" : ""
      }`}
      title={`${player.name} — $${player.money}${
        player.inJail ? " [Jail]" : ""
      }`}
    >
      <IdenticonAvatar
        name={player.name}
        size={pixelSize}
        color={player.token.color}
      />
      {player.inJail && (
        <span className="absolute -bottom-1 -right-1 bg-[#ffc905] text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-xs text-black font-extrabold border border-black">
          J
        </span>
      )}
    </div>
  );
};
