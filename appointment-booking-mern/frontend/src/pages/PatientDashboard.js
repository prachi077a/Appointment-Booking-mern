import { useEffect, useState } from "react";
import { fetchMyAppointments, cancelAppointment } from "../api/endpoints";
import AppointmentCard from "../components/AppointmentCard";

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchMyAppointments()
      .then((res) => setAppointments(res.data.appointments))
      .catch(() => setError("Could not load your appointments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel this appointment.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>My appointments</h2>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments yet</h3>
            <p>Find a doctor and book your first visit.</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              subtitle={`Dr. ${appt.doctor?.user?.name} · ${appt.doctor?.specialization}`}
              actions={
                ["pending", "confirmed"].includes(appt.status) && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt._id)}>
                    Cancel
                  </button>
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
