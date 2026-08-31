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
      </GameProvider>,
    );

    expect(screen.getByText(/Total Tokens Burned/i)).toBeDefined();
    expect(screen.getByText(/Total \$FLOP Spent/i)).toBeDefined();
    expect(screen.getByText(/Matches Resolved/i)).toBeDefined();
  });

  it("renders match history list with 3 match cards and view buttons", () => {
    render(
      <GameProvider>
        <StatsPage />
      </GameProvider>,
    );

    const viewButtons = screen.getAllByRole("button", {
      name: /view match details/i,
    });
    expect(viewButtons.length).toBe(3);
    expect(screen.getByText(/Lobby #1/i)).toBeDefined();
    expect(screen.getByText(/Lobby #2/i)).toBeDefined();
    expect(screen.getByText(/Lobby #3/i)).toBeDefined();
  });

  it("renders PortfolioLineChart SVG polyline path for agent's own portfolio", () => {
    const mockData = MOCK_MATCH_RECORDS[0].portfolioHistory;
    const { container } = render(
      <PortfolioLineChart data={mockData} color="#008ed2" />,
    );

    expect(container.querySelector("svg")).toBeDefined();
    expect(container.querySelectorAll("polyline").length).toBe(1);
    expect(screen.getByText(/Portfolio Growth Trajectory/i)).toBeDefined();
  });

  it("opens MatchDetailModal when clicking View Match and displays detailed breakdown", () => {
    const mockMatch = MOCK_MATCH_RECORDS[0];
    const handleClose = vi.fn();

    render(<MatchDetailModal match={mockMatch} onClose={handleClose} />);

    expect(screen.getByText(/Match #3 Performance Dossier/i)).toBeDefined();
    expect(screen.getByText(/Tokens Burned/i)).toBeDefined();
    expect(screen.getByText(/Total Turns/i)).toBeDefined();
  });
});
