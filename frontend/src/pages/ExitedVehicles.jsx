"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import ExitedVehiclesTable from "../components/ExitedVehiclesTable"
import api from "../services/api"

const ExitedVehicles = () => {
  const [exitedVehicles, setExitedVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchExitedVehicles()
    const interval = setInterval(fetchExitedVehicles, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchExitedVehicles = async () => {
    try {
      setError("")
      console.log("🔄 Fetching exited vehicles from exitVehicles table...")
  
      const response = await api.get("/vehicles/all-exits")
  
      console.log("📊 API Response:", response.data)
  
      if (response.data.success) {
        setExitedVehicles(response.data.data || [])
        console.log(`✅ Successfully loaded ${response.data.data?.length || 0} vehicles`)
      } else {
        setExitedVehicles([])
        setError("Failed to fetch data from exitVehicles table")
      }
    } catch (error) {
      console.error("❌ Error fetching exited vehicles:", error)
      setExitedVehicles([])
  
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
  

  const filteredVehicles = exitedVehicles.filter((vehicle) =>
    vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalRevenue = exitedVehicles.reduce((sum, vehicle) => sum + (vehicle.amount || 0), 0)
  const averageStayTime =
    exitedVehicles.length > 0
      ? exitedVehicles.reduce((sum, vehicle) => sum + (vehicle.totalMinutes || 0), 0) / exitedVehicles.length
      : 0

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "License Plate,Entry Time,Exit Time,Duration,Amount\n" +
      filteredVehicles
        .map(
          (vehicle) =>
            `${vehicle.licensePlate || "N/A"},${vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) : "N/A"},${vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) : "N/A"},${vehicle.duration || "N/A"},${vehicle.amount || 0}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `exited_vehicles_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exited Vehicles</h1>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchExitedVehicles}
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

        

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">📤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exits</p>
                <p className="text-2xl font-bold text-gray-900">{exitedVehicles.length}</p>
              </div>
            </div>
          </div>
          
        </div>

        <ExitedVehiclesTable vehicles={filteredVehicles} loading={loading} error={error} />
      </div>
    </Layout>
  )
}

export default ExitedVehicles
