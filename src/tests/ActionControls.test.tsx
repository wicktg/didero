import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActionControls } from "../components/board/ActionControls";
import { GameProvider, useGame } from "../context/GameContext";
import React from "react";

describe("ActionControls Component", () => {
  it("renders human action controls when autonomous mode is off and it is human turn", () => {
    render(
      <GameProvider>
        <ActionControls />
      </GameProvider>,
    );

    // Initial phase is ROLL for player 0 (Human)
    expect(
      screen.getByRole("button", { name: /Roll Dice/i }),
    ).toBeInTheDocument();
  });

  it("renders autonomous status card when autonomous mode is active", () => {
    const TestWrapper: React.FC = () => {
      const { toggleAutonomous } = useGame();
      return (
        <div>
          <button data-testid="start-btn" onClick={toggleAutonomous}>
            Start Auto
          </button>
          <ActionControls />
        </div>
      );
    };

    render(
      <GameProvider>
        <TestWrapper />
      </GameProvider>,
    );

    // Click start auto
    const startBtn = screen.getByTestId("start-btn");
    act(() => {
      fireEvent.click(startBtn);
    });

    // Verify autonomous match card is displayed
    expect(screen.getByText(/Autonomous Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Rolling dice & moving.../i)).toBeInTheDocument();
    expect(screen.getByText(/5s/i)).toBeInTheDocument();
  });
});
