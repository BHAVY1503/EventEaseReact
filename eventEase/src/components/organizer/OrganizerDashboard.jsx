import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
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
  Sparkles,
  Bell,
  Activity,
  ShieldCheck,
  Globe,
  Rocket,
  LayoutDashboard,
  Search,
  Zap
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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { AddEvent } from "./AddEvent";
import { ViewMyEvent } from "./ViewMyEvent";
import { UserFeedback } from "../user/UserFeedBack";
import { ContactUs } from "../common/ContactUs";
import ViewEventsOrg from "./ViewEventsOrg";
import ChatBot from "../common/ChatBot";

// Images
import img1 from "../../assets/img/hero-bg.jpg";
import img2 from "../../assets/img/page-title-bg.webp";
import img3 from "../../assets/img/speaker.jpg";
import img4 from "../../assets/img/event.webp";

export const OrganizerDashboard = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === "/organizer" || location.pathname === "/organizer/";
  const heroImages = [img3, img2, img1, img4];

  // Fetch organizer details
  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        // Try organizer specific endpoint first
        let res;
        try {
          res = await api.get("/organizer/organizer/self");
        } catch (orgErr) {
          // Fallback to general user endpoint
          res = await api.get("/user/getuserbytoken");
        }
        const user = res.data.data;
        setUserName(user.name || user.fullName || "Producer");
      } catch (err) {
        console.error("Error fetching organizer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizer();
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-slide hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const signout = () => {
    if (window.confirm("ARE YOU SURE YOU WANT TO TERMINATE SESSION?")) {
      dispatch(logout());
      navigate("/organizersignin");
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sidebarItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard, to: "/organizer" },
    { id: "events", label: "Catalog", icon: Globe },
    { id: "addevent", label: "Production", icon: Plus, to: "/organizer/addevent" },
    { id: "viewevent", label: "Archive", icon: Calendar, to: "/organizer/viewevent" },
    { id: "bookedtickets", label: "Booked Tickets", icon: Ticket, to: "/bookedtickets" },
    { id: "salesreport", label: "Sales Report", icon: BarChart3, to: "/organizer/bookingofmyevents" },
    { id: "feedback", label: "Intel", icon: Star },
    { id: "contactus", label: "Support", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white flex overflow-x-hidden font-sans relative">
      {/* Cinematic Background Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E11D48]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

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
            <Link to="/organizer" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#E11D48] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter uppercase text-white">EventEase</span>
                <span className="text-[7px] font-black tracking-[0.4em] text-[#E11D48]">PRODUCER</span>
              </div>
            </Link>
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
        <div className="flex-1 overflow-y-auto py-8 px-3 space-y-2 no-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => item.to ? navigate(item.to) : scrollToSection(item.id)}
                className={cn(
                  "w-full h-12 transition-all duration-300 rounded-xl group",
                  sidebarCollapsed ? "justify-center px-0" : "justify-start px-4",
                  "hover:bg-[#E11D48]/10"
                )}
              >
                <Icon className={cn("h-5 w-5", sidebarCollapsed ? "" : "mr-3", "text-gray-400 group-hover:text-[#E11D48] transition-colors")} />
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
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
            {!sidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>}
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
        {/* TOP NAVBAR */}
        <nav
          className={cn(
            "fixed top-0 right-0 h-24 z-40 transition-all duration-500 flex items-center justify-between px-10 border-b border-white/5",
            isScrolled ? "bg-black/95 backdrop-blur-xl" : "bg-transparent",
            sidebarCollapsed ? "left-20" : "left-72"
          )}
        >
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
              <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full animate-pulse shadow-[0_0_8px_#E11D48]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Production Node Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#E11D48] rounded-full" />
              </button>
              <div className="h-6 w-px bg-white/10 mx-2" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-4 group outline-none">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-white/10 group-hover:border-[#E11D48] transition-all duration-500 shadow-2xl">
                        <AvatarImage src={authUser?.profileImg} />
                        <AvatarFallback className="bg-gradient-to-br from-[#E11D48] to-purple-700 text-white font-black text-sm uppercase">
                          {(authUser?.fullName || authUser?.name || "P").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#050505] rounded-full" />
                    </div>
                    <div className="hidden md:flex flex-col items-start justify-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white group-hover:text-[#E11D48] transition-colors">
                        {authUser?.fullName || authUser?.name || "PRODUCER NODE"}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-gray-300 transition-colors">Master Producer</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-white transition-all group-hover:translate-y-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-black border-white/5 text-white p-2 mt-4 backdrop-blur-3xl">
                  <div className="px-4 py-4 border-b border-white/5 mb-2">
                    <p className="text-xs font-black uppercase tracking-widest text-white">{userName}</p>
                    <p className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">Master Producer Control</p>
                  </div>
                  <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigate('/organizer/bookingofmyevents')}>
                    <Ticket className="w-4 h-4 mr-3 text-[#E11D48]" />
                    Sales Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer group text-red-500" onClick={signout}>
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        {/* CONTENT RENDERING ENGINE */}
        <main className="flex-1 pt-24 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {isRoot ? (
                <motion.div
                  key="dashboard-home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col"
                >
                  {/* HERO SECTION */}
                  <div id="home" className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-center mb-10">
                    {heroImages.map((img, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: i === currentSlide ? 0.5 : 0 }}
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${img})`,
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="relative z-10 w-full px-12 md:px-20 max-w-[1600px] mx-auto">
                       <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1 }}
                       >
                          <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-10">
                             <Sparkles className="h-4 w-4 text-[#E11D48]" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Premium Operational Status</span>
                          </div>
                          <h1 className="text-6xl md:text-[80px] font-black leading-[0.8] tracking-tighter uppercase mb-12">
                             CONTROL THE<br />
                             <span className="text-[#E11D48]">EXPERIENCE</span>
                          </h1>
                          <div className="flex gap-6 mt-12">
                             <Button 
                                className="h-16 px-12 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl"
                                onClick={() => navigate('/organizer/addevent')}
                             >
                                CREATE EVENT
                             </Button>
                             <Button 
                                variant="outline"
                                className="h-16 px-12 bg-transparent border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-white/5 transition-all"
                                onClick={() => navigate('/organizer/viewevent')}
                             >
                                MY ARCHIVE
                             </Button>
                          </div>
                       </motion.div>
                    </div>
                  </div>

                  {/* SEQUENTIAL DASHBOARD SECTIONS */}
                  <div className="space-y-0 relative z-10">
                    <section id="events" className="py-24 bg-transparent border-y border-white/5 scroll-mt-24 backdrop-blur-sm">
                      <div className="max-w-[1600px] mx-auto px-10">
                        <ViewEventsOrg />
                      </div>
                    </section>

                    <section id="feedback" className="py-24 bg-transparent border-b border-white/5 scroll-mt-24">
                      <div className="max-w-[1600px] mx-auto px-10">
                        <div className="mb-16">
                          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mb-4 block">Audience Matrix</span>
                          <h2 className="text-5xl font-black uppercase tracking-tighter text-white">Historical Intel</h2>
                        </div>
                        <UserFeedback />
                      </div>
                    </section>

                    <section id="contactus" className="py-32 bg-transparent scroll-mt-24">
                      <div className="max-w-[1600px] mx-auto px-10">
                         <div className="mb-20 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E11D48] mb-6 block">Support Node</span>
                            <h2 className="text-6xl font-black uppercase tracking-tighter text-white">Direct Channel</h2>
                         </div>
                         <div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                            <ContactUs />
                         </div>
                      </div>
                    </section>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="sub-route"
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

          {/* FOOTER */}
          <footer className="py-20 border-t border-white/5 bg-black/40 mt-auto">
             <div className="max-w-[1600px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 bg-[#E11D48] rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">EventEase Production Protocol © 2025</span>
                </div>
                <div className="flex gap-10 items-center">
                   <div className="flex gap-5">
                      <Facebook className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer" />
                      <Twitter className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer" />
                      <Instagram className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer" />
                   </div>
                </div>
             </div>
          </footer>
        </main>

        <ChatBot />
      </div>
    </div>
  );
};

// Helper function for class merging
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}