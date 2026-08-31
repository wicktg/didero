import React from "react";
import { PortfolioPoint } from "../../types/stats";

interface PortfolioLineChartProps {
  data: PortfolioPoint[];
  color?: string;
  isAgent2?: boolean;
}

export const PortfolioLineChart: React.FC<PortfolioLineChartProps> = ({
  data,
  color = "#008ed2",
  isAgent2 = false,
}) => {
  if (!data || data.length === 0) return null;

  const width = 640;
  const height = 210;
  const padding = { top: 15, right: 25, bottom: 30, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minTurn = Math.min(...data.map((d) => d.turn));
  const maxTurn = Math.max(...data.map((d) => d.turn));

  const values = data.map((d) =>
    isAgent2 ? d.agent2NetWorth : d.agent1NetWorth,
  );
  const maxVal = Math.max(4000, ...values);
  const minVal = 0;

  const getX = (turn: number) => {
    if (maxTurn === minTurn) return padding.left + innerWidth / 2;
    return padding.left + ((turn - minTurn) / (maxTurn - minTurn)) * innerWidth;
  };

  const getY = (val: number) => {
    return (
      padding.top +
      innerHeight -
      ((val - minVal) / (maxVal - minVal)) * innerHeight
    );
  };

  // Generate single SVG path string for agent's own portfolio
  const linePoints = data
    .map(
      (d) =>
        `${getX(d.turn)},${getY(isAgent2 ? d.agent2NetWorth : d.agent1NetWorth)}`,
    )
    .join(" ");

  // Grid tick values for Y axis
  const yTicks = [0, 1000, 2000, 3000, 4000];

  return (
    <div className="w-full bg-white rounded-lg border-[1.5px] border-black p-3 select-none">
      {/* Header */}
      <div className="pb-2 border-b-[1.5px] border-black text-[11px] font-bold">
        <span className="uppercase tracking-wider text-black">
          Portfolio Growth Trajectory
        </span>
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
                  y={padding.top + innerHeight + 14}
                  textAnchor="middle"
                  className="text-[9px] font-extrabold fill-neutral-700 uppercase"
                >
                  T{d.turn}
                </text>
              </g>
            );
          })}

          {/* Agent's Own Polyline */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />

          {/* Data Points on Line */}
          {data.map((d, i) => {
            const x = getX(d.turn);
            const y = getY(isAgent2 ? d.agent2NetWorth : d.agent1NetWorth);

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3.5}
                fill={color}
                stroke="#000000"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
