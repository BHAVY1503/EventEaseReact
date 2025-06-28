import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const BookingsOfMyEvents = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("/tickets/organizer/self", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTickets(res.data.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTickets();
    }
  }, [token]);

  if (loading) return <h4 className='text-center mt-4'>Loading bookings...</h4>;
  if (!tickets.length) return <h5 className='text-center mt-4'>No bookings yet.</h5>;

  // Group tickets by event
  const groupedByEvent = tickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId?._id;
    if (!acc[eventId]) acc[eventId] = { event: ticket.eventId, tickets: [] };
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {});

  return (
    <div className="container mt-5 alert alert-primary">
      <h2 className="text-center">Bookings of My Events</h2>
      
      {Object.values(groupedByEvent).map(({ event, tickets }) => (
        <div key={event._id} className="card my-4">
          <div className="card-header bg-dark text-white">
            <h5 style={{color:'#fff'}}>{event.eventName} ({event.eventType})</h5>
            <small>Start Date: {new Date(event.startDate).toLocaleDateString()}</small><br />
            <small>End Date: {new Date(event.endDate).toLocaleDateString()}</small>
          </div>
          <div className="card-body">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="mb-3 border-bottom pb-2">
                <p>
                  <strong>Booked By:</strong>{" "}
                  {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"} <br />
                  <strong>Email:</strong>{" "}
                  {ticket.userId?.email || ticket.organizerId?.email || "N/A"} <br />
                  <strong>Quantity:</strong> {ticket.quantity} <br />
                  <strong>City:</strong> {ticket.cityId?.name || "N/A"}, 
                  <strong> State:</strong> {ticket.stateId?.Name || "N/A"} <br />
                </p>

                {event.eventCategory === "Indoor" && ticket.selectedSeats?.length > 0 && (
                  <div className="mb-2">
                    <strong>Selected Seats:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {ticket.selectedSeats.map((seat, index) => (
                        <span key={index} className="badge bg-info">{seat}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center">
        <a href="/organizer" className="btn btn-outline-primary">Back to Home</a>
      </div>
    </div>
  );
};


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const BookingsOfMyEvents = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // const organizerId = localStorage.getItem("organizerId");
//   const token = localStorage.getItem("token")
//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         // const res = await axios.get(`/tickets/organizer/self`);
//         // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
//         const res = await axios.get("/tickets/organizer/self", {
//         headers: {
//         Authorization: `Bearer ${token}`,
//          },
//         });

//         localStorage.setItem("token",token)
//         setTickets(res.data.data);
//       } catch (err) {
//         console.error("Error fetching tickets:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchTickets();
//     }
//   }, [token]);

//   if (loading) return <h4 className='text-center mt-4'>Loading bookings...</h4>;
//   if (!tickets.length) return <h5 className='text-center mt-4'>No bookings yet.</h5>;

//   // Group tickets by event
//   const groupedByEvent = tickets.reduce((acc, ticket) => {
//     const eventId = ticket.eventId?._id;
//     if (!acc[eventId]) acc[eventId] = { event: ticket.eventId, tickets: [] };
//     acc[eventId].tickets.push(ticket);
//     return acc;
//   }, {});

//   return (
//     <div className="container mt-5 alert alert-primary">
//       <h2 className="text-center">Bookings of My Events</h2>
//       {Object.values(groupedByEvent).map(({ event, tickets }) => (
          
//         <div key={event._id} className="card my-4">
//           <div className="card-header bg-dark text-white">
//             <h5 style={{color:"#ffffff"}}>{event.eventName} ({event.eventType})</h5>
//             <small>StartDate: </small><small>{new Date(event.startDate).toLocaleDateString()}</small><br/>
//             <small>EndDate: </small><small>{new Date(event.endDate).toLocaleDateString()}</small>

//           </div>
//           <div className="card-body">
//             {tickets.map((ticket) => (
//               <div key={ticket._id} className="mb-2 border-bottom pb-2">
               
//            <p>
//           <strong>Booked By:</strong>{" "}
//            {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"} <br />
//           <strong>Email:</strong>{" "}
//            {ticket.userId?.email || ticket.organizerId?.email || "N/A"} <br />
//            <strong>Quantity:</strong> {ticket.quantity} <br />
//            <strong>City:</strong> {ticket.cityId?.name}, <strong>State:</strong> {ticket.stateId?.Name}
//            </p>
//            </div>

//             ))}
//           </div>
//         </div>
//       ))}
//       <a href='/organizer' className='btn btn-outline-primary' style={{marginLeft:"500px"}} >Back to Home</a>
//     </div>
//   );
// };

