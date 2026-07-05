import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyDoctorProfile, createDoctorProfile, updateDoctorProfile } from "../api/endpoints";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorSetup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialization: "",
    about: "",
    experienceYears: 0,
    consultationFee: 0,
    workingDays: [],
    workingHours: { start: "09:00", end: "17:00" },
    slotDurationMinutes: 30,
  });
  const [isExisting, setIsExisting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyDoctorProfile()
      .then((res) => {
        setForm(res.data.doctor);
        setIsExisting(true);
      })
      .catch(() => setIsExisting(false));
  }, []);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (isExisting) {
        await updateDoctorProfile(form);
      } else {
        await createDoctorProfile(form);
        setIsExisting(true);
      }
      setSuccess("Profile saved.");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2>{isExisting ? "Update your profile" : "Set up your doctor profile"}</h2>
          <p className="muted" style={{ marginBottom: 20 }}>
            Patients will use this information to find and book you.
          </p>

          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Specialization</label>
              <input
                required
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="e.g. Cardiology"
              />
            </div>

            <div className="form-group">
              <label>About / bio</label>
              <textarea
                rows={3}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                placeholder="A short introduction for patients"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Years of experience</label>
                <input
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Consultation fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.consultationFee}
                  onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Working days</label>
              <div className="slot-rail">
                {ALL_DAYS.map((day) => (
                  <button
                    type="button"
                    key={day}
                    className={`slot-pill ${form.workingDays.includes(day) ? "selected" : ""}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start time</label>
                <input
                  type="time"
                  value={form.workingHours.start}
                  onChange={(e) => setForm({ ...form, workingHours: { ...form.workingHours, start: e.target.value } })}
                />
              </div>
              <div className="form-group">
                <label>End time</label>
                <input
                  type="time"
                  value={form.workingHours.end}
                  onChange={(e) => setForm({ ...form, workingHours: { ...form.workingHours, end: e.target.value } })}
                />
              </div>
              <div className="form-group">
                <label>Slot length (min)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={form.slotDurationMinutes}
                  onChange={(e) => setForm({ ...form, slotDurationMinutes: Number(e.target.value) })}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorSetup;
