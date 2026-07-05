const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { generateAllSlots, isValidFutureDate } = require("../utils/slotUtils");

// @route POST /api/appointments (role: patient)
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }

    if (!isValidFutureDate(date)) {
      return res.status(400).json({ message: "Date must be today or in the future (YYYY-MM-DD)" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Confirm requested slot is actually one the doctor offers on that day
    const validSlots = generateAllSlots(doctor, date);
    if (!validSlots.includes(time)) {
      return res.status(400).json({ message: "That time slot is not offered by this doctor on this date" });
    }

    // Confirm slot isn't already taken (index also enforces this at the DB level)
    const clash = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });
    if (clash) {
      return res.status(409).json({ message: "This slot was just booked by someone else. Please pick another." });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      reason,
    });

    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/appointments/my (role: patient) - patient's own bookings
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/appointments/doctor (role: doctor) - appointments booked with this doctor
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "No doctor profile found for this account" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email phone")
      .sort({ date: 1, time: 1 });

    res.json({ appointments });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/appointments/:id/status (role: doctor) - confirm/cancel/complete
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ["confirmed", "cancelled", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(", ")}` });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify this appointment actually belongs to the logged-in doctor
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
      return res.status(403).json({ message: "You can only update your own appointments" });
    }

    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/appointments/:id (role: patient) - patient cancels their own booking
const cancelMyAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (String(appointment.patient) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only cancel your own appointments" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelMyAppointment,
};
