import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '@/app/(dashboard)/page.module.css';

interface TrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div className={`${styles.chartContainer} animate-fade-in-up stagger-3`} style={{ height: '350px' }}>
      <div className={styles.chartHeader}>
        <h2>Registration Trends</h2>
        <p className={styles.chartSubtitle}>New user growth over the last 7 days</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getDate()}/${d.getMonth()+1}`;
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="var(--accent-primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: 'var(--bg-secondary)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
