import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from '@/app/(dashboard)/page.module.css';

interface GenderPieChartProps {
  male: number;
  female: number;
}

export const GenderPieChart: React.FC<GenderPieChartProps> = ({ male, female }) => {
  const data = [
    { name: 'Male', value: male },
    { name: 'Female', value: female },
  ];

  const COLORS = ['var(--color-terracotta)', 'var(--color-ochre)'];

  return (
    <div className={`${styles.chartContainer} animate-fade-in-up stagger-4`} style={{ height: '350px' }}>
      <div className={styles.chartHeader}>
        <h2>Gender Distribution</h2>
        <p className={styles.chartSubtitle}>Active user breakdown by gender</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
