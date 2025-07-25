-- Smart Parking System Database Schema
-- This script creates the necessary collections structure for MongoDB

-- Note: In MongoDB, collections are created automatically when first document is inserted
-- This is a reference schema for the collections we'll use

-- entryVehicle Collection Schema
-- {
--   _id: ObjectId,
--   licensePlate: String (required, indexed),
--   entryTime: Date (required),
--   vehicleType: String (Car, SUV, Motorcycle, Truck),
--   cameraId: String,
--   imageUrl: String (optional - for storing license plate image),
--   status: String (parked, exited),
--   createdAt: Date,
--   updatedAt: Date
-- }

-- exitVehicle Collection Schema  
-- {
--   _id: ObjectId,
--   licensePlate: String (required, indexed),
--   entryTime: Date (required),
--   exitTime: Date (required),
--   duration: String (calculated duration),
--   totalMinutes: Number (for billing calculation),
--   amount: Number (calculated billing amount),
--   vehicleType: String,
--   cameraId: String,
--   entryImageUrl: String (optional),
--   exitImageUrl: String (optional),
--   createdAt: Date,
--   updatedAt: Date
-- }

-- admin Collection Schema (for authentication)
-- {
--   _id: ObjectId,
--   username: String (required, unique),
--   password: String (required, hashed),
--   role: String (admin),
--   createdAt: Date,
--   updatedAt: Date
-- }

-- Indexes to create for better performance:
-- entryVehicle: licensePlate, entryTime, status
-- exitVehicle: licensePlate, exitTime, entryTime
-- admin: username
