const HistoryTable = ({ history, loading }) => {
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Parking History ({history.length} records)
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No parking history available
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fare (Rs.)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const isParked = record.status === "parked";

                  const entryDate = record.entryTime
                    ? new Date(record.entryTime).toISOString().slice(0, 10)
                    : "-";

                  const entryTime = record.entryTime
                    ? new Date(record.entryTime).toLocaleTimeString("en-US", {
                        hour12: true,
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        timeZone: "UTC",
                      })
                    : "-";

                  const exitDate =
                    !isParked && record.exitTime
                      ? new Date(record.exitTime).toISOString().slice(0, 10)
                      : "-";

                  const exitTime =
                    !isParked && record.exitTime
                      ? new Date(record.exitTime).toLocaleTimeString("en-US", {
                          hour12: true,
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: "UTC",
                        })
                      : "-";

                  const duration = isParked ? "-" : record.duration || "-";
                  const fare = isParked
                    ? "-"
                    : `Rs. ${Number(record.amount ?? 0).toFixed(2)}`;

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{record.licensePlate}</td>
                      <td className="py-3 px-4 text-gray-600">{entryDate}</td>
                      <td className="py-3 px-4 text-gray-600">{entryTime}</td>
                      <td className="py-3 px-4 text-gray-600">{exitDate}</td>
                      <td className="py-3 px-4 text-gray-600">{exitTime}</td>
                      <td className="py-3 px-4 text-gray-600">{duration}</td>
                      <td className="py-3 px-4 font-medium">{fare}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isParked
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isParked ? "Parked" : "Exited"}
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

export default HistoryTable;
