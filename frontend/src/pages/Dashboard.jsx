"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import StatsCards from "../components/StatsCards"
import RecentActivity from "../components/RecentActivity"
import api from "../services/api"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParked: 0,
    todayEntries: 0,
    todayExits: 0,
    totalRevenue: 0,
    vehicleTypes: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your smart parking system</p>
        </div>

        <StatsCards stats={stats} loading={loading} />
        <RecentActivity />
      </div>
    </Layout>
  )
}

export default Dashboard
