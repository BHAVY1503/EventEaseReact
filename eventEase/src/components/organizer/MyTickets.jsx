// src/pages/MyTickets.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("id");

    const fetchTickets = async () => {
      try {
        const res = await axios.get(`/event/getticketsbyuser/${userId}`);
        setTickets(res.data.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="container mt-5">
      <h2>My Booked Tickets</h2>
      {tickets.length === 0 ? (
        <p>You haven't booked any tickets yet.</p>
      ) : (
        <div className="row">
          {tickets.map((ticket) => (
            <div className="col-md-4 mb-4" key={ticket._id}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{ticket.eventId?.eventName}</h5>
                  <p className="card-text">
                    <strong>Event Type:</strong> {ticket.eventId?.eventType} <br />
                    <strong>Date:</strong> {new Date(ticket.eventId?.startDate).toLocaleDateString()} <br />
                    <strong>State:</strong> {ticket.stateId?.name}<br/>
                    <strong>City:</strong> {ticket.cityId?.name}<br/>


                    <strong>Quantity:</strong> {ticket.quantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
