const mongoose = require("mongoose")

const exitVehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      index: true,
    },
    entryTime: {
      type: Date,
      required: true,
    },
    exitTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: String,
    },
    totalMinutes: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["exited"],
      default: "exited",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
exitVehicleSchema.index({ licensePlate: 1 })
exitVehicleSchema.index({ exitTime: -1 })
exitVehicleSchema.index({ entryTime: 1 })

module.exports = mongoose.model("ExitVehicle", exitVehicleSchema)
