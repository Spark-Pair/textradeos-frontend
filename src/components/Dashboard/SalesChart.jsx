import { useState } from "react";
import { formatAmount } from "../../utils";

export default function SalesChart ({ data }) {
  const width = 800;
  const height = 300; // Increased height for better visual impact
  const padding = 40; // Increased padding for labels

  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 rounded-xl bg-gray-50 border border-dashed border-gray-300">
        No sales data available for the selected date range.
      </div>
    );
  }

  // 1. Data Scaling and Bounds
  const amounts = data.map(d => d.amount);
  const minAmount = Math.min(...amounts) * 0.95; // Start slightly below min
  const maxAmount = Math.max(...amounts) * 1.05; // End slightly above max
  const rangeAmount = maxAmount - minAmount;
  const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;

  const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
  const getY = (amount) => height - padding - ((amount - minAmount) / rangeAmount) * (height - 2 * padding);

  // 2. Generate SVG Path Strings (Line and Area)
  const linePathData = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d.amount);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Area path closes the shape to the bottom x-axis line
  const areaPathData = linePathData +
    ` L ${getX(data.length - 1)} ${height - padding}` + // Move to bottom right corner
    ` L ${getX(0)} ${height - padding}` + // Move to bottom left corner
    ` Z`; // Close path

  const yAxisTicks = [minAmount, avgAmount, maxAmount].map(
    (n) => ({ value: n, y: getY(n) })
  );

  // 4. Smart X-Axis Label Interval Calculation
  // Determine how many labels to skip to prevent overlap.
  // Rule: If > 10 points, skip every 2nd. If > 20 points, skip every 4th.
  let labelInterval = 1;
  if (data.length > 30) {
    labelInterval = 5;
  } else if (data.length > 15) {
    labelInterval = 3;
  }

  return (
    <div className="relative min-w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minWidth: `${width}px` }}>

        {/* --- Definitions for Gradient Fill --- */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#127475", stopOpacity: 0.3 }} /> {/* Indigo-400 */}
            <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0.1 }} /> {/* White */}
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#127475" />
            <stop offset="100%" stopColor="#127475" />
          </linearGradient>
        </defs>

        {/* --- Area Fill --- */}
        <path
          d={areaPathData}
          fill="url(#areaGradient)"
        />

        {/* --- Y-Axis Grid Lines and Labels --- */}
        {yAxisTicks.map((tick, index) => (
          <g key={index}>
            {/* Grid Line */}
            <line
              x1={padding}
              y1={tick.y}
              x2={width - padding}
              y2={tick.y}
              stroke={index === 1 ? '#127475' : '#e5e7eb'} // Highlight avg line
              strokeWidth={index === 1 ? '1.5' : '1'}
              strokeDasharray={index === 1 ? '5 5' : '0'} // Dashed for average
              opacity={index === 0 || index === 2 ? 0.7 : 1}
            />
            {/* Label */}
            <text
              x={padding - 10}
              y={tick.y + 4}
              fontSize="12"
              fill="#6b7280"
              textAnchor="end"
              className="font-medium"
            >
              {formatAmount(tick.value)}
            </text>
            {/* Average Label */}
            {index === 1 && (
              <text
                x={width - padding - 5}
                y={tick.y - 6}
                fontSize="10"
                fill="#127475"
                textAnchor="end"
                className="font-semibold"
              >
                Average
              </text>
            )}
          </g>
        ))}
        
        {/* --- The Sales Line --- */}
        <path
          d={linePathData}
          fill="none"
          stroke="url(#lineGradient)" // Use the gradient for the line
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* --- X-Axis Labels (Dates) and Interaction Points --- */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.amount);

          // X-Axis Label: Only display label if it's the start, end, or at the calculated interval
          const showLabel = i === 0 || i === data.length - 1 || (i % labelInterval === 0 && i !== 0);

          return (
            <g 
              key={i}
              onMouseEnter={() => setHoveredDataPoint({ x, y, data: d })}
              onMouseLeave={() => setHoveredDataPoint(null)}
            >
              {showLabel && (
                <text
                  x={x}
                  y={height - padding + 15}
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="middle"
                  className="font-mono text-xs"
                >
                  {d.date.substring(5).replace('-', '/')} {/* MM/DD */}
                </text>
              )}

              {/* Point Indicator */}
              <circle
                cx={x}
                cy={y}
                r={hoveredDataPoint && hoveredDataPoint.data.date === d.date ? 6 : 4}
                fill="#127475" // Indigo-600
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      {/* --- Floating Tooltip --- */}
      {hoveredDataPoint && (
        <div
          className="absolute z-50 p-2 bg-gray-800 text-gray-300 text-xs rounded-lg shadow-xl pointer-events-none transition-opacity duration-150"
          style={{
            left: `${hoveredDataPoint.x / width * 100}%`,
            top: `${hoveredDataPoint.y}px`,
            transform: 'translate(-50%, -120%)',
            opacity: 1
          }}
        >
          <div className="font-semibold text-nowrap">{hoveredDataPoint.data.date}</div>
          <div className="text-gray-100 text-nowrap">
            {`PKR ${hoveredDataPoint.data.amount?.toLocaleString()}`}
          </div>
        </div>
      )}
    </div>
  );
};