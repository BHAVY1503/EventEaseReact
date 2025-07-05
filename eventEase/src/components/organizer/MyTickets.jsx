import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/tickets/usertickets/self`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(res.data.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    if (token) fetchTickets();
  }, [token]);

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < now) return "past";
    if (start > now) return "upcoming";
    return "ongoing";
  };

  const getCardClass = (status) => {
    switch (status) {
      case "past": return "border-danger bg-light";
      case "upcoming": return "border-primary bg-white";
      case "ongoing": return "border-success bg-white";
      default: return "border-secondary";
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "past": return "badge bg-danger";
      case "upcoming": return "badge bg-primary";
      case "ongoing": return "badge bg-success";
      default: return "badge bg-secondary";
    }
  };

  const groupSeatsByZone = (seats) => {
    const zoneMap = {};
    seats?.forEach((label) => {
      const zone = label[0];
      if (!zoneMap[zone]) zoneMap[zone] = [];
      zoneMap[zone].push(label);
    });
    return zoneMap;
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🎟️ My Tickets</h2>
      {tickets.length === 0 ? (
        <p className="text-center text-muted">No tickets booked yet.</p>
      ) : (
        <div className="row">
          {tickets.map((ticket) => {
            const event = ticket.eventId;
            const status = getEventStatus(event?.startDate, event?.endDate);
            const cardClass = getCardClass(status);
            const badgeClass = getBadgeClass(status);
            const isIndoor = event?.eventCategory === "Indoor";
            const isZoom = event?.eventCategory === "ZoomMeeting";
            const groupedSeats = groupSeatsByZone(ticket.selectedSeats);

            return (
              <div key={ticket._id} className="col-md-6 mb-4">
                <div className={`card shadow border-3 ${cardClass}`}>
                  {event?.eventImage && (
                    <img
                      src={event.eventImage}
                      alt="Event"
                      className="card-img-top"
                      style={{ maxHeight: '180px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <span className={badgeClass} style={{ float: 'right' }}>
                      {status.toUpperCase()}
                    </span>
                    <h5 className="card-title">{event?.eventName || "Unnamed Event"}</h5>
                    <p className="card-text">
                      <strong>🎟 Quantity:</strong> {ticket.quantity}<br />
                      <strong>📅 Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}<br />
                      <strong>🆔 Ticket ID:</strong> {ticket._id}<br />
                      <strong>📅 Start:</strong> {new Date(event.startDate).toLocaleDateString()}<br />
                      <strong>📅 End:</strong> {new Date(event.endDate).toLocaleDateString()}<br />

                      {!isZoom && (
                        <>
                          <strong>📍 Location:</strong> {ticket.cityId?.name}, {ticket.stateId?.Name}<br />
                          {event.latitude && event.longitude && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary mt-2"
                            >
                              📍 View Directions
                            </a>
                          )}
                        </>
                      )}

                      {isZoom && event.zoomUrl && (
                        <>
                          <strong>🔗 Zoom URL:</strong>{" "}
                          <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
                            Join Meeting
                          </a><br />
                        </>
                      )}
                    </p>

                    {isIndoor && ticket.selectedSeats?.length > 0 && (
                      <div className="mb-2">
                        <strong>🎯 Selected Seats by Zone:</strong>
                        {Object.entries(groupedSeats).map(([zone, seats]) => (
                          <div key={zone} className="mt-2">
                            <strong>Zone {zone}:</strong>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                              {seats.map((s, i) => (
                                <span key={i} className="badge bg-info">{s}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-center mt-4">
        <a href='/user' className="btn btn-outline-secondary">Back to Home</a>
      </div>
    </div>
  );
};



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export const MyTickets = () => {
//   const [tickets, setTickets] = useState([]);
//   // const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");


//   useEffect(() => {
//       const fetchTickets = async () => {
//       try {
//         const res = await axios.get(`/tickets/usertickets/self`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setTickets(res.data.data);
//       } catch (error) {
//         console.error("Error fetching tickets:", error);
//       }
//     };

//     if (token) {
//       fetchTickets();
//     }
//   }, [token]);

//   const getEventStatus = (startDate, endDate) => {
//     const now = new Date();
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (end < now) return "past";
//     if (start > now) return "upcoming";
//     return "ongoing";
//   };

//   const getCardClass = (status) => {
//     switch (status) {
//       case "past": return "border-danger bg-light";
//       case "upcoming": return "border-primary bg-white";
//       case "ongoing": return "border-success bg-white";
//       default: return "border-secondary";
//     }
//   };

//   const getBadgeClass = (status) => {
//     switch (status) {
//       case "past": return "badge bg-danger";
//       case "upcoming": return "badge bg-primary";
//       case "ongoing": return "badge bg-success";
//       default: return "badge bg-secondary";
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">🎟️ My Tickets</h2>
//       {tickets.length === 0 ? (
//         <p className="text-center text-muted">No tickets booked yet.</p>
//       ) : (
//         <div className="row">
//           {tickets.map((ticket) => {
//             const event = ticket.eventId;
//             const status = getEventStatus(event?.startDate, event?.endDate);
//             const cardClass = getCardClass(status);
//             const badgeClass = getBadgeClass(status);

//             return (
//               <div key={ticket._id} className="col-md-6 mb-4">
//                 <div className={`card shadow border-3 ${cardClass}`}>
//                   {event?.eventImage && (
//                     <img
//                       src={event.eventImage}
//                       alt="Event"
//                       className="card-img-top"
//                       style={{ maxHeight: '180px', objectFit: 'cover' }}
//                     />
//                   )}
//                   <div className="card-body">
//                     <span className={badgeClass} style={{ float: 'right' }}>
//                       {status.toUpperCase()}
//                     </span>
//                     <h5 className="card-title">{event?.eventName || "Unnamed Event"}</h5>
//                     <p className="card-text">
//                       <strong>🎟 Quantity:</strong> {ticket.quantity}<br />
//                       <strong>📅 Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}<br />
//                       <strong>🆔 Ticket ID:</strong> {ticket._id}<br />

//                       <strong>📍 Location:</strong> {ticket.cityId?.name}, {ticket.stateId?.Name}<br />
//                       <strong>⏳ Start:</strong> {event?.startDate ? new Date(event.startDate).toLocaleDateString() : "N/A"}<br />
//                       <strong>⏱ End:</strong> {event?.endDate ? new Date(event.endDate).toLocaleDateString() : "N/A"}
                       
//                               {/* <strong>Location:</strong>{" "}
//                               <a
//                                 className='btn btn-sm btn-outline-primary'
//                                 href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 View Directions
//                               </a><br /> */}
                            
                          
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//       <div className="text-center mt-4">
//         <a href='/user' className="btn btn-outline-secondary">Back to Home</a>
//       </div>
//     </div>
//   );
// };



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export const MyTickets = () => {
//   const [tickets, setTickets] = useState([]);
//   const userId = localStorage.getItem("userId");

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get(`/tickets/usertickets/${userId}`);
//         console.log("Fetched tickets:", res.data.data);
//         setTickets(res.data.data);
//       } catch (error) {
//         console.error("Error fetching tickets:", error);
//       }
//     };

//     if (userId) {
//       fetchTickets();
//     }
//   }, [userId]);

//   return (
//     <div className="container mt-5 alert alert-secondary">
//       <h2 className="text-center mb-4">My Tickets</h2>
//       {tickets.length === 0 ? (
//         <p className="text-center">No tickets booked yet.</p>
//       ) : (
//         <div className="row">
//           {tickets.map((ticket) => {
//             const isPastEvent = new Date(ticket.eventId?.endDate) < new Date();

//             return (
//               <div key={ticket._id} className="col-md-6 mb-4">
//                 <div className={`card shadow p-3 alert ${isPastEvent ? 'alert-danger' : 'alert-success'}`}>
//                     {event?.eventImage && (
//           <img 
//             src={event.eventImage} 
//             alt="Event" 
//             style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} 
//           />
//         )}
//                   <h5><strong>Event:</strong> {ticket.eventId?.eventName || "N/A"}</h5>
//                   <p><strong>Quantity:</strong> {ticket.quantity}</p>
//                   <p><strong>Ticket ID:</strong> {ticket._id}</p>
//                   <p><strong>Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
//                   <p><strong>State:</strong> {ticket.stateId?.Name || "N/A"}</p>
//                   <p><strong>City:</strong> {ticket.cityId?.name || "N/A"}</p>
//                   <p><strong>Start Date:</strong> 
//   {ticket.eventId?.startDate ? new Date(ticket.eventId.startDate).toLocaleDateString() : "N/A"}
// </p>
// <p><strong>End Date:</strong> 
//   {ticket.eventId?.endDate ? new Date(ticket.eventId.endDate).toLocaleDateString() : "N/A"}
// </p>

//                   {/* <p><strong>Start Date:</strong> {new Date(ticket.eventId?.startDate).toLocaleDateString() || "N/A"}</p>
//                   <p><strong>End Date:</strong> {new Date(ticket.eventId?.endDate).toLocaleDateString() || "N/A"}</p> */}
//                   {isPastEvent && (
//                     <p className="text-danger"><strong>Note:</strong> This event has ended.</p>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//       <a href='/user' className="btn btn-secondary mt-3 d-block mx-auto w-25">Back to Home</a>
//     </div>
//   );
// };


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export const MyTickets = () => {
//   const [tickets, setTickets] = useState([]);
//   const userId = localStorage.getItem("userId");

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get(`/tickets/usertickets/${userId}`);
//         console.log("Fetched tickets:", res.data.data); // Debug log
//         setTickets(res.data.data);
//       } catch (error) {
//         console.error("Error fetching tickets:", error);
//       }
//     };

//     if (userId) {
//       fetchTickets();
//     }
//   }, [userId]);

//   return (
//     <div className="container mt-5 alert alert-secondary">
//       <h2 className="text-center mb-4 ">My Tickets</h2>
//       {tickets.length === 0 ? (
//         <p className="text-center">No tickets booked yet.</p>
//       ) : (
//         <div className="row ">
//           {tickets.map((ticket) => (
//             <div key={ticket._id} className="col-md-6 mb-4">
//               <div className="card shadow p-3 alert alert-success">
//                 <h5><strong>Event:</strong> {ticket.eventId?.eventName || "N/A"}</h5>
//                 <p><strong>Quantity:</strong> {ticket.quantity}</p>
//                 <p><strong>Ticket ID:</strong> {ticket._id}</p>
//                 <p><strong>Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
//                 <p><strong>State:</strong> {ticket.stateId?.Name || "N/A"}</p>
//                 <p><strong>City:</strong> {ticket.cityId?.name || "N/A"}</p>
//                 <p><strong>StartDate:</strong> {ticket.eventId?.startDate || "N/A"}</p>
//                 <p><strong>EndDate:</strong> {ticket.eventId?.endDate || "N/A"}</p>


//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//       <a href='/user' style={{marginLeft:'500px'}}>Back to Home</a>
//     </div>
//   );
// };



