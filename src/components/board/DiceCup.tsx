import React from "react";
import { useGame } from "../../context/GameContext";

export const DiceCup: React.FC = () => {
  const { state, isDiceRolling } = useGame();
  const dice = state.dice;

  const renderDots = (value: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ["col-start-2 row-start-2"],
      2: ["col-start-1 row-start-1", "col-start-3 row-start-3"],
      3: [
        "col-start-1 row-start-1",
        "col-start-2 row-start-2",
        "col-start-3 row-start-3",
      ],
      4: [
        "col-start-1 row-start-1",
        "col-start-3 row-start-1",
        "col-start-1 row-start-3",
        "col-start-3 row-start-3",
      ],
      5: [
        "col-start-1 row-start-1",
        "col-start-3 row-start-1",
        "col-start-2 row-start-2",
        "col-start-1 row-start-3",
        "col-start-3 row-start-3",
      ],
      6: [
        "col-start-1 row-start-1",
        "col-start-3 row-start-1",
        "col-start-1 row-start-2",
        "col-start-3 row-start-2",
        "col-start-1 row-start-3",
        "col-start-3 row-start-3",
      ],
    };
    const positions = dotPositions[value] || dotPositions[1];
    return (
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 p-1">
        {positions.map((posClass, i) => (
          <span
            key={i}
            className={`w-[6px] h-[6px] bg-black rounded-full ${posClass} place-self-center`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className={`w-11 h-11 bg-white rounded-md border-[1.5px] border-black flex items-center justify-center transition-transform ${
          isDiceRolling ? "animate-dice-tumble" : ""
        }`}
      >
        {renderDots(dice[0])}
      </div>
      <div
        className={`w-11 h-11 bg-white rounded-md border-[1.5px] border-black flex items-center justify-center transition-transform ${
          isDiceRolling ? "animate-dice-tumble" : ""
        }`}
        style={{ animationDelay: isDiceRolling ? "40ms" : "0ms" }}
      >
        {renderDots(dice[1])}
      </div>
    </div>
  );
};
