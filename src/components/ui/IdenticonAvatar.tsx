import React from "react";

interface IdenticonAvatarProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

// Simple deterministic hash for string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const IdenticonAvatar: React.FC<IdenticonAvatarProps> = ({
  name,
  size = 24,
  className = "",
  color,
}) => {
  const hash = hashString(name);

  // Derive primary color if not provided
  const palette = [
    "#008ed2",
    "#eb1c24",
    "#a5cd39",
    "#ffc905",
    "#f6931e",
    "#ee5ba1",
    "#6ccef5",
    "#ba9664",
    "#333333",
  ];
  const avatarColor = color || palette[hash % palette.length];

  // 5x5 symmetric grid (3 columns x 5 rows = 15 cells)
  const grid: boolean[][] = [];
  for (let r = 0; r < 5; r++) {
    grid[r] = [];
    for (let c = 0; c < 5; c++) {
      // Columns 3 and 4 mirror columns 1 and 0
      const sourceCol = c > 2 ? 4 - c : c;
      const bitIndex = r * 3 + sourceCol;
      const isFilled = ((hash >> (bitIndex % 28)) & 1) === 1;
      grid[r][c] = isFilled;
    }
  }

  // Ensure at least some cells are filled
  const hasFilled = grid.some((row) => row.some((cell) => cell));
  if (!hasFilled) {
    grid[1][1] = true;
    grid[1][3] = true;
    grid[2][2] = true;
    grid[3][1] = true;
    grid[3][2] = true;
    grid[3][3] = true;
  }

  const cellSize = 6;
  const totalSize = 30;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className={`shrink-0 border border-black bg-white rounded-xs ${className}`}
      style={{ shapeRendering: "crispEdges" }}
    >
      <rect width={totalSize} height={totalSize} fill="#ffffff" />
      {grid.map((row, r) =>
        row.map((isFilled, c) =>
          isFilled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={avatarColor}
            />
          ) : null,
        ),
      )}
    </svg>
  );
};
