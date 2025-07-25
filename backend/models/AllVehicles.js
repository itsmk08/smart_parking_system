  const mongoose = require("mongoose");

  const allVehicleSchema = new mongoose.Schema({
    licensePlate: { type: String, required: true, index: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    status: { type: String, enum: ["parked", "exited"], default: "parked" },
    duration: { type: Number }, // in minutes
    fare: { type: Number },     // Rs
    image: { type: String },
  });

  module.exports = mongoose.model("AllVehicle", allVehicleSchema);
