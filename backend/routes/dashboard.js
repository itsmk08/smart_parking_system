const express = require("express")
const EntryVehicle = require("../models/EntryVehicle")
const ExitVehicle = require("../models/ExitVehicle")
const authenticateToken = require("../middleware/auth")
const mongoose = require("mongoose");


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

    let totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    if (totalRevenue === 0) {
      // Fallback: fetch from exitvehicles table
      const fallbackRevenue = await ExitVehicle.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      totalRevenue = fallbackRevenue.length > 0 ? fallbackRevenue[0].total : 0;
    }

    // Get vehicle type distribution
    const vehicleTypes = await EntryVehicle.aggregate([
      { $match: { status: "parked" } },
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    ])

    res.json({
      totalParked,
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

// Get daily entry counts from allvehicles
router.get("/daily-entries", authenticateToken, async (req, res) => {
  try {
    const mongooseDb = require("mongoose").connection.db;
    const dailyCounts = await mongooseDb.collection("allvehicles").aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$entryTime" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();
    // Map to { date, count }
    const result = dailyCounts.map(row => ({ date: row._id, count: row.count }));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch daily entries", error: error.message });
  }
});

router.get("/daily-exits", authenticateToken, async (req, res) => {
  try {
    const mongooseDb = require("mongoose").connection.db;
    const dailyCounts = await mongooseDb.collection("exitvehicles").aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$exitTime" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();
    // Map to { date, count }
    const result = dailyCounts.map(row => ({ date: row._id, count: row.count }));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch daily exits", error: error.message });
  }
});

// Get daily revenue from exitvehicles
router.get("/daily-revenue", authenticateToken, async (req, res) => {
  try {
    const mongooseDb = require("mongoose").connection.db;
    const dailyRevenue = await mongooseDb.collection("exitvehicles").aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$exitTime" }
          },
          total: { $sum: { $ifNull: ["$fare", "$amount"] } }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();
    // Map to { date, total }
    const result = dailyRevenue.map(row => ({ date: row._id, total: row.total }));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch daily revenue", error: error.message });
  }
});

module.exports = router
