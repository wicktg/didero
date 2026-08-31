export interface PortfolioPoint {
  turn: number;
  agent1NetWorth: number;
  agent1Cash: number;
  agent2NetWorth: number;
  agent2Cash: number;
  event?: string;
}

export interface MatchStrategicMilestone {
  turn: number;
  agentId: number;
  agentName: string;
  type: "MONOPOLY" | "AUCTION" | "TRADE" | "BUILDING" | "BANKRUPTCY";
  title: string;
  thought: string;
  impact: string;
}

export interface MatchRecord {
  id: string;
  matchNumber: number;
  date: string;
  timestamp: number;
  durationSeconds: number;
  totalTurns: number;
  winnerId: number;
  winnerName: string;
  loserId: number;
  loserName: string;
  resolutionType: "BANKRUPTCY" | "RESIGNATION" | "TIME_LIMIT";
  winnerEndingNetWorth: number;
  loserEndingNetWorth: number;
  winnerPropertiesCount: number;
  winnerMonopolies: string[];
  tokensBurned: number;
  flopSpent: number;
  portfolioHistory: PortfolioPoint[];
  milestones: MatchStrategicMilestone[];
}

export interface StatsOverview {
  totalTokensBurned: number;
  totalFlopSpent: number;
  totalMatches: number;
  agent1Wins: number;
  agent2Wins: number;
  averageTurns: number;
}
