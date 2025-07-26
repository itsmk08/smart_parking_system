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
    fetchDailyEntries()
    fetchDailyExits()
    fetchDailyRevenue()
    const interval = setInterval(() => {
      fetchStats()
      fetchDailyEntries()
      fetchDailyExits()
      fetchDailyRevenue()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard/stats")
      setStats(prev => ({
        ...prev,
        totalParked: response.data.totalParked,
        vehicleTypes: response.data.vehicleTypes

      }))
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyEntries = async () => {
    try {
      const response = await api.get("/dashboard/daily-entries")
      if (response.data.success) {
        const today = new Date().toISOString().slice(0, 10)
        const todayEntry = response.data.data.find(row => row.date === today)
        setStats(prev => ({ ...prev, todayEntries: todayEntry ? todayEntry.count : 0 }))
      }
    } catch (error) {
      console.error("Error fetching daily entries:", error)
    }
  }

  const fetchDailyExits = async () => {
    try {
      const response = await api.get("/dashboard/daily-exits");
      if (response.data.success) {
        const today = new Date().toISOString().slice(0, 10);
        const todayExit = response.data.data.find(row => row.date === today);
        setStats(prev => ({ ...prev, todayExits: todayExit ? todayExit.count : 0 }));
      }
    } catch (error) {
      console.error("Error fetching daily exits:", error);
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const response = await api.get("/dashboard/daily-revenue");
      if (response.data.success) {
        const today = new Date().toISOString().slice(0, 10);
        const todayRevenue = response.data.data.find(row => row.date === today);
        setStats(prev => ({ ...prev, totalRevenue: todayRevenue ? todayRevenue.total : 0 }));
      }
    } catch (error) {
      console.error("Error fetching daily revenue:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <StatsCards stats={stats} loading={loading} />
        <RecentActivity />
        
      </div>
    </Layout>
  )
}

export default Dashboard
// Get daily exit counts from exitvehicles

