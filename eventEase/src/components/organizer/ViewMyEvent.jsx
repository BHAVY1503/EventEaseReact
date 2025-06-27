import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const ViewMyEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const [organizerId, setOrganizerId] = useState(null);
  const token = localStorage.getItem("token");

  const getOrganizerId = async () => {
    try {
      const res = await axios.get("organizer/organizer/self", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrganizerId(res.data.data._id);
    } catch (err) {
      console.error("Failed to fetch organizer ID", err);
      setLoading(false);
    }
  };

  const getAllEvents = async (id) => {
    try {
      const res = await axios.get(`/event/geteventbyorganizerid`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(res.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getOrganizerId();
    } else {
      console.error("Token not found");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (organizerId) {
      getAllEvents(organizerId);
    }
  }, [organizerId]);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      getAllEvents(organizerId);
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    try {
      const res = await axios.post(
        `/event/bookseat/${eventId}`,
        {
          userId: organizerId,
          stateId,
          cityId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Seat(s) booked successfully!");
      setBookedTickets((prev) => ({
        ...prev,
        [eventId]: res.data.data.ticket,
      }));
      getAllEvents(organizerId);
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    }
  };

  return (
    <div className='' style={{ marginTop: "70px" }}>
      <h1 className='text-center'>MY EVENTS!</h1>
      <p className='text-center mb-4'>Events added by you</p>

      <div className='container mt-4 p-4 shadow bg-dark text-white rounded'>
        {loading ? (
          <div className='text-center'>
            <h4>Loading your events...</h4>
          </div>
        ) : events.length === 0 ? (
          <div className='text-center'>
            <h5>No events found.</h5>
            <p>Click <Link to="/organizer/addevent" className="text-info">here</Link> to add your first event!</p>
          </div>
        ) : (
          <div className='row'>
            {events.map((event) => {
              const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
              const booked = bookedTickets[event._id];
              const eventEnded = new Date(event.endDate) < new Date();

              return (
                <div className='col-md-4 mb-4' key={event._id}>
                  <div className='card h-100 shadow-sm'>
                    <img
                      src={event.eventImgUrl}
                      className='card-img-top'
                      alt={event.eventName}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className='card-body text-dark'>
                      <h5 className='card-title'>{event.eventName}</h5>
                      <p className='card-text'>
                        <strong>Type:</strong> {event.eventType}<br />
                        <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
                        <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
                        <strong>State:</strong> {event.stateId?.Name}<br />
                        <strong>City:</strong> {event.cityId?.name}<br />

                        {event.eventType === "ZoomMeeting" ? (
                          <>
                            <strong>Zoom URL:</strong>{" "}
                            <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
                              {event.zoomUrl}
                            </a><br />
                          </>
                        ) : (
                          event.latitude && event.longitude && (
                            <>
                              <strong>Location:</strong>{" "}
                              <a
                                className='btn btn-sm btn-outline-primary'
                                href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Directions
                              </a><br />
                            </>
                          )
                        )}

                        <strong>Available Seats:</strong> {availableSeats}<br />
                        {eventEnded && (
                          <span className="badge bg-success mt-2">Event Ended Successfully</span>
                        )}
                      </p>

                      {!eventEnded && event.eventType === "Indoor" && (
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
                            onClick={() =>
                              handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
                            }
                          >
                            Book Seat
                          </button>
                        </div>
                      )}

                      {booked && (
                        <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
                          <strong>Ticket Booked:</strong><br />
                          Qty: {booked.quantity}<br />
                          Ticket ID: {booked._id}<br />
                          {booked.selectedSeats?.length > 0 && (
                            <>
                              <strong>Seats:</strong> {booked.selectedSeats.join(', ')}<br />
                            </>
                          )}
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
              );
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
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [organizerId, setOrganizerId] = useState(null);
//   const token = localStorage.getItem("token");

//   const getOrganizerId = async () => {
//     try {
//       const res = await axios.get("organizer/organizer/self", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setOrganizerId(res.data.data._id);
//     } catch (err) {
//       console.error("Failed to fetch organizer ID", err);
//       setLoading(false);
//     }
//   };

//   const getAllEvents = async (id) => {
//     try {
//       const res = await axios.get(`/event/geteventbyorganizerid`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       getOrganizerId();
//     } else {
//       console.error("Token not found");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (organizerId) {
//       getAllEvents(organizerId);
//     }
//   }, [organizerId]);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       getAllEvents(organizerId);
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${eventId}`,
//         {
//           userId: organizerId,
//           stateId,
//           cityId,
//           quantity,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents(organizerId);
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
//     }
//   };

//   return (
//     <div className='container' style={{ marginTop: "70px" }}>
//       <h1 className='text-center'>MY EVENTS!</h1>
//       <p className='text-center mb-4'>Events added by you</p>

//       <div className='container mt-4 p-4 shadow bg-dark text-white rounded'>
//         {loading ? (
//           <div className='text-center'>
//             <h4>Loading your events...</h4>
//           </div>
//         ) : events.length === 0 ? (
//           <div className='text-center'>
//             <h5>No events found.</h5>
//             <p>Click <Link to="/organizer/addevent" className="text-info">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//               const booked = bookedTickets[event._id];
//               const eventEnded = new Date(event.endDate) < new Date();

//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body text-dark'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                         <strong>State:</strong> {event.stateId?.Name}<br />
//                         <strong>City:</strong> {event.cityId?.name}<br />

//                         {event.eventType === "ZoomMeeting" ? (
//                           <>
//                             <strong>Zoom URL:</strong>{" "}
//                             <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                               {event.zoomUrl}
//                             </a><br />
//                           </>
//                         ) : (
//                           event.latitude && event.longitude && (
//                             <>
//                               <strong>Location:</strong>{" "}
//                               <a
//                                 className='btn btn-sm btn-outline-primary'
//                                 href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 View Directions
//                               </a><br />
//                             </>
//                           )
//                         )}

//                         <strong>Available Seats:</strong> {availableSeats}<br />
//                         {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>

//                       {!eventEnded && event.eventType === "Indoor" && (
//                         <div>
//                           <input
//                             type="number"
//                             min="1"
//                             max={availableSeats}
//                             className="form-control mb-2"
//                             placeholder="Number of seats"
//                             value={bookingQuantity[event._id] || ''}
//                             onChange={(e) =>
//                               setBookingQuantity((prev) => ({
//                                 ...prev,
//                                 [event._id]: parseInt(e.target.value),
//                               }))
//                             }
//                           />
//                           <button
//                             className="btn btn-success btn-sm w-100"
//                             disabled={availableSeats <= 0}
//                             onClick={() =>
//                               handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                             }
//                           >
//                             Book Seat
//                           </button>
//                         </div>
//                       )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}
//                         </div>
//                       )}
//                     </div>

//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [organizerId, setOrganizerId] = useState(null);
//   const token = localStorage.getItem("token");

//   // Fetch Organizer ID using the token
//   const getOrganizerId = async () => {
//     try {
//       const res = await axios.get("organizer/organizer/self", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setOrganizerId(res.data.data._id);
//     } catch (err) {
//       console.error("Failed to fetch organizer ID", err);
//       setLoading(false);
//     }
//   };

//   // Fetch Events by Organizer ID
//   const getAllEvents = async (id) => {
//     try {
//       const res = await axios.get(`/event/geteventbyorganizerid`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       getOrganizerId();
//     } else {
//       console.error("Token not found");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (organizerId) {
//       getAllEvents(organizerId);
//     }
//   }, [organizerId]);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       getAllEvents(organizerId);
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${eventId}`,
//         {
//           userId: organizerId,
//           stateId,
//           cityId,
//           quantity,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents(organizerId);
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
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
//             <p>Click <Link to="/organizer/addevent">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//               const booked = bookedTickets[event._id];
//               const eventEnded = new Date(event.endDate) < new Date();

//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                         <strong>State:</strong> {event.stateId?.Name}<br />
//                         <strong>City:</strong> {event.cityId?.name}<br />

//                         {event.eventType === "ZoomMeeting" ? (
//                           <>
//                             <strong>Zoom URL:</strong>{" "}
//                             <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                               {event.zoomUrl}
//                             </a><br />
//                           </>
//                         ) : (
//                           event.latitude && event.longitude && (
//                             <>
//                               <strong>Location:</strong>{" "}
//                               <a
//                                 className='btn btn-sm btn-outline-primary'
//                                 href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 View Directions
//                               </a><br />
//                             </>
//                           )
//                         )}

//                         <strong>Available Seats:</strong> {availableSeats}<br />
//                         {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>

//                       {!eventEnded && (
//                         <div>
//                           <input
//                             type="number"
//                             min="1"
//                             max={availableSeats}
//                             className="form-control mb-2"
//                             placeholder="Number of seats"
//                             value={bookingQuantity[event._id] || ''}
//                             onChange={(e) =>
//                               setBookingQuantity((prev) => ({
//                                 ...prev,
//                                 [event._id]: parseInt(e.target.value),
//                               }))
//                             }
//                           />
//                           <button
//                             className="btn btn-success btn-sm w-100"
//                             disabled={availableSeats <= 0}
//                             onClick={() =>
//                               handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                             }
//                           >
//                             Book Seat
//                           </button>
//                         </div>
//                       )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}
//                         </div>
//                       )}
//                     </div>

//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});

//   // const userId = localStorage.getItem("userId") || localStorage.getItem("organizerId");
//   // const organizerId = localStorage.getItem("organizerId");
//   const token = localStorage.getItem("token")

//   const getAllEvents = async () => {
//     if (!token) {
//       console.error("token ID not found in localStorage");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.get(`/event/geteventbyorganizerid/${organizerId}`);
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`);
//       getAllEvents();
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(`/event/bookseat/${eventId}`, {
//         userId,
//         stateId,
//         cityId,
//         quantity,
//       });
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
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
//             <p>Click <Link to="/organizer/addevent">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//               const booked = bookedTickets[event._id];
//               const eventEnded = new Date(event.endDate) < new Date();

//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                         <strong>State:</strong> {event.stateId?.Name}<br />
//                         <strong>City:</strong> {event.cityId?.name}<br />

//                         {event.eventType === "ZoomMeeting" ? (
//                           <>
//                             <strong>Zoom URL:</strong>{" "}
//                             <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                               {event.zoomUrl}
//                             </a><br />
//                           </>
//                         ) : (
//                           event.latitude && event.longitude && (
//                             <>
//                               <strong>Location:</strong>{" "}
//                               <a
//                                 className='btn btn-sm btn-outline-primary'
//                                 href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 View Directions
//                               </a><br />
//                             </>
//                           )
//                         )}

//                         <strong>Available Seats:</strong> {availableSeats}<br />
//                         {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>

//                       {!eventEnded && (
//                         <div>
//                           <input
//                             type="number"
//                             min="1"
//                             max={availableSeats}
//                             className="form-control mb-2"
//                             placeholder="Number of seats"
//                             value={bookingQuantity[event._id] || ''}
//                             onChange={(e) =>
//                               setBookingQuantity((prev) => ({
//                                 ...prev,
//                                 [event._id]: parseInt(e.target.value),
//                               }))
//                             }
//                           />
//                           <button
//                             className="btn btn-success btn-sm w-100"
//                             disabled={availableSeats <= 0}
//                             onClick={() =>
//                               handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                             }
//                           >
//                             Book Seat
//                           </button>
//                         </div>
//                       )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}
//                         </div>
//                       )}
//                     </div>

//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// map on card 
// import axios from 'axios';
// import React, { useEffect, useState, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
// import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [mapVisible, setMapVisible] = useState({});

//   const userId = localStorage.getItem("userId") || localStorage.getItem("organizerId");
//   const organizerId = localStorage.getItem("organizerId");

//   const getAllEvents = async () => {
//     if (!userId) {
//       console.error("User ID not found in localStorage");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.get(`/event/geteventbyorganizerid/${organizerId}`);
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`);
//       getAllEvents();
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(`/event/bookseat/${eventId}`, {
//         userId,
//         stateId,
//         cityId,
//         quantity,
//       });
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
//     }
//   };

//   const toggleMap = (eventId) => {
//     setMapVisible((prev) => ({
//       ...prev,
//       [eventId]: !prev[eventId]
//     }));
//   };

//   const MapView = ({ lat, lng, containerId }) => {
//     const mapRef = useRef(null);
//     const mapContainer = useRef(null);

//     useEffect(() => {
//       if (mapRef.current) return;

//       mapRef.current = new mapboxgl.Map({
//         container: mapContainer.current,
//         style: 'mapbox://styles/mapbox/streets-v11',
//         center: [lng, lat],
//         zoom: 12,
//       });

//       const directions = new MapboxDirections({
//         accessToken: mapboxgl.accessToken,
//         unit: 'metric',
//         profile: 'mapbox/driving',
//       });

//       mapRef.current.addControl(directions, 'top-left');

//       directions.setDestination([lng, lat]);

//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const { longitude, latitude } = pos.coords;
//           directions.setOrigin([longitude, latitude]);
//         },
//         () => {
//           alert("Unable to get your current location");
//         }
//       );
//     }, []);

//     return <div id={containerId} ref={mapContainer} style={{ height: "300px", borderRadius: "10px" }} />;
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
//             <p>Click <Link to="/organizer/addevent">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//               const booked = bookedTickets[event._id];
//               const eventEnded = new Date(event.endDate) < new Date();

//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                         <strong>State:</strong> {event.stateId?.Name}<br />
//                         <strong>City:</strong> {event.cityId?.name}<br />

//                         {event.eventType === "ZoomMeeting" ? (
//                           <>
//                             <strong>Zoom URL:</strong>{" "}
//                             <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                               {event.zoomUrl}
//                             </a><br />
//                           </>
//                         ) : (
   

//                            <>
//                              <strong>Location:</strong>{" "}
//                              <button
//                                className='btn btn-link btn-sm p-0'
//                                onClick={() => toggleMap(event._id)}
//                             >
//                               {mapVisible[event._id] ? "Hide Map" : "View Map"}
//                              </button><br />
//                            </>
//                         )}

//                         <strong>Available Seats:</strong> {availableSeats}<br />
//                         {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>

//                       {!eventEnded && (
//                         <div>
//                           <input
//                             type="number"
//                             min="1"
//                             max={availableSeats}
//                             className="form-control mb-2"
//                             placeholder="Number of seats"
//                             value={bookingQuantity[event._id] || ''}
//                             onChange={(e) =>
//                               setBookingQuantity((prev) => ({
//                                 ...prev,
//                                 [event._id]: parseInt(e.target.value),
//                               }))
//                             }
//                           />
//                           <button
//                             className="btn btn-success btn-sm w-100"
//                             disabled={availableSeats <= 0}
//                             onClick={() =>
//                               handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                             }
//                           >
//                             Book Seat
//                           </button>
//                         </div>
//                       )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}
//                         </div>
//                       )}

//                       {mapVisible[event._id] && event.latitude && event.longitude && (
//                         <div className='mt-3'>
//                           <MapView
//                             lat={event.latitude}
//                             lng={event.longitude}
//                             containerId={`map-${event._id}`}
//                           />
//                         </div>
//                       )}
//                     </div>

//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



// import axios from 'axios';
// import React, { useEffect, useState, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [mapVisible, setMapVisible] = useState({}); // 👈 track map visibility per event

//   const userId = localStorage.getItem("userId") || localStorage.getItem("organizerId");
//   const organizerId = localStorage.getItem("organizerId");

//   const getAllEvents = async () => {
//     if (!userId) {
//       console.error("User ID not found in localStorage");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.get(`/event/geteventbyorganizerid/${organizerId}`);
//       setEvents(res.data.data);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`);
//       getAllEvents();
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(`/event/bookseat/${eventId}`, {
//         userId,
//         stateId,
//         cityId,
//         quantity,
//       });
//       alert("Seat(s) booked successfully!");
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
//     }
//   };

//   const toggleMap = (eventId) => {
//     setMapVisible((prev) => ({
//       ...prev,
//       [eventId]: !prev[eventId]
//     }));
//   };

//   const MapView = ({ lat, lng, containerId }) => {
//     const mapRef = useRef(null);
//     const mapContainer = useRef(null);

//     useEffect(() => {
//       if (mapRef.current) return;

//       mapRef.current = new mapboxgl.Map({
//         container: mapContainer.current,
//         style: 'mapbox://styles/mapbox/streets-v11',
//         center: [lng, lat],
//         zoom: 12
//       });

//       new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
//     }, []);

//     return <div id={containerId} ref={mapContainer} style={{ height: "250px", borderRadius: "10px" }} />;
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
//             <p>Click <Link to="/organizer/addevent">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
//               const booked = bookedTickets[event._id];
//               const eventEnded = new Date(event.endDate) < new Date();

//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                         <strong>State:</strong> {event.stateId?.Name}<br />
//                         <strong>City:</strong> {event.cityId?.name}<br />

//                         {event.eventType === "ZoomMeeting" ? (
//                           <>
//                             <strong>Zoom URL:</strong>{" "}
//                             <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                               {event.zoomUrl}
//                             </a><br />
//                           </>
//                         ) : (
//                           <>
//                             <strong>Location:</strong>{" "}
//                             <button
//                               className='btn btn-link btn-sm p-0'
//                               onClick={() => toggleMap(event._id)}
//                             >
//                               {mapVisible[event._id] ? "Hide Map" : "View Map"}
//                             </button><br />
//                           </>
//                         )}

//                         <strong>Available Seats:</strong> {availableSeats}<br />
//                         {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>

//                       {!eventEnded && (
//                         <div>
//                           <input
//                             type="number"
//                             min="1"
//                             max={availableSeats}
//                             className="form-control mb-2"
//                             placeholder="Number of seats"
//                             value={bookingQuantity[event._id] || ''}
//                             onChange={(e) =>
//                               setBookingQuantity((prev) => ({
//                                 ...prev,
//                                 [event._id]: parseInt(e.target.value),
//                               }))
//                             }
//                           />
//                           <button
//                             className="btn btn-success btn-sm w-100"
//                             disabled={availableSeats <= 0}
//                             onClick={() =>
//                               handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)
//                             }
//                           >
//                             Book Seat
//                           </button>
//                         </div>
//                       )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}
//                         </div>
//                       )}

//                       {mapVisible[event._id] && event.latitude && event.longitude && (
//                         <div className='mt-3'>
//                           <MapView
//                             lat={event.latitude}
//                             lng={event.longitude}
//                             containerId={`map-${event._id}`}
//                           />
//                         </div>
//                       )}
//                     </div>

//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const ViewMyEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
 
//   const userId = localStorage.getItem("userId") || localStorage.getItem("organizerId");
//   console.log("id:",userId)
//   const organizerId = localStorage.getItem("organizerId"); //organizerid geted
//   console.log("Organizer ID:", organizerId);
//   // const userId = localStorage.getItem("userId");
//   // console.log("User Id:", userId)

//   const getAllEvents = async () => {
//     if (!userId) {
//       console.error("User ID not found in localStorage");
//       setLoading(false);
//       return;
//     }

//     try {                          
//       const res = await axios.get(`/event/geteventbyorganizerid/${organizerId}`);
//       setEvents(res.data.data); //store respone in event 
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   const handleDelete = async (eventId) => {
//     if (!window.confirm("Are you sure you want to delete this event?")) return;
//     try {
//       await axios.delete(`/event/deleteevent/${eventId}`);
//       getAllEvents(); // refresh
//     } catch (err) {
//       console.error("Error deleting event", err);
//       alert("Failed to delete event");
//     }
//   };

//   const handleBookSeat = async (eventId, stateId, cityId) => {
//     const quantity = bookingQuantity[eventId] || 1;
//     try {
//       const res = await axios.post(`/event/bookseat/${eventId}`, {
//         userId,
//         // organizerId,
//         stateId,
//         cityId,
//         quantity,
//       });
//       alert("Seat(s) booked successfully!");
//       // Store ticket info to show on UI
//       setBookedTickets((prev) => ({
//         ...prev,
//         [eventId]: res.data.data.ticket,
//       }));
//       getAllEvents(); // update seat count
//     } catch (err) {
//       alert(err?.response?.data?.message || "Booking failed");
//       console.error("Booking error:", err);
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
//             <p>Click <Link to="/organizer/addevent">here</Link> to add your first event!</p>
//           </div>
//         ) : (
//           <div className='row'>
//             {events.map((event) => {
//               const availableSeats = event.numberOfSeats - (event.bookedSeats || 0); //for each event calclulate available seats
//               const booked = bookedTickets[event._id];  //and check it has been booked
//              const eventEnded = new Date(event.endDate) < new Date(); // 👈 check if event is over
              
//               return (
//                 <div className='col-md-4 mb-4' key={event._id}>
//                   <div className='card h-100 shadow-sm'>
//                     <img
//                       src={event.eventImgUrl}
//                       className='card-img-top'
//                       alt={event.eventName}
//                       style={{ height: '200px', objectFit: 'cover' }}
//                     />
//                     <div className='card-body'>
//                       <h5 className='card-title'>{event.eventName}</h5>
//                       <p className='card-text'>
//                         <strong>Type:</strong> {event.eventType}<br />
//                         <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
//                         <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />
//                         <strong>State:</strong> {event.stateId?.Name}<br />
//                         <strong>City:</strong> {event.cityId?.name}<br />
//                         {/* <strong>Location:</strong> {event?.location}<br /> */}
//                            <strong>Location:</strong>{' '}
//                         <a
//                         href={`https://www.google.com/maps?q=${event.location}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         title={event.location}
//                          >
//                         View on Map
//                        </a><br />

//                         {/* <strong>ZoomUrl:</strong> {event?.zoomUrl}<br /> */}

//                            {event.eventType === "ZoomMeeting" && (
//                             <>
//                            <strong>Zoom URL:</strong>{" "}
//                            <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                            {event.zoomUrl}
//                             </a><br />
//                              </>
//                             )}

//                         <strong>Available Seats:</strong> {availableSeats}
//                          {eventEnded && (
//                           <span className="badge bg-success mt-2">Event Ended Successfully</span>
//                         )}
//                       </p>
//                     {!eventEnded &&(
//                       <div>
//                         <input
//                           type="number"
//                           min="1"
//                           max={availableSeats}
//                           className="form-control mb-2"
//                           placeholder="Number of seats"
//                           value={bookingQuantity[event._id] || ''}
//                           onChange={(e) =>
//                             setBookingQuantity((prev) => ({       
//                               ...prev,
//                               [event._id]: parseInt(e.target.value), //parseInt to convert string in to integer
//                             }))
//                           }
//                         />
//                         <button
//                           className="btn btn-success btn-sm w-100"
//                           disabled={availableSeats <= 0}  //if not seats avalilable
//                           onClick={() => handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)}
//                         >
//                           Book Seat
//                         </button>
//                       </div>
//                      )}

//                       {booked && (
//                         <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
//                           <strong>Ticket Booked:</strong><br />
//                           Qty: {booked.quantity}<br />
//                           Ticket ID: {booked._id}<br/>
//                           Ticket ID: {booked?.eventId}

//                         </div>
//                       )}
//                     </div>
//                     <div className='card-footer text-center'>
//                       <Link to={`/updateevent/${event._id}`} className='btn btn-primary btn-sm me-2'>
//                         Update
//                       </Link>
//                       <button className='btn btn-danger btn-sm' onClick={() => handleDelete(event._id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


