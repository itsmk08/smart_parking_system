require("dotenv").config();
const mongoose = require("mongoose");
const EntryVehicle = require("../models/EntryVehicle");
const ExitVehicle = require("../models/ExitVehicle");
const Admin = require("../models/Admin");
const User = require("../models/User");

const MONGODB_URI = process.env.MONGODB_URI;

const sampleEntries = [ /* unchanged */ ];
const sampleExits = [ /* unchanged */ ];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await EntryVehicle.deleteMany({});
    await ExitVehicle.deleteMany({});
    await Admin.deleteMany({});
    await User.deleteMany({});

    await EntryVehicle.insertMany(sampleEntries);
    console.log("Sample entry vehicles inserted");

    await ExitVehicle.insertMany(sampleExits);
    console.log("Sample exit vehicles inserted");

    const admin = new Admin({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      isVerified: true,
    });
    await admin.save();
    console.log("Admin user created");

    const user = new User({
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD,
      firstName: process.env.USER_FIRST_NAME,
      lastName: process.env.USER_LAST_NAME,
      role: "operator",
      isVerified: true,
    });
    await user.save();
    console.log("Sample user created");

    console.log("✅ Database seeded successfully!");
    console.log("🔐 Login credentials:");
    console.log(`Admin: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
    console.log(`User: ${process.env.USER_EMAIL} / ${process.env.USER_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
