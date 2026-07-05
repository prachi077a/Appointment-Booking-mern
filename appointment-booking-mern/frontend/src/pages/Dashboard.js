import { useAuth } from "../context/AuthContext";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import AdminDashboard from "./AdminDashboard";

// Renders the right dashboard based on the logged-in user's role
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "doctor") return <DoctorDashboard />;
  if (user?.role === "admin") return <AdminDashboard />;
  return <PatientDashboard />;
};

export default Dashboard;
