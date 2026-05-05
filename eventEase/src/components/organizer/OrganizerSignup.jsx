import { useState } from 'react'
// axios not needed here; thunks handle API calls
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
import { organizerSignup } from "../../features/auth/authSlice";

export const OrganizerSignup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [isOpen, setIsOpen] = useState(true)

  const validationSchema = {
    nameValidator: {
      required: {
        value: true,
        message: "Full name is required*"
      },
      pattern: {
        value: /^[A-Za-z\s]{2,}$/,
        message: "Please enter a valid name"
      }
    },
    OnameValidator: {
      required: {
        value: true,
        message: "Organization name is required*"
      },
      minLength: {
        value: 2,
        message: "Organization name must be at least 2 characters"
      }
    },
    emailValidator: {
      required: {
        value: true,
        message: "Email is required*"
      },
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Please enter a valid email address"
      }
    },
    passwordValidator: {
      required: {
        value: true,
        message: "Password is required*"
      },
      minLength: {
        value: 8,
        message: "Password must be at least 8 characters"
      },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      }
    },
    phoneValidator: {
      required: {
        value: true,
        message: "Phone number is required*"
      },
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Please enter a valid 10-digit phone number"
      }
    }
  }

  const submitHandler = async (data) => {
    try {
      await dispatch(organizerSignup(data)).unwrap();
      navigate("/organizersignin")
    } catch (err) {
      console.error("Signup error:", err)
      alert(err || "Registration failed. Please try again.")
    }
  }



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
                    EMPOWER<br />YOUR VISION
                 </h2>
                 <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-[240px]">
                    Join the global network of elite event organizers. Scale your impact and reach millions.
                 </p>
              </div>

              <div className="relative z-10 flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4 text-blue-500" /> Professional Protocol
                 </div>
              </div>
           </div>

           {/* Form Side (60%) */}
           <div className="md:col-span-7 p-10 md:p-12 bg-black flex flex-col overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-16">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 text-glow">Organizer Registration</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500" />
                 </div>
                 <button onClick={() => { setIsOpen(false); navigate('/'); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleSubmit(submitHandler)} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative group">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Subject Name</p>
                       <input
                          {...register("name", validationSchema.nameValidator)}
                          type="text"
                          placeholder="FULL NAME"
                          className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-blue-500 placeholder:text-gray-500 outline-none transition-colors"
                       />
                       {errors.name && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.name.message}</p>}
                    </div>

                    <div className="relative group">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Organization</p>
                       <input
                          {...register("organizationName", validationSchema.OnameValidator)}
                          type="text"
                          placeholder="ENTITY NAME"
                          className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-blue-500 placeholder:text-gray-500 outline-none transition-colors"
                       />
                       {errors.organizationName && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.organizationName.message}</p>}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Phone Link</p>
                       <input
                          {...register("PhoneNo", validationSchema.phoneValidator)}
                          type="tel"
                          placeholder="+91 00000 00000"
                          className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black tracking-[0.2em] uppercase focus:ring-0 focus:border-blue-500 placeholder:text-gray-500 outline-none transition-colors"
                       />
                       {errors.PhoneNo && <p className="absolute -bottom-6 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{errors.PhoneNo.message}</p>}
                    </div>
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
                       {typeof error === 'string' ? error : "REGISTRATION FAILED"}
                    </div>
                 )}

                 <div className="space-y-8 pt-8">
                    <Button
                       type="submit"
                       disabled={isLoading}
                       className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full text-xs font-black tracking-[0.4em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transform hover:scale-[1.01]"
                    >
                       {isLoading ? "TRANSMITTING..." : "INITIATE ACCOUNT CREATION"}
                    </Button>

                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
                       Already Registered? <Link to="/organizersignin" className="text-blue-500 hover:underline ml-2">Access Pro Portal</Link>
                    </p>
                 </div>
              </form>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


// import axios from 'axios'
// import React from 'react'
// import { useForm } from 'react-hook-form'
// import { Link, useNavigate } from 'react-router-dom'

// export const OrganizerSignup = () => {

//     const {register, handleSubmit , formState:{ errors }} = useForm()
//     console.log(errors)
//     const navigate = useNavigate()

//     const validationSchema = {
//         nameValidator:{
//             required:{
//                 value:true,
//                 message:"Organizer Name is Required*"
//             }
            
//         },OnameValidator:{
//             required:{
//                 value:true,
//                 message:"Organization name was required*"
//             }
//         },
//         emailValidator:{
//             required:{
//                 value:true,
//                 message:"email is required*"
//             }
//         },
//         passwordValidator:{
//             required:{
//                 value:true,
//                 message:"Password is required*"
//             }
//         },
//         phoneValidator:{
//             required:{
//                 value:true,
//                 message:"Phone number is required"
//             }
//         }
//     }

//     const submitHandler = async(data)=>{
//         try{
//             console.log(data)
//             data.roleId = "68480b987e2eb1da1f656aef"
//             const res  = await axios.post("/organizer/signup",data)
             
//             if(res.status === 201 ){
//                 alert("Organizer registered..")
//                 navigate("/organizersignin")
//             }else{
//                 alert("Organizer not register...")
//             }
//         }catch(err){
//             console.error("Signup error:", err);
//             alert("Register failed: " + (err.response?.data?.message || err.message));
//         }
//     }

//   return (
//     <div style={{textAlign:"center"}}>
//         <div  className="modal-overlay" id="#signuphd">

//       <div className="modal-content bg-white p-4 rounded shadow-lg">
//         <h2 className="mb-3" >Register first,</h2><p>For Organize the Events</p>

//         <form onSubmit={handleSubmit(submitHandler)}>
//             <div className="mb-2">
//             <label style={{float:"inline-start"}}>Full Name:</label>
//             <input type="text" className="form-control" id="name" {...register("name", validationSchema.nameValidator)} />
//              <small style={{color:'red'}}>{errors.name?.message}</small>
//           </div>
//           <div className="mb-2">
//             <label style={{float:"inline-start"}}>Organization Name:</label>
//             <input type="text" className="form-control" id="organizationName" {...register("organizationName", validationSchema.OnameValidator)} />
//              <small style={{color:'red'}}>{errors.organizationName?.message}</small>
//           </div>
//           <div className="mb-2">
//             <label style={{float:"inline-start"}}>Email:</label>
//             <input type="email" className="form-control" id='email' {...register("email", validationSchema.emailValidator)} />
//              <small style={{color:'red'}}>{errors.email?.message}</small>
//           </div>
//           <div className="mb-2">
//             <label style={{float:"inline-start"}}>PhoneNo:</label>
//             <input type="password" className="form-control" id='PhoneNo' {...register("PhoneNo", validationSchema.phoneValidator)} />
//              <small style={{color:'red'}}>{errors.PhoneNo?.message}</small>
//              </div>
//           <div className="mb-2">
//             <label style={{float:"inline-start"}}>Password:</label>
//             <input type="password" className="form-control" id='password' {...register("password", validationSchema.passwordValidator)} />
//              <small style={{color:'red'}}>{errors.password?.message}</small>
//           </div>
//           {/* <div className="mb-3">
//             <label>Age:</label>
//             <input type="password" className="form-control" />
//           </div> */}
//           <button style={{}} type="submit" className="btn btn-primary">Sign Up</button>
//            <Link style={{}} to="/" className="btn btn-secondary ms-2">Cancel</Link>

//           <br/>
//         </form>
//       <small >if,already SignUp?</small><a href='/organizersignin'>SignIn</a>

//       </div>
//     </div>
// </div>
//   )
// }
