// Helpers for turning a doctor's working hours into bookable time slots

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Convert "HH:mm" to minutes since midnight
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Convert minutes since midnight back to "HH:mm"
const toHHMM = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Returns the weekday name for a "YYYY-MM-DD" date string
const getWeekdayName = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return WEEKDAYS[date.getDay()];
};

// Generates every possible slot for the doctor on that date, ignoring bookings
const generateAllSlots = (doctor, dateStr) => {
  const weekday = getWeekdayName(dateStr);

  if (!doctor.workingDays.includes(weekday)) {
    return [];
  }

  const startMin = toMinutes(doctor.workingHours.start);
  const endMin = toMinutes(doctor.workingHours.end);
  const duration = doctor.slotDurationMinutes;

  const slots = [];
  for (let t = startMin; t + duration <= endMin; t += duration) {
    slots.push(toHHMM(t));
  }
  return slots;
};

// Basic guard: is dateStr a valid, not-in-the-past "YYYY-MM-DD" string
const isValidFutureDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

module.exports = { generateAllSlots, isValidFutureDate, getWeekdayName };
