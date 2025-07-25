import { useEffect, useState } from "react";

const VehicleTable = ({ vehicles, loading }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Vehicles ({vehicles.length})</h3>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No vehicles currently parked</div>
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
                  let currentCharge = 0;
                  let totalMinutes = 0;
                  if (vehicle.entryTime) {
                    const entryTime = new Date(vehicle.entryTime);
                    const currentTime = new Date(now);
                    let durationMs = currentTime - entryTime;
                    totalMinutes = Math.floor(durationMs / (1000 * 60));
                    if (totalMinutes < 0) totalMinutes = 0;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    if (hours > 0) {
                      currentDuration = `${hours}h ${minutes}m`;
                    } else {
                      currentDuration = `${minutes}m`;
                    }
                    currentCharge = totalMinutes * 1; // Rs. 1 per minute
                  }
                  return (
                    <tr key={vehicle._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {vehicle.licensePlate || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{vehicle.entryTime ? new Date(vehicle.entryTime).toISOString().slice(0,10) : ''}</td>
                      <td className="py-3 px-4 text-gray-600">{vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) : ''}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            vehicle.status === "parked"
                              ? "bg-green-100 text-green-800"
                              : vehicle.status === "exited"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {vehicle.status === "parked"
                            ? "🟢 Currently Parked"
                            : vehicle.status === "exited"
                              ? "🔴 Exited"
                              : vehicle.status || "Unknown"}
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
  );
};

export default VehicleTable;
