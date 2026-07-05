const express = require("express");
const { listUsers, deleteUser, listAllAppointments } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);
router.get("/appointments", listAllAppointments);

module.exports = router;
