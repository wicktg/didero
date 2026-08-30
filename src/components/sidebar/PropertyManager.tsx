import React from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES, COLOR_GROUPS } from "../../data/boardData";
import { ownsFullGroup } from "../../engine/gameEngine";
import { ColorGroup } from "../../types/game";
import { Building, Sparkles, KeyRound } from "lucide-react";

export const PropertyManager: React.FC = () => {
  const { state, setInspectedPropertyIndex } = useGame();

  const humanProperties = Object.values(state.properties).filter(
    (p) => p.ownerId === 0
  );

  if (humanProperties.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 select-none">
        <Building className="w-8 h-8 stroke-1 text-black" />
        <p className="text-xs font-bold text-black uppercase tracking-wide">
          No properties yet
        </p>
        <p className="text-[10px] text-neutral-600 font-medium">
          Buy unowned properties or win auctions to grow your portfolio.
        </p>
      </div>
    );
  }

  const groupsWithProps: Array<{
    title: string;
    color?: string;
    properties: typeof humanProperties;
    isComplete: boolean;
  }> = [];

  (Object.keys(COLOR_GROUPS) as ColorGroup[]).forEach((groupKey) => {
    const groupSquares = SQUARES.filter((s) => s.group === groupKey);
    const owned = humanProperties.filter((p) =>
      groupSquares.some((s) => s.index === p.index)
    );
    if (owned.length > 0) {
      groupsWithProps.push({
        title: COLOR_GROUPS[groupKey].name,
        color: COLOR_GROUPS[groupKey].hex,
        properties: owned,
        isComplete: ownsFullGroup(state, 0, groupKey),
      });
    }
  });

  const ownedRailroads = humanProperties.filter(
    (p) => SQUARES[p.index].type === "RAILROAD"
  );
  if (ownedRailroads.length > 0) {
    groupsWithProps.push({
      title: `Railroads (${ownedRailroads.length}/4)`,
      color: "#000000",
      properties: ownedRailroads,
      isComplete: ownedRailroads.length === 4,
    });
  }

  const ownedUtilities = humanProperties.filter(
    (p) => SQUARES[p.index].type === "UTILITY"
  );
  if (ownedUtilities.length > 0) {
    groupsWithProps.push({
      title: `Utilities (${ownedUtilities.length}/2)`,
      color: "#ba9664",
      properties: ownedUtilities,
      isComplete: ownedUtilities.length === 2,
    });
  }

  return (
    <div className="flex flex-col gap-2.5 p-3 max-h-[700px] overflow-y-auto pr-1 select-none">
      {groupsWithProps.map((group, gIdx) => (
        <div
          key={gIdx}
          className="bg-white rounded-md border-[1.5px] border-black overflow-hidden"
        >
          {/* Group Header Band */}
          <div
            className="p-2 px-3 text-white flex items-center justify-between text-xs font-bold border-b-[1.5px] border-black uppercase tracking-wider"
            style={{ backgroundColor: group.color || "#000000" }}
          >
            <span>{group.title}</span>
            {group.isComplete && (
              <span className="text-[8px] px-1.5 py-0.5 rounded border border-white bg-black/40 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#ffc905]" /> Monopoly
              </span>
            )}
          </div>

          {/* Properties List */}
          <div className="divide-y-[1.5px] divide-black">
            {group.properties.map((prop) => {
              const sq = SQUARES[prop.index];
              return (
                <button
                  key={prop.index}
                  type="button"
                  onClick={() => setInspectedPropertyIndex(prop.index)}
                  className="w-full p-2.5 flex items-center justify-between hover:bg-neutral-50 text-left transition-colors text-xs"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-black uppercase tracking-wide truncate">
                      {sq.name}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      {prop.houses === 5 ? (
                        <span className="text-[#eb1c24] font-extrabold">
                          Hotel
                        </span>
                      ) : prop.houses > 0 ? (
                        <span className="text-[#a5cd39] font-extrabold text-black">
                          {prop.houses} Houses
                        </span>
                      ) : (
                        <span>Unimproved</span>
                      )}
                      {prop.isMortgaged && (
                        <span className="text-[#eb1c24] font-bold flex items-center gap-0.5">
                          <KeyRound className="w-2.5 h-2.5" /> Mortgaged
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="tabular-nums font-extrabold text-black text-xs shrink-0 pl-2">
                    ${sq.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
