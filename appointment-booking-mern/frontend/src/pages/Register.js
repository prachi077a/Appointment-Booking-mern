import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.role === "doctor" ? "/dashboard/setup" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card auth-card">
          <h2>Create your account</h2>
          <p className="muted" style={{ marginBottom: 20 }}>
            Book appointments, or join as a doctor to manage your schedule.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="role">I am a</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value="patient">Patient — I want to book appointments</option>
                <option value="doctor">Doctor — I want to accept appointments</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="muted" style={{ marginTop: 18, textAlign: "center" }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
