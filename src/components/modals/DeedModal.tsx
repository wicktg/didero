import React from 'react';
import { useGame } from '../../context/GameContext';
import { SQUARES } from '../../data/boardData';
import { canBuildHouse, canSellHouse, canMortgageProperty, canUnmortgageProperty } from '../../engine/gameEngine';
import { X, Plus, Minus, KeyRound, ShieldAlert, Check, Train, Zap, Droplets } from 'lucide-react';

export const DeedModal: React.FC = () => {
  const { state, dispatch, inspectedPropertyIndex, setInspectedPropertyIndex } = useGame();

  if (inspectedPropertyIndex === null) return null;

  const square = SQUARES[inspectedPropertyIndex];
  const prop = state.properties[inspectedPropertyIndex];
  if (!square || !prop) return null;

  const owner = prop.ownerId !== null ? state.players[prop.ownerId] : null;
  const isHumanOwner = prop.ownerId === 0;
  const isCurrentTurnHuman = state.currentTurnPlayerId === 0;

  const canBuild = isHumanOwner && isCurrentTurnHuman && canBuildHouse(state, 0, inspectedPropertyIndex);
  const canSell = isHumanOwner && isCurrentTurnHuman && canSellHouse(state, 0, inspectedPropertyIndex);
  const canMortgage = isHumanOwner && isCurrentTurnHuman && canMortgageProperty(state, 0, inspectedPropertyIndex);
  const canUnmortgage = isHumanOwner && isCurrentTurnHuman && canUnmortgageProperty(state, 0, inspectedPropertyIndex);

  const mortgageValue = Math.round((square.price || 0) * 0.5);
  const unmortgageCost = Math.round((square.price || 0) * 0.55);

  const renderDeedBody = () => {
    // 1. Street Property Deed
    if (square.type === 'STREET' && square.rent) {
      return (
        <div className="flex flex-col gap-2 text-xs text-neutral-800">
          <div className="flex justify-between py-1 border-b border-neutral-200">
            <span className="text-neutral-600">Rent (Base)</span>
            <span className="font-bold tabular-nums">${square.rent[0]}</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>With 1 House</span>
            <span className="font-semibold tabular-nums text-neutral-900">${square.rent[1]}</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>With 2 Houses</span>
            <span className="font-semibold tabular-nums text-neutral-900">${square.rent[2]}</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>With 3 Houses</span>
            <span className="font-semibold tabular-nums text-neutral-900">${square.rent[3]}</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>With 4 Houses</span>
            <span className="font-semibold tabular-nums text-neutral-900">${square.rent[4]}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-neutral-200 text-red-900 font-bold bg-red-50/50 px-1 rounded">
            <span>With HOTEL</span>
            <span className="tabular-nums">${square.rent[5]}</span>
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-200 grid grid-cols-2 gap-2 text-[10px] text-neutral-500">
            <div>House Cost: <span className="font-bold text-neutral-800 tabular-nums">${square.housePrice}</span></div>
            <div>Hotel Cost: <span className="font-bold text-neutral-800 tabular-nums">${square.housePrice} + 4 Houses</span></div>
            <div>Mortgage Value: <span className="font-bold text-neutral-800 tabular-nums">${mortgageValue}</span></div>
            <div>Unmortgage Fee: <span className="font-bold text-neutral-800 tabular-nums">${unmortgageCost}</span></div>
          </div>
        </div>
      );
    }

    // 2. Railroad Deed
    if (square.type === 'RAILROAD') {
      return (
        <div className="flex flex-col gap-2 text-xs text-neutral-800">
          <div className="flex justify-center my-2">
            <Train className="w-8 h-8 text-neutral-700" />
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-200">
            <span>Rent</span>
            <span className="font-bold tabular-nums">$25</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>If 2 Railroads are owned</span>
            <span className="font-semibold tabular-nums text-neutral-900">$50</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>If 3 Railroads are owned</span>
            <span className="font-semibold tabular-nums text-neutral-900">$100</span>
          </div>
          <div className="flex justify-between py-0.5 text-neutral-600">
            <span>If 4 Railroads are owned</span>
            <span className="font-semibold tabular-nums text-neutral-900">$200</span>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-200 text-center text-[10px] text-neutral-500">
            Mortgage Value: <span className="font-bold text-neutral-800 tabular-nums">$100</span>
          </div>
        </div>
      );
    }

    // 3. Utility Deed
    if (square.type === 'UTILITY') {
      return (
        <div className="flex flex-col gap-3 text-xs text-neutral-800 py-2 text-center">
          <div className="flex justify-center my-1">
            {square.index === 12 ? (
              <Zap className="w-8 h-8 text-amber-600" />
            ) : (
              <Droplets className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <p className="text-neutral-600 leading-relaxed">
            If one "Utility" is owned, rent is <strong>4 times</strong> amount shown on dice.
          </p>
          <p className="text-neutral-600 leading-relaxed">
            If both "Utilities" are owned, rent is <strong>10 times</strong> amount shown on dice.
          </p>
          <div className="mt-2 pt-2 border-t border-neutral-200 text-[10px] text-neutral-500">
            Mortgage Value: <span className="font-bold text-neutral-800 tabular-nums">$75</span>
          </div>
        </div>
      );
    }

    // 4. Other Squares
    return (
      <div className="py-4 text-center text-neutral-500 text-xs">
        {square.type === 'GO' && 'Collect $200 salary when you pass or land on GO.'}
        {square.type === 'JAIL' && 'Just visiting, or locked in cell until bail/doubles.'}
        {square.type === 'FREE_PARKING' && 'Rest stop. Safe haven with no fees or rents.'}
        {square.type === 'GO_TO_JAIL' && 'Send player directly to Jail without passing GO.'}
        {square.type === 'TAX' && `Pay $${square.taxAmount} to the Bank.`}
        {square.type === 'CHANCE' && 'Draw an official Chance card.'}
        {square.type === 'COMMUNITY_CHEST' && 'Draw an official Community Chest card.'}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setInspectedPropertyIndex(null)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Deed Header Band */}
        {square.color ? (
          <div
            className="p-4 text-center text-white border-b-2 border-neutral-900/10 select-none"
            style={{ backgroundColor: square.color }}
          >
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">
              TITLE DEED
            </span>
            <h3 className="text-base font-extrabold tracking-tight mt-0.5 drop-shadow-xs">
              {square.name}
            </h3>
          </div>
        ) : (
          <div className="p-4 text-center bg-neutral-100 border-b border-neutral-200 select-none">
            <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
              {square.name}
            </h3>
          </div>
        )}

        {/* Deed Body */}
        <div className="p-5">
          {/* Ownership Status Banner */}
          <div className="flex items-center justify-between p-2 mb-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
            <span className="text-neutral-500 font-medium">Owner:</span>
            {owner ? (
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: owner.token.color }}
                />
                {owner.name} {isHumanOwner && '(You)'}
              </div>
            ) : (
              <span className="text-neutral-400 font-semibold">Unowned (Bank)</span>
            )}
          </div>

          {/* Mortgaged Warning */}
          {prop.isMortgaged && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              This property is Mortgaged. No rent can be collected.
            </div>
          )}

          {/* Rent & Info Table */}
          {renderDeedBody()}

          {/* Interactive Management Controls (For Human Owner) */}
          {isHumanOwner && square.type === 'STREET' && (
            <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col gap-2">
              <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                Manage Property
              </div>

              {/* Build / Sell Houses */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!canBuild}
                  onClick={() => dispatch({ type: 'BUILD_HOUSE', payload: { propertyIndex: inspectedPropertyIndex } })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    canBuild
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                  }`}
                  title={canBuild ? `Build House for $${square.housePrice}` : 'Cannot build house (needs full monopoly and even building)'}
                >
                  <Plus className="w-3.5 h-3.5" /> Build House (${square.housePrice})
                </button>

                <button
                  type="button"
                  disabled={!canSell}
                  onClick={() => dispatch({ type: 'SELL_HOUSE', payload: { propertyIndex: inspectedPropertyIndex } })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    canSell
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                  }`}
                  title={canSell ? `Sell House for $${Math.round((square.housePrice || 0) * 0.5)}` : 'No houses to sell'}
                >
                  <Minus className="w-3.5 h-3.5" /> Sell House (+${Math.round((square.housePrice || 0) * 0.5)})
                </button>
              </div>

              {/* Mortgage / Unmortgage */}
              <div className="mt-1">
                {!prop.isMortgaged ? (
                  <button
                    type="button"
                    disabled={!canMortgage}
                    onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyIndex: inspectedPropertyIndex } })}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      canMortgage
                        ? 'bg-neutral-800 hover:bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Mortgage Property (+${mortgageValue})
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canUnmortgage}
                    onClick={() => dispatch({ type: 'UNMORTGAGE_PROPERTY', payload: { propertyIndex: inspectedPropertyIndex } })}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      canUnmortgage
                        ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Unmortgage Property (-${unmortgageCost})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mortgage Button for Railroads/Utilities */}
          {isHumanOwner && (square.type === 'RAILROAD' || square.type === 'UTILITY') && (
            <div className="mt-4 pt-3 border-t border-neutral-200">
              {!prop.isMortgaged ? (
                <button
                  type="button"
                  disabled={!canMortgage}
                  onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyIndex: inspectedPropertyIndex } })}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    canMortgage
                      ? 'bg-neutral-800 hover:bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Mortgage Property (+${mortgageValue})
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canUnmortgage}
                  onClick={() => dispatch({ type: 'UNMORTGAGE_PROPERTY', payload: { propertyIndex: inspectedPropertyIndex } })}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    canUnmortgage
                      ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" /> Unmortgage Property (-${unmortgageCost})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
