import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { SQUARES } from '../../data/boardData';
import { Dices, ShoppingCart, Gavel, ArrowRight, Shield, AlertTriangle } from 'lucide-react';

export const ActionControls: React.FC = () => {
  const { state, dispatch } = useGame();

  const isHumanTurn = state.currentTurnPlayerId === 0;
  const human = state.players[0];
  const currentSquare = SQUARES[human.position];

  // Keyboard shortcut listener (Space to roll, Enter to end turn)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (isHumanTurn) {
        if (e.code === 'Space' && state.turnPhase === 'ROLL') {
          e.preventDefault();
          dispatch({ type: 'ROLL_DICE' });
        } else if (e.code === 'Enter' && state.turnPhase === 'END_TURN') {
          e.preventDefault();
          dispatch({ type: 'END_TURN' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHumanTurn, state.turnPhase, dispatch]);

  if (!isHumanTurn) {
    const currentBot = state.players[state.currentTurnPlayerId];
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-neutral-100/90 border border-neutral-300 rounded-xl text-center shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-800">
            {currentBot?.name}'s Turn...
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 mt-0.5">
          {state.turnPhase === 'ROLL'
            ? 'Rolling dice...'
            : state.turnPhase === 'LANDED_ACTION'
            ? 'Evaluating property...'
            : state.turnPhase === 'AUCTION'
            ? 'Participating in auction...'
            : 'Finishing turn...'}
        </span>
      </div>
    );
  }

  // Human's Turn Controls
  return (
    <div className="flex flex-col gap-2 w-full max-w-[280px]">
      {/* 1. ROLL PHASE */}
      {state.turnPhase === 'ROLL' && (
        <div className="flex flex-col gap-1.5">
          {human.inJail ? (
            <div className="flex flex-col gap-1.5 bg-amber-50 border border-amber-300 p-2.5 rounded-xl">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
                <Shield className="w-3.5 h-3.5" /> In Jail (Turn {human.jailTurns + 1}/3)
              </div>

              <div className="grid grid-cols-2 gap-1 mt-1">
                {human.money >= 50 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'PAY_JAIL_FINE' })}
                    className="px-2.5 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Pay $50 Fine
                  </button>
                )}

                {(human.getOutOfJailCards.chance > 0 || human.getOutOfJailCards.communityChest > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      const cardType = human.getOutOfJailCards.chance > 0 ? 'chance' : 'communityChest';
                      dispatch({ type: 'USE_JAIL_CARD', payload: { cardType } });
                    }}
                    className="px-2.5 py-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Use Card
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: 'ROLL_DICE' })}
                className="w-full py-2 bg-blue-700 text-white hover:bg-blue-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Dices className="w-4 h-4" /> Roll for Doubles
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: 'ROLL_DICE' })}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-150"
            >
              <Dices className="w-4 h-4" /> Roll Dice <span className="text-[10px] text-blue-200 font-normal">[Space]</span>
            </button>
          )}
        </div>
      )}

      {/* 2. LANDED ACTION PHASE (Unowned Property) */}
      {state.turnPhase === 'LANDED_ACTION' && currentSquare.price && (
        <div className="flex flex-col gap-1.5 bg-white border border-neutral-300 p-2.5 rounded-xl shadow-xs">
          <div className="text-center">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Unowned Property</span>
            <div className="text-xs font-bold text-neutral-900">{currentSquare.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-1">
            <button
              type="button"
              disabled={human.money < currentSquare.price}
              onClick={() => dispatch({ type: 'BUY_PROPERTY', payload: { propertyIndex: human.position } })}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                human.money >= currentSquare.price
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Buy for ${currentSquare.price}
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: 'DECLINE_BUY', payload: { propertyIndex: human.position } })}
              className="py-2 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
            >
              <Gavel className="w-3.5 h-3.5 text-neutral-600" /> Auction
            </button>
          </div>
        </div>
      )}

      {/* 3. DEBT RESOLUTION PHASE */}
      {state.turnPhase === 'DEBT_RESOLUTION' && (
        <div className="flex flex-col gap-1.5 bg-red-50 border border-red-300 p-2.5 rounded-xl">
          <div className="flex items-center gap-1 text-xs font-bold text-red-900">
            <AlertTriangle className="w-3.5 h-3.5" /> You Are in Debt (${Math.abs(human.money)})
          </div>
          <p className="text-[10px] text-red-700">
            Mortgage properties, sell houses, or trade assets to raise cash.
          </p>

          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {human.money >= 0 ? (
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESOLVE_DEBT' })}
                className="py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold col-span-2 shadow-xs"
              >
                Confirm Debt Cleared
              </button>
            ) : (
              <button
                type="button"
                onClick={() => dispatch({ type: 'DECLARE_BANKRUPTCY', payload: { playerId: 0 } })}
                className="py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold col-span-2 shadow-xs"
              >
                Declare Bankruptcy
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. END TURN PHASE */}
      {state.turnPhase === 'END_TURN' && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'END_TURN' })}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          End Turn <ArrowRight className="w-4 h-4" /> <span className="text-[10px] text-neutral-400 font-normal">[Enter]</span>
        </button>
      )}
    </div>
  );
};
