import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="bg-gradient-to-br from-gray-900 to-gray-700 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  placeholder="Enter name"
                  {...register("name")}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Company / Organization"
                  {...register("company")}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Phone Number"
                  {...register("phoneNo")}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Event Type"
                  {...register("eventType")}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="How did you hear about us?"
                  {...register("question")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
            </div>
            <div>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows="4"
                placeholder="Type your message..."
                {...register("message")}
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" className="px-8">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
