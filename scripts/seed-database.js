// Seed script for Smart Parking System
// This script populates the database with sample data for testing

// Sample data for entryVehicle collection
const sampleEntries = [
  {
    licensePlate: "ABC123",
    entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    vehicleType: "Car",
    cameraId: "CAM001",
    status: "parked",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "XYZ789",
    entryTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    vehicleType: "SUV",
    cameraId: "CAM001",
    status: "parked",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "DEF456",
    entryTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    vehicleType: "Motorcycle",
    cameraId: "CAM002",
    status: "parked",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Sample data for exitVehicle collection
const sampleExits = [
  {
    licensePlate: "GHI789",
    entryTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    exitTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration: "4h 0m",
    totalMinutes: 240,
    amount: 20.0,
    vehicleType: "Car",
    cameraId: "CAM001",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "JKL012",
    entryTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    exitTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    duration: "2h 30m",
    totalMinutes: 150,
    amount: 12.5,
    vehicleType: "SUV",
    cameraId: "CAM002",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    licensePlate: "MNO345",
    entryTime: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    exitTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    duration: "1h 45m",
    totalMinutes: 105,
    amount: 8.75,
    vehicleType: "Motorcycle",
    cameraId: "CAM001",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Sample admin user
const adminUser = {
  username: "admin",
  password: "$2b$10$rQZ8kJZjZjZjZjZjZjZjZu", // This should be properly hashed in production
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Billing rates (per hour)
const billingRates = {
  Car: 5.0,
  SUV: 6.0,
  Motorcycle: 3.0,
  Truck: 8.0,
}

console.log("Sample data prepared for Smart Parking System")
console.log("Entry Vehicles:", sampleEntries.length)
console.log("Exit Vehicles:", sampleExits.length)
console.log("Billing Rates:", billingRates)

// In a real MongoDB setup, you would insert this data using:
// db.entryVehicle.insertMany(sampleEntries);
// db.exitVehicle.insertMany(sampleExits);
// db.admin.insertOne(adminUser);
