import { describe, it, expect } from "vitest";
import {
  calculateRent,
  doesPlayerOwnMonopoly,
  getOwnedCountInGroup,
} from "../engine/rentCalculator";
import { PropertyState } from "../types/game";

describe("Rent Calculator & Monopoly Rules", () => {
  const createMockProperties = (): Record<number, PropertyState> => {
    const props: Record<number, PropertyState> = {};
    for (let i = 0; i < 40; i++) {
      props[i] = { index: i, ownerId: null, houses: 0, isMortgaged: false };
    }
    return props;
  };

  it("calculates standard base rent for single unmonopolized street property", () => {
    const properties = createMockProperties();
    // Mediterranean Avenue (index 1) owned by Player 0, Baltic (3) unowned
    properties[1].ownerId = 0;
    const rent = calculateRent(1, 1, 7, properties); // landingPlayer = 1, owner = 0, dice = 7
    expect(rent).toBe(2);
  });

  it("doubles base rent when owner has complete unimproved monopoly", () => {
    const properties = createMockProperties();
    // Brown monopoly: 1 & 3 both owned by Player 0 with 0 houses
    properties[1].ownerId = 0;
    properties[3].ownerId = 0;

    expect(doesPlayerOwnMonopoly(0, "BROWN", properties)).toBe(true);
    const rentMed = calculateRent(1, 1, 7, properties);
    expect(rentMed).toBe(4); // 2 x 2 = 4

    const rentBaltic = calculateRent(3, 1, 7, properties);
    expect(rentBaltic).toBe(8); // 4 x 2 = 8
  });

  it("charges house and hotel rent according to deed tier", () => {
    const properties = createMockProperties();
    // Boardwalk (index 39) owned by Player 0, Park Place (37) owned by Player 0
    properties[37].ownerId = 0;
    properties[39].ownerId = 0;

    properties[39].houses = 1;
    expect(calculateRent(39, 1, 7, properties)).toBe(200);

    properties[39].houses = 3;
    expect(calculateRent(39, 1, 7, properties)).toBe(1400);

    properties[39].houses = 5; // Hotel
    expect(calculateRent(39, 1, 7, properties)).toBe(2000);
  });

  it("calculates railroad rent tiered by number of railroads owned", () => {
    const properties = createMockProperties();
    // Railroads: 5, 15, 25, 35
    properties[5].ownerId = 0;
    expect(getOwnedCountInGroup(0, 2, properties)).toBe(1);
    expect(calculateRent(5, 1, 7, properties)).toBe(25);

    properties[15].ownerId = 0;
    expect(getOwnedCountInGroup(0, 2, properties)).toBe(2);
    expect(calculateRent(5, 1, 7, properties)).toBe(50);
    expect(calculateRent(15, 1, 7, properties)).toBe(50);

    properties[25].ownerId = 0;
    expect(calculateRent(5, 1, 7, properties)).toBe(100);

    properties[35].ownerId = 0;
    expect(calculateRent(5, 1, 7, properties)).toBe(200);
  });

  it("calculates utility rent based on 4x or 10x dice multiplier", () => {
    const properties = createMockProperties();
    // Utilities: 12 (Electric Co), 28 (Water Works)
    properties[12].ownerId = 0;
    expect(calculateRent(12, 1, 8, properties)).toBe(32); // 8 x 4 = 32

    properties[28].ownerId = 0;
    expect(calculateRent(12, 1, 8, properties)).toBe(80); // 8 x 10 = 80
    expect(calculateRent(28, 1, 5, properties)).toBe(50); // 5 x 10 = 50
  });

  it("charges 0 rent if property is mortgaged", () => {
    const properties = createMockProperties();
    properties[39].ownerId = 0;
    properties[39].isMortgaged = true;
    expect(calculateRent(39, 1, 7, properties)).toBe(0);
  });

  it("charges 0 rent if landing on own property or unowned property", () => {
    const properties = createMockProperties();
    expect(calculateRent(39, 0, 7, properties)).toBe(0); // unowned

    properties[39].ownerId = 0;
    expect(calculateRent(39, 0, 7, properties)).toBe(0); // landing on own
  });
});
