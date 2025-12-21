import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Mail,
  User,
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Package,
} from "lucide-react";

export const AllEventBookings = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEventType, setFilterEventType] = useState("all");
  const [expandedEvent, setExpandedEvent] = useState(null);
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

  // Group tickets by event
  const groupedByEvent = tickets.reduce((acc, ticket) => {
    const event = ticket.eventId;
    if (!event) return acc;
    const eventId = event._id;
    if (!acc[eventId]) acc[eventId] = { event, tickets: [] };
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {});

  // Filter grouped events
  const filteredEvents = Object.values(groupedByEvent).filter(({ event, tickets }) => {
    if (!event) return false;
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tickets.some(t => t.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterEventType === "all" || event.eventType === filterEventType;
    return matchesSearch && matchesType;
  });

  // Calculate statistics
  const totalBookings = tickets.length;
  const totalRevenue = tickets.reduce((sum, ticket) => {
    const price = ticket.eventId?.ticketRate || 0;
    return sum + (price * ticket.quantity);
  }, 0);
  const uniqueEvents = Object.keys(groupedByEvent).length;

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const exportToCSV = () => {
    const headers = ["Event Name", "Event Type", "Booked By", "Email", "Quantity", "City", "State"];
    const rows = tickets.map(ticket => [
      ticket.eventId?.eventName || "N/A",
      ticket.eventId?.eventType || "N/A",
      ticket.userId?.fullName || "N/A",
      ticket.userId?.email || "N/A",
      ticket.quantity,
      ticket.cityId?.name || "N/A",
      ticket.stateId?.Name || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!tickets.length && !loading) {
    return (
      <div className="mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-800 min-h-screen">
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            There are no event bookings to display at the moment.
          </p>
          <Link to="/admin">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            All Event Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all event bookings across the platform
          </p>
        </div>
         <div className="flex gap-2 justify-end">
          <Button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link to="/admin">
            <Button variant="outline" className="border-gray-300 dark:border-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {uniqueEvents}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="bg-white  border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
              Filter & Search
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by event name or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-black dark:text-gray-50 border-gray-300 dark:border-gray-300"
              />
            </div>
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger className=" border-gray-300 dark:border-gray-300">
                <SelectValue placeholder="Filter by event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Exhibition">Exhibition</SelectItem>
                <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
                <SelectItem value="Incentive">Incentive</SelectItem>
                <SelectItem value="Music concert">Music Concert</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="ZoomMeeting">Zoom Meeting</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(({ event, tickets }) => {
            if (!event) return null;
            const isExpanded = expandedEvent === event._id;
            const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);
            const eventRevenue = tickets.reduce((sum, t) => {
              const price = event.ticketRate || 0;
              return sum + (price * t.quantity);
            }, 0);

            return (
              <Card
                key={event._id}
                className="bg-white dark:bg-gray-100 border-gray-200 dark:border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(event._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {event.eventName}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-100 dark:text-blue-700">
                          {event.eventType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-600">
                          <Ticket className="w-4 h-4 text-purple-500" />
                          <span>{tickets.length} Bookings ({totalTickets} tickets)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-600">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-gray-900">
                            ₹{eventRevenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Bookings List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-200 bg-gray-50 dark:bg-gray-50">
                    <div className="p-6 space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-900 mb-4">
                        Booking Details ({tickets.length})
                      </h4>
                      <div className="space-y-3">
                        {tickets.map((ticket) => (
                          <Card
                            key={ticket._id}
                            className="bg-white border-gray-200 dark:border-gray-700"
                          >
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                    Customer Name
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-500" />
                                    <p className="font-medium text-gray-900 dark:text-gray-900">
                                      {ticket.userId?.fullName || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                    Email Address
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-purple-500" />
                                    <p className="text-sm text-gray-900 dark:text-gray-900">
                                      {ticket.userId?.email || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                    Quantity
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-orange-500" />
                                    <p className="font-semibold text-gray-900 dark:text-gray-900">
                                      {ticket.quantity} Ticket{ticket.quantity > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                    Location
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-500" />
                                    <p className="text-sm text-gray-900 dark:text-gray-900">
                                      {ticket.cityId?.name || "N/A"}, {ticket.stateId?.Name || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
       
    </div>
  );
};



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// export const AllEventBookings = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get("/tickets/alltickets", {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         setTickets(res.data.data);
//       } catch (err) {
//         console.error("Error fetching tickets:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) fetchTickets();
//   }, [token]);

//   if (loading) {
//     return <div className="text-center mt-4"><h4>Loading all bookings...</h4></div>;
//   }

//   if (!tickets.length && !loading) {
//     return <div className="text-center mt-4"><h5>No bookings found.</h5></div>;
//   }

//   // Group tickets by event
//   const groupedByEvent = tickets.reduce((acc, ticket) => {
//     const event = ticket.eventId;
//     if (!event) return acc; // skip if event is null
//     const eventId = event._id;
//     if (!acc[eventId]) acc[eventId] = { event, tickets: [] };
//     acc[eventId].tickets.push(ticket);
//     return acc;
//   }, {});

//   return (
//     // <div className="container mt-5 alert alert-primary">
//     <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">

//       <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">All Event Bookings (Admin View)</h2>
//       {Object.values(groupedByEvent).map(({ event, tickets }) => {
//         if (!event) return null; // skip if event is null
//         return (
//           <div key={event._id} className="card my-4">
//             <div className="card-header bg-primary text-white">
//               <h5>{event.eventName} ({event.eventType})</h5>
//               <small>Start: {new Date(event.startDate).toLocaleDateString()}</small><br />
//               <small>End: {new Date(event.endDate).toLocaleDateString()}</small>
//             </div>
//             <div className="card-body">
//               {tickets.map((ticket) => (
//                 <div key={ticket._id} className="mb-3 border-bottom pb-2">
//                   <p>
//                     <strong>Booked By:</strong> {ticket.userId?.fullName || "N/A"} <br />
//                     <strong>Email:</strong> {ticket.userId?.email || "N/A"} <br />
//                     <strong>Quantity:</strong> {ticket.quantity} <br />
//                     <strong>City:</strong> {ticket.cityId?.name || "N/A"}, <strong>State:</strong> {ticket.stateId?.Name || "N/A"}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//       <div className="text-center mt-3">
//         <a href='/admin' className='btn btn-outline-dark dark:bg-white'>Back to Admin Home</a>
//       </div>
//     </div>
//   );
// };

