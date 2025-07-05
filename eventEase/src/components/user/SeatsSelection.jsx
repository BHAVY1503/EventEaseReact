import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export const SeatSelectionPage = () => {
  const { id } = useParams(); // event ID from URL
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeatLabels, setBookedSeatLabels] = useState([]);
  const [booking, setBooking] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/event/geteventbyid/${id}`);
        setEvent(res.data.data);
        setBookedSeatLabels(res.data.data.bookedSeatLabels || []);
      } catch (err) {
        console.error("Error loading event", err.response?.data || err.message);
      }
    };
    fetchEvent();
  }, [id]);

  const toggleSeat = (label) => {
    setSelectedSeats((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : [...prev, label]
    );
  };

  const confirmBooking = async () => {
    if (!selectedSeats.length) return;

    const confirm = window.confirm(
      `Are you sure you want to book ${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}?`
    );
    if (!confirm) return;

    setBooking(true);
    try {
      const res = await axios.post(
        `/event/bookseat/${id}`,
        {
          quantity: selectedSeats.length,
          selectedSeats,
          organizerId: event.organizerId,
          stateId: event.stateId?._id || event.stateId,
          cityId: event.cityId?._id || event.cityId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Booking success!");
      setSelectedSeats([]);
      setBookedSeatLabels((prev) => [...prev, ...selectedSeats]);
    } catch (err) {
      console.error("Booking error", err.response?.data || err.message);
      alert("Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  if (!event) return <p className="text-center mt-5">Loading event...</p>;

  return (
    <div className="container mt-4">
      <h2>{event.eventName} - Seat Selection</h2>
      <p><strong>Category:</strong> {event.eventCategory}</p>

      <div className="accordion" id="zoneAccordion">
        {event?.customZones?.map((zone, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`heading-${index}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${index}`}
                aria-expanded="false"
                aria-controls={`collapse-${index}`}
              >
                {zone.zoneName || `Zone ${String.fromCharCode(65 + index)}`} – ₹{zone.price}
              </button>
            </h2>
            <div
              id={`collapse-${index}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${index}`}
              data-bs-parent="#zoneAccordion"
            >
              <div className="accordion-body">
                <div className="d-flex flex-wrap gap-2">
                  {zone.seatLabels.map((label, i) => {
                    const isBooked = bookedSeatLabels.includes(label);
                    const isSelected = selectedSeats.includes(label);

                    return (
                      <span
                        key={i}
                        onClick={() => !isBooked && toggleSeat(label)}
                        className={`badge ${
                          isBooked
                            ? "bg-danger"
                            : isSelected
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                        style={{
                          cursor: isBooked ? "not-allowed" : "pointer",
                          padding: "10px",
                          fontSize: "1rem",
                          opacity: isBooked ? 0.6 : 1,
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          className="btn btn-success mt-4"
          disabled={selectedSeats.length === 0 || booking}
          onClick={confirmBooking}
        >
          {booking
            ? "Booking..."
            : `Confirm Booking (${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""})`}
        </button>
      </div>
      {/* <link></link> */}
    </div>
  );
};


