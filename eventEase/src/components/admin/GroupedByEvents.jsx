import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const GroupedByEvents = () => {
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const token = localStorage.getItem("token");

  const fetchGroupedEvents = async () => {
    try {
      const res = await axios.get(`/event/groupedeventsbyorganizer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupedEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching grouped events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGroupedEvents();
    } else {
      console.error("Token not found");
      setLoading(false);
    }
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchGroupedEvents();
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
      fetchGroupedEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    }
  };

  return (
    <div className='container' style={{ marginTop: "70px" }}>
      <h1 className='text-center'>All Events Grouped by Organizer</h1>
      <p className='text-center mb-4'>This data is visible to admins</p>

      <div className='container mt-4 p-4 shadow' style={{ backgroundColor: "#555" }}>
        {loading ? (
          <div className='text-center text-white'>
            <h4>Loading grouped events...</h4>
          </div>
        ) : groupedEvents.length === 0 ? (
          <div className='text-center text-white'>
            <h5>No events found.</h5>
          </div>
        ) : (
          groupedEvents.map((group, i) => (
            <div key={i} className='mb-5'>
              <h4 className="text-white mb-3">
                Organizer: {group.organizerName} ({group.organizerEmail})
              </h4>
              <div className='row'>
                {group.events.map((event) => {
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
                        <div className='card-body'>
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

                          {!eventEnded && (
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
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';

// export const GroupedByEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [bookingQuantity, setBookingQuantity] = useState({});
//   const [bookedTickets, setBookedTickets] = useState({});
//   const [organizerId, setOrganizerId] = useState(null);
//   const token = localStorage.getItem("token");

//   //Fetch Organizer ID using the token
//   const getOrganizerId = async () => {
//     try {
//       const res = await axios.get("user/getuserbytoken", {
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
//       const res = await axios.get(`/event/groupedeventsbyorganizer`, {
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
