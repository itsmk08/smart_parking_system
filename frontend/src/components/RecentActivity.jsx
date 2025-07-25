"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { startOfDay, endOfDay } from 'date-fns'

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

  // Calculate today's entries
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

  const todaysEntries = recentEntries.filter(entry => {
    if (!entry.entryTime) return false
    const entryDate = new Date(entry.entryTime)
    return entryDate >= todayStart && entryDate <= todayEnd
  }).length

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
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
                  <div className="text-xs text-gray-400">
                    {entry.entryTime ? new Date(entry.entryTime).toISOString().slice(0, 10) : ''}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.entryTime
                      ? new Date(entry.entryTime).toLocaleTimeString('en-US', {
                          hour12: true,
                          hour: 'numeric',
                          minute: '2-digit',
                          second: '2-digit',
                          timeZone: 'UTC',
                        })
                      : ''}
                  </div>
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
            {recentExits.map((exit, index) => {
              const amount = typeof exit.amount === 'number' ? exit.amount : (exit.fare || 0)
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{exit.licensePlate}</div>
                    <div className="text-xs text-gray-400">
                      {exit.exitTime ? new Date(exit.exitTime).toISOString().slice(0, 10) : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      {exit.exitTime
                        ? new Date(exit.exitTime).toLocaleTimeString('en-US', {
                            hour12: true,
                            hour: 'numeric',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZone: 'UTC',
                          })
                        : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      Duration: {exit.duration} minutes
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Rs. {amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity
