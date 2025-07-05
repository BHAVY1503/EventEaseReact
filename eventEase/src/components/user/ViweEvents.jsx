import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/ViewEvent.css';

export const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterEventType, setFilterEventType] = useState('');

  const token = localStorage.getItem("token");

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
    try {
      const res = await axios.get(`/event/getallevents`);
      setEvents(res.data.data);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const bookEventWithoutSeats = async (booking) => {
    if (!window.confirm("Are you sure you want to book this ticket?")) return;

    try {
      const res = await axios.post(
        `/event/bookseat/${booking.eventId}`,
        {
          quantity: booking.quantity,
          selectedSeats: [],
          organizerId: booking.organizerId,
          stateId: booking.stateId,
          cityId: booking.cityId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Booking successful!");
      setBookingInfo(res.data.message);
      getAllEvents();
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      alert("Booking failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchName = filterName ? event.eventName?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchCity = filterCity ? event.cityId?.name?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchType = filterEventType ? event.eventType === filterEventType : true;
    return matchName && matchCity && matchType;
  });

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Upcoming Events</h2>

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
      {bookingInfo && <div className="alert alert-success text-center">{bookingInfo}</div>}

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

                    {event.eventCategory === "ZoomMeeting" ? (
                      <>
                        <strong>Zoom URL:</strong> <a href={event.zoomUrl} target="_blank" rel="noreferrer">{event.zoomUrl}</a> <br />
                      </>
                    ) : (
                      <>
                        <strong>City:</strong> {event.cityId?.name} <br />
                        {event.latitude && event.longitude && (
                          <>
                            <strong>Location:</strong> <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer">View on Map</a> <br />
                          </>
                        )}
                      </>
                    )}
                    <strong>Available Seats:</strong> {availableSeats}
                    {eventEnded && <span className="badge bg-danger mt-2 d-block">Event Ended</span>}
                  </p>
                </div>

                <div className="card-footer text-center">
                  {!eventEnded ? (
                    availableSeats > 0 ? (
                      event.eventCategory === "Indoor" ? (
                        <Link to={`/select-seats/${event._id}`} className="btn btn-primary">
                          Select Seats
                        </Link>
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
                            onClick={() => {
                              const booking = {
                                eventId: event._id,
                                organizerId: event.organizerId,
                                quantity: ticketQuantities[event._id] || 1,
                                selectedSeats: [],
                                stateId: event.stateId?._id || event.stateId,
                                cityId: event.cityId?._id || event.cityId,
                              };
                              setSelectedBooking(booking);
                              bookEventWithoutSeats(booking);
                            }}
                          >
                            Book  <small>at just &#8377;{event.ticketRate} </small>
                          </button>
                        </>
                      )
                    ) : <span className="text-danger">Sold Out</span>
                  ) : <span className="text-muted">Booking Closed</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

//working..
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import '../../assets/ViewEvent.css';

// export const ViewEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [bookingInfo, setBookingInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
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
//     try {
//       const res = await axios.get(`/event/getallevents`);
//       setEvents(res.data.data);
//     } catch (err) {
//       setError("Failed to load events");
//     } finally {
//       setLoading(false);
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
//       <h2 className="text-center mb-4">Upcoming Events</h2>

//       <div className="row g-2 mb-4">
//         <div className="col-md-4">
//           <input type="text" className="form-control" placeholder="Search by Event Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
//         </div>
//         <div className="col-md-4">
//           <input type="text" className="form-control" placeholder="Search by City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
//         </div>
//         <div className="col-md-4">
//           <select className="form-select" value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)}>
//             <option value="">All Event Types</option>
//             <option value="Seminar">Seminar</option>
//             <option value="Workshop">Workshop</option>
//             <option value="ZoomMeeting">Zoom Meeting</option>
//             <option value="Concert">Concert</option>
//           </select>
//         </div>
//       </div>

//       {loading && <div className="text-center">Loading events...</div>}
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

//                     {event.eventCategory === "ZoomMeeting" ? (
//                       <>
//                         <strong>Zoom URL:</strong> <a href={event.zoomUrl} target="_blank" rel="noreferrer">{event.zoomUrl}</a> <br />
//                       </>
//                     ) : (
//                       <>
//                         <strong>City:</strong> {event.cityId?.name} <br />
//                         {event.latitude && event.longitude && (
//                           <>
//                             <strong>Location:</strong> <a href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer">View on Map</a> <br />
//                           </>
//                         )}
//                       </>
//                     )}
//                     <strong>Available Seats:</strong> {availableSeats}
//                     {eventEnded && <span className="badge bg-danger mt-2 d-block">Event Ended</span>}
//                   </p>
//                 </div>

//                 <div className="card-footer text-center">
//                   {!eventEnded ? (
//                     availableSeats > 0 ? (
//                       event.eventCategory === "Indoor" ? (
//                         <Link to={`/select-seats/${event._id}`} className="btn btn-primary">
//                           Select Seats
//                         </Link>
//                       ) : (
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
//                               <option key={i + 1} value={i + 1}>{i + 1} Ticket(s)</option>
//                             ))}
//                           </select>
//                           <button
//                             className="btn btn-success"
//                             onClick={() =>
//                               setSelectedBooking({
//                                 eventId: event._id,
//                                 organizerId: event.organizerId,
//                                 quantity: ticketQuantities[event._id] || 1,
//                                 selectedSeats: [],
//                                 stateId: event.stateId?._id || event.stateId,
//                                 cityId: event.cityId?._id || event.cityId,
//                               })
//                             }
//                           >
//                             Book Now
//                           </button>
//                         </>
//                       )
//                     ) : <span className="text-danger">Sold Out</span>
//                   ) : <span className="text-muted">Booking Closed</span>}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };


