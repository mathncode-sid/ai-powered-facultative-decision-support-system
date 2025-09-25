'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/lib/constants';

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesDataPoint {
  date: string;
  value: number;
  secondaryValue?: number;
}

interface PortfolioChartProps {
  type: 'pie' | 'bar' | 'line';
  title: string;
  data: ChartDataPoint[] | TimeSeriesDataPoint[];
  height?: number;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const PortfolioChart: React.FC<PortfolioChartProps> = ({
  type,
  title,
  data,
  height = 300,
  showLegend = true,
  valueFormatter = formatCurrency,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'pie':
        const pieData = data as ChartDataPoint[];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatPercentage((entry.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => valueFormatter(value)} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        const barData = data as ChartDataPoint[];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={valueFormatter} />
              <Tooltip formatter={(value: number) => valueFormatter(value)} />
              {showLegend && <Legend />}
              <Bar dataKey="value" fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        const lineData = data as TimeSeriesDataPoint[];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={valueFormatter} />
              <Tooltip formatter={(value: number) => valueFormatter(value)} />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              {lineData.some(d => d.secondaryValue !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="secondaryValue"
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

// Specific chart components for common use cases
export const ExposureByClassChart: React.FC = () => {
  const data: ChartDataPoint[] = [
    { name: 'Property', value: 850000000 },
    { name: 'Marine', value: 420000000 },
    { name: 'Energy', value: 380000000 },
    { name: 'Aviation', value: 290000000 },
    { name: 'Liability', value: 160000000 },
    { name: 'Engineering', value: 120000000 },
  ];

  return (
    <PortfolioChart
      type="pie"
      title="Exposure by Class of Business"
      data={data}
      valueFormatter={formatCurrency}
    />
  );
};

export const ExposureByGeographyChart: React.FC = () => {
  const data: ChartDataPoint[] = [
    { name: 'Kenya', value: 680000000 },
    { name: 'Nigeria', value: 520000000 },
    { name: 'South Africa', value: 450000000 },
    { name: 'Ghana', value: 280000000 },
    { name: 'Tanzania', value: 190000000 },
    { name: 'Other', value: 100000000 },
  ];

  return (
    <PortfolioChart
      type="bar"
      title="Exposure by Geography"
      data={data}
      valueFormatter={formatCurrency}
    />
  );
};

export const PremiumTrendChart: React.FC = () => {
  const data: TimeSeriesDataPoint[] = [
    { date: 'Jan', value: 12500000, secondaryValue: 11800000 },
    { date: 'Feb', value: 13200000, secondaryValue: 12300000 },
    { date: 'Mar', value: 14800000, secondaryValue: 13900000 },
    { date: 'Apr', value: 13600000, secondaryValue: 12800000 },
    { date: 'May', value: 15200000, secondaryValue: 14100000 },
    { date: 'Jun', value: 16800000, secondaryValue: 15600000 },
  ];

  return (
    <PortfolioChart
      type="line"
      title="Premium Trends (Current vs Previous Year)"
      data={data}
      valueFormatter={formatCurrency}
      height={400}
    />
  );
};

export const LossRatioChart: React.FC = () => {
  const data: TimeSeriesDataPoint[] = [
    { date: 'Q1 2023', value: 72.5 },
    { date: 'Q2 2023', value: 68.3 },
    { date: 'Q3 2023', value: 75.1 },
    { date: 'Q4 2023', value: 71.8 },
    { date: 'Q1 2024', value: 69.2 },
    { date: 'Q2 2024', value: 66.7 },
  ];

  return (
    <PortfolioChart
      type="line"
      title="Loss Ratio Trends (%)"
      data={data}
      valueFormatter={formatPercentage}
    />
  );
};

export default PortfolioChart;