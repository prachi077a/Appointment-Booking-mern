const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Finds the next date (today or later) that falls on the given weekday name,
// so tests stay valid regardless of what day they happen to run on.
const nextDateForWeekday = (weekdayName) => {
  const targetIndex = WEEKDAYS.indexOf(weekdayName);
  const d = new Date();
  while (d.getDay() !== targetIndex) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
};

// Registers a doctor account + profile, and returns the doctor's id/token
const setupDoctor = async () => {
  const registerRes = await request(app).post("/api/auth/register").send({
    name: "Dr. Test",
    email: "doctor@test.com",
    password: "password123",
    role: "doctor",
  });
  const doctorToken = registerRes.body.token;

  const profileRes = await request(app)
    .post("/api/doctors")
    .set("Authorization", `Bearer ${doctorToken}`)
    .send({
      specialization: "General Medicine",
      workingDays: ["Monday", "Wednesday", "Friday"],
      workingHours: { start: "09:00", end: "10:00" },
      slotDurationMinutes: 30,
    });

  return { doctorToken, doctorId: profileRes.body.doctor._id };
};

const setupPatient = async (email = "patient@test.com") => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test Patient",
    email,
    password: "password123",
    role: "patient",
  });
  return res.body.token;
};

describe("Doctor profile + slot availability", () => {
  it("computes available slots based on working hours", async () => {
    const { doctorId } = await setupDoctor();
    const date = nextDateForWeekday("Monday");

    const res = await request(app).get(`/api/doctors/${doctorId}/slots`).query({ date });

    expect(res.status).toBe(200);
    expect(res.body.availableSlots).toEqual(["09:00", "09:30"]);
  });

  it("returns no slots on a day the doctor doesn't work", async () => {
    const { doctorId } = await setupDoctor();
    const date = nextDateForWeekday("Tuesday");

    const res = await request(app).get(`/api/doctors/${doctorId}/slots`).query({ date });

    expect(res.status).toBe(200);
    expect(res.body.availableSlots).toEqual([]);
  });
});

describe("Booking flow", () => {
  it("lets a patient book an open slot, and that slot disappears from availability", async () => {
    const { doctorId } = await setupDoctor();
    const patientToken = await setupPatient();
    const date = nextDateForWeekday("Monday");

    const bookRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId, date, time: "09:00", reason: "Checkup" });

    expect(bookRes.status).toBe(201);
    expect(bookRes.body.appointment.status).toBe("pending");

    const slotsRes = await request(app).get(`/api/doctors/${doctorId}/slots`).query({ date });
    expect(slotsRes.body.availableSlots).toEqual(["09:30"]); // 09:00 no longer available
  });

  it("rejects booking a slot the doctor does not offer", async () => {
    const { doctorId } = await setupDoctor();
    const patientToken = await setupPatient();
    const date = nextDateForWeekday("Monday");

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId, date, time: "23:00", reason: "Too late" }); // outside working hours

    expect(res.status).toBe(400);
  });

  it("prevents two patients from double-booking the same slot", async () => {
    const { doctorId } = await setupDoctor();
    const patientAToken = await setupPatient("patientA@test.com");
    const patientBToken = await setupPatient("patientB@test.com");
    const date = nextDateForWeekday("Monday");

    // Patient A books first - should succeed
    const firstBooking = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientAToken}`)
      .send({ doctorId, date, time: "09:00" });
    expect(firstBooking.status).toBe(201);

    // Patient B tries the same doctor/date/time - should be rejected
    const secondBooking = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientBToken}`)
      .send({ doctorId, date, time: "09:00" });
    expect(secondBooking.status).toBe(409);
  });

  it("allows re-booking a slot after the original booking is cancelled", async () => {
    const { doctorId } = await setupDoctor();
    const patientToken = await setupPatient();
    const date = nextDateForWeekday("Monday");

    const firstBooking = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId, date, time: "09:00" });

    await request(app)
      .delete(`/api/appointments/${firstBooking.body.appointment._id}`)
      .set("Authorization", `Bearer ${patientToken}`);

    const secondBooking = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId, date, time: "09:00" });

    expect(secondBooking.status).toBe(201);
  });
});

describe("Doctor managing appointments", () => {
  it("lets a doctor confirm, then complete, an appointment", async () => {
    const { doctorToken, doctorId } = await setupDoctor();
    const patientToken = await setupPatient();
    const date = nextDateForWeekday("Monday");

    const booking = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId, date, time: "09:00" });

    const appointmentId = booking.body.appointment._id;

    const confirmRes = await request(app)
      .put(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "confirmed" });
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.appointment.status).toBe("confirmed");

    const completeRes = await request(app)
      .put(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "completed", notes: "All good" });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.appointment.status).toBe("completed");
    expect(completeRes.body.appointment.notes).toBe("All good");
  });

  it("prevents one doctor from updating another doctor's appointment", async () => {
    const { doctorId } = await setupDoctor();
    const patientToken = await setupPatient();
    const date = nextDateForWeekday("Monday");

    const booking = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId, date, time: "09:00" });

    // A second, unrelated doctor tries to confirm someone else's appointment
    const { doctorToken: otherDoctorToken } = await (async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        name: "Dr. Other",
        email: "other-doctor@test.com",
        password: "password123",
        role: "doctor",
      });
      const token = registerRes.body.token;
      await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${token}`)
        .send({ specialization: "Neurology", workingDays: ["Monday"] });
      return { doctorToken: token };
    })();

    const res = await request(app)
      .put(`/api/appointments/${booking.body.appointment._id}/status`)
      .set("Authorization", `Bearer ${otherDoctorToken}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(403);
  });
});
