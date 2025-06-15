import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

export const AddEvent = () => {

   const [states, setstate] = useState([])
   const [cities, setcities] = useState([])
//    const [filteredCities, setFilteredCities] = useState([]);


   const getAllStates = async(data)=>{
    const res = await axios.get("/state/getallstates")
    console.log(res.data)
    setstate(res.data.data)
   }

   const getAllCities = async(data)=>{
    const res = await axios.get("/city/getallcitys")
    console.log(res.data)
    setcities(res.data.data)
   }

    useEffect(()=>{
    getAllStates();
    getAllCities();
   },[])
   
  

    const {register, handleSubmit } = useForm()
    const navigate = useNavigate()

    const submitHandler = async(data)=>{
        data.userId = localStorage.getItem("id")
        console.log(data)
        console.log(data.image[0])

        const formData = new FormData();
        formData.append("eventName",data.eventName);
        formData.append("eventType",data.eventType);
        formData.append("numberOfSeats",data.numberOfSeats);
        formData.append("stateId",data.stateId);
        formData.append("cityId",data.cityId);
        formData.append("startDate",data.startDate);
        formData.append("endDate",data.endDate);
        formData.append("image",data.image[0]);
        formData.append("userId",data.userId)
 try{
    const res = await axios.post("/event/addeventwithfile",formData)
    console.log(res)
    console.log(res.data)
     alert("Event add successfully..")
    navigate("/organizer")
    
   
    }catch(err){
            console.error("fail to add...", err);
             alert("Failed to add event");
     }
    }

  return (
    <div> 
      <h1 style={{textAlign:'center', marginTop:"200px"}}>ADD NEW EVENTS..! </h1>
    <div style={{backgroundColor:'#555', height:"900px", }}>
    <div className='container mt-6' id='addevent' style={{padding:"100px"}} >
    <div className='card p-4 shadow'  >
 <form onSubmit={handleSubmit(submitHandler)} >
    <h1 style={{textAlign:'center', marginBottom:'70px', fontFamily:'sans-serif',color:"#555"}}>Add Event &#128516;</h1>
  <div className="form-row">
     <div className="form-group col-md-6">
      <label htmlFor="inputPassword4">Event Name</label>
      <input
        type="text"
        className="form-control"
        id="eventName"
        placeholder="Event Name..."
        {...register("eventName")}
      />
    </div>
    <div className="form-group col-md-6">
      <label htmlFor="inputEmail4">EventType</label>
     <select id="eventType" className="form-control" {...register("eventType")}>
        <option value="">Select-Type</option>
        <option value='Conference'>Conference</option>
        <option value="Exhibition">Exhibition</option>
        <option value="Gala Dinner">Gala Dinner</option>
        <option value="Incentive">Incentive</option>
        <option value="ZoomMetting">ZoomMeeting</option>
        <option value="Music Consert">Music consert</option>
        <option value='Meeting'> Meeting</option>
        <option value='Other'>Other</option>
      </select>
    </div>
  </div>
 
  <div className="form-group">
    <label htmlFor="inputAddress2">Number Of Seats</label>
    <input
      type="number"
      className="form-control"
      id="numberOfSeats"
      placeholder="total seats"
      {...register("numberOfSeats")}
    />
  </div>
  <div className="form-row">
    <div className="form-group col-md-6">
      <label htmlFor="inputCity">State</label>
       <select id="stateId" className="form-control" 
       {...register("stateId")} 
      >
        <option value="">Select-State</option>
        {states?.map((state)=>(
        <option key={state._id} value={state._id}>{state.Name}</option>

        ))}
      </select>

    </div>
    <div className="form-group col-md-6">
      <label htmlFor="inputZip">City</label>
      <select id="cityId" className="form-control"
      {...register("cityId")}>
        <option value="">Select-City</option>
         {cities?.map((city) => (
                  <option key={city._id} value={city._id}>{city.name}</option>
                ))}
      </select>
    </div>
    <div className="form-group col-md-2">
      <label htmlFor="inputZip">Start-Date</label>
      <input type="date" className="form-control" id="startDate" 
      {...register("startDate")}/>
    </div>
    <div className="form-group col-md-2">
      <label htmlFor="inputZip">End-Date</label>
      <input type="date" className="form-control" id="endDate" 
      {...register("endDate")}/>
    </div>
    <div className="form-group col-md-10">
      <label htmlFor="inputZip">Add Event Photo</label>
      <input type="file" className="form-control" id='image'
      {...register("image")} />
    </div>
  </div>
  <div className="form-group">
    {/* <div className="form-check">
      <input className="form-check-input" type="checkbox" id="gridCheck" />
      <label className="form-check-label" htmlFor="gridCheck">
        Check me out
      </label>
    </div> */}
  </div>
  <button type="submit" className="btn btn-primary">
    Submit
  </button>
</form>

    </div>
    </div>
    </div>
    </div>

  )
}
