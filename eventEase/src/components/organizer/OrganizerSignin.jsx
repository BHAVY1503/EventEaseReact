import { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Ticket, ShieldCheck, X, ArrowRight } from "lucide-react"

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { organizerLogin, googleLogin } from "../../features/auth/authSlice";

export const OrganizerSignin = () => {
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
        message: "Password is required*"
      },
      minLength: {
        value: 6,
        message: "Minimum 6 characters required"
      }
    }
  }

  // ✅ Updated Google Sign-In effect with cancel() cleanup
  useEffect(() => {
    const loadGoogleSignIn = () => {
      const googleDiv = document.getElementById("googleSignInDiv");

      if (window.google && googleDiv) {
        try {
          // 🧹 Clear previous instance to prevent 403 conflicts
          if (window.google?.accounts?.id) {
            window.google.accounts.id.cancel();
          }

          // ⚙️ Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
          });

          // 🧱 Render Google Sign-In button
          window.google.accounts.id.renderButton(googleDiv, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: googleDiv.offsetWidth,
          });

          setIsGoogleLoaded(true);
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
        }
      } else {
        // Retry until SDK loads
        setTimeout(loadGoogleSignIn, 1000);
      }
    };

    loadGoogleSignIn();

    // Cleanup when unmounted
    return () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.error("Error cleaning up Google Sign-In:", error);
        }
      }
    };
  }, []);

  // ✅ Handle Google Login response
  const handleGoogleResponse = async (response) => {
    try {
      const result = await dispatch(googleLogin({ token: response.credential, type: 'organizer' })).unwrap();
      const { data } = result;
      if (data.roleId?.name === "Admin") navigate("/admin");
      else navigate("/organizer");
    } catch (err) {
      console.error("Google login failed:", err);
      alert(err || "Google login failed. Please try again.");
    }
  };

  // ✅ Normal Sign-In (email + password)
  const submitHandler = async (data) => {
    try {
      const res = await dispatch(organizerLogin(data)).unwrap();
      const { token, data: userData } = res;
      const role = userData.roleId.name;
      
      // Ensure token is stored
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userData._id);
      localStorage.setItem("role", role);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      if (role === "Organizer") {
        navigate("/organizer");
      } else {
        alert("Access denied, This login is for Organizers only");
      }
    } catch (err) {
      console.error("Signin Error", err);
      alert(err || "Sign in failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) navigate('/', { replace: true }); }}>
      <DialogContent className="max-w-4xl bg-black border border-white/5 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[1000] rounded-[2rem] max-h-[85vh]">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[85vh]">
           {/* Visual Side (40%) */}
           <div className="hidden md:flex md:col-span-5 relative bg-[#050505] p-10 lg:p-12 flex-col justify-between border-r border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] -ml-32 -mb-32" />

              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                       <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.5em] text-white">EventEase <span className="text-blue-500">Pro</span></span>
                 </div>
                 
                 <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-8">
                    ACCESS THE<br />CONTROL
                 </h2>
                 <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-[240px]">
                    Enter your professional credentials to manage your events, tickets, and attendees.
                 </p>
              </div>

              <div className="relative z-10 flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4 text-blue-500" /> Secure Pro Access
                 </div>
              </div>
           </div>

           {/* Form Side (60%) */}
           <div className="md:col-span-7 p-10 md:p-12 bg-black flex flex-col overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-16">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 text-glow">Pro Portal</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500" />
                 </div>
                 <button onClick={() => { setIsOpen(false); navigate('/'); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleSubmit(submitHandler)} className="space-y-12">
                 <div className="relative group">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Transmission ID</p>
                    <input
                       {...register("email", validationSchema.emailValidator)}
                       type="email"
                       placeholder="EMAIL@DOMAIN.COM"
                       className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-blue-500 placeholder:text-gray-500 outline-none transition-colors"
                    />
                    {errors.email && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.email.message}</p>}
                 </div>

                 <div className="relative group">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Access Key</p>
                    <input
                       {...register("password", validationSchema.passwordValidator)}
                       type="password"
                       placeholder="••••••••"
                       className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] focus:ring-0 focus:border-blue-500 placeholder:text-gray-500 outline-none transition-colors"
                    />
                    {errors.password && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.password.message}</p>}
                 </div>

                 {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest text-center">
                       {typeof error === 'string' ? error : "AUTHENTICATION FAILED"}
                    </div>
                 )}

                 <div className="space-y-8 pt-4">
                    <Button
                       type="submit"
                       disabled={isLoading}
                       className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full text-xs font-black tracking-[0.4em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transform hover:scale-[1.01]"
                    >
                       {isLoading ? "AUTHENTICATING..." : "INITIATE PRO LOGIN"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5"></span>
                      </div>
                      <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em]">
                        <span className="bg-black px-4 text-gray-700">Protocol Auth</span>
                      </div>
                    </div>

                    <div className="flex justify-center items-center min-h-[48px]">
                      <div
                        id="googleSignInDiv"
                        className="w-full max-w-[300px] mx-auto filter grayscale hover:grayscale-0 transition-all duration-500"
                        style={{ minHeight: "48px" }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
                       <Link to="/organizersignup" className="hover:text-blue-500 transition-colors">Create Pro Identity</Link>
                       <Link to="/" className="hover:text-white transition-colors">Exit Portal</Link>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



// import { useState, useEffect } from 'react'
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

// export const OrganizerSignin = () => {
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
//         message: "Password is required*"
//       }
//     }
//   }

//   useEffect(() => {
//     const loadGoogleSignIn = () => {
//       if (window.google && document.getElementById("googleSignInDiv")) {
//         window.google.accounts.id.initialize({
//           client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com",
//           callback: handleGoogleResponse,
//         });

//         window.google.accounts.id.renderButton(
//           document.getElementById("googleSignInDiv"),
//           {
//               type: "standard",
//               theme: "filled_black",
//               size: "large",
//               text: "signin_with",
//               shape: "rectangular",
//               // width: googleDiv.offsetWidth,
//           }
//         );
//         setIsGoogleLoaded(true);
//       } else {
//         setTimeout(loadGoogleSignIn, 100);
//       }
//     };

//     loadGoogleSignIn();
//   }, []);

//   const handleGoogleResponse = async (response) => {
//     try {
//       const res = await axios.post("/organizer/googlelogin", {
//         token: response.credential,
//       });

//       const { token, data } = res.data;

//       localStorage.setItem("organizerId", data._id);
//       localStorage.setItem("role", data.roleId?.name || "Organizer");
//       localStorage.setItem("token", token);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       if (data.roleId?.name === "Admin") navigate("/admin");
//       else navigate("/organizer");

//     } catch (error) {
//       console.error("Google login failed:", error);
//       alert(error.response?.data?.message || "Google login failed");
//     }
//   };

//   const submitHandler = async (data) => {
//     try {
//       const res = await axios.post("/organizer/signin", data);
//       const role = res.data.data.roleId.name;
//       const token = res.data.token;

//       if (role === "Organizer") {
//         localStorage.setItem("organizerId", res.data.data._id);
//         localStorage.setItem("role", role);
//         localStorage.setItem("token", token);
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         navigate("/organizer");
//       } else {
//         alert("Access denied, This login is for Organizers only");
//       }
//     } catch (err) {
//       console.error("Signin Error", err);
//       alert(err.response?.data?.message || "Sign in failed. Please try again.");
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogContent className="sm:max-w-[425px] bg-black text-white p-6 rounded-lg shadow-lg">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-center">Organizer Sign In</DialogTitle>
//         </DialogHeader>
        
//         <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
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
//             <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200">
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

//           {/* <div className="flex justify-center items-center min-h-[40px]">
//             {isGoogleLoaded ? (
//               <div 
//                 id="googleSignInDiv"
//                 className="w-full flex justify-center"
//               />
//             ) : (
//               <div className="text-gray-500">Loading Google Sign-In...</div>
//             )}
//           </div> */}

//           <div className="text-center space-y-2">
//             <p className="text-sm text-gray-500">
//               Not registered yet? 
//               <Link to="/organizersignup" className="ml-1 text-blue-600 hover:underline">
//                 Sign Up
//               </Link>
//             </p>
//             <Link to="/" className="text-sm text-gray-500 hover:underline">
//               Back to Home
//             </Link>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// import axios from 'axios';
// import { jwtDecode } from "jwt-decode";
// import React, { useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { Link, useNavigate } from 'react-router-dom';

// export const OrganizerSignin = () => {

//     const {register, handleSubmit, formState: {errors} }= useForm();
//     console.log(errors)
//     const navigate = useNavigate()

//     const validationSchema ={
//         emailValidator:{
//             required:{
//                 value:true,
//                 message:"email is required"
//             }
//         },
//         passwordValidator:{
//             required:{
//                 value:true,
//                 message:"password is required"
//             }
//         }
//     }

//  useEffect(() => {
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
//       const res = await axios.post("/organizer/googlelogin", {
//         token: response.credential,
//       });

//       const { token, data } = res.data;

//       localStorage.setItem("organizerId", data._id);
//       localStorage.setItem("role", data.roleId?.name || "Organizer");
//       localStorage.setItem("token", token);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       alert("Google Sign-In successful");

//       if (data.roleId?.name === "Admin") navigate("/admin");
//       else navigate("/organizer");

//     } catch (error) {
//       console.error("Google login failed:", error);
//       alert("Google login failed.");
//     }
//   };

//     const submitHandler = async(data)=>{

//       try{
//         const res = await axios.post("/organizer/signin",data)
//         console.log(res)
//         console.log(res.data)
//         const role = res.data.data.roleId.name
//         const token = res.data.token;
//         if(role === "Organizer"){
//             alert("Signin Successfully")
//              localStorage.setItem("organizerId", res.data.data._id);
//              localStorage.setItem("role", role);
//              localStorage.setItem("token", token);
//               axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//              navigate("/organizer")
//         }else{
//         alert("Access denied, This login is for Admin only")
//      }
//       }catch(err){
//         console.error("Signin Error",err)
//        if (err.response && err.response.data && err.response.data.message) {
//       alert(err.response.data.message); // e.g., "invalid cred.." or "Email not found.."
//     } else {
//       alert("Signin failed. Please check your Candidate");
//     }
//   }
//     }

//   return (
//     <div>
//           <div className="modal-overlay" id="#signuphd" style={{textAlign:'center'}}>
//       <div className="modal-content bg-white p-4 rounded shadow-lg">
//         <h2 className="mb-3" >Sign In</h2>
//         <form onSubmit={handleSubmit(submitHandler)}>
        
//           <div className="mb-2">
//             <label style={{float:"inline-start"}}>Email:</label>
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

//               <div id="googleSignInDiv" style={{ marginTop: "20px" }}></div>
         
//       <small style={{marginTop:"10px"}}>if,not Register?</small><a href='/organizersignup'>SignUp</a>
//        </div>

//       </div>
//     </div>
//   )
// }
