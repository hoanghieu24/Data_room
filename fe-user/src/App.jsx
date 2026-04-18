import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";


import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Staffs from "./pages/admin/Staffs";
import Customers from "./pages/admin/Customers";
import Categories from "./pages/admin/Categories";
import Document from "./pages/admin/Document";
import Sale from "./pages/admin/Sale";
import Task from "./pages/admin/task";
import Positions from "./pages/admin/Positions";
import PaymentManagement from "./pages/admin/payment";
import Reports from "./pages/admin/Reports";
import Integration from "./pages/admin/Integration";
import Game from "./pages/admin/Game";
const isAuthenticated = () => {
  return localStorage.getItem("user");
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* redirect root */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* login */}
        <Route path="/login" element={<Login />} />

        {/* admin */}
        <Route
          path="/admin"
          element={
            isAuthenticated()
              ? <AdminLayout />
              : <Navigate to="/login" />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="staffs" element={<Staffs />} />
          <Route path="customers" element={<Customers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="documents" element={<Document />} />
          <Route path="sales" element={<Sale />} />
          <Route path="task" element={<Task />} />
          <Route path="positions" element={<Positions />} />
          <Route path="payment" element={<PaymentManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="integration" element={<Integration />} />
          <Route path="game" element={<Game />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
