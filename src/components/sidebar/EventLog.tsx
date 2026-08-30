import React, { useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";
import {
  Footprints,
  ShoppingCart,
  DollarSign,
  HelpCircle,
  Gavel,
  ArrowLeftRight,
  ShieldAlert,
  Hammer,
  KeyRound,
  UserX,
  Info,
} from "lucide-react";

export const EventLog: React.FC = () => {
  const { state } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(state.gameLog.length);

  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    if (state.gameLog.length > prevLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevLengthRef.current = state.gameLog.length;
  }, [state.gameLog.length]);

  const getLogIcon = (type: string) => {
    const cls = "w-3 h-3";
    switch (type) {
      case "move":
        return <Footprints className={`${cls} text-black`} />;
      case "buy":
        return <ShoppingCart className={`${cls} text-[#008ed2]`} />;
      case "rent":
        return <DollarSign className={`${cls} text-black`} />;
      case "card":
        return <HelpCircle className={`${cls} text-[#ffc905]`} />;
      case "auction":
        return <Gavel className={`${cls} text-[#f6931e]`} />;
      case "trade":
        return <ArrowLeftRight className={`${cls} text-[#008ed2]`} />;
      case "jail":
        return <ShieldAlert className={`${cls} text-[#eb1c24]`} />;
      case "build":
        return <Hammer className={`${cls} text-[#a5cd39]`} />;
      case "mortgage":
        return <KeyRound className={`${cls} text-[#eb1c24]`} />;
      case "bankruptcy":
        return <UserX className={`${cls} text-[#eb1c24]`} />;
      default:
        return <Info className={`${cls} text-black`} />;
    }
  };

  return (
    <div className="flex flex-col h-full p-3 select-none">
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[700px] pr-1"
      >
        {state.gameLog.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-2.5 p-2 bg-white rounded-md border-[1.5px] border-black text-xs leading-snug"
          >
            <div className="p-1 bg-neutral-100 border border-black rounded shrink-0 mt-0.5">
              {getLogIcon(entry.type)}
            </div>
            <span className="text-black font-semibold flex-1">
              {entry.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
