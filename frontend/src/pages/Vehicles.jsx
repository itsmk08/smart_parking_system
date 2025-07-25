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
          </div>
          <button
            onClick={fetchVehicles}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

       

        <VehicleTable vehicles={filteredVehicles} loading={loading} />
      </div>
    </Layout>
  )
}

export default Vehicles
