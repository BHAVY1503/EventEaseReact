// src/components/common/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  const [authState, setAuthState] = useState({ isLoggedin: false, role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id =
      localStorage.getItem("userId") ||
      localStorage.getItem("organizerId") ||
      localStorage.getItem("adminId");

    const role = localStorage.getItem("role");

    if (id) {
      setAuthState({ isLoggedin: true, role });
    }
    setLoading(false);
  }, []);

  return { ...authState, loading };
};

const PrivateRoute = () => {
  const auth = useAuth();

  if (auth.loading) {
    return <h1>Loading...</h1>;
  }

  return auth.isLoggedin ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
