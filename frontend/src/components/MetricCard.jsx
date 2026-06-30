export function MetricCard({ title, value, unit = '', icon = '📊' }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
            {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
