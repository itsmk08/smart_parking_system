const StatsCards = ({ stats, loading }) => {
  const statItems = [
    {
      title: "Currently Parked",
      value: stats.totalParked,
      icon: "🚗",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Today's Entries",
      value: stats.todayEntries,
      icon: "⬆️",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Today's Exits",
      value: stats.todayExits,
      icon: "⬇️",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Today's Revenue",
      value: `Rs. ${stats.totalRevenue.toFixed(2)}`,
      icon: "💰",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
            <div className={`p-3 rounded-full ${item.bgColor}`}>
              <span className="text-2xl">{item.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
