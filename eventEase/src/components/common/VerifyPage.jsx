import { useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export function VerifyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
   const hasRun = useRef(false); 

  useEffect(() => {
     if (hasRun.current) return;
    hasRun.current = true;

    async function verify() {
      try {
        const res = await axios.get(`/verify/${token}`);
        alert(res.data.message);
        localStorage.setItem("isVerified", "true");
        navigate("/user");
      } catch (err) {
        alert("Verification failed");
        navigate("/");
      }
    }
    verify();
  }, [token]);

  return (
    <div className="flex justify-center items-center h-screen text-xl">
      Verifying your email...
    </div>
  );
}
