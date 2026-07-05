const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true, trim: true },
    about: { type: String, trim: true, default: "" },
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationFee: { type: Number, default: 0, min: 0 },

    // Days the doctor is available, e.g. ["Monday", "Wednesday", "Friday"]
    workingDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: [],
    },

    // Working hours in 24hr "HH:mm" format
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },

    // Length of one appointment slot, in minutes
    slotDurationMinutes: { type: Number, default: 30, min: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
