import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const BookingsOfMyEvents = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const organizerId = localStorage.getItem("organizerId");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/tickets/organizer/${organizerId}`);
        setTickets(res.data.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (organizerId) {
      fetchTickets();
    }
  }, [organizerId]);

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
            <h5 style={{color:"#ffffff"}}>{event.eventName} ({event.eventType})</h5>
            <small>{new Date(event.startDate).toLocaleDateString()}</small>
          </div>
          <div className="card-body">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="mb-2 border-bottom pb-2">
           <p>
          <strong>Booked By:</strong>{" "}
           {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"} <br />
          <strong>Email:</strong>{" "}
           {ticket.userId?.email || ticket.organizerId?.email || "N/A"} <br />
           <strong>Quantity:</strong> {ticket.quantity} <br />
           <strong>City:</strong> {ticket.cityId?.name}, <strong>State:</strong> {ticket.stateId?.Name}
           </p>
           </div>

            ))}
          </div>
        </div>
      ))}
      <a href='/organizer' className='btn btn-outline-primary' style={{marginLeft:"500px"}} >Back to Home</a>
    </div>
  );
};

