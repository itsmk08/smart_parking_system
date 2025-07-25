"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import EnteredVehiclesTable from "../components/EnteredVehiclesTable"
import api from "../services/api"

const EnteredVehicles = () => {
  const [enteredVehicles, setEnteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEnteredVehicles()
    const interval = setInterval(fetchEnteredVehicles, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchEnteredVehicles = async () => {
    try {
      setError("")
      console.log("🔄 Fetching entered vehicles from enteredVehicles table...")

      // Fetch all entry vehicles from enteredVehicles table
      const response = await api.get("/vehicles/all-entries")

      console.log("📊 API Response:", response.data)

      if (response.data.success) {
        setEnteredVehicles(response.data.data || [])
        console.log(`✅ Successfully loaded ${response.data.data?.length || 0} vehicles`)
      } else {
        setEnteredVehicles([])
        setError("Failed to fetch data from enteredVehicles table")
      }
    } catch (error) {
      console.error("❌ Error fetching entered vehicles:", error)
      setEnteredVehicles([])

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else if (error.response?.status === 500) {
        setError(`Server error: ${error.response?.data?.message || "Database connection failed"}`)
      } else {
        setError(`Network error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = enteredVehicles.filter((vehicle) =>
    vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "License Plate,Entry Time,Status,Image URL\n" +
      filteredVehicles
        .map(
          (vehicle) =>
            `${vehicle.licensePlate || "N/A"},${vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kathmandu' }) : "N/A"},${vehicle.status || "Unknown"},${vehicle.imageUrl || "No Image"}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `entered_vehicles_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Test database connection
  const testConnection = async () => {
    try {
      const response = await api.get("/vehicles/test-connection")
      console.log("🧪 Connection test result:", response.data)
      alert(
        `Connection test successful!\nDatabase: ${response.data.database}\nCollections: ${response.data.collections.join(", ")}\nenteredVehicles count: ${response.data.data.enteredVehicles_count}`,
      )
    } catch (error) {
      console.error("Connection test failed:", error)
      alert(`Connection test failed: ${error.response?.data?.message || error.message}`)
    }
  }

  // Calculate statistics
  const totalEntries = enteredVehicles.length
  const currentlyParked = enteredVehicles.filter((v) => v.status === "parked").length
  const alreadyExited = enteredVehicles.filter((v) => v.status === "exited").length

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entered Vehicles</h1>
            <p className="text-gray-600">All vehicles from enteredVehicles table (same database)</p>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Test DB
            </button>
            <button
              onClick={fetchEnteredVehicles}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </button>
            <button
              onClick={exportData}
              disabled={filteredVehicles.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Search by license plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currently Parked</p>
                <p className="text-2xl font-bold text-gray-900">{currentlyParked}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">🚪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Already Exited</p>
                <p className="text-2xl font-bold text-gray-900">{alreadyExited}</p>
              </div>
            </div>
          </div>
        </div>

        <EnteredVehiclesTable vehicles={filteredVehicles} loading={loading} error={error} />
      </div>
    </Layout>
  )
}

export default EnteredVehicles
