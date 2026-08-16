import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MaintenanceRecord from "./components/MaintenanceRecord";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />                  {/* Login Page */}
      <Route path="/dashboard" element={<Dashboard />} />          {/* User Dashboard */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />{/* Admin Dashboard */}
      <Route path="/maintenance-record" element={<MaintenanceRecord />} />
      <Route path="*" element={<Login />} /> 
    </Routes>
  );
}

export default App;
