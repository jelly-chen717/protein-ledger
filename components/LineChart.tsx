type LineChartPoint = {
  label: string;
  value: number | null;
};

type LineChartProps = {
  points: LineChartPoint[];
  unit?: string;
  color?: string;
  target?: number;
  minValue?: number;
  maxValue?: number;
};

export default function LineChart({
  points,
  unit = "",
  color = "#277a52",
  target,
  minValue,
  maxValue
}: LineChartProps) {
  const width = 320;
  const height = 150;
  const padX = 28;
  const padTop = 16;
  const padBottom = 34;
  const values = points
    .map((point) => point.value)
    .filter((value): value is number => typeof value === "number");
  const rawMin = Math.min(...values, target ?? Infinity, minValue ?? Infinity);
  const rawMax = Math.max(...values, target ?? -Infinity, maxValue ?? -Infinity);
  const min = minValue ?? Math.max(0, Math.floor(rawMin - 5));
  const max = maxValue ?? Math.max(Number.isFinite(rawMax) ? rawMax + 10 : 10, min + 10);
  const chartHeight = height - padTop - padBottom;
  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;

  function x(index: number) {
    return padX + index * stepX;
  }

  function y(value: number) {
    const clamped = Math.min(Math.max(value, min), max);
    const ratio = (clamped - min) / (max - min);
    return padTop + chartHeight - ratio * chartHeight;
  }

  const path = points.reduce(
    (segments, point, index) => {
      if (typeof point.value !== "number") {
        return {
          path: segments.path,
          drawing: false
        };
      }

      return {
        path: `${segments.path} ${segments.drawing ? "L" : "M"} ${x(index)} ${y(point.value)}`,
        drawing: true
      };
    },
    { path: "", drawing: false }
  ).path.trim();

  const targetY = typeof target === "number" ? y(target) : null;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-paper px-2 py-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="趋势折线图"
        className="h-40 w-full"
      >
        <line
          x1={padX}
          y1={padTop + chartHeight}
          x2={width - padX}
          y2={padTop + chartHeight}
          stroke="#d9e7df"
          strokeWidth="1"
        />
        {targetY !== null ? (
          <>
            <line
              x1={padX}
              y1={targetY}
              x2={width - padX}
              y2={targetY}
              stroke="#8fb9a4"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <text
              x={width - padX}
              y={targetY - 5}
              textAnchor="end"
              className="fill-slate-500 text-[10px]"
            >
              目标 {target?.toFixed(1)}
            </text>
          </>
        ) : null}
        {path ? (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <text x={width / 2} y={height / 2} textAnchor="middle" className="fill-slate-500 text-xs">
            暂无记录
          </text>
        )}
        {points.map((point, index) => (
          <g key={point.label}>
            {typeof point.value === "number" ? (
              <circle cx={x(index)} cy={y(point.value)} r="3.5" fill="white" stroke={color} strokeWidth="2" />
            ) : (
              <circle cx={x(index)} cy={padTop + chartHeight} r="2.5" fill="#cbd5e1" />
            )}
            <text x={x(index)} y={height - 13} textAnchor="middle" className="fill-slate-500 text-[10px]">
              {point.label}
            </text>
          </g>
        ))}
        <text x={padX} y={12} className="fill-slate-500 text-[10px]">
          {max.toFixed(0)}{unit}
        </text>
        <text x={padX} y={padTop + chartHeight - 4} className="fill-slate-500 text-[10px]">
          {min.toFixed(0)}{unit}
        </text>
      </svg>
    </div>
  );
}
