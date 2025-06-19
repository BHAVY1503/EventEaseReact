import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { useForm } from 'react-hook-form';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your Mapbox token

export const AddEvent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(72.8777); // default longitude (e.g., Mumbai)
  const [lat, setLat] = useState(19.0760); // default latitude
  const [zoom, setZoom] = useState(10);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const { register, handleSubmit, setValue } = useForm();

  const getAllStates = async () => {
    const res = await axios.get("/state/getallstates");
    setStates(res.data.data);
  };

  const getAllCities = async () => {
    const res = await axios.get("/city/getallcitys");
    setCities(res.data.data);
  };

  useEffect(() => {
    getAllStates();
    getAllCities();
  }, []);

  useEffect(() => {
    if (map.current) return;  //create map multiple time if the component re-renders
    map.current = new mapboxgl.Map({
      container: mapContainer.current,  //ref to div 
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    const marker = new mapboxgl.Marker({  // a pin user can move to select location
      draggable: true,
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      setLng(lngLat.lng);
      setLat(lngLat.lat);
      setValue("latitude", lngLat.lat);
      setValue("longitude", lngLat.lng);
    });

    // Initial values
    setValue("latitude", lat);
    setValue("longitude", lng);
  }, []);

  const submitHandler = async (data) => {
    data.organizerId = localStorage.getItem("organizerId");

    const formData = new FormData();
    for (const key in data) {
      if (key === "image") {
        formData.append(key, data[key][0]);  //for img
      } else {
        formData.append(key, data[key]);  //for other data
      }
    }

    try {
      const res = await axios.post("/event/addeventwithfile", formData);
      alert("Event added successfully!");
    } catch (err) {
      console.error("Event creation failed:", err);
      alert("Failed to add event");
    }
  };

  return (
    <div className='container mt-5'>
      <h2 className="text-center mb-4">Add Event</h2>
      <form onSubmit={handleSubmit(submitHandler)} className="shadow p-4 alert alert-primary">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Event Name</label>
            <input type="text" className="form-control" {...register("eventName")} required />
          </div>
          <div className="col-md-6 mb-3">
            <label>Event Type</label>
            <select className="form-control" {...register("eventType")} required>
              <option value="">Select Type</option>
              <option value='Conference'>Conference</option>
              <option value='Exhibition'>Exhibition</option>
              <option value='Gala Dinner'>Gala Dinner</option>
              <option value='Incentive'>Incentive</option>
              <option value='Music Consert'>Music Consert</option>
              <option value='Meeting'>Meeting</option>
              <option value='ZoomMeeting'>Zoom Meeting</option>
              <option value='Other'>Other</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label>Zoom URL</label>
            <input type="text" className="form-control" {...register("zoomUrl")} />
          </div>
          <div className="col-md-6 mb-3">
            <label>Number of Seats</label>
            <input type="number" className="form-control" {...register("numberOfSeats")} required />
          </div>

          <div className="col-md-6 mb-3">
            <label>State</label>
            <select className="form-control" {...register("stateId")} required>
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state._id} value={state._id}>{state.Name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label>City</label>
            <select className="form-control" {...register("cityId")} required>
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city._id} value={city._id}>{city.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-12 mb-3">
            <label>Location Link</label>
            <input type="text" className="form-control" {...register("location")} />
          </div>

          <div className="col-md-6 mb-3">
            <label>Start Date</label>
            <input type="date" className="form-control" {...register("startDate")} required />
          </div>
          <div className="col-md-6 mb-3">
            <label>End Date</label>
            <input type="date" className="form-control" {...register("endDate")} required />
          </div>

          <div className="col-md-12 mb-3">
            <label>Upload Image</label>
            <input type="file" className="form-control" {...register("image")} required />
          </div>

          {/* Hidden lat/lng fields */}
          <input type="hidden" {...register("latitude")} />
          <input type="hidden" {...register("longitude")} />

          <div className="col-md-6 mb-3">
            <label>Select Event Location on Map</label>
            <div ref={mapContainer} style={{ height: '300px', borderRadius: "10px" }} />
          </div>

          <div className="col-md-12 text-center">
            <button type="submit" className="btn btn-primary mt-3">Add Event</button>
          </div>
        </div>
      </form>
    </div>
  );
};


// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'

// export const AddEvent = () => {

//    const [states, setstate] = useState([])
//    const [cities, setcities] = useState([])
// //    const [filteredCities, setFilteredCities] = useState([]);


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

//     useEffect(()=>{
//     getAllStates();
//     getAllCities();
//    },[])
   
  

//     const {register, handleSubmit } = useForm()
//     // const navigate = useNavigate()

//     const submitHandler = async(data)=>{
//         data.organizerId = localStorage.getItem("organizerId")
//         console.log(data)
//         console.log(data.image[0])

//         const formData = new FormData();
//         formData.append("eventName",data.eventName);
//         formData.append("eventType",data.eventType);
//         formData.append("zoomUrl",data.zoomUrl);
//         formData.append("numberOfSeats",data.numberOfSeats);
//         formData.append("stateId",data.stateId);
//         formData.append("cityId",data.cityId);
//         formData.append("location",data.location);
//         formData.append("startDate",data.startDate);
//         formData.append("endDate",data.endDate);
//         formData.append("image",data.image[0]);
//         formData.append("organizerId",data.organizerId)

//         // formData.append("userId",data.userId)
//  try{
//     const res = await axios.post("/event/addeventwithfile",formData)
//     console.log(res)
//     console.log(res.data)
//      alert("Event add successfully.. please Refresh your page..")
//     // navigate("/organizer/viewevent")
    
   
//     }catch(err){
//             console.error("fail to add...", err);
//              alert("Failed to add event");
//      }
//     }

//   return (
//     <div> 
//       <h1 style={{textAlign:'center', marginTop:"200px"}}>ADD NEW EVENTS..! </h1>
//     {/* <div className='' style={{backgroundColor:'', height:"900px", }}> */}
//     <div className='container mt-6 ' id='addevent' style={{padding:"100px"}} >
//     <div className='card p-4 shadow alert alert-primary'  >
//  <form onSubmit={handleSubmit(submitHandler)} >
//     <h1 style={{textAlign:'center', marginBottom:'70px', fontFamily:'sans-serif',color:"#555"}}>Add Event</h1>
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
//         <option value="Music Consert">Music consert</option>
//         <option value='Meeting'> Meeting</option>
//         <option value="ZoomMeeting">ZoomMeeting</option>
//         <option value='Other'>Other</option>
//       </select>
//     </div>
//   </div>
//   <div className="form-row">
//   <div className="form-group col-md-6">
//       <label htmlFor="inputPassword4">ZOOM Url</label>
//       <input
//         type="text"
//         className="form-control"
//         id="zoomUrl"
//         placeholder="Enter Zoommeeting Link"
//         {...register("zoomUrl")}
//       />
//     </div>
//   <div className="form-group col-md-6">
//     <label htmlFor="inputAddress2">Number Of Seats</label>
//     <input
//       type="number"
//       className="form-control"
//       id="numberOfSeats"
//       placeholder="total seats"
//       {...register("numberOfSeats")}
//     />
//     </div>
//   </div>
//   <div className="form-row">
//     <div className="form-group col-md-6">
//       <label htmlFor="inputCity">State</label>
//        <select id="stateId" className="form-control" 
//        {...register("stateId")} 
//       >
//         <option value="">Select State</option>
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
//     <div className="form-group col-md-12">
//       <label htmlFor="inputPassword4">Location</label>
//       <input
//         type="text"
//         className="form-control"
//         id="location"
//         placeholder="Location Url.."
//         {...register("location")}
//       />
//     </div><br/>
//     {/* <div className='form-row'> */}
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
//     {/* </div> */}
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
//   <button type="submit" className="btn btn-primary btn-md btn-block" style={{width:"50vh" , marginLeft:"270px"}} >
//     Submit
//   </button>
// </form>

//     </div>
//     </div>
//     </div>
//     // </div>

//   )
// }







