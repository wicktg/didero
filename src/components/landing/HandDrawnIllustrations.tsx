import React from "react";

/**
 * Hand-drawn Flying Banknote with cartoon wings and wavy ink outlines.
 */
export const FlyingCash: React.FC<{
  className?: string;
  size?: number;
  rotation?: number;
}> = ({ className = "", size = 64, rotation = 0 }) => (
  <svg
    width={size}
    height={size * 0.65}
    viewBox="0 0 100 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block filter drop-shadow-[1px_2px_0px_rgba(0,0,0,0.8)] ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    {/* Left Wing */}
    <path
      d="M32 28 C20 18, 8 16, 2 24 C-2 30, 4 36, 12 35 C6 38, 8 44, 16 42 C12 45, 15 50, 24 46 C28 44, 30 38, 33 34 Z"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 27 C16 28, 24 33, 29 35"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 36 C20 37, 26 40, 30 41"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Right Wing */}
    <path
      d="M68 28 C80 18, 92 16, 98 24 C102 30, 96 36, 88 35 C94 38, 92 44, 84 42 C88 45, 85 50, 76 46 C72 44, 70 38, 67 34 Z"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M90 27 C84 28, 76 33, 71 35"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M86 36 C80 37, 74 40, 70 41"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Green Cash Bill */}
    <rect
      x="24"
      y="20"
      width="52"
      height="28"
      rx="3"
      fill="#a5cd39"
      stroke="#000000"
      strokeWidth="2.5"
    />
    {/* Inner decorative border */}
    <rect
      x="28"
      y="23"
      width="44"
      height="22"
      rx="2"
      fill="#b8dc52"
      stroke="#000000"
      strokeWidth="1.5"
      strokeDasharray="2 1"
    />
    {/* Center Circle & Dollar / FLOP Symbol */}
    <circle
      cx="50"
      cy="34"
      r="7"
      fill="#8fb82b"
      stroke="#000000"
      strokeWidth="1.5"
    />
    <text
      x="50"
      y="38"
      textAnchor="middle"
      fontSize="9"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="#000000"
    >
      $
    </text>
    {/* Corner numbers */}
    <text
      x="31"
      y="29"
      fontSize="5"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="#000000"
    >
      $
    </text>
    <text
      x="69"
      y="42"
      fontSize="5"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="#000000"
    >
      $
    </text>
  </svg>
);

/**
 * Pinned Note Paper with realistic pushpin and hand-drawn border
 */
export const PinnedNote: React.FC<{
  title: string;
  body: string;
  className?: string;
}> = ({ title, body, className = "" }) => (
  <div
    className={`relative bg-[#FFFFFF] border-2 border-black p-3.5 pt-4 rounded-lg shadow-xs max-w-xs select-none ${className}`}
    style={{ transform: "rotate(-2deg)" }}
  >
    {/* Red Pushpin */}
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
      <div className="w-4 h-4 rounded-full bg-[#eb1c24] border-2 border-black shadow-xs flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
      <div className="w-0.5 h-2 bg-neutral-700" />
    </div>

    {/* Dashed inner tape line */}
    <div className="border border-dashed border-neutral-300 p-2.5 rounded text-center">
      <h4 className="text-xs font-black uppercase text-black tracking-wide">
        {title}
      </h4>
      <p className="text-[10px] font-bold text-neutral-700 leading-tight mt-1">
        {body}
      </p>
    </div>
  </div>
);

/**
 * Hand-drawn Floating Airplane with Propeller
 */
export const AirplaneIllustration: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = "", size = 90 }) => (
  <svg
    width={size}
    height={size * 0.65}
    viewBox="0 0 120 78"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Propeller */}
    <rect
      x="8"
      y="18"
      width="4"
      height="42"
      rx="2"
      fill="#2d3748"
      stroke="#000"
      strokeWidth="2"
    />
    <circle cx="10" cy="39" r="4" fill="#ffc905" stroke="#000" strokeWidth="2" />

    {/* Airplane Body */}
    <path
      d="M10 39 C15 30, 35 24, 75 25 C95 25, 110 32, 115 39 C110 46, 95 53, 75 53 C35 54, 15 48, 10 39 Z"
      fill="#6ccef5"
      stroke="#000000"
      strokeWidth="2.5"
    />

    {/* Cockpit Window */}
    <path
      d="M40 28 C45 22, 58 22, 65 28 L62 33 L38 33 Z"
      fill="#ffffff"
      stroke="#000"
      strokeWidth="2"
    />

    {/* Wings */}
    <path
      d="M50 38 L30 65 L48 65 L68 40 Z"
      fill="#008ed2"
      stroke="#000000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M55 35 L40 10 L56 10 L72 34 Z"
      fill="#008ed2"
      stroke="#000000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Tail Fin */}
    <path
      d="M100 35 L115 15 L120 18 L112 40 Z"
      fill="#008ed2"
      stroke="#000000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 3D Isometric Hand-Drawn Dice with black pips
 */
export const IsometricDice: React.FC<{
  size?: number;
  rotation?: number;
  className?: string;
}> = ({ size = 60, rotation = 0, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block filter drop-shadow-[2px_3px_0px_rgba(0,0,0,0.9)] ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    {/* Top Face */}
    <polygon
      points="50,12 88,32 50,52 12,32"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Left Face */}
    <polygon
      points="12,32 50,52 50,92 12,72"
      fill="#E2E8F0"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Right Face */}
    <polygon
      points="50,52 88,32 88,72 50,92"
      fill="#CBD5E1"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Top Pips (Value: 3) */}
    <circle cx="50" cy="32" r="3.5" fill="#000000" />
    <circle cx="34" cy="24" r="3.5" fill="#000000" />
    <circle cx="66" cy="40" r="3.5" fill="#000000" />

    {/* Left Pips (Value: 5) */}
    <circle cx="31" cy="62" r="3" fill="#000000" />
    <circle cx="20" cy="46" r="3" fill="#000000" />
    <circle cx="42" cy="54" r="3" fill="#000000" />
    <circle cx="20" cy="70" r="3" fill="#000000" />
    <circle cx="42" cy="78" r="3" fill="#000000" />

    {/* Right Pips (Value: 6) */}
    <circle cx="60" cy="54" r="3" fill="#000000" />
    <circle cx="60" cy="67" r="3" fill="#000000" />
    <circle cx="60" cy="80" r="3" fill="#000000" />
    <circle cx="78" cy="45" r="3" fill="#000000" />
    <circle cx="78" cy="58" r="3" fill="#000000" />
    <circle cx="78" cy="71" r="3" fill="#000000" />
  </svg>
);

/**
 * Hand-Drawn Hero Cartoon Characters Scene
 * (Tycoon with money bag + excited winner with coins on green hills with trees)
 */
export const HeroCartoonScene: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`relative w-full max-w-4xl mx-auto overflow-hidden ${className}`}>
    <svg
      viewBox="0 0 800 360"
      className="w-full h-auto select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Grassy Hills */}
      <path
        d="M-50 360 L-50 200 Q200 120 400 190 T850 170 L850 360 Z"
        fill="#a5cd39"
        stroke="#000000"
        strokeWidth="3"
      />
      <path
        d="M-50 360 L-50 250 Q180 180 380 260 T850 230 L850 360 Z"
        fill="#8fb82b"
        stroke="#000000"
        strokeWidth="3"
      />
      <path
        d="M-50 360 L-50 290 Q220 230 480 300 T850 280 L850 360 Z"
        fill="#7ba322"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Right Tree */}
      <g transform="translate(560, 80)">
        {/* Trunk */}
        <path
          d="M80 180 C80 120, 95 100, 100 80 C105 100, 120 120, 120 180 Z"
          fill="#8d5b2c"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* Branches */}
        <path
          d="M95 110 L65 80 L75 75 L100 95"
          fill="#8d5b2c"
          stroke="#000000"
          strokeWidth="2.5"
        />
        {/* Leaves Foliage */}
        <circle cx="50" cy="60" r="45" fill="#48bb78" stroke="#000" strokeWidth="3" />
        <circle cx="100" cy="35" r="55" fill="#38a169" stroke="#000" strokeWidth="3" />
        <circle cx="150" cy="65" r="45" fill="#2f855a" stroke="#000" strokeWidth="3" />
        <circle cx="110" cy="80" r="45" fill="#48bb78" stroke="#000" strokeWidth="3" />
      </g>

      {/* Left Tree */}
      <g transform="translate(20, 110)">
        <circle cx="40" cy="50" r="35" fill="#38a169" stroke="#000" strokeWidth="3" />
        <circle cx="75" cy="35" r="40" fill="#48bb78" stroke="#000" strokeWidth="3" />
        <circle cx="100" cy="60" r="35" fill="#2f855a" stroke="#000" strokeWidth="3" />
      </g>

      {/* LEFT CHARACTER: Boss Tycoon with Sunglasses & Moneybag */}
      <g transform="translate(110, 100)">
        {/* Body & Pinstripe Suit */}
        <path
          d="M60 170 C40 180, 20 210, 15 260 L105 260 C100 210, 80 180, 60 170 Z"
          fill="#1a202c"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* White Shirt Collar & Red Bowtie */}
        <polygon points="60,170 48,195 72,195" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <path
          d="M52 195 L68 195 L64 205 L60 198 L56 205 Z"
          fill="#eb1c24"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Head */}
        <circle
          cx="60"
          cy="135"
          r="26"
          fill="#fbd38d"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* Round Nose */}
        <circle cx="60" cy="140" r="6" fill="#f56565" stroke="#000" strokeWidth="1.5" />
        {/* Cool Sunglasses */}
        <rect
          x="44"
          y="126"
          width="14"
          height="10"
          rx="2"
          fill="#000000"
          stroke="#000"
          strokeWidth="1.5"
        />
        <rect
          x="62"
          y="126"
          width="14"
          height="10"
          rx="2"
          fill="#000000"
          stroke="#000"
          strokeWidth="1.5"
        />
        <line x1="58" y1="130" x2="62" y2="130" stroke="#000" strokeWidth="2" />

        {/* Fedora Hat */}
        <path
          d="M30 120 C40 118, 80 118, 90 120 L85 100 C80 92, 40 92, 35 100 Z"
          fill="#edf2f7"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* Hat Ribbon */}
        <path d="M35 106 C50 104, 70 104, 85 106" stroke="#eb1c24" strokeWidth="4" />

        {/* Bulging Green Money Bag with $ symbol */}
        <g transform="translate(-25, 175)">
          <path
            d="M25 30 C10 40, 5 70, 25 85 C45 100, 75 90, 80 70 C85 50, 70 35, 55 30 L60 20 L30 20 Z"
            fill="#38a169"
            stroke="#000000"
            strokeWidth="3"
          />
          <circle cx="48" cy="60" r="14" fill="#ffc905" stroke="#000" strokeWidth="2" />
          <text
            x="48"
            y="67"
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fontFamily="sans-serif"
            fill="#000000"
          >
            $
          </text>
        </g>
      </g>

      {/* RIGHT CHARACTER: Excited Winner on Coin Pile */}
      <g transform="translate(370, 130)">
        {/* Pile of Gold Coins */}
        <ellipse cx="60" cy="235" rx="55" ry="16" fill="#ffc905" stroke="#000" strokeWidth="2.5" />
        <ellipse cx="40" cy="228" rx="20" ry="7" fill="#f6e05e" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="75" cy="228" rx="22" ry="7" fill="#ecc94b" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="60" cy="220" rx="26" ry="8" fill="#ffc905" stroke="#000" strokeWidth="2" />

        {/* Body & Arms Raised High in Excitement */}
        <path
          d="M60 160 C45 170, 40 195, 45 220 L75 220 C80 195, 75 170, 60 160 Z"
          fill="#4299e1"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* Raised Left Arm */}
        <path
          d="M48 165 C30 150, 10 130, 5 110"
          stroke="#fbd38d"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="5" cy="110" r="6" fill="#fbd38d" stroke="#000" strokeWidth="2" />
        {/* Raised Right Arm */}
        <path
          d="M72 165 C90 150, 110 130, 115 110"
          stroke="#fbd38d"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="115" cy="110" r="6" fill="#fbd38d" stroke="#000" strokeWidth="2" />

        {/* Head */}
        <circle
          cx="60"
          cy="125"
          r="22"
          fill="#fbd38d"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* Excited Wide Open Smile */}
        <path
          d="M50 130 Q60 146 70 130 Z"
          fill="#eb1c24"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Big Expressive Eyes */}
        <circle cx="53" cy="120" r="4" fill="#000000" />
        <circle cx="67" cy="120" r="4" fill="#000000" />
        <circle cx="54" cy="119" r="1.5" fill="#FFFFFF" />
        <circle cx="68" cy="119" r="1.5" fill="#FFFFFF" />

        {/* Playful Red Mini Top Hat */}
        <path
          d="M44 105 L76 105 L72 80 L48 80 Z"
          fill="#eb1c24"
          stroke="#000000"
          strokeWidth="2.5"
        />
        <ellipse cx="60" cy="105" rx="18" ry="4" fill="#c53030" stroke="#000" strokeWidth="2" />
      </g>
    </svg>
  </div>
);

/**
 * Hand-Drawn Gentleman in Top Hat jumping over floating 3D dice with cane
 */
export const DapperDiceJumper: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = "", size = 220 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
  >
    {/* Floating Dice 1 */}
    <g transform="translate(90, 110)">
      <polygon
        points="30,5 55,18 30,30 5,18"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <polygon
        points="5,18 30,30 30,58 5,45"
        fill="#E2E8F0"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <polygon
        points="30,30 55,18 55,45 30,58"
        fill="#CBD5E1"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <circle cx="30" cy="18" r="2.5" fill="#000000" />
      <circle cx="18" cy="38" r="2.5" fill="#000000" />
      <circle cx="42" cy="44" r="2.5" fill="#000000" />
    </g>

    {/* Floating Dice 2 */}
    <g transform="translate(130, 130)">
      <polygon
        points="25,5 45,15 25,25 5,15"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <polygon
        points="5,15 25,25 25,48 5,38"
        fill="#E2E8F0"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <polygon
        points="25,25 45,15 45,38 25,48"
        fill="#CBD5E1"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <circle cx="25" cy="15" r="2" fill="#000000" />
      <circle cx="15" cy="32" r="2" fill="#000000" />
      <circle cx="35" cy="38" r="2" fill="#000000" />
    </g>

    {/* Dapper Gentleman in Top Hat */}
    <g transform="translate(50, 10)">
      {/* Cane */}
      <path
        d="M20 70 C10 60, 5 45, 15 35 C22 28, 30 35, 25 42 L45 110"
        stroke="#8d5b2c"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="15" cy="35" r="4" fill="#ffc905" stroke="#000" strokeWidth="1.5" />

      {/* Tuxedo Body */}
      <path
        d="M60 80 C45 90, 40 120, 50 145 L80 145 C90 120, 85 90, 70 80 Z"
        fill="#2d3748"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* White Shirt Collar & Bowtie */}
      <polygon points="65,80 58,95 72,95" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
      <circle cx="65" cy="92" r="3" fill="#eb1c24" stroke="#000" strokeWidth="1" />

      {/* Head */}
      <circle
        cx="65"
        cy="55"
        r="18"
        fill="#fbd38d"
        stroke="#000000"
        strokeWidth="2.5"
      />
      {/* Signature White Mustache */}
      <path
        d="M52 64 C56 60, 62 60, 65 64 C68 60, 74 60, 78 64 C72 68, 58 68, 52 64 Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="1.5"
      />
      {/* Monocle & Eye */}
      <circle cx="60" cy="50" r="4" fill="#ffc905" stroke="#000" strokeWidth="1.5" />
      <circle cx="72" cy="50" r="2.5" fill="#000000" />

      {/* Top Hat */}
      <ellipse cx="65" cy="40" rx="20" ry="5" fill="#1a202c" stroke="#000" strokeWidth="2.5" />
      <path
        d="M50 40 L52 12 L78 12 L80 40 Z"
        fill="#1a202c"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <rect x="51" y="32" width="28" height="5" fill="#eb1c24" stroke="#000" strokeWidth="1" />

      {/* Jumping Legs */}
      <path
        d="M52 145 L40 170 L55 175"
        stroke="#2d3748"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M75 145 L90 160 L105 150"
        stroke="#2d3748"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spat Shoes */}
      <ellipse cx="55" cy="175" rx="7" ry="4" fill="#000000" />
      <ellipse cx="105" cy="150" rx="7" ry="4" fill="#000000" />
    </g>
  </svg>
);

/**
 * Hand-Drawn Crowned Tycoon in Luxury Armchair with Laptop
 */
export const CrownedTycoonArmchair: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = "", size = 200 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
  >
    {/* White / Cream Padded Armchair */}
    <path
      d="M40 70 C40 40, 160 40, 160 70 L155 150 C155 165, 45 165, 45 150 Z"
      fill="#F7FAFC"
      stroke="#000000"
      strokeWidth="3"
    />
    {/* Tufted Button Details */}
    <circle cx="70" cy="75" r="2" fill="#CBD5E0" />
    <circle cx="100" cy="75" r="2" fill="#CBD5E0" />
    <circle cx="130" cy="75" r="2" fill="#CBD5E0" />
    <circle cx="85" cy="100" r="2" fill="#CBD5E0" />
    <circle cx="115" cy="100" r="2" fill="#CBD5E0" />

    {/* Armrests */}
    <path
      d="M30 95 C30 85, 45 85, 50 100 L50 140 L30 140 Z"
      fill="#EDF2F7"
      stroke="#000"
      strokeWidth="2.5"
    />
    <path
      d="M170 95 C170 85, 155 85, 150 100 L150 140 L170 140 Z"
      fill="#EDF2F7"
      stroke="#000"
      strokeWidth="2.5"
    />

    {/* Wooden Chair Legs */}
    <rect x="50" y="150" width="8" height="25" fill="#8d5b2c" stroke="#000" strokeWidth="2" />
    <rect x="142" y="150" width="8" height="25" fill="#8d5b2c" stroke="#000" strokeWidth="2" />

    {/* King Tycoon in Gray Suit */}
    <g transform="translate(60, 45)">
      {/* Body */}
      <path
        d="M20 50 C20 40, 60 40, 60 50 L65 95 L15 95 Z"
        fill="#718096"
        stroke="#000000"
        strokeWidth="2.5"
      />
      {/* Head */}
      <circle cx="40" cy="30" r="16" fill="#fbd38d" stroke="#000" strokeWidth="2.5" />
      {/* Dapper Mustache */}
      <path
        d="M30 38 C35 34, 45 34, 50 38 C45 42, 35 42, 30 38 Z"
        fill="#FFFFFF"
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Glasses */}
      <circle cx="34" cy="27" r="3.5" fill="none" stroke="#000" strokeWidth="1.5" />
      <circle cx="46" cy="27" r="3.5" fill="none" stroke="#000" strokeWidth="1.5" />
      <line x1="37.5" y1="27" x2="42.5" y2="27" stroke="#000" strokeWidth="1.5" />

      {/* Gold Crown */}
      <polygon
        points="26,16 30,5 37,12 43,2 50,12 56,5 60,16"
        fill="#ffc905"
        stroke="#000000"
        strokeWidth="2"
      />
      <circle cx="43" cy="3" r="1.5" fill="#eb1c24" />

      {/* Modern Laptop on Lap */}
      <path
        d="M22 80 L58 80 L62 90 L18 90 Z"
        fill="#E2E8F0"
        stroke="#000000"
        strokeWidth="2"
      />
      <polygon
        points="25,60 55,60 58,80 22,80"
        fill="#A0AEC0"
        stroke="#000000"
        strokeWidth="2"
      />
      {/* Apple / FLOP Logo on laptop back */}
      <circle cx="40" cy="70" r="2.5" fill="#FFFFFF" />
    </g>
  </svg>
);
