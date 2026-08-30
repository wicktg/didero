import React from 'react';
import { useGame } from '../../context/GameContext';
import { SquareCell } from './SquareCell';
import { CornerCell } from './CornerCell';
import { CenterHub } from './CenterHub';
import { SQUARES } from '../../data/boardData';

export const SQUARE_GRID_CLASSES: Record<number, string> = {
  // Bottom Row (0 to 10)
  0: 'col-start-11 row-start-11',
  1: 'col-start-10 row-start-11',
  2: 'col-start-9 row-start-11',
  3: 'col-start-8 row-start-11',
  4: 'col-start-7 row-start-11',
  5: 'col-start-6 row-start-11',
  6: 'col-start-5 row-start-11',
  7: 'col-start-4 row-start-11',
  8: 'col-start-3 row-start-11',
  9: 'col-start-2 row-start-11',
  10: 'col-start-1 row-start-11',

  // Left Column (11 to 19)
  11: 'col-start-1 row-start-10',
  12: 'col-start-1 row-start-9',
  13: 'col-start-1 row-start-8',
  14: 'col-start-1 row-start-7',
  15: 'col-start-1 row-start-6',
  16: 'col-start-1 row-start-5',
  17: 'col-start-1 row-start-4',
  18: 'col-start-1 row-start-3',
  19: 'col-start-1 row-start-2',

  // Top Row (20 to 30)
  20: 'col-start-1 row-start-1',
  21: 'col-start-2 row-start-1',
  22: 'col-start-3 row-start-1',
  23: 'col-start-4 row-start-1',
  24: 'col-start-5 row-start-1',
  25: 'col-start-6 row-start-1',
  26: 'col-start-7 row-start-1',
  27: 'col-start-8 row-start-1',
  28: 'col-start-9 row-start-1',
  29: 'col-start-10 row-start-1',
  30: 'col-start-11 row-start-1',

  // Right Column (31 to 39)
  31: 'col-start-11 row-start-2',
  32: 'col-start-11 row-start-3',
  33: 'col-start-11 row-start-4',
  34: 'col-start-11 row-start-5',
  35: 'col-start-11 row-start-6',
  36: 'col-start-11 row-start-7',
  37: 'col-start-11 row-start-8',
  38: 'col-start-11 row-start-9',
  39: 'col-start-11 row-start-10',
};

export const MonopolyBoard: React.FC = () => {
  const { state, setInspectedPropertyIndex } = useGame();

  // Group players by current square position
  const playersBySquare: Record<number, typeof state.players> = {};
  for (let i = 0; i < 40; i++) {
    playersBySquare[i] = [];
  }
  state.players.forEach((p) => {
    if (!p.isBankrupt) {
      playersBySquare[p.position].push(p);
    }
  });

  return (
    <div className="relative w-full max-w-[820px] aspect-square p-2 bg-board-canvas rounded-2xl shadow-md border border-neutral-300 select-none mx-auto">
      {/* 11x11 Grid Container */}
      <div className="grid grid-cols-11 grid-rows-11 w-full h-full gap-0.5 bg-neutral-300 rounded-xl overflow-hidden p-0.5">
        {/* Render 40 Squares */}
        {SQUARES.map((square) => {
          const gridClass = SQUARE_GRID_CLASSES[square.index];
          const isCorner = [0, 10, 20, 30].includes(square.index);

          if (isCorner) {
            return (
              <CornerCell
                key={square.index}
                index={square.index}
                playersOnSquare={playersBySquare[square.index]}
                currentTurnPlayerId={state.currentTurnPlayerId}
                gridAreaClass={gridClass}
              />
            );
          }

          return (
            <SquareCell
              key={square.index}
              index={square.index}
              propState={state.properties[square.index]}
              playersOnSquare={playersBySquare[square.index]}
              currentTurnPlayerId={state.currentTurnPlayerId}
              allPlayers={state.players}
              gridAreaClass={gridClass}
              onInspect={(idx) => setInspectedPropertyIndex(idx)}
            />
          );
        })}

        {/* Center Board Hub (Spans 9x9 inner area) */}
        <CenterHub />
      </div>
    </div>
  );
};
