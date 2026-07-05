// Populates the database with a demo admin, doctors, and a patient.
// Run with: node seed/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Doctor.deleteMany(), Appointment.deleteMany()]);

  const admin = await User.create({
    name: "Admin",
    email: "admin@medibook.test",
    password: "admin123",
    role: "admin",
  });

  const patient = await User.create({
    name: "Asha Rao",
    email: "patient@medibook.test",
    password: "patient123",
    role: "patient",
    phone: "9876543210",
  });

  const doctorUser1 = await User.create({
    name: "Dr. Meera Nair",
    email: "meera@medibook.test",
    password: "doctor123",
    role: "doctor",
    phone: "9812345678",
  });

  const doctorUser2 = await User.create({
    name: "Dr. Rohan Verma",
    email: "rohan@medibook.test",
    password: "doctor123",
    role: "doctor",
    phone: "9823456789",
  });

  await Doctor.create({
    user: doctorUser1._id,
    specialization: "Dermatology",
    about: "Specializes in skin conditions, acne, and cosmetic dermatology.",
    experienceYears: 8,
    consultationFee: 600,
    workingDays: ["Monday", "Wednesday", "Friday"],
    workingHours: { start: "10:00", end: "16:00" },
    slotDurationMinutes: 30,
  });

  await Doctor.create({
    user: doctorUser2._id,
    specialization: "Cardiology",
    about: "Focuses on heart health, hypertension, and preventive cardiology.",
    experienceYears: 12,
    consultationFee: 900,
    workingDays: ["Tuesday", "Thursday", "Saturday"],
    workingHours: { start: "09:00", end: "14:00" },
    slotDurationMinutes: 20,
  });

  console.log("Seed data created:");
  console.log("  Admin    -> admin@medibook.test / admin123");
  console.log("  Patient  -> patient@medibook.test / patient123");
  console.log("  Doctor 1 -> meera@medibook.test / doctor123 (Dermatology)");
  console.log("  Doctor 2 -> rohan@medibook.test / doctor123 (Cardiology)");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
