import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUserById, fetchAllAppointments } from "../api/endpoints";

const AdminDashboard = () => {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = () => fetchAllUsers().then((res) => setUsers(res.data.users));
  const loadAppointments = () => fetchAllAppointments().then((res) => setAppointments(res.data.appointments));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadUsers(), loadAppointments()])
      .catch(() => setError("Could not load admin data."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUserById(id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete user.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>Admin panel</h2>
          <div className="nav-links">
            <button className={tab === "users" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} onClick={() => setTab("users")}>
              Users
            </button>
            <button
              className={tab === "appointments" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
              onClick={() => setTab("appointments")}
            >
              All appointments
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <p className="muted">Loading...</p>}

        {!loading && tab === "users" && (
          <div className="card">
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="tag">{u.role}</span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role !== "admin" && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "appointments" && (
          <div className="card">
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>{a.patient?.name}</td>
                    <td>
                      Dr. {a.doctor?.user?.name} ({a.doctor?.specialization})
                    </td>
                    <td>
                      <span className={`stamp ${a.status}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
