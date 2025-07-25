"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const RecentActivity = () => {
  const [recentEntries, setRecentEntries] = useState([])
  const [recentExits, setRecentExits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
    const interval = setInterval(fetchRecentActivity, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const [entriesResponse, exitsResponse] = await Promise.all([
        api.get("/vehicles/recent-entries"),
        api.get("/vehicles/recent-exits"),
      ])

      setRecentEntries(entriesResponse.data)
      setRecentExits(exitsResponse.data)
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Entries */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Entries</h3>
        {recentEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent entries</p>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{entry.licensePlate}</div>
                  <div className="text-sm text-gray-600">{new Date(entry.entryTime).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Camera: {entry.cameraId}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {entry.vehicleType}
                  </span>
                  {entry.confidence && (
                    <div className="text-xs text-gray-500 mt-1">{Math.round(entry.confidence * 100)}% confidence</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Exits */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Exits</h3>
        {recentExits.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent exits</p>
        ) : (
          <div className="space-y-3">
            {recentExits.map((exit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{exit.licensePlate}</div>
                  <div className="text-sm text-gray-600">{new Date(exit.exitTime).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Duration: {exit.duration}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${exit.amount}</span>
                  <div className="text-xs text-gray-500 mt-1">{exit.vehicleType}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity
