import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const ViewMyEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});

  const organizerId = localStorage.getItem("organizerId"); //organizerid geted
  console.log("Organizer ID:", organizerId);

  const getAllEvents = async () => {
    if (!organizerId) {
      console.error("User ID not found in localStorage");
      setLoading(false);
      return;
    }

    try {                          
      const res = await axios.get(`/event/geteventbyorganizerid/${organizerId}`);
      setEvents(res.data.data); //store respone in event 
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/event/deleteevent/${eventId}`);
      getAllEvents(); // refresh
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete event");
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    try {
      const res = await axios.post(`/event/bookseat/${eventId}`, {
        userId,
        stateId,
        cityId,
        quantity,
      });
      alert("Seat(s) booked successfully!");
      // Store ticket info to show on UI
      setBookedTickets((prev) => ({
        ...prev,
        [eventId]: res.data.data.ticket,
      }));
      getAllEvents(); // update seat count
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error("Booking error:", err);
    }
  };

  return (
    <div className='container' style={{ marginTop: "70px" }}>
      <h1 className='text-center'>MY EVENTS!</h1>
      <p className='text-center mb-4'>Events added by you</p>

      <div className='container mt-4 p-4 shadow' style={{ backgroundColor: "#555" }}>
        {loading ? (
          <div className='text-center text-white'>
            <h4>Loading your events...</h4>
          </div>
        ) : events.length === 0 ? (
          <div className='text-center text-white'>
            <h5>No events found.</h5>
            <p>Click <Link to="/addevent">here</Link> to add your first event!</p>
          </div>
        ) : (
          <div className='row'>
            {events.map((event) => {
              const availableSeats = event.numberOfSeats - (event.bookedSeats || 0); //for each event calclulate available seats
              const booked = bookedTickets[event._id];  //and check it has been booked
              
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
                        <strong>Available Seats:</strong> {availableSeats}
                      </p>

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
                              [event._id]: parseInt(e.target.value), //parseInt to convert string in to integer
                            }))
                          }
                        />
                        <button
                          className="btn btn-success btn-sm w-100"
                          disabled={availableSeats <= 0}  //if not seats avalilable
                          onClick={() => handleBookSeat(event._id, event.stateId?._id, event.cityId?._id)}
                        >
                          Book Seat
                        </button>
                      </div>

                      {booked && (
                        <div className="mt-2 p-2 bg-light text-dark rounded">
                          <strong>Ticket Booked:</strong><br />
                          Qty: {booked.quantity}<br />
                          Ticket ID: {booked._id}<br/>
                          Ticket ID: {booked?.eventId}

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
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};


