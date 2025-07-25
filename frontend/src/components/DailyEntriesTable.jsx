import { useEffect, useState } from "react";
import api from "../services/api";

const DailyEntriesTable = () => {
  const [dailyEntries, setDailyEntries] = useState([]);

  useEffect(() => {
    api.get("/vehicles/daily-entries").then(res => {
      if (res.data.success) setDailyEntries(res.data.data);
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Entries Per Day</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2 px-4">Date</th>
            <th className="text-left py-2 px-4">Entries</th>
          </tr>
        </thead>
        <tbody>
          {dailyEntries.map((row) => (
            <tr key={row._id}>
              <td className="py-2 px-4">{row._id}</td>
              <td className="py-2 px-4">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyEntriesTable;