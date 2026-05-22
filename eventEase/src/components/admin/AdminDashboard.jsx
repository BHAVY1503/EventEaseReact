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
import { DarkModeToggle } from "@/contexts/DarkModeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Images
import img1 from "../../assets/img/hero-bg.jpg";
import img2 from "../../assets/img/page-title-bg.webp";
import img3 from "../../assets/img/speaker.jpg";
import img4 from "../../assets/img/event.webp";
import defaultprofile from "../../assets/img/testimonials-2.jpg";
import ViewEvents from "../user/ViweEvents";
import { GroupedByEvents } from "./GroupedByEvents";
import { UserFeedback } from "../user/UserFeedBack";
import PendingEventsBadge from "./PendingEventsBadge";
import { RefundNotificationBadge } from "./RefundNotificationBadge";
import '../../styles/components/AdminDashboard.css';
import "@/styles/common/Common.css";

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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("/user/getuserbytoken");
        const user = res.data.data;
        setUserName(user.fullName || user.name || "Admin");
      } catch (err) {
        console.error("Error fetching admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      dispatch(logout());
      navigate("/adminsignin");
    }
  };

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
    <div className="admin-dashboard-layout">
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="sidebar-brand-box">
              <div className="sidebar-logo-icon">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-name">EventEase</span>
                <span className="sidebar-brand-sub">COMMAND NEXUS</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-gray-400">
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        <div className="sidebar-nav-section">
          <div className="mb-8">
            {!sidebarCollapsed && <p className="sidebar-group-label">Operational Nodes</p>}
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  className={`sidebar-nav-item ${location.pathname === item.to ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <item.icon className="sidebar-nav-icon" />
                  {!sidebarCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            {!sidebarCollapsed && <p className="sidebar-group-label">Core Intelligence</p>}
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="no-underline">
                  <button className={`sidebar-nav-item ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
                    <link.icon className="sidebar-nav-icon" />
                    {!sidebarCollapsed && (
                      <span className="sidebar-nav-label flex items-center gap-2">
                        {link.label}
                        {link.showRefundBadge && <RefundNotificationBadge />}
                      </span>
                    )}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={signout} className={`signout-btn ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <LogOut className="h-5 w-5 mr-3 text-[#E11D48]" />
            {!sidebarCollapsed && <span className="sidebar-nav-label">Terminate Session</span>}
          </button>
        </div>
      </aside>

      <div className={`admin-main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <nav className={`top-command-bar ${isScrolled ? 'scrolled' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <div className="command-bar-content">
            <div className="nexus-status-box">
              <h2 className="nexus-active-label">Central Nexus Active</h2>
              <p className="authority-name">Command Authority: {userName}</p>
            </div>
            <div className="flex items-center gap-6">
              <PendingEventsBadge onNavigate={(id) => navigate('/admin')} />
              <div className="h-8 w-px bg-white/10" />
              <DarkModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-xl p-0 overflow-hidden border border-white/10 hover:border-[#E11D48]/50">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={defaultprofile} className="grayscale hover:grayscale-0 transition-all" />
                      <AvatarFallback className="bg-[#050505] text-white text-[10px] font-black">{userName ? userName.charAt(0).toUpperCase() : "A"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#050505] border-white/10 p-2 rounded-2xl shadow-2xl">
                  <div className="px-4 py-4 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">{userName}</p>
                    <p className="text-[8px] text-gray-500 uppercase mt-1 tracking-widest">Master System Administrator</p>
                  </div>
                  <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigate('/admininbox')}>
                    <Inbox className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" /> Nexus Inbox
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={signout} className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4 mr-3" /> Terminate Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        <main className="pt-24 flex-1 flex flex-col">
          <div className="flex-1 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              {isRoot ? (
                <motion.div key="admin-dashboard-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                  <div id="home" className="admin-hero-section">
                    {heroImages.map((img, i) => (
                      <motion.div key={i} className="hero-slide dynamic-bg" animate={{ opacity: i === currentSlide ? 0.3 : 0, scale: i === currentSlide ? 1 : 1.1 }} style={{ '--bg-image': `url(${img})` }} />
                    ))}
                    <div className="hero-overlay-gradient" />
                    <div className="hero-vignette" />
                    <div className="hero-content-box">
                      <div className="hero-inner-content">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                          <Badge className="bg-[#E11D48] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-[0_0_40px_rgba(225,29,72,0.4)] border-0">Nexus Authorization Verified</Badge>
                          <h1 className="hero-title-large">Operational <br /> <span className="text-[#E11D48]">Command</span> Center</h1>
                          <p className="hero-subtitle-text">Total system oversight across the EventEase decentralized architecture</p>
                          <div className="flex flex-wrap gap-6 justify-center">
                            <Button onClick={() => navigate("/admin/addevent")} className="h-20 px-10 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-[#E11D48] hover:text-white transition-all border-none">
                              <Plus className="w-5 h-5 mr-4" /> Initialize Event
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/admin/allevents")} className="h-20 px-10 bg-transparent border-white/20 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-white hover:text-black transition-all">
                              <Calendar className="w-5 h-5 mr-4" /> Global Catalog
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    <div className="absolute bottom-20 left-10 flex gap-4">
                      <button onClick={prevSlide} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all bg-transparent cursor-pointer text-white"><ArrowLeft className="w-5 h-5" /></button>
                      <button onClick={nextSlide} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all bg-transparent cursor-pointer text-white"><ArrowRight className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="admin-module-container">
                    <section id="events" className="module-section">
                      <div className="module-header-row"><h2 className="module-title">Global Catalog</h2><div className="module-divider" /><span className="module-tag">Master Manifest</span></div>
                      <ViewEvents />
                    </section>
                    <section id="groupbyevent" className="module-section">
                      <div className="module-header-row"><h2 className="module-title">Intelligence Grids</h2><div className="module-divider" /><span className="module-tag">Data Clusters</span></div>
                      <GroupedByEvents />
                    </section>
                    <section id="feedback" className="module-section">
                      <div className="module-header-row"><h2 className="module-title">Neural Feedback</h2><div className="module-divider" /><span className="module-tag">User Sentiment</span></div>
                      <UserFeedback />
                    </section>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="admin-sub-route" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 md:px-10 pb-20">
                  <Outlet />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="admin-footer">
          <div className="footer-top-grid">
            <div className="footer-brand-column">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-[#E11D48] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.4)]"><Shield className="w-8 h-8 text-white" /></div>
                <div><h3 className="footer-brand-title">EventEase <span className="text-gray-600">NEXUS</span></h3><p className="footer-brand-sub">Command Authority Established</p></div>
              </div>
              <p className="footer-desc">Centralized intelligence and operational control for the EventEase decentralized event ecosystem.</p>
            </div>
            <div>
               <h4 className="footer-link-group-title">Quick Access</h4>
               <ul className="footer-link-list">
                  {quickLinks.map(link => (
                    <li key={link.to}><Link to={link.to} className="footer-link no-underline">{link.label}</Link></li>
                  ))}
               </ul>
            </div>
            <div>
               <h4 className="footer-link-group-title">Nexus Support</h4>
               <div className="footer-link-list">
                  <span className="footer-link cursor-default">Authorized Personnel Only</span>
                  <span className="footer-link cursor-default">System Diagnostics Active</span>
                  <span className="footer-link cursor-default">© 2026 NEXUS CORE</span>
               </div>
            </div>
          </div>
        </footer>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
