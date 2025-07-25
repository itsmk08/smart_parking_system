import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import HistoryTable from "../components/HistoryTable";
import api from "../services/api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/vehicles/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((record) =>
    record.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "License Plate,Entry Time,Exit Time,Duration,Fare (Rs.)\n" +
      filteredHistory
        .map(
          (record) =>
            `${record.licensePlate},${record.entryTime},${record.exitTime || "Still parked"},${record.duration},${Number(record.amount ?? 0).toFixed(2)}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "parking_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parking History</h1>
          </div>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>


        <HistoryTable history={filteredHistory} loading={loading} />
      </div>
    </Layout>
  );
};

export default History;
