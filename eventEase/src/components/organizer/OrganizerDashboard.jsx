import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../features/auth/authSlice";
import api from "@/lib/api";
import {
  Calendar,
  Plus,
  MessageCircle,
  Ticket,
  LogOut,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Globe,
  LayoutDashboard,
  Bell,
  Sparkles,
  ShieldCheck,
  Facebook,
  Twitter,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Star
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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { UserFeedback } from "../user/UserFeedBack";
import { ContactUs } from "../common/ContactUs";
import ViewEventsOrg from "./ViewEventsOrg";
import ChatBot from "../common/ChatBot";
import '../../styles/components/OrganizerDashboard.css';
import "@/styles/common/Common.css";

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

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === "/organizer" || location.pathname === "/organizer/";
  const heroImages = [img3, img2, img1, img4];

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        let res;
        try {
          res = await api.get("/organizer/organizer/self");
        } catch (orgErr) {
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="organizer-dashboard-layout">
      <div className="dashboard-bg-effects">
        <div className="bg-blur-crimson" />
        <div className="bg-blur-purple" />
      </div>

      <aside className={`organizer-sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="org-sidebar-header">
          {!sidebarCollapsed && (
            <Link to="/organizer" className="org-sidebar-logo-box">
              <div className="org-sidebar-icon"><Ticket className="w-5 h-5 text-white" /></div>
              <div className="org-sidebar-brand-text">
                <span className="org-sidebar-name">EventEase</span>
                <span className="org-sidebar-tier">PRODUCER</span>
              </div>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-gray-400">
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        <div className="org-sidebar-nav no-scrollbar">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => item.to ? navigate(item.to) : scrollToSection(item.id)} className={`org-nav-item ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <item.icon className="org-nav-icon" />
              {!sidebarCollapsed && <span className="org-nav-label">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="org-sidebar-footer">
          <button onClick={signout} className={`org-signout-btn ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <LogOut className="h-5 w-5 mr-3 text-[#E11D48]" />
            {!sidebarCollapsed && <span className="org-nav-label">Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-500 min-w-0 flex flex-col ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <nav className={`org-top-navbar ${isScrolled ? 'scrolled' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <div className="org-status-badge-box">
            <div className="production-node-badge">
              <div className="status-dot animate-pulse" />
              <span className="status-label">Production Node Ready</span>
            </div>
          </div>

          <div className="user-action-box">
            <button className="notification-btn-org"><Bell className="w-5 h-5" /><span className="notification-dot-org" /></button>
            <div className="v-divider" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="org-profile-trigger group">
                  <div className="profile-avatar-box">
                    <Avatar className="profile-avatar-img"><AvatarImage src={authUser?.profileImg} /><AvatarFallback className="bg-gradient-to-br from-[#E11D48] to-purple-700 text-white font-black">{(authUser?.fullName || authUser?.name || "P").charAt(0)}</AvatarFallback></Avatar>
                    <div className="online-status-indicator" />
                  </div>
                  <div className="profile-info-text">
                    <p className="profile-name-org">{authUser?.fullName || authUser?.name || "PRODUCER NODE"}</p>
                    <p className="profile-role-org">Master Producer</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-all group-hover:translate-y-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-black border-white/5 text-white p-2 mt-4 backdrop-blur-3xl">
                <div className="px-4 py-4 border-b border-white/5 mb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-white">{userName}</p>
                  <p className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">Master Producer Control</p>
                </div>
                <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigate('/organizer/bookingofmyevents')}>
                  <Ticket className="w-4 h-4 mr-3 text-[#E11D48]" /> Sales Report
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer group text-red-500" onClick={signout}>
                  <LogOut className="w-4 h-4 mr-3" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        <main className="flex-1 pt-24 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {isRoot ? (
                <motion.div key="dashboard-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                  <div id="home" className="org-hero-section">
                    {heroImages.map((img, i) => (
                      <motion.div key={i} className="org-hero-slide dynamic-bg" initial={{ opacity: 0 }} animate={{ opacity: i === currentSlide ? 0.3 : 0 }} style={{ '--bg-image': `url(${img})` }}>
                        <div className="hero-dimmer" />
                      </motion.div>
                    ))}
                    <div className="hero-vignette-org" />
                    <div className="hero-gradient-org" />
                    <div className="org-hero-content">
                       <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                          <div className="hero-badge-org">
                             <Sparkles className="h-4 w-4 text-[#E11D48]" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Premium Operational Status</span>
                          </div>
                          <h1 className="hero-title-org">CONTROL THE<br /><span className="text-[#E11D48]">EXPERIENCE</span></h1>
                          <div className="flex gap-6 mt-12">
                             <Button className="h-16 px-12 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all shadow-2xl" onClick={() => navigate('/organizer/addevent')}>CREATE EVENT</Button>
                             <Button variant="outline" className="h-16 px-12 bg-transparent border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-white/5 transition-all" onClick={() => navigate('/organizer/viewevent')}>MY ARCHIVE</Button>
                          </div>
                       </motion.div>
                    </div>
                  </div>

                  <div className="org-dashboard-modules">
                    <section id="events" className="org-section-card"><div className="org-section-container"><ViewEventsOrg /></div></section>
                    <section id="feedback" className="org-section-card"><div className="org-section-container"><div className="org-section-heading-box"><span className="section-pre-label">Audience Matrix</span><h2 className="section-title-org">Historical Intel</h2></div><UserFeedback /></div></section>
                    <section id="contactus" className="org-section-card"><div className="org-section-container"><div className="mb-20 text-center"><span className="section-pre-label text-[#E11D48]">Support Node</span><h2 className="section-title-org">Direct Channel</h2></div><div className="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl"><ContactUs /></div></div></section>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="sub-route" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 md:px-10 pb-20"><Outlet /></motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="org-footer">
             <div className="org-footer-content">
                <div className="footer-protocol-box">
                   <div className="footer-protocol-icon"><ShieldCheck className="w-4 h-4 text-white" /></div>
                   <span className="footer-protocol-text">EventEase Production Protocol © 2025</span>
                </div>
                <div className="flex gap-5">
                   <Facebook className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer" />
                   <Twitter className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer" />
                   <Instagram className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer" />
                </div>
             </div>
          </footer>
        </main>
        <ChatBot />
      </div>
    </div>
  );
};

export default OrganizerDashboard;
