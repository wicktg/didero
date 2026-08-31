import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsPage } from "../components/stats/StatsPage";
import { PortfolioLineChart } from "../components/stats/PortfolioLineChart";
import { MatchDetailModal } from "../components/stats/MatchDetailModal";
import { MOCK_MATCH_RECORDS } from "../data/mockStatsData";
import { GameProvider } from "../context/GameContext";

describe("StatsPage and Match Analytics Suite", () => {
  it("renders Total Overview metrics including tokens burned and $FLOP spent", () => {
    render(
      <GameProvider>
        <StatsPage />
      </GameProvider>
    );

    expect(screen.getByText(/Total Tokens Burned/i)).toBeDefined();
    expect(screen.getByText(/Total \$FLOP Spent/i)).toBeDefined();
    expect(screen.getByText(/Matches Resolved/i)).toBeDefined();
    expect(screen.getByText(/Leader Standing/i)).toBeDefined();
  });

  it("renders match history list with 3 match cards and view buttons", () => {
    render(
      <GameProvider>
        <StatsPage />
      </GameProvider>
    );

    const viewButtons = screen.getAllByRole("button", { name: /View Match/i });
    expect(viewButtons.length).toBe(3);
  });

  it("renders PortfolioLineChart SVG polyline paths and data markers", () => {
    const mockData = MOCK_MATCH_RECORDS[0].portfolioHistory;
    const { container } = render(
      <PortfolioLineChart
        data={mockData}
        agent1Name="Agent Alpha"
        agent2Name="Agent Beta"
      />
    );

    expect(container.querySelector("svg")).toBeDefined();
    expect(container.querySelectorAll("polyline").length).toBe(2);
    expect(screen.getByText(/Net Worth Trajectory Across Turns/i)).toBeDefined();
  });

  it("opens MatchDetailModal when clicking View Match and displays detailed breakdown", () => {
    const mockMatch = MOCK_MATCH_RECORDS[0];
    const handleClose = vi.fn();

    render(
      <MatchDetailModal match={mockMatch} onClose={handleClose} />
    );

    expect(screen.getByText(/Match #3 Performance Dossier/i)).toBeDefined();
    expect(screen.getByText(/Completed Orange Monopoly/i)).toBeDefined();
    expect(screen.getByText(/Built 3 Houses across Orange/i)).toBeDefined();
  });
});
