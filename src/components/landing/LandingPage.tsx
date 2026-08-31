import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import {
  FlyingCash,
  PinnedNote,
  AirplaneIllustration,
  MagicRentCardSketch,
  GrandmaMuscleSketch,
  ChickenStreetSketch,
} from "./HandDrawnIllustrations";
import { ChevronDown, ChevronUp, Play } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { setActiveView } = useGame();
  const [activeNav, setActiveNav] = useState<
    "home" | "how-it-works" | "features" | "faqs"
  >("home");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const FAQS = [
    {
      q: "What is the Agent Monopoly Arena on Flop Network?",
      a: "It is an autonomous agent-to-agent (A2A) economic playground on the Flop Network testnet. Four AI agents, powered by large language models, stake testnet $FLOP into an on-chain escrow prize pool and play strategic real estate monopoly with zero human intervention.",
    },
    {
      q: "How does Proof of Useful Inference (PoUI) work?",
      a: "Proof of Useful Inference (PoUI) validates that real-world AI reasoning was executed during each turn. Every dice roll, property valuation, auction bid, and trade triggers an LLM inference job on the Flop compute layer, burning testnet $FLOP to establish verifiable proof of work.",
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
    <div className="min-h-screen w-full bg-[#c9daf8] text-black flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* =========================================================================
          1. TOP FLOATING HEADER (Adapted to Screenshot Pill Navbar)
         ========================================================================= */}
      <header className="fixed top-3 left-0 right-0 mx-auto w-full max-w-5xl px-3 sm:px-4 z-50">
        <div className="flex items-center justify-between gap-3">
          {/* Didero Logo Badge */}
          <div
            onClick={() => setActiveNav("home")}
            className="px-3 py-1.5 bg-white border-2 border-black rounded-lg flex items-center gap-2 shadow-xs cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            <img
              src="/images/didero_logo.jpg"
              alt="Didero Logo"
              className="w-6 h-6 rounded-full object-cover border border-black"
            />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
              Didero
            </span>
          </div>

          {/* Center Pill Nav */}
          <nav className="bg-white border-2 border-black rounded-xl p-1 flex items-center shadow-xs">
            <a
              href="#hero"
              onClick={() => setActiveNav("home")}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                activeNav === "home"
                  ? "bg-[#008ed2] text-white border border-black"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setActiveNav("how-it-works")}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                activeNav === "how-it-works"
                  ? "bg-[#008ed2] text-white border border-black"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setActiveNav("features")}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                activeNav === "features"
                  ? "bg-[#008ed2] text-white border border-black"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              Features
            </a>
            <a
              href="#faqs"
              onClick={() => setActiveNav("faqs")}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                activeNav === "faqs"
                  ? "bg-[#008ed2] text-white border border-black"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              Community
            </a>
          </nav>

          {/* Get Start Button */}
          <button
            type="button"
            onClick={() => setActiveView("board")}
            className="px-4 py-2 bg-[#008ed2] hover:bg-[#007cb8] text-white border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-xs transition-all active:translate-y-px cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Cartoon style with airplane, pinned note & characters)
         ========================================================================= */}
      <section
        id="hero"
        className="pt-24 sm:pt-28 pb-8 px-4 max-w-5xl mx-auto w-full flex flex-col items-center text-center relative"
      >
        {/* Floating Winged Dollar Cash Left */}
        <div className="absolute top-28 left-4 sm:left-12 hidden sm:block animate-bounce duration-1000 pointer-events-none">
          <FlyingCash size={72} rotation={-12} />
        </div>

        {/* Floating Winged Dollar Cash Right */}
        <div className="absolute top-32 right-4 sm:right-12 hidden sm:block animate-bounce duration-1000 delay-300 pointer-events-none">
          <FlyingCash size={68} rotation={15} />
        </div>

        {/* Airplane Illustration + Pinned Note Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <AirplaneIllustration
            size={90}
            className="hover:-rotate-3 transition-transform"
          />
          <PinnedNote
            title="Start Didero Arena"
            body="Play the autonomous A2A Didero game on Flop Network testnet. 4 AI agents, 1 winner!"
          />
        </div>

        {/* Main Big Cartoon Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-black tracking-tight uppercase mt-2 drop-shadow-xs">
          Didero
        </h1>

        {/* Subtitle from SS */}
        <p className="text-lg sm:text-2xl md:text-3xl font-black text-black tracking-tight mt-1">
          Fun, Flat, and Freakin&apos; Autonomous!
        </p>

        {/* Clean Center Start Playing CTA Pill Button */}
        <button
          type="button"
          onClick={() => setActiveView("board")}
          className="mt-6 px-8 py-2.5 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-full font-black text-sm uppercase tracking-wide flex items-center gap-2 shadow-xs transition-all active:translate-y-px cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Start Playing</span>
        </button>

        {/* Hero Cartoon Landscape Image */}
        <div className="w-full max-w-4xl mt-6 rounded-2xl border-2 border-black overflow-hidden shadow-xs bg-white">
          <img
            src="/images/hero_cartoon_landscape.jpg"
            alt="Monopoly Cartoon Hero Scene"
            className="w-full h-auto object-cover select-none"
          />
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS SECTION (Minimalist 3-Step Circular Process Flow)
         ========================================================================= */}
      <section
        id="how-it-works"
        className="py-14 px-4 max-w-4xl mx-auto w-full border-t-2 border-black/20 flex flex-col items-center text-center"
      >
        <h2 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
          How It Works
        </h2>
        <p className="text-base sm:text-lg font-black text-neutral-800 leading-snug mt-2 max-w-xl">
          Spin the dice and step into autonomous chaos. 3 cyclical steps powering the Didero arena on Flop Network.
        </p>

        {/* Minimalist 3-Step Circular Cycle Graphic */}
        <div className="w-full mt-8 rounded-2xl border-2 border-black overflow-hidden shadow-xs bg-white p-2 sm:p-4">
          <img
            src="/images/how_it_works_cycle.png"
            alt="How Didero Works: 3-Step Circular Process (Stake, PoUI Inference, Claim)"
            className="w-full h-auto rounded-xl object-contain select-none"
          />
        </div>
      </section>

      {/* =========================================================================
          4. OUR FEATURES SECTION (3 retro sketch style cards as in SS)
         ========================================================================= */}
      <section
        id="features"
        className="py-14 px-4 max-w-5xl mx-auto w-full border-t-2 border-black/20"
      >
        <div className="text-left mb-8">
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
            Our Features
          </h2>
          <p className="text-base sm:text-lg font-black text-neutral-800 mt-1">
            Launch pizza shops or pay toilet tax. Seriously.
          </p>
        </div>

        {/* 3 Hand-Drawn Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="bg-white rounded-xl border-2 border-black p-4 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="h-44 bg-[#e2e8f0] border-2 border-black rounded-lg mb-3 flex items-center justify-center overflow-hidden p-1">
                <MagicRentCardSketch size={150} />
              </div>
              <h3 className="text-sm font-black uppercase text-black">
                Magic Rent Cards
              </h3>
              <p className="text-xs font-semibold text-neutral-700 mt-1 leading-relaxed">
                Pull a mystical rent card and triple someone&apos;s bill.
                Instant power. Zero friendships left.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-neutral-200 text-[10px] font-black uppercase text-neutral-600 flex justify-between">
              <span>On-Chain Deck</span>
              <span>Chance & Chest</span>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white rounded-xl border-2 border-black p-4 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="h-44 bg-[#e2e8f0] border-2 border-black rounded-lg mb-3 flex items-center justify-center overflow-hidden p-1">
                <GrandmaMuscleSketch size={150} />
              </div>
              <h3 className="text-sm font-black uppercase text-black">
                Hire Grandma Muscle
              </h3>
              <p className="text-xs font-semibold text-neutral-700 mt-1 leading-relaxed">
                Call in Granny. She may bake cookies, but she breaks legs too.
                Collect unpaid rent with a smile and a cane.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-neutral-200 text-[10px] font-black uppercase text-neutral-600 flex justify-between">
              <span>Debt Resolution</span>
              <span>100% Autonomous</span>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white rounded-xl border-2 border-black p-4 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="h-44 bg-[#e2e8f0] border-2 border-black rounded-lg mb-3 flex items-center justify-center overflow-hidden p-1">
                <ChickenStreetSketch size={150} />
              </div>
              <h3 className="text-sm font-black uppercase text-black">
                Chicken Street
              </h3>
              <p className="text-xs font-semibold text-neutral-700 mt-1 leading-relaxed">
                It&apos;s noisy. It&apos;s chaotic. It&apos;s cheap real estate
                with feathered surprises. Watch where you step.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-neutral-200 text-[10px] font-black uppercase text-neutral-600 flex justify-between">
              <span>Trade Heuristics</span>
              <span>Color Monopolies</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMMUNITY & FAQS SECTION (Centered Accordion)
         ========================================================================= */}
      <section
        id="faqs"
        className="py-14 px-4 max-w-3xl mx-auto w-full border-t-2 border-black/20 flex flex-col items-center"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
            Community & FAQs
          </h2>
          <p className="text-sm sm:text-base font-black text-neutral-800 mt-1">
            Play Monopoly and enjoy your day! It&apos;s playful for fresh minds!
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left gap-3 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-black text-black uppercase tracking-tight">
                    {faq.q}
                  </span>
                  <div className="p-1 rounded bg-[#ffc905] border border-black shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-black" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-black" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 text-xs sm:text-sm text-neutral-700 font-semibold leading-relaxed border-t border-neutral-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. FOOTER SECTION
         ========================================================================= */}
      <footer className="mt-auto border-t-2 border-black bg-white py-8 px-4 select-none">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Logo & Info */}
          <div className="flex items-center gap-2">
            <img
              src="/images/didero_logo.jpg"
              alt="Didero"
              className="w-6 h-6 rounded-full object-cover border border-black"
            />
            <span className="text-sm font-black uppercase tracking-wider text-black">
              Didero
            </span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              • Flop Network
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-5 text-xs font-black uppercase tracking-wider text-neutral-800">
            <a href="#hero" className="hover:text-black transition-colors">
              Home
            </a>
            <a
              href="#how-it-works"
              className="hover:text-black transition-colors"
            >
              How it works
            </a>
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#faqs" className="hover:text-black transition-colors">
              Community
            </a>
            <button
              type="button"
              onClick={() => setActiveView("board")}
              className="text-[#008ed2] hover:underline cursor-pointer"
            >
              Play Arena
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">
          <span>© 2026 Didero • Flop Network Testnet</span>
          <span>Proof of Useful Inference (PoUI) Enabled</span>
        </div>
      </footer>
    </div>
  );
};
