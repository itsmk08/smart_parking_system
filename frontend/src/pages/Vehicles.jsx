"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import VehicleTable from "../components/VehicleTable"
import api from "../services/api"

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchVehicles()
    const interval = setInterval(fetchVehicles, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles/parked")
      setVehicles(response.data)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parked Vehicles</h1>
            <p className="text-gray-600">Vehicles currently parked in the system</p>
          </div>
          <button
            onClick={fetchVehicles}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
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

        <VehicleTable vehicles={filteredVehicles} loading={loading} />
      </div>
    </Layout>
  )
}

export default Vehicles
