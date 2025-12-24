import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// redux
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/auth/authSlice";



/**
 * SignInModal
 * Props:
 *  - open (boolean) optional
 *  - onClose() optional
 *  - onLoginSuccess(token, userData) optional -> parent should store token/id/isVerified and continue pending flow
 *  - pendingPayment optional (not required here, parent handles it)
 */
export const SignInModal = ({ open = true, onClose, onLoginSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(open);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  const validationSchema = {
    emailValidator: {
      required: {
        value: true,
        message: "Email is required*"
      }
    },
    passwordValidator: {
      required: {
        value: true,
        message: "Password is required"
      },
      minLength: { 
        value: 6, 
        message: "Minimum 6 characters required" 
      }
    }
  };

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const loadGoogleSignIn = () => {
      const googleDiv = document.getElementById("googleSignInDiv");
      if (window.google && googleDiv) {
        try {
          window.google.accounts.id.initialize({
            client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
          });

          window.google.accounts.id.renderButton(
            googleDiv,
            {
              type: "standard",
              theme: "filled_black",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              width: googleDiv.offsetWidth,
            }
          );
          setIsGoogleLoaded(true);
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
        }
      } else {
        const t = setTimeout(loadGoogleSignIn, 500);
        return () => clearTimeout(t);
      }
    };

    loadGoogleSignIn();

    return () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (err) {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post("/user/googlelogin", {
        token: response.credential,
      });

      const { token, data } = res.data;

      // Let parent handle storing token/isVerified and redirect/pending flows
      if (onLoginSuccess) {
        onLoginSuccess(token, data);
      } else {
        // Fallback storage if parent didn't provide a handler
        localStorage.setItem("userId", data._id);
        localStorage.setItem("role", data.roleId?.name || "User");
        localStorage.setItem("token", token);
        localStorage.setItem("isVerified", data.isVerified ? "true" : "false");
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        if (data.roleId?.name === "Admin") navigate("/admin");
        else navigate("/user");
      }

      // Close modal
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Google login failed:", error);
      alert(error.response?.data?.message || "Google login failed. Please try again.");
    }
  };

// using redux
  const onSubmit = async (formData) => {
  const result = await dispatch(loginUser(formData));

  if (loginUser.fulfilled.match(result)) {
    const token = result.payload.token;
    const userData = result.payload.data;
    const role = userData.roleId?.name;
    
    // Store auth data
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userData._id);
    localStorage.setItem("role", role || "User");
    localStorage.setItem("isVerified", userData.isVerified ? "true" : "false");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // Call parent success callback if provided
    if (onLoginSuccess) {
      onLoginSuccess(token, userData);
    } else {
      // Default navigation
      if (role === "Admin") navigate("/admin");
      else navigate("/user");
    }

    setIsOpen(false);
    onClose?.();
  }
};

  // const onSubmit = async (formData) => {
  //   try {
  //     const res = await axios.post("/user/login", formData);
  //     const token = res.data.token;
  //     const userData = res.data.data;

  //     // Let parent control post-login behavior
  //     if (onLoginSuccess) {
  //       onLoginSuccess(token, userData);
  //     } else {
  //       // fallback: local storage + redirect
  //       localStorage.setItem("userId", userData._id);
  //       localStorage.setItem("role", userData.roleId?.name || "User");
  //       localStorage.setItem("token", token);
  //       localStorage.setItem("isVerified", userData.isVerified ? "true" : "false");
  //       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //       if (userData.roleId?.name === "Admin") navigate("/admin");
  //       else navigate("/user");
  //     }

  //     setIsOpen(false);
  //     onClose?.();
  //   } catch (err) {
  //     console.error("Login Error:", err);
  //     alert(err.response?.data?.message || "Login failed. Please try again.");
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) onClose?.(); }}>
      <DialogContent className="sm:max-w-[425px] bg-black text-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Sign In</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              className="bg-transparent border-gray-600"
              {...register("email", validationSchema.emailValidator)}
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              className="bg-transparent border-gray-600"
              {...register("password", validationSchema.passwordValidator)}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-900">
              Sign In
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-gray-500">OR</span>
            </div>
          </div>

          <div className="flex justify-center items-center min-h-[48px] my-4">
            <div
              id="googleSignInDiv"
              className="w-full max-w-[300px] mx-auto"
              style={{ minHeight: "48px" }}
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Not registered yet?
              <Link to="/signup" className="ml-1 text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
            <Link to="/adminsignin" className="text-sm text-gray-500 hover:underline">
              For Admin
            </Link>
            {error && <p className="text-red-500 text-sm">{error}</p>}

          </div>
        </form>
      </DialogContent>

    </Dialog>
  );
};

export default SignInModal;



// import { useEffect, useState } from 'react'
// import axios from 'axios'
// import { jwtDecode } from "jwt-decode"
// import { useForm } from 'react-hook-form'
// import { Link, useNavigate } from 'react-router-dom'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"

// export const SignInModal = () => {
//   const { register, handleSubmit, formState: { errors } } = useForm()
//   const navigate = useNavigate()
//   const [isOpen, setIsOpen] = useState(true)
//   const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

//   const validationSchema = {
//     emailValidator: {
//       required: {
//         value: true,
//         message: "Email is required*"
//       }
//     },
//     passwordValidator: {
//       required: {
//         value: true,
//         message: "Password is required"
//       },
//       minLength: { 
//         value: 6, 
//         message: "Minimum 6 characters required" 
//       }
//     }
//   }

//   useEffect(() => {
//     const loadGoogleSignIn = () => {
//       const googleDiv = document.getElementById("googleSignInDiv");
//       if (window.google && googleDiv) {
//         try {
//           window.google.accounts.id.initialize({
//             client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com",
//             callback: handleGoogleResponse,
//             auto_select: false,
//           });

//           window.google.accounts.id.renderButton(
//             googleDiv,
//             {
//               type: "standard",
//               theme: "filled_black",
//               size: "large",
//               text: "signin_with",
//               shape: "rectangular",
//               width: googleDiv.offsetWidth,
//             }
//           );
//           setIsGoogleLoaded(true);
//         } catch (error) {
//           console.error("Error initializing Google Sign-In:", error);
//         }
//       } else {
//         setTimeout(loadGoogleSignIn, 500); // Increased timeout
//       }
//     };

//     // Initial load
//     loadGoogleSignIn();

//     // Cleanup
//     return () => {
//       if (window.google) {
//         try {
//           window.google.accounts.id.cancel();
//         } catch (error) {
//           console.error("Error cleaning up Google Sign-In:", error);
//         }
//       }
//     };
//   }, []);

//   const handleGoogleResponse = async (response) => {
//     try {
//       const res = await axios.post("/user/googlelogin", {
//         token: response.credential,
//       });

//       const { token, data } = res.data;

//       localStorage.setItem("userId", data._id);
//       localStorage.setItem("role", data.roleId?.name || "User");
//       localStorage.setItem("token", token);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       if (data.roleId?.name === "Admin") {
//         navigate("/admin");
//       } else {
//         navigate("/user");
//       }
//     } catch (error) {
//       console.error("Google login failed:", error);
//       alert(error.response?.data?.message || "Google login failed. Please try again.");
//     }
//   };

//   const onSubmit = async (data) => {
//     try {
//       const res = await axios.post("/user/login", data);
//       const token = res.data.token;
  
//       if (res.status === 200) {
//         localStorage.setItem("userId", res.data.data._id);
//         localStorage.setItem("role", res.data.data.roleId.name);
//         localStorage.setItem("token", token)
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//         if (res.data.data.roleId.name === "User") {
//           navigate("/user");
//         } else if (res.data.data.roleId.name === "Admin") {
//           navigate("/admin");
//         }
//       }
//     } catch (err) {
//       console.error("Login Error:", err);
//       alert(err.response?.data?.message || "Login failed. Please try again.");
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogContent className="sm:max-w-[425px] bg-black text-white p-6 rounded-lg shadow-lg">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-center">Sign In</DialogTitle>
//         </DialogHeader>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Email</label>
//             <Input
//               type="email"
//               className="bg-transparent border-gray-600"
//               {...register("email", validationSchema.emailValidator)}
//             />
//             {errors.email && (
//               <span className="text-sm text-red-500">{errors.email.message}</span>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Password</label>
//             <Input
//               type="password"
//               className="bg-transparent border-gray-600"
//               {...register("password", validationSchema.passwordValidator)}
//             />
//             {errors.password && (
//               <span className="text-sm text-red-500">{errors.password.message}</span>
//             )}
//           </div>

//           <div className="flex flex-col gap-4">
//             <Button type="submit" className="w-full bg-white text-black hover:bg-gray-900">
//               Sign In
//             </Button>
//           </div>

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t border-gray-600"></span>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="bg-black px-2 text-gray-500">OR</span>
//             </div>
//           </div>

//           <div className="flex justify-center items-center min-h-[48px] my-4">
//             <div 
//               id="googleSignInDiv"
//               className="w-full max-w-[300px] mx-auto"
//               style={{ minHeight: '48px' }}
//             />
//           </div>

//           <div className="text-center space-y-2">
//             <p className="text-sm text-gray-500">
//               Not registered yet? 
//               <Link to="/signup" className="ml-1 text-blue-600 hover:underline">
//                 Sign Up
//               </Link>
//             </p>
//             <Link to="/adminsignin" className="text-sm text-gray-500 hover:underline">
//               For Admin
//             </Link>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }



