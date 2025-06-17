import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const ViewEvents = ({eventId}) => {
  const [events, setEvents] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleBooking = async (eventId, organizerId, quantity) => {
  try {
    const userId = localStorage.getItem("userId"); // or "id" based on your storage key

    const res = await axios.post(`http://localhost:3100/event/bookseat/${eventId}`, {
      userId,
      organizerId,
      quantity,
    });

    alert("Booking Success: " + res.data.message);
    console.log("Ticket Info:", res.data);
    setBookingInfo(res.data.bookingDetails);
    getAllEvents(); // Refresh seats
  } catch (err) {
    console.error("Booking failed:", err.response?.data || err.message);
    alert("Booking Failed: " + (err.response?.data?.message || err.message));
  }
};


  const handleBookSeat = async (eventId, organizerId) => {
  const userId = localStorage.getItem("id");
  const quantity = ticketQuantities[eventId] || 1;

  try {
    const res = await axios.post(`/event/bookseat/${eventId}`, {
      userId,
      organizerId,
      quantity,
    });
    alert(res.data.message);
    setBookingInfo(res.data.bookingDetails);
    getAllEvents();
  } catch (err) {
    console.error("Error booking seat", err);
  }
};


  // const handleBookSeat = async (eventId) => {
  //   const quantity = ticketQuantities[eventId] || 1;
  //   const userId = localStorage.getItem("id");
  //   try {
  //     const res = await axios.post(`/event/bookseat/${eventId}`, { quantity, userId, organizerId });
  //     alert(res.data.message);
  //     setBookingInfo(res.data.bookingDetails);
  //     getAllEvents(); // Refresh seat availability
  //   } catch (err) {
  //     console.error("Error booking seat", err);
  //     alert(err?.response?.data?.message || "Booking failed");
  //   }
  // };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <h1 className="text-center">Upcoming Events</h1>
      <p className="text-center mb-4">Browse and book your tickets</p>

      {loading && <div className="text-center my-3">Loading events...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="container mt-4 p-4 shadow" style={{ backgroundColor: "#555" }}>
        <div className="row">
          {events.map((event) => (  
            <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={event._id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={event.eventImgUrl}
                  className="card-img-top"
                  alt={event.eventName}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{event.eventName}</h5>
                  <p className="card-text">
                    <strong>Type:</strong> {event.eventType} <br />
                    <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()} <br />
                    <strong>End:</strong> {new Date(event.endDate).toLocaleDateString()} <br />
                    <strong>State:</strong> {event.stateId?.Name} <br />
                    <strong>City:</strong> {event.cityId?.name} <br />
                    <strong>Available Seats:</strong> {event.numberOfSeats}
                  </p>
                </div>
                <div className="card-footer text-center">
                  {event.numberOfSeats > 0 ? (
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
                        {Array.from({ length: event.numberOfSeats }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} Ticket(s)
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-success"
                        // onClick={() => handleBooking(event._id, event.organizerId)}
                        onClick={() =>
                        handleBooking(event._id,event.organizerId, ticketQuantities[event._id] || 1)}
                      >
                        Book Now
                      </button>
                    </>
                  ) : (
                    <p className="text-danger">Sold Out</p>
                  )}
                </div>
              </div>
            </div>
            ))}
        </div>

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
     </div>
   );
 }; 





