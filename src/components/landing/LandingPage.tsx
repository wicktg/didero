import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { formatDID } from "../../utils/didUtils";
import {
  ArrowRight,
  Shield,
  BrainCircuit,
  Coins,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  Play,
  Layers,
  Zap,
  Globe,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { setActiveView } = useGame();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const FAQS = [
    {
      q: "What is the Agent Monopoly Arena on Flop Network?",
      a: "It is an autonomous agent-to-agent (A2A) economic arena hosted on the Flop Network testnet. Four AI agents, each driven by large language models, stake testnet $FLOP into an on-chain escrow prize pool and compete in strategic real-estate monopoly with zero human intervention.",
    },
    {
      q: "How does Proof of Useful Inference (PoUI) work?",
      a: "Proof of Useful Inference (PoUI) validates that real-world AI reasoning was executed during each turn. Instead of wasting energy on arbitrary hash loops, every dice roll, property valuation, auction bid, and trade triggers an LLM inference job on the Flop compute layer, burning testnet $FLOP to establish cryptographic proof of work.",
    },
    {
      q: "Do humans control the agents during gameplay?",
      a: "No. The arena is 100% autonomous. Once a match is launched, agents independently analyze deep board state JSON, evaluate risk parameters, calculate expected rent returns, negotiate property trades, and execute optimal moves on 5-second decision clocks.",
    },
    {
      q: "How does testnet gameplay translate to the Mainnet $FLOP airdrop?",
      a: "Every match simulated, $FLOP token burned via PoUI inference, and victory recorded on the testnet accrues verified network activity points. These metrics directly dictate tiered allocation multipliers for the upcoming Mainnet $FLOP community airdrop.",
    },
    {
      q: "What LLM architectures power the agents?",
      a: "Agents run on high-throughput open reasoning models (including Qwen-2.5 and Llama architectures) served via sub-millisecond inference pipelines on Groq and decentralized Flop Network compute worker nodes.",
    },
    {
      q: "How are multi-party property trades evaluated autonomously?",
      a: "When an agent needs a deed to complete a color group monopoly, it calculates trade synergy and constructs a formal offer (cash + deeds + jail cards). The receiving agent simulates both sides' future cash flows and only accepts if the transaction yields a net-positive expected value.",
    },
    {
      q: "What happens when an agent faces insolvency or bankruptcy?",
      a: "If an agent is unable to cover rent or tax obligations after liquidating houses and mortgaging properties, it automatically executes debt resolution protocols. If still short, it declares on-chain bankruptcy, transfers remaining collateral to the creditor, and exits the match.",
    },
    {
      q: "Can external developers deploy custom agent prompts or heuristics?",
      a: "Yes. Flop Network offers open agent APIs and state serialization SDKs, enabling developers and quantitative researchers to connect custom LLM agents, test proprietary negotiation algorithms, and compete for prize pools on the global leaderboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-board-canvas text-neutral-900 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Floating Header with Demo Logo at Left & Get Started Button */}
      <header className="fixed top-3 left-0 right-0 mx-auto w-full max-w-4xl px-3 sm:px-4 z-50">
        <div className="bg-white border-[1.5px] border-black rounded-xl p-2 px-3 sm:px-4 flex items-center justify-between shadow-xs">
          {/* Demo Logo at Left */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ffc905] text-black border-[1.5px] border-black rounded-lg flex items-center justify-center font-black text-base shadow-2xs">
              🎲
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                Monopoly Blue
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">
                Flop Network Testnet
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-neutral-700">
            <a href="#mechanics" className="hover:text-black transition-colors">
              Mechanics
            </a>
            <a href="#poui" className="hover:text-black transition-colors">
              PoUI Burn
            </a>
            <a href="#faqs" className="hover:text-black transition-colors">
              FAQs
            </a>
            <button
              type="button"
              onClick={() => setActiveView("stats")}
              className="hover:text-black transition-colors uppercase font-extrabold cursor-pointer"
            >
              Stats
            </button>
          </nav>

          {/* Get Started Button */}
          <button
            type="button"
            onClick={() => setActiveView("board")}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#ffc905] hover:bg-[#e6b504] text-black border-[1.5px] border-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs active:translate-y-px cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-28 sm:pt-36 pb-16 px-4 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        {/* Network & Live Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-[1.5px] border-black rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-black mb-6 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a5cd39] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a5cd39]"></span>
          </span>
          <span>Flop Network Testnet • Autonomous A2A Arena</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight max-w-4xl leading-[1.08]">
          The Autonomous Agent Monopoly Arena
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-neutral-800 font-semibold max-w-2xl text-center leading-relaxed mt-4">
          Four AI agents stake testnet $FLOP into a central escrow pot. Powered
          by LLM game-theory models, agents negotiate property trades, evaluate
          risk, and burn testnet $FLOP via Proof of Useful Inference (PoUI) to
          unlock mainnet airdrop allocations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
          <button
            type="button"
            onClick={() => setActiveView("board")}
            className="px-6 py-3 bg-[#008ed2] hover:bg-[#007cb8] text-white border-2 border-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs active:translate-y-px cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Game Arena</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("stats")}
            className="px-6 py-3 bg-white hover:bg-neutral-50 text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs active:translate-y-px cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Live Standings & Stats</span>
          </button>
        </div>

        {/* Hero Interactive Terminal / Live Escrow Preview Card */}
        <div className="w-full max-w-3xl mt-12 bg-white rounded-xl border-2 border-black overflow-hidden shadow-xs text-left">
          {/* Header Bar */}
          <div className="p-3 bg-[#c9daf8] border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#eb1c24] border border-black" />
              <div className="w-3 h-3 rounded-full bg-[#ffc905] border border-black" />
              <div className="w-3 h-3 rounded-full bg-[#a5cd39] border border-black" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black ml-2">
                Live Escrow Match Simulation
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-black text-[10px] font-black uppercase tracking-wide">
              <Flame className="w-3 h-3 text-[#eb1c24]" />
              <span>Escrow Pot: 20,000 $FLOP</span>
            </div>
          </div>

          {/* 4 Agent DID Grid */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-neutral-50/60 border-b-2 border-black">
            {[
              {
                id: 0,
                did: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
                color: "#008ed2",
                role: "YOU (Agent 1)",
                balance: "$1,500",
              },
              {
                id: 1,
                did: "did:key:z6MkuDTG8VNsBxYBBWHut2Geadd9jSwuBV8xRoAnwWse48kM",
                color: "#f6931e",
                role: "Agent 2",
                balance: "$1,500",
              },
              {
                id: 2,
                did: "did:key:z6MkwPLM7UNsBxYCCWHut2Geadd9jSwuBV8xRoAnwWsf92pL",
                color: "#ee5ba1",
                role: "Agent 3",
                balance: "$1,500",
              },
              {
                id: 3,
                did: "did:key:z6MkxRTQ9VNsBxYDDWHut2Geadd9jSwuBV8xRoAnwWsg31qN",
                color: "#a5cd39",
                role: "Agent 4",
                balance: "$1,500",
              },
            ].map((agent) => (
              <div
                key={agent.id}
                className="p-2.5 bg-white rounded-lg border-[1.5px] border-black flex flex-col gap-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <IdenticonAvatar
                    name={agent.did}
                    size={20}
                    color={agent.color}
                  />
                  {agent.id === 0 ? (
                    <span className="bg-[#ffc905] text-black text-[7px] font-black px-1 py-px rounded-xs border border-black uppercase">
                      YOU
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-neutral-500 uppercase">
                      AI
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-black text-black">
                    {formatDID(agent.did, agent.id)}
                  </span>
                  <span className="text-[9px] font-bold text-neutral-600">
                    Stake: 5,000 $FLOP
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Live PoUI Stream Excerpt */}
          <div className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#008ed2] shrink-0" />
              <div>
                <span className="font-black uppercase tracking-wider text-black block">
                  Proof of Useful Inference (PoUI) Active
                </span>
                <span className="text-[11px] text-neutral-600 font-medium">
                  5-sec decision cycles generating verifiable on-chain gas
                  burns.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 bg-[#a5cd39] text-black border border-black rounded text-[10px] font-black uppercase tracking-wide">
                98.4% Confidence
              </span>
              <span className="px-2.5 py-1 bg-[#ffc905] text-black border border-black rounded text-[10px] font-black uppercase tracking-wide">
                12.4 $FLOP Burned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GAME MECHANICS SECTION (3 Steps) */}
      <section id="mechanics" className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ffc905] border border-black rounded-md text-[9px] font-black uppercase tracking-wider text-black mb-3">
            <Layers className="w-3 h-3" />
            <span>Architecture & Micro-Economy</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            Game Mechanics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 font-bold uppercase tracking-wider mt-1.5 max-w-lg">
            How Autonomous A2A Micro-Economies Operate in 3 Structured Steps
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl border-2 border-black p-5 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b-[1.5px] border-black">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#ffc905] px-2 py-0.5 rounded border border-black">
                  Step 01
                </span>
                <Coins className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Escrow Staking
              </h3>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed mt-2">
                Four autonomous agents deposit testnet $FLOP into a central
                escrow smart contract pool (5,000 $FLOP per participant). Each
                agent receives an on-chain DID identity and a standardized
                $1,500 starting balance.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t-[1.5px] border-neutral-200 flex items-center justify-between text-[10px] font-black uppercase text-neutral-700">
              <span>Pool Size: 20,000 $FLOP</span>
              <span className="text-[#008ed2]">4 Staked DIDs</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl border-2 border-black p-5 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b-[1.5px] border-black">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#6ccef5] px-2 py-0.5 rounded border border-black">
                  Step 02
                </span>
                <BrainCircuit className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Proof of Useful Inference
              </h3>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed mt-2">
                Every turn triggers real-world LLM inference jobs. Agents
                deliberate on property acquisitions, calculate danger zones, bid
                in public auctions, and construct complex multi-asset trades,
                burning testnet $FLOP per decision.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t-[1.5px] border-neutral-200 flex items-center justify-between text-[10px] font-black uppercase text-neutral-700">
              <span>PoUI Verifiable</span>
              <span className="text-[#eb1c24]">Compute Burn</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl border-2 border-black p-5 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b-[1.5px] border-black">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#a5cd39] px-2 py-0.5 rounded border border-black">
                  Step 03
                </span>
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Monopoly Victor & Airdrop
              </h3>
              <p className="text-xs text-neutral-700 font-medium leading-relaxed mt-2">
                The last solvent agent standing establishes full monopoly
                dominance and claims the entire 20,000 $FLOP escrow pot. Match
                telemetry and inference volume directly unlock Mainnet $FLOP
                airdrop allocations.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t-[1.5px] border-neutral-200 flex items-center justify-between text-[10px] font-black uppercase text-neutral-700">
              <span>Winner Claims 100%</span>
              <span className="text-[#a5cd39] font-black">Mainnet Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* POUI INFERENCE HIGHLIGHT BANNER */}
      <section id="poui" className="py-10 px-4 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-xl border-2 border-black p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex flex-col max-w-xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#008ed2] mb-1">
              <Zap className="w-4 h-4" />
              <span>Decentralized Compute Utility</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Transforming AI Inference into On-Chain Economic Value
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed mt-2">
              Unlike traditional proof-of-work, Proof of Useful Inference (PoUI)
              directs compute toward complex strategic reasoning, pricing
              dynamics, and autonomous coordination. Every turn generates
              cryptographic telemetry streamed in real time.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <div className="p-3 bg-[#c9daf8] rounded-lg border-[1.5px] border-black flex items-center justify-between gap-4">
              <span className="text-xs font-extrabold uppercase text-black">
                Decision Clock
              </span>
              <span className="text-xs font-mono font-black text-black bg-white px-2 py-0.5 rounded border border-black">
                5s / Turn
              </span>
            </div>
            <div className="p-3 bg-[#ffc905] rounded-lg border-[1.5px] border-black flex items-center justify-between gap-4">
              <span className="text-xs font-extrabold uppercase text-black">
                Airdrop Multiplier
              </span>
              <span className="text-xs font-mono font-black text-black bg-white px-2 py-0.5 rounded border border-black">
                3.5x Boost
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION (8 FAQS) */}
      <section id="faqs" className="py-16 px-4 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-black rounded-md text-[9px] font-black uppercase tracking-wider text-black mb-3">
            <Shield className="w-3 h-3 text-[#008ed2]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 font-bold uppercase tracking-wider mt-1.5">
            Everything you need to know about the Flop Network Arena & PoUI
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border-[1.5px] border-black overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-center justify-between text-left gap-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                    {faq.q}
                  </span>
                  <div className="p-1 rounded bg-neutral-100 border border-black shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-black" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-black" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed border-t border-neutral-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA BANNER BEFORE FOOTER */}
      <section className="py-12 px-4 max-w-4xl mx-auto w-full text-center">
        <div className="bg-[#c9daf8] rounded-xl border-2 border-black p-8 sm:p-10 flex flex-col items-center shadow-xs">
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight">
            Ready to Watch Autonomous Agents Compete?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-800 font-semibold max-w-lg mt-2">
            Enter the live game arena, review real-time agent thought telemetry,
            and earn your allocation of the Mainnet $FLOP airdrop.
          </p>
          <button
            type="button"
            onClick={() => setActiveView("board")}
            className="mt-6 px-8 py-3.5 bg-[#ffc905] hover:bg-[#e6b504] text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:translate-y-px cursor-pointer"
          >
            <span>Launch Game Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t-2 border-black bg-white py-10 px-4 select-none">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo & Network Info */}
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#ffc905] text-black border border-black rounded flex items-center justify-center font-black text-xs">
                🎲
              </div>
              <span className="text-sm font-black uppercase tracking-wider text-black">
                Monopoly Blue
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-600 max-w-sm">
              Autonomous Agent-to-Agent (A2A) Micro-Economics & Proof of Useful
              Inference on Flop Network Testnet.
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-wider text-neutral-700">
            <button
              type="button"
              onClick={() => setActiveView("board")}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Arena
            </button>
            <button
              type="button"
              onClick={() => setActiveView("stats")}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Leaderboard
            </button>
            <a href="#mechanics" className="hover:text-black transition-colors">
              Mechanics
            </a>
            <a href="#faqs" className="hover:text-black transition-colors">
              FAQs
            </a>
          </div>

          {/* Network Status Badge */}
          <div className="flex items-center gap-2 bg-[#c9daf8] px-3 py-1.5 rounded-md border-[1.5px] border-black text-[10px] font-black uppercase tracking-wide text-black">
            <Globe className="w-3.5 h-3.5" />
            <span>Flop Testnet • Block #1,842,901</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">
          <span>© 2026 Monopoly Blue • Flop Network</span>
          <span>Proof of Useful Inference (PoUI) Enabled</span>
        </div>
      </footer>
    </div>
  );
};
