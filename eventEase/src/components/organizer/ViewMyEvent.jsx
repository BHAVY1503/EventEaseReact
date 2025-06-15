import axios from 'axios'
import React, { useEffect, useState } from 'react'

export const ViewMyEvent = () => {
  const [events, setevents] = useState([])

useEffect(() => {
  // const userId = localStorage.getItem("id");
  // console.log("userId from localStorage:", userId); // ← Add this
  getAllevents();
}, []);

  const getAllevents = async () => {
    try {
      const res = await axios.get(`/event/geteventbyuserid/` + localStorage.getItem("id"))
      console.log(res.data)
      setevents(res.data.data)
    } catch (err) {
      console.log("Error fetching events", err)
    }
  }

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await axios.delete(`/event/deleteevent/${eventId}`);
      console.log("Deleted:", res.data);

      // Re-fetch events
      getAllevents();
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  }


  // useEffect(() => {
  //   getAllevents()
  // }, [])

  return (
    <div className='container' style={{marginTop:"70px",}}>
      <h1 style={{textAlign:'center'}}>MY EVENTS!</h1><p style={{textAlign:'center', marginBottom:"20px"}}>Events Added by you</p>
    <div className='container mt-4 class p-4 shadow'>
      <div className='row'>
        {events?.map((event) => (
          <div className='col-md-4 mb-4' key={event._id}>
            <div className='card h-100 shadow-sm'>
              <img 
                src={event.eventImgUrl} 
                className='card-img-top' 
                alt={event.eventName} 
                style={{ height: '200px', objectFit: 'cover' }} 
              />
              <div className='card-body'>
                <h5 className='card-title'>{event.eventName}</h5>
                <p className='card-text'>
                  <strong>Type:</strong> {event.eventType} <br />
                  <strong>Start:</strong> {event.startDate} <br />
                  <strong>End:</strong> {event.endDate} <br />
                  <strong>State:</strong> {event.stateId?.Name} <br />
                  <strong>City:</strong> {event.cityId?.name}<br/>
                  <strong>AvailableSeats:</strong> {event.numberOfSeats}

                </p>
              </div>
              <div className='card-footer text-center'>
                <button className='btn btn-primary btn-sm me-2'>Edit</button>
                <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}



// import axios from 'axios'
// import React, { useEffect, useState } from 'react'

// export const ViewMyEvent = () => {
  
//     const [events, setevents] = useState([])

//     const getAllevents = async()=>{
//         try{
//         const res = await axios.get("/event/getallevents")
//         setevents(res.data.data)
//         }catch(err){
//             console.log("error fatching event",err)
//         }
//     }

//     useEffect(()=>{
//         getAllevents();
//     },[])

//   return (
//     <div className='container mt-4'>

//     <table className='table table-striped'>
//       <thead>
//                 <tr>
//                    <th>EventName</th>
//                      <th>EventType</th>
//                      <th>StartDate</th>
//                      <th>EndDate</th>
//                      <th>Seats</th>
//                      <th>State</th>
//                      <th>City</th>
//                      <th>IMAGE</th>
//                      <th>ACTION</th>
//                      {/* <th>Pay</th> */}
//                      {/* <th>Status</th>  */}
//                  </tr>
//              </thead>
//               <tbody>
//                 {events?.map((events)=>{
//                   return<tr key={event._id}>
//                     <td>{events._id}</td>
//                     <td>{events.eventName}</td>
//                     <td>{events.eventType}</td>
//                     <td>{events.startDate}</td>
//                     <td>{events.endDate}</td>
//                     <td>{events.stateId?.Name}</td>
//                     <td>{events.cityId?.name}</td>
//                     <td>
//                       <img src={events.eventImgUrl} style={{height:'50px', width:'50px'}}></img>
//                     </td>




//                   </tr>
//                 })}
//               </tbody>
//     </table>

      

//     </div>
//   )
// }
