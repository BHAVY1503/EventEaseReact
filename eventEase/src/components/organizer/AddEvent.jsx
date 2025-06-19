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
    // const navigate = useNavigate()

    const submitHandler = async(data)=>{
        data.organizerId = localStorage.getItem("organizerId")
        console.log(data)
        console.log(data.image[0])

        const formData = new FormData();
        formData.append("eventName",data.eventName);
        formData.append("eventType",data.eventType);
        formData.append("zoomUrl",data.zoomUrl);
        formData.append("numberOfSeats",data.numberOfSeats);
        formData.append("stateId",data.stateId);
        formData.append("cityId",data.cityId);
        formData.append("location",data.location);
        formData.append("startDate",data.startDate);
        formData.append("endDate",data.endDate);
        formData.append("image",data.image[0]);
        formData.append("organizerId",data.organizerId)

        // formData.append("userId",data.userId)
 try{
    const res = await axios.post("/event/addeventwithfile",formData)
    console.log(res)
    console.log(res.data)
     alert("Event add successfully.. please Refresh your page..")
    // navigate("/organizer/viewevent")
    
   
    }catch(err){
            console.error("fail to add...", err);
             alert("Failed to add event");
     }
    }

  return (
    <div> 
      <h1 style={{textAlign:'center', marginTop:"200px"}}>ADD NEW EVENTS..! </h1>
    {/* <div className='' style={{backgroundColor:'', height:"900px", }}> */}
    <div className='container mt-6 ' id='addevent' style={{padding:"100px"}} >
    <div className='card p-4 shadow alert alert-primary'  >
 <form onSubmit={handleSubmit(submitHandler)} >
    <h1 style={{textAlign:'center', marginBottom:'70px', fontFamily:'sans-serif',color:"#555"}}>Add Event</h1>
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
        <option value="Music Consert">Music consert</option>
        <option value='Meeting'> Meeting</option>
        <option value="ZoomMeeting">ZoomMeeting</option>
        <option value='Other'>Other</option>
      </select>
    </div>
  </div>
  <div className="form-row">
  <div className="form-group col-md-6">
      <label htmlFor="inputPassword4">ZOOM Url</label>
      <input
        type="text"
        className="form-control"
        id="zoomUrl"
        placeholder="Enter Zoommeeting Link"
        {...register("zoomUrl")}
      />
    </div>
  <div className="form-group col-md-6">
    <label htmlFor="inputAddress2">Number Of Seats</label>
    <input
      type="number"
      className="form-control"
      id="numberOfSeats"
      placeholder="total seats"
      {...register("numberOfSeats")}
    />
    </div>
  </div>
  <div className="form-row">
    <div className="form-group col-md-6">
      <label htmlFor="inputCity">State</label>
       <select id="stateId" className="form-control" 
       {...register("stateId")} 
      >
        <option value="">Select State</option>
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
    <div className="form-group col-md-12">
      <label htmlFor="inputPassword4">Location</label>
      <input
        type="text"
        className="form-control"
        id="location"
        placeholder="Location Url.."
        {...register("location")}
      />
    </div><br/>
    {/* <div className='form-row'> */}
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
    {/* </div> */}
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
  <button type="submit" className="btn btn-primary btn-md btn-block" style={{width:"50vh" , marginLeft:"270px"}} >
    Submit
  </button>
</form>

    </div>
    </div>
    </div>
    // </div>

  )
}


// add event with map 
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// const centerPosition = [23.2599, 77.4126]; // Default: Bhopal

// // Fix Leaflet marker icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// const MapUpdater = ({ position }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (position) map.setView(position, 13);
//   }, [position, map]);
//   return null;
// };

// export const AddEvent = () => {
//   const [states, setstate] = useState([]);
//   const [cities, setcities] = useState([]);
//   const [position, setPosition] = useState(centerPosition);
//   const [searchPlace, setSearchPlace] = useState('');
//   const [locationName, setLocationName] = useState('');

//   const { register, handleSubmit, setValue } = useForm();
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios.get('/state/getallstates').then((res) => setstate(res.data.data));
//     axios.get('/city/getallcitys').then((res) => setcities(res.data.data));
//   }, []);

//   const reverseGeocode = async (lat, lon) => {
//     try {
//       const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
//       if (res.data && res.data.display_name) {
//         setLocationName(res.data.display_name);
//       } else {
//         setLocationName('Unknown Location');
//       }
//     } catch (err) {
//       console.error('Reverse geocoding failed', err);
//       setLocationName('Error fetching location');
//     }
//   };

//   const onMapClick = (e) => {
//     const { lat, lng } = e.latlng;
//     setPosition([lat, lng]);
//     setValue('latitude', lat);
//     setValue('longitude', lng);
//     reverseGeocode(lat, lng);
//   };

//   const searchLocation = async () => {
//     try {
//       const res = await axios.get(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchPlace)}`
//       );
//       if (res.data && res.data.length > 0) {
//         const lat = parseFloat(res.data[0].lat);
//         const lon = parseFloat(res.data[0].lon);
//         setPosition([lat, lon]);
//         setValue('latitude', lat);
//         setValue('longitude', lon);
//         reverseGeocode(lat, lon);
//       } else {
//         alert('Location not found.');
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Failed to fetch location.');
//     }
//   };

//   const submitHandler = async (data) => {
//     data.organizerId = localStorage.getItem('organizerId');
//     const formData = new FormData();
//     for (let key in data) {
//       if (key === 'image') formData.append(key, data[key][0]);
//       else formData.append(key, data[key]);
//     }
//     try {
//       const res = await axios.post('/event/addeventwithfile', formData);
//       alert('Event added successfully');
//       navigate('/organizer/viewevent');
//     } catch (err) {
//       console.error('Failed to add event', err);
//       alert('Failed to add event');
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center">Add Event</h2>
//       <form onSubmit={handleSubmit(submitHandler)}>
//         <div className="form-group">
//           <label>Event Name</label>
//           <input className="form-control" {...register('eventName')} />
//         </div>

//         <div className="form-group">
//           <label>Event Type</label>
//           <select className="form-control" {...register('eventType')}>
//             <option value="">Select Type</option>
//             <option value="Conference">Conference</option>
//             <option value="Exhibition">Exhibition</option>
//             <option value="Gala Dinner">Gala Dinner</option>
//             <option value="Incentive">Incentive</option>
//             <option value="Music Consert">Music Concert</option>
//             <option value="Meeting">Meeting</option>
//             <option value="ZoomMeeting">Zoom Meeting</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>

//         <div className="form-group">
//           <label>Zoom URL</label>
//           <input className="form-control" {...register('zoomUrl')} />
//         </div>

//         <div className="form-group">
//           <label>Number of Seats</label>
//           <input type="number" className="form-control" {...register('numberOfSeats')} />
//         </div>

//         <div className="form-row">
//           <div className="col">
//             <label>State</label>
//             <select className="form-control" {...register('stateId')}>
//               <option value="">Select State</option>
//               {states.map((s) => (
//                 <option key={s._id} value={s._id}>{s.Name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="col">
//             <label>City</label>
//             <select className="form-control" {...register('cityId')}>
//               <option value="">Select City</option>
//               {cities.map((c) => (
//                 <option key={c._id} value={c._id}>{c.name}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="form-row mt-2">
//           <div className="col">
//             <label>Start Date</label>
//             <input type="date" className="form-control" {...register('startDate')} />
//           </div>
//           <div className="col">
//             <label>End Date</label>
//             <input type="date" className="form-control" {...register('endDate')} />
//           </div>
//         </div>

//         <div className="form-group mt-3">
//           <label>Event Image</label>
//           <input type="file" className="form-control" {...register('image')} />
//         </div>

//         <div className="form-group mt-3">
//           <label>Search Location (By Name)</label>
//           <div className="d-flex">
//             <input
//               type="text"
//               className="form-control mr-2"
//               value={searchPlace}
//               onChange={(e) => setSearchPlace(e.target.value)}
//             />
//             <button type="button" className="btn btn-secondary" onClick={searchLocation}>
//               Search
//             </button>
//           </div>
//         </div>

//         <div className="form-group mt-3">
//           <label>Select Event Location on Map</label>
//           <MapContainer
//             center={position}
//             zoom={13}
//             scrollWheelZoom={false}
//             style={{ height: '300px', width: '100%' }}
//             whenCreated={(map) => {
//               map.on('click', onMapClick);
//             }}
//           >
//             <TileLayer
//               attribution='&copy; OpenStreetMap contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//             <MapUpdater position={position} />
//             <Marker position={position}>
//               <Popup>Event Location</Popup>
//             </Marker>
//           </MapContainer>
//           {locationName && (
//             <div className="mt-2 text-muted">
//               <strong>Selected Location:</strong> {locationName}
//             </div>
//           )}
//         </div>

//         <input type="hidden" {...register('latitude')} />
//         <input type="hidden" {...register('longitude')} />

//         <button type="submit" className="btn btn-primary mt-3">
//           Submit Event
//         </button>
//       </form>
//     </div>
//   );
// };




// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix default marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });

// const LocationMarker = ({ setPosition }) => {
//   useMapEvents({
//     click(e) {
//       setPosition(e.latlng);
//     },
//   });
//   return null;
// };

// export const AddEvent = () => {
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 }); // India default

//   const getAllStates = async () => {
//     const res = await axios.get("/state/getallstates");
//     setStates(res.data.data);
//   };

//   const getAllCities = async () => {
//     const res = await axios.get("/city/getallcitys");
//     setCities(res.data.data);
//   };

//   useEffect(() => {
//     getAllStates();
//     getAllCities();
//   }, []);

//   const { register, handleSubmit } = useForm();
//   const navigate = useNavigate();

//   const submitHandler = async (data) => {
//     data.organizerId = localStorage.getItem("organizerId");

//     const formData = new FormData();
//     formData.append("eventName", data.eventName);
//     formData.append("eventType", data.eventType);
//     formData.append("zoomUrl", data.zoomUrl);
//     formData.append("numberOfSeats", data.numberOfSeats);
//     formData.append("stateId", data.stateId);
//     formData.append("cityId", data.cityId);
//     formData.append("startDate", data.startDate);
//     formData.append("endDate", data.endDate);
//     formData.append("image", data.image[0]);
//     formData.append("organizerId", data.organizerId);
//     formData.append("latitude", position.lat);
//     formData.append("longitude", position.lng);

//     try {
//       const res = await axios.post("/event/addeventwithfile", formData);
//       alert("Event added successfully!");
//       navigate("/organizer/viewevent");
//     } catch (err) {
//       console.error("Failed to add event", err);
//       alert("Failed to add event");
//     }
//   };

//   return (
//     <div>
//       <h1 style={{ textAlign: 'center', marginTop: "30px" }}>ADD NEW EVENTS..! </h1>
//       <div className='container mt-4' id='addevent'>
//         <div className='card p-4 shadow'>
//           <form onSubmit={handleSubmit(submitHandler)}>
//             <div className='form-row'>
//             <div className="form-group col-md-6">
//               <label>Event Name</label>
//               <input type="text" className="form-control" {...register("eventName")} />
//             </div>

//             <div className="form-group col-md-6">
//               <label>Event Type</label>
//               <select className="form-control" {...register("eventType")}> 
//                 <option value="">Select-Type</option>
//                 <option value='Conference'>Conference</option>
//                 <option value="Exhibition">Exhibition</option>
//                 <option value="Gala Dinner">Gala Dinner</option>
//                 <option value="Incentive">Incentive</option>
//                 <option value="Music Consert">Music consert</option>
//                 <option value='Meeting'>Meeting</option>
//                 <option value="ZoomMeeting">ZoomMeeting</option>
//                 <option value='Other'>Other</option>
//               </select>
//             </div>
//             </div>
//             <div className='form-row'>
//             <div className="form-group col-md-6">
//               <label>Zoom URL</label>
//               <input type="text" className="form-control" {...register("zoomUrl")} />
//             </div>
//             <div className="form-group col-md-6">
//               <label>Number Of Seats</label>
//               <input type="number" className="form-control" {...register("numberOfSeats")} />
//             </div>
//             </div>
//             <div className='form-row'>
//             <div className="form-group col-md-6">
//               <label>State</label>
//               <select className="form-control" {...register("stateId")}> 
//                 <option value="">Select-State</option>
//                 {states.map((state) => (
//                   <option key={state._id} value={state._id}>{state.Name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group col-md-6">
//               <label>City</label>
//               <select className="form-control" {...register("cityId")}> 
//                 <option value="">Select-City</option>
//                 {cities.map((city) => (
//                   <option key={city._id} value={city._id}>{city.name}</option>
//                 ))}
//               </select>
//             </div>
//             </div>
//            <div className='form-row'>
//             <div className="form-group col-md-6">
//               <label>Start Date</label>
//               <input type="date" className="form-control" {...register("startDate")} />
//             </div>
//             <div className="form-group col-md-6">
//               <label>End Date</label>
//               <input type="date" className="form-control" {...register("endDate")} />
//             </div>
//            </div>
//             <div className="form-group">
//               <label>Add Event Photo</label>
//               <input type="file" className="form-control" {...register("image")} />
//             </div>

//             <div className="form-group mt-4">
//               <label>Select Event Location (Click on Map)</label>
//               <MapContainer center={position} zoom={5} style={{ height: "300px" }}>
//                 <TileLayer
//                   attribution='&copy; OpenStreetMap contributors'
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//                 <Marker position={position} />
//                 <LocationMarker setPosition={setPosition} />
//               </MapContainer>
//               <p className="text-muted mt-2">
//                 Selected Coordinates: Latitude {position.lat}, Longitude {position.lng}
//               </p>
//             </div>

//             <button type="submit" className="btn btn-primary mt-4">Submit</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };




