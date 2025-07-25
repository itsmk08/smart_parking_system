const EnteredVehiclesTable = ({ vehicles, loading, error, entryVehiclePlates = [] }) => {
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
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-sm text-gray-500">
              <p>Troubleshooting steps:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check if SVP database is running</li>
                <li>Verify SVP_MONGODB_URI in environment variables</li>
                <li>Ensure entryvehicles collection exists</li>
                <li>Check network connectivity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          
          <div className="text-sm text-gray-700 font-bold text-lg">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Entries Found</h3>
            <p className="text-gray-600 mb-4">The entryvehicles table in SVP database is empty.</p>
            
            
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">License Plate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Entry Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Entry Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => {
                  let currentDuration = "0m";
                  if (vehicle.entryTime) {
                    const entryTime = new Date(vehicle.entryTime);
                    const currentTime = new Date();
                    let durationMs = currentTime - entryTime;
                    let totalMinutes = Math.floor(durationMs / (1000 * 60));
                    if (totalMinutes < 0) totalMinutes = 0;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    if (hours > 0) {
                      currentDuration = `${hours}h ${minutes}m`;
                    } else {
                      currentDuration = `${minutes}m`;
                    }
                  }
                  // Show 'Exited' if vehicle.status === 'exited', otherwise 'Parking'
                  const status = vehicle.status === 'exited' ? 'exited' : 'parking';
                  return (
                    <tr key={vehicle._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {vehicle.licensePlate || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{vehicle.entryTime ? new Date(vehicle.entryTime).toISOString().slice(0,10) : ''}</td>
                      <td className="py-3 px-4 text-gray-600">{vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) : ''}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            status === "parking"
                              ? "bg-green-100 text-green-800"
                              : status === "exited"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status === "parking"
                            ? "🟢 Parking"
                            : status === "exited"
                              ? "🔴 Exited"
                              : status || "Unknown"}
                        </span>
                      </td>
                      
                      
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnteredVehiclesTable
