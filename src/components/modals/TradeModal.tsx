import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SQUARES } from '../../data/boardData';
import { TradeOffer } from '../../types/game';
import { evaluateTradeForBot } from '../../ai/tradeEvaluator';
import { validateTradeOffer } from '../../engine/tradeEngine';
import { X, ArrowLeftRight, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const TradeModal: React.FC = () => {
  const { state, dispatch, isTradeModalOpen, setIsTradeModalOpen, tradeRecipientId, setTradeRecipientId } = useGame();

  const human = state.players[0];
  const eligiblePartners = state.players.filter((p) => p.id !== 0 && !p.isBankrupt);

  const [partnerId, setPartnerId] = useState<number>(tradeRecipientId ?? eligiblePartners[0]?.id ?? 1);
  const [offeredMoney, setOfferedMoney] = useState<number>(0);
  const [requestedMoney, setRequestedMoney] = useState<number>(0);
  const [offeredProps, setOfferedProps] = useState<number[]>([]);
  const [requestedProps, setRequestedProps] = useState<number[]>([]);
  const [offeredChanceCard, setOfferedChanceCard] = useState<boolean>(false);
  const [offeredCCCard, setOfferedCCCard] = useState<boolean>(false);
  const [requestedChanceCard, setRequestedChanceCard] = useState<boolean>(false);
  const [requestedCCCard, setRequestedCCCard] = useState<boolean>(false);

  if (!isTradeModalOpen) return null;

  const partner = state.players[partnerId];

  // Properties owned by Human & Partner
  const humanProperties = Object.values(state.properties).filter((p) => p.ownerId === 0);
  const partnerProperties = Object.values(state.properties).filter((p) => p.ownerId === partnerId);

  // Construct draft trade offer
  const draftTrade: TradeOffer = {
    id: `trade-${Date.now()}`,
    initiatorId: 0,
    recipientId: partnerId,
    offeredMoney,
    requestedMoney,
    offeredProperties: offeredProps,
    requestedProperties: requestedProps,
    offeredJailCards: { chance: offeredChanceCard, communityChest: offeredCCCard },
    requestedJailCards: { chance: requestedChanceCard, communityChest: requestedCCCard },
  };

  const validation = validateTradeOffer(state, draftTrade);
  const isBotLikelyToAccept = validation.valid && evaluateTradeForBot(state, partnerId, draftTrade);

  const handleToggleOfferedProp = (index: number) => {
    setOfferedProps((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleToggleRequestedProp = (index: number) => {
    setRequestedProps((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleSendProposal = () => {
    if (validation.valid) {
      dispatch({ type: 'PROPOSE_TRADE', payload: { trade: draftTrade } });
      setIsTradeModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-800 rounded-lg">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Trade Negotiation Room</h3>
              <p className="text-[10px] text-neutral-400">Exchange properties, cash, and jail cards</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTradeModalOpen(false)}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Partner Selection Bar */}
        <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Trading With:</span>
          <select
            value={partnerId}
            onChange={(e) => {
              setPartnerId(Number(e.target.value));
              setRequestedProps([]);
            }}
            className="px-3 py-1 bg-white border border-neutral-300 rounded-lg font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          >
            {eligiblePartners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.token.icon} {p.name} (Cash: ${p.money})
              </option>
            ))}
          </select>
        </div>

        {/* Side-by-Side Negotiation Matrix */}
        <div className="grid grid-cols-2 divide-x divide-neutral-200 flex-1 overflow-y-auto p-4 gap-4">
          {/* Left: Your Offer */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
              <span className="text-xs font-extrabold text-neutral-900">You Offer (Player 1)</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">Max: ${human.money}</span>
            </div>

            {/* Money Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                <span>Cash:</span>
                <span className="font-bold text-neutral-900 tabular-nums">${offeredMoney}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, human.money)}
                step={10}
                value={offeredMoney}
                onChange={(e) => setOfferedMoney(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Properties List */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-700">Select Properties:</span>
              {humanProperties.length === 0 ? (
                <span className="text-xs text-neutral-400 italic">No properties owned yet</span>
              ) : (
                <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
                  {humanProperties.map((prop) => {
                    const sq = SQUARES[prop.index];
                    const isSelected = offeredProps.includes(prop.index);

                    return (
                      <label
                        key={prop.index}
                        className={`flex items-center justify-between p-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 font-semibold text-blue-950'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleOfferedProp(prop.index)}
                            className="rounded accent-blue-600"
                          />
                          {sq.color && (
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: sq.color }}
                            />
                          )}
                          <span className="truncate max-w-[120px]">{sq.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 tabular-nums">${sq.price}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Jail Cards */}
            {(human.getOutOfJailCards.chance > 0 || human.getOutOfJailCards.communityChest > 0) && (
              <div className="flex flex-col gap-1 pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-semibold text-neutral-700">Jail Cards:</span>
                {human.getOutOfJailCards.chance > 0 && (
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offeredChanceCard}
                      onChange={(e) => setOfferedChanceCard(e.target.checked)}
                      className="accent-blue-600"
                    />
                    Chance "Get Out of Jail Free" Card
                  </label>
                )}
                {human.getOutOfJailCards.communityChest > 0 && (
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offeredCCCard}
                      onChange={(e) => setOfferedCCCard(e.target.checked)}
                      className="accent-blue-600"
                    />
                    Community Chest "Get Out of Jail Free" Card
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Right: Partner Request */}
          <div className="flex flex-col gap-3 pl-4">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
              <span className="text-xs font-extrabold text-neutral-900">You Request ({partner?.name})</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">Max: ${partner?.money}</span>
            </div>

            {/* Money Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                <span>Cash:</span>
                <span className="font-bold text-neutral-900 tabular-nums">${requestedMoney}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, partner?.money || 0)}
                step={10}
                value={requestedMoney}
                onChange={(e) => setRequestedMoney(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Properties List */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-neutral-700">Select Properties:</span>
              {partnerProperties.length === 0 ? (
                <span className="text-xs text-neutral-400 italic">{partner?.name} owns no properties</span>
              ) : (
                <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
                  {partnerProperties.map((prop) => {
                    const sq = SQUARES[prop.index];
                    const isSelected = requestedProps.includes(prop.index);

                    return (
                      <label
                        key={prop.index}
                        className={`flex items-center justify-between p-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 font-semibold text-blue-950'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRequestedProp(prop.index)}
                            className="rounded accent-blue-600"
                          />
                          {sq.color && (
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: sq.color }}
                            />
                          )}
                          <span className="truncate max-w-[120px]">{sq.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 tabular-nums">${sq.price}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Partner Jail Cards */}
            {partner && (partner.getOutOfJailCards.chance > 0 || partner.getOutOfJailCards.communityChest > 0) && (
              <div className="flex flex-col gap-1 pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-semibold text-neutral-700">Jail Cards:</span>
                {partner.getOutOfJailCards.chance > 0 && (
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestedChanceCard}
                      onChange={(e) => setRequestedChanceCard(e.target.checked)}
                      className="accent-blue-600"
                    />
                    Chance "Get Out of Jail Free" Card
                  </label>
                )}
                {partner.getOutOfJailCards.communityChest > 0 && (
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestedCCCard}
                      onChange={(e) => setRequestedCCCard(e.target.checked)}
                      className="accent-blue-600"
                    />
                    Community Chest "Get Out of Jail Free" Card
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Valuation Feedback Meter & Submit Bar */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBotLikelyToAccept ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> {partner?.name} will likely ACCEPT
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4" /> {partner?.name} will likely REJECT (Offer more value)
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTradeModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!validation.valid || (offeredMoney === 0 && offeredProps.length === 0 && requestedMoney === 0 && requestedProps.length === 0)}
              onClick={handleSendProposal}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-neutral-200 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4" /> Propose Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
