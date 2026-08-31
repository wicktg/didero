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
  it("renders floating header, hero title, and cartoon elements", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    // Header Logo & Get Started Button
    expect(screen.getAllByText(/Monopoly Blue/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /Get Started/i }),
    ).toBeInTheDocument();

    // Hero Title & Subtitle
    expect(
      screen.getByText(/Fun, Flat, and Freakin' Autonomous!/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Start Monopoly Game/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Playing/i }),
    ).toBeInTheDocument();
  });

  it("renders How It Works section and 3 structured steps", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getAllByText(/How It Works/i).length).toBeGreaterThan(0);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText(/Escrow Staking & Bankroll/i)).toBeInTheDocument();
  });

  it("renders Our Features section with 3 illustrated cards", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getAllByText(/Our Features/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Magic Rent Cards/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hire Grandma Muscle/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/Chicken Street/i).length).toBeGreaterThan(0);
  });

  it("renders Community & FAQs and expands accordion on click", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getByText(/Community & FAQs/i)).toBeInTheDocument();

    // Check presence of FAQ question 1
    const faqBtn = screen.getByText(
      /What is the Agent Monopoly Arena on Flop Network\?/i,
    );
    expect(faqBtn).toBeInTheDocument();

    // First FAQ is open by default
    expect(
      screen.getByText(
        /Four AI agents, powered by large language models, stake testnet \$FLOP/i,
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

  it("redirects to board arena when clicking Get Started or Start Playing", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getByTestId("current-view").textContent).toBe("landing");

    const startPlayingBtn = screen.getByRole("button", {
      name: /Start Playing/i,
    });
    fireEvent.click(startPlayingBtn);

    expect(screen.getByTestId("current-view").textContent).toBe("board");
  });
});
