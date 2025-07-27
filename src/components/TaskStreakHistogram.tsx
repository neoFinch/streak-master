
import './TaskStreakHistogram.css';

const TaskStreakHistogram = ({ taskData }: { taskData: any[] }) => {


  const maxStreak = Math.max(...taskData.map(d => d.streak));
  const chartHeight = 300;
  const chartWidth = 320;
  const barWidth = 5;
  const barSpacing = 12;
  const margin = { top: 80, right: 20, bottom: 80, left: 30 };

  // Planet component
  const Planet = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      {/* Planet body */}
      <circle 
        cx="0" 
        cy="0" 
        r="20" 
        fill="#4F46E5" 
        stroke="#6366F1" 
        strokeWidth="2"
      />
      {/* Planet rings */}
      <ellipse 
        cx="0" 
        cy="0" 
        rx="32" 
        ry="6" 
        fill="none" 
        stroke="#8B5CF6" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="0" 
        cy="0" 
        rx="28" 
        ry="5" 
        fill="none" 
        stroke="#A855F7" 
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Planet surface details */}
      <circle cx="-6" cy="-4" r="2" fill="#3730A3" opacity="0.6" />
      <circle cx="8" cy="6" r="3" fill="#3730A3" opacity="0.4" />
      <circle cx="4" cy="-8" r="1.5" fill="#3730A3" opacity="0.5" />
    </g>
  );

  // Rocket component
  const Rocket = ({ x, y, size = 1 }: { x: number; y: number; size?: number }) => (
    <g transform={`translate(${x}, ${y}) scale(${size})`}>
      {/* Rocket body */}
      <rect x="-6" y="-20" width="12" height="25" fill="#EF4444" rx="2" />
      {/* Rocket nose */}
      <polygon points="-6,-20 0,-30 6,-20" fill="#DC2626" />
      {/* Rocket fins */}
      <polygon points="-6,5 -10,10 -6,8" fill="#B91C1C" />
      <polygon points="6,5 10,10 6,8" fill="#B91C1C" />
      {/* Rocket window */}
      <circle cx="0" cy="-10" r="3" fill="#93C5FD" />
      {/* Rocket flames */}
      <g>
        <polygon points="-4,5 -2,15 0,12 2,15 4,5" fill="#F59E0B" />
        <polygon points="-2,8 0,18 2,8" fill="#EAB308" />
      </g>
    </g>
  );

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-black min-h-screen">
      <div className="bg-gray-900 rounded-lg p-3 shadow-2xl w-full max-w-sm">
        <svg 
          width={chartWidth + margin.left + margin.right} 
          height={chartHeight + margin.top + margin.bottom}
          className="overflow-visible"
        >
          {/* Background stars */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * (chartWidth + margin.left + margin.right)}
              cy={Math.random() * (chartHeight + margin.top + margin.bottom)}
              r="1"
              fill="white"
              opacity={Math.random() * 0.8 + 0.2}
            />
          ))}
          
          {/* Planet at the top */}
          <Planet 
            x={chartWidth / 2 + margin.left} 
            y={margin.top / 2} 
          />
          
          {/* Chart area */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Y-axis */}
            <line 
              x1="0" 
              y1="0" 
              x2="0" 
              y2={chartHeight} 
              stroke="#64748B" 
              strokeWidth="2"
            />
            
            {/* X-axis */}
            <line 
              x1="0" 
              y1={chartHeight} 
              x2={chartWidth} 
              y2={chartHeight} 
              stroke="#64748B" 
              strokeWidth="2"
            />
            
            {/* Y-axis labels */}
            {[0, 5, 10, 15, 20, 25].map(tick => (
              <g key={tick}>
                <line 
                  x1="-5" 
                  y1={chartHeight - (tick / maxStreak) * chartHeight} 
                  x2="0" 
                  y2={chartHeight - (tick / maxStreak) * chartHeight} 
                  stroke="#64748B" 
                />
                <text 
                  x="-10" 
                  y={chartHeight - (tick / maxStreak) * chartHeight + 5} 
                  textAnchor="end" 
                  fill="#CBD5E1" 
                  fontSize="12"
                >
                  {tick}
                </text>
              </g>
            ))}
            
            {/* Bars and rockets */}
            {taskData.map((item, index) => {
              const x = index * (barWidth + barSpacing) + barSpacing;
              const barHeight = (item.streak / maxStreak) * chartHeight;
              const y = chartHeight - barHeight;
              
              return (
                <g key={item.task}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={`#3c3434`}
                    stroke={`#ab891a`}
                    strokeWidth="1"
                    rx="4"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                  
                  {/* Streak number on bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y + barHeight / 2}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {item.streak}
                  </text>
                  
                  {/* Rocket on top of bar */}
                  <Rocket 
                    x={x + barWidth / 2} 
                    y={y - 8} 
                    size={0.6}
                  />
                  
                  {/* Task label - rotated 45 degrees */}
                  <g transform={`translate(${x + barWidth / 2}, ${chartHeight + 30})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="start"
                      fill="#CBD5E1"
                      fontSize="10"
                      fontWeight="medium"
                      transform="rotate(45, 20, -12)"
                    >
                      {item.task}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    
    </div>
  );
};

export default TaskStreakHistogram;