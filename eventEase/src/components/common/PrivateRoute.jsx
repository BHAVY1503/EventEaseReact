// src/components/common/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  const [authState, setAuthState] = useState({ isLoggedin: false, role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id =
    localStorage.getItem("token")
      // localStorage.getItem("userId") ||
      // localStorage.getItem("organizerId") ||
      // localStorage.getItem("adminId");

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return auth.isLoggedin ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
