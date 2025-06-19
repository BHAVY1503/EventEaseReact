import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [bookedTickets, setBookedTickets] = useState({});
  

  useEffect(() => {
    getAllEvents();
  }, []);

  useEffect(() => {
    if (bookingInfo) {
      const timer = setTimeout(() => setBookingInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingInfo]);

  const getAllEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/event/getallevents/`);
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching events", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (eventId, organizerId, quantity) => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await axios.post(`http://localhost:3100/event/bookseat/${eventId}`, {
        userId,
        organizerId,
        quantity,
      });

      alert("Booking Success: " + res.data.message);
      setBookingInfo(res.data.bookingDetails);
        setBookedTickets((prev) => ({
        ...prev,
        [eventId]: res.data.data.ticket,
      }));
      getAllEvents();
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      alert("Booking Failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Upcoming Events</h1>
      <p className="text-center mb-4">Browse and book your tickets</p>

      {loading && <div className="text-center my-3">Loading events...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="event-scroll-container p-3 shadow rounded">
        <div className="d-flex flex-row gap-4 overflow-auto">
          {events.map((event) => {
            const eventEnded = new Date(event.endDate) < new Date();
            const booked = bookedTickets[event._id]; 
            // const bookedInfo = bookingInfo[event._id];
            return (
              <div className="card shadow-lg" style={{ minWidth: "350px" }} key={event._id}>
                <img
                  src={event.eventImgUrl}
                  className="card-img-top"
                  alt={event.eventName}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{event.eventName}</h5>
                  <p className="card-text" style={{ fontSize: "14px" }}>
                    <strong>Type:</strong> {event.eventType} <br />
                    <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
                    <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
                    <strong>Location:</strong> <a href={`https://www.google.com/maps?q=${event.location}`} target="_blank" rel="noreferrer">{event.cityId?.name}, {event.stateId?.Name}</a><br />
                    {event.eventType === "ZoomMeeting" && (
                      <>
                        <strong>Zoom:</strong> <a href={event.zoomUrl} target="_blank" rel="noreferrer">{event.zoomUrl}</a><br />
                      </>
                    )}
                    <strong>Available:</strong> {event.numberOfSeats} seats
                  </p>

                  {eventEnded && (
                    <span className="badge bg-danger">Event Ended</span>
                  )}
                </div>
                <div className="card-footer text-center">
                  {!eventEnded ? (
                    event.numberOfSeats > 0 ? (
                      <>
                        <select
                          className="form-select mb-2"
                          value={ticketQuantities[event._id] || 1}
                          onChange={(e) =>
                            setTicketQuantities({
                              ...ticketQuantities,
                              [event._id]: parseInt(e.target.value),
                            })
                          }
                        >
                          {Array.from({ length: event.numberOfSeats }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} Ticket(s)
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-success w-100"
                          onClick={() =>
                            handleBooking(event._id, event.organizerId, ticketQuantities[event._id] || 1)
                          }
                        >
                          Book Now
                        </button>
                      </>
                    ) : (
                      <p className="text-danger">Sold Out</p>
                    )
                  ) : (
                    <p className="text-muted">Booking closed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
              
      </div>
      {/* {bookedTickets && (
                        <div className="mt-2 p-2 bg-light text-dark rounded alert alert-success">
                          <strong>Ticket Booked:</strong><br />
                          Qty: {bookedTickets.quantity}<br />
                          Ticket ID: {bookedTickets._id}<br/>
                          Ticket ID: {bookedTickets?.eventId}

                        </div>
                      )} */}
   
      {bookingInfo && (
        <div className="alert alert-success mt-4">
          <h4>Booking Confirmation</h4>
          <p><strong>Event:</strong> {bookingInfo.eventName}</p>
          <p><strong>Tickets Booked:</strong> {bookingInfo.ticketsBooked}</p>
          <p><strong>Start Date:</strong> {new Date(bookingInfo.startDate).toDateString()}</p>
          <p><strong>End Date:</strong> {new Date(bookingInfo.endDate).toDateString()}</p>
          <p><strong>Booked At:</strong> {new Date(bookingInfo.bookingTime).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const ViewEvents = ({ eventId }) => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   useEffect(() => {
//     if (bookingInfo) {
//       const timer = setTimeout(() => setBookingInfo(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [bookingInfo]);

//   const getAllEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`/event/getallevents/`);
//       setEvents(res.data.data);
//     } catch (err) {
//       console.error("Error fetching events", err);
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBooking = async (eventId, organizerId, quantity) => {
//     try {
//       const userId = localStorage.getItem("userId");
//       const res = await axios.post(`http://localhost:3100/event/bookseat/${eventId}`, {
//         userId,
//         organizerId,
//         quantity,
//       });

//       alert("Booking Success: " + res.data.message);
//       setBookingInfo(res.data.bookingDetails);
//       getAllEvents(); // Refresh seats
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking Failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   return (
//     <div className="container" style={{ marginTop: "70px" }}>
//       <h1 className="text-center">Upcoming Events</h1>
//       <p className="text-center mb-4">Browse and book your tickets</p>

//       {loading && <div className="text-center my-3">Loading events...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="container mt-4 p-4 shadow" style={{ backgroundColor: "#555" }}>
//         <div className="row">
//           {events.map((event) => {
//             const eventEnded = new Date(event.endDate) < new Date();

//             return (
//               <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={event._id}>
//                 <div className="card h-100 shadow-sm">
//                   <img
//                     src={event.eventImgUrl}
//                     className="card-img-top"
//                     alt={event.eventName}
//                     style={{ height: '200px', objectFit: 'cover' }}
//                   />
//                   <div className="card-body">
//                     <h5 className="card-title">{event.eventName}</h5>
//                     <p className="card-text">
//                       <strong>Type:</strong> {event.eventType} <br />
//                       <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
//                       <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
//                       <strong>State:</strong> {event.stateId?.Name} <br />
//                       <strong>City:</strong> {event.cityId?.name} <br />
//                       <strong>Location:</strong>{' '}
//                       <a
//                         href={`https://www.google.com/maps?q=${event.location}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         title={event.location}
//                       >
//                         View on Map
//                       </a> <br />

//                       {event.eventType === "ZoomMeeting" && (
//                         <>
//                           <strong>Zoom URL:</strong>{" "}
//                           <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                             {event.zoomUrl}
//                           </a> <br />
//                         </>
//                       )}

//                       <strong>Available Seats:</strong> {event.numberOfSeats} <br />

//                       {eventEnded && (
//                         <span className="badge bg-danger mt-2">Event Ended Successfully</span>
//                       )}
//                     </p>
//                   </div>

//                   <div className="card-footer text-center">
//                     {!eventEnded ? (
//                       event.numberOfSeats > 0 ? (
//                         <>
//                           <select
//                             className="form-select mb-2"
//                             value={ticketQuantities[event._id] || 1}
//                             onChange={(e) =>
//                               setTicketQuantities({
//                                 ...ticketQuantities,
//                                 [event._id]: parseInt(e.target.value),
//                               })
//                             }
//                           >
//                             {Array.from({ length: event.numberOfSeats }, (_, i) => (
//                               <option key={i + 1} value={i + 1}>
//                                 {i + 1} Ticket(s)
//                               </option>
//                             ))}
//                           </select>
//                           <button
//                             className="btn btn-success"
//                             onClick={() =>
//                               handleBooking(event._id, event.organizerId, ticketQuantities[event._id] || 1)
//                             }
//                           >
//                             Book Now
//                           </button>
//                         </>
//                       ) : (
//                         <p className="text-danger">Sold Out</p>
//                       )
//                     ) : (
//                       <p className="text-muted">Booking closed</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {bookingInfo && (
//           <div className="alert alert-success mt-4">
//             <h4>Booking Confirmation</h4>
//             <p><strong>Event:</strong> {bookingInfo.eventName}</p>
//             <p><strong>Tickets Booked:</strong> {bookingInfo.ticketsBooked}</p>
//             <p><strong>Start Date:</strong> {new Date(bookingInfo.startDate).toDateString()}</p>
//             <p><strong>End Date:</strong> {new Date(bookingInfo.endDate).toDateString()}</p>
//             <p><strong>Booked At:</strong> {new Date(bookingInfo.bookingTime).toLocaleString()}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const ViewEvents = ({eventId}) => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     getAllEvents();
//   }, []);

//   useEffect(() => {
//     if (bookingInfo) {
//       const timer = setTimeout(() => setBookingInfo(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [bookingInfo]);

//   const getAllEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`/event/getallevents/`);
//       setEvents(res.data.data);
//     } catch (err) {
//       console.error("Error fetching events", err);
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBooking = async (eventId, organizerId, quantity) => {
//   try {
//     const userId = localStorage.getItem("userId"); // or "id" based on your storage key

//     const res = await axios.post(`http://localhost:3100/event/bookseat/${eventId}`, {
//       userId,
//       organizerId,
//       quantity,
//     });

//     alert("Booking Success: " + res.data.message);
//     console.log("Ticket Info:", res.data);
//     setBookingInfo(res.data.bookingDetails);
//     getAllEvents(); // Refresh seats
//   } catch (err) {
//     console.error("Booking failed:", err.response?.data || err.message);
//     alert("Booking Failed: " + (err.response?.data?.message || err.message));
//   }
// };


//   const handleBookSeat = async (eventId, organizerId) => {
//   const userId = localStorage.getItem("id");
//   const quantity = ticketQuantities[eventId] || 1;

//   try {
//     const res = await axios.post(`/event/bookseat/${eventId}`, {
//       userId,
//       organizerId,
//       quantity,
//     });
//     alert(res.data.message);
//     setBookingInfo(res.data.bookingDetails);
//     getAllEvents();
//   } catch (err) {
//     console.error("Error booking seat", err);
//   }
// };


//   // const handleBookSeat = async (eventId) => {
//   //   const quantity = ticketQuantities[eventId] || 1;
//   //   const userId = localStorage.getItem("id");
//   //   try {
//   //     const res = await axios.post(`/event/bookseat/${eventId}`, { quantity, userId, organizerId });
//   //     alert(res.data.message);
//   //     setBookingInfo(res.data.bookingDetails);
//   //     getAllEvents(); // Refresh seat availability
//   //   } catch (err) {
//   //     console.error("Error booking seat", err);
//   //     alert(err?.response?.data?.message || "Booking failed");
//   //   }
//   // };

//   return (
//     <div className="container" style={{ marginTop: "70px" }}>
//       <h1 className="text-center">Upcoming Events</h1>
//       <p className="text-center mb-4">Browse and book your tickets</p>

//       {loading && <div className="text-center my-3">Loading events...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="container mt-4 p-4 shadow" style={{ backgroundColor: "#555" }}>
//         <div className="row">
//           {events.map((event) => (  
//             <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={event._id}>
//               <div className="card h-100 shadow-sm">
//                 <img
//                   src={event.eventImgUrl}
//                   className="card-img-top"
//                   alt={event.eventName}
//                   style={{ height: '200px', objectFit: 'cover' }}
//                 />
//                 <div className="card-body">
//                   <h5 className="card-title">{event.eventName}</h5>
//                   <p className="card-text">
//                     <strong>Type:</strong> {event.eventType} <br />
//                     <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
//                     <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
//                     <strong>State:</strong> {event.stateId?.Name} <br />
//                     <strong>City:</strong> {event.cityId?.name} <br />
//                      <strong>Location:</strong>{' '}
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
//                     <strong>Available Seats:</strong> {event.numberOfSeats}
                  
//                   </p>

//                 </div>
//                 <div className="card-footer text-center">
//                   {event.numberOfSeats > 0 ? (
//                     <>
//                       <select
//                         className="form-select mb-2"
//                         value={ticketQuantities[event._id] || 1}
//                         onChange={(e) =>
//                           setTicketQuantities({
//                             ...ticketQuantities,
//                             [event._id]: parseInt(e.target.value),
//                           })
//                         }
//                       >
//                         {Array.from({ length: event.numberOfSeats }, (_, i) => (
//                           <option key={i + 1} value={i + 1}>
//                             {i + 1} Ticket(s)
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         className="btn btn-success"
//                         // onClick={() => handleBooking(event._id, event.organizerId)}
//                         onClick={() =>
//                         handleBooking(event._id,event.organizerId, ticketQuantities[event._id] || 1)}
//                       >
//                         Book Now
//                       </button>
//                     </>
//                   ) : (
//                     <p className="text-danger">Sold Out</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//             ))}
//         </div>

//           {bookingInfo && (
//           <div className="alert alert-success mt-4">
//             <h4>Booking Confirmation</h4>
//              <p><strong>Event:</strong> {bookingInfo.eventName}</p>
//              <p><strong>Tickets Booked:</strong> {bookingInfo.ticketsBooked}</p>
//              <p><strong>Start Date:</strong> {new Date(bookingInfo.startDate).toDateString()}</p>
//              <p><strong>End Date:</strong> {new Date(bookingInfo.endDate).toDateString()}</p>
//              <p><strong>Booked At:</strong> {new Date(bookingInfo.bookingTime).toLocaleString()}</p>
//            </div>
//         )}
//        </div>
//      </div>
//    );
//  }; 





