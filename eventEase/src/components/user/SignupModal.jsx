import React from 'react';
import axios from 'axios';
import "../../assets/SignUpModel.css"
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'

export const SignUpModal = ({ onClose }) => {
  
    const {register, handleSubmit, formState:{errors}} = useForm()
    console.log(errors)
    const navigate = useNavigate();

   const validationSchema={
    emailValidator:{
        required:{
            value:true,
            message:"email was required"
        }
    },
    fNameValidator:{
        required:{
            value:true,
            message:"fullname was required*"
        }
    },
    passwordValidator:{
        required:{
            value:true,
            message:"password was required"
        }
    }

   }
   const submitHandler = async (data) => {
  try {
    console.log(data);
    data.roleId = "68480a087e2eb1da1f656aec";
    const res = await axios.post("/user", data);
    console.log(res);
    console.log(res.data);

    if (res.status === 201) {
      alert("Signup Successfully");
      navigate("/signin");
    } else {
      alert("User not created");
    }
  } catch (err) {
    console.error("Signup error:", err);
    alert("Signup failed: " + (err.response?.data?.message || err.message));
  }
};

   
    
  return (
    <div className="modal-overlay" id="#signuphd">
      <div className="modal-content bg-white p-4 rounded shadow-lg">
        <h2 className="mb-3" >Sign Up</h2>
        <form onSubmit={handleSubmit(submitHandler)}>
            <div className="mb-2">
            <label>Full Name:</label>
            <input type="text" className="form-control" id="fullName" {...register("fullName", validationSchema.fNameValidator)} />
             <small style={{color:'red'}}>{errors.fullName?.message}</small>
          </div>
          <div className="mb-2">
            <label>Email:</label>
            <input type="email" className="form-control" id='email' {...register("email", validationSchema.emailValidator)} />
             <small style={{color:'red'}}>{errors.email?.message}</small>

          </div>
          <div className="mb-2">
            <label>Password:</label>
            <input type="password" className="form-control" id='password' {...register("password", validationSchema.passwordValidator)} />
             <small style={{color:'red'}}>{errors.password?.message}</small>

          </div>
          {/* <div className="mb-3">
            <label>Age:</label>
            <input type="password" className="form-control" />
          </div> */}
          <button type="submit" className="btn btn-primary">Sign Up</button>
           <Link to="/" className="btn btn-secondary ms-2">Cancel</Link>

          <br/>
        </form>
      <small>if,already SignUp?</small><a href='/signin'>SignIn</a>

      </div>
    </div>
  );
};
