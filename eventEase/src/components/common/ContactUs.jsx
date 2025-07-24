import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { Label } from "@/components/ui/label";
// import { Icons } from "@/components/icons";

export const ContactUs = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { toast } = useToast();

  const submitHandler = async (data) => {
    try {
      const res = await axios.post("/contactus", data);
      toast({
        title: "Success!",
        description: "Your message has been sent successfully.",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Get in Touch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company / Organization</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your organization"
                  {...register("company", { required: "Company is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  type="tel"
                  placeholder="Your phone number"
                  {...register("phoneNo", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  type="text"
                  placeholder="Type of event"
                  {...register("eventType", { required: "Event type is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">How did you hear about us?</Label>
                <Input
                  id="question"
                  type="text"
                  placeholder="Optional"
                  {...register("question")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                {...register("message", { required: "Message is required" })}
                className="min-h-[120px]"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
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
