import React from 'react';

interface DiceCupProps {
  dice: [number, number];
  isRolling?: boolean;
}

export const DiceCup: React.FC<DiceCupProps> = ({ dice, isRolling = false }) => {
  // Render dice dots (1 to 6)
  const renderDots = (value: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ['col-start-2 row-start-2'],
      2: ['col-start-1 row-start-1', 'col-start-3 row-start-3'],
      3: ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'],
      4: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-3', 'col-start-3 row-start-3'],
      5: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-2 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
      6: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-2',
        'col-start-3 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
    };

    const positions = dotPositions[value] || dotPositions[1];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 p-1">
        {positions.map((posClass, i) => (
          <span key={i} className={`w-1.5 h-1.5 bg-neutral-900 rounded-full ${posClass} place-self-center shadow-2xs`} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Die 1 */}
      <div
        className={`w-11 h-11 bg-white rounded-lg border-2 border-neutral-300 shadow-sm flex items-center justify-center transition-transform duration-200 ${
          isRolling ? 'rotate-12 scale-105 animate-pulse' : ''
        }`}
      >
        {renderDots(dice[0])}
      </div>

      {/* Die 2 */}
      <div
        className={`w-11 h-11 bg-white rounded-lg border-2 border-neutral-300 shadow-sm flex items-center justify-center transition-transform duration-200 ${
          isRolling ? '-rotate-12 scale-105 animate-pulse' : ''
        }`}
      >
        {renderDots(dice[1])}
      </div>
    </div>
  );
};
