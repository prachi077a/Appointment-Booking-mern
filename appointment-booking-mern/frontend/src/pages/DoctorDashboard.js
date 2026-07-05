import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDoctorAppointments, updateAppointmentStatus } from "../api/endpoints";
import AppointmentCard from "../components/AppointmentCard";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDoctorAppointments()
      .then((res) => setAppointments(res.data.appointments))
      .catch((err) => {
        if (err.response?.status === 404) {
          setNeedsSetup(true);
        } else {
          setError("Could not load your appointments.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this appointment.");
    }
  };

  if (needsSetup) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h3>Set up your doctor profile first</h3>
            <p>Patients need your specialization and availability before they can book you.</p>
            <Link to="/dashboard/setup" className="btn btn-primary">
              Set up profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>Your appointments</h2>
          <Link to="/dashboard/setup" className="btn btn-outline btn-sm">
            Edit profile
          </Link>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Once patients book you, their appointments will show up here.</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              subtitle={`Patient: ${appt.patient?.name} · ${appt.patient?.email}`}
              actions={
                <>
                  {appt.status === "pending" && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(appt._id, "confirmed")}>
                      Confirm
                    </button>
                  )}
                  {["pending", "confirmed"].includes(appt.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(appt._id, "cancelled")}>
                      Cancel
                    </button>
                  )}
                  {appt.status === "confirmed" && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleStatusChange(appt._id, "completed")}>
                      Mark completed
                    </button>
                  )}
                </>
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
