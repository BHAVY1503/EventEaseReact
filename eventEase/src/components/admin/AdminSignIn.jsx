import { useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from "jwt-decode"
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { adminLogin, googleLogin } from "../../features/auth/authSlice";

export const AdminSignIn = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [isOpen, setIsOpen] = useState(true)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

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
  }

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
        setTimeout(loadGoogleSignIn, 500);
      }
    };

    // Initial load
    loadGoogleSignIn();

    // Cleanup
    return () => {
      if (window.google) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.error("Error cleaning up Google Sign-In:", error);
        }
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await dispatch(googleLogin({ token: response.credential, type: 'user' })).unwrap();
      const { data } = res;
      if (data.roleId?.name === "Admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      alert(error || "Google login failed. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(adminLogin(data)).unwrap();
      const { data: user } = res;
      if (user.roleId?.name === "Admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      alert(err || "Login failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) navigate('/', { replace: true }); }}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 rounded-xl shadow-2xl border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Admin Sign In</DialogTitle>
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
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-900" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
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

          {/* <div className="flex justify-center items-center min-h-[48px] my-4">
            <div 
              id="googleSignInDiv"
              className="w-full max-w-[300px] mx-auto"
              style={{ minHeight: '48px' }}
            />
          </div> */}

          <div className="text-center space-y-2">
            {error && <div className="text-red-400">{error}</div>}
            <p className="text-sm text-gray-500">
              Not registered yet? 
              <Link to="/signup" className="ml-1 text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
            <Link to="/signin" className="text-sm text-gray-500 hover:underline">
              For Regular Users
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// import axios from 'axios'
// import { jwtDecode } from "jwt-decode";
// import React, { useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { Link, useNavigate } from 'react-router-dom'

// export const AdminSignIn = () => {

//     const {register, handleSubmit, formState: {errors}}= useForm()
//     console.log(errors)
//     const navigate = useNavigate()
   
//     const validationSchema = {
//         emailValidator:{
//             required:{
//                 value:true,
//                 message:"email was required*"
//             }
//         },
//         passwordValidator:{
//             required:{
//                 value:true,
//                 message:"email was required"
//             }
//         }
//     }

//      useEffect(() => {
//     /* global google */
//     google.accounts.id.initialize({
//       client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com", 
//       callback: handleGoogleResponse,
//     });

//     google.accounts.id.renderButton(
//       document.getElementById("googleSignInDiv"),
//       { theme: "filled_blue", size: "large", width: "10%" }
//     );
//   }, []);

//   const handleGoogleResponse = async (response) => {
//     const decoded = jwtDecode(response.credential); // optional
//     console.log("Google credential decoded:", decoded);

//     try {
//       const res = await axios.post("/user/googlelogin", {
//         token: response.credential,
//       });

//       const { token, data } = res.data;

//       localStorage.setItem("userId", data._id);
//       localStorage.setItem("role", data.roleId?.name || "User");
//       localStorage.setItem("token", token);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       alert("Google Sign-In successful");

//       if (data.roleId?.name === "Admin") navigate("/admin");
//       else navigate("/user");

//     } catch (error) {
//       console.error("Google login failed:", error);
//       alert("Google login failed.");
//     }
//   };
     
//   const submitHandler = async (data) => {
//   // data.roleId = "68480a087e2eb1da1f656aec";
//   console.log(data)

//   try {
//     const res = await axios.post("/user/login", data);
//     console.log(res); // axios response object
//     console.log(res.data); // API response data
        
//     const token = res.data.token;
  
//     if (res.status === 200) {
//       alert("Login Successfully");
//       localStorage.setItem("userId", res.data.data._id);
//       localStorage.setItem("role", res.data.data.roleId.name);
//       localStorage.setItem("token", token)
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       // navigate("/")
//       //Redirect based on role
//       if (res.data.data.roleId.name === "User") {
//         navigate("/user");
//       } else if (res.data.data.roleId.name === "Admin") {
//         navigate("/admin");
//       }
//     }
//   } catch (err) {
//     console.error("Login Error:", err);
    
//     // Show alert based on server message or generic one
//     if (err.response && err.response.data && err.response.data.message) {
//       alert(err.response.data.message); // e.g., "invalid cred.." or "Email not found.."
//     } else {
//       // alert("Login failed. Please try again.");
//     }
//   }
// };

  
//   return (
//     <div>
//         <div className="modal-overlay" id="#signuphd" style={{textAlign:"center"}}>
//       <div className="modal-content bg-white p-4 rounded shadow-lg">
//         <h2 className="mb-3" >Admin SignIn</h2>
//         <form onSubmit={handleSubmit(submitHandler)}>
        
//           <div className="mb-2">
//             <label style={{float:'inline-start'}}>Email:</label>
//             <input type="email" className="form-control" id='email' {...register("email", validationSchema.emailValidator)} />
//             <small style={{color:'red'}}>{errors.email?.message}</small>
//           </div>

//           <div className="mb-2">
//             <label style={{float:"inline-start"}}>Password:</label>
//             <input type="password" className="form-control" id='password' {...register("password", validationSchema.passwordValidator)} />
//             <small style={{color:'red'}}>{errors.password?.message}</small>

//           </div>
//           {/* <div className="mb-3">
//             <label>Age:</label>
//             <input type="password" className="form-control" />
//           </div> */}
//           <button style={{marginTop:"20px"}} type="submit" className="btn btn-primary">Sign In</button>
//            <Link style={{marginTop:"20px"}} to="/" className="btn btn-secondary ms-2">Cancel</Link>

//           <br/>
//         </form>

//            <div id="googleSignInDiv" style={{ marginTop: "20px" }}></div>

//       <small>For Register...</small><a href='/signup'>SignUp</a>

//       </div>
//       </div>
//     </div>
//   )
// }