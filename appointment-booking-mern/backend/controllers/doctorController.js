const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const { generateAllSlots, isValidFutureDate } = require("../utils/slotUtils");

// @route GET /api/doctors
// Public list of doctors, optionally filtered by specialization (?specialization=Cardiology)
const listDoctors = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.specialization) {
      filter.specialization = new RegExp(req.query.specialization, "i");
    }

    const doctors = await Doctor.find(filter).populate("user", "name email phone");
    res.json({ doctors });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email phone");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/doctors  (role: doctor) - create/complete own profile
const createMyDoctorProfile = async (req, res, next) => {
  try {
    const existing = await Doctor.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Doctor profile already exists, use update instead" });
    }

    const {
      specialization,
      about,
      experienceYears,
      consultationFee,
      workingDays,
      workingHours,
      slotDurationMinutes,
    } = req.body;

    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required" });
    }

    const doctor = await Doctor.create({
      user: req.user._id,
      specialization,
      about,
      experienceYears,
      consultationFee,
      workingDays,
      workingHours,
      slotDurationMinutes,
    });

    res.status(201).json({ doctor });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/doctors/me  (role: doctor) - update own profile
const updateMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found. Create one first." });
    }

    const fields = [
      "specialization",
      "about",
      "experienceYears",
      "consultationFee",
      "workingDays",
      "workingHours",
      "slotDurationMinutes",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    await doctor.save();
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/doctors/me/profile (role: doctor) - fetch own profile
const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!doctor) {
      return res.status(404).json({ message: "No doctor profile found for this account yet" });
    }
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/doctors/:id/slots?date=YYYY-MM-DD
// Computes free slots = all possible slots minus already booked ones
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date || !isValidFutureDate(date)) {
      return res.status(400).json({ message: "A valid date (today or later, YYYY-MM-DD) is required" });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const allSlots = generateAllSlots(doctor, date);

    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      date,
      status: { $in: ["pending", "confirmed"] },
    }).select("time");

    const bookedTimes = new Set(bookedAppointments.map((a) => a.time));
    const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    res.json({ date, availableSlots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDoctors,
  getDoctorById,
  createMyDoctorProfile,
  updateMyDoctorProfile,
  getMyDoctorProfile,
  getAvailableSlots,
};
