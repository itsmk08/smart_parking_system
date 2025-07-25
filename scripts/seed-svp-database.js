// Seed script for SVP database with sample data
const mongoose = require("mongoose")
require("dotenv").config()

const SVP_MONGODB_URI = process.env.SVP_MONGODB_URI || "mongodb://localhost:27017/SVP"

// Sample data for entryvehicles collection
const sampleEntryVehicles = [
  {
    licensePlate: "ABC123",
    entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    vehicleType: "Car",
    cameraId: "CAM001",
    status: "parked",
    confidence: 0.95,
    imageUrl: "https://example.com/images/abc123_entry.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "XYZ789",
    entryTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    vehicleType: "SUV",
    cameraId: "CAM001",
    status: "parked",
    confidence: 0.88,
    imageUrl: "https://example.com/images/xyz789_entry.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "DEF456",
    entryTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    vehicleType: "Motorcycle",
    cameraId: "CAM002",
    status: "exited",
    confidence: 0.92,
    imageUrl: "https://example.com/images/def456_entry.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "GHI012",
    entryTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    vehicleType: "Truck",
    cameraId: "CAM003",
    status: "parked",
    confidence: 0.87,
    imageUrl: "https://example.com/images/ghi012_entry.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "JKL345",
    entryTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    vehicleType: "Car",
    cameraId: "CAM001",
    status: "exited",
    confidence: 0.93,
    imageUrl: "https://example.com/images/jkl345_entry.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Sample data for exitvehicles collection
const sampleExitVehicles = [
  {
    licensePlate: "DEF456",
    entryTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    exitTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    duration: "3h 30m",
    totalMinutes: 210,
    amount: 10.5,
    vehicleType: "Motorcycle",
    cameraId: "CAM002",
    entryImageUrl: "https://example.com/images/def456_entry.jpg",
    exitImageUrl: "https://example.com/images/def456_exit.jpg",
    confidence: 0.91,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "JKL345",
    entryTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    exitTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: "6h 0m",
    totalMinutes: 360,
    amount: 30.0,
    vehicleType: "Car",
    cameraId: "CAM001",
    entryImageUrl: "https://example.com/images/jkl345_entry.jpg",
    exitImageUrl: "https://example.com/images/jkl345_exit.jpg",
    confidence: 0.89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "MNO678",
    entryTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    exitTime: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    duration: "2h 15m",
    totalMinutes: 135,
    amount: 15.0,
    vehicleType: "SUV",
    cameraId: "CAM003",
    entryImageUrl: "https://example.com/images/mno678_entry.jpg",
    exitImageUrl: "https://example.com/images/mno678_exit.jpg",
    confidence: 0.94,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedSVPDatabase() {
  let connection = null
  try {
    console.log("Connecting to SVP database...")
    console.log("URI:", SVP_MONGODB_URI)

    connection = mongoose.createConnection(SVP_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    // Wait for connection
    await new Promise((resolve, reject) => {
      connection.on("connected", () => {
        console.log("Connected to SVP database successfully")
        resolve()
      })
      connection.on("error", (err) => {
        console.error("SVP database connection error:", err)
        reject(err)
      })
    })

    // Define schemas
    const EntryVehicleSchema = new mongoose.Schema({}, { strict: false, collection: "entryvehicles" })
    const ExitVehicleSchema = new mongoose.Schema({}, { strict: false, collection: "exitvehicles" })

    const EntryVehicle = connection.model("EntryVehicle", EntryVehicleSchema)
    const ExitVehicle = connection.model("ExitVehicle", ExitVehicleSchema)

    // Clear existing data
    console.log("Clearing existing data...")
    await EntryVehicle.deleteMany({})
    await ExitVehicle.deleteMany({})

    // Insert sample data
    console.log("Inserting sample entry vehicles...")
    await EntryVehicle.insertMany(sampleEntryVehicles)
    console.log(`Inserted ${sampleEntryVehicles.length} entry vehicles`)

    console.log("Inserting sample exit vehicles...")
    await ExitVehicle.insertMany(sampleExitVehicles)
    console.log(`Inserted ${sampleExitVehicles.length} exit vehicles`)

    // Verify data
    const entryCount = await EntryVehicle.countDocuments()
    const exitCount = await ExitVehicle.countDocuments()

    console.log("\n✅ SVP Database seeded successfully!")
    console.log(`📊 Statistics:`)
    console.log(`   - Entry Vehicles: ${entryCount}`)
    console.log(`   - Exit Vehicles: ${exitCount}`)
    console.log(`   - Total Records: ${entryCount + exitCount}`)

    // List all collections to verify
    const collections = await connection.db.listCollections().toArray()
    console.log(
      `📁 Collections in SVP database:`,
      collections.map((c) => c.name),
    )
  } catch (error) {
    console.error("❌ Error seeding SVP database:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.close()
      console.log("Database connection closed")
    }
    process.exit(0)
  }
}

// Run the seed function
seedSVPDatabase()
