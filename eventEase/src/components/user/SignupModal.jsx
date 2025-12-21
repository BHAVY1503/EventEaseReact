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
} from "@/components/ui/dialog"

export const SignUpModal = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)

  const validationSchema = {
    emailValidator: {
      required: {
        value: true,
        message: "Email is required*"
      }
    },
    fNameValidator: {
      required: {
        value: true,
        message: "Full name is required*"
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
    },
    phoneNoValidator: {
      required: {
        value: true,
        message: "Phone number is required*"
      }
    }
  }

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/user", data);

      if (res.status === 201) {
        navigate("/signin");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert(err.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-black text-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Sign Up</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              type="text"
              placeholder="Enter your full name.."
              className="bg-transparent border-gray-600"
              {...register("fullName", validationSchema.fNameValidator)}
            />
            {errors.fullName && (
              <span className="text-sm text-red-500">{errors.fullName.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enetr your email.."
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
              placeholder="Enter your password.."
              className="bg-transparent border-gray-600"
              {...register("password", validationSchema.passwordValidator)}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="Enter your phone number.."
              className="bg-transparent border-gray-600"
              {...register("phoneNumber", validationSchema.phoneNoValidator)}
            />
            {errors.phoneNumber && (
              <span className="text-sm text-red-500">{errors.phoneNumber.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-800">
              Sign Up
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full bg-white text-black  border-gray-600 hover:bg-black-800">
                Cancel
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account?
              <Link to="/signin" className="ml-1 text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// import React from 'react';
// import axios from 'axios';
// import "../../assets/SignUpModel.css"
// import { Link, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form'

// export const SignUpModal = ({ onClose }) => {
  
//     const {register, handleSubmit, formState:{errors}} = useForm()
//     console.log(errors)
//     const navigate = useNavigate();

//    const validationSchema={
//     emailValidator:{
//         required:{
//             value:true,
//             message:"email was required"
//         }
//     },
//     fNameValidator:{
//         required:{
//             value:true,
//             message:"fullname was required*"
//         }
//     },
//     passwordValidator:{
//         required:{
//             value:true,
//             message:"password was required"
//         }
//     },
//     phoneNoValidator:{
//       required:{
//         value:true,
//         message:"mobile number is required.."
//       }
//     }

//    }
//    const submitHandler = async (data) => {
//   try {
//     console.log(data);
//     data.roleId = "68480a087e2eb1da1f656aec";
//     const res = await axios.post("/user", data);
//     console.log(res);
//     console.log(res.data);

//     if (res.status === 201) {
//       alert("Signup Successfully");
//       navigate("/signin");
//     } else {
//       alert("User not created");
//     }
//   } catch (err) {
//     console.error("Signup error:", err);
//     alert("Signup failed: " + (err.response?.data?.message || err.message));
//   }
// };

   
    
//   return (
//     <div className="modal-overlay" id="#signuphd">
//       <div className="modal-content bg-white p-4 rounded shadow-lg">
//         <h2 className="mb-3" >Sign Up</h2>
//         <form onSubmit={handleSubmit(submitHandler)}>
//             <div className="mb-2">
//             <label>Full Name:</label>
//             <input type="text" className="form-control" id="fullName" {...register("fullName", validationSchema.fNameValidator)} />
//              <small style={{color:'red'}}>{errors.fullName?.message}</small>
//           </div>
//           <div className="mb-2">
//             <label>Email:</label>
//             <input type="email" className="form-control" id='email' {...register("email", validationSchema.emailValidator)} />
//              <small style={{color:'red'}}>{errors.email?.message}</small>

//           </div>
//           <div className="mb-2">
//             <label>Password:</label>
//             <input type="password" className="form-control" id='password' {...register("password", validationSchema.passwordValidator)} />
//              <small style={{color:'red'}}>{errors.password?.message}</small>
//          </div>
//           <div className="mb-2">
//             <label>PhoneNo:</label>
//             <input type="number" className="form-control" id='phoneNumber' {...register("phoneNumber", validationSchema.phoneNoValidator)} />
//              <small style={{color:'red'}}>{errors.phoneNumber?.message}</small>
//          </div>
//           {/* <div className="mb-3">
//             <label>Age:</label>
//             <input type="password" className="form-control" />
//           </div> */}
//           <button type="submit" className="btn btn-primary">Sign Up</button>
//            <Link to="/" className="btn btn-secondary ms-2">Cancel</Link>

//           <br/>
//         </form>
//       <small>if,already SignUp?</small><a href='/signin'>SignIn</a>

//       </div>
//     </div>
//   );
// };
