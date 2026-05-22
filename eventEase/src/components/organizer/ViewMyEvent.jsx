import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyEvents, deleteEvent } from '../../features/events/eventsSlice';
import { useToast } from '../../hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  Ticket,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Zap,
  LayoutGrid,
  History,
  ShieldCheck,
  Globe,
  Settings,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import '../../styles/components/ViewMyEvent.css';

export const ViewMyEvent = () => {
  const dispatch = useAppDispatch();
  const { list: events, status, error } = useAppSelector((s) => s.events);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookingQuantity, setBookingQuantity] = useState({});
  const [bookedTickets, setBookedTickets] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(fetchMyEvents());
  }, [dispatch]);

  const handleDelete = async (eventId) => {
    try {
      await dispatch(deleteEvent(eventId)).unwrap();
      toast({ title: 'Event Terminated', description: 'Operational node removed successfully', status: 'success' });
    } catch (err) {
      console.error('Error deleting event', err);
      toast({ title: 'Termination Failed', description: err || 'Failed to remove node', status: 'error' });
    }
  };

  const handleBookSeat = async (eventId, stateId, cityId) => {
    const quantity = bookingQuantity[eventId] || 1;
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast({ title: 'Auth Required', description: 'Please login to synchronize bookings', status: 'error' });
      navigate('/signin');
      return;
    }

    try {
      const res = await axios.post(
        `/event/bookseat/${eventId}`,
        { stateId, cityId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({ title: 'Synchronized', description: res.data?.message || "Seats locked successfully", status: 'success' });
      setBookedTickets((prev) => ({ ...prev, [eventId]: res.data.data.ticket }));
      
      setTimeout(() => {
        navigate('/organizer/bookedtickets');
        dispatch(fetchMyEvents());
      }, 1500);
    } catch (err) {
      toast({ title: 'Protocol Error', description: err?.response?.data?.message || "Booking failed", status: 'error' });
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) return 'completed';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'upcoming';
  };

  const approvedEvents = events.filter(e => e.approvalStatus === 'Approved');
  const pendingEvents = events.filter(e => e.approvalStatus === 'Pending');
  const rejectedEvents = events.filter(e => e.approvalStatus === 'Rejected');

  const getDisplayEvents = () => {
    switch(activeTab) {
      case 'approved': return approvedEvents;
      case 'pending': return pendingEvents;
      case 'rejected': return rejectedEvents;
      default: return events;
    }
  };

  const categorizeEventsByTime = (eventList) => {
    const completed = [];
    const active = []; // ongoing + upcoming

    eventList.forEach(event => {
      const status = getEventStatus(event);
      if (status === 'completed') completed.push(event);
      else active.push(event);
    });

    return { completed, active };
  };

  const LoadingSkeleton = () => (
    <div className="event-grid">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-white/5 border-white/5 rounded-[2.5rem] overflow-hidden">
          <Skeleton className="h-48 w-full bg-white/5" />
          <div className="p-8 space-y-4">
             <Skeleton className="h-6 w-3/4 bg-white/5" />
             <Skeleton className="h-4 w-full bg-white/5" />
             <Skeleton className="h-4 w-2/3 bg-white/5" />
          </div>
        </Card>
      ))}
    </div>
  );

  const EventCard = ({ event, dimmed = false }) => {
    const availableSeats = event.numberOfSeats - (event.bookedSeats || 0);
    const booked = bookedTickets[event._id];
    const eventStatus = getEventStatus(event);
    const isRejected = event.approvalStatus === 'Rejected';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className={cn(
          "event-card",
          dimmed && "dimmed"
        )}>
          {/* Status Badge */}
          <div className="status-badge-container">
             {eventStatus === 'completed' ? (
               <Badge className="status-badge terminated">
                  TERMINATED
               </Badge>
             ) : eventStatus === 'ongoing' ? (
               <Badge className="status-badge live">
                  LIVE
               </Badge>
             ) : (
               <div className="flex flex-col gap-1.5 items-end">
                  {event.approvalStatus === "Pending" && (
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                       PENDING
                    </Badge>
                  )}
                  {event.approvalStatus === "Approved" && (
                    <Badge className="bg-[#E11D48]/20 text-[#E11D48] border-[#E11D48]/20 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                       AUTHORIZED
                    </Badge>
                  )}
                  {event.approvalStatus === "Rejected" && (
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/20 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                       DENIED
                    </Badge>
                  )}
               </div>
             )}
          </div>

          <div className="event-card-media">
            <img
              src={event.eventImgUrl}
              alt={event.eventName}
              className="event-card-img"
            />
            <div className="event-card-overlay" />
            
            <div className="absolute bottom-4 left-6 flex flex-col gap-1">
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48] mb-0.5">{event.eventCategory}</span>
               <h3 className="text-lg font-black uppercase tracking-tighter text-white leading-none">{event.eventName}</h3>
            </div>
          </div>

          <CardContent className="p-6 flex-grow space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Timeline</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-300">
                     <Calendar className="w-3 h-3 text-[#E11D48]" />
                     {new Date(event.startDate).toLocaleDateString()}
                  </div>
               </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Capacity</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-300">
                     <Users className="w-3 h-3 text-blue-500" />
                     {availableSeats} REMAINING
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
               <MapPin className="w-3.5 h-3.5 text-[#E11D48] flex-shrink-0" />
               <span className="uppercase tracking-widest truncate">
                  {event.eventCategory === "Indoor" 
                    ? event.stadiumId?.location?.address || "Venure Pending"
                    : `${event.stateId?.Name}, ${event.cityId?.name}`}
               </span>
            </div>

            {isRejected && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                 <p className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-1">Logs</p>
                 <p className="text-[9px] text-gray-400 font-bold leading-tight">{event.rejectionReason || "No details."}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0 flex gap-2 mt-auto">
            <Button 
              variant="outline" 
              className="flex-1 h-10 bg-white/5 border-white/5 text-white font-black uppercase tracking-widest text-[8px] rounded-lg hover:bg-white/10 transition-all"
              onClick={() => navigate(`/organizer/updateevent/${event._id}`)}
            >
              <Edit className="w-3 h-3 mr-2" /> EDIT
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all p-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black border border-white/5 rounded-[2rem] p-10 backdrop-blur-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter text-white mb-4">Confirm Termination</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 font-bold uppercase tracking-widest text-xs leading-relaxed">
                    This action will permanently remove <span className="text-[#E11D48]">"{event.eventName}"</span> from the production infrastructure. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 gap-4">
                  <AlertDialogCancel className="h-14 px-8 bg-white/5 border-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Abort</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(event._id)}
                    className="h-14 px-8 bg-[#E11D48] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-600 transition-all"
                  >
                    Confirm Termination
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  const displayEvents = getDisplayEvents();
  const { completed, active } = categorizeEventsByTime(displayEvents);

  return (
    <div className="archive-container">
      {/* Page Header */}
      <div className="archive-header">
         <div>
            <div className="archive-version-badge">
               <Sparkles className="h-4 w-4 text-[#E11D48]" />
               <span className="archive-version-text">Archival Manifest v2.4</span>
            </div>
            <h1 className="archive-title">
               MY <span>ARCHIVE</span>
            </h1>
         </div>
         <div className="archive-tabs">
            {[
              { id: 'all', label: 'ALL NODES', icon: LayoutGrid },
              { id: 'approved', label: 'AUTHORIZED', icon: ShieldCheck },
              { id: 'pending', label: 'SYNCING', icon: Clock },
              { id: 'rejected', label: 'DENIED', icon: XCircle },
            ].map(tab => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "archive-tab-btn",
                  activeTab === tab.id && "active"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5 mr-2", activeTab === tab.id ? "text-white" : "text-gray-600")} />
                {tab.label}
              </Button>
            ))}
         </div>
      </div>

      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : displayEvents.length === 0 ? (
        <div className="empty-state">
           <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10 group">
              <Globe className="w-12 h-12 text-gray-700 group-hover:text-[#E11D48] transition-colors duration-500" />
           </div>
           <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">No Nodes Detected</h3>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10">Initialize your first production to start tracking.</p>
           <Button 
             className="h-16 px-12 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl"
             onClick={() => navigate("/organizer/addevent")}
           >
              INITIALIZE PRODUCTION
           </Button>
        </div>
      ) : (
        <div className="space-y-24">
          {/* Active Production Section */}
          {active.length > 0 && (
            <div className="space-y-10">
               <div className="flex items-center gap-6">
                  <div className="w-1.5 h-10 bg-[#E11D48]" />
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Active Infrastructure</h2>
               </div>
               
               <div className="event-grid">
                  <AnimatePresence>
                    {active.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </AnimatePresence>
               </div>
            </div>
          )}

          {/* Completed Nodes Section */}
          {completed.length > 0 && (
            <div className="space-y-10 opacity-80 hover:opacity-100 transition-opacity duration-700">
               <div className="flex items-center gap-6">
                  <div className="w-1.5 h-10 bg-gray-700" />
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Historical Nodes</h2>
               </div>
               
               <div className="event-grid">
                  {completed.map((event) => (
                    <EventCard key={event._id} event={event} dimmed />
                  ))}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
