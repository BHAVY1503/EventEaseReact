import api from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Badge as BadgeIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldAlert,
  Sparkles,
  Activity,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

export const GroupedByEvents = () => {
  const navigate = useNavigate();
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRejectEventId, setCurrentRejectEventId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchGroupedEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/event/groupedeventsbyorganizer`);
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

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeleteLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await api.delete(`/event/deleteevent/${eventId}`);
      fetchGroupedEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleApprove = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await api.put(`/event/approveevent/${eventId}`, {});
      fetchGroupedEvents();
    } catch (err) {
      console.error(err);
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
      await api.put(`/event/rejectevent/${currentRejectEventId}`, { reason: rejectReason });
      setRejectDialogOpen(false);
      fetchGroupedEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(prev => ({ ...prev, [currentRejectEventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Initializing Command Core</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E11D48]/10 border border-[#E11D48]/20 rounded-full">
          <Activity className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Authority Oversight Active</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              EVENT<br />
              <span className="text-[#E11D48]">APPROVALS</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Strategic Management of Producer Infrastructure
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Active Clusters</p>
              <p className="text-3xl font-black text-white">{groupedEvents.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Total Payload</p>
              <p className="text-3xl font-black text-[#E11D48]">
                {groupedEvents.reduce((acc, g) => acc + g.events.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {groupedEvents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-20 border border-white/5 bg-white/5 rounded-[2rem] backdrop-blur-xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-white">No Pending Transmissions</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">The command queue is currently optimal.</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map((group, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Collapsible 
                open={expandedGroups[index]} 
                onOpenChange={() => toggleGroup(index)}
                className="group border border-white/5 bg-[#0A0A0A] rounded-[2rem] overflow-hidden hover:border-[#E11D48]/30 transition-all duration-500"
              >
                <CollapsibleTrigger asChild>
                  <div className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group-hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-16 h-16 rounded-2xl border border-white/10 group-hover:border-[#E11D48]/50 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-[#111] to-[#000] text-white font-black text-xl">
                            {group.organizerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#E11D48] rounded-lg flex items-center justify-center shadow-lg">
                          <BadgeIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-1">Cluster Origin</p>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:translate-x-1 transition-transform">{group.organizerName}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{group.organizerEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 mb-1">Queue Priority</p>
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-black text-white">{group.events.length} OBJECTS</span>
                           <div className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#E11D48] group-hover:border-[#E11D48] transition-all duration-500">
                        {expandedGroups[index] ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <AnimatePresence>
                  {expandedGroups[index] && (
                    <CollapsibleContent forceMount>
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="px-8 pb-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                          {group.events.map((event) => {
                            const eventEnded = new Date(event.endDate) < new Date();
                            return (
                              <motion.div
                                key={event._id}
                                whileHover={{ y: -10 }}
                                className="group/card relative bg-[#050505] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full hover:border-[#E11D48]/40 transition-all duration-500 shadow-2xl"
                              >
                                <div className="relative h-48 overflow-hidden">
                                  <img 
                                    src={event.eventImgUrl} 
                                    alt={event.eventName} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 grayscale-[0.2] group-hover/card:grayscale-0" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />
                                  
                                  {/* STATUS BADGES */}
                                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {event.approvalStatus === "Pending" && (
                                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 backdrop-blur-md font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                        Pending Action
                                      </Badge>
                                    )}
                                    {event.approvalStatus === "Approved" && (
                                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 backdrop-blur-md font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                        Authorized
                                      </Badge>
                                    )}
                                    {event.approvalStatus === "Rejected" && (
                                      <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 backdrop-blur-md font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                        Deauthorized
                                      </Badge>
                                    )}
                                  </div>

                                  {eventEnded && (
                                    <Badge className="absolute bottom-4 right-4 bg-white/10 text-white backdrop-blur-md border border-white/20 font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                      Lifecycle End
                                    </Badge>
                                  )}
                                </div>

                                <CardContent className="p-6 space-y-6 flex-1">
                                  <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-1">{event.eventType}</p>
                                    <h4 className="text-xl font-black uppercase tracking-tight text-white leading-tight">{event.eventName}</h4>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                      </div>
                                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                      </div>
                                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[200px]">
                                        {event.stadiumId?.address || event.cityId?.name || "Location Unknown"}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                        <Users className="w-3 h-3 text-gray-400" />
                                      </div>
                                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {event.numberOfSeats - (event.bookedSeats || 0)} Capacity Nodes Open
                                      </div>
                                    </div>
                                  </div>

                                  {event.approvalStatus === "Rejected" && event.rejectionReason && (
                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                      <p className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-1">Breach Protocol Reason</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase italic">"{event.rejectionReason}"</p>
                                    </div>
                                  )}
                                </CardContent>

                                <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                                  {event.approvalStatus === "Pending" ? (
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                      <Button
                                        onClick={() => handleApprove(event._id)}
                                        disabled={actionLoading[event._id]}
                                        className="h-12 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                                      >
                                        {actionLoading[event._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize"}
                                      </Button>
                                      <Button
                                        onClick={() => openRejectDialog(event._id)}
                                        disabled={actionLoading[event._id]}
                                        variant="outline"
                                        className="h-12 border-white/10 bg-transparent text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all"
                                      >
                                        Decline
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2 w-full">
                                      <Button 
                                        variant="outline" 
                                        asChild
                                        className="flex-1 h-12 border-white/10 bg-transparent text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-white/5 hover:text-white transition-all"
                                      >
                                        <Link to={`/updateevent/${event._id}`}>
                                          <Edit className="w-3 h-3 mr-2" /> Modify Core
                                        </Link>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => handleDelete(event._id)}
                                        disabled={deleteLoading[event._id]}
                                        className="w-12 h-12 p-0 border-white/10 bg-transparent text-gray-600 rounded-xl hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all"
                                      >
                                        {deleteLoading[event._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                      </Button>
                                    </div>
                                  )}
                                </CardFooter>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
              </Collapsible>
            </motion.div>
          ))}
        </div>
      )}

      {/* REJECT DIALOG */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-[2rem] p-10 max-w-lg backdrop-blur-3xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
            <ShieldAlert className="w-64 h-64 text-[#E11D48]" />
          </div>
          
          <DialogHeader className="relative z-10">
             <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6 text-red-500" />
             </div>
             <DialogTitle className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">DEAUTHORIZATION<br /><span className="text-red-500">PROTOCOL</span></DialogTitle>
             <DialogDescription className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Strategic Rejection Briefing</DialogDescription>
          </DialogHeader>

          <div className="py-10 space-y-6 relative z-10">
            <div className="space-y-3 group">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] group-focus-within:text-red-500 transition-colors">Protocol Breach Summary</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="DESCRIBE INFRASTRUCTURE DEFICIENCIES..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[11px] font-bold tracking-widest uppercase focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 placeholder:text-gray-500 outline-none resize-none transition-all"
              />
            </div>
          </div>

          <DialogFooter className="relative z-10 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
              className="h-14 border-white/10 bg-transparent text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl flex-1 hover:bg-white/5"
            >
              Abort
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={!rejectReason.trim() || actionLoading[currentRejectEventId]}
              className="h-14 bg-red-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl flex-1 shadow-2xl hover:bg-red-700"
            >
              {actionLoading[currentRejectEventId] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
