

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../../assets/ViewEvent.css';

export const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [bookingInfo, setBookingInfo] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterEventType, setFilterEventType] = useState('');

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

  const confirmBooking = async () => {
    if (!selectedBooking) return;
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/event/bookseat/${selectedBooking.eventId}`,
        {
          organizerId: selectedBooking.organizerId,
          quantity: selectedBooking.quantity,
          selectedSeats: selectedBooking.selectedSeats,
          stateId: selectedBooking.stateId,
          cityId: selectedBooking.cityId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Booking Success: " + res.data.message);
      setBookingInfo({
        eventName: res.data.data.event.eventName,
        ticketsBooked: res.data.data.ticket.quantity,
        startDate: res.data.data.event.startDate,
        endDate: res.data.data.event.endDate,
        bookingTime: res.data.data.ticket.createdAt,
      });
      setSelectedBooking(null);
      getAllEvents();
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      alert("Booking Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchType = filterEventType ? event.eventType === filterEventType : true;
    return matchName && matchCity && matchType;
  });

  const generateSeatLabel = (index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 10)); // A, B, C...
    const seat = (index % 10) + 1;
    return `${row}${seat}`;
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Upcoming Events</h1>
      <p className="text-center mb-4">Browse and book your tickets</p>

      <div className="row g-2 mb-4">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search by Event Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
        </div>
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search by City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)}>
            <option value="">All Event Types</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="ZoomMeeting">Zoom Meeting</option>
            <option value="Concert">Concert</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center">Loading events...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {filteredEvents.map((event) => {
          const eventEnded = new Date(event.endDate) < new Date();
          const availableSeats = event.numberOfSeats - event.bookedSeats;

          return (
            <div className="col-md-4 mb-4" key={event._id}>
              <div className="card h-100 shadow-sm">
                <img src={event.eventImgUrl} className="card-img-top" alt={event.eventName} style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body">
                  <h5 className="card-title">{event.eventName}</h5>
                  <p className="card-text">
                    <strong>Type:</strong> {event.eventType} <br />
                    <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
                    <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
                    <strong>City:</strong> {event.cityId?.name} <br />
                    {event.eventCategory === "ZoomMeeting" && (
                      <>
                        <strong>Zoom URL:</strong> <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">{event.zoomUrl}</a> <br />
                      </>
                    )}
                    {event.eventCategory !== "ZoomMeeting" && event.latitude && event.longitude && (
                      <>
                        <strong>Location:</strong> <a href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">View on Map</a> <br />
                      </>
                    )}
                    <strong>Available Seats:</strong> {availableSeats} <br />
                    {eventEnded && <span className="badge bg-danger mt-2">Event Ended</span>}
                  </p>
                </div>

                <div className="card-footer text-center">
                  {!eventEnded ? (
                    availableSeats > 0 ? (
                      <>
                        {event.eventCategory === "Indoor" ? (
                          <>
                            <div className="mb-2">
                              <strong>Select Seats:</strong>
                              <div className="d-flex flex-wrap" style={{ gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                                {Array.from({ length: availableSeats }, (_, i) => {
                                  const seatLabel = generateSeatLabel(i);
                                  return (
                                    <div
                                      key={seatLabel}
                                      onClick={() => {
                                        const current = ticketQuantities[event._id] || [];
                                        const updated = current.includes(seatLabel)
                                          ? current.filter(s => s !== seatLabel)
                                          : [...current, seatLabel];
                                        setTicketQuantities(prev => ({
                                          ...prev,
                                          [event._id]: updated,
                                        }));
                                      }}
                                      style={{
                                        width: '35px', height: '35px', lineHeight: '35px',
                                        textAlign: 'center', backgroundColor: (ticketQuantities[event._id] || []).includes(seatLabel) ? '#28a745' : '#ccc',
                                        cursor: 'pointer', borderRadius: '4px'
                                      }}
                                    >{seatLabel}</div>
                                  );
                                })}
                              </div>
                            </div>
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                setSelectedBooking({
                                  eventId: event._id,
                                  organizerId: event.organizerId,
                                  quantity: (ticketQuantities[event._id] || []).length,
                                  selectedSeats: ticketQuantities[event._id] || [],
                                  stateId: event.stateId?._id || event.stateId,
                                  cityId: event.cityId?._id || event.cityId,
                                })
                              }
                              disabled={(ticketQuantities[event._id] || []).length === 0}
                            >
                              Book Now
                            </button>
                          </>
                        ) : (
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
                              {Array.from({ length: availableSeats }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1} Ticket(s)</option>
                              ))}
                            </select>
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                setSelectedBooking({
                                  eventId: event._id,
                                  organizerId: event.organizerId,
                                  quantity: ticketQuantities[event._id] || 1,
                                  selectedSeats: [],
                                  stateId: event.stateId?._id || event.stateId,
                                  cityId: event.cityId?._id || event.cityId,
                                })
                              }
                            >
                              Book Now
                            </button>
                          </>
                        )}
                      </>
                    ) : <p className="text-danger">Sold Out</p>
                  ) : <p className="text-muted">Booking closed</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBooking && (
        <div className="alert alert-warning mt-4">
          <h5>Confirm Booking</h5>
          <p>Are you sure you want to book <strong>{selectedBooking.quantity}</strong> ticket(s)?</p>
          <button className="btn btn-primary me-2" onClick={confirmBooking} disabled={bookingLoading}>
            {bookingLoading ? "Booking..." : "Yes, Confirm"}
          </button>
          <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
        </div>
      )}

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
// import '../../assets/ViewEvent.css';

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterName, setFilterName] = useState('');
//   const [filterCity, setFilterCity] = useState('');
//   const [filterEventType, setFilterEventType] = useState('');

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

//   const confirmBooking = async () => {
//     if (!selectedBooking) return;
//     setBookingLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         `/event/bookseat/${selectedBooking.eventId}`,
//         {
//           organizerId: selectedBooking.organizerId,
//           quantity: selectedBooking.quantity,
//           selectedSeats: selectedBooking.selectedSeats,
//           stateId: selectedBooking.stateId,
//           cityId: selectedBooking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert("Booking Success: " + res.data.message);
//       setBookingInfo({
//         eventName: res.data.data.event.eventName,
//         ticketsBooked: res.data.data.ticket.quantity,
//         startDate: res.data.data.event.startDate,
//         endDate: res.data.data.event.endDate,
//         bookingTime: res.data.data.ticket.createdAt,
//       });
//       setSelectedBooking(null);
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking Failed: " + (err.response?.data?.message || err.message));
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
//     const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
//     const matchType = filterEventType ? event.eventType === filterEventType : true;
//     return matchName && matchCity && matchType;
//   });

//   return (
//     <div className="container mt-5">
//       <h1 className="text-center">Upcoming Events</h1>
//       <p className="text-center mb-4">Browse and book your tickets</p>

//       <div className="container mb-4">
//         <div className="row g-2">
//           <div className="col-md-4">
//             <input type="text" className="form-control" placeholder="Search by Event Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
//           </div>
//           <div className="col-md-4">
//             <input type="text" className="form-control" placeholder="Search by City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
//           </div>
//           <div className="col-md-4">
//             <select className="form-select" value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)}>
//               <option value="">All Event Types</option>
//               <option value="Seminar">Seminar</option>
//               <option value="Workshop">Workshop</option>
//               <option value="ZoomMeeting">Zoom Meeting</option>
//               <option value="Concert">Concert</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {loading && <div className="text-center my-3">Loading events...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="row">
//         {filteredEvents.map((event) => {
//           const eventEnded = new Date(event.endDate) < new Date();
//           const availableSeats = event.numberOfSeats - event.bookedSeats;

//           return (
//             <div className="col-md-4 mb-4" key={event._id}>
//               <div className="card h-100 shadow-sm">
//                 <img src={event.eventImgUrl} className="card-img-top" alt={event.eventName} style={{ height: '200px', objectFit: 'cover' }} />
//                 <div className="card-body">
//                   <h5 className="card-title">{event.eventName}</h5>
//                   <p className="card-text">
//                     <strong>Type:</strong> {event.eventType} <br />
//                     <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
//                     <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
//                     <strong>State:</strong> {event.stateId?.name || event.stateId?.Name} <br />
//                     <strong>City:</strong> {event.cityId?.name} <br />
//                     {event.eventCategory === "ZoomMeeting" && event.zoomUrl && (
//                       <>
//                         <strong>Zoom URL:</strong> <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">{event.zoomUrl}</a> <br />
//                       </>
//                     )}
//                     {event.eventCategory !== "ZoomMeeting" && event.latitude && event.longitude && (
//                       <>
//                         <strong>Location:</strong> <a href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">View on Map</a> <br />
//                       </>
//                     )}
//                     <strong>Available Seats:</strong> {availableSeats} <br />
//                     {eventEnded && <span className="badge bg-danger mt-2">Event Ended</span>}
//                   </p>
//                 </div>

//                 <div className="card-footer text-center">
//                   {!eventEnded ? (
//                     availableSeats > 0 ? (
//                       <>
//                         {event.eventCategory === "Indoor" ? (
//                           <>
//                             <div className="mb-2">
//                               <strong>Select Seats:</strong>
//                               <div className="d-flex flex-wrap" style={{ gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
//                                 {Array.from({ length: availableSeats }, (_, i) => {
//                                   const seatNo = `S${i + 1}`;
//                                   return (
//                                     <div
//                                       key={seatNo}
//                                       onClick={() => {
//                                         const existing = ticketQuantities[event._id] || [];
//                                         const updated = existing.includes(seatNo)
//                                           ? existing.filter(s => s !== seatNo)
//                                           : [...existing, seatNo];
//                                         setTicketQuantities(prev => ({
//                                           ...prev,
//                                           [event._id]: updated,
//                                         }));
//                                       }}
//                                       style={{
//                                         width: '30px', height: '30px', lineHeight: '30px',
//                                         textAlign: 'center', backgroundColor: (ticketQuantities[event._id] || []).includes(seatNo) ? '#28a745' : '#ccc',
//                                         cursor: 'pointer', borderRadius: '4px'
//                                       }}
//                                     >{i + 1}</div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                             <button
//                               className="btn btn-success"
//                               onClick={() =>
//                                 setSelectedBooking({
//                                   eventId: event._id,
//                                   organizerId: event.organizerId,
//                                   quantity: (ticketQuantities[event._id] || []).length,
//                                   selectedSeats: ticketQuantities[event._id] || [],
//                                   stateId: event.stateId?._id || event.stateId,
//                                   cityId: event.cityId?._id || event.cityId,
//                                 })
//                               }
//                               disabled={(ticketQuantities[event._id] || []).length === 0}
//                             >
//                               Book Now
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <select
//                               className="form-select mb-2"
//                               value={ticketQuantities[event._id] || 1}
//                               onChange={(e) =>
//                                 setTicketQuantities({
//                                   ...ticketQuantities,
//                                   [event._id]: parseInt(e.target.value),
//                                 })
//                               }
//                             >
//                               {Array.from({ length: availableSeats }, (_, i) => (
//                                 <option key={i + 1} value={i + 1}>{i + 1} Ticket(s)</option>
//                               ))}
//                             </select>
//                             <button
//                               className="btn btn-success"
//                               onClick={() =>
//                                 setSelectedBooking({
//                                   eventId: event._id,
//                                   organizerId: event.organizerId,
//                                   quantity: ticketQuantities[event._id] || 1,
//                                   selectedSeats: [],
//                                   stateId: event.stateId?._id || event.stateId,
//                                   cityId: event.cityId?._id || event.cityId,
//                                 })
//                               }
//                             >
//                               Book Now
//                             </button>
//                           </>
//                         )}
//                       </>
//                     ) : <p className="text-danger">Sold Out</p>
//                   ) : <p className="text-muted">Booking closed</p>}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {selectedBooking && (
//         <div className="alert alert-warning mt-4">
//           <h5>Confirm Booking</h5>
//           <p>Are you sure you want to book <strong>{selectedBooking.quantity}</strong> ticket(s)?</p>
//           <button className="btn btn-primary me-2" onClick={confirmBooking} disabled={bookingLoading}>
//             {bookingLoading ? "Booking..." : "Yes, Confirm"}
//           </button>
//           <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
//         </div>
//       )}

//       {bookingInfo && (
//         <div className="alert alert-success mt-4">
//           <h4>Booking Confirmation</h4>
//           <p><strong>Event:</strong> {bookingInfo.eventName}</p>
//           <p><strong>Tickets Booked:</strong> {bookingInfo.ticketsBooked}</p>
//           <p><strong>Start Date:</strong> {new Date(bookingInfo.startDate).toDateString()}</p>
//           <p><strong>End Date:</strong> {new Date(bookingInfo.endDate).toDateString()}</p>
//           <p><strong>Booked At:</strong> {new Date(bookingInfo.bookingTime).toLocaleString()}</p>
//         </div>
//       )}
//     </div>
//   );
// };



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import '../../assets/ViewEvent.css';

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [filterName, setFilterName] = useState('');
//   const [filterCity, setFilterCity] = useState('');
//   const [filterEventType, setFilterEventType] = useState('');

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

//   const confirmBooking = async () => {
//     if (!selectedBooking) return;
//     setBookingLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         `http://localhost:3100/event/bookseat/${selectedBooking.eventId}`,
//         {
//           organizerId: selectedBooking.organizerId,
//           quantity: selectedBooking.quantity,
//           stateId: selectedBooking.stateId,
//           cityId: selectedBooking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert("Booking Success: " + res.data.message);
//       setBookingInfo({
//         eventName: res.data.data.event.eventName,
//         ticketsBooked: res.data.data.ticket.quantity,
//         startDate: res.data.data.event.startDate,
//         endDate: res.data.data.event.endDate,
//         bookingTime: res.data.data.ticket.createdAt,
//       });
//       setSelectedBooking(null);
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking Failed: " + (err.response?.data?.message || err.message));
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   // Filter logic
//   const filteredEvents = events.filter((event) => {
//     const matchName = filterName
//       ? event.eventName?.toLowerCase().includes(filterName.toLowerCase())
//       : true;
//     const matchCity = filterCity
//       ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase())
//       : true;
//     const matchType = filterEventType
//       ? event.eventType === filterEventType
//       : true;
//     return matchName && matchCity && matchType;
//   });

//   return (
//     <div className="" style={{ marginTop: "70px" }}>
//       <h1 className="text-center">Upcoming Events</h1>
//       <p className="text-center mb-4">Browse and book your tickets</p>

//       <div className="container mb-4">
//         <div className="row g-2">
//           <div className="col-md-4">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search by Event Name"
//               value={filterName}
//               onChange={(e) => setFilterName(e.target.value)}
//             />
//           </div>
//           <div className="col-md-4">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search by City"
//               value={filterCity}
//               onChange={(e) => setFilterCity(e.target.value)}
//             />
//           </div>
//           <div className="col-md-4">
//             <select
//               className="form-select"
//               value={filterEventType}
//               onChange={(e) => setFilterEventType(e.target.value)}
//             >
//               <option value="">All Event Types</option>
//               <option value="Seminar">Seminar</option>
//               <option value="Workshop">Workshop</option>
//               <option value="ZoomMeeting">Zoom Meeting</option>
//               <option value="Concert">Concert</option>
//               {/* Add more types as needed */}
//             </select>
//           </div>
//         </div>
//       </div>

//       {loading && <div className="text-center my-3">Loading events...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="horizontal-scroll-wrapper hidden alert alert-dark">
//         {filteredEvents.map((event) => {
//           const eventEnded = new Date(event.endDate) < new Date();
//           const availableSeats = event.numberOfSeats - event.bookedSeats;

//           return (
//             <div className="horizontal-card" key={event._id}>
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
//                     <strong>State:</strong> {event.stateId?.Name || event.stateId?.name} <br />
//                     <strong>City:</strong> {event.cityId?.name} <br />
//                     <strong>Location:</strong>{" "}
//                     <a
//                       href={`https://www.google.com/maps?q=${event.location}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       View on Map
//                     </a> <br />
//                     {event.eventType === "ZoomMeeting" && (
//                       <>
//                         <strong>Zoom URL:</strong>{" "}
//                         <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                           {event.zoomUrl}
//                         </a> <br />
//                       </>
//                     )}
//                     <strong>Available Seats:</strong> {availableSeats} <br />
//                     {eventEnded && <span className="badge bg-danger mt-2">Event Ended</span>}
//                   </p>
//                 </div>

//                 <div className="card-footer text-center">
//                   {!eventEnded ? (
//                     availableSeats > 0 ? (
//                       <>
//                         <select
//                           className="form-select mb-2"
//                           value={ticketQuantities[event._id] || 1}
//                           onChange={(e) =>
//                             setTicketQuantities({
//                               ...ticketQuantities,
//                               [event._id]: parseInt(e.target.value),
//                             })
//                           }
//                         >
//                           {Array.from({ length: availableSeats }, (_, i) => (
//                             <option key={i + 1} value={i + 1}>
//                               {i + 1} Ticket(s)
//                             </option>
//                           ))}
//                         </select>
//                         <button
//                           className="btn btn-success"
//                           onClick={() =>
//                             setSelectedBooking({
//                               eventId: event._id,
//                               organizerId: event.organizerId,
//                               quantity: ticketQuantities[event._id] || 1,
//                               stateId: event.stateId?._id || event.stateId,
//                               cityId: event.cityId?._id || event.cityId,
//                             })
//                           }
//                         >
//                           Book Now
//                         </button>
//                       </>
//                     ) : (
//                       <p className="text-danger">Sold Out</p>
//                     )
//                   ) : (
//                     <p className="text-muted">Booking closed</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {!loading && filteredEvents.length === 0 && (
//           <div className="text-center w-100 mt-4 text-muted">No events found for the given filter.</div>
//         )}
//       </div>

//       {selectedBooking && (
//         <div className="alert alert-warning mt-4">
//           <h5>Confirm Booking</h5>
//           <p>
//             Are you sure you want to book <strong>{selectedBooking.quantity}</strong> ticket(s)?
//           </p>
//           <button className="btn btn-primary me-2" onClick={confirmBooking} disabled={bookingLoading}>
//             {bookingLoading ? "Booking..." : "Yes, Confirm"}
//           </button>
//           <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
//         </div>
//       )}

//       {bookingInfo && (
//         <div className="alert alert-success mt-4">
//           <h4>Booking Confirmation</h4>
//           <p><strong>Event:</strong> {bookingInfo.eventName}</p>
//           <p><strong>Tickets Booked:</strong> {bookingInfo.ticketsBooked}</p>
//           <p><strong>Start Date:</strong> {new Date(bookingInfo.startDate).toDateString()}</p>
//           <p><strong>End Date:</strong> {new Date(bookingInfo.endDate).toDateString()}</p>
//           <p><strong>Booked At:</strong> {new Date(bookingInfo.bookingTime).toLocaleString()}</p>
//         </div>
//       )}
//     </div>
//   );
// };



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import '../../assets/ViewEvent.css'

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filterCity, setFilterCity] = useState("");
// const [filterEventType, setFilterEventType] = useState("");
// const [filterName, setFilterName] = useState("");

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

//   const confirmBooking = async () => {
//     if (!selectedBooking) return;
//     setBookingLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         `http://localhost:3100/event/bookseat/${selectedBooking.eventId}`,
//         {
//           organizerId: selectedBooking.organizerId,
//           quantity: selectedBooking.quantity,
//           stateId: selectedBooking.stateId,
//           cityId: selectedBooking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert("Booking Success: " + res.data.message);
//       setBookingInfo({
//         eventName: res.data.data.event.eventName,
//         ticketsBooked: res.data.data.ticket.quantity,
//         startDate: res.data.data.event.startDate,
//         endDate: res.data.data.event.endDate,
//         bookingTime: res.data.data.ticket.createdAt,
//       });
//       setSelectedBooking(null);
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking Failed: " + (err.response?.data?.message || err.message));
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   return (
//     <div className="" style={{ marginTop: "70px" }}>
//       <div className="container mb-4">
//   <div className="row g-3">
//     <div className="col-md-4">
//       <input
//         type="text"
//         className="form-control"
//         placeholder="Search by Event Name"
//         value={filterName}
//         onChange={(e) => setFilterName(e.target.value)}
//       />
//     </div>
//     <div className="col-md-4">
//       <input
//         type="text"
//         className="form-control"
//         placeholder="Filter by City"
//         value={filterCity}
//         onChange={(e) => setFilterCity(e.target.value)}
//       />
//     </div>
//     <div className="col-md-4">
//       <select
//         className="form-select"
//         value={filterEventType}
//         onChange={(e) => setFilterEventType(e.target.value)}
//       >
//         <option value="">All Types</option>
//         <option value="ZoomMeeting">ZoomMeeting</option>
//         <option value="InPerson">InPerson</option>
//         <option value="Seminar">Seminar</option>
//         {/* Add more if needed */}
//       </select>
//     </div>
//   </div>
// </div>

//       <h1 className="text-center">Upcoming Events</h1>
//       <p className="text-center mb-4">Browse and book your tickets</p>

//       {loading && <div className="text-center my-3">Loading events...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="horizontal-scroll-wrapper alert alert-dark">
//         {events.map((event) => {
//           const eventEnded = new Date(event.endDate) < new Date();
//           const availableSeats = event.numberOfSeats - event.bookedSeats;

//           return (
//             <div className="horizontal-card" key={event._id}>
//               <div className="card h-100 shadow-sm">
//                 <img
//                   src={event.eventImgUrl}
//                   className="card-img-top"
//                   alt={event.eventName}
//                   style={{ height: '200px', objectFit: 'cover',backgroundAttachment:'fixed' }}
//                 />
//                 <div className="card-body">
//                   <h5 className="card-title">{event.eventName}</h5>
//                   <p className="card-text">
//                     <strong>Type:</strong> {event.eventType} <br />
//                     <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
//                     <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
//                     <strong>State:</strong> {event.stateId?.Name || event.stateId?.name} <br />
//                     <strong>City:</strong> {event.cityId?.name} <br />
//                     <strong>Location:</strong>{' '}
//                     <a
//                       href={`https://www.google.com/maps?q=${event.location}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       View on Map
//                     </a> <br />
//                     {event.eventType === "ZoomMeeting" && (
//                       <>
//                         <strong>Zoom URL:</strong>{" "}
//                         <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
//                           {event.zoomUrl}
//                         </a> <br />
//                       </>
//                     )}
//                     <strong>Available Seats:</strong> {availableSeats} <br />
//                     {eventEnded && (
//                       <span className="badge bg-danger mt-2">Event Ended</span>
//                     )}
//                   </p>
//                 </div>

//                 <div className="card-footer text-center">
//                   {!eventEnded ? (
//                     availableSeats > 0 ? (
//                       <>
//                         <select
//                           className="form-select mb-2"
//                           value={ticketQuantities[event._id] || 1}
//                           onChange={(e) =>
//                             setTicketQuantities({
//                               ...ticketQuantities,
//                               [event._id]: parseInt(e.target.value),
//                             })
//                           }
//                         >
//                           {Array.from({ length: availableSeats }, (_, i) => (
//                             <option key={i + 1} value={i + 1}>
//                               {i + 1} Ticket(s)
//                             </option>
//                           ))}
//                         </select>
//                         <button
//                           className="btn btn-success"
//                           onClick={() =>
//                             setSelectedBooking({
//                               eventId: event._id,
//                               organizerId: event.organizerId,
//                               quantity: ticketQuantities[event._id] || 1,
//                               stateId: event.stateId?._id || event.stateId,
//                               cityId: event.cityId?._id || event.cityId,
//                             })
//                           }
//                         >
//                           Book Now
//                         </button>
//                       </>
//                     ) : (
//                       <p className="text-danger">Sold Out</p>
//                     )
//                   ) : (
//                     <p className="text-muted">Booking closed</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {selectedBooking && (
//         <div className="alert alert-warning mt-4">
//           <h5>Confirm Booking</h5>
//           <p>
//             Are you sure you want to book <strong>{selectedBooking.quantity}</strong> ticket(s)?
//           </p>
//           <button className="btn btn-primary me-2" onClick={confirmBooking} disabled={bookingLoading}>
//             {bookingLoading ? "Booking..." : "Yes, Confirm"}
//           </button>
//           <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
//         </div>
//       )}

//       {bookingInfo && (
//         <div className="alert alert-success mt-4">
//           <h4>Booking Confirmation</h4>
//           <p><strong>Event:</strong> {bookingInfo.eventName}</p>
//           <p><strong>Tickets Booked:</strong> {bookingInfo.ticketsBooked}</p>
//           <p><strong>Start Date:</strong> {new Date(bookingInfo.startDate).toDateString()}</p>
//           <p><strong>End Date:</strong> {new Date(bookingInfo.endDate).toDateString()}</p>
//           <p><strong>Booked At:</strong> {new Date(bookingInfo.bookingTime).toLocaleString()}</p>
//         </div>
//       )}
//     </div>
//   );
// };



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
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

//   const confirmBooking = async () => {
//     if (!selectedBooking) return;
//     setBookingLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         `http://localhost:3100/event/bookseat/${selectedBooking.eventId}`,
//         {
//           organizerId: selectedBooking.organizerId,
//           quantity: selectedBooking.quantity,
//           stateId: selectedBooking.stateId,
//           cityId: selectedBooking.cityId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert("Booking Success: " + res.data.message);
//       setBookingInfo({
//         eventName: res.data.data.event.eventName,
//         ticketsBooked: res.data.data.ticket.quantity,
//         startDate: res.data.data.event.startDate,
//         endDate: res.data.data.event.endDate,
//         bookingTime: res.data.data.ticket.createdAt,
//       });
//       setSelectedBooking(null);
//       getAllEvents();
//     } catch (err) {
//       console.error("Booking failed:", err.response?.data || err.message);
//       alert("Booking Failed: " + (err.response?.data?.message || err.message));
//     } finally {
//       setBookingLoading(false);
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
//             const availableSeats = event.numberOfSeats - event.bookedSeats;

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
//                       <strong>State:</strong> {event.stateId?.Name || event.stateId?.name} <br />
//                       <strong>City:</strong> {event.cityId?.name} <br />
//                       <strong>Location:</strong>{' '}
//                       <a
//                         href={`https://www.google.com/maps?q=${event.location}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
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
//                       <strong>Available Seats:</strong> {availableSeats} <br />
//                       {eventEnded && (
//                         <span className="badge bg-danger mt-2">Event Ended Successfully</span>
//                       )}
//                     </p>
//                   </div>

//                   <div className="card-footer text-center">
//                     {!eventEnded ? (
//                       availableSeats > 0 ? (
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
//                             {Array.from({ length: availableSeats }, (_, i) => (
//                               <option key={i + 1} value={i + 1}>
//                                 {i + 1} Ticket(s)
//                               </option>
//                             ))}
//                           </select>
//                           <button
//                             className="btn btn-success"
//                             onClick={() =>
//                               setSelectedBooking({
//                                 eventId: event._id,
//                                 organizerId: event.organizerId,
//                                 quantity: ticketQuantities[event._id] || 1,
//                                 stateId: event.stateId?._id || event.stateId,
//                                 cityId: event.cityId?._id || event.cityId,
//                               })
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

//         {selectedBooking && (
//           <div className="alert alert-warning mt-4">
//             <h5>Confirm Booking</h5>
//             <p>Are you sure you want to book <strong>{selectedBooking.quantity}</strong> ticket(s)?</p>
//             <button className="btn btn-primary me-2" onClick={confirmBooking} disabled={bookingLoading}>
//               {bookingLoading ? "Booking..." : "Yes, Confirm"}
//             </button>
//             <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
//           </div>
//         )}

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








