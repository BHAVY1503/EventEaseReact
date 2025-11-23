import { useState, useEffect } from 'react'
import axios from 'axios'
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

export const OrganizerSignin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
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
      const res = await axios.post("/organizer/googlelogin", {
        token: response.credential,
      });

      const { token, data } = res.data;

      localStorage.setItem("organizerId", data._id);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("role", data.roleId?.name || "Organizer");
      localStorage.setItem("token", token);
      localStorage.setItem("isVerified", data.isVerified ? "true" : "false");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (data.roleId?.name === "Admin") navigate("/admin");
      else navigate("/organizer");

    } catch (error) {
      console.error("Google login failed:", error);
      alert(error.response?.data?.message || "Google login failed. Please try again.");
    }
  };

  // ✅ Normal Sign-In (email + password)
  const submitHandler = async (data) => {
    try {
      const res = await axios.post("/organizer/signin", data);
      const role = res.data.data.roleId.name;
      const token = res.data.token;

      if (role === "Organizer") {
        localStorage.setItem("organizerId", res.data.data._id);
        localStorage.setItem("userId", res.data.data._id);
        localStorage.setItem("role", role);
        localStorage.setItem("token", token);
        localStorage.setItem("isVerified", res.data.data.isVerified ? "true" : "false");
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        navigate("/organizer");
      } else {
        alert("Access denied, This login is for Organizers only");
      }
    } catch (err) {
      console.error("Signin Error", err);
      alert(err.response?.data?.message || "Sign in failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-black text-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Organizer Sign In
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {/* Email */}
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

          {/* Password */}
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

          {/* Submit */}
          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-900">
              Sign In
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center items-center min-h-[48px] my-4">
            <div
              id="googleSignInDiv"
              className="w-full max-w-[300px] mx-auto"
              style={{ minHeight: "48px" }}
            />
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Not registered yet?
              <Link
                to="/organizersignup"
                className="ml-1 text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
            <Link to="/" className="text-sm text-gray-500 hover:underline">
              Back to Home
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
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
