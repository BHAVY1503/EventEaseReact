import { useState } from 'react'
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
  DialogDescription,
} from "@/components/ui/dialog"

export const OrganizerSignup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)
      data.roleId = "68480b987e2eb1da1f656aef"
      const res = await axios.post("/organizer/signup", data)
      
      if (res.status === 201) {
        navigate("/organizersignin")
      }
    } catch (err) {
      console.error("Signup error:", err)
      alert(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[500px] bg-gradient-to-b from-gray-900 to-black text-white p-6 rounded-xl shadow-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 mb-6">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Become an Organizer
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 text-base">
            Start creating and managing amazing events
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <Input
                type="text"
                className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
                placeholder="John Doe"
                {...register("name", validationSchema.nameValidator)}
              />
              {errors.name && (
                <span className="text-sm text-red-400">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Organization Name</label>
              <Input
                type="text"
                className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
                placeholder="Your Organization"
                {...register("organizationName", validationSchema.OnameValidator)}
              />
              {errors.organizationName && (
                <span className="text-sm text-red-400">{errors.organizationName.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Email</label>
          <Input
            type="email"
            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
            placeholder="your@email.com"
            {...register("email", validationSchema.emailValidator)}
          />
          {errors.email && (
            <span className="text-sm text-red-400">{errors.email.message}</span>
          )}
        </div>
         
          <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Password</label>
          <Input
            type="password"
            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
            placeholder="••••••••"
            {...register("password", validationSchema.passwordValidator)}
          />
          {errors.password && (
            <span className="text-sm text-red-400">{errors.password.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Phone Number</label>
          <Input
            type="tel"
            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500"
            placeholder="1234567890"
            {...register("PhoneNo", validationSchema.phoneValidator)}
          />
          {errors.PhoneNo && (
            <span className="text-sm text-red-400">{errors.PhoneNo.message}</span>
          )}
        </div>



          <div className="flex flex-col gap-3 mt-6">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            
            <Link to="/" className="w-full">
              <Button 
                type="button"
                variant="outline" 
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Link>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/organizersignin" 
                  className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </form>
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
