import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDoctors } from "../api/endpoints";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = async (specialization = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchDoctors(specialization);
      setDoctors(res.data.doctors);
    } catch (err) {
      setError("Could not load doctors. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadDoctors(search);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Find the right doctor, book in a few clicks.</h1>
          <p>Search by specialization, check real-time availability, and confirm your visit.</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              placeholder="Search specialization, e.g. Dermatology"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="muted" style={{ textAlign: "center" }}>
            Loading doctors...
          </p>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <h3>No doctors found</h3>
            <p>Try a different specialization, or check back soon.</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {doctors.map((doc) => (
              <Link to={`/doctors/${doc._id}`} key={doc._id} className="doctor-card">
                <div className="avatar">{initials(doc.user?.name)}</div>
                <h3 style={{ margin: 0 }}>{doc.user?.name}</h3>
                <span className="tag">{doc.specialization}</span>
                <p className="muted">{doc.experienceYears} yrs experience</p>
                <p className="muted">Consultation: ₹{doc.consultationFee}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
