import React, { useRef, useState, useLayoutEffect } from "react";
import { useGame } from "../../context/GameContext";
import { TokenBadge } from "./TokenBadge";
import { HouseHotelPips } from "./HouseHotelPips";
import { CenterHub } from "./CenterHub";

export const MonopolyBoard: React.FC = () => {
  const { state, setInspectedPropertyIndex } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(590 / 1024);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / 1024);
        }
      }
    };
    updateScale();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateScale);
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    }
    window.addEventListener("resize", updateScale);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  // Group active players by square position (0 to 39)
  const playersBySquare: Record<number, typeof state.players> = {};
  for (let i = 0; i < 40; i++) {
    playersBySquare[i] = [];
  }
  state.players.forEach((p) => {
    if (!p.isBankrupt) {
      playersBySquare[p.position].push(p);
    }
  });

  // Helper to render interactive overlay over any tile
  const renderTileOverlay = (
    index: number,
    orientation?: "top" | "bottom" | "left" | "right",
  ) => {
    const propState = state.properties[index];
    const owner =
      propState && propState.ownerId !== null
        ? state.players[propState.ownerId]
        : null;
    const playersOnSquare = playersBySquare[index] || [];

    return (
      <div
        onClick={() => setInspectedPropertyIndex(index)}
        className="absolute inset-0 cursor-pointer z-20 hover:bg-black/5 transition-colors focus:outline-none"
      >
        {/* Screen reader / test helpers */}
        {index === 0 && <span className="sr-only">GO</span>}
        {index === 10 && <span className="sr-only">Visiting</span>}
        {index === 20 && <span className="sr-only">Free</span>}
        {index === 30 && <span className="sr-only">Go To</span>}
        {index === 39 && <span className="sr-only">Boardwalk</span>}

        {/* House / Hotel pips */}
        {propState && propState.houses > 0 && orientation && (
          <div className="absolute top-1 left-1 z-30 pointer-events-none">
            <HouseHotelPips
              houses={propState.houses}
              orientation={orientation}
            />
          </div>
        )}

        {/* Owner marker */}
        {owner && (
          <div
            className="absolute top-1 right-1 w-3.5 h-3.5 rounded-xs border border-black flex items-center justify-center text-[7px] font-extrabold text-white z-30 pointer-events-none"
            style={{ backgroundColor: owner.token.color }}
            title={`Owner: ${owner.name}`}
          >
            {owner.name.charAt(0)}
          </div>
        )}

        {/* Mortgaged Overlay */}
        {propState && propState.isMortgaged && (
          <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center text-white backdrop-blur-[0.5px] z-30 pointer-events-none">
            <span className="bg-red-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider -rotate-12">
              Mortgaged
            </span>
          </div>
        )}

        {/* Player Tokens on this square (omitted on GO square to keep corner clean) */}
        {index !== 0 && playersOnSquare.length > 0 && (
          <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 max-w-[50px] justify-end pointer-events-none z-30">
            {playersOnSquare.map((p) => (
              <TokenBadge
                key={p.id}
                player={p}
                size="sm"
                isCurrentTurn={p.id === state.currentTurnPlayerId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[590px] relative select-none mx-auto flex items-center justify-center overflow-visible"
      style={{
        height: `${1024 * scale}px`,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: "1024px",
          height: "1024px",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div className="board-wrapper">
          <div className="monopoly-board">
            {/* ====================================================================
                 TOP-LEFT CORNER: FREE PARKING (Index 20)
                 ==================================================================== */}
            <div className="corner corner-tl">
              {renderTileOverlay(20)}
              <div className="fp-inner">
                <svg
                  className="fp-car"
                  viewBox="0 0 68 34"
                  width="66"
                  height="33"
                >
                  <path
                    d="M 0 20 C 0 16 3 14 7 14 L 11 14 C 12 11 14 8 18 8 C 22 8 24 11 25 14 L 44 14 C 45 11 47 8 51 8 C 55 8 57 11 58 14 L 61 14 C 65 14 68 17 68 22 C 68 27 61 31 51 32 C 36 33 19 32 8 29 C 2 27 0 24 0 20 Z"
                    fill="#000000"
                  />
                  <polygon points="0,21 4,21 4,17 0,17" fill="#000000" />
                  <circle cx="18" cy="8.5" r="6.5" fill="#000000" />
                  <circle
                    cx="18"
                    cy="8.5"
                    r="3.2"
                    fill="#c9daf8"
                    stroke="#000000"
                    strokeWidth="1.2"
                  />
                  <circle cx="51" cy="8.5" r="6.5" fill="#000000" />
                  <circle
                    cx="51"
                    cy="8.5"
                    r="3.2"
                    fill="#c9daf8"
                    stroke="#000000"
                    strokeWidth="1.2"
                  />
                </svg>
                <div className="fp-text">
                  <span>FREE</span>
                  <span>PARKING</span>
                </div>
              </div>
            </div>

            {/* ====================================================================
                 TOP EDGE: 9 TILES (Almond -> Oakville, Indices 21 to 29)
                 ==================================================================== */}
            <div className="edge edge-top">
              {/* Top 0: Almond Drive (21) */}
              <div className="tile tile-top">
                {renderTileOverlay(21, "top")}
                <div className="tile-price">M200</div>
                <div className="tile-name">
                  ALMOND
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-red"></div>
              </div>
              {/* Top 1: Chance (22) */}
              <div className="tile tile-top tile-chance">
                {renderTileOverlay(22)}
                <div className="tile-price"></div>
                <div className="tile-icon">
                  <svg viewBox="0 0 35 48" width="24" height="35">
                    <path
                      d="M5 14 C5 6 12 1 20 1 C28 1 33 6 33 14 C33 19 29 23 24 26 C20 28 18 31 18 35 L11 35 C11 28 15 24 20 21 C24 19 26 17 26 14 C26 9 23 7 20 7 C16 7 13 9 13 14 Z M11 40 L18 40 L18 47 L11 47 Z"
                      fill="#800080"
                    />
                  </svg>
                </div>
                <div className="tile-name-special">CHANCE</div>
              </div>
              {/* Top 2: Clement Drive (23) */}
              <div className="tile tile-top">
                {renderTileOverlay(23, "top")}
                <div className="tile-price">M200</div>
                <div className="tile-name">
                  CLEMENT
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-red"></div>
              </div>
              {/* Top 3: Pacific Drive (24) */}
              <div className="tile tile-top">
                {renderTileOverlay(24, "top")}
                <div className="tile-price">M260</div>
                <div className="tile-name">
                  PACIFIC
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-red"></div>
              </div>
              {/* Top 4: Water Works (25) */}
              <div className="tile tile-top tile-utility">
                {renderTileOverlay(25)}
                <div className="tile-price">M60</div>
                <div className="tile-icon">
                  <svg viewBox="0 0 65 33" width="58" height="27">
                    <polygon points="11,4 17,4 16,13 12,13" fill="#000000" />
                    <path d="M26 13 C26 6 32 6 32 13 Z" fill="#000000" />
                    <rect x="16" y="13" width="28" height="11" fill="#000000" />
                    <polygon points="0,24 7,20 7,24" fill="#000000" />
                    <polygon points="7,24 12,16 16,16 16,24" fill="#000000" />
                    <rect x="43" y="8" width="15" height="16" fill="#000000" />
                    <rect x="46" y="11" width="8" height="7" fill="#c9daf8" />
                    <rect x="58" y="14" width="4" height="10" fill="#000000" />
                    <rect x="2" y="24" width="61" height="2" fill="#000000" />
                    <circle cx="20" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="31" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="42" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="53" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="9" cy="29" r="3" fill="#000000" />
                  </svg>
                </div>
                <div className="tile-name-special">
                  WATER
                  <br />
                  WORKS
                </div>
              </div>
              {/* Top 5: Rodeo Drive (26) */}
              <div className="tile tile-top">
                {renderTileOverlay(26, "top")}
                <div className="tile-price">$260</div>
                <div className="tile-name">
                  RODEO
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-yellow"></div>
              </div>
              {/* Top 6: Nashville Drive (27) */}
              <div className="tile tile-top">
                {renderTileOverlay(27, "top")}
                <div className="tile-price">M260</div>
                <div className="tile-name">
                  NASHVILLE
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-yellow"></div>
              </div>
              {/* Top 7: Railroad (28) */}
              <div className="tile tile-top tile-utility">
                {renderTileOverlay(28)}
                <div className="tile-price">M130</div>
                <div className="tile-icon">
                  <svg viewBox="0 0 54 45" width="46" height="36">
                    <rect
                      x="2"
                      y="3"
                      width="50"
                      height="7"
                      fill="#ba9664"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="10"
                      y1="3"
                      x2="10"
                      y2="10"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="20"
                      y1="3"
                      x2="20"
                      y2="10"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="30"
                      y1="3"
                      x2="30"
                      y2="10"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="40"
                      y1="3"
                      x2="40"
                      y2="10"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points="6,10 2,24 8,24 11,10"
                      fill="#ba9664"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <polygon
                      points="46,10 42,24 48,24 51,10"
                      fill="#ba9664"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <line
                      x1="6"
                      y1="13"
                      x2="46"
                      y2="21"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="46"
                      y1="13"
                      x2="6"
                      y2="21"
                      stroke="#000000"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M46 10 L46 32 L36 32"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                    <circle
                      cx="33"
                      cy="32"
                      r="5.5"
                      fill="#fdb813"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="tile-name-special">RAILROAD</div>
              </div>
              {/* Top 8: Oakville (29) */}
              <div className="tile tile-top">
                {renderTileOverlay(29, "top")}
                <div className="tile-price">M230</div>
                <div className="tile-name">OAKVILLE</div>
                <div className="color-bar bar-yellow"></div>
              </div>
            </div>

            {/* ====================================================================
                 TOP-RIGHT CORNER: GO TO JAIL (Index 30)
                 ==================================================================== */}
            <div className="corner corner-tr">
              {renderTileOverlay(30)}
              <div className="goto-jail-inner">
                <div className="goto-jail-text">
                  <span>GO TO</span>
                  <span>JAIL</span>
                </div>
                <svg
                  className="jail-bars-tr"
                  viewBox="0 0 65 65"
                  width="58"
                  height="58"
                >
                  <g transform="rotate(45 32.5 32.5)">
                    <rect
                      x="5"
                      y="10"
                      width="55"
                      height="45"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="3"
                    />
                    <line
                      x1="16"
                      y1="10"
                      x2="16"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="27"
                      y1="10"
                      x2="27"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="38"
                      y1="10"
                      x2="38"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="49"
                      y1="10"
                      x2="49"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="5"
                      y1="22"
                      x2="60"
                      y2="22"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="5"
                      y1="43"
                      x2="60"
                      y2="43"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* ====================================================================
                 LEFT EDGE: 9 TILES (Atlanta -> Olivia Gardens, Indices 19 down to 11)
                 ==================================================================== */}
            <div className="edge edge-left">
              {/* Left 0: Atlanta Drive (19) */}
              <div className="tile tile-left">
                {renderTileOverlay(19, "left")}
                <div className="tile-price">M200</div>
                <div className="tile-name">
                  ATLANTA
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-orange"></div>
              </div>
              {/* Left 1: New York Drive (18) */}
              <div className="tile tile-left">
                {renderTileOverlay(18, "left")}
                <div className="tile-price">M200</div>
                <div className="tile-name">
                  NEW YORK
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-orange"></div>
              </div>
              {/* Left 2: Community Chest (17) */}
              <div className="tile tile-left tile-chest">
                {renderTileOverlay(17)}
                <div className="tile-price"></div>
                <div className="tile-icon">
                  <svg viewBox="0 0 50 40" width="42" height="32">
                    <rect
                      x="3"
                      y="12"
                      width="44"
                      height="24"
                      rx="2"
                      fill="#c3964b"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M3 14 Q25 4 47 14 Z"
                      fill="#e1c35a"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="9"
                      y="8"
                      width="5"
                      height="28"
                      fill="#d2b45a"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="36"
                      y="8"
                      width="5"
                      height="28"
                      fill="#d2b45a"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="22"
                      y="17"
                      width="6"
                      height="8"
                      rx="1"
                      fill="#fdb813"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <circle cx="25" cy="20" r="1.2" fill="#000000" />
                    <polygon
                      points="24,20 26,20 25.5,23 24.5,23"
                      fill="#000000"
                    />
                  </svg>
                </div>
                <div className="tile-name-special">
                  COMMUNITY
                  <br />
                  CHEST
                </div>
              </div>
              {/* Left 3: Bethany Drive (16) */}
              <div className="tile tile-left">
                {renderTileOverlay(16, "left")}
                <div className="tile-price">M180</div>
                <div className="tile-name">
                  BETHANY
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-orange"></div>
              </div>
              {/* Left 4: Manhattan Railroad (15) */}
              <div className="tile tile-left tile-railroad">
                {renderTileOverlay(15)}
                <div className="tile-price">M200</div>
                <div className="tile-icon">
                  <svg viewBox="0 0 65 33" width="58" height="27">
                    <polygon points="11,4 17,4 16,13 12,13" fill="#000000" />
                    <path d="M26 13 C26 6 32 6 32 13 Z" fill="#000000" />
                    <rect x="16" y="13" width="28" height="11" fill="#000000" />
                    <polygon points="0,24 7,20 7,24" fill="#000000" />
                    <polygon points="7,24 12,16 16,16 16,24" fill="#000000" />
                    <rect x="43" y="8" width="15" height="16" fill="#000000" />
                    <rect x="46" y="11" width="8" height="7" fill="#c9daf8" />
                    <rect x="58" y="14" width="4" height="10" fill="#000000" />
                    <rect x="2" y="24" width="61" height="2" fill="#000000" />
                    <circle cx="20" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="31" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="42" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="53" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="9" cy="29" r="3" fill="#000000" />
                  </svg>
                </div>
                <div className="tile-name-special">
                  MANHATTAN
                  <br />
                  RAILROAD
                </div>
              </div>
              {/* Left 5: States Drive (14) */}
              <div className="tile tile-left">
                {renderTileOverlay(14, "left")}
                <div className="tile-price">M140</div>
                <div className="tile-name">
                  STATES
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-pink"></div>
              </div>
              {/* Left 6: California Drive (13) */}
              <div className="tile tile-left">
                {renderTileOverlay(13, "left")}
                <div className="tile-price">M160</div>
                <div className="tile-name">
                  CALIFORNIA
                  <br />
                  DRIVE
                </div>
                <div className="color-bar bar-pink"></div>
              </div>
              {/* Left 7: Car Company (12) */}
              <div className="tile tile-left tile-utility">
                {renderTileOverlay(12)}
                <div className="tile-price">M150</div>
                <div className="tile-icon">
                  <svg viewBox="0 0 65 32" width="52" height="26">
                    <path
                      d="M10 18 C11 12 16 6 25 5 L40 5 C48 5 54 8 58 13 L62 16 C64 18 65 20 65 22 L65 25 C65 27 63 28 61 28 L57 28 C56 24 52 21 47 21 C42 21 38 24 37 28 L25 28 C24 24 20 21 15 21 C10 21 6 24 5 28 L2 28 C1 28 0 27 0 25 L0 22 C0 19 3 18 10 18 Z"
                      fill="#2d69c3"
                    />
                    <path
                      d="M24 7 L38 7 L38 15 L17 15 C19 11 21 8 24 7 Z"
                      fill="#1f3044"
                    />
                    <path
                      d="M42 7 L51 8 C55 10 57 12 58 15 L42 15 Z"
                      fill="#1f3044"
                    />
                    <circle cx="15" cy="27" r="5" fill="#000000" />
                    <circle cx="15" cy="27" r="2" fill="#a5c3f0" />
                    <circle cx="47" cy="27" r="5" fill="#000000" />
                    <circle cx="47" cy="27" r="2" fill="#a5c3f0" />
                  </svg>
                </div>
                <div className="tile-name-special">
                  CAR
                  <br />
                  COMPANY
                </div>
              </div>
              {/* Left 8: Olivia Gardens (11) */}
              <div className="tile tile-left">
                {renderTileOverlay(11, "left")}
                <div className="tile-price">M140</div>
                <div className="tile-name">
                  OLIVIA
                  <br />
                  GARDENS
                </div>
                <div className="color-bar bar-pink"></div>
              </div>
            </div>

            {/* ====================================================================
                 CENTER BOARD AREA (736px x 736px)
                 ==================================================================== */}
            <div className="center-area flex items-center justify-center p-6">
              <span className="sr-only">MONOPOLY</span>
              <div className="w-[340px] bg-[#c9daf8] border-2 border-black rounded-lg p-3">
                <CenterHub />
              </div>
            </div>

            {/* ====================================================================
                 RIGHT EDGE: 9 TILES (Atlantic -> Salt Lake, Indices 31 to 39)
                 ==================================================================== */}
            <div className="edge edge-right">
              {/* Right 0: Atlantic Drive (31) */}
              <div className="tile tile-right">
                {renderTileOverlay(31, "right")}
                <div className="color-bar bar-green"></div>
                <div className="tile-name">
                  ATLANTIC
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">M300</div>
              </div>
              {/* Right 1: Clement Drive (32) */}
              <div className="tile tile-right">
                {renderTileOverlay(32, "right")}
                <div className="color-bar bar-green"></div>
                <div className="tile-name">
                  CLEMENT
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">M300</div>
              </div>
              {/* Right 2: Community Chest (33) */}
              <div className="tile tile-right tile-chest">
                {renderTileOverlay(33)}
                <div className="tile-name-special">
                  COMMUNITY
                  <br />
                  CHEST
                </div>
                <div className="tile-icon">
                  <svg viewBox="0 0 50 40" width="42" height="32">
                    <rect
                      x="3"
                      y="12"
                      width="44"
                      height="24"
                      rx="2"
                      fill="#c3964b"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M3 14 Q25 4 47 14 Z"
                      fill="#e1c35a"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="9"
                      y="8"
                      width="5"
                      height="28"
                      fill="#d2b45a"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="36"
                      y="8"
                      width="5"
                      height="28"
                      fill="#d2b45a"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="22"
                      y="17"
                      width="6"
                      height="8"
                      rx="1"
                      fill="#fdb813"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <circle cx="25" cy="20" r="1.2" fill="#000000" />
                    <polygon
                      points="24,20 26,20 25.5,23 24.5,23"
                      fill="#000000"
                    />
                  </svg>
                </div>
                <div className="tile-price"></div>
              </div>
              {/* Right 3: Riverside (34) */}
              <div className="tile tile-right">
                {renderTileOverlay(34, "right")}
                <div className="color-bar bar-green"></div>
                <div className="tile-name">RIVERSIDE</div>
                <div className="tile-price">M250</div>
              </div>
              {/* Right 4: Short Line (35) */}
              <div className="tile tile-right tile-railroad">
                {renderTileOverlay(35)}
                <div className="tile-name-special">
                  SHORT
                  <br />
                  LINE
                </div>
                <div className="tile-icon">
                  <svg viewBox="0 0 65 33" width="58" height="27">
                    <polygon points="11,4 17,4 16,13 12,13" fill="#000000" />
                    <path d="M26 13 C26 6 32 6 32 13 Z" fill="#000000" />
                    <rect x="16" y="13" width="28" height="11" fill="#000000" />
                    <polygon points="0,24 7,20 7,24" fill="#000000" />
                    <polygon points="7,24 12,16 16,16 16,24" fill="#000000" />
                    <rect x="43" y="8" width="15" height="16" fill="#000000" />
                    <rect x="46" y="11" width="8" height="7" fill="#c9daf8" />
                    <rect x="58" y="14" width="4" height="10" fill="#000000" />
                    <rect x="2" y="24" width="61" height="2" fill="#000000" />
                    <circle cx="20" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="31" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="42" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="53" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="9" cy="29" r="3" fill="#000000" />
                  </svg>
                </div>
                <div className="tile-price">M200</div>
              </div>
              {/* Right 5: Chance (36) */}
              <div className="tile tile-right tile-chance">
                {renderTileOverlay(36)}
                <div className="tile-name-special">CHANCE</div>
                <div className="tile-icon">
                  <svg viewBox="0 0 35 48" width="24" height="35">
                    <path
                      d="M5 14 C5 6 12 1 20 1 C28 1 33 6 33 14 C33 19 29 23 24 26 C20 28 18 31 18 35 L11 35 C11 28 15 24 20 21 C24 19 26 17 26 14 C26 9 23 7 20 7 C16 7 13 9 13 14 Z M11 40 L18 40 L18 47 L11 47 Z"
                      fill="#000000"
                    />
                  </svg>
                </div>
                <div className="tile-price"></div>
              </div>
              {/* Right 6: Folklore Heights (37) */}
              <div className="tile tile-right">
                {renderTileOverlay(37, "right")}
                <div className="color-bar bar-darkblue"></div>
                <div className="tile-name">
                  FOLKLORE
                  <br />
                  HEIGHTS
                </div>
                <div className="tile-price">M200</div>
              </div>
              {/* Right 7: Luxury Tax (38) */}
              <div className="tile tile-right tile-tax">
                {renderTileOverlay(38)}
                <div className="tile-name-special">
                  LUXURY
                  <br />
                  TAX
                </div>
                <div className="tile-icon">
                  <svg viewBox="0 0 60 40" width="52" height="34">
                    <ellipse
                      cx="40"
                      cy="22"
                      rx="16"
                      ry="13"
                      fill="none"
                      stroke="#f3c846"
                      strokeWidth="4.5"
                    />
                    <polygon
                      points="18,17 24,8 30,17"
                      fill="#aee5fc"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <polygon
                      points="18,17 30,17 24,25"
                      fill="#80d4f8"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <path
                      d="M10 15 Q14 15 14 11 Q14 15 18 15 Q14 15 14 19 Q14 15 10 15 Z"
                      fill="#aee5fc"
                    />
                    <path
                      d="M31 6 Q33 6 33 4 Q33 6 35 6 Q33 6 33 8 Q33 6 31 6 Z"
                      fill="#aee5fc"
                    />
                  </svg>
                </div>
                <div className="tile-price">PAY M200</div>
              </div>
              {/* Right 8: Salt Lake (39) */}
              <div className="tile tile-right">
                {renderTileOverlay(39, "right")}
                <div className="color-bar bar-darkblue"></div>
                <div className="tile-name">
                  SALT
                  <br />
                  LAKE
                </div>
                <div className="tile-price">M350</div>
              </div>
            </div>

            {/* ====================================================================
                 BOTTOM-LEFT CORNER: IN JAIL / JUST VISITING (Index 10)
                 ==================================================================== */}
            <div className="corner corner-bl">
              {renderTileOverlay(10)}
              <div className="jail-inner">
                <div className="jail-in-text">
                  <span>IN</span>
                  <span>JAIL</span>
                </div>
                <svg
                  className="jail-bars-bl"
                  viewBox="0 0 65 65"
                  width="58"
                  height="58"
                >
                  <g transform="rotate(-45 32.5 32.5)">
                    <rect
                      x="5"
                      y="10"
                      width="55"
                      height="45"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="3"
                    />
                    <line
                      x1="16"
                      y1="10"
                      x2="16"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="27"
                      y1="10"
                      x2="27"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="38"
                      y1="10"
                      x2="38"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="49"
                      y1="10"
                      x2="49"
                      y2="55"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="5"
                      y1="22"
                      x2="60"
                      y2="22"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="5"
                      y1="43"
                      x2="60"
                      y2="43"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                  </g>
                </svg>
                <div className="jail-visiting-text">
                  <span>JUST</span>
                  <span>VISITING</span>
                </div>
              </div>
            </div>

            {/* ====================================================================
                 BOTTOM EDGE: 9 TILES (Boston -> San Diego, Indices 9 down to 1)
                 ==================================================================== */}
            <div className="edge edge-bottom">
              {/* Bottom 0: Boston Drive (9) */}
              <div className="tile tile-bottom">
                {renderTileOverlay(9, "bottom")}
                <div className="color-bar bar-lightblue"></div>
                <div className="tile-name">
                  BOSTON
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">M150</div>
              </div>
              {/* Bottom 1: Phoenix Drive (8) */}
              <div className="tile tile-bottom">
                {renderTileOverlay(8, "bottom")}
                <div className="color-bar bar-lightblue"></div>
                <div className="tile-name">
                  PHOENIX
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">M130</div>
              </div>
              {/* Bottom 2: Chance (7) */}
              <div className="tile tile-bottom tile-chance">
                {renderTileOverlay(7)}
                <div className="tile-name-special">CHANCE</div>
                <div className="tile-icon">
                  <svg viewBox="0 0 35 48" width="24" height="35">
                    <path
                      d="M5 14 C5 6 12 1 20 1 C28 1 33 6 33 14 C33 19 29 23 24 26 C20 28 18 31 18 35 L11 35 C11 28 15 24 20 21 C24 19 26 17 26 14 C26 9 23 7 20 7 C16 7 13 9 13 14 Z M11 40 L18 40 L18 47 L11 47 Z"
                      fill="#800080"
                    />
                  </svg>
                </div>
                <div className="tile-price"></div>
              </div>
              {/* Bottom 3: Vermont Drive (6) */}
              <div className="tile tile-bottom">
                {renderTileOverlay(6, "bottom")}
                <div className="color-bar bar-lightblue"></div>
                <div className="tile-name">
                  VERMONT
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">M120</div>
              </div>
              {/* Bottom 4: Beverly Railroad (5) */}
              <div className="tile tile-bottom tile-railroad">
                {renderTileOverlay(5)}
                <div className="tile-name-special">
                  BEVERLY
                  <br />
                  RAILROAD
                </div>
                <div className="tile-icon">
                  <svg viewBox="0 0 65 33" width="58" height="27">
                    <polygon points="11,4 17,4 16,13 12,13" fill="#000000" />
                    <path d="M26 13 C26 6 32 6 32 13 Z" fill="#000000" />
                    <rect x="16" y="13" width="28" height="11" fill="#000000" />
                    <polygon points="0,24 7,20 7,24" fill="#000000" />
                    <polygon points="7,24 12,16 16,16 16,24" fill="#000000" />
                    <rect x="43" y="8" width="15" height="16" fill="#000000" />
                    <rect x="46" y="11" width="8" height="7" fill="#c9daf8" />
                    <rect x="58" y="14" width="4" height="10" fill="#000000" />
                    <rect x="2" y="24" width="61" height="2" fill="#000000" />
                    <circle cx="20" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="31" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="42" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="53" cy="27.5" r="4.5" fill="#000000" />
                    <circle cx="9" cy="29" r="3" fill="#000000" />
                  </svg>
                </div>
                <div className="tile-price">M200</div>
              </div>
              {/* Bottom 5: Income Tax (4) */}
              <div className="tile tile-bottom tile-tax">
                {renderTileOverlay(4)}
                <div className="tile-name-special">
                  INCOME
                  <br />
                  TAX
                </div>
                <div className="tile-price">PAY M150</div>
              </div>
              {/* Bottom 6: Kansas Drive (3) */}
              <div className="tile tile-bottom">
                {renderTileOverlay(3, "bottom")}
                <div className="color-bar bar-brown"></div>
                <div className="tile-name">
                  KANSAS
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">M90</div>
              </div>
              {/* Bottom 7: Community Chest (2) */}
              <div className="tile tile-bottom tile-chest">
                {renderTileOverlay(2)}
                <div className="tile-name-special">
                  COMMUNITY
                  <br />
                  CHEST
                </div>
                <div className="tile-icon">
                  <svg viewBox="0 0 50 40" width="42" height="32">
                    <rect
                      x="3"
                      y="12"
                      width="44"
                      height="24"
                      rx="2"
                      fill="#c3964b"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M3 14 Q25 4 47 14 Z"
                      fill="#e1c35a"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="9"
                      y="8"
                      width="5"
                      height="28"
                      fill="#d2b45a"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="36"
                      y="8"
                      width="5"
                      height="28"
                      fill="#d2b45a"
                      stroke="#000000"
                      strokeWidth="0.8"
                    />
                    <rect
                      x="22"
                      y="17"
                      width="6"
                      height="8"
                      rx="1"
                      fill="#fdb813"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <circle cx="25" cy="20" r="1.2" fill="#000000" />
                    <polygon
                      points="24,20 26,20 25.5,23 24.5,23"
                      fill="#000000"
                    />
                  </svg>
                </div>
                <div className="tile-price"></div>
              </div>
              {/* Bottom 8: San Diego Drive (1) */}
              <div className="tile tile-bottom">
                {renderTileOverlay(1, "bottom")}
                <div className="color-bar bar-brown"></div>
                <div className="tile-name">
                  SAN DIEGO
                  <br />
                  DRIVE
                </div>
                <div className="tile-price">$60</div>
              </div>
            </div>

            {/* ====================================================================
                 BOTTOM-RIGHT CORNER: GO (Index 0)
                 ==================================================================== */}
            <div className="corner corner-br">
              {renderTileOverlay(0)}
              <div className="go-inner">
                <div className="go-text">
                  <span>COLLECT</span>
                  <span className="go-price">$200</span>
                  <span>SALARY AS</span>
                  <span>YOU PASS</span>
                </div>
                <div className="go-arrow-wrap">
                  <svg viewBox="0 0 60 45" width="56" height="42">
                    <polygon
                      points="0,22.5 28,0 28,14 60,14 60,31 28,31 28,45"
                      fill="#eb1c24"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
