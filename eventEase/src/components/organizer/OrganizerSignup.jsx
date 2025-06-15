import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

export const OrganizerSignup = () => {

    const {register, handleSubmit , formState:{ errors }} = useForm()
    console.log(errors)
    const navigate = useNavigate()

    const validationSchema = {
        nameValidator:{
            required:{
                value:true,
                message:"Organizer Name is Required*"
            }
            
        },OnameValidator:{
            required:{
                value:true,
                message:"Organization name was required*"
            }
        },
        emailValidator:{
            required:{
                value:true,
                message:"email is required*"
            }
        },
        passwordValidator:{
            required:{
                value:true,
                message:"Password is required*"
            }
        },
        phoneValidator:{
            required:{
                value:true,
                message:"Phone number is required"
            }
        }
    }

    const submitHandler = async(data)=>{
        try{
            console.log(data)
            data.roleId = "68480b987e2eb1da1f656aef"
            const res  = await axios.post("/organizer/signup",data)
             
            if(res.status === 201 ){
                alert("Organizer registered..")
                navigate("/organizersignin")
            }else{
                alert("Organizer not register...")
            }
        }catch(err){
            console.error("Signup error:", err);
            alert("Register failed: " + (err.response?.data?.message || err.message));
        }
    }

  return (
    <div style={{textAlign:"center"}}>
        <div  className="modal-overlay" id="#signuphd">

      <div className="modal-content bg-white p-4 rounded shadow-lg">
        <h2 className="mb-3" >Register first,</h2><p>For Organize the Events</p>

        <form onSubmit={handleSubmit(submitHandler)}>
            <div className="mb-2">
            <label style={{float:"inline-start"}}>Full Name:</label>
            <input type="text" className="form-control" id="name" {...register("name", validationSchema.nameValidator)} />
             <small style={{color:'red'}}>{errors.name?.message}</small>
          </div>
          <div className="mb-2">
            <label style={{float:"inline-start"}}>Organization Name:</label>
            <input type="text" className="form-control" id="organizationName" {...register("organizationName", validationSchema.OnameValidator)} />
             <small style={{color:'red'}}>{errors.organizationName?.message}</small>
          </div>
          <div className="mb-2">
            <label style={{float:"inline-start"}}>Email:</label>
            <input type="email" className="form-control" id='email' {...register("email", validationSchema.emailValidator)} />
             <small style={{color:'red'}}>{errors.email?.message}</small>
          </div>
          <div className="mb-2">
            <label style={{float:"inline-start"}}>PhoneNo:</label>
            <input type="password" className="form-control" id='PhoneNo' {...register("PhoneNo", validationSchema.phoneValidator)} />
             <small style={{color:'red'}}>{errors.PhoneNo?.message}</small>
             </div>
          <div className="mb-2">
            <label style={{float:"inline-start"}}>Password:</label>
            <input type="password" className="form-control" id='password' {...register("password", validationSchema.passwordValidator)} />
             <small style={{color:'red'}}>{errors.password?.message}</small>
          </div>
          {/* <div className="mb-3">
            <label>Age:</label>
            <input type="password" className="form-control" />
          </div> */}
          <button style={{}} type="submit" className="btn btn-primary">Sign Up</button>
           <Link style={{}} to="/" className="btn btn-secondary ms-2">Cancel</Link>

          <br/>
        </form>
      <small >if,already SignUp?</small><a href='/organizersignin'>SignIn</a>

      </div>
    </div>
</div>
  )
}
