import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopNav } from "../components/ui/TopNav";
import { GameProvider } from "../context/GameContext";

describe("TopNav Component", () => {
  it("renders navigation items and Play Game button in initial state", () => {
    render(
      <GameProvider>
        <TopNav />
      </GameProvider>,
    );

    expect(screen.getByRole("button", { name: /Board/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stats/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Settings/i }),
    ).toBeInTheDocument();

    const playBtn = screen.getByRole("button", { name: /Play Game/i });
    expect(playBtn).toBeInTheDocument();
    expect(playBtn).toHaveClass("bg-[#ffc905]");
  });

  it("toggles to Pause Game with active countdown when clicked", () => {
    render(
      <GameProvider>
        <TopNav />
      </GameProvider>,
    );

    const playBtn = screen.getByRole("button", { name: /Play Game/i });
    fireEvent.click(playBtn);

    // After clicking, button text changes to Pause Game (Xs) and background is green
    const pauseBtn = screen.getByRole("button", { name: /Pause Game/i });
    expect(pauseBtn).toBeInTheDocument();
    expect(pauseBtn).toHaveClass("bg-[#a5cd39]");

    // Click again to pause
    fireEvent.click(pauseBtn);
    expect(
      screen.getByRole("button", { name: /Play Game/i }),
    ).toBeInTheDocument();
  });
});
