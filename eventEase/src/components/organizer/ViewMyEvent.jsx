import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const ViewMyEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});

  const userId = localStorage.getItem("id");

  const getAllEvents = async () => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/event/geteventbyuserid/${userId}`);
      setEvents(res.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/event/deleteevent/${eventId}`);
      getAllEvents(); // refresh
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    try {
      const res = await axios.post(`/event/bookseat/${eventId}`, {
        userId,
        stateId,
        cityId,
        quantity,
      });
      alert("Seat(s) booked successfully!");
      // Store ticket info to show on UI
      setBookedTickets((prev) => ({
        ...prev,
        [eventId]: res.data.data.ticket,
      }));
      getAllEvents(); // update seat count
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    }
  };

  return (
    <div className='container' style={{ marginTop: "70px" }}>
      <h1 className='text-center'>MY EVENTS!</h1>
      <p className='text-center mb-4'>Events added by you</p>

      <div className='container mt-4 p-4 shadow' style={{ backgroundColor: "#555" }}>
        {loading ? (
          <div className='text-center text-white'>
            <h4>Loading your events...</h4>
          </div>
        ) : events.length === 0 ? (
          <div className='text-center text-white'>
            <h5>No events found.</h5>
            <p>Click <Link to="/addevent">here</Link> to add your first event!</p>
          </div>
        ) : (
          <div className='row'>
            {events.map((event) => {
              const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
              const booked = bookedTickets[event._id];
              return (
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
                        <strong>Type:</strong> {event.eventType}<br />
                        <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
                        <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
                        <strong>State:</strong> {event.stateId?.Name}<br />
                        <strong>City:</strong> {event.cityId?.name}<br />
                        <strong>Available Seats:</strong> {availableSeats}
                      </p>

                      <div>
                        <input
                          type="number"
                          min="1"
                          max={availableSeats}
                          className="form-control mb-2"
                          placeholder="Number of seats"
                          value={bookingQuantity[event._id] || ''}
                          onChange={(e) =>
                            setBookingQuantity((prev) => ({
                              ...prev,
                              [event._id]: parseInt(e.target.value),
                            }))
                          }
                        />
                        <button
                          className="btn btn-success btn-sm w-100"
                          disabled={availableSeats <= 0}
                          onClick={() => handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)}
                        >
                          Book Seat
                        </button>
                      </div>

                      {booked && (
                        <div className="mt-2 p-2 bg-light text-dark rounded">
                          <strong>Ticket Booked:</strong><br />
                          Qty: {booked.quantity}<br />
                          Ticket ID: {booked._id}
                        </div>
                      )}
                    </div>
                    <div className='card-footer text-center'>
                      <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
                        Update
                      </Link>
                      <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//  useEffect(() => {
//   const getAllEvents = async () => {
//     const userId = localStorage.getItem("id");
//     console.log("userId:", userId);
//     if (!userId) {
//       console.error("User ID not found in localStorage");
//       setLoading(false); // ⬅️ prevent infinite loading
//       return;
//     }

//     try {
//       const res = await axios.get(`/event/geteventbyuserid/${userId}`);
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false); // ✅ Always stop loading after request completes
//     }
//   };

//   getAllEvents();
// }, []);


//   // useEffect(() => {
//   //   getAllEvents();
//   // }, []);

//   // const getAllEvents = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const userId = localStorage.getItem("id");
//   //     const res = await axios.get(`/event/geteventbyuserid/${userId}`);
//   //     console.log(res.data);
//   //     setEvents(res.data.data || []);
//   //   } catch (err) {
//   //     console.log("Error fetching events", err);
//   //   }
//   //   setLoading(false);
//   // };

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;

//     try {
//       const res = await axios.delete(`/event/deleteevent/${eventId}`);
//       console.log("Deleted:", res.data);
//       getAllEvents(); // Refresh list
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   return (
//     <div className='container' style={{ marginTop: "70px" }}>
//       <h1 className='text-center'>MY EVENTS!</h1>
//       <p className='text-center mb-4'>Events added by you</p>

//       <div className='container mt-4 p-4 shadow' style={{ backgroundColor: "#555" }}>
//         {loading ? (
//           <div className='text-center text-white'>
//             <h4>Loading your events...</h4>
//           </div>
//         ) : events.length === 0 ? (
//           <div className='text-center text-white'>
//             <h5>No events found.</h5>
//             <p>Click <Link to="/addevent">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => (
//               <div className='col-md-4 mb-4' key={event._id}>
//                 <div className='card h-100 shadow-sm'>
//                   <img
//                     src={event.eventImgUrl}
//                     className='card-img-top'
//                     alt={event.eventName}
//                     style={{ height: '200px', objectFit: 'cover' }}
//                   />
//                   <div className='card-body'>
//                     <h5 className='card-title'>{event.eventName}</h5>
//                     <p className='card-text'>
//                       <strong>Type:</strong> {event.eventType} <br />
//                       <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
//                       <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
//                       <strong>State:</strong> {event.stateId?.Name} <br />
//                       <strong>City:</strong> {event.cityId?.name} <br />
//                       <strong>Available Seats:</strong> {event.numberOfSeats}
//                     </p>
//                   </div>
//                   <div className='card-footer text-center'>
//                     <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                       Update
//                     </Link>
//                     <button
//                       className='btn btn-danger btn-sm'
//                       onClick={() => handleDelete(event._id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom';

// export const ViewMyEvent = () => {
//   const [events, setevents] = useState([])

// useEffect(() => {
//   // const userId = localStorage.getItem("id");
//   // console.log("userId from localStorage:", userId); // ← Add this
//   getAllevents();
// }, []);

//   const getAllevents = async () => {
//     try {
//       const res = await axios.get(`/event/geteventbyuserid/` + localStorage.getItem("id"))
//       console.log(res.data)
//       setevents(res.data.data)
//     } catch (err) {
//       console.log("Error fetching events", err)
//     }
//   }

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;

//     try {
//       const res = await axios.delete(`/event/deleteevent/${eventId}`);
//       console.log("Deleted:", res.data);

//       // Re-fetch events
//       getAllevents();
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   }


//   // useEffect(() => {
//   //   getAllevents()
//   // }, [])

//   return (
//     <div className='container' style={{marginTop:"70px",}}>
//       <h1 style={{textAlign:'center'}}>MY EVENTS!</h1><p style={{textAlign:'center', marginBottom:"20px"}}>Events Added by you</p>
//     <div className='container mt-4 class p-4 shadow' style={{backgroundColor:"#555"}}>
//       <div className='row'>
//         {events?.map((event) => (
//           <div className='col-md-4 mb-4' key={event._id}>
//             <div className='card h-100 shadow-sm'>
//               <img 
//                 src={event.eventImgUrl} 
//                 className='card-img-top' 
//                 alt={event.eventName} 
//                 style={{ height: '200px', objectFit: 'cover' }} 
//               />
//               <div className='card-body'>
//                 <h5 className='card-title'>{event.eventName}</h5>
//                 <p className='card-text'>
//                   <strong>Type:</strong> {event.eventType} <br />
//                   <strong>Start:</strong> {event.startDate} <br />
//                   <strong>End:</strong> {event.endDate} <br />
//                   <strong>State:</strong> {event.stateId?.Name} <br />
//                   <strong>City:</strong> {event.cityId?.name}<br/>
//                   <strong>AvailableSeats:</strong> {event.numberOfSeats}

//                 </p>
//               </div>
//               <div className='card-footer text-center'>
//                 <Link to={`/updateevent/${event._id}`} >
//                       Update
//                     </Link>
//                </div>
//                 <div className='card-footer text-center'>
//                 <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>Delete</button>
//                 </div>
              
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//     </div>
//   )
// }



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
