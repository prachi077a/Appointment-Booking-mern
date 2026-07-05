const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// @route GET /api/admin/users (role: admin)
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/users/:id (role: admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await user.deleteOne();
    if (user.role === "doctor") {
      await Doctor.deleteOne({ user: user._id });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/appointments (role: admin) - view all bookings platform-wide
const listAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .sort({ date: -1, time: -1 });

    res.json({ appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, deleteUser, listAllAppointments };
