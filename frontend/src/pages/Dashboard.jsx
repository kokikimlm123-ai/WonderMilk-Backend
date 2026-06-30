import React from 'react';
import { useApi } from '../hooks/useApi';
import { dashboardAPI } from '../lib/api';
import { MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function Dashboard() {
  const { data: metrics, loading, error, refetch } = useApi(
    () => dashboardAPI.getMetrics(),
    []
  );

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!metrics?.data) return <ErrorMessage message="No data available" />;

  const m = metrics.data;

console.log("Dashboard Metrics:", m);

return (
    <div className="space-y-8">
<div className="bg-gradient-to-r from-blue-800 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
  <h2 className="text-3xl font-bold">
    Wonder Milk NIR Analytics Dashboard
  </h2>

  <p className="mt-2">
    Total Samples: {m.totalSamples} | Feed Types: {m.feedTypeCount}
  </p>

  <p className="mt-1 text-blue-100">
    Last Updated: {new Date(m.lastUpdated).toLocaleString()}
  </p>
</div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Wonder Milk NIR Database Overview</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Samples" value={m.totalSamples} icon="📊" />
        <MetricCard title="Feed Types" value={m.feedTypeCount} icon="🌾" />
        <MetricCard title="Average CP" value={m.averageCP} unit="%" icon="🥛" />
        <MetricCard title="Average NDF" value={m.averageNDF} unit="%" icon="📈" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Average ADF" value={m.averageADF} unit="%" icon="📉" />
        <MetricCard title="Average Starch" value={m.averageStarch} unit="%" icon="🌽" />
        <MetricCard title="Average Fat" value={m.averageFat} unit="%" icon="🧈" />
        <MetricCard title="Average ASH" value={m.averageAsh} unit="%" icon="🪨" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feed Type Distribution</h2>
        <div className="space-y-4">
          {Object.entries(m.feedTypeDistribution || {}).map(([type, count]) => {
            const percentage = ((count / m.totalSamples) * 100).toFixed(1);
            return (
              <div key={type} className="flex items-center justify-between">
                <span className="font-medium text-gray-700 w-32">{type}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    Feed Type Summary
  </h2>

  <table className="min-w-full border border-gray-200">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 border">Feed Type</th>
        <th className="px-4 py-2 border">Samples</th>
        <th className="px-4 py-2 border">Percentage</th>
      </tr>
    </thead>

    <tbody>
      {Object.entries(m.feedTypeDistribution || {}).map(([type, count]) => (
        <tr key={type}>
          <td className="px-4 py-2 border">{type}</td>
          <td className="px-4 py-2 border text-center">{count}</td>
          <td className="px-4 py-2 border text-center">
            {((count / m.totalSamples) * 100).toFixed(1)}%
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(m.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
