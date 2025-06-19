import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const BookedTickets = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const organizerId = localStorage.getItem("organizerId");
      if (!organizerId) return;

      try {
        const res = await axios.get(`/tickets/organizer/${organizerId}`);
        setTickets(res.data.data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  if (!tickets.length) {
    return <div className="container mt-4"><h4>No tickets booked yet.</h4></div>;
  }

  return (
    <div className="container mt-4">
      <h3>Booked Tickets</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Event Type</th>
            <th>Booked By organizer</th>
            {/* <th>Booked By user</th> */}
            {/* <th>Email</th> */}
            <th>State</th>     
            <th>City</th> 
            {/* <th>organizer</th>  */}
            <th>Quantity</th>
            <th>Booking Date</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, index) => (
            <tr key={index}>
              <td>{ticket.eventId?.eventName || "N/A"}</td>
              <td>{ticket.eventId?.eventType || "N/A"}</td>
              <td>{ticket.organizerId?.name || "Unknown"}</td>
              {/* <td>{ticket.userId?.fullName || "Unknown"}</td> */}
              <td>{ticket.stateId?.Name || "Unknown"}</td>
              <td>{ticket.cityId?.name || "Unknown"}</td>
              {/* <td>{ticket.organizerId?.name || "Unknown"}</td> */}
              <td>{ticket.quantity}</td>
              <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export const BookedTickets = () => {
//   const [tickets, setTickets] = useState([]);

//   useEffect(() => {
//     const fetchTickets = async () => {
//       const organizerId = localStorage.getItem("id");
//       if (!organizerId) return;

//       try {
//         const res = await axios.get(`/tickets/organizer/${organizerId}`);
//         setTickets(res.data.data || []);
//       } catch (error) {
//         console.error("Error fetching tickets:", error);
//       }
//     };

//     fetchTickets();
//   }, []);

//   if (!tickets.length) {
//     return <div className="container mt-4"><h4>No tickets booked yet.</h4></div>;
//   }

//   return (
//     <div className="container mt-4">
//       <h3>Booked Tickets</h3>
//       <table className="table table-bordered table-striped">
//         <thead>
//           <tr>
//             <th>Event Name</th>
//             <th>Booked By</th>
//             <th>Quantity</th>
//             <th>Booking Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tickets.map((ticket, index) => (
//             <tr key={index}>
//               <td>{ticket.eventName}</td>
//               <td>{ticket.bookedBy}</td>
//               <td>{ticket.quantity}</td>
//               <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };
