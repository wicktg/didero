import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES } from "../../data/boardData";
import { TradeOffer } from "../../types/game";
import { evaluateTradeForBot } from "../../ai/tradeEvaluator";
import { validateTradeOffer } from "../../engine/tradeEngine";
import { X, ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";
import { CustomDropdown } from "../ui/CustomDropdown";
import { NumberStepper } from "../ui/NumberStepper";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { formatDID } from "../../utils/didUtils";

export const TradeModal: React.FC = () => {
  const {
    state,
    dispatch,
    isTradeModalOpen,
    setIsTradeModalOpen,
    tradeRecipientId,
  } = useGame();

  const human = state.players[0];
  const eligiblePartners = state.players.filter(
    (p) => p.id !== 0 && !p.isBankrupt,
  );

  const [partnerId, setPartnerId] = useState<number>(
    tradeRecipientId ?? eligiblePartners[0]?.id ?? 1,
  );
  const [offeredMoney, setOfferedMoney] = useState<number>(0);
  const [requestedMoney, setRequestedMoney] = useState<number>(0);
  const [offeredProps, setOfferedProps] = useState<number[]>([]);
  const [requestedProps, setRequestedProps] = useState<number[]>([]);
  const [offeredChanceCard, setOfferedChanceCard] = useState<boolean>(false);
  const [offeredCCCard, setOfferedCCCard] = useState<boolean>(false);
  const [requestedChanceCard, setRequestedChanceCard] =
    useState<boolean>(false);
  const [requestedCCCard, setRequestedCCCard] = useState<boolean>(false);

  if (!isTradeModalOpen) return null;

  const partner = state.players[partnerId];

  // Properties owned by Human & Partner
  const humanProperties = Object.values(state.properties).filter(
    (p) => p.ownerId === 0,
  );
  const partnerProperties = Object.values(state.properties).filter(
    (p) => p.ownerId === partnerId,
  );

  // Construct draft trade offer
  const draftTrade: TradeOffer = {
    id: `trade-${Date.now()}`,
    initiatorId: 0,
    recipientId: partnerId,
    offeredMoney,
    requestedMoney,
    offeredProperties: offeredProps,
    requestedProperties: requestedProps,
    offeredJailCards: {
      chance: offeredChanceCard,
      communityChest: offeredCCCard,
    },
    requestedJailCards: {
      chance: requestedChanceCard,
      communityChest: requestedCCCard,
    },
  };

  const validation = validateTradeOffer(state, draftTrade);
  const isBotLikelyToAccept =
    validation.valid && evaluateTradeForBot(state, partnerId, draftTrade);

  const handleToggleOfferedProp = (index: number) => {
    setOfferedProps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleToggleRequestedProp = (index: number) => {
    setRequestedProps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleSendProposal = () => {
    if (validation.valid) {
      dispatch({ type: "PROPOSE_TRADE", payload: { trade: draftTrade } });
      setIsTradeModalOpen(false);
    }
  };

  const partnerOptions = eligiblePartners.map((p) => ({
    value: p.id,
    label: formatDID(p.did || p.name, p.id),
    sublabel: `$${p.money}`,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg border-2 border-black overflow-hidden flex flex-col max-h-[90vh] select-none">
        {/* Light Header with Board Blue */}
        <div className="p-3.5 bg-[#c9daf8] text-black flex items-center justify-between border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-black" />
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">
                Propose Trade
              </h3>
              <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
                Negotiate assets & cash
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTradeModalOpen(false)}
            className="p-1 rounded bg-white hover:bg-neutral-100 text-black border border-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Partner Selector Dropdown */}
        <div className="p-3 bg-white border-b-2 border-black flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {partner && (
              <IdenticonAvatar
                name={partner.did || partner.name}
                size={24}
                color={partner.token.color}
              />
            )}
            <span className="text-xs font-extrabold uppercase tracking-wider text-black">
              Trading Partner:
            </span>
          </div>

          <div className="w-56">
            <CustomDropdown
              options={partnerOptions}
              value={partnerId}
              onChange={(val) => {
                setPartnerId(Number(val));
                setRequestedProps([]);
                setRequestedMoney(0);
                setRequestedChanceCard(false);
                setRequestedCCCard(false);
              }}
            />
          </div>
        </div>

        {/* Trade Columns: Left (You) vs Right (Partner) */}
        <div className="flex-1 grid grid-cols-2 divide-x-2 divide-black overflow-y-auto p-4 gap-4 bg-[#c9daf8]/20">
          {/* Your Offer */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black bg-white p-2 rounded border-[1.5px]">
              <div className="flex items-center gap-1.5">
                <IdenticonAvatar
                  name={human.did || human.name}
                  size={20}
                  color={human.token.color}
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-black uppercase tracking-tight text-black">
                    {formatDID(human.did || human.name, 0)}
                  </span>
                  <span className="bg-[#ffc905] text-black text-[8px] font-black px-1.5 py-0.5 rounded-xs border border-black uppercase tracking-wider">
                    YOU
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-700 tabular-nums">
                Cash: ${human.money}
              </span>
            </div>

            {/* Custom Up/Down Number Stepper Input */}
            <NumberStepper
              label="Cash Amount ($)"
              value={offeredMoney}
              onChange={setOfferedMoney}
              min={0}
              max={human.money}
              step={10}
            />

            {/* Properties Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">
                Select Properties ({offeredProps.length} selected)
              </span>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                {humanProperties.length === 0 ? (
                  <span className="text-[10px] text-neutral-600 font-medium py-1">
                    No properties to offer
                  </span>
                ) : (
                  humanProperties.map((prop) => {
                    const sq = SQUARES[prop.index];
                    const isSelected = offeredProps.includes(prop.index);
                    return (
                      <button
                        key={prop.index}
                        type="button"
                        onClick={() => handleToggleOfferedProp(prop.index)}
                        className={`p-2 rounded border-[1.5px] border-black text-xs font-bold text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[#008ed2] text-white"
                            : "bg-white text-black hover:bg-neutral-50"
                        }`}
                      >
                        <span className="truncate">{sq.name}</span>
                        <span className="tabular-nums text-[10px]">
                          ${sq.price}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Jail Cards */}
            {(human.getOutOfJailCards.chance > 0 ||
              human.getOutOfJailCards.communityChest > 0) && (
              <div className="flex flex-col gap-1 pt-1.5 border-t-[1.5px] border-black">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">
                  Get Out of Jail Cards
                </span>
                <div className="flex flex-col gap-1">
                  {human.getOutOfJailCards.chance > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-bold text-black cursor-pointer bg-white p-1.5 rounded border border-black">
                      <input
                        type="checkbox"
                        checked={offeredChanceCard}
                        onChange={(e) => setOfferedChanceCard(e.target.checked)}
                        className="accent-black"
                      />
                      Chance Card ({human.getOutOfJailCards.chance})
                    </label>
                  )}
                  {human.getOutOfJailCards.communityChest > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-bold text-black cursor-pointer bg-white p-1.5 rounded border border-black">
                      <input
                        type="checkbox"
                        checked={offeredCCCard}
                        onChange={(e) => setOfferedCCCard(e.target.checked)}
                        className="accent-black"
                      />
                      Chest Card ({human.getOutOfJailCards.communityChest})
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Partner's Offer */}
          <div className="flex flex-col gap-3 pl-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black bg-white p-2 rounded border-[1.5px]">
              <div className="flex items-center gap-1.5 min-w-0">
                {partner && (
                  <IdenticonAvatar
                    name={partner.did || partner.name}
                    size={20}
                    color={partner.token.color}
                  />
                )}
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-mono font-black uppercase tracking-tight text-black truncate">
                    {formatDID(partner?.did || partner?.name, partnerId)}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-neutral-600 shrink-0">
                    Offers
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-700 tabular-nums shrink-0">
                Cash: ${partner?.money}
              </span>
            </div>

            {/* Custom Up/Down Number Stepper Input */}
            <NumberStepper
              label="Cash Amount ($)"
              value={requestedMoney}
              onChange={setRequestedMoney}
              min={0}
              max={partner?.money || 0}
              step={10}
            />

            {/* Properties Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">
                Select Properties ({requestedProps.length} selected)
              </span>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                {partnerProperties.length === 0 ? (
                  <span className="text-[10px] text-neutral-600 font-medium py-1">
                    Partner has no properties
                  </span>
                ) : (
                  partnerProperties.map((prop) => {
                    const sq = SQUARES[prop.index];
                    const isSelected = requestedProps.includes(prop.index);
                    return (
                      <button
                        key={prop.index}
                        type="button"
                        onClick={() => handleToggleRequestedProp(prop.index)}
                        className={`p-2 rounded border-[1.5px] border-black text-xs font-bold text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[#008ed2] text-white"
                            : "bg-white text-black hover:bg-neutral-50"
                        }`}
                      >
                        <span className="truncate">{sq.name}</span>
                        <span className="tabular-nums text-[10px]">
                          ${sq.price}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Partner Jail Cards */}
            {partner &&
              (partner.getOutOfJailCards.chance > 0 ||
                partner.getOutOfJailCards.communityChest > 0) && (
                <div className="flex flex-col gap-1 pt-1.5 border-t-[1.5px] border-black">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">
                    Get Out of Jail Cards
                  </span>
                  <div className="flex flex-col gap-1">
                    {partner.getOutOfJailCards.chance > 0 && (
                      <label className="flex items-center gap-1.5 text-xs font-bold text-black cursor-pointer bg-white p-1.5 rounded border border-black">
                        <input
                          type="checkbox"
                          checked={requestedChanceCard}
                          onChange={(e) =>
                            setRequestedChanceCard(e.target.checked)
                          }
                          className="accent-black"
                        />
                        Chance Card ({partner.getOutOfJailCards.chance})
                      </label>
                    )}
                    {partner.getOutOfJailCards.communityChest > 0 && (
                      <label className="flex items-center gap-1.5 text-xs font-bold text-black cursor-pointer bg-white p-1.5 rounded border border-black">
                        <input
                          type="checkbox"
                          checked={requestedCCCard}
                          onChange={(e) => setRequestedCCCard(e.target.checked)}
                          className="accent-black"
                        />
                        Chest Card ({partner.getOutOfJailCards.communityChest})
                      </label>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Footer & Submission */}
        <div className="p-4 bg-white border-t-2 border-black flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {isBotLikelyToAccept ? (
              <span className="px-2.5 py-1 bg-[#a5cd39] text-black border border-black rounded text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Likely Accepted
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-[#eb1c24] text-white border border-black rounded text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Likely Declined
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTradeModalOpen(false)}
              className="px-3 py-2 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded-md text-xs font-bold uppercase tracking-wider transition-colors active:translate-y-px"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!validation.valid}
              onClick={handleSendProposal}
              className={`px-4 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider border-[1.5px] border-black transition-colors active:translate-y-px ${
                validation.valid
                  ? "bg-[#008ed2] hover:bg-[#007cb8] text-white"
                  : "bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed"
              }`}
            >
              Send Trade Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
