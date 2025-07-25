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
    const vehicles = await EntryVehicle.find({ status: "parked" }).sort({ entryTime: -1 });

    const currentTime = new Date();
    const vehiclesWithDuration = vehicles.map((vehicle) => {
      const entryTime = new Date(vehicle.entryTime);
      const durationMs = currentTime - entryTime;
      const totalMinutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return {
        licensePlate: vehicle.licensePlate,
        entryTime: vehicle.entryTime,
        status: vehicle.status,
        duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      };
    });

    res.json(vehiclesWithDuration);
  } catch (error) {
    console.error("Error fetching parked vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get parking history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const exitedVehicles = await ExitVehicle.find().sort({ exitTime: -1 });
    const parkedVehicles = await AllVehicle.find({ status: "parked" });
    const currentTime = new Date();

    // 🟢 Format parked vehicles (still inside)
    const activeRecords = parkedVehicles.map((vehicle) => {
      const entryTime = new Date(vehicle.entryTime);
      const durationMs = currentTime - entryTime;
      const totalMinutes = Math.ceil(durationMs / (1000 * 60));
      const amount = totalMinutes * 1.2;

      return {
        licensePlate: vehicle.licensePlate,
        entryTime: vehicle.entryTime,
        exitTime: null,
        duration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        amount: parseFloat(amount.toFixed(2)),
        status: "parked",
      };
    });

    // 🟢 Format exited vehicles (already left)
    const exitedRecords = exitedVehicles.map((vehicle) => {
      const entryTime = new Date(vehicle.entryTime);
      const exitTime = new Date(vehicle.exitTime);
      const totalMinutes = Math.ceil((exitTime - entryTime) / (1000 * 60));
      const fallbackAmount = totalMinutes * 1.2;

      return {
        licensePlate: vehicle.licensePlate || "N/A",
        entryTime: vehicle.entryTime,
        exitTime: vehicle.exitTime,
        duration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        amount: vehicle.fare
          ? parseFloat(vehicle.fare.toFixed(2))
          : vehicle.amount
          ? parseFloat(vehicle.amount.toFixed(2))
          : parseFloat(fallbackAmount.toFixed(2)),
        status: vehicle.status || "exited",
      };
    });

    const allHistory = [...exitedRecords, ...activeRecords];
    res.json(allHistory);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


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
    const recentExits = await ExitVehicle.find().sort({ exitTime: -1 }).limit(10)

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
    const { licensePlate } = req.body
    if (!licensePlate || licensePlate.length < 3) {
      return res.status(400).json({ success: false, message: "Invalid license plate" })
    }
    const existingEntry = await AllVehicle.findOne({ licensePlate: licensePlate.toUpperCase(), status: "parked" })
    if (!existingEntry) {
      const newVehicle = new AllVehicle({
        licensePlate: licensePlate.toUpperCase(),
        entryTime: new Date(),
        status: "parked",
      })
      await newVehicle.save()
      return res.json({ success: true, message: "Vehicle entry recorded successfully", data: newVehicle })
    } else {
      const entryTime = new Date(existingEntry.entryTime)
      const exitTime = new Date()
      const durationMs = exitTime - entryTime
      const totalMinutes = Math.ceil(durationMs / (1000 * 60))
      const fare = totalMinutes * 1;
      const vehicleExit = new ExitVehicle({
        licensePlate: existingEntry.licensePlate,
        entryTime: existingEntry.entryTime,
        exitTime,
        duration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        totalMinutes,
        amount: fare,
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
    const { licensePlate} = req.body

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
    const amount = totalMinutes * 1.2;

    // Create exit record
    const vehicleExit = new ExitVehicle({
      licensePlate: licensePlate.toUpperCase(),
      entryTime: entryRecord.entryTime,
      exitTime,
      duration,
      totalMinutes,
      amount,
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
// Get all exited vehicles from exitVehicles collection
router.get("/all-exits", authenticateToken, async (req, res) => {
  try {
    const exitedVehicles = await ExitVehicle.find().sort({ exitTime: -1 });
    res.json({ success: true, data: exitedVehicles });
  } catch (error) {
    console.error("Error fetching all exits:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

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

module.exports = router
