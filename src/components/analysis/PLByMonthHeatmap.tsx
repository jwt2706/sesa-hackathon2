import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Trade } from '../../types/trade';
import { preparePLHeatmapData } from '../../trade_analysis/aggregations';

const PLByMonthHeatmap = ({ trades }: { trades: Trade[] }) => {
  const { data, keys } = preparePLHeatmapData(trades);

  return (
    <div style={{ height: '420px' }}>
      <h3 className="text-white font-bold mb-2">P/L by Month & Day</h3>
      <div style={{ height: 360 }}>
        <ResponsiveHeatMap
          data={data as any}
          keys={keys}
          indexBy="day"
          margin={{ top: 40, right: 60, bottom: 60, left: 60 }}
          colors={{ type: 'diverging', scheme: 'red_yellow_blue' }}
          minValue={"auto"}
          maxValue={"auto"}
          forceSquare={false}
          axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -45 }}
          axisLeft={{ orient: 'left', tickSize: 5, tickPadding: 5, tickRotation: 0 }}
          cellOpacity={1}
          cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
          labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          theme={{
            axis: { ticks: { text: { fill: '#ccc' } }, legend: { text: { fill: '#fff' } } },
            tooltip: { container: { background: '#111' } },
          }}
        />
      </div>
    </div>
  );
};

export default PLByMonthHeatmap;
