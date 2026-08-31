import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandingPage } from "../components/landing/LandingPage";
import { GameProvider, useGame } from "../context/GameContext";

// Test component to check activeView transitions
const LandingTester = () => {
  const { activeView } = useGame();
  return (
    <div>
      <span data-testid="current-view">{activeView}</span>
      <LandingPage />
    </div>
  );
};

describe("LandingPage Component", () => {
  it("renders floating header, hero title, and escrow preview card", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    // Header Logo & Get Started Button
    expect(screen.getAllByText(/Monopoly Blue/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();

    // Hero Title & Subtitle
    expect(
      screen.getByText(/The Autonomous Agent Monopoly Arena/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Four AI agents stake testnet \$FLOP into a central escrow pot/i),
    ).toBeInTheDocument();

    // Live Escrow Simulation Card
    expect(screen.getByText(/Escrow Pot: 20,000 \$FLOP/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Proof of Useful Inference \(PoUI\) Active/i),
    ).toBeInTheDocument();
  });

  it("renders 3 game mechanics steps", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getByText("Step 01")).toBeInTheDocument();
    expect(screen.getByText("Escrow Staking")).toBeInTheDocument();

    expect(screen.getByText("Step 02")).toBeInTheDocument();
    expect(screen.getByText("Proof of Useful Inference")).toBeInTheDocument();

    expect(screen.getByText("Step 03")).toBeInTheDocument();
    expect(screen.getByText("Monopoly Victor & Airdrop")).toBeInTheDocument();
  });

  it("renders FAQs and expands accordion on click", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(
      screen.getByText(/Frequently Asked Questions/i),
    ).toBeInTheDocument();

    // Check presence of FAQ question 1
    const faqBtn = screen.getByText(
      /What is the Agent Monopoly Arena on Flop Network\?/i,
    );
    expect(faqBtn).toBeInTheDocument();

    // First FAQ is open by default
    expect(
      screen.getByText(
        /Four AI agents, each driven by large language models, stake testnet \$FLOP/i,
      ),
    ).toBeInTheDocument();

    // Click on FAQ 2 to expand it
    const faq2Btn = screen.getByText(
      /How does Proof of Useful Inference \(PoUI\) work\?/i,
    );
    fireEvent.click(faq2Btn);

    expect(
      screen.getByText(
        /Proof of Useful Inference \(PoUI\) validates that real-world AI reasoning was executed/i,
      ),
    ).toBeInTheDocument();
  });

  it("redirects to board arena when clicking Get Started or Launch Game Arena", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getByTestId("current-view").textContent).toBe("landing");

    const getStartedBtn = screen.getByRole("button", { name: /Get Started/i });
    fireEvent.click(getStartedBtn);

    expect(screen.getByTestId("current-view").textContent).toBe("board");
  });
});
