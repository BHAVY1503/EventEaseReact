import React, { useEffect, useState } from "react";
import axios from "axios";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, Users, Ticket, Edit, Trash2, CheckCircle2, ExternalLink, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";


export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const token = localStorage.getItem("token");

  const fetchAdminEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/event/adminevents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching admin events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeleteLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdminEvents();
    } catch (err) {
      alert("Failed to delete event");
    } finally {
      setDeleteLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="animate-spin w-12 h-12 mx-auto text-blue-600" />
        <p>Loading admin events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-center py-16 text-gray-500">No events created by Admin.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
    <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Events By Admin
              </h1>
            </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
         
      {events.map((event) => {
        const eventEnded = new Date(event.endDate) < new Date();
        const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);

        return (
          <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img src={event.eventImgUrl} alt={event.eventName} className="w-full h-48 object-cover" />
              {eventEnded && (
                <Badge className="absolute top-3 right-3 bg-green-600 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{event.eventName}</h3>
                <Badge variant="outline" className="mb-2">
                  {event.eventType}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.stateId?.Name}, {event.cityId?.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{availableSeats} seats available</span>
                </div>
              </div>

              {event.zoomUrl && (
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Zoom Meeting
                  </a>
                </Button>
              )}

              {event.latitude && event.longitude && !event.zoomUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View Directions
                  </a>
                </Button>
              )}
            </CardContent>

            <CardFooter className="p-4 bg-gray-50 flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={`/updateevent/${event._id}`}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </a>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => handleDelete(event._id)}
                disabled={deleteLoading[event._id]}
              >
                {deleteLoading[event._id] ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
    </div>
  );
};



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export const AdminEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");

//   const fetchAdminEvents = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get("/event/adminevents", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEvents(res.data.data);
//     } catch (err) {
//       console.error("Error fetching admin events:", err);
//       setEvents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAdminEvents();
//   }, []);

//   if (loading) {
//     return (
//       <div className="text-center py-16">
//         <Loader2 className="animate-spin w-12 h-12 mx-auto text-blue-600" />
//         <p>Loading admin events...</p>
//       </div>
//     );
//   }

//   if (events.length === 0) {
//     return <p className="text-center py-16 text-gray-500">No events created by Admin.</p>;
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
//       {events.map((event) => (
//         <Card key={event._id} className="hover:shadow-lg transition-shadow">
//           <CardHeader>
//             <CardTitle>{event.eventName}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p>Organizer: {event.organizerId?.name}</p>
//             <p>
//               Location: {event.stateId?.Name}, {event.cityId?.name}
//             </p>
//             <p>Seats: {event.numberOfSeats}</p>
//             <p>Start: {new Date(event.startDate).toLocaleDateString()}</p>
//             <p>End: {new Date(event.endDate).toLocaleDateString()}</p>
//             <Button
//               className="mt-3 w-full"
//               onClick={() => window.open(`/updateevent/${event._id}`, "_blank")}
//             >
//               Edit Event
//             </Button>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// };
