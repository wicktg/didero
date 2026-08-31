import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES } from "../../data/boardData";
import { GameAction } from "../../engine/gameReducer";
import { TurnPhase, AgentTelemetryEntry } from "../../types/game";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { formatDID } from "../../utils/didUtils";
import {
  BrainCircuit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  Play,
  Sparkles,
} from "lucide-react";

/**
 * Formats a GameAction into a clean, human-readable summary string.
 */
export function formatActionDisplay(action: GameAction | any): string {
  if (!action || typeof action !== "object") return "UNKNOWN";

  const actionType = action.type;
  switch (actionType) {
    case "ROLL_DICE":
      return "ROLL_DICE";
    case "BUY_PROPERTY": {
      const idx = action.payload?.propertyIndex;
      const prop = SQUARES[idx];
      const name = prop ? prop.name : `Square #${idx}`;
      const price = prop?.price ? ` ($${prop.price})` : "";
      return `BUY_PROPERTY: ${name}${price}`;
    }
    case "DECLINE_BUY": {
      const idx = action.payload?.propertyIndex;
      const prop = SQUARES[idx];
      const name = prop ? prop.name : `Square #${idx}`;
      return `DECLINE_BUY: ${name} (Send to Auction)`;
    }
    case "PLACE_AUCTION_BID":
    case "BID_AUCTION": {
      const amount = action.payload?.amount;
      return `BID_AUCTION: $${amount}`;
    }
    case "PASS_AUCTION_BID":
    case "PASS_AUCTION":
      return "PASS_AUCTION";
    case "EXIT_AUCTION":
      return "EXIT_AUCTION";
    case "PROPOSE_TRADE":
      return "PROPOSE_TRADE";
    case "ACCEPT_TRADE":
      return "ACCEPT_TRADE";
    case "REJECT_TRADE":
      return "REJECT_TRADE";
    case "BUILD_HOUSE": {
      const idx = action.payload?.propertyIndex;
      const name = SQUARES[idx]?.name ?? `Square #${idx}`;
      return `BUILD_HOUSE: ${name}`;
    }
    case "SELL_HOUSE": {
      const idx = action.payload?.propertyIndex;
      const name = SQUARES[idx]?.name ?? `Square #${idx}`;
      return `SELL_HOUSE: ${name}`;
    }
    case "MORTGAGE_PROPERTY": {
      const idx = action.payload?.propertyIndex;
      const name = SQUARES[idx]?.name ?? `Square #${idx}`;
      return `MORTGAGE: ${name}`;
    }
    case "UNMORTGAGE_PROPERTY": {
      const idx = action.payload?.propertyIndex;
      const name = SQUARES[idx]?.name ?? `Square #${idx}`;
      return `UNMORTGAGE: ${name}`;
    }
    case "PAY_JAIL_FINE":
      return "PAY_JAIL_FINE ($50)";
    case "USE_JAIL_CARD": {
      const cardType = action.payload?.cardType;
      return `USE_JAIL_CARD (${
        cardType === "chance" ? "Chance" : "Community Chest"
      })`;
    }
    case "RESOLVE_DEBT":
      return "RESOLVE_DEBT";
    case "DECLARE_BANKRUPTCY":
      return "DECLARE_BANKRUPTCY";
    case "END_TURN":
      return "END_TURN";
    case "FALLBACK":
      return "FALLBACK ACTION";
    default:
      return action.type || "UNKNOWN";
  }
}

/**
 * Derives the badge color and label for each TurnPhase.
 */
export function getPhaseBadge(phase: TurnPhase): {
  label: string;
  className: string;
} {
  switch (phase) {
    case "ROLL":
      return {
        label: "ROLL",
        className: "bg-[#008ed2]/15 text-[#008ed2] border-[#008ed2]/40",
      };
    case "LANDED_ACTION":
      return {
        label: "LANDED",
        className: "bg-[#ffc905]/25 text-[#8a6500] border-[#ffc905]",
      };
    case "AUCTION":
      return {
        label: "AUCTION",
        className: "bg-[#f6931e]/20 text-[#c25a00] border-[#f6931e]",
      };
    case "TRADE":
      return {
        label: "TRADE",
        className: "bg-[#008ed2]/20 text-[#006b9e] border-[#008ed2]",
      };
    case "DEBT_RESOLUTION":
      return {
        label: "DEBT",
        className: "bg-[#eb1c24]/15 text-[#eb1c24] border-[#eb1c24]/40",
      };
    case "END_TURN":
      return {
        label: "END TURN",
        className: "bg-[#a5cd39]/25 text-[#4a6b0c] border-[#a5cd39]",
      };
    case "GAME_OVER":
      return {
        label: "GAME OVER",
        className: "bg-neutral-200 text-neutral-800 border-neutral-400",
      };
    default:
      return {
        label: phase,
        className: "bg-neutral-100 text-neutral-700 border-neutral-300",
      };
  }
}

export interface AgentThoughtFeedProps {
  logs?: AgentTelemetryEntry[];
  onClear?: () => void;
}

export const AgentThoughtFeed: React.FC<AgentThoughtFeedProps> = ({
  logs: propLogs,
  onClear: propOnClear,
}) => {
  const {
    state,
    telemetryLogs: contextLogs,
    clearTelemetry: contextClear,
    isAutonomousRunning,
    toggleAutonomous,
  } = useGame();

  const telemetryLogs = propLogs ?? contextLogs;
  const clearTelemetry = propOnClear ?? contextClear;

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(telemetryLogs.length);

  // Auto-scroll to top when new telemetry arrives
  useEffect(() => {
    if (telemetryLogs.length > prevLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevLengthRef.current = telemetryLogs.length;
  }, [telemetryLogs.length]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = async (id: string, stateSnapshot: any) => {
    try {
      const jsonStr = JSON.stringify(stateSnapshot, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy state snapshot:", err);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 select-none">
      {/* Header bar with title and clear button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200">
        <div className="flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-black" />
          <span className="text-[10px] font-black text-black uppercase tracking-wider">
            Agent Telemetry ({telemetryLogs.length})
          </span>
        </div>

        <button
          type="button"
          onClick={clearTelemetry}
          disabled={telemetryLogs.length === 0}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${
            telemetryLogs.length > 0
              ? "bg-white hover:bg-neutral-100 text-black border-black cursor-pointer active:translate-y-px"
              : "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
          }`}
          title="Clear thought logs"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      {/* Feed list or empty state */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[600px] pr-1"
      >
        {telemetryLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[320px] bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-black flex items-center justify-center mb-3 shadow-xs">
              <BrainCircuit className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xs font-black text-black uppercase tracking-wide">
              Autonomous Thought Stream
            </h3>
            <p className="text-[11px] text-neutral-600 font-medium leading-relaxed max-w-[240px] mt-1.5">
              Autonomous agents&apos; reasoning, tactical deliberations, and
              state snapshots will stream here in real time.
            </p>

            {!isAutonomousRunning && (
              <button
                type="button"
                onClick={toggleAutonomous}
                className="mt-4 px-3.5 py-1.5 bg-[#ffc905] hover:bg-[#e6b504] text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs active:translate-y-px"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> Start Match
              </button>
            )}
          </div>
        ) : (
          telemetryLogs.map((entry: AgentTelemetryEntry) => {
            const player = state.players.find((p) => p.id === entry.agentId);
            const tokenColor =
              player?.token?.color ||
              (entry.agentId === 0 ? "#008ed2" : "#eb1c24");
            const phaseBadge = getPhaseBadge(entry.phase);
            const isExpanded = !!expandedIds[entry.id];
            const isCopied = copiedId === entry.id;
            const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={entry.id}
                className="flex flex-col gap-2 p-2.5 bg-white rounded-lg border-[1.5px] border-black shadow-xs animate-log-entry-in"
              >
                {/* Header: Avatar, Name, Turn, Phase Badge, Timestamp */}
                <div className="flex items-center justify-between gap-1 border-b border-neutral-100 pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IdenticonAvatar
                      name={player?.did || entry.agentName}
                      size={20}
                      color={tokenColor}
                    />
                    <span className="font-black font-mono text-xs text-black uppercase tracking-tight truncate max-w-[100px]">
                      {formatDID(player?.did || entry.agentName, entry.agentId)}
                    </span>
                    {entry.agentId === 0 && (
                      <span className="bg-[#ffc905] text-black text-[8px] font-black px-1.5 py-0.5 rounded-xs border border-black uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                    <span className="text-[9px] font-extrabold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                      T#{entry.turnNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${phaseBadge.className}`}
                    >
                      {phaseBadge.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {timeStr}
                    </span>
                  </div>
                </div>

                {/* Deliberation / Reasoning */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-md p-2 text-xs font-medium text-neutral-900 leading-relaxed select-text">
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-neutral-500 tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-[#008ed2]" />
                    <span>Deliberation</span>
                  </div>
                  {entry.thought}
                </div>

                {/* Executed Action */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase text-neutral-600 tracking-wide">
                    Action:
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#c9daf8] text-black font-mono text-[10px] font-bold rounded border border-black">
                    {formatActionDisplay(entry.action)}
                  </span>
                </div>

                {/* Fallback & Error Status Banners */}
                {!entry.isValid && (
                  <div className="bg-[#eb1c24]/10 border border-[#eb1c24]/30 rounded p-1.5 text-[10px] text-[#eb1c24] font-bold flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Fallback Applied:{" "}
                      {entry.validationReason ||
                        "Action was invalid; fallback executed."}
                    </span>
                  </div>
                )}

                {entry.error && (
                  <div className="bg-[#eb1c24]/10 border border-[#eb1c24]/30 rounded p-1.5 text-[10px] text-[#eb1c24] font-bold flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Error: {entry.error}</span>
                  </div>
                )}

                {/* Expandable Accordion: View State JSON & Prompt */}
                <div className="border-t border-neutral-100 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.id)}
                    className="flex items-center justify-between w-full text-[10px] font-extrabold uppercase text-neutral-700 hover:text-black py-1 px-1.5 rounded bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-colors"
                  >
                    <span>View State JSON & Prompt</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-neutral-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-1.5 flex flex-col gap-1 bg-neutral-900 text-neutral-100 p-2 rounded border border-black animate-card-slide-in">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                        <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase">
                          State Snapshot
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(entry.id, entry.stateSnapshot)
                          }
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[9px] font-bold border border-neutral-700 transition-colors"
                          title="Copy JSON to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-[#a5cd39]" />
                              <span className="text-[#a5cd39]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="text-[9px] font-mono text-neutral-300 overflow-x-auto max-h-48 leading-relaxed p-1 select-text">
                        <code>
                          {JSON.stringify(entry.stateSnapshot, null, 2)}
                        </code>
                      </pre>

                      {entry.rawResponse && (
                        <div className="border-t border-neutral-800 pt-1 mt-1">
                          <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase block mb-0.5">
                            Raw LLM Response
                          </span>
                          <pre className="text-[9px] font-mono text-neutral-300 overflow-x-auto max-h-24 leading-relaxed p-1 bg-neutral-950 rounded select-text">
                            <code>{entry.rawResponse}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
