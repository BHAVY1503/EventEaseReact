import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Trash2, 
  Mail, 
  Phone, 
  Search, 
  Filter,
  Download,
  Building2,
  Shield,
  AlertCircle,
  Loader2,
  UserCheck,
  Activity,
  Globe,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const AllOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);
  const token = localStorage.getItem("token");

  const fetchOrganizer = async () => {
    try {
      const res = await axios.get("/organizer/allorganizers", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrganizers(res.data.data || []);
      setFilteredOrganizers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching organizers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrganizer();
  }, [token]);

  useEffect(() => {
    const filtered = organizers.filter(org => 
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.PhoneNo?.includes(searchTerm)
    );
    setFilteredOrganizers(filtered);
  }, [searchTerm, organizers]);

  const handleDeleteClick = (organizer) => {
    setOrganizerToDelete(organizer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!organizerToDelete) return;
    
    try {
      await axios.delete(`/organizer/deleteorganizer/${organizerToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchOrganizer();
      setDeleteDialogOpen(false);
      setOrganizerToDelete(null);
    } catch (err) {
      console.error("Error deleting organizer", err);
      alert("FAILED TO PURGE ENTITY.");
    }
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      'Admin': 'bg-[#E11D48]/20 text-[#E11D48] border-[#E11D48]/30',
      'Organizer': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      'User': 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    };
    return styles[role] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#E11D48]/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] absolute inset-0 m-auto" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] animate-pulse">Syncing Organizer Registry Nodes</p>
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
          <Briefcase className="h-3 w-3 text-[#E11D48] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Global Organizer Directory Active</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              ORGANIZER<br />
              <span className="text-[#E11D48]">COMMAND</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              Oversight and regulation of all service provider entities.
            </p>
          </div>
          <div className="flex items-center gap-8 border-l border-white/10 pl-8 h-fit">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Service Providers</p>
              <p className="text-3xl font-black text-white">{organizers.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Grid Match</p>
              <p className="text-3xl font-black text-[#E11D48]">{filteredOrganizers.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Active Nodes", value: organizers.length, icon: Activity, color: "text-[#E11D48]" },
          { label: "Verified Corporations", value: [...new Set(organizers.map(o => o.organizationName))].length, icon: Building2, color: "text-blue-500" },
          { label: "Administrative Oversight", value: organizers.filter(o => o.role === 'Admin').length, icon: Shield, color: "text-emerald-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <stat.icon className="w-20 h-20 text-white" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">{stat.label}</p>
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-4xl font-black text-white relative z-10">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* MAIN REGISTRY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-white/5 bg-[#0A0A0A] rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-3xl"
      >
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-r from-transparent to-white/[0.02]">
          <div className="space-y-1">
             <h3 className="text-2xl font-black uppercase tracking-tight text-white">Central Registry</h3>
             <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Validated Service Provider Entities</p>
          </div>
          
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#E11D48] transition-colors" />
              <Input
                placeholder="IDENTIFY BY NAME, EMAIL, OR ORGANIZATION..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase focus:ring-[#E11D48]/30 focus:border-[#E11D48]/30 placeholder:text-gray-500 transition-all"
              />
            </div>
            <Button variant="outline" className="h-14 px-8 border-white/10 bg-transparent text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:bg-white hover:text-black transition-all">
              <Download className="w-4 h-4 mr-3" /> EXPORT GRID
            </Button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 py-6 pl-10">Sequence</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 py-6">Organizer Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 py-6">Organization</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 py-6">Communications</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 py-6">Access Tier</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 py-6 pr-10">Protocols</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizers.map((org, index) => (
                <TableRow key={org._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <TableCell className="text-[11px] font-black text-gray-600 py-6 pl-10">
                    {String(index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-12 h-12 rounded-2xl ring-2 ring-white/5">
                        <AvatarFallback className="bg-gradient-to-br from-[#E11D48] to-[#991B1B] text-white font-black uppercase text-lg">
                          {org.name?.charAt(0) || 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-[13px] font-black text-white uppercase tracking-tight group-hover:text-[#E11D48] transition-colors">{org.name}</p>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{org._id.substring(0, 12)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                        <Building2 className="w-3 h-3 text-gray-600" />
                      </div>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {org.organizationName || 'NULL'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="space-y-2">
                      <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Mail className="w-3 h-3 mr-3 text-gray-600" />
                        {org.email}
                      </div>
                      <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Phone className="w-3 h-3 mr-3 text-gray-600" />
                        {org.PhoneNo || 'NULL'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className={cn("px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest border", getRoleBadgeStyle(org.roleId?.name || org.role))}>
                      <Shield className="w-3 h-3 mr-2" />
                      {org.roleId?.name || org.role || 'Organizer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-6 pr-10">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-white hover:bg-red-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl h-10 px-6 transition-all"
                      onClick={() => handleDeleteClick(org)}
                    >
                      <Trash2 className="w-3 h-3 mr-3" />
                      PURGE
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* FOOTER ACTION */}
      <div className="text-center pt-8">
        <Link to="/admin">
          <Button variant="outline" className="h-16 px-10 border-white/10 bg-[#0A0A0A] text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all group">
            RETURN TO COMMAND CENTER <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* PURGE DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-10 max-w-md">
          <AlertDialogHeader className="space-y-6">
            <div className="w-16 h-16 bg-[#E11D48]/10 rounded-[1.5rem] flex items-center justify-center border border-[#E11D48]/20 mx-auto">
              <ShieldAlert className="w-8 h-8 text-[#E11D48]" />
            </div>
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                ENTITY TERMINATION<br />
                <span className="text-[#E11D48]">CONFIRMATION</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                YOU ARE ABOUT TO PERMANENTLY PURGE <span className="text-white">"{organizerToDelete?.name}"</span> FROM THE CENTRAL CORE. THIS ACTION IS IRREVERSIBLE.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="h-14 flex-1 bg-white/5 border-white/10 text-gray-500 font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:bg-white/10">CANCEL PROTOCOL</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="h-14 flex-1 bg-[#E11D48] text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:bg-red-700 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
            >
              EXECUTE PURGE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
