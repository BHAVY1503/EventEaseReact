import axios from 'axios'
import { jwtDecode } from "jwt-decode";
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

export const AdminSignIn = () => {

    const {register, handleSubmit, formState: {errors}}= useForm()
    console.log(errors)
    const navigate = useNavigate()
   
    const validationSchema = {
        emailValidator:{
            required:{
                value:true,
                message:"email was required*"
            }
        },
        passwordValidator:{
            required:{
                value:true,
                message:"email was required"
            }
        }
    }

     useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "342037145091-qvhlig4d6tn8p35ho40kc8c468mpnqug.apps.googleusercontent.com", 
      callback: handleGoogleResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "filled_blue", size: "large", width: "10%" }
    );
  }, []);

  const handleGoogleResponse = async (response) => {
    const decoded = jwtDecode(response.credential); // optional
    console.log("Google credential decoded:", decoded);

    try {
      const res = await axios.post("/user/googlelogin", {
        token: response.credential,
      });

      const { token, data } = res.data;

      localStorage.setItem("userId", data._id);
      localStorage.setItem("role", data.roleId?.name || "User");
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      alert("Google Sign-In successful");

      if (data.roleId?.name === "Admin") navigate("/admin");
      else navigate("/user");

    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed.");
    }
  };
     
  const submitHandler = async (data) => {
  // data.roleId = "68480a087e2eb1da1f656aec";
  console.log(data)

  try {
    const res = await axios.post("/user/login", data);
    console.log(res); // axios response object
    console.log(res.data); // API response data
        
    const token = res.data.token;
  
    if (res.status === 200) {
      alert("Login Successfully");
      localStorage.setItem("userId", res.data.data._id);
      localStorage.setItem("role", res.data.data.roleId.name);
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // navigate("/")
      //Redirect based on role
      if (res.data.data.roleId.name === "User") {
        navigate("/user");
      } else if (res.data.data.roleId.name === "Admin") {
        navigate("/admin");
      }
    }
  } catch (err) {
    console.error("Login Error:", err);
    
    // Show alert based on server message or generic one
    if (err.response && err.response.data && err.response.data.message) {
      alert(err.response.data.message); // e.g., "invalid cred.." or "Email not found.."
    } else {
      // alert("Login failed. Please try again.");
    }
  }
};

  
  return (
    <div>
        <div className="modal-overlay" id="#signuphd" style={{textAlign:"center"}}>
      <div className="modal-content bg-white p-4 rounded shadow-lg">
        <h2 className="mb-3" >Admin SignIn</h2>
        <form onSubmit={handleSubmit(submitHandler)}>
        
          <div className="mb-2">
            <label style={{float:'inline-start'}}>Email:</label>
            <input type="email" className="form-control" id='email' {...register("email", validationSchema.emailValidator)} />
            <small style={{color:'red'}}>{errors.email?.message}</small>
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
          <button style={{marginTop:"20px"}} type="submit" className="btn btn-primary">Sign In</button>
           <Link style={{marginTop:"20px"}} to="/" className="btn btn-secondary ms-2">Cancel</Link>

          <br/>
        </form>

           <div id="googleSignInDiv" style={{ marginTop: "20px" }}></div>

      <small>For Register...</small><a href='/signup'>SignUp</a>

      </div>
      </div>
    </div>
  )
}