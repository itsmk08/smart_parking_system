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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">exitVehicles Table ({vehicles.length} records)</h3>
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Entry Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exit Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Entry Image</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exit Image</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => {
                  let durationDisplay = "N/A"
                  if (vehicle.entryTime && vehicle.exitTime) {
                    const entryTime = new Date(vehicle.entryTime)
                    const exitTime = new Date(vehicle.exitTime)
                    let durationMs = exitTime - entryTime
                    let totalMinutes = Math.floor(durationMs / (1000 * 60))
                    if (totalMinutes < 0) totalMinutes = 0
                    const hours = Math.floor(totalMinutes / 60)
                    const minutes = totalMinutes % 60
                    if (hours > 0) {
                      durationDisplay = `${hours}h ${minutes}m`
                    } else {
                      durationDisplay = `${minutes}m`
                    }
                  }
                  return (
                  <tr key={vehicle._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {vehicle.licensePlate || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {vehicle.entryTime ? (
                        <div>
                          <div>{new Date(vehicle.entryTime).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(vehicle.entryTime).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {vehicle.exitTime ? (
                        <div>
                          <div>{new Date(vehicle.exitTime).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(vehicle.exitTime).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{durationDisplay}</td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      ${vehicle.amount ? vehicle.amount.toFixed(2) : "0.00"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {vehicle.entryImageUrl ? (
                        <a
                          href={vehicle.entryImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🖼️ View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {vehicle.exitImageUrl ? (
                        <a
                          href={vehicle.exitImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🖼️ View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExitedVehiclesTable
