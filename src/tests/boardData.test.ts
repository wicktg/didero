import { describe, it, expect } from "vitest";
import { SQUARES } from "../data/boardData";
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from "../data/cardsData";
import { BOT_PROFILES, PLAYER_TOKENS } from "../data/botProfiles";

describe("Board Data & Game Constants Integrity", () => {
  it("has exactly 40 squares in clockwise board order", () => {
    expect(SQUARES).toHaveLength(40);
    SQUARES.forEach((sq, idx) => {
      expect(sq.index).toBe(idx);
      expect(sq.name).toBeTruthy();
    });
  });

  it("has correct 4 corner squares", () => {
    expect(SQUARES[0].type).toBe("GO");
    expect(SQUARES[10].type).toBe("JAIL");
    expect(SQUARES[20].type).toBe("FREE_PARKING");
    expect(SQUARES[30].type).toBe("GO_TO_JAIL");
  });

  it("has 22 color street properties across 8 color groups", () => {
    const streets = SQUARES.filter((s) => s.type === "STREET");
    expect(streets).toHaveLength(22);

    // Verify group counts
    const groupCounts: Record<string, number> = {};
    streets.forEach((s) => {
      if (s.group) {
        groupCounts[s.group] = (groupCounts[s.group] || 0) + 1;
      }
    });

    expect(groupCounts["BROWN"]).toBe(2);
    expect(groupCounts["LIGHT_BLUE"]).toBe(3);
    expect(groupCounts["PINK"]).toBe(3);
    expect(groupCounts["ORANGE"]).toBe(3);
    expect(groupCounts["RED"]).toBe(3);
    expect(groupCounts["YELLOW"]).toBe(3);
    expect(groupCounts["GREEN"]).toBe(3);
    expect(groupCounts["DARK_BLUE"]).toBe(2);
  });

  it("has 4 railroads and 2 utilities", () => {
    const railroads = SQUARES.filter((s) => s.type === "RAILROAD");
    expect(railroads).toHaveLength(4);
    railroads.forEach((rr) => expect(rr.price).toBe(200));

    const utilities = SQUARES.filter((s) => s.type === "UTILITY");
    expect(utilities).toHaveLength(2);
    utilities.forEach((u) => expect(u.price).toBe(150));
  });

  it("has 3 chance and 3 community chest squares", () => {
    const chance = SQUARES.filter((s) => s.type === "CHANCE");
    expect(chance).toHaveLength(3);
    expect(chance.map((s) => s.index)).toEqual([7, 22, 36]);

    const community = SQUARES.filter((s) => s.type === "COMMUNITY_CHEST");
    expect(community).toHaveLength(3);
    expect(community.map((s) => s.index)).toEqual([2, 17, 33]);
  });

  it("has valid card decks", () => {
    expect(CHANCE_CARDS.length).toBeGreaterThanOrEqual(16);
    expect(COMMUNITY_CHEST_CARDS.length).toBeGreaterThanOrEqual(16);
  });

  it("has 7 unique bot profiles and 8 player tokens", () => {
    expect(BOT_PROFILES).toHaveLength(7);
    expect(PLAYER_TOKENS).toHaveLength(8);
  });
});
