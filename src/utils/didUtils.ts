/**
 * DID Key resolution and formatting utilities for Monopoly Agents.
 * Example DID: did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH
 * Truncated format: z6Mk...vktH (First 4 chars of key + "..." + last 4 chars)
 */

export const DEFAULT_AGENT_DIDS: Record<number, string> = {
  0: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
  1: "did:key:z6MkuDTG8VNsBxYBBWHut2Geadd9jSwuBV8xRoAnwWse48kM",
  2: "did:key:z6MkwPLM7UNsBxYCCWHut2Geadd9jSwuBV8xRoAnwWsf92pL",
  3: "did:key:z6MkxRTQ9VNsBxYDDWHut2Geadd9jSwuBV8xRoAnwWsg31qN",
  4: "did:key:z6MkyHKR5VNsBxYEEWHut2Geadd9jSwuBV8xRoAnwWsh85vS",
  5: "did:key:z6MkzUVA3VNsBxYFFWHut2Geadd9jSwuBV8xRoAnwWsi97wT",
  6: "did:key:z6MkqBWP2VNsBxYGGWHut2Geadd9jSwuBV8xRoAnwWsj14uR",
};

export function getPlayerDID(playerId: number, customDid?: string): string {
  if (customDid) return customDid;
  return (
    DEFAULT_AGENT_DIDS[playerId] ||
    `did:key:z6Mk${playerId}THR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsd${playerId}ktH`
  );
}

/**
 * Formats a DID string to truncated form: z6Mk...vktH
 */
export function formatDID(didOrName?: string, playerId?: number): string {
  let str = didOrName;
  if (!str && playerId !== undefined) {
    str = getPlayerDID(playerId);
  }
  if (!str) return "z6Mk...vktH";

  // If did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH
  if (str.startsWith("did:key:")) {
    const rawKey = str.slice(8); // Remove "did:key:"
    return `${rawKey.slice(0, 4)}...${rawKey.slice(-4)}`;
  }

  // If already starts with z6Mk and is long
  if (str.startsWith("z6Mk") && str.length > 10) {
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  }

  // If it's a known agent name like "Agent Alpha", "Agent Beta", "You (Player 1)"
  if (
    str.includes("Player 1") ||
    str.includes("Agent Alpha") ||
    str.includes("You")
  ) {
    const key = DEFAULT_AGENT_DIDS[0].slice(8);
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }
  if (str.includes("Player 2") || str.includes("Agent Beta")) {
    const key = DEFAULT_AGENT_DIDS[1].slice(8);
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  if (playerId !== undefined && DEFAULT_AGENT_DIDS[playerId]) {
    const key = DEFAULT_AGENT_DIDS[playerId].slice(8);
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  if (str.length > 12) {
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  }

  return str;
}
