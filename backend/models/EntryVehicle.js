const mongoose = require("mongoose")

const entryVehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      index: true,
    },
    entryTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["parked", "exited"],
      default: "parked",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
entryVehicleSchema.index({ licensePlate: 1, status: 1 })
entryVehicleSchema.index({ entryTime: -1 })

module.exports = mongoose.model("EntryVehicle", entryVehicleSchema)
