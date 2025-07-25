const express = require("express")
const EntryVehicle = require("../models/EntryVehicle")
const ExitVehicle = require("../models/ExitVehicle")
const authenticateToken = require("../middleware/auth")
const mongoose = require("mongoose")
const AllVehicle = require("../models/AllVehicles")

const router = express.Router()

// Get parked vehicles
router.get("/parked", authenticateToken, async (req, res) => {
  try {
    const vehicles = await EntryVehicle.find({ status: "parked" }).sort({ entryTime: -1 })

    // Calculate duration for each vehicle
    const vehiclesWithDuration = vehicles.map((vehicle) => {
      const entryTime = new Date(vehicle.entryTime)
      const currentTime = new Date()
      const durationMs = currentTime - entryTime
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

      return {
        ...vehicle.toObject(),
        duration: `${hours}h ${minutes}m`,
      }
    })

    res.json(vehiclesWithDuration)
  } catch (error) {
    console.error("Error fetching parked vehicles:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get parking history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const exitedVehicles = await ExitVehicle.find().sort({ exitTime: -1 })
    const parkedVehicles = await AllVehicle.find({ status: "parked" })
    // Format parked vehicles as active history records
    const activeRecords = parkedVehicles.map((vehicle) => {
      const entryTime = new Date(vehicle.entryTime)
      const currentTime = new Date()
      const durationMs = currentTime - entryTime
      const totalMinutes = Math.ceil(durationMs / (1000 * 60))
      const fare = totalMinutes * 0.8
      return {
        licensePlate: vehicle.licensePlate,
        entryTime: vehicle.entryTime,
        exitTime: null,
        duration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        fare: fare,
        status: "parked",
        image: vehicle.image,
      }
    })
    // Format exited vehicles
    const exitedRecords = exitedVehicles.map((vehicle) => ({
      licensePlate: vehicle.licensePlate,
      entryTime: vehicle.entryTime,
      exitTime: vehicle.exitTime,
      duration: vehicle.duration,
      fare: vehicle.amount,
      status: "exited",
      image: vehicle.image,
    }))
    const allHistory = [...exitedRecords, ...activeRecords]
    res.json(allHistory)
  } catch (error) {
    console.error("Error fetching history:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get recent entries
router.get("/recent-entries", authenticateToken, async (req, res) => {
  try {
    const recentEntries = await EntryVehicle.find().sort({ entryTime: -1 }).limit(5)

    res.json(recentEntries)
  } catch (error) {
    console.error("Error fetching recent entries:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get recent exits
router.get("/recent-exits", authenticateToken, async (req, res) => {
  try {
    const recentExits = await ExitVehicle.find().sort({ exitTime: -1 }).limit(5)

    res.json(recentExits)
  } catch (error) {
    console.error("Error fetching recent exits:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Add vehicle entry (for IoT integration)
router.post("/entry", async (req, res) => {
  try {
    const { licensePlate, imageUrl } = req.body
    if (!licensePlate || licensePlate.length < 3) {
      return res.status(400).json({ success: false, message: "Invalid license plate" })
    }
    const existingEntry = await AllVehicle.findOne({ licensePlate: licensePlate.toUpperCase(), status: "parked" })
    if (!existingEntry) {
      const newVehicle = new AllVehicle({
        licensePlate: licensePlate.toUpperCase(),
        entryTime: new Date(),
        status: "parked",
        image: imageUrl,
      })
      await newVehicle.save()
      return res.json({ success: true, message: "Vehicle entry recorded successfully", data: newVehicle })
    } else {
      const entryTime = new Date(existingEntry.entryTime)
      const exitTime = new Date()
      const durationMs = exitTime - entryTime
      const totalMinutes = Math.ceil(durationMs / (1000 * 60))
      const fare = totalMinutes * 0.8
      const vehicleExit = new ExitVehicle({
        licensePlate: existingEntry.licensePlate,
        entryTime: existingEntry.entryTime,
        exitTime,
        duration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        totalMinutes,
        amount: fare,
        image: imageUrl,
        status: "exited"
      })
      await vehicleExit.save()
      // await AllVehicle.deleteOne({ _id: existingEntry._id }) // Do not delete from AllVehicle (immutable)
      return res.json({ success: true, message: "Vehicle exited and fare calculated", data: vehicleExit })
    }
  } catch (error) {
    console.error("Error adding vehicle entry/exit:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Add vehicle exit (for IoT integration)
router.post("/exit", async (req, res) => {
  try {
    const { licensePlate, cameraId, imageUrl, confidence } = req.body

    // Validate license plate
    if (!licensePlate || licensePlate.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Invalid license plate",
      })
    }

    // Find the entry record
    const entryRecord = await EntryVehicle.findOne({
      licensePlate: licensePlate.toUpperCase(),
      status: "parked",
    })

    if (!entryRecord) {
      return res.status(400).json({
        success: false,
        message: "No entry record found for this vehicle",
      })
    }

    // Calculate duration and billing
    const entryTime = new Date(entryRecord.entryTime)
    const exitTime = new Date()
    const durationMs = exitTime - entryTime
    const totalMinutes = Math.ceil(durationMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const duration = `${hours}h ${minutes}m`

    // Calculate billing amount
    const billingRates = { Car: 5.0, SUV: 6.0, Motorcycle: 3.0, Truck: 8.0 }
    const hourlyRate = billingRates[entryRecord.vehicleType] || 5.0
    const amount = Math.max(1, Math.ceil(totalMinutes / 60)) * hourlyRate // Minimum 1 hour

    // Create exit record
    const vehicleExit = new ExitVehicle({
      licensePlate: licensePlate.toUpperCase(),
      entryTime: entryRecord.entryTime,
      exitTime,
      duration,
      totalMinutes,
      amount,
      vehicleType: entryRecord.vehicleType,
      cameraId: cameraId || entryRecord.cameraId,
      entryImageUrl: entryRecord.imageUrl,
      exitImageUrl: imageUrl,
      confidence: confidence || 0.8,
    })

    await vehicleExit.save()

    // Update entry record status
    entryRecord.status = "exited"
    await entryRecord.save()

    res.json({
      success: true,
      message: "Vehicle exit recorded successfully",
      data: {
        ...vehicleExit.toObject(),
        bill: {
          licensePlate: licensePlate.toUpperCase(),
          entryTime: entryRecord.entryTime,
          exitTime,
          duration,
          amount,
          vehicleType: entryRecord.vehicleType,
        },
      },
    })
  } catch (error) {
    console.error("Error adding vehicle exit:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get all entry vehicles from enteredVehicles table using same database connection
router.get("/all-entries", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 Fetching entries from enteredVehicles table...")
    console.log("User authenticated:", req.user?.email || req.user?.username)

    // Use the existing mongoose connection to access allvehicles collection
    const db = mongoose.connection.db

    console.log("📊 Querying allvehicles collection...");
    const allEntriesRaw = await db.collection("allvehicles").find({}).sort({ entryTime: -1 }).toArray();

    // Map raw data to frontend schema
    const allEntries = allEntriesRaw.map(entry => ({
      licensePlate: entry.licensePlate || "N/A",
      entryTime: entry.entryTime || null,
      exitTime: entry.exitTime || null,
      status: entry.status || "parked",
      duration: typeof entry.duration === 'number' ? entry.duration : null,
      amount: typeof entry.fare === 'number' ? entry.fare : 0,
      imageUrl: entry.image || null,
      _id: entry._id
    }));

    console.log(`📈 Found ${allEntries.length} records in allvehicles collection`)

    // If no data found, let's check what's available
    if (allEntries.length === 0) {
      console.log("🔍 No data found, checking database structure...")

      try {
        const collections = await db.listCollections().toArray()
        console.log(
          "📁 Available collections:",
          collections.map((c) => c.name),
        )

        // Check if enteredVehicles collection exists and get sample document
        const sampleDoc = await db.collection("entryvehicles").findOne()
        if (sampleDoc) {
          console.log("📄 Sample document structure:", Object.keys(sampleDoc))
        } else {
          console.log("📄 enteredVehicles collection is empty")
        }

        // Get collection stats
        const stats = await db.collection("entryvehicles").stats()
        console.log("📊 Collection stats:", { count: stats.count, size: stats.size })
      } catch (statsError) {
        console.log("⚠️ Could not get collection info:", statsError.message)
      }
    }

    // Return the data with additional metadata
    res.json({
      success: true,
      data: allEntries,
      metadata: {
        count: allEntries.length,
        database: mongoose.connection.name,
        collection: "allvehicles",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching entries from enteredVehicles table:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch data from enteredVehicles table",
      error: error.message,
      details: {
        database: mongoose.connection.name,
        collection: "entryvehicles",
        timestamp: new Date().toISOString(),
      },
    })
  }
})

// Get all exit vehicles from exitVehicles table using same database connection
router.get("/all-exits", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 Fetching exits from exitvehicles table...")

    // Use the existing mongoose connection to access exitVehicles collection
    const db = mongoose.connection.db

    console.log("📊 Querying exitvehicles collection...");
    const allExitsRaw = await db.collection("exitvehicles").find({}).sort({ exit_timestamp: -1 }).toArray();

    // Map raw data to frontend schema
    const allExits = allExitsRaw.map(exit => ({
      licensePlate: exit.detected_text || "N/A",
      entryTime: exit.entry_timestamp || null,
      exitTime: exit.exit_timestamp || null,
      duration: exit.duration || null,
      amount: typeof exit.amount === 'number' ? exit.amount : 0,
      vehicleType: exit.vehicleType || "Unknown",
      cameraId: exit.cameraId || "N/A",
      confidence: typeof exit.confidence === 'number' ? exit.confidence : 1,
      entryImageUrl: exit.image_entry || null,
      exitImageUrl: exit.image_exit || null,
      totalMinutes: exit.totalMinutes || 0,
      _id: exit._id
    }));

    console.log(`📈 Found ${allExits.length} records in exitvehicles collection`)

    res.json({
      success: true,
      data: allExits,
      metadata: {
        count: allExits.length,
        database: mongoose.connection.name,
        collection: "exitvehicles",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching exits from exitvehicles table:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch data from exitvehicles table",
      error: error.message,
      details: {
        database: mongoose.connection.name,
        collection: "exitvehicles",
        timestamp: new Date().toISOString(),
      },
    })
  }
})

// Test endpoint to check database connection and collections
router.get("/test-connection", authenticateToken, async (req, res) => {
  try {
    const db = mongoose.connection.db
    const dbName = mongoose.connection.name

    console.log("🧪 Testing connection to database:", dbName)

    // List all collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Check specific collections
    const enteredVehiclesCount = await db.collection("entryvehicles").countDocuments()
    const exitVehiclesCount = await db.collection("exitvehicles").countDocuments()

    // Get sample documents
    const sampleEnteredVehicle = await db.collection("entryvehicles").findOne()
    const sampleExitVehicle = await db.collection("exitvehicles").findOne()

    res.json({
      success: true,
      message: "Database connection successful",
      database: dbName,
      collections: collectionNames,
      data: {
        enteredVehicles_count: enteredVehiclesCount,
        exitVehicles_count: exitVehiclesCount,
        sample_entered_vehicle: sampleEnteredVehicle ? Object.keys(sampleEnteredVehicle) : null,
        sample_exit_vehicle: sampleExitVehicle ? Object.keys(sampleExitVehicle) : null,
        sample_entered_data: sampleEnteredVehicle,
        sample_exit_data: sampleExitVehicle,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("🚨 Database connection test failed:", error)
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      database: mongoose.connection.name,
      timestamp: new Date().toISOString(),
    })
  }
})

module.exports = router
