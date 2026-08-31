import React, { useState } from "react";
import { PortfolioPoint } from "../../types/stats";

interface PortfolioLineChartProps {
  data: PortfolioPoint[];
  agent1Name?: string;
  agent2Name?: string;
}

export const PortfolioLineChart: React.FC<PortfolioLineChartProps> = ({
  data,
  agent1Name = "Agent Alpha",
  agent2Name = "Agent Beta",
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minTurn = Math.min(...data.map((d) => d.turn));
  const maxTurn = Math.max(...data.map((d) => d.turn));

  const allValues = data.flatMap((d) => [d.agent1NetWorth, d.agent2NetWorth]);
  const maxVal = Math.max(4000, ...allValues);
  const minVal = 0;

  const getX = (turn: number) => {
    if (maxTurn === minTurn) return padding.left + innerWidth / 2;
    return padding.left + ((turn - minTurn) / (maxTurn - minTurn)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  // Generate SVG path strings
  const line1Points = data.map((d) => `${getX(d.turn)},${getY(d.agent1NetWorth)}`).join(" ");
  const line2Points = data.map((d) => `${getX(d.turn)},${getY(d.agent2NetWorth)}`).join(" ");

  // Grid tick values for Y axis
  const yTicks = [0, 1000, 2000, 3000, 4000];

  return (
    <div className="w-full bg-white rounded-lg border-[1.5px] border-black p-3 select-none">
      {/* Legend & Header */}
      <div className="flex items-center justify-between pb-2 border-b-[1.5px] border-black text-[11px] font-bold">
        <span className="uppercase tracking-wider text-black">
          Net Worth Trajectory Across Turns
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#008ed2] border border-black inline-block" />
            <span className="text-black uppercase tracking-wider text-[10px]">
              {agent1Name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#f6931e] border border-black inline-block" />
            <span className="text-black uppercase tracking-wider text-[10px]">
              {agent2Name}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-2 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-sans"
        >
          {/* Y Axis Gridlines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-extrabold fill-neutral-600"
                >
                  ${tick.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X Axis Baseline */}
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight}
            stroke="#000000"
            strokeWidth="1.5"
          />

          {/* Y Axis Baseline */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + innerHeight}
            stroke="#000000"
            strokeWidth="1.5"
          />

          {/* X Axis Turn Ticks */}
          {data.map((d) => {
            const x = getX(d.turn);
            return (
              <g key={d.turn}>
                <line
                  x1={x}
                  y1={padding.top + innerHeight}
                  x2={x}
                  y2={padding.top + innerHeight + 4}
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 16}
                  textAnchor="middle"
                  className="text-[9px] font-extrabold fill-neutral-700 uppercase"
                >
                  T{d.turn}
                </text>
              </g>
            );
          })}

          {/* Agent 1 Polyline (#008ed2) */}
          <polyline
            fill="none"
            stroke="#008ed2"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={line1Points}
          />

          {/* Agent 2 Polyline (#f6931e) */}
          <polyline
            fill="none"
            stroke="#f6931e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={line2Points}
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = getX(d.turn);
            const y1 = getY(d.agent1NetWorth);
            const y2 = getY(d.agent2NetWorth);
            const isHovered = hoverIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Event Marker Flag */}
                {d.event && (
                  <g transform={`translate(${x}, ${Math.min(y1, y2) - 12})`}>
                    <rect
                      x="-25"
                      y="-12"
                      width="50"
                      height="12"
                      fill="#ffc905"
                      stroke="#000000"
                      strokeWidth="1"
                      rx="2"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      className="text-[6.5px] font-black fill-black uppercase tracking-tight"
                    >
                      {d.event.slice(0, 10)}
                    </text>
                  </g>
                )}

                {/* Point 1 */}
                <circle
                  cx={x}
                  cy={y1}
                  r={isHovered ? 5 : 3.5}
                  fill="#008ed2"
                  stroke="#000000"
                  strokeWidth="1.5"
                  className="transition-all duration-100"
                />

                {/* Point 2 */}
                <circle
                  cx={x}
                  cy={y2}
                  r={isHovered ? 5 : 3.5}
                  fill="#f6931e"
                  stroke="#000000"
                  strokeWidth="1.5"
                  className="transition-all duration-100"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute top-2 right-2 bg-white border-[1.5px] border-black rounded-md p-2 text-xs font-bold pointer-events-none shadow-xs z-10"
          >
            <div className="flex items-center justify-between gap-4 border-b border-neutral-300 pb-1 mb-1 text-[10px] uppercase tracking-wider text-black">
              <span>Turn #{data[hoverIndex].turn}</span>
              {data[hoverIndex].event && (
                <span className="bg-[#ffc905] px-1 py-0.5 rounded text-[8px] font-black border border-black">
                  {data[hoverIndex].event}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#008ed2] font-black flex items-center gap-1">
                  ● {agent1Name}:
                </span>
                <span className="font-extrabold text-black tabular-nums">
                  ${data[hoverIndex].agent1NetWorth.toLocaleString()}{" "}
                  <span className="text-[9px] font-normal text-neutral-500">
                    (${data[hoverIndex].agent1Cash} cash)
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#f6931e] font-black flex items-center gap-1">
                  ● {agent2Name}:
                </span>
                <span className="font-extrabold text-black tabular-nums">
                  ${data[hoverIndex].agent2NetWorth.toLocaleString()}{" "}
                  <span className="text-[9px] font-normal text-neutral-500">
                    (${data[hoverIndex].agent2Cash} cash)
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
