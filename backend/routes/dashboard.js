const express = require("express")
const EntryVehicle = require("../models/EntryVehicle")
const ExitVehicle = require("../models/ExitVehicle")
const authenticateToken = require("../middleware/auth")

const router = express.Router()

// Get dashboard statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // Get current parked vehicles count
    const totalParked = await EntryVehicle.countDocuments({ status: "parked" })

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's entries
    const todayEntries = await EntryVehicle.countDocuments({
      entryTime: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    // Get today's exits
    const todayExits = await ExitVehicle.countDocuments({
      exitTime: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    // Get today's revenue
    const revenueResult = await ExitVehicle.aggregate([
      {
        $match: {
          exitTime: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Get vehicle type distribution
    const vehicleTypes = await EntryVehicle.aggregate([
      { $match: { status: "parked" } },
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    ])

    res.json({
      totalParked,
      todayEntries,
      todayExits,
      totalRevenue: Number.parseFloat(totalRevenue.toFixed(2)),
      vehicleTypes,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
