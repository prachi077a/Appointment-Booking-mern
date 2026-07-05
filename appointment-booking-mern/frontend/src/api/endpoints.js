import api from "./axios";

// ---- Auth ----
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const fetchMe = () => api.get("/auth/me");

// ---- Doctors ----
export const fetchDoctors = (specialization = "") =>
  api.get("/doctors", { params: specialization ? { specialization } : {} });
export const fetchDoctorById = (id) => api.get(`/doctors/${id}`);
export const fetchDoctorSlots = (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } });
export const fetchMyDoctorProfile = () => api.get("/doctors/me/profile");
export const createDoctorProfile = (data) => api.post("/doctors", data);
export const updateDoctorProfile = (data) => api.put("/doctors/me", data);

// ---- Appointments ----
export const bookAppointment = (data) => api.post("/appointments", data);
export const fetchMyAppointments = () => api.get("/appointments/my");
export const fetchDoctorAppointments = () => api.get("/appointments/doctor");
export const updateAppointmentStatus = (id, data) => api.put(`/appointments/${id}/status`, data);
export const cancelAppointment = (id) => api.delete(`/appointments/${id}`);

// ---- Admin ----
export const fetchAllUsers = () => api.get("/admin/users");
export const deleteUserById = (id) => api.delete(`/admin/users/${id}`);
export const fetchAllAppointments = () => api.get("/admin/appointments");
