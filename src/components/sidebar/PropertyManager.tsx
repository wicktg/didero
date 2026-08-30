import React from 'react';
import { useGame } from '../../context/GameContext';
import { SQUARES, COLOR_GROUPS } from '../../data/boardData';
import { ownsFullGroup } from '../../engine/gameEngine';
import { ColorGroup } from '../../types/game';
import { Building, Sparkles, KeyRound } from 'lucide-react';

export const PropertyManager: React.FC = () => {
  const { state, setInspectedPropertyIndex } = useGame();

  const humanProperties = Object.values(state.properties).filter((p) => p.ownerId === 0);

  if (humanProperties.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
        <Building className="w-8 h-8 stroke-1 text-neutral-300" />
        <p className="text-xs font-semibold">You don't own any properties yet.</p>
        <p className="text-[10px] text-neutral-500">
          Roll the dice, buy unowned spaces, or win auctions to grow your empire!
        </p>
      </div>
    );
  }

  // Group properties by color groups / utilities / railroads
  const groupsWithProps: Array<{ title: string; color?: string; properties: typeof humanProperties; isComplete: boolean }> = [];

  // Street Groups
  (Object.keys(COLOR_GROUPS) as ColorGroup[]).forEach((groupKey) => {
    const groupSquares = SQUARES.filter((s) => s.group === groupKey);
    const owned = humanProperties.filter((p) => groupSquares.some((s) => s.index === p.index));

    if (owned.length > 0) {
      groupsWithProps.push({
        title: COLOR_GROUPS[groupKey].name,
        color: COLOR_GROUPS[groupKey].hex,
        properties: owned,
        isComplete: ownsFullGroup(state, 0, groupKey),
      });
    }
  });

  // Railroads
  const ownedRailroads = humanProperties.filter((p) => SQUARES[p.index].type === 'RAILROAD');
  if (ownedRailroads.length > 0) {
    groupsWithProps.push({
      title: `Railroads (${ownedRailroads.length}/4)`,
      color: '#37474F',
      properties: ownedRailroads,
      isComplete: ownedRailroads.length === 4,
    });
  }

  // Utilities
  const ownedUtilities = humanProperties.filter((p) => SQUARES[p.index].type === 'UTILITY');
  if (ownedUtilities.length > 0) {
    groupsWithProps.push({
      title: `Utilities (${ownedUtilities.length}/2)`,
      color: '#D97706',
      properties: ownedUtilities,
      isComplete: ownedUtilities.length === 2,
    });
  }

  return (
    <div className="flex flex-col gap-3 p-3 max-h-[480px] overflow-y-auto pr-1">
      {groupsWithProps.map((group, gIdx) => (
        <div key={gIdx} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          {/* Group Header */}
          <div
            className="p-2 px-3 text-white flex items-center justify-between text-xs font-bold"
            style={{ backgroundColor: group.color || '#37474F' }}
          >
            <span>{group.title}</span>
            {group.isComplete && (
              <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-amber-300" /> Monopoly
              </span>
            )}
          </div>

          {/* Properties in this group */}
          <div className="divide-y divide-neutral-100">
            {group.properties.map((prop) => {
              const sq = SQUARES[prop.index];
              return (
                <button
                  key={prop.index}
                  type="button"
                  onClick={() => setInspectedPropertyIndex(prop.index)}
                  className="w-full p-2.5 flex items-center justify-between hover:bg-neutral-50 text-left transition-all text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-neutral-900">{sq.name}</span>
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                      {prop.houses === 5 ? (
                        <span className="text-red-700 font-bold">1 Hotel</span>
                      ) : prop.houses > 0 ? (
                        <span className="text-emerald-700 font-bold">{prop.houses} Houses</span>
                      ) : (
                        <span>Unimproved</span>
                      )}
                      {prop.isMortgaged && (
                        <span className="text-red-600 font-bold ml-1 flex items-center gap-0.5">
                          <KeyRound className="w-2.5 h-2.5" /> Mortgaged
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-800">
                    <span className="tabular-nums">${sq.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
