// MongoDB Connection Setup for Smart Parking System
// This file shows how to connect to MongoDB in a real MERN application

const { MongoClient } = require("mongodb")

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/SVP"

class DatabaseConnection {
  constructor() {
    this.client = null
    this.db = null
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })

      await this.client.connect()
      this.db = this.client.db("SVP")

      console.log("Connected to MongoDB successfully")

      // Create indexes for better performance
      await this.createIndexes()

      return this.db
    } catch (error) {
      console.error("MongoDB connection error:", error)
      throw error
    }
  }

  async createIndexes() {
    try {
      // Create indexes for entryVehicle collection
      await this.db.collection("entryVehicle").createIndex({ licensePlate: 1 })
      await this.db.collection("entryVehicle").createIndex({ entryTime: -1 })
      await this.db.collection("entryVehicle").createIndex({ status: 1 })

      // Create indexes for exitVehicle collection
      await this.db.collection("exitVehicle").createIndex({ licensePlate: 1 })
      await this.db.collection("exitVehicle").createIndex({ exitTime: -1 })
      await this.db.collection("exitVehicle").createIndex({ entryTime: 1 })

      // Create indexes for admin collection
      await this.db.collection("admin").createIndex({ username: 1 }, { unique: true })

      console.log("Database indexes created successfully")
    } catch (error) {
      console.error("Error creating indexes:", error)
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log("Disconnected from MongoDB")
    }
  }

  getDb() {
    return this.db
  }
}

// Database operations for the Smart Parking System
class ParkingDatabase {
  constructor(db) {
    this.db = db
  }

  // Entry Vehicle Operations
  async addVehicleEntry(vehicleData) {
    const collection = this.db.collection("entryVehicle")
    const result = await collection.insertOne({
      ...vehicleData,
      status: "parked",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return result
  }

  async getCurrentParkedVehicles() {
    const collection = this.db.collection("entryVehicle")
    return await collection.find({ status: "parked" }).sort({ entryTime: -1 }).toArray()
  }

  async getRecentEntries(limit = 5) {
    const collection = this.db.collection("entryVehicle")
    return await collection.find().sort({ entryTime: -1 }).limit(limit).toArray()
  }

  // Exit Vehicle Operations
  async addVehicleExit(exitData) {
    const collection = this.db.collection("exitVehicle")

    // Calculate duration and amount
    const entryTime = new Date(exitData.entryTime)
    const exitTime = new Date(exitData.exitTime)
    const durationMs = exitTime - entryTime
    const totalMinutes = Math.ceil(durationMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const duration = `${hours}h ${minutes}m`

    // Calculate billing amount (example: $5 per hour for cars)
    const billingRates = {
      Car: 5.0,
      SUV: 6.0,
      Motorcycle: 3.0,
      Truck: 8.0,
    }
    const hourlyRate = billingRates[exitData.vehicleType] || 5.0
    const amount = Math.ceil(totalMinutes / 60) * hourlyRate

    const result = await collection.insertOne({
      ...exitData,
      duration,
      totalMinutes,
      amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update entry vehicle status
    await this.db
      .collection("entryVehicle")
      .updateOne(
        { licensePlate: exitData.licensePlate, status: "parked" },
        { $set: { status: "exited", updatedAt: new Date() } },
      )

    return result
  }

  async getRecentExits(limit = 5) {
    const collection = this.db.collection("exitVehicle")
    return await collection.find().sort({ exitTime: -1 }).limit(limit).toArray()
  }

  async getParkingHistory() {
    const collection = this.db.collection("exitVehicle")
    return await collection.find().sort({ exitTime: -1 }).toArray()
  }

  // Statistics
  async getDashboardStats() {
    const currentParked = await this.db.collection("entryVehicle").countDocuments({ status: "parked" })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayEntries = await this.db.collection("entryVehicle").countDocuments({
      entryTime: { $gte: today },
    })

    const todayExits = await this.db.collection("exitVehicle").countDocuments({
      exitTime: { $gte: today },
    })

    const revenueResult = await this.db
      .collection("exitVehicle")
      .aggregate([{ $match: { exitTime: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
      .toArray()

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    return {
      totalParked: currentParked,
      todayEntries,
      todayExits,
      totalRevenue,
    }
  }
}

module.exports = { DatabaseConnection, ParkingDatabase }

// Example usage:
// const dbConnection = new DatabaseConnection();
// const db = await dbConnection.connect();
// const parkingDb = new ParkingDatabase(db);
