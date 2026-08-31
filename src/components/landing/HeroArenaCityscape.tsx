import React from "react";

/**
 * Hand-drawn Panoramic Cartoon Artwork for Hero Section:
 * The Autonomous AI Monopoly Arena Cityscape featuring:
 * - Banana Tower Skyscraper & Boardwalk Luxury Hotel
 * - Pizza Palace & Train Station
 * - Dapper AI Tycoon Robots & Players in Top Hats
 * - Giant 3D Tumbling Dice & Flying Winged Cash
 * - Gold Coin Vaults & Piles on rolling green hills
 */
export const HeroArenaCityscape: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    viewBox="0 0 900 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-auto select-none ${className}`}
  >
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c9daf8" />
        <stop offset="100%" stopColor="#dce8fc" />
      </linearGradient>
      <linearGradient id="bananaGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffe600" />
        <stop offset="100%" stopColor="#ffc905" />
      </linearGradient>
      <linearGradient id="hotelGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#eb1c24" />
      </linearGradient>
    </defs>

    {/* Canvas Background */}
    <rect width="900" height="420" fill="url(#skyGrad)" />

    {/* Distant Puffy Clouds */}
    <g fill="#FFFFFF" opacity="0.85">
      <path d="M120 70 Q140 45 170 55 Q200 45 220 70 Q240 75 230 95 L110 95 Q100 80 120 70 Z" />
      <path d="M680 50 Q700 30 730 40 Q760 30 780 50 Q800 55 790 75 L670 75 Q660 60 680 50 Z" />
    </g>

    {/* Rolling Grassy Hills */}
    <path
      d="M-50 420 L-50 250 Q200 160 450 240 T950 210 L950 420 Z"
      fill="#a5cd39"
      stroke="#000000"
      strokeWidth="3"
    />
    <path
      d="M-50 420 L-50 290 Q250 210 520 290 T950 260 L950 420 Z"
      fill="#8fb82b"
      stroke="#000000"
      strokeWidth="3"
    />
    <path
      d="M-50 420 L-50 330 Q280 260 600 330 T950 310 L950 420 Z"
      fill="#7ba322"
      stroke="#000000"
      strokeWidth="3"
    />

    {/* =========================================================================
        BUILDINGS & MONOPOLY CITYSCAPE
       ========================================================================= */}

    {/* 1. Boardwalk Luxury Hotel (Red & White) */}
    <g transform="translate(140, 120)">
      {/* Main Tower */}
      <rect
        x="0"
        y="40"
        width="110"
        height="160"
        rx="4"
        fill="url(#hotelGrad)"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Mansard Roof */}
      <polygon
        points="0,40 15,10 95,10 110,40"
        fill="#b91c1c"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Hotel Flag */}
      <line x1="55" y1="10" x2="55" y2="-12" stroke="#000000" strokeWidth="2.5" />
      <polygon points="55,-12 85,-4 55,4" fill="#ffc905" stroke="#000000" strokeWidth="2" />

      {/* Windows Grid */}
      <g fill="#fef08a" stroke="#000000" strokeWidth="1.5">
        {[20, 50, 80].map((x, i) => (
          <React.Fragment key={i}>
            <rect x={x} y="55" width="16" height="20" rx="2" />
            <rect x={x} y="85" width="16" height="20" rx="2" />
            <rect x={x} y="115" width="16" height="20" rx="2" />
            <rect x={x} y="145" width="16" height="20" rx="2" />
          </React.Fragment>
        ))}
      </g>
      {/* Grand Hotel Awning */}
      <path
        d="M-8 180 L118 180 L110 195 L-2 195 Z"
        fill="#ffc905"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <text
        x="55"
        y="192"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill="#000000"
      >
        BOARDWALK
      </text>
    </g>

    {/* 2. The Banana Tower Skyscraper */}
    <g transform="translate(280, 70)">
      {/* Skyscraper Body */}
      <polygon
        points="20,50 80,50 90,240 10,240"
        fill="url(#bananaGrad)"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Banana Spire */}
      <path
        d="M50 50 C45 30, 40 15, 65 0 C60 20, 55 35, 50 50 Z"
        fill="#ffe600"
        stroke="#000000"
        strokeWidth="2.5"
      />
      {/* Floor Lines & Windows */}
      <line x1="22" y1="90" x2="78" y2="90" stroke="#000000" strokeWidth="2" />
      <line x1="18" y1="130" x2="82" y2="130" stroke="#000000" strokeWidth="2" />
      <line x1="15" y1="170" x2="85" y2="170" stroke="#000000" strokeWidth="2" />
      <line x1="12" y1="210" x2="88" y2="210" stroke="#000000" strokeWidth="2" />

      <g fill="#008ed2" stroke="#000000" strokeWidth="1.2">
        <rect x="30" y="65" width="14" height="15" rx="1" />
        <rect x="56" y="65" width="14" height="15" rx="1" />
        <rect x="28" y="105" width="16" height="15" rx="1" />
        <rect x="56" y="105" width="16" height="15" rx="1" />
        <rect x="26" y="145" width="18" height="15" rx="1" />
        <rect x="56" y="145" width="18" height="15" rx="1" />
      </g>
      {/* Banana Logo Badge */}
      <ellipse cx="50" cy="190" rx="16" ry="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
      <text x="50" y="195" textAnchor="middle" fontSize="13">
        🍌
      </text>
    </g>

    {/* 3. Pizza Palace & Gas Station */}
    <g transform="translate(410, 150)">
      {/* Shop Front */}
      <rect
        x="0"
        y="30"
        width="100"
        height="120"
        rx="3"
        fill="#6ccef5"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Striped Red/White Awning */}
      <path
        d="M-5 30 L105 30 L95 50 L5 50 Z"
        fill="#eb1c24"
        stroke="#000000"
        strokeWidth="2"
      />
      {/* Big Shop Window */}
      <rect x="15" y="60" width="70" height="45" rx="2" fill="#ffffff" stroke="#000000" strokeWidth="2" />
      <text x="50" y="88" textAnchor="middle" fontSize="16">
        🍕
      </text>
      <text
        x="50"
        y="125"
        textAnchor="middle"
        fontSize="8"
        fontWeight="900"
        fill="#000000"
      >
        PIZZA TAX: $200
      </text>
    </g>

    {/* 4. Electric Utility Station & Bank Vault */}
    <g transform="translate(540, 130)">
      <polygon
        points="10,40 70,40 75,170 5,170"
        fill="#e2e8f0"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Glass Dome */}
      <ellipse cx="40" cy="40" rx="25" ry="15" fill="#fef08a" stroke="#000000" strokeWidth="2.5" />
      <text x="40" y="44" textAnchor="middle" fontSize="14">
        ⚡
      </text>
      {/* Bank Safe Door */}
      <circle cx="40" cy="105" r="22" fill="#94a3b8" stroke="#000000" strokeWidth="2.5" />
      <circle cx="40" cy="105" r="16" fill="#cbd5e1" stroke="#000000" strokeWidth="1.5" />
      <circle cx="40" cy="105" r="5" fill="#ffc905" stroke="#000000" strokeWidth="1.5" />
    </g>

    {/* Trees on Left & Right */}
    <g transform="translate(50, 140)">
      {/* Tree Trunk */}
      <path d="M40 120 C40 80, 50 70, 55 50 C60 70, 70 80, 70 120 Z" fill="#8d5b2c" stroke="#000" strokeWidth="2.5" />
      <circle cx="30" cy="45" r="30" fill="#48bb78" stroke="#000" strokeWidth="2.5" />
      <circle cx="65" cy="25" r="35" fill="#38a169" stroke="#000" strokeWidth="2.5" />
      <circle cx="85" cy="50" r="25" fill="#2f855a" stroke="#000" strokeWidth="2.5" />
    </g>
    <g transform="translate(680, 120)">
      <path d="M40 140 C40 100, 50 80, 55 60 C60 80, 70 100, 70 140 Z" fill="#8d5b2c" stroke="#000" strokeWidth="2.5" />
      <circle cx="30" cy="55" r="35" fill="#48bb78" stroke="#000" strokeWidth="2.5" />
      <circle cx="70" cy="35" r="40" fill="#38a169" stroke="#000" strokeWidth="2.5" />
      <circle cx="95" cy="65" r="30" fill="#2f855a" stroke="#000" strokeWidth="2.5" />
    </g>

    {/* =========================================================================
        CHARACTERS, AI AGENTS & COIN VAULTS
       ========================================================================= */}

    {/* LEFT CHARACTER: Dapper AI Robot Tycoon in Tuxedo & Monocle */}
    <g transform="translate(90, 220)">
      {/* Body & Pinstripe Suit */}
      <path
        d="M45 70 C30 80, 15 105, 10 140 L80 140 C75 105, 60 80, 45 70 Z"
        fill="#1a202c"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* White Shirt Collar & Gold Bowtie */}
      <polygon points="45,70 36,88 54,88" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
      <circle cx="45" cy="85" r="3" fill="#ffc905" stroke="#000" strokeWidth="1" />

      {/* Metal Robot Head */}
      <rect x="25" y="32" width="40" height="34" rx="6" fill="#cbd5e1" stroke="#000000" strokeWidth="2.5" />
      {/* Monocle on Robot Eye */}
      <circle cx="37" cy="46" r="6" fill="#ffc905" stroke="#000000" strokeWidth="1.8" />
      <circle cx="53" cy="46" r="4" fill="#008ed2" stroke="#000000" strokeWidth="1.5" />
      {/* Robot Antenna */}
      <line x1="45" y1="32" x2="45" y2="18" stroke="#000000" strokeWidth="2" />
      <circle cx="45" cy="16" r="3.5" fill="#eb1c24" stroke="#000000" strokeWidth="1.5" />

      {/* Top Hat */}
      <ellipse cx="45" cy="30" rx="22" ry="5" fill="#1a202c" stroke="#000" strokeWidth="2.5" />
      <path d="M30 30 L32 6 L58 6 L60 30 Z" fill="#1a202c" stroke="#000" strokeWidth="2.5" />
      <rect x="31" y="22" width="28" height="4" fill="#eb1c24" />

      {/* Bulging Green Moneybag */}
      <g transform="translate(-18, 70)">
        <path
          d="M20 20 C10 30, 5 50, 20 65 C35 75, 55 70, 60 55 C65 40, 50 25, 40 20 Z"
          fill="#38a169"
          stroke="#000"
          strokeWidth="2.5"
        />
        <circle cx="36" cy="44" r="10" fill="#ffc905" stroke="#000" strokeWidth="1.5" />
        <text x="36" y="49" textAnchor="middle" fontSize="13" fontWeight="900">
          $
        </text>
      </g>
    </g>

    {/* CENTER: Massive Pile of Gold Coins */}
    <g transform="translate(360, 290)">
      <ellipse cx="90" cy="80" rx="80" ry="24" fill="#d97706" stroke="#000000" strokeWidth="2.5" />
      <ellipse cx="90" cy="74" rx="75" ry="20" fill="#f59e0b" stroke="#000000" strokeWidth="2" />
      <ellipse cx="90" cy="66" rx="60" ry="16" fill="#fbbf24" stroke="#000000" strokeWidth="2" />
      <ellipse cx="90" cy="56" rx="45" ry="12" fill="#fde047" stroke="#000000" strokeWidth="2" />
      <ellipse cx="90" cy="48" rx="30" ry="8" fill="#fef08a" stroke="#000000" strokeWidth="1.5" />
      {/* Sparkles */}
      <polygon points="40,30 42,24 44,30 50,32 44,34 42,40 40,34 34,32" fill="#ffc905" stroke="#000" strokeWidth="0.8" />
      <polygon points="140,40 142,34 144,40 150,42 144,44 142,50 140,44 134,42" fill="#ffc905" stroke="#000" strokeWidth="0.8" />
    </g>

    {/* RIGHT CHARACTER: Excited AI Tycoon in Blue Suit Celebrating Victory */}
    <g transform="translate(680, 210)">
      {/* Pile of Coins Under Feet */}
      <ellipse cx="45" cy="150" rx="40" ry="12" fill="#ffc905" stroke="#000" strokeWidth="2" />

      {/* Body in Blue Tuxedo */}
      <path
        d="M45 70 C30 80, 25 105, 30 135 L60 135 C65 105, 60 80, 45 70 Z"
        fill="#008ed2"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Arms Raised High in Victory */}
      <path d="M35 75 C20 60, 5 40, 0 20" stroke="#fbd38d" strokeWidth="8" strokeLinecap="round" />
      <circle cx="0" cy="20" r="5" fill="#fbd38d" stroke="#000" strokeWidth="1.5" />

      <path d="M55 75 C70 60, 85 40, 90 20" stroke="#fbd38d" strokeWidth="8" strokeLinecap="round" />
      <circle cx="90" cy="20" r="5" fill="#fbd38d" stroke="#000" strokeWidth="1.5" />

      {/* Head */}
      <circle cx="45" cy="45" r="18" fill="#fbd38d" stroke="#000000" strokeWidth="2.5" />
      {/* Happy Eyes & Smile */}
      <circle cx="40" cy="42" r="2.5" fill="#000000" />
      <circle cx="50" cy="42" r="2.5" fill="#000000" />
      <path d="M37 48 Q45 60 53 48 Z" fill="#eb1c24" stroke="#000000" strokeWidth="1.5" />

      {/* Gold Crown */}
      <polygon
        points="32,30 36,18 41,24 45,14 49,24 54,18 58,30"
        fill="#ffc905"
        stroke="#000000"
        strokeWidth="2"
      />
    </g>

    {/* =========================================================================
        FLOATING 3D DICE & WINGED CASH IN THE SKY
       ========================================================================= */}

    {/* Floating 3D Dice 1 */}
    <g transform="translate(100, 30) rotate(-15)">
      <polygon points="30,5 55,18 30,30 5,18" fill="#FFFFFF" stroke="#000" strokeWidth="2.5" />
      <polygon points="5,18 30,30 30,58 5,45" fill="#E2E8F0" stroke="#000" strokeWidth="2.5" />
      <polygon points="30,30 55,18 55,45 30,58" fill="#CBD5E1" stroke="#000" strokeWidth="2.5" />
      <circle cx="30" cy="18" r="2.5" fill="#000" />
      <circle cx="18" cy="38" r="2.5" fill="#000" />
      <circle cx="42" cy="44" r="2.5" fill="#000" />
    </g>

    {/* Floating 3D Dice 2 */}
    <g transform="translate(760, 40) rotate(18)">
      <polygon points="25,5 45,15 25,25 5,15" fill="#FFFFFF" stroke="#000" strokeWidth="2.5" />
      <polygon points="5,15 25,25 25,48 5,38" fill="#E2E8F0" stroke="#000" strokeWidth="2.5" />
      <polygon points="25,25 45,15 45,38 25,48" fill="#CBD5E1" stroke="#000" strokeWidth="2.5" />
      <circle cx="25" cy="15" r="2" fill="#000" />
      <circle cx="15" cy="32" r="2" fill="#000" />
      <circle cx="35" cy="38" r="2" fill="#000" />
    </g>

    {/* Flying Cash with Wings Left */}
    <g transform="translate(20, 90) rotate(10)">
      <rect x="15" y="10" width="34" height="18" rx="2" fill="#a5cd39" stroke="#000" strokeWidth="2" />
      <circle cx="32" cy="19" r="4" fill="#8fb82b" stroke="#000" strokeWidth="1" />
      {/* Wings */}
      <path d="M15 14 C5 8, 0 16, 8 20 C2 24, 8 28, 15 22 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M49 14 C59 8, 64 16, 56 20 C62 24, 56 28, 49 22 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
    </g>

    {/* Flying Cash with Wings Right */}
    <g transform="translate(620, 70) rotate(-12)">
      <rect x="15" y="10" width="34" height="18" rx="2" fill="#a5cd39" stroke="#000" strokeWidth="2" />
      <circle cx="32" cy="19" r="4" fill="#8fb82b" stroke="#000" strokeWidth="1" />
      <path d="M15 14 C5 8, 0 16, 8 20 C2 24, 8 28, 15 22 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M49 14 C59 8, 64 16, 56 20 C62 24, 56 28, 49 22 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
    </g>
  </svg>
);
