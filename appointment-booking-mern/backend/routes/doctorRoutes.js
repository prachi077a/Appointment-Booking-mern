const express = require("express");
const {
  listDoctors,
  getDoctorById,
  createMyDoctorProfile,
  updateMyDoctorProfile,
  getMyDoctorProfile,
  getAvailableSlots,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public
router.get("/", listDoctors);

// Doctor-only routes (must come before "/:id" so "me" isn't parsed as an id)
router.get("/me/profile", protect, authorize("doctor"), getMyDoctorProfile);
router.post("/", protect, authorize("doctor"), createMyDoctorProfile);
router.put("/me", protect, authorize("doctor"), updateMyDoctorProfile);

// Public, by id
router.get("/:id", getDoctorById);
router.get("/:id/slots", getAvailableSlots);

module.exports = router;
