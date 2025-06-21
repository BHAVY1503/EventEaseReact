import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

export const UpdateEvent = () => {
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const navigate = useNavigate()
  const { id } = useParams()

  const { register, handleSubmit, reset } = useForm()

  const getAllStates = async () => {
    const res = await axios.get("/state/getallstates")
    setStates(res.data.data)
  }

  const getAllCities = async () => {
    const res = await axios.get("/city/getallcitys")
    setCities(res.data.data)
  }

  const fetchEventById = async () => {
    const res = await axios.get(`/event/geteventbyid/${id}`)
    const event = res.data.data
    event.startDate = event.startDate?.slice(0, 10)
    event.endDate = event.endDate?.slice(0, 10)
    reset(event)
  }

  useEffect(() => {
    getAllStates()
    getAllCities()
    fetchEventById()
  }, [])

  const submitHandler = async (data) => {
    const formData = new FormData()
    formData.append("eventName", data.eventName)
    formData.append("eventType", data.eventType)
    formData.append("zoomUrl", data.zoomUrl || "")
    formData.append("numberOfSeats", data.numberOfSeats)
    formData.append("stateId", data.stateId)
    formData.append("cityId", data.cityId)
    formData.append("location", data.location || "")
    formData.append("startDate", data.startDate)
    formData.append("endDate", data.endDate)

    if (data.image && data.image[0]) {
      formData.append("image", data.image[0])
    }

    try {
      const res = await axios.put(`/event/updateevent/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      alert("Event updated successfully!")
      navigate("/organizer")
    } catch (err) {
      console.error("Update failed:", err)
      alert("Failed to update event.")
    }
  }

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Update Event</h2>
      <div className="card shadow p-4">
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="row">
            <div className="form-group col-md-6">
              <label>Event Name</label>
              <input type="text" className="form-control" {...register("eventName")} required />
            </div>
            <div className="form-group col-md-6">
              <label>Event Type</label>
              <select className="form-control" {...register("eventType")} required>
                <option value="">Select Type</option>
                <option value="Conference">Conference</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Gala Dinner">Gala Dinner</option>
                <option value="Incentive">Incentive</option>
                <option value="ZoomMeeting">Zoom Meeting</option>
                <option value="Music Consert">Music Concert</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group col-md-6">
              <label>Zoom URL</label>
              <input type="text" className="form-control" {...register("zoomUrl")} />
            </div>
            <div className="form-group col-md-6">
              <label>Number of Seats</label>
              <input type="number" className="form-control" {...register("numberOfSeats")} required />
            </div>

            <div className="form-group col-md-6">
              <label>State</label>
              <select className="form-control" {...register("stateId")} required>
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state._id} value={state._id}>{state.Name}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-6">
              <label>City</label>
              <select className="form-control" {...register("cityId")} required>
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city._id} value={city._id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group col-md-12">
              <label>Location Link</label>
              <input type="text" className="form-control" {...register("location")} />
            </div>

            <div className="form-group col-md-6">
              <label>Start Date</label>
              <input type="date" className="form-control" {...register("startDate")} required />
            </div>
            <div className="form-group col-md-6">
              <label>End Date</label>
              <input type="date" className="form-control" {...register("endDate")} required />
            </div>

            <div className="form-group col-md-12">
              <label>Upload Image</label>
              <input type="file" className="form-control" {...register("image")} />
            </div>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-success">Update Event</button>
            <Link to="/organizer" className="btn btn-secondary ml-3">Back</Link>
          </div>
        </form>
      </div>
    </div>
  )
}


// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { Link, useNavigate, useParams } from 'react-router-dom'

// export const UpdateEvent = () => {

//    const [states, setstate] = useState([])
//    const [cities, setcities] = useState([])
// //    const [filteredCities, setFilteredCities] = useState([]);
//     const navigate = useNavigate()
//     const {id} = useParams()

//    const getAllStates = async(data)=>{
//     const res = await axios.get("/state/getallstates")
//     console.log(res.data)
//     setstate(res.data.data)
//    }

//    const getAllCities = async(data)=>{
//     const res = await axios.get("/city/getallcitys")
//     console.log(res.data)
//     setcities(res.data.data)
//    }

// //     const fetchEventById = async () => {
// //     const res = await axios.get("/event/geteventbyid/" + id);
// //     reset(res.data.data); // Set form values here

// //   };
//   const fetchEventById = async () => {
//   const res = await axios.get("/event/geteventbyid/" + id);
//   const event = res.data.data;

//   event.startDate = event.startDate?.slice(0, 10); // "2025-06-15T00:00:00.000Z" -> "2025-06-15"
//   event.endDate = event.endDate?.slice(0, 10);

//   reset(event); //  reset form with formatted data
// };


//     useEffect(()=>{
//     getAllStates();
//     getAllCities();
//     fetchEventById();

//    },[])
   
  

//     const {register, handleSubmit, reset } = useForm()
//     const submitHandler = async (data) => {
//   data.userId = localStorage.getItem("id");
//   delete data._id;

//   const formData = new FormData();
//   formData.append("eventName", data.eventName);
//   formData.append("eventType", data.eventType);
//   formData.append("numberOfSeats", data.numberOfSeats);
//   formData.append("stateId", data.stateId);
//   formData.append("cityId", data.cityId);
//   formData.append("startDate", data.startDate);
//   formData.append("endDate", data.endDate);

//   if (data.image && data.image[0]) {
//     formData.append("image", data.image[0]);
//   }

//   formData.append("userId", data.userId);

//   try {
//     const res = await axios.put(`/event/updateevent/${id}`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data", //  Required
//       },
//     });

//     console.log(res);
//     alert("Event updated successfully!");
//     navigate("/organizer/viewevent");
//   } catch (err) {
//     console.error("Failed to update event:", err);
//     alert("Failed to update event");
//   }
// };


//   return (
//     <div> 
//       <h1 style={{textAlign:'center', marginTop:"200px"}}>UPDATE EVENTS..! </h1>
//     <div style={{backgroundColor:'#555', height:"900px", }}>
//     <div className='container mt-6' id='addevent' style={{padding:"100px"}} >
//     <div className='card p-4 shadow'  >
//  <form onSubmit={handleSubmit(submitHandler)} >
//     <h1 style={{textAlign:'center', marginBottom:'70px', fontFamily:'sans-serif',color:"#555"}}>Update Event &#128516;</h1>
//   <div className="form-row">
//      <div className="form-group col-md-6">
//       <label htmlFor="inputPassword4">Event Name</label>
//       <input
//         type="text"
//         className="form-control"
//         id="eventName"
//         placeholder="Event Name..."
//         {...register("eventName")}
//       />
//     </div>
//     <div className="form-group col-md-6">
//       <label htmlFor="inputEmail4">EventType</label>
//      <select id="eventType" className="form-control" {...register("eventType")}>
//         <option value="">Select-Type</option>
//         <option value='Conference'>Conference</option>
//         <option value="Exhibition">Exhibition</option>
//         <option value="Gala Dinner">Gala Dinner</option>
//         <option value="Incentive">Incentive</option>
//         <option value="ZoomMetting">ZoomMeeting</option>
//         <option value="Music Consert">Music consert</option>
//         <option value='Meeting'> Meeting</option>
//         <option value='Other'>Other</option>
//       </select>
//     </div>
//   </div>

//    <div className="form-row">
//   <div className="form-group col-md-6">
//       <label htmlFor="inputPassword4">ZOOM Url</label>
//       <input
//         type="text"
//         className="form-control"
//         id="zoomUrl"
//         placeholder="your meetingUrl..."
//         {...register("zoomUrl")}
//       />
//     </div>
//   <div className="form-group">
//     <label htmlFor="inputAddress2">Number Of Seats</label>
//     <input
//       type="number"
//       className="form-control"
//       id="numberOfSeats"
//       placeholder="total seats"
//       {...register("numberOfSeats")}
//     />
//   </div>
//   </div>
//   <div className="form-row">
//     <div className="form-group col-md-6">
//       <label htmlFor="inputCity">State</label>
//        <select id="stateId" className="form-control" 
//        {...register("stateId")} 
//       >
//         <option value="">Select-State</option>
//         {states?.map((state)=>(
//         <option key={state._id} value={state._id}>{state.Name}</option>

//         ))}
//       </select>

//     </div>
//     <div className="form-group col-md-6">
//       <label htmlFor="inputZip">City</label>
//       <select id="cityId" className="form-control"
//       {...register("cityId")}>
//         <option value="">Select-City</option>
//          {cities?.map((city) => (
//                   <option key={city._id} value={city._id}>{city.name}</option>
//                 ))}
//       </select>
//     </div>
//      <div className="form-group col-md-12">
//       <label htmlFor="inputPassword4">Location</label>
//       <input
//         type="text"
//         className="form-control"
//         id="location"
//         placeholder="Location Url.."
//         {...register("location")}
//       />
//     </div>
    
//     <div className="form-group col-md-2">
//       <label htmlFor="inputZip">Start-Date</label>
//       <input type="date" className="form-control" id="startDate" 
//       {...register("startDate")}/>
//     </div>
//     <div className="form-group col-md-2">
//       <label htmlFor="inputZip">End-Date</label>
//       <input type="date" className="form-control" id="endDate" 
//       {...register("endDate")}/>
//     </div>
    
//     <div className="form-group col-md-10">
//       <label htmlFor="inputZip">Add Event Photo</label>
//       <input type="file" className="form-control" id='image'
//       {...register("image")} />
//     </div>
//   </div>
//   <div className="form-group">
//     {/* <div className="form-check">
//       <input className="form-check-input" type="checkbox" id="gridCheck" />
//       <label className="form-check-label" htmlFor="gridCheck">
//         Check me out
//       </label>
//     </div> */}
//   </div>
//   <button type="submit" className="btn btn-success">
//     Update
//   </button>
//   <Link to="/organizer" className='btn btn-info'style={{float:"inline-end"}}>Back to Home</Link>
// </form>

//     </div>
//     </div>
//     </div>
//     </div>

//   )
// }