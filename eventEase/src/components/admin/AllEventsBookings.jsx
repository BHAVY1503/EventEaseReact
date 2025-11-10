import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const AllEventBookings = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("/tickets/alltickets", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTickets(res.data.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTickets();
  }, [token]);

  if (loading) {
    return <div className="text-center mt-4"><h4>Loading all bookings...</h4></div>;
  }

  if (!tickets.length && !loading) {
    return <div className="text-center mt-4"><h5>No bookings found.</h5></div>;
  }

  // Group tickets by event
  const groupedByEvent = tickets.reduce((acc, ticket) => {
    const event = ticket.eventId;
    if (!event) return acc; // skip if event is null
    const eventId = event._id;
    if (!acc[eventId]) acc[eventId] = { event, tickets: [] };
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {});

  return (
    // <div className="container mt-5 alert alert-primary">
    <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">

      <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">All Event Bookings (Admin View)</h2>
      {Object.values(groupedByEvent).map(({ event, tickets }) => {
        if (!event) return null; // skip if event is null
        return (
          <div key={event._id} className="card my-4">
            <div className="card-header bg-primary text-white">
              <h5>{event.eventName} ({event.eventType})</h5>
              <small>Start: {new Date(event.startDate).toLocaleDateString()}</small><br />
              <small>End: {new Date(event.endDate).toLocaleDateString()}</small>
            </div>
            <div className="card-body">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="mb-3 border-bottom pb-2">
                  <p>
                    <strong>Booked By:</strong> {ticket.userId?.fullName || "N/A"} <br />
                    <strong>Email:</strong> {ticket.userId?.email || "N/A"} <br />
                    <strong>Quantity:</strong> {ticket.quantity} <br />
                    <strong>City:</strong> {ticket.cityId?.name || "N/A"}, <strong>State:</strong> {ticket.stateId?.Name || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="text-center mt-3">
        <a href='/admin' className='btn btn-outline-dark dark:bg-white'>Back to Admin Home</a>
      </div>
    </div>
  );
};

