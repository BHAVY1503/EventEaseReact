import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { 
  Loader2, 
  ChevronLeft, 
  Zap, 
  ShoppingCart, 
  ChevronDown,
  X,
  Ticket,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import RazorpayButton from "../common/RazoryPayButton";
import "@/styles/components/SeatsSelection.css";

const SeatsSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeatLabels, setBookedSeatLabels] = useState([]);
  const [expandedZone, setExpandedZone] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/event/geteventbyid/${id}`);
        const ev = res.data?.data ?? res.data;
        setEvent(ev);
        setBookedSeatLabels(ev?.bookedSeatLabels || []);
        if (ev?.customZones?.length > 0) {
          setExpandedZone(0);
        }
      } catch (err) {
        console.error("Error loading event", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const toggleSeat = (label) => {
    setSelectedSeats((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : prev.length < 10 ? [...prev, label] : prev
    );
  };

  const calculateTotalAmount = () => {
    if (!selectedSeats.length || !event) return 0;
    if (event.eventCategory === "Indoor" && event.customZones) {
      let total = 0;
      for (const zone of event.customZones) {
        const seatsInZone = zone.seatLabels.filter((seat) => selectedSeats.includes(seat));
        total += seatsInZone.length * zone.price;
      }
      return total;
    }
    return selectedSeats.length * (event.ticketRate || 0);
  };

  const handleFinalBooking = async () => {
    setBooking(true);
    try {
      const payload = {
        quantity: selectedSeats.length,
        selectedSeats,
        organizerId: event.organizerId,
        stateId: event.stateId?._id || event.stateId,
        cityId: event.cityId?._id || event.cityId,
      };
      const res = await api.post(`/event/bookseat/${id}`, payload);
      alert(res.data?.message || "Booking success! 🎉");
      setSelectedSeats([]);
      setBookedSeatLabels((prev) => [...prev, ...selectedSeats]);
      const userRole = localStorage.getItem("role");
      const targetPath = userRole === "Organizer" ? "/bookedtickets" : "/mytickets";
      setTimeout(() => navigate(targetPath), 1500);
    } catch (err) {
      console.error("Booking error", err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <Loader2 className="w-10 h-10 animate-spin text-[#E11D48]" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48]">Loading Arena Grid</p>
      </div>
    );
  }

  if (!event) return <p className="text-center mt-20">GRID LINK FAILURE: EVENT NOT DETECTED.</p>;

  const totalAmount = calculateTotalAmount();

  return (
    <div className="seats-selection-container">
      <div className="seats-selection-content">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="seats-header">
          <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-gray-500 hover:text-white transition-all w-fit">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Event</span>
          </button>
          <div className="seats-title-box">
            <p className="seats-subtitle">Arena Node Mapping</p>
            <h1>SELECT YOUR<br /><span>POSITION</span></h1>
          </div>
        </motion.div>

        <div className="seats-main-grid">
          <div className="stadium-arena-panel">
            <div className="arena-stage-visual" />
            <div className="stadium-grid-wrapper">
              {event?.customZones?.map((zone, idx) => (
                <div key={idx} className="zone-accordion-item">
                  <button className="zone-header-btn" onClick={() => setExpandedZone(expandedZone === idx ? null : idx)}>
                    <div className="zone-info-box">
                      <p className="zone-name-text">{zone.zoneName || `Zone ${String.fromCharCode(65 + idx)}`}</p>
                      <span className="zone-price-badge">₹{zone.price}</span>
                    </div>
                    <ChevronDown className={cn("transition-transform", expandedZone === idx && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {expandedZone === idx && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="seat-row-container">
                          <div className="flex flex-wrap gap-3">
                            {zone.seatLabels.map((label, i) => {
                              const isBooked = bookedSeatLabels.includes(label);
                              const isSelected = selectedSeats.includes(label);
                              return (
                                <div
                                  key={i}
                                  onClick={() => !isBooked && toggleSeat(label)}
                                  className={cn("seat-node", isSelected && "selected", isBooked && "booked")}
                                >
                                  {label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="seats-legend">
              <div className="legend-item"><div className="legend-dot available" /><span>Available</span></div>
              <div className="legend-item"><div className="legend-dot selected" /><span>Selected</span></div>
              <div className="legend-item"><div className="legend-dot booked" /><span>Allocated</span></div>
            </div>
          </div>

          <div className="checkout-panel-premium">
            <div className="summary-title-box"><h2>Selection Summary</h2></div>
            {selectedSeats.length === 0 ? (
              <div className="selection-empty-state"><ShoppingCart /><p>No nodes selected in current sector.</p></div>
            ) : (
              <div className="selected-seats-list">
                <AnimatePresence>
                  {selectedSeats.map((seat) => {
                    const seatZone = event.customZones.find(z => z.seatLabels.includes(seat));
                    return (
                      <motion.div key={seat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="selected-seat-item">
                        <div className="seat-item-info">
                          <span className="seat-item-label">{seat}</span>
                          <span className="seat-item-zone">{seatZone?.zoneName || "Zone"}</span>
                        </div>
                        <span className="seat-item-price">₹{seatZone?.price || event.ticketRate}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
            <div className="checkout-total-box">
              <div className="total-label-box"><p>TOTAL COMMITMENT</p><p>₹{totalAmount.toLocaleString()}</p></div>
              <Zap className="w-8 h-8 text-[#E11D48] opacity-20" />
            </div>
            <div className="pt-4">
              {selectedSeats.length > 0 && !booking && (
                <RazorpayButton
                  eventId={event._id}
                  amount={totalAmount}
                  quantity={selectedSeats.length}
                  selectedSeats={selectedSeats}
                  onPaymentSuccess={handleFinalBooking}
                />
              )}
              {booking && <Button disabled className="checkout-btn-premium">Processing...</Button>}
            </div>
            <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest text-center">Secured by Razorpay Encryption Standard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatsSelection;
