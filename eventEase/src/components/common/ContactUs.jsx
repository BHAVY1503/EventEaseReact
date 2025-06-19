import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

export const ContactUs = () => {
  const { register, handleSubmit } = useForm();

  const submitHandler = async (data) => {
    try {
      const res = await axios.post("/contactus", data);
      console.log(data);
      console.log(res.data.data);

      if (res.status === 201) {
        alert("Message sent successfully.");
      } else {
        alert("Message not sent.");
      }
    } catch (err) {
      console.error(err);
      alert("Sending failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      className="container p-5 mt-5 mb-5 text-white"
      style={{
        background: 'linear-gradient(135deg, #1f1c2c, #928dab)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <h3 className="text-center mb-4">Contact Us</h3>
      <form onSubmit={handleSubmit(submitHandler)} className="row">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter name"
            {...register("name")}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Company / Organization"
            {...register("company")}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            {...register("email")}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Phone Number"
            {...register("phoneNo")}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Event Type"
            {...register("eventType")}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="How did you hear about us?"
            {...register("question")}
          />
        </div>
        <div className="col-md-12 mb-3">
          <textarea
            className="form-control"
            rows="4"
            placeholder="Type your message..."
            {...register("message")}
            required
          ></textarea>
        </div>
        <div className="col-12 text-end">
          <button type="submit" className="btn btn-light px-4">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};


// import axios from 'axios'
// import React, { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'

// export const ContactUs = () => {

//     const {register, handleSubmit } = useForm()
//     // console.log(errors)
//     const navigate = useNavigate()

//     const submitHandler = async(data)=>{
//       try{
//         const res = await axios.post("/contactus",data)
//         console.log(data)
//         console.log(res.data.data)

//         if(res.status === 201){
//             alert("message send successfully..")
            
//         }else{
//             alert("message not send..")
//         }
//     }catch(err){
//         console.error(err)
//          alert("Sending failed: " + (err.response?.data?.message || err.message));
//     }
//     }
    

//   return (
//          <div>
//      <div className="container shadow p-4 mt-5 alert alert-primary">
//           <h4 className="mb-3">Leave Your Feedback</h4>
//           <form onSubmit={handleSubmit(submitHandler)} className="row justify-content-center">
          
//             </div>
//             <div className="col-md-6 mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Company / organization "
//                 id='compny'
//                 required
//                {...register("company")}
//               />
//             </div>
//             <div className="col-md-6 mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="email"
//                 id='email'
//                 required
//                {...register("email")}
//               />
//             </div>
//              <div className="col-md-6 mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Phone Number"
//                 id='phoneNo'
//                 required
//                {...register("phoneNo")}
//               />
//             </div>
//             <div className="col-md-6 mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Event-Type"
//                 id='eventType'
//                 required
//                {...register("eventType")}
//               />
//             </div>
//              <div className="col-md-6 mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="How did you hear about us "
//                 id='question'
//                 // required
//                {...register("question")}
//               />
//             </div>
//             <div className="col-md-12 mb-3">
//               <textarea
//                 className="form-control"
//                 rows="3"
//                 placeholder="Type message"
//                 id='message'
//                 {...register("message")}
//                 required
//               ></textarea>
//             </div>
//             <div className="col-md-12" style={{marginLeft:'950px'}}>
//               <button type="submit" className="btn btn-outline-primary"  >
//                 Submit
//               </button>
//             </div>
//           </form>
//         </div>
       
    
//   )
// }
