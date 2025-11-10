





import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  Ticket,
  User,
  Mail,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Badge as BadgeIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Minus,
  Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const GroupedByEvents = () => {
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [bookingLoading, setBookingLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRejectEventId, setCurrentRejectEventId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchGroupedEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/event/groupedeventsbyorganizer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupedEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching grouped events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGroupedEvents();
    else setLoading(false);
  }, []);

  const toggleGroup = (index) => {
    setExpandedGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const adjustQuantity = (eventId, change) => {
    setBookingQuantity(prev => {
      const currentQuantity = prev[eventId] || 1;
      return { ...prev, [eventId]: Math.max(1, currentQuantity + change) };
    });
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeleteLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await axios.delete(`/event/deleteevent/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGroupedEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    } finally {
      setDeleteLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    setBookingLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      const res = await axios.post(
        `/event/bookseat/${eventId}`,
        { stateId, cityId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Seat(s) booked successfully!");
      setBookedTickets(prev => ({ ...prev, [eventId]: res.data.data.ticket }));
      fetchGroupedEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
      console.error(err);
    } finally {
      setBookingLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleApprove = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await axios.put(`/event/approveevent/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGroupedEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to approve event");
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const openRejectDialog = (eventId) => {
    setCurrentRejectEventId(eventId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!currentRejectEventId) return;
    setActionLoading(prev => ({ ...prev, [currentRejectEventId]: true }));
    try {
      await axios.put(`/event/rejectevent/${currentRejectEventId}`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRejectDialogOpen(false);
      fetchGroupedEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to reject event");
    } finally {
      setActionLoading(prev => ({ ...prev, [currentRejectEventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-700">Loading grouped events...</h3>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Events Analytics
          </h1>
        </div>
      </div>

      {groupedEvents.length === 0 ? (
        <Card className="mx-auto max-w-md text-center p-8">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
          <p className="text-gray-500">There are currently no events to display.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedEvents.map((group, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Collapsible open={expandedGroups[index]} onOpenChange={() => toggleGroup(index)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                            {group.organizerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {group.organizerName}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <Mail className="w-4 h-4" />
                            <span>{group.organizerEmail}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="px-3 py-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {group.events.length} Events
                        </Badge>
                        {expandedGroups[index] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator />
                  <CardContent className="p-6 bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.events.map((event) => {
                        const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
                        const booked = bookedTickets[event._id];
                        const eventEnded = new Date(event.endDate) < new Date();
                        const currentQuantity = bookingQuantity[event._id] || 1;

                        return (
                          <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                              <img src={event.eventImgUrl} alt={event.eventName} className="w-full h-48 object-cover" />
                              {eventEnded && (
                                <Badge className="absolute top-3 right-3 bg-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-4 space-y-3">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{event.eventName}</h3>
                                <Badge variant="outline" className="mb-3">
                                  <BadgeIcon className="w-3 h-3 mr-1" /> {event.eventType}
                                </Badge>
                              </div>

                              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-100">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                </div>
                                 {event.eventCategory?.toLowerCase().trim() === "indoor" ? (
  <div className="flex items-center space-x-2">
    <MapPin className="w-4 h-4" />
    <span>
      {event.stadiumId?.location?.address ||
        event.stadiumId?.address ||
        "Location not available"}
    </span>
  </div>
) : (
  <div className="flex items-center space-x-2">
    <MapPin className="w-4 h-4" />
    <span>
      {event.cityId?.name || "City not available"},{" "}
      {event.stateId?.Name || event.stateId?.name || "State not available"}
    </span>
  </div>
)}


                                {/* <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{event.stateId?.Name}, {event.cityId?.name}</span>
                                  <span className="truncate">{event.stadiumId.location?.address}</span>
                                </div> */}
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>{availableSeats} seats available</span>
                                </div>
                              </div>

                              {/* Approval / Reject */}
                              {event.approvalStatus === "Pending" && (
                                <div className="flex space-x-2 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={actionLoading[event._id]}
                                    onClick={() => handleApprove(event._id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={actionLoading[event._id]}
                                    onClick={() => openRejectDialog(event._id)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {event.approvalStatus === "Approved" && (
                                <Badge className="bg-green-600 mt-3">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                </Badge>
                              )}

                              {event.approvalStatus === "Rejected" && (
                                <div className="space-y-1 mt-3">
                                  <Badge className="bg-red-600">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Rejected
                                  </Badge>
                                  {event.rejectionReason && (
                                    <p className="text-sm text-red-700 mt-1">
                                      Reason: {event.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              )}

                              
                            </CardContent>

                            <CardFooter className="p-4 bg-gray-50 flex space-x-2 dark:bg-gray-800">
                              <Button variant="outline" size="sm" className="flex-1" asChild>
                                <Link to={`/updateevent/${event._id}`}><Edit className="w-4 h-4 mr-1" />Edit</Link>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                disabled={deleteLoading[event._id]}
                                onClick={() => handleDelete(event._id)}
                              >
                                {deleteLoading[event._id] ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1  hover:bg-red-500" />}
                                Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Reason for rejection</label>
            <Input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason"
            />
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading[currentRejectEventId]}>
              {actionLoading[currentRejectEventId] ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};






















