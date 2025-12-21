import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  CalendarDays, 
  Mail, 
  MapPin, 
  Users, 
  IndianRupee, 
  ArrowLeft, 
  Ticket,
  Search,
  Filter,
  Download,
  TrendingUp,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingsOfMyEvents = () => {
  const [tickets, setTickets] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [dataView, setDataView] = useState('combined'); // 'combined', 'tickets', 'payments'

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both tickets and payment history
        const [ticketsRes, paymentsRes] = await Promise.all([
          axios.get("/tickets/organizer/self", {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error("Error fetching tickets:", err);
            return { data: { data: [] } };
          }),
          axios.get("/payments/payment_history", {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error("Error fetching payment history:", err);
            return { data: { data: [] } };
          })
        ]);

        setTickets(ticketsRes.data.data || []);
        setPaymentHistory(paymentsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Combine tickets and payments data
  const getCombinedData = () => {
    const eventMap = new Map();

    // Add ticket data
    tickets.forEach(ticket => {
      const eventId = ticket.eventId?._id;
      if (!eventId) return;

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          event: ticket.eventId,
          tickets: [],
          payments: []
        });
      }
      eventMap.get(eventId).tickets.push(ticket);
    });

    // Add payment data
    paymentHistory.forEach(payment => {
      const eventId = payment.eventId?._id;
      if (!eventId) return;

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          event: payment.eventId,
          tickets: [],
          payments: []
        });
      }
      eventMap.get(eventId).payments.push(payment);
    });

    return Array.from(eventMap.values());
  };

  const combinedData = getCombinedData();

  // Calculate statistics
  const stats = {
    totalBookings: tickets.length + paymentHistory.filter(p => p.status === 'captured').length,
    totalRevenue: [
      ...tickets.map(t => t.ticketRate * t.quantity),
      ...paymentHistory.filter(p => p.status === 'captured').map(p => p.amount / 100)
    ].reduce((sum, val) => sum + val, 0),
    totalEvents: combinedData.length,
    totalAttendees: tickets.reduce((sum, t) => sum + t.quantity, 0) + 
                    paymentHistory.filter(p => p.status === 'captured').reduce((sum, p) => sum + (p.quantity || 1), 0),
  };

  // Filter events
  const filteredData = combinedData.filter(({ event }) => {
    if (!event) return false;
    
    const matchesSearch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === 'all' || event._id === filterEvent;
    
    if (activeTab === 'upcoming') {
      return new Date(event.endDate) >= new Date() && matchesSearch && matchesEvent;
    } else if (activeTab === 'past') {
      return new Date(event.endDate) < new Date() && matchesSearch && matchesEvent;
    }
    return matchesSearch && matchesEvent;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading bookings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (combinedData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                No Bookings Yet
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Once people start booking your events, you'll see all the details here.
              </p>
            </div>
            
            <Link to="/organizer">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      captured: { color: 'bg-green-500', icon: CheckCircle2, text: 'Success' },
      failed: { color: 'bg-red-500', icon: XCircle, text: 'Failed' },
      pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pending' },
      refunded: { color: 'bg-gray-500', icon: XCircle, text: 'Refunded' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const EventBookingCard = ({ event, tickets, payments }) => {
    const ticketRevenue = tickets.reduce((sum, t) => sum + (t.ticketRate * t.quantity), 0);
    const paymentRevenue = payments.filter(p => p.status === 'captured').reduce((sum, p) => sum + (p.amount / 100), 0);
    const totalRevenue = ticketRevenue + paymentRevenue;
    
    const ticketAttendees = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const paymentAttendees = payments.filter(p => p.status === 'captured').reduce((sum, p) => sum + (p.quantity || 1), 0);
    const totalAttendees = ticketAttendees + paymentAttendees;
    
    const totalBookings = tickets.length + payments.length;
    const isPastEvent = new Date(event.endDate) < new Date();

    return (
      <Card className={`shadow-xl border-0 overflow-hidden transition-all hover:shadow-2xl ${
        isPastEvent ? 'opacity-75' : ''
      }`}>
        {/* Event Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">{event.eventName}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {event.eventType}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {event.eventCategory}
                </Badge>
                {isPastEvent && (
                  <Badge className="bg-green-500/20 text-white border-green-300/30">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-white/90 mb-1 justify-end">
                <CalendarDays className="w-4 h-4 mr-2" />
                <span className="text-sm">{new Date(event.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-white/90 justify-end">
                <CalendarDays className="w-4 h-4 mr-2" />
                <span className="text-sm">{new Date(event.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalBookings}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Attendees</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalAttendees}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <CardContent className="p-6">
          {/* Tickets Section */}
          {tickets.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                Confirmed Tickets ({tickets.length})
              </h4>
              
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket._id}>
                    <Card className="border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Customer Info */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <User className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium">Customer</span>
                              </div>
                              <p className="text-gray-900 dark:text-white font-semibold ml-6">
                                {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium">Email</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm ml-6 break-words">
                                {ticket.userId?.email || ticket.organizerId?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Booking Details */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <Ticket className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium">Quantity</span>
                              </div>
                              <div className="ml-6">
                                <Badge variant="outline" className="text-base px-3 py-1">
                                  {ticket.quantity} Ticket{ticket.quantity > 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <MapPin className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-medium">Location</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm ml-6">
                                {ticket.cityId?.name || "N/A"}, {ticket.stateId?.Name || "N/A"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Payment Info */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium">Total Amount</span>
                              </div>
                              <div className="ml-6">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  ₹{(ticket.ticketRate * ticket.quantity).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ₹{ticket.ticketRate} × {ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Selected Seats for Indoor Events */}
                        {event.eventCategory === "Indoor" && ticket.selectedSeats?.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                              <Ticket className="w-4 h-4 mr-2" />
                              Selected Seats:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {ticket.selectedSeats.map((seat, seatIndex) => (
                                <Badge key={seatIndex} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {index < tickets.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History Section */}
          {payments.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Payment Transactions ({payments.length})
              </h4>
              
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div key={payment._id}>
                    <Card className="border-2 border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Payment Info */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <User className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium">Customer</span>
                              </div>
                              <p className="text-gray-900 dark:text-white font-semibold ml-6">
                                {payment.userId?.fullName || payment.organizerId?.name || "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium">Email</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm ml-6 break-words">
                                {payment.userId?.email || payment.organizerId?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Transaction Details */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <Ticket className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium">Order ID</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs ml-6 font-mono">
                                {payment.orderId || "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <Calendar className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-medium">Date</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm ml-6">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Amount & Status */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium">Amount</span>
                              </div>
                              <div className="ml-6">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  ₹{((payment.amount || 0) / 100).toLocaleString()}
                                </p>
                                {payment.quantity && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {payment.quantity} ticket{payment.quantity > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                                <span className="text-sm font-medium">Status</span>
                              </div>
                              <div className="ml-0">
                                {getPaymentStatusBadge(payment.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {index < payments.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-black">
      
      <div className="container mx-auto px-4 py-16 max-w-7xl dark:bg-slate-900">
        <div className="flex gap-2 justify-end mb-6">
          <Link to="/organizer">
            <Button variant="outline" className="border-gray-300 dark:border-gray-700">
             <ArrowLeft className="w-4 h-4 mr-2" />
                Back
             </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Event Bookings & Payments
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage and track all bookings and payment transactions for your events
          </p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Total Events</p>
                  <p className="text-3xl font-bold">{stats.totalEvents}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Total Attendees</p>
                  <p className="text-3xl font-bold">{stats.totalAttendees}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Bookings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700"
                />
              </div>
              
              <Select value={filterEvent} onValueChange={setFilterEvent}>
                <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-400">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="all">All Events</SelectItem>
                  {combinedData.map(({ event }) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for All / Upcoming / Past */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-3 w-full dark:bg-gray-700">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Data View Switch */}
            <div className="flex items-center gap-4 mt-6">
              <Button
                variant={dataView === "combined" ? "default" : "outline"}
                onClick={() => setDataView("combined")}
              >
                Combined View
              </Button>
              <Button
                variant={dataView === "tickets" ? "default" : "outline"}
                onClick={() => setDataView("tickets")}
              >
                Tickets Only
              </Button>
              {/* <Button
                variant={dataView === "payments" ? "default" : "outline"}
                onClick={() => setDataView("payments")}
              >
                Payments Only
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Render Events */}
        <div className="grid grid-cols-1 gap-8">
          {filteredData.map(({ event, tickets, payments }) => {
            // Apply current view mode
            const filteredTickets =
              dataView === "tickets" ? tickets : dataView === "combined" ? tickets : [];
            const filteredPayments =
              dataView === "payments" ? payments : dataView === "combined" ? payments : [];

            return (
              <EventBookingCard
                key={event._id}
                event={event}
                tickets={filteredTickets}
                payments={filteredPayments}
              />
            );
          })}
        </div>
      </div>
    // </div>
  );
};





// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Separator } from '@/components/ui/separator';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from '@/components/ui/tabs';
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import { 
//   CalendarDays, 
//   Mail, 
//   MapPin, 
//   Users, 
//   IndianRupee, 
//   ArrowLeft, 
//   Ticket,
//   Search,
//   Filter,
//   Download,
//   TrendingUp,
//   Calendar,
//   User,
//   DollarSign
// } from 'lucide-react';
// import { Link } from 'react-router-dom';

// export const BookingsOfMyEvents = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterEvent, setFilterEvent] = useState('all');
//   const [activeTab, setActiveTab] = useState('all');

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get("/tickets/organizer/self", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setTickets(res.data.data);
//       } catch (err) {
//         console.error("Error fetching tickets:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchTickets();
//     }
//   }, [token]);

//   // Group tickets by event
//   const groupedByEvent = tickets.reduce((acc, ticket) => {
//     const eventId = ticket.eventId?._id;
//     if (!acc[eventId]) acc[eventId] = { event: ticket.eventId, tickets: [] };
//     acc[eventId].tickets.push(ticket);
//     return acc;
//   }, {});

//   // Calculate statistics
//   const stats = {
//     totalBookings: tickets.length,
//     totalRevenue: tickets.reduce((sum, t) => sum + (t.ticketRate * t.quantity), 0),
//     totalEvents: Object.keys(groupedByEvent).length,
//     totalAttendees: tickets.reduce((sum, t) => sum + t.quantity, 0),
//   };

//   // Filter tickets
//   const filteredGroups = Object.values(groupedByEvent).filter(({ event, tickets }) => {
//     const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesEvent = filterEvent === 'all' || event._id === filterEvent;
    
//     if (activeTab === 'upcoming') {
//       return new Date(event.endDate) >= new Date() && matchesSearch && matchesEvent;
//     } else if (activeTab === 'past') {
//       return new Date(event.endDate) < new Date() && matchesSearch && matchesEvent;
//     }
//     return matchesSearch && matchesEvent;
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900">
//         <div className="container mx-auto px-4 py-16">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-lg text-gray-600 dark:text-gray-300">Loading bookings...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!tickets.length) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900">
//         <div className="container mx-auto px-4 py-16">
//           <div className="text-center max-w-2xl mx-auto">
//             <div className="mb-8">
//               <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Ticket className="w-12 h-12 text-blue-600 dark:text-blue-400" />
//               </div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//                 No Bookings Yet
//               </h1>
//               <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
//                 Once people start booking your events, you'll see all the details here.
//               </p>
//             </div>
            
//             <Link to="/organizer">
//               <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back to Dashboard
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const EventBookingCard = ({ event, tickets }) => {
//     const eventRevenue = tickets.reduce((sum, t) => sum + (t.ticketRate * t.quantity), 0);
//     const totalAttendees = tickets.reduce((sum, t) => sum + t.quantity, 0);
//     const isPastEvent = new Date(event.endDate) < new Date();

//     return (
//       <Card className={`shadow-xl border-0 overflow-hidden transition-all hover:shadow-2xl ${
//         isPastEvent ? 'opacity-75' : ''
//       }`}>
//         {/* Event Header */}
//         <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div className="flex-1">
//               <CardTitle className="text-2xl font-bold mb-2">{event.eventName}</CardTitle>
//               <div className="flex flex-wrap gap-2">
//                 <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
//                   {event.eventType}
//                 </Badge>
//                 <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
//                   {event.eventCategory}
//                 </Badge>
//                 {isPastEvent && (
//                   <Badge className="bg-green-500/20 text-white border-green-300/30">
//                     Completed
//                   </Badge>
//                 )}
//               </div>
//             </div>
            
//             <div className="text-right">
//               <div className="flex items-center text-white/90 mb-1 justify-end">
//                 <CalendarDays className="w-4 h-4 mr-2" />
//                 <span className="text-sm">{new Date(event.startDate).toLocaleDateString()}</span>
//               </div>
//               <div className="flex items-center text-white/90 justify-end">
//                 <CalendarDays className="w-4 h-4 mr-2" />
//                 <span className="text-sm">{new Date(event.endDate).toLocaleDateString()}</span>
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         {/* Statistics Bar */}
//         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 px-6 py-4">
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
//                 <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//               </div>
//               <div>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">Total Bookings</p>
//                 <p className="text-lg font-bold text-gray-900 dark:text-white">{tickets.length}</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
//                 <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
//               </div>
//               <div>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">Attendees</p>
//                 <p className="text-lg font-bold text-gray-900 dark:text-white">{totalAttendees}</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-3 col-span-2 md:col-span-1">
//               <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
//                 <IndianRupee className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//               </div>
//               <div>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
//                 <p className="text-lg font-bold text-gray-900 dark:text-white">₹{eventRevenue.toLocaleString()}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bookings List */}
//         <CardContent className="p-6">
//           <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             Booking Details ({tickets.length})
//           </h4>
          
//           <div className="space-y-4">
//             {tickets.map((ticket, index) => (
//               <div key={ticket._id}>
//                 <Card className="border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
//                   <CardContent className="p-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {/* Customer Info */}
//                       <div className="space-y-3">
//                         <div>
//                           <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
//                             <User className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
//                             <span className="text-sm font-medium">Customer</span>
//                           </div>
//                           <p className="text-gray-900 dark:text-white font-semibold ml-6">
//                             {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"}
//                           </p>
//                         </div>
                        
//                         <div>
//                           <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
//                             <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
//                             <span className="text-sm font-medium">Email</span>
//                           </div>
//                           <p className="text-gray-600 dark:text-gray-400 text-sm ml-6 break-words">
//                             {ticket.userId?.email || ticket.organizerId?.email || "N/A"}
//                           </p>
//                         </div>
//                       </div>
                      
//                       {/* Booking Details */}
//                       <div className="space-y-3">
//                         <div>
//                           <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
//                             <Ticket className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
//                             <span className="text-sm font-medium">Quantity</span>
//                           </div>
//                           <div className="ml-6">
//                             <Badge variant="outline" className="text-base px-3 py-1">
//                               {ticket.quantity} Ticket{ticket.quantity > 1 ? "s" : ""}
//                             </Badge>
//                           </div>
//                         </div>
                        
//                         <div>
//                           <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
//                             <MapPin className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
//                             <span className="text-sm font-medium">Location</span>
//                           </div>
//                           <p className="text-gray-600 dark:text-gray-400 text-sm ml-6">
//                             {ticket.cityId?.name || "N/A"}, {ticket.stateId?.Name || "N/A"}
//                           </p>
//                         </div>
//                       </div>
                      
//                       {/* Payment Info */}
//                       <div className="space-y-3">
//                         <div>
//                           <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
//                             <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
//                             <span className="text-sm font-medium">Total Amount</span>
//                           </div>
//                           <div className="ml-6">
//                             <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                               ₹{(ticket.ticketRate * ticket.quantity).toLocaleString()}
//                             </p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                               ₹{ticket.ticketRate} × {ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Selected Seats for Indoor Events */}
//                     {event.eventCategory === "Indoor" && ticket.selectedSeats?.length > 0 && (
//                       <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//                         <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
//                           <Ticket className="w-4 h-4 mr-2" />
//                           Selected Seats:
//                         </h5>
//                         <div className="flex flex-wrap gap-2">
//                           {ticket.selectedSeats.map((seat, seatIndex) => (
//                             <Badge key={seatIndex} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
//                               {seat}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
                
//                 {index < tickets.length - 1 && <Separator className="my-4" />}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-black">
//       <div className="container mx-auto px-4 py-16 max-w-7xl dark:bg-slate-900">
//         {/* Header */}
//         <div className="text-center mb-12 ">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//             Event Bookings
//           </h1>
//           <p className="text-lg text-gray-600 dark:text-gray-400">
//             Manage and track all bookings for your events
//           </p>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-blue-100 text-sm mb-1">Total Bookings</p>
//                   <p className="text-3xl font-bold">{stats.totalBookings}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Ticket className="w-6 h-6" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-green-100 text-sm mb-1">Total Revenue</p>
//                   <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-purple-100 text-sm mb-1">Total Events</p>
//                   <p className="text-3xl font-bold">{stats.totalEvents}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Calendar className="w-6 h-6" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-orange-100 text-sm mb-1">Total Attendees</p>
//                   <p className="text-3xl font-bold">{stats.totalAttendees}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Users className="w-6 h-6" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters */}
//         <Card className="mb-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-gray-800/70">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Bookings</h3>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search by event name..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 bg-white dark:bg-gray-700"
//                 />
//               </div>
              
//               <Select value={filterEvent} onValueChange={setFilterEvent}>
//                 <SelectTrigger className="bg-white dark:bg-gray-700">
//                   <SelectValue placeholder="Filter by event" />
//                 </SelectTrigger>
//                 <SelectContent className="dark:bg-gray-800">
//                   <SelectItem value="all">All Events</SelectItem>
//                   {Object.values(groupedByEvent).map(({ event }) => (
//                     <SelectItem key={event._id} value={event._id}>
//                       {event.eventName}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
//           <TabsList className="grid w-full md:w-auto grid-cols-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
//             <TabsTrigger value="all">All Events ({Object.keys(groupedByEvent).length})</TabsTrigger>
//             <TabsTrigger value="upcoming">
//               Upcoming ({Object.values(groupedByEvent).filter(({event}) => new Date(event.endDate) >= new Date()).length})
//             </TabsTrigger>
//             <TabsTrigger value="past">
//               Past ({Object.values(groupedByEvent).filter(({event}) => new Date(event.endDate) < new Date()).length})
//             </TabsTrigger>
//           </TabsList>
//         </Tabs>

//         {/* Event Bookings Carousel */}
//         {filteredGroups.length > 0 ? (
//           <Carousel opts={{ align: "start", loop: false }} className="w-full">
//             <CarouselContent className="-ml-4">
//               {filteredGroups.map(({ event, tickets }) => (
//                 <CarouselItem key={event._id} className="pl-4 basis-full">
//                   <EventBookingCard event={event} tickets={tickets} />
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//             {filteredGroups.length > 1 && (
//               <>
//                 <CarouselPrevious className="hidden md:flex" />
//                 <CarouselNext className="hidden md:flex" />
//               </>
//             )}
//           </Carousel>
//         ) : (
//           <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
//             <CardContent className="p-12 text-center">
//               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Search className="w-8 h-8 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h3>
//               <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
//             </CardContent>
//           </Card>
//         )}

//         {/* Back Button */}
//         <div className="text-center mt-12">
//           <Link to="/organizer">
//             <Button size="lg" variant="outline" className="px-8 shadow-lg">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Dashboard
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Separator } from '@/components/ui/separator';
// import { CalendarDays, Mail, MapPin, Users, IndianRupee, ArrowLeft, Ticket } from 'lucide-react';
// import { Link } from 'react-router-dom';

// export const BookingsOfMyEvents = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Note: In production, use React state instead of localStorage
//   const token = localStorage.getItem("token"); // Replace with actual token from state

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const res = await axios.get("/tickets/organizer/self", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setTickets(res.data.data);
//       } catch (err) {
//         console.error("Error fetching tickets:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchTickets();
//     }
//   }, [token]);

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-lg text-gray-600">Loading bookings...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!tickets.length) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8 ">Bookings of My Events</h1>
//           <Alert className="max-w-md mx-auto">
//             <Ticket className="h-4 w-4" />
//             <AlertDescription className="text-lg ">
//               No bookings yet for your events.
//             </AlertDescription>
//           </Alert>
//           <Button href="" variant="outline" className="mt-6">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Home
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Group tickets by event
//   const groupedByEvent = tickets.reduce((acc, ticket) => {
//     const eventId = ticket.eventId?._id;
//     if (!acc[eventId]) acc[eventId] = { event: ticket.eventId, tickets: [] };
//     acc[eventId].tickets.push(ticket);
//     return acc;
//   }, {});

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-6xl">
//       <div className="text-center mb-8">
//         <h1 className="text-4xl font-bold text-gray-900 mb-2 dark:text-gray-50">Bookings of My Events</h1>
//         <p className="text-gray-600 dark:text-gray-400">Manage and view all bookings for your events</p>
//       </div>
      
//       <div className="space-y-6">
//         {Object.values(groupedByEvent).map(({ event, tickets }) => (
//           <Card key={event._id} className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark-to-gray-900 border-gray-300">
//             <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
//               <CardTitle className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-xl font-semibold">{event.eventName}</h3>
//                   <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
//                     {event.eventType}
//                   </Badge>
//                 </div>
//                 <div className="text-right text-sm">
//                   <div className="flex items-center text-white/90 mb-1">
//                     <CalendarDays className="w-4 h-4 mr-1" />
//                     Start: {new Date(event.startDate).toLocaleDateString()}
//                   </div>
//                   <div className="flex items-center text-white/90">
//                     <CalendarDays className="w-4 h-4 mr-1" />
//                     End: {new Date(event.endDate).toLocaleDateString()}
//                   </div>
//                 </div>
//               </CardTitle>
//             </CardHeader>
            
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 {tickets.map((ticket, index) => (
//                   <div key={ticket._id}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-white shadow-sm border">
//                       <div className="space-y-2">
//                         <div className="flex items-center text-gray-700">
//                           <Users className="w-4 h-4 mr-2 text-blue-600" />
//                           <span className="font-medium">Booked By:</span>
//                         </div>
//                         <p className="text-gray-900 font-semibold ml-6">
//                           {ticket.userId?.fullName || ticket.organizerId?.name || "N/A"}
//                         </p>
                        
//                         <div className="flex items-center text-gray-700 mt-2">
//                           <Mail className="w-4 h-4 mr-2 text-blue-600" />
//                           <span className="font-medium">Email:</span>
//                         </div>
//                         <p className="text-gray-600 ml-6 break-words">
//                           {ticket.userId?.email || ticket.organizerId?.email || "N/A"}
//                         </p>
//                       </div>
                      
//                       <div className="space-y-2">
//                         <div className="flex items-center text-gray-700 ">
//                           <Ticket className="w-4 h-4 mr-2 text-green-600" />
//                           <span className="font-medium">Quantity:</span>
//                           <Badge variant="outline" className="ml-2 text-gray-700">{ticket.quantity}</Badge>
//                         </div>
                        
//                         <div className="flex items-center text-gray-700 mt-2">
//                           <MapPin className="w-4 h-4 mr-2 text-red-600" />
//                           <span className="font-medium">Location:</span>
//                         </div>
//                         <p className="text-gray-600 ml-6">
//                           {ticket.cityId?.name || "N/A"}, {ticket.stateId?.Name || "N/A"}
//                         </p>
//                       </div>
                      
//                       <div className="space-y-2">
//                         <div className="flex items-center text-gray-700">
//                           <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
//                           <span className="font-medium">Booked at:</span>
//                         </div>
//                         <div className="ml-6">
//                           <p className="text-lg font-bold text-green-700">
//                             ₹{ticket.ticketRate}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             ({ticket.quantity} seat{ticket.quantity > 1 ? "s" : ""})
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {event.eventCategory === "Indoor" && ticket.selectedSeats?.length > 0 && (
//                       <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                         <h4 className="font-semibold text-gray-800 mb-2">Selected Seats:</h4>
//                         <div className="flex flex-wrap gap-2">
//                           {ticket.selectedSeats.map((seat, seatIndex) => (
//                             <Badge key={seatIndex} variant="default" className="bg-blue-600 hover:bg-blue-700">
//                               {seat}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     )}
                    
//                     {index < tickets.length - 1 && <Separator className="my-4" />}
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="text-center mt-8">
//         <Link to="/organizer">
//         <Button href="/" variant="outline" size="lg" className="px-8">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Home
//         </Button>
//         </Link>
//       </div>
//     </div>
//   );
// };




