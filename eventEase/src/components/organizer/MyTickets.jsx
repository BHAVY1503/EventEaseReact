import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/tickets/usertickets/${userId}`);
        console.log("Fetched tickets:", res.data.data); // Debug log
        setTickets(res.data.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    if (userId) {
      fetchTickets();
    }
  }, [userId]);

  return (
    <div className="container mt-5 alert alert-secondary">
      <h2 className="text-center mb-4 ">My Tickets</h2>
      {tickets.length === 0 ? (
        <p className="text-center">No tickets booked yet.</p>
      ) : (
        <div className="row ">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="col-md-6 mb-4">
              <div className="card shadow p-3 alert alert-success">
                <h5><strong>Event:</strong> {ticket.eventId?.eventName || "N/A"}</h5>
                <p><strong>Quantity:</strong> {ticket.quantity}</p>
                <p><strong>Ticket ID:</strong> {ticket._id}</p>
                <p><strong>Booked On:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                <p><strong>State:</strong> {ticket.stateId?.Name || "N/A"}</p>
                <p><strong>City:</strong> {ticket.cityId?.name || "N/A"}</p>
                <p><strong>StartDate:</strong> {ticket.eventId?.startDate || "N/A"}</p>
                <p><strong>EndDate:</strong> {ticket.eventId?.endDate || "N/A"}</p>


              </div>
            </div>
          ))}
        </div>
      )}
      <a href='/user' style={{marginLeft:'500px'}}>Back to Home</a>
    </div>
  );
};


// // src/pages/MyTickets.js
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const MyTickets = () => {
//   const [tickets, setTickets] = useState([]);

//   useEffect(() => {
//     const userId = localStorage.getItem("id");

//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get(`/ticket/usertickets/${userId}`);
//         setTickets(res.data.data);
//       } catch (err) {
//         console.error("Error fetching tickets:", err);
//       }
//     };

//     fetchTickets();
//   }, []);

//   return (
//     <div className="container mt-5">
//       <h2>My Booked Tickets</h2>
//       {tickets.length === 0 ? (
//         <p>You haven't booked any tickets yet.</p>
//       ) : (
//         <div className="row">
//           {tickets.map((ticket) => (
//             <div className="col-md-4 mb-4" key={ticket._id}>
//               <div className="card">
//                 <div className="card-body">
//                   <h5 className="card-title">{ticket.eventId?.eventName}</h5>
//                   <p className="card-text">
//                     <strong>Event Type:</strong> {ticket.eventId?.eventType} <br />
//                     <strong>Date:</strong> {new Date(ticket.eventId?.startDate).toLocaleDateString()} <br />
//                     <strong>State:</strong> {ticket.stateId?.name}<br/>
//                     <strong>City:</strong> {ticket.cityId?.name}<br/>


//                     <strong>Quantity:</strong> {ticket.quantity}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
