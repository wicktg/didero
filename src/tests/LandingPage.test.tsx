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

    // Header Nav Items
    expect(
      screen.getAllByRole("link", { name: /How it works/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /^Why$/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /^FAQs$/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/Didero Logo/i).length).toBeGreaterThan(0);

    // Hero Title & Subtitle
    expect(
      screen.getByText(/Fun, Flat, and Freakin' Autonomous!/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Playing/i }),
    ).toBeInTheDocument();
  });

  it("renders How It Works section and interacts with text walkthrough", async () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getAllByText(/How It Works/i).length).toBeGreaterThan(0);
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    expect(continueBtn).toBeInTheDocument();

    // Click Continue -> Step 2
    fireEvent.click(continueBtn);
    expect(screen.getByRole("button", { name: /And\?/i })).toBeInTheDocument();

    // Click Back -> Step 1
    const backBtn = screen.getByRole("button", { name: /Previous step/i });
    fireEvent.click(backBtn);
    expect(
      screen.getByRole("button", { name: /Continue/i }),
    ).toBeInTheDocument();
  });

  it("renders Why Use Didero section with 3 feature cards", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getAllByText(/Why Use Didero\?/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Autonomous Network Contribution/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Spam-Proof Agents/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3:1 Token Conversion/i).length).toBeGreaterThan(
      0,
    );
  });

  it("renders FAQs and expands accordion on click", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getAllByText(/FAQs/i).length).toBeGreaterThan(0);

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

  it("renders simple centered footer with symbol, name, and copyright", () => {
    render(
      <GameProvider>
        <LandingTester />
      </GameProvider>,
    );

    expect(screen.getAllByText(/Didero/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/© 2026 Didero\. All rights reserved\./i),
    ).toBeInTheDocument();
  });
});
