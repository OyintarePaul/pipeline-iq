'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartDataPoint {
  name: string;
  'Active Candidates': number;
  Placements: number;
}

interface RecruiterChartProps {
  data: ChartDataPoint[];
}

export function RecruiterChart({ data }: RecruiterChartProps) {
  return (
    <div className="h-72 w-full mt-4" id="performance-bar-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
          <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          <Bar dataKey="Active Candidates" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={16} />
          <Bar dataKey="Placements" fill="#10b981" radius={[2, 2, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}