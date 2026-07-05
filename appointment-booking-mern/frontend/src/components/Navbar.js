import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          MediBook <span>booking</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Find a doctor</Link>

          {!user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}

          {user?.role === "patient" && <Link to="/dashboard">My appointments</Link>}
          {user?.role === "doctor" && <Link to="/dashboard">Doctor dashboard</Link>}
          {user?.role === "admin" && <Link to="/dashboard">Admin panel</Link>}

          {user && (
            <>
              <span className="pill-role">{user.role}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
