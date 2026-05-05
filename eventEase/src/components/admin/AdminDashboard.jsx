import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../features/auth/authSlice";
import api from "@/lib/api";
import {
  Menu,
  Calendar,
  Plus,
  MessageCircle,
  Ticket,
  LogOut,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  ArrowLeft,
  ArrowRight,
  Home,
  Settings,
  Users,
  Building2,
  Star,
  BarChart3,
  Shield,
  UserCircle2,
  User,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Images
import img1 from "../../assets/img/hero-bg.jpg";
import img2 from "../../assets/img/page-title-bg.webp";
import img3 from "../../assets/img/speaker.jpg";
import img4 from "../../assets/img/event.webp";
import defaultprofile from "../../assets/img/testimonials-2.jpg";
import ViewEvents from "../user/ViweEvents";
import { GroupedByEvents } from "./GroupedByEvents";
import { AdminEvents } from "./AdminEvents";
import { AddEvent } from "../organizer/AddEvent";
import AddStadiumForm from "./AddStadiumForm";
import ViewStadiums from "./ViewStadiums";
import { UserFeedback } from "../user/UserFeedBack";
import PendingEventsBadge from "./PendingEventsBadge";
import { RefundNotificationBadge } from "./RefundNotificationBadge";

export const AdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const heroImages = [img2, img3, img1, img4];

  // Fetch admin details
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("/user/getuserbytoken");
        const user = res.data.data;
        setUserName(user.fullName || user.name || "Admin");
        setError("");
      } catch (err) {
        console.error("Error fetching admin:", err);
        setError("Nexus authorization failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Signout
  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      dispatch(logout());
      navigate("/adminsignin");
    }
  };

  // Scroll to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Hero navigation
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const sidebarItems = [
    { id: "home", label: "Dashboard", icon: Home, to: "/admin" },
    { id: "events", label: "All Events", icon: Calendar, to: "/admin/allevents" },
    { id: "adminevents", label: "Admin Events", icon: Shield, to: "/admin/adminevents" },
    { id: "addevent", label: "Add Event", icon: Plus, to: "/admin/addevent" },
    { id: "addstadium", label: "Add Stadium", icon: Building2, to: "/admin/addstadium" },
    { id: "viewstadiums", label: "Manage Stadiums", icon: Settings, to: "/admin/stadiums" },
  ];

  const quickLinks = [
    { to: "/allusers", label: "Users", icon: UserCircle2 },
    { to: "/allorganizer", label: "Organizers", icon: Users },
    { to: "/alleventsticket", label: "Tickets", icon: Ticket },
    { to: "/admin/refunds", label: "Refund Requests", icon: Ticket, showRefundBadge: true },
    { to: "/admininbox", label: "Inbox", icon: Inbox },
  ];

  const location = useLocation();
  const isRoot = location.pathname === "/admin" || location.pathname === "/admin/";

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[#E11D48]/30">
      {/* FIXED LEFT SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#050505] border-r border-white/20 z-50 transition-all duration-500 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.5)]",
          sidebarCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#E11D48] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter uppercase text-white">EventEase</span>
                <span className="text-[7px] font-black tracking-[0.4em] text-[#E11D48]">COMMAND NEXUS</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:bg-white/5 text-gray-400"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-8 px-3 space-y-8 no-scrollbar">
          {/* Main Nodes */}
          <div className="space-y-2">
            {!sidebarCollapsed && (
              <p className="px-4 mb-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Operational Nodes</p>
            )}
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => navigate(item.to)}
                  className={cn(
                    "w-full h-12 transition-all duration-300 rounded-xl group",
                    sidebarCollapsed ? "justify-center px-0" : "justify-start px-4",
                    isActive ? "bg-[#E11D48]/20 text-white" : "hover:bg-[#E11D48]/10"
                  )}
                >
                  <Icon className={cn("h-5 w-5", sidebarCollapsed ? "" : "mr-3", isActive ? "text-[#E11D48]" : "text-gray-400 group-hover:text-[#E11D48] transition-colors")} />
                  {!sidebarCollapsed && (
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", isActive ? "text-white" : "text-gray-300 group-hover:text-white")}>
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Core Intelligence */}
          <div className="space-y-2">
            {!sidebarCollapsed && (
              <p className="px-4 mb-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Core Intelligence</p>
            )}
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-12 transition-all duration-300 rounded-xl group",
                      sidebarCollapsed ? "justify-center px-0" : "justify-start px-4",
                      "hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", sidebarCollapsed ? "" : "mr-3", "text-gray-400 group-hover:text-white transition-colors")} />
                    {!sidebarCollapsed && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                        {link.label}
                        {link.showRefundBadge && <RefundNotificationBadge />}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={signout}
            className={cn(
              "w-full h-12 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl",
              sidebarCollapsed ? "justify-center px-0" : "justify-start px-4"
            )}
          >
            <LogOut className={cn("h-5 w-5", sidebarCollapsed ? "" : "mr-3", "text-[#E11D48]")} />
            {!sidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>}
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={cn(
          "flex-1 transition-all duration-500 min-w-0 flex flex-col",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        {/* TOP COMMAND BAR */}
        <nav
          className={cn(
            "fixed top-0 right-0 z-40 transition-all duration-500 px-10 h-24 flex items-center border-b border-white/5",
            isScrolled ? "bg-black/80 backdrop-blur-3xl" : "bg-transparent",
            sidebarCollapsed ? "left-20" : "left-72"
          )}
        >
          <div className="w-full flex justify-between items-center">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-1">Central Nexus Active</h2>
              <p className="text-2xl font-black uppercase tracking-tighter text-white">Command Authority: {userName}</p>
            </div>

            <div className="flex items-center gap-6">
              <PendingEventsBadge onNavigate={(id) => navigate('/admin')} />
              <div className="h-8 w-px bg-white/10" />
              <DarkModeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-xl p-0 overflow-hidden border border-white/10 hover:border-[#E11D48]/50 transition-all">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={defaultprofile} className="grayscale hover:grayscale-0 transition-all" />
                      <AvatarFallback className="bg-[#050505] text-white text-[10px] font-black">
                        {userName ? userName.charAt(0).toUpperCase() : "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#050505] border-white/10 p-2 rounded-2xl shadow-2xl">
                  <div className="px-4 py-4 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">{userName}</p>
                    <p className="text-[8px] text-gray-500 uppercase mt-1 tracking-widest">Master System Administrator</p>
                  </div>
                  <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigate('/admininbox')}>
                    <Inbox className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                    Nexus Inbox
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={signout} className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4 mr-3" />
                    Terminate Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        {/* CONTENT RENDERING ENGINE */}
        <main className="flex-1 pt-32 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex-1 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              {isRoot ? (
                <motion.div
                  key="admin-dashboard-home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col"
                >
                  {/* HERO NEXUS */}
                  <div id="home" className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-center mb-10 px-10">
                    {heroImages.map((img, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "absolute inset-0 transition-all duration-[2s] ease-out",
                          i === currentSlide ? "opacity-30 scale-100 rotate-0" : "opacity-0 scale-110 rotate-1"
                        )}
                        style={{
                          backgroundImage: `url(${img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="max-w-4xl px-10 text-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1 }}
                        >
                          <Badge className="bg-[#E11D48] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-[0_0_40px_rgba(225,29,72,0.4)] border-0">
                            Nexus Authorization Verified
                          </Badge>
                          <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.85] uppercase tracking-tighter mb-10">
                            Operational <br /> <span className="text-[#E11D48]">Command</span> Center
                          </h1>
                          <p className="text-lg text-gray-400 font-bold uppercase tracking-[0.3em] mb-12 max-w-2xl mx-auto leading-relaxed">
                            Total system oversight across the EventEase decentralized architecture
                          </p>
                          <div className="flex flex-wrap gap-6 justify-center">
                            <Button
                              size="lg"
                              onClick={() => navigate("/admin/addevent")}
                              className="h-20 px-10 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] group"
                            >
                              <Plus className="w-5 h-5 mr-4 group-hover:rotate-90 transition-transform" /> Initialize Event
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => navigate("/admin/allevents")}
                              className="h-20 px-10 bg-transparent border-white/20 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-white hover:text-black transition-all"
                            >
                              <Calendar className="w-5 h-5 mr-4" /> Global Catalog
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Slide Controls */}
                    <div className="absolute bottom-20 left-10 flex gap-4">
                      <button onClick={prevSlide} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"><ArrowLeft className="w-5 h-5" /></button>
                      <button onClick={nextSlide} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"><ArrowRight className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* CORE OPERATIONAL MODULES (Preview on Home) */}
                  <div className="relative z-10 space-y-32 pb-40 px-10">
                    <section id="events" className="scroll-mt-32">
                      <div className="flex items-center gap-10 mb-16">
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Global Catalog</h2>
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Master Manifest</span>
                      </div>
                      <ViewEvents />
                    </section>

                    <section id="groupbyevent" className="scroll-mt-32">
                      <div className="flex items-center gap-10 mb-16">
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Intelligence Grids</h2>
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Data Clusters</span>
                      </div>
                      <GroupedByEvents />
                    </section>

                    <section id="feedback" className="scroll-mt-32">
                      <div className="flex items-center gap-10 mb-16">
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Neural Feedback</h2>
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">User Sentiment</span>
                      </div>
                      <UserFeedback />
                    </section>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="admin-sub-route"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="px-6 md:px-10 pb-20"
                >
                  <Outlet />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* NEXUS FOOTER */}
        <footer className="relative bg-[#050505] border-t border-white/10 text-white overflow-hidden py-32 px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
            <div className="col-span-1 md:col-span-2 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#E11D48] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.4)]">
                   <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                   <h3 className="text-4xl font-black uppercase tracking-tighter italic">EventEase <span className="text-gray-600">NEXUS</span></h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Command Authority Established</p>
                </div>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] max-w-md leading-relaxed">
                Centralized intelligence and operational control for the EventEase decentralized event ecosystem. 
                All transmissions monitored under protocol X-88.
              </p>
            </div>

            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Quick Access</h4>
               <div className="flex flex-col gap-4">
                  {quickLinks.map(link => (
                    <Link key={link.to} to={link.to} className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Nexus Support</h4>
               <div className="flex flex-col gap-4 text-sm font-black uppercase tracking-widest text-gray-400">
                  <span>Authorized Personnel Only</span>
                  <span>System Diagnostics Active</span>
                  <span>© 2026 NEXUS CORE</span>
               </div>
            </div>
          </div>
        </footer>
      </div>

      <Outlet />
    </div>
  );
};
