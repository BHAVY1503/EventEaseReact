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
        { stateId, cityId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className='container mt-5' style={{marginTop:""}}>
      <h2 className='text-center'>Events Grouped by Organizer</h2>
      <p className='text-center mb-4 text-muted'>This data is visible to admins</p>

      {loading ? (
        <div className='text-center'>
          <h5>Loading grouped events...</h5>
        </div>
      ) : groupedEvents.length === 0 ? (
        <div className='text-center'>
          <h6>No events found.</h6>
        </div>
      ) : (
        <div className="accordion alert alert-primary" id="organizerAccordion">
          {groupedEvents.map((group, index) => (
            <div className="accordion-item mb-3" key={index}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded="false"
                  aria-controls={`collapse${index}`}
                >
                  Organizer: {group.organizerName} ({group.organizerEmail})
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${index}`}
                data-bs-parent="#organizerAccordion"
              >
                <div className="accordion-body bg-light">
                  <div className="row">
                    {group.events.map((event) => {
                      const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
                      const booked = bookedTickets[event._id];
                      const eventEnded = new Date(event.endDate) < new Date();

                      return (
                        <div className="col-md-4 mb-4" key={event._id}>
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
                                ) : event.latitude && event.longitude && (
                                  <>
                                    <strong>Location:</strong>{" "}
                                    <a
                                      className="btn btn-sm btn-outline-primary"
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View Directions
                                    </a><br />
                                  </>
                                )}
                                <strong>Available Seats:</strong> {availableSeats}<br />
                                {eventEnded && (
                                  <span className="badge bg-success mt-2">Event Ended</span>
                                )}
                              </p>

                              {!eventEnded && (
                                <>
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
                                </>
                              )}

                              {booked && (
                                <div className="mt-2 alert alert-success p-2">
                                  <strong>Ticket Booked:</strong><br />
                                  Qty: {booked.quantity}<br />
                                  ID: {booked._id}
                                </div>
                              )}
                            </div>
                            <div className="card-footer text-center">
                              <Link to={`/updateevent/${event._id}`} className="btn btn-primary btn-sm me-2">
                                Update
                              </Link>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(event._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



