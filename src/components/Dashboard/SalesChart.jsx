import { useState } from "react";

export default function SalesChart({ data }) {
  const width = 800;
  const height = 280; // Thoda compact height
  const padding = 50;

  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200">
        <p className="font-medium italic text-sm">No sales data found for this period</p>
      </div>
    );
  }

  // --- 1. Scaling Logic ---
  const amounts = data.map(d => Number(d.amount) || 0);
  const maxAmount = Math.max(...amounts) * 1.2 || 1000;

  const getX = (i) => padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - (val / maxAmount) * (height - 2 * padding);

  // --- 2. Smooth Curve Logic ---
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.amount) }));
  
  const linePath = points.reduce((path, point, i, pts) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = pts[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    return `${path} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaPath = `${linePath} L ${getX(data.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;

  const themeColor = "#127475"; // Aapka Signature Color

  return (
    <div className="relative w-full group select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          {/* Main Gradient */}
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
          </linearGradient>
          
          {/* Subtle Glow Shadow */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor={themeColor} floodOpacity="0.15" />
          </filter>
        </defs>

        {/* --- Horizontal Grid Lines --- */}
        {[0, 0.5, 1].map((tick, i) => (
          <g key={i}>
            <line 
              x1={padding} y1={getY(maxAmount * tick)} 
              x2={width - padding} y2={getY(maxAmount * tick)} 
              stroke="#f1f5f9" strokeWidth="1.5" 
            />
            <text x={padding - 15} y={getY(maxAmount * tick) + 4} fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="end">
              {tick === 0 ? "0" : (maxAmount * tick >= 1000 ? `${(maxAmount * tick / 1000).toFixed(1)}k` : Math.round(maxAmount * tick))}
            </text>
          </g>
        ))}

        {/* --- Area Under the Curve --- */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* --- Main Smooth Line --- */}
        <path 
          d={linePath} fill="none" stroke={themeColor} 
          strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" 
          filter="url(#shadow)"
        />

        {/* --- Interaction Points --- */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            {/* Hit Area */}
            <rect x={p.x - 15} y={padding} width="30" height={height - 2 * padding} fill="transparent" className="cursor-pointer" />
            
            {hoveredIndex === i && (
              <>
                <line x1={p.x} y1={padding} x2={p.x} y2={height - padding} stroke={themeColor} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
                <circle cx={p.x} cy={p.y} r="7" fill={themeColor} stroke="white" strokeWidth="3" shadow="lg" />
              </>
            )}

            {/* X-Axis Labels (Date) */}
            {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
              <text x={p.x} y={height - 10} fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">
                {new Date(data[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* --- Modern Tooltip (Teal Theme) --- */}
      {hoveredIndex !== null && (
        <div 
          className="absolute pointer-events-none transition-all duration-300 ease-out z-50 bg-white shadow-[0_10px_25px_rgba(18,116,117,0.15)] border border-slate-100 p-3 rounded-2xl min-w-[140px]"
          style={{ 
            left: `${(points[hoveredIndex].x / width) * 100}%`, 
            top: `${points[hoveredIndex].y - 12}px`,
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mb-1">
               {new Date(data[hoveredIndex].date).toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
            <span className="text-sm font-medium text-[#127475]">
              PKR {Number(data[hoveredIndex].amount).toLocaleString()}
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-100 rotate-45" />
        </div>
      )}
    </div>
  );
}