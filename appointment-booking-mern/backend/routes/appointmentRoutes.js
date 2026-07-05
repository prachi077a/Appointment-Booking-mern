const express = require("express");
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelMyAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/my", protect, authorize("patient"), getMyAppointments);
router.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);
router.put("/:id/status", protect, authorize("doctor"), updateAppointmentStatus);
router.delete("/:id", protect, authorize("patient"), cancelMyAppointment);

module.exports = router;
