import { useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export function VerifyOrganizer() {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function verify() {
      try {
        console.log("=== VERIFICATION DEBUG ===");
        console.log("Token from params:", token);
        console.log("Axios baseURL:", axios.defaults.baseURL);
        console.log("Full URL will be:", `${axios.defaults.baseURL}/organizer/verify/${token}`);
        
        const res = await axios.get(`/organizer/verify/${token}`);
        
        console.log("Response:", res.data);
        alert(res.data.message);
        localStorage.setItem("isVerified", "true");
        navigate("/organizersignin");
      } catch (err) {
        console.error("=== VERIFICATION ERROR ===");
        console.error("Error response:", err.response);
        console.error("Error status:", err.response?.status);
        console.error("Error URL:", err.config?.url);
        alert(err.response?.data?.message || "Verification failed");
        navigate("/");
      }
    }
    verify();
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center h-screen text-xl">
      Verifying your organizer email...
    </div>
  );
}



// import { useEffect, useRef } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// export function VerifyOrganizer() {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const hasRun = useRef(false); 

//   useEffect(() => {
//     if (hasRun.current) return;
//     hasRun.current = true;

//     async function verify() {
//       try {
//         // ✅ FIXED: Call organizer verification endpoint
//         const res = await axios.get(`/organizer/verify/${token}`);
//         alert(res.data.message);
//         localStorage.setItem("isVerified", "true");
//         navigate("/organizersignin");
//       } catch (err) {
//         console.error("Organizer verification error:", err);
//         alert(err.response?.data?.message || "Verification failed");
//         navigate("/");
//       }
//     }
//     verify();
//   }, [token, navigate]);

//   return (
//     <div className="flex justify-center items-center h-screen text-xl">
//       Verifying your organizer email...
//     </div>
//   );
// }


// import { useEffect, useRef } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// export function VerifyOrganizer() {
//   const { token } = useParams();
//   const navigate = useNavigate();
//    const hasRun = useRef(false); 

//   useEffect(() => {
//      if (hasRun.current) return;
//     hasRun.current = true;

//     async function verify() {
//       try {
//         const res = await axios.get(`/organizer/verify/${token}`);
//         alert(res.data.message);
//         localStorage.setItem("isVerified", "true");
//         navigate("/organizersignin");
//       } catch (err) {
//         alert("Verification failed");
//         navigate("/");
//       }
//     }
//     verify();
//   }, [token]);

//   return (
//     <div className="flex justify-center items-center h-screen text-xl">
//       Verifying your email...
//     </div>
//   );
// }