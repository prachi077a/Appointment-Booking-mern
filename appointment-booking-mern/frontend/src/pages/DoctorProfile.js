import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDoctorById, fetchDoctorSlots, bookAppointment } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

const todayStr = () => new Date().toISOString().slice(0, 10);

// Builds the next 7 selectable calendar dates starting today
const nextSevenDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

const formatDateLabel = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchDoctorById(id)
      .then((res) => setDoctor(res.data.doctor))
      .catch(() => setError("Could not load this doctor's profile."))
      .finally(() => setLoadingDoctor(false));
  }, [id]);

  useEffect(() => {
    if (!doctor) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetchDoctorSlots(id, selectedDate)
      .then((res) => setSlots(res.data.availableSlots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [doctor, id, selectedDate]);

  const handleBook = async () => {
    setError("");
    setSuccess("");

    if (!user) {
      navigate("/login", { state: { from: `/doctors/${id}` } });
      return;
    }
    if (user.role !== "patient") {
      setError("Only patient accounts can book appointments.");
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot first.");
      return;
    }

    setBooking(true);
    try {
      await bookAppointment({ doctorId: id, date: selectedDate, time: selectedSlot, reason });
      setSuccess("Appointment booked! You can view it from 'My appointments'.");
      setSlots((prev) => prev.filter((s) => s !== selectedSlot));
      setSelectedSlot(null);
      setReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not book this slot. Please try another.");
    } finally {
      setBooking(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="page">
        <div className="container">
          <p className="muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-banner">{error || "Doctor not found."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="grid-2">
          <div className="card">
            <div className="avatar" style={{ width: 64, height: 64, fontSize: "1.4rem" }}>
              {doctor.user?.name
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <h2>{doctor.user?.name}</h2>
            <span className="tag">{doctor.specialization}</span>
            <p className="muted" style={{ marginTop: 12 }}>
              {doctor.about || "No additional bio provided yet."}
            </p>
            <ul className="muted" style={{ paddingLeft: 18 }}>
              <li>{doctor.experienceYears} years of experience</li>
              <li>Consultation fee: ₹{doctor.consultationFee}</li>
              <li>Available: {doctor.workingDays?.join(", ") || "Not set"}</li>
              <li>
                Hours: {doctor.workingHours?.start} – {doctor.workingHours?.end}
              </li>
            </ul>
          </div>

          <div className="card">
            <h3>Book an appointment</h3>

            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            <p className="muted" style={{ marginBottom: 6 }}>
              Choose a date
            </p>
            <div className="slot-rail">
              {nextSevenDays().map((d) => (
                <button
                  key={d}
                  className={`slot-pill ${selectedDate === d ? "selected" : ""}`}
                  onClick={() => setSelectedDate(d)}
                >
                  {formatDateLabel(d)}
                </button>
              ))}
            </div>

            <p className="muted" style={{ marginBottom: 6, marginTop: 18 }}>
              Choose a time
            </p>
            {loadingSlots ? (
              <p className="muted">Checking availability...</p>
            ) : slots.length === 0 ? (
              <p className="muted">No slots available on this date. Try another day.</p>
            ) : (
              <div className="slot-rail">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    className={`slot-pill ${selectedSlot === slot ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            <div className="form-group" style={{ marginTop: 18 }}>
              <label htmlFor="reason">Reason for visit (optional)</label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for the visit"
              />
            </div>

            <button
              className="btn btn-primary"
              disabled={!selectedSlot || booking}
              onClick={handleBook}
              style={{ width: "100%" }}
            >
              {booking ? "Booking..." : selectedSlot ? `Book ${selectedSlot} on ${selectedDate}` : "Select a time slot"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
