import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "../../hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import RazorpayButton from "../common/RazoryPayButton";

export const SeatSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ Add this
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

  // ✅ Updated with redirect
  const handleFinalBooking = async () => {
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
      
      alert("🎉 Booking success!");
      setSelectedSeats([]);
      setBookedSeatLabels((prev) => [...prev, ...selectedSeats]);
      
      // ✅ Redirect after successful booking (choose one):
      
      // Option 1: Back to events list
      setTimeout(() => navigate('/mytickets'), 1500);
      
      // Option 2: To a confirmation page (if you have one)
      // setTimeout(() => navigate('/booking-confirmation', { 
      //   state: { bookingId: res.data.bookingId, eventName: event.eventName } 
      // }), 1500);
      
      // Option 3: To user's bookings page
      // setTimeout(() => navigate('/my-bookings'), 1500);
      
    } catch (err) {
      console.error("Booking error", err.response?.data || err.message);
      alert("❌ Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!selectedSeats.length) return 0;

    if (event.eventCategory === "Indoor" && event.customZones) {
      let total = 0;
      for (const zone of event.customZones) {
        const seatsInZone = zone.seatLabels.filter((seat) =>
          selectedSeats.includes(seat)
        );
        total += seatsInZone.length * zone.price;
      }
      return total;
    } else {
      return selectedSeats.length * (event.ticketRate || 0);
    }
  };

  const totalAmount = calculateTotalAmount();

  if (!event) return <p className="text-center mt-5">Loading event...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{event.eventName}</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mr-2">
              {event.eventCategory}
            </Badge>
            Select your preferred seats
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seating Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {event?.customZones?.map((zone, index) => (
                  <AccordionItem key={index} value={`zone-${index}`}>
                    <AccordionTrigger className="px-4">
                      <div className="flex justify-between items-center w-full pr-4">
                        <span>{zone.zoneName || `Zone ${String.fromCharCode(65 + index)}`}</span>
                        <Badge variant="secondary">₹{zone.price}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[200px] p-4">
                        <div className="grid grid-cols-8 gap-2">
                          {zone.seatLabels.map((label, i) => {
                            const isBooked = bookedSeatLabels.includes(label);
                            const isSelected = selectedSeats.includes(label);

                            return (
                              <Badge
                                key={i}
                                variant={
                                  isBooked
                                    ? "destructive"
                                    : isSelected
                                    ? "success"
                                    : "outline"
                                }
                                className={`
                                  cursor-${isBooked ? "not-allowed" : "pointer"}
                                  h-10 w-10 flex items-center justify-center
                                  ${isBooked ? "opacity-60" : ""}
                                  hover:${isBooked ? "" : "scale-105"}
                                  transition-transform
                                `}
                                onClick={() => !isBooked && toggleSeat(label)}
                              >
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Seats</span>
                <Badge variant="secondary">{selectedSeats.length}</Badge>
              </div>
              {selectedSeats.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map((seat) => (
                    <Badge key={seat} variant="outline" className="cursor-pointer"
                      onClick={() => toggleSeat(seat)}>
                      {seat}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-bold">₹{totalAmount}</span>
              </div>
              
              <div className="pt-4">
                {selectedSeats.length > 0 && !booking && (
                  <RazorpayButton
                    eventId={event._id}
                    amount={totalAmount}
                    onPaymentSuccess={handleFinalBooking}
                  />
                )}

                {booking && (
                  <Button disabled className="w-full">
                    Processing...
                  </Button>
                )}
              </div>

              {/* ✅ Optional: Add a back button */}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/mytickets')}
              >
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { useToast } from "../../hooks/use-toast";
// // import { Icons } from "@/components/icons";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import RazorpayButton from "../common/RazoryPayButton"; // ✅ Adjust path as needed

// export const SeatSelectionPage = () => {
//   const { id } = useParams(); // event ID from URL
//   const [event, setEvent] = useState(null);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [bookedSeatLabels, setBookedSeatLabels] = useState([]);
//   const [booking, setBooking] = useState(false);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         const res = await axios.get(`/event/geteventbyid/${id}`);
//         setEvent(res.data.data);
//         setBookedSeatLabels(res.data.data.bookedSeatLabels || []);
//       } catch (err) {
//         console.error("Error loading event", err.response?.data || err.message);
//       }
//     };
//     fetchEvent();
//   }, [id]);

//   const toggleSeat = (label) => {
//     setSelectedSeats((prev) =>
//       prev.includes(label)
//         ? prev.filter((s) => s !== label)
//         : [...prev, label]
//     );
//   };

//   // ✅ Final booking called after successful payment
//   const handleFinalBooking = async () => {
//     setBooking(true);
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${id}`,
//         {
//           quantity: selectedSeats.length,
//           selectedSeats,
//           organizerId: event.organizerId,
//           stateId: event.stateId?._id || event.stateId,
//           cityId: event.cityId?._id || event.cityId,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       alert("🎉 Booking success!");
//       setSelectedSeats([]);
//       setBookedSeatLabels((prev) => [...prev, ...selectedSeats]);
//     } catch (err) {
//       console.error("Booking error", err.response?.data || err.message);
//       alert("❌ Booking failed.");
//     } finally {
//       setBooking(false);
//     }
//   };

//   // ✅ Calculates total amount accurately (zone-wise or fixed-rate)
//   const calculateTotalAmount = () => {
//     if (!selectedSeats.length) return 0;

//     if (event.eventCategory === "Indoor" && event.customZones) {
//       let total = 0;
//       for (const zone of event.customZones) {
//         const seatsInZone = zone.seatLabels.filter((seat) =>
//           selectedSeats.includes(seat)
//         );
//         total += seatsInZone.length * zone.price;
//       }
//       return total;
//     } else {
//       return selectedSeats.length * (event.ticketRate || 0);
//     }
//   };

//   const totalAmount = calculateTotalAmount();

//   if (!event) return <p className="text-center mt-5">Loading event...</p>;

//   if (!event) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Icons.spinner className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="text-2xl">{event.eventName}</CardTitle>
//           <CardDescription>
//             <Badge variant="secondary" className="mr-2">
//               {event.eventCategory}
//             </Badge>
//             Select your preferred seats
//           </CardDescription>
//         </CardHeader>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Seating Zones</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Accordion type="single" collapsible className="w-full">
//                 {event?.customZones?.map((zone, index) => (
//                   <AccordionItem key={index} value={`zone-${index}`}>
//                     <AccordionTrigger className="px-4">
//                       <div className="flex justify-between items-center w-full pr-4">
//                         <span>{zone.zoneName || `Zone ${String.fromCharCode(65 + index)}`}</span>
//                         <Badge variant="secondary">₹{zone.price}</Badge>
//                       </div>
//                     </AccordionTrigger>
//                     <AccordionContent>
//                       <ScrollArea className="h-[200px] p-4">
//                         <div className="grid grid-cols-8 gap-2">
//                           {zone.seatLabels.map((label, i) => {
//                             const isBooked = bookedSeatLabels.includes(label);
//                             const isSelected = selectedSeats.includes(label);

//                             return (
//                               <Badge
//                                 key={i}
//                                 variant={
//                                   isBooked
//                                     ? "destructive"
//                                     : isSelected
//                                     ? "success"
//                                     : "outline"
//                                 }
//                                 className={`
//                                   cursor-${isBooked ? "not-allowed" : "pointer"}
//                                   h-10 w-10 flex items-center justify-center
//                                   ${isBooked ? "opacity-60" : ""}
//                                   hover:${isBooked ? "" : "scale-105"}
//                                   transition-transform
//                                 `}
//                                 onClick={() => !isBooked && toggleSeat(label)}
//                               >
//                                 {label}
//                               </Badge>
//                             );
//                           })}
//                         </div>
//                       </ScrollArea>
//                     </AccordionContent>
//                   </AccordionItem>
//                 ))}
//               </Accordion>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="lg:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Booking Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Selected Seats</span>
//                 <Badge variant="secondary">{selectedSeats.length}</Badge>
//               </div>
//               {selectedSeats.length > 0 && (
//                 <div className="flex flex-wrap gap-1">
//                   {selectedSeats.map((seat) => (
//                     <Badge key={seat} variant="outline" className="cursor-pointer"
//                       onClick={() => toggleSeat(seat)}>
//                       {seat}
//                     </Badge>
//                   ))}
//                 </div>
//               )}
//               <div className="flex justify-between items-center pt-4 border-t">
//                 <span className="font-semibold">Total Amount</span>
//                 <span className="text-xl font-bold">₹{totalAmount}</span>
//               </div>
              
//               <div className="pt-4">
//                 {selectedSeats.length > 0 && !booking && (
//                   <RazorpayButton
//                     eventId={event._id}
//                     amount={totalAmount}
//                     onPaymentSuccess={handleFinalBooking}
//                   />
//                 )}

//                 {booking && (
//                   <Button disabled className="w-full">
//                     <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
//                     Processing...
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };



//without Razorpay
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export const SeatSelectionPage = () => {
//   const { id } = useParams(); // event ID from URL
//   const [event, setEvent] = useState(null);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [bookedSeatLabels, setBookedSeatLabels] = useState([]);
//   const [booking, setBooking] = useState(false);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         const res = await axios.get(`/event/geteventbyid/${id}`);
//         setEvent(res.data.data);
//         setBookedSeatLabels(res.data.data.bookedSeatLabels || []);
//       } catch (err) {
//         console.error("Error loading event", err.response?.data || err.message);
//       }
//     };
//     fetchEvent();
//   }, [id]);

//   const toggleSeat = (label) => {
//     setSelectedSeats((prev) =>
//       prev.includes(label)
//         ? prev.filter((s) => s !== label)
//         : [...prev, label]
//     );
//   };

//   const confirmBooking = async () => {
//     if (!selectedSeats.length) return;

//     const confirm = window.confirm(
//       `Are you sure you want to book ${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}?`
//     );
//     if (!confirm) return;

//     setBooking(true);
//     try {
//       const res = await axios.post(
//         `/event/bookseat/${id}`,
//         {
//           quantity: selectedSeats.length,
//           selectedSeats,
//           organizerId: event.organizerId,
//           stateId: event.stateId?._id || event.stateId,
//           cityId: event.cityId?._id || event.cityId,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       alert("Booking success!");
//       setSelectedSeats([]);
//       setBookedSeatLabels((prev) => [...prev, ...selectedSeats]);
//     } catch (err) {
//       console.error("Booking error", err.response?.data || err.message);
//       alert("Booking failed.");
//     } finally {
//       setBooking(false);
//     }
//   };

//   if (!event) return <p className="text-center mt-5">Loading event...</p>;

//   return (
//     <div className="container mt-4">
//       <h2>{event.eventName} - Seat Selection</h2>
//       <p><strong>Category:</strong> {event.eventCategory}</p>

//       <div className="accordion" id="zoneAccordion">
//         {event?.customZones?.map((zone, index) => (
//           <div className="accordion-item" key={index}>
//             <h2 className="accordion-header" id={`heading-${index}`}>
//               <button
//                 className="accordion-button collapsed"
//                 type="button"
//                 data-bs-toggle="collapse"
//                 data-bs-target={`#collapse-${index}`}
//                 aria-expanded="false"
//                 aria-controls={`collapse-${index}`}
//               >
//                 {zone.zoneName || `Zone ${String.fromCharCode(65 + index)}`} – ₹{zone.price}
//               </button>
//             </h2>
//             <div
//               id={`collapse-${index}`}
//               className="accordion-collapse collapse"
//               aria-labelledby={`heading-${index}`}
//               data-bs-parent="#zoneAccordion"
//             >
//               <div className="accordion-body">
//                 <div className="d-flex flex-wrap gap-2">
//                   {zone.seatLabels.map((label, i) => {
//                     const isBooked = bookedSeatLabels.includes(label);
//                     const isSelected = selectedSeats.includes(label);

//                     return (
//                       <span
//                         key={i}
//                         onClick={() => !isBooked && toggleSeat(label)}
//                         className={`badge ${
//                           isBooked
//                             ? "bg-danger"
//                             : isSelected
//                             ? "bg-success"
//                             : "bg-secondary"
//                         }`}
//                         style={{
//                           cursor: isBooked ? "not-allowed" : "pointer",
//                           padding: "10px",
//                           fontSize: "1rem",
//                           opacity: isBooked ? 0.6 : 1,
//                         }}
//                       >
//                         {label}
//                       </span>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="text-center">
//         <button
//           className="btn btn-success mt-4"
//           disabled={selectedSeats.length === 0 || booking}
//           onClick={confirmBooking}
//         >
//           {booking
//             ? "Booking..."
//             : `Confirm Booking (${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""})`}
//         </button>
//       </div>
//       {/* <link></link> */}
//     </div>
//   );
// };


