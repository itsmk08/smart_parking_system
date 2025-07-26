const ExitedVehiclesTable = ({ vehicles, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-700 font-bold text-lg">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Exits Found</h3>
            <p className="text-gray-600 mb-4">The exitVehicles table is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">License Plate</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Entry Date</th>
                  <th className="py-3 px-4 font-medium text-gray-900">Entry Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exit Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exit Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fare</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => {
                  const isParked = vehicle.status === 'parked';
                  const entry = new Date(vehicle.entryTime);
                  const exit = vehicle.exitTime ? new Date(vehicle.exitTime) : null;

                  let durationFormatted = '-';
                  if (!isParked && entry && exit) {
                    const totalMinutes = Math.ceil((exit - entry) / (1000 * 60));
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    durationFormatted = `${hours}h ${minutes}m`;
                  }

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{vehicle.licensePlate}</td>

                      <td className="py-3 px-4 text-gray-600">
                        {vehicle.entryTime
                          ? entry.toLocaleDateString('en-CA', { timeZone: 'UTC' })
                          : '-'}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {vehicle.entryTime
                          ? entry.toLocaleTimeString('en-US', {
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZone: 'UTC',
                            })
                          : '-'}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {isParked || !exit
                          ? '-'
                          : exit.toLocaleDateString('en-CA', { timeZone: 'UTC' })}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {isParked || !exit
                          ? '-'
                          : exit.toLocaleTimeString('en-US', {
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZone: 'UTC',
                            })}
                      </td>

                      <td className="py-3 px-4 text-gray-600">{durationFormatted}</td>

                      <td className="py-3 px-4 font-medium">
                        {isParked
                          ? '-'
                          : `Rs. ${(vehicle.fare ?? vehicle.amount ?? 0).toFixed(2)}`}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isParked
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isParked ? 'Parked' : 'Exited'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitedVehiclesTable;
