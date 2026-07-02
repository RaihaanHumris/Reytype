import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ResultsView({ stats, chartData, onRestart, setView }) {
  if (!stats) return null;

  return (
    <div className="max-w-container-max w-full flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
      
      {/* Top Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center">
          <span className="font-metric-label text-on-tertiary-container uppercase tracking-widest mb-2">
            WPM
          </span>
          <span className="font-metric-value text-7xl text-primary-fixed drop-shadow-[0_0_15px_rgba(195,244,0,0.4)]">
            {stats.wpm}
          </span>
        </div>
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center">
          <span className="font-metric-label text-on-tertiary-container uppercase tracking-widest mb-2">
            Accuracy
          </span>
          <span className="font-metric-value text-7xl text-primary drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {stats.accuracy}%
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 h-[400px]">
          <h3 className="font-headline-md text-on-surface mb-6 ml-2">Performance History</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#56657c" 
                tick={{ fill: '#56657c', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(value) => `${value}s`}
              />
              <YAxis 
                yAxisId="left"
                stroke="#56657c" 
                tick={{ fill: '#56657c', fontSize: 12, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#56657c" 
                tick={{ fill: '#56657c', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171f33', borderColor: '#2d3449', borderRadius: '8px' }}
                itemStyle={{ fontFamily: 'JetBrains Mono' }}
                labelStyle={{ color: '#dae2fd', marginBottom: '8px' }}
                labelFormatter={(label) => `Time: ${label}s`}
              />
              <Legend wrapperStyle={{ fontFamily: 'Hanken Grotesk', paddingTop: '10px' }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="wpm" 
                name="WPM"
                stroke="#c3f400" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0b1326', stroke: '#c3f400', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#c3f400', stroke: '#0b1326', strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="accuracy" 
                name="Accuracy"
                stroke="#00daf8" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0b1326', stroke: '#00daf8', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#00daf8', stroke: '#0b1326', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <button
          onClick={() => {
            onRestart();
            setView('practice');
          }}
          className="px-8 py-3 bg-primary-fixed text-on-primary-fixed font-headline-md rounded-lg transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(195,244,0,0.3)] hover:shadow-[0_0_25px_rgba(195,244,0,0.5)] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" data-icon="keyboard">keyboard</span>
          Practice Again
        </button>
        <button
          onClick={() => setView('leaderboard')}
          className="px-8 py-3 bg-surface-variant text-on-surface font-headline-md rounded-lg transition-all hover:bg-surface-bright active:scale-95 border border-outline-variant/30 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" data-icon="leaderboard">leaderboard</span>
          Leaderboard
        </button>
      </div>

    </div>
  );
}
