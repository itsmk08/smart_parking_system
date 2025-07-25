const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/SVP"

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Import Routes
const authRoutes = require("./routes/auth")
const vehicleRoutes = require("./routes/vehicles")
const dashboardRoutes = require("./routes/dashboard")

// Use Routes
app.use("/api/auth", authRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Smart Parking System API" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
