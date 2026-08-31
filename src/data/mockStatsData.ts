import { MatchRecord, StatsOverview } from "../types/stats";

export const MOCK_MATCH_RECORDS: MatchRecord[] = [
  {
    id: "match-003",
    matchNumber: 3,
    date: "Aug 31, 2026 • 10:45 AM",
    timestamp: Date.now() - 3600000,
    durationSeconds: 190,
    totalTurns: 38,
    winnerId: 0,
    winnerName: "Agent Alpha (Player 1)",
    loserId: 1,
    loserName: "Agent Beta (Player 2)",
    resolutionType: "BANKRUPTCY",
    winnerEndingNetWorth: 3420,
    loserEndingNetWorth: 0,
    winnerPropertiesCount: 14,
    winnerMonopolies: ["ORANGE", "BROWN"],
    tokensBurned: 18420,
    flopSpent: 1.84,
    milestones: [
      {
        turn: 14,
        agentId: 0,
        agentName: "Agent Alpha",
        type: "MONOPOLY",
        title: "Completed Orange Monopoly",
        thought:
          "Acquiring New York Avenue completes the high-traffic Orange set. With $920 liquid cash, I can safely initiate 3-house development next turn.",
        impact: "Tripled rent danger on 2nd edge; forced defensive play.",
      },
      {
        turn: 22,
        agentId: 0,
        agentName: "Agent Alpha",
        type: "BUILDING",
        title: "Built 3 Houses across Orange",
        thought:
          "Upgrading St. James and Tennessee to 3 houses creates a $550/land tollway. Expected value outweighs cash reserve risk.",
        impact: "Agent Beta took $550 rent hit on Turn 26.",
      },
      {
        turn: 38,
        agentId: 1,
        agentName: "Agent Beta",
        type: "BANKRUPTCY",
        title: "Insurmountable Debt Liquidation",
        thought:
          "Mortgaging Light Blue properties yields $160, which falls $390 short of the $550 rent due. Declaring bankruptcy.",
        impact: "Match concluded with Agent Alpha victory.",
      },
    ],
    portfolioHistory: [
      { turn: 1, agent1NetWorth: 1500, agent1Cash: 1500, agent2NetWorth: 1500, agent2Cash: 1500 },
      { turn: 5, agent1NetWorth: 1560, agent1Cash: 1380, agent2NetWorth: 1640, agent2Cash: 1440 },
      { turn: 10, agent1NetWorth: 1720, agent1Cash: 1220, agent2NetWorth: 1800, agent2Cash: 1300 },
      { turn: 14, agent1NetWorth: 2100, agent1Cash: 1100, agent2NetWorth: 1850, agent2Cash: 1250, event: "Orange Monopoly" },
      { turn: 20, agent1NetWorth: 2450, agent1Cash: 950, agent2NetWorth: 1700, agent2Cash: 1100 },
      { turn: 26, agent1NetWorth: 2900, agent1Cash: 1500, agent2NetWorth: 1150, agent2Cash: 550, event: "$550 Rent Paid" },
      { turn: 32, agent1NetWorth: 3150, agent1Cash: 1750, agent2NetWorth: 700, agent2Cash: 200 },
      { turn: 38, agent1NetWorth: 3420, agent1Cash: 2020, agent2NetWorth: 0, agent2Cash: 0, event: "Bankruptcy" },
    ],
  },
  {
    id: "match-002",
    matchNumber: 2,
    date: "Aug 30, 2026 • 08:20 PM",
    timestamp: Date.now() - 54000000,
    durationSeconds: 220,
    totalTurns: 44,
    winnerId: 1,
    winnerName: "Agent Beta (Player 2)",
    loserId: 0,
    loserName: "Agent Alpha (Player 1)",
    resolutionType: "BANKRUPTCY",
    winnerEndingNetWorth: 2890,
    loserEndingNetWorth: 0,
    winnerPropertiesCount: 11,
    winnerMonopolies: ["RED"],
    tokensBurned: 22150,
    flopSpent: 2.21,
    milestones: [
      {
        turn: 18,
        agentId: 1,
        agentName: "Agent Beta",
        type: "AUCTION",
        title: "Won Illinois Ave Auction at $290",
        thought:
          "Agent Alpha declined at $240. Bidding $290 completes the Red group. Strategic payoff exceeds face value by 2.4x.",
        impact: "Completed Red Monopoly.",
      },
      {
        turn: 31,
        agentId: 1,
        agentName: "Agent Beta",
        type: "BUILDING",
        title: "Developed 2 Houses on Red Set",
        thought:
          "Cash reserves at $620 allow full 2-house deployment across Kentucky, Indiana, and Illinois with $170 buffer.",
        impact: "Increased rent to $300 per landing.",
      },
      {
        turn: 44,
        agentId: 0,
        agentName: "Agent Alpha",
        type: "BANKRUPTCY",
        title: "Landed on Illinois Ave with 3 Houses",
        thought:
          "Rent is $750. Total liquidated assets only reach $410. Declaring bankruptcy.",
        impact: "Agent Beta secures tournament victory.",
      },
    ],
    portfolioHistory: [
      { turn: 1, agent1NetWorth: 1500, agent1Cash: 1500, agent2NetWorth: 1500, agent2Cash: 1500 },
      { turn: 8, agent1NetWorth: 1680, agent1Cash: 1320, agent2NetWorth: 1600, agent2Cash: 1300 },
      { turn: 18, agent1NetWorth: 1750, agent1Cash: 1150, agent2NetWorth: 2050, agent2Cash: 860, event: "Red Monopoly Auction" },
      { turn: 28, agent1NetWorth: 1600, agent1Cash: 900, agent2NetWorth: 2350, agent2Cash: 1050 },
      { turn: 36, agent1NetWorth: 1100, agent1Cash: 400, agent2NetWorth: 2600, agent2Cash: 1300 },
      { turn: 44, agent1NetWorth: 0, agent1Cash: 0, agent2NetWorth: 2890, agent2Cash: 1690, event: "Bankruptcy" },
    ],
  },
  {
    id: "match-001",
    matchNumber: 1,
    date: "Aug 30, 2026 • 04:10 PM",
    timestamp: Date.now() - 69000000,
    durationSeconds: 155,
    totalTurns: 31,
    winnerId: 0,
    winnerName: "Agent Alpha (Player 1)",
    loserId: 1,
    loserName: "Agent Beta (Player 2)",
    resolutionType: "BANKRUPTCY",
    winnerEndingNetWorth: 4100,
    loserEndingNetWorth: 0,
    winnerPropertiesCount: 16,
    winnerMonopolies: ["YELLOW", "GREEN"],
    tokensBurned: 14800,
    flopSpent: 1.48,
    milestones: [
      {
        turn: 11,
        agentId: 0,
        agentName: "Agent Alpha",
        type: "TRADE",
        title: "Executed Marvin Gardens Trade",
        thought:
          "Trading States Ave plus $250 cash to Agent Beta for Marvin Gardens completes my Yellow monopoly.",
        impact: "Completed Yellow Monopoly on Turn 11.",
      },
      {
        turn: 24,
        agentId: 0,
        agentName: "Agent Alpha",
        type: "BUILDING",
        title: "Erected Hotels on Yellow Set",
        thought:
          "Yellow hotel toll of $1,200 is lethal at current opponent cash reserves. Committing $900 build capital.",
        impact: "Lethal $1,200 rent trap on top edge.",
      },
      {
        turn: 31,
        agentId: 1,
        agentName: "Agent Beta",
        type: "BANKRUPTCY",
        title: "Landed on Atlantic Ave ($1,000 rent)",
        thought:
          "Rent exceeds total net worth. Conceding match.",
        impact: "Agent Alpha 4,100 Net Worth landslide victory.",
      },
    ],
    portfolioHistory: [
      { turn: 1, agent1NetWorth: 1500, agent1Cash: 1500, agent2NetWorth: 1500, agent2Cash: 1500 },
      { turn: 7, agent1NetWorth: 1620, agent1Cash: 1320, agent2NetWorth: 1580, agent2Cash: 1300 },
      { turn: 11, agent1NetWorth: 2000, agent1Cash: 950, agent2NetWorth: 1750, agent2Cash: 1450, event: "Yellow Trade" },
      { turn: 20, agent1NetWorth: 2750, agent1Cash: 1200, agent2NetWorth: 1400, agent2Cash: 800 },
      { turn: 24, agent1NetWorth: 3400, agent1Cash: 700, agent2NetWorth: 1100, agent2Cash: 500, event: "Yellow Hotels" },
      { turn: 31, agent1NetWorth: 4100, agent1Cash: 1800, agent2NetWorth: 0, agent2Cash: 0, event: "Landslide Victory" },
    ],
  },
];

export function getStatsOverview(
  matches: MatchRecord[] = MOCK_MATCH_RECORDS,
  liveTokensBurned: number = 0,
  liveFlopSpent: number = 0,
): StatsOverview {
  const matchTokens = matches.reduce((acc, m) => acc + m.tokensBurned, 0);
  const matchFlop = matches.reduce((acc, m) => acc + m.flopSpent, 0);

  const agent1Wins = matches.filter((m) => m.winnerId === 0).length;
  const agent2Wins = matches.filter((m) => m.winnerId === 1).length;
  const averageTurns =
    matches.length > 0
      ? Math.round(
          matches.reduce((acc, m) => acc + m.totalTurns, 0) / matches.length,
        )
      : 0;

  return {
    totalTokensBurned: liveTokensBurned > 0 ? liveTokensBurned : matchTokens,
    totalFlopSpent: liveFlopSpent > 0 ? liveFlopSpent : matchFlop,
    totalMatches: matches.length,
    agent1Wins,
    agent2Wins,
    averageTurns,
  };
}
