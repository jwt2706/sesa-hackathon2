import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Trade } from '../types/trade';
import { prepareHeatmapData } from './heatmapUtils';

const TradeHeatmap = ({ trades }: { trades: Trade[] }) => {
  const data = prepareHeatmapData(trades);

  return (
    <div style={{ height: '400px', backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '10px' }}>
      <h3 style={{ color: '#fff' }}>Overtrading "Hot Zones"</h3>
      <ResponsiveHeatMap
        data={data}
        keys={Array.from({ length: 24 }, (_, i) => i.toString())}
        indexBy="id"
        margin={{ top: 30, right: 30, bottom: 30, left: 60 }}
        colors={{
          type: 'sequential',
          scheme: 'reds',
        }}
        axisTop={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Hour of Day', legendOffset: -20 }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Day', legendPosition: 'middle', legendOffset: -50 }}
        theme={{
            axis: { ticks: { text: { fill: "#ccc" } }, legend: { text: { fill: "#fff" } } },
            grid: { line: { stroke: "#333" } }
        }}
      />
    </div>
  );
};

export default TradeHeatmap;