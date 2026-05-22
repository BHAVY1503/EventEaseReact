import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar, Users, Shield, Zap, Star, ArrowRight, CheckCircle, Clock, MapPin, Ticket, ChevronDown, LogOut, Badge, Sparkles, Activity, Bell, ShieldCheck, Globe, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkModeToggle } from '@/contexts/DarkModeContext';
import api from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';

// Assets
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import defaultprofile from "../../assets/profile.jpg";

import { UserFeedback } from '../user/UserFeedBack';
import { ViewEvents } from '../user/ViweEvents';
import { ContactUs } from '../common/ContactUs';
import ChatBot from '../common/ChatBot';
import '../../styles/components/UserDashboard.css';
import "@/styles/common/Common.css";

export const UserDashboard = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const images = [img4, img2, img3, img1];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/event/geteventstats");
        setEventStats(res.data || { totalEvents: 0, activeEvents: 0 });
      } catch (err) {
        console.error("Failed to fetch event stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/signin');
        return;
      }
      try {
        const res = await api.get("/user/getuserbytoken");
        const user = res.data.data;
        setUserName(user.fullName || user.name || "Explorer");
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const signout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  return (
    <div className="user-dashboard-container">
      {/* Cinematic Navigation */}
      <header className={`cinematic-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <Link to="/user-dashboard" className="brand-logo group">
            <div className="logo-icon-box">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="brand-name group-hover:text-[#E11D48]">EventEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav-links">
            {['Discovery', 'My Tickets', 'Live Feed', 'Network'].map((item) => (
              <Link
                key={item}
                to={item === 'My Tickets' ? '/mytickets' : '#'}
                className="nav-link-item group"
              >
                {item}
                <span className="nav-link-underline" />
              </Link>
            ))}
          </nav>

          {/* User Profile Action */}
          <div className="header-actions">
            <button className="notification-btn">
               <Bell className="h-5 w-5" />
               <span className="notification-dot" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-4 group bg-transparent border-none cursor-pointer">
                  <Avatar className="w-10 h-10 border border-white/10 group-hover:border-[#E11D48] transition-colors">
                    <AvatarFallback className="bg-[#E11D48] text-white font-black text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white">{loading ? "Loading..." : userName}</p>
                     <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Premium Member</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-black border-white/10 text-white p-2">
                <div className="px-4 py-4 border-b border-white/10 mb-2">
                   <p className="text-xs font-black uppercase tracking-widest">{userName}</p>
                   <p className="text-[10px] text-gray-500 uppercase mt-1">Personal Dashboard</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/mytickets" className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer">
                    <Ticket className="w-4 h-4 mr-3 text-[#E11D48]" />
                    Orders & Tickets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer" onClick={signout}>
                   <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                   Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Welcome Section */}
      <section className="cinematic-hero">
        <div className="hero-background">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: index === currentSlide ? 0.3 : 0,
                scale: index === currentSlide ? 1 : 1.1 
              }}
              transition={{ duration: 2 }}
              className="hero-slide-item dynamic-bg"
              style={{ '--bg-image': `url(${img})` }}
            >
              <div className="hero-slide-overlay" />
            </motion.div>
          ))}
          <div className="hero-vignette" />
          <div className="hero-gradient" />
        </div>

        <div className="hero-main-content">
           <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
           >
              <div className="premium-badge">
                <Sparkles className="h-4 w-4 text-[#E11D48]" />
                <span>Premium Access Activated</span>
              </div>

              <h1 className="hero-title">
                 WELCOME BACK,<br />
                 <span className="text-glow">{userName}</span>
              </h1>

              <div className="hero-stats-row">
                 <div className="hero-stat-item">
                    <div className="stat-value">{eventStats.totalEvents || "120"}+</div>
                    <p className="stat-label">New Shows This Week</p>
                 </div>
                 <div className="hero-stat-item">
                    <div className="stat-value">24/7</div>
                    <p className="stat-label">Concierge Support</p>
                 </div>
                 <div className="hero-stat-item">
                    <div className="stat-value">ULTRA</div>
                    <p className="stat-label">Member Tier</p>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Main Grid Interface */}
      <section className="interface-section">
         <div className="interface-grid">
            <div className="grid-layout">
               {/* Quick Actions */}
               <div className="quick-actions-panel group">
                  <Activity className="h-12 w-12 text-[#E11D48] mb-12" />
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">QUICK ACTIONS</h3>
                  <div className="space-y-6">
                     <Button className="w-full h-14 text-[10px] bg-[#E11D48] hover:bg-[#BE123C] text-white font-black uppercase tracking-widest border-none" asChild>
                        <Link to="/organizersignup">HOST NEW EVENT</Link>
                     </Button>
                     <Button className="w-full h-14 text-[10px] bg-transparent hover:bg-white/10 text-white font-black uppercase tracking-widest border border-white/20" asChild>
                        <Link to="/mytickets">VIEW MY ORDERS</Link>
                     </Button>
                  </div>
               </div>

               {/* Discovery Feed Preview */}
               <div className="discovery-panel group">
                  <div className="discovery-bg dynamic-bg" style={{ '--bg-image': `url(${img3})` }} />
                  <div className="discovery-overlay" />
                  <div className="discovery-content">
                     <h3 className="text-5xl font-black uppercase tracking-tighter mb-6">EXPLORE THE<br />DISCOVERY FEED</h3>
                     <p className="text-gray-300 max-w-md text-sm font-bold uppercase tracking-widest leading-relaxed mb-12">
                        Tailored live show recommendations based on your unique entertainment profile.
                     </p>
                     <Button className="w-fit h-14 text-[10px] bg-transparent hover:bg-white hover:text-black text-white font-black uppercase tracking-widest border border-white/20 transition-all" asChild>
                        <Link to="/events">OPEN FEED</Link>
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* The Discovery Hub (ViewEvents Integration) */}
      <section className="py-24" id="events">
         <ViewEvents />
      </section>

      {/* Features - The Edge (Added from Landing) */}
      <section id="features" className="features-section">
        <div className="footer-inner-container">
           <div className="section-header">
              <span className="section-pretitle">The Edge</span>
              <h2 className="section-title-large">
                UNMATCHED<br />POWER
              </h2>
           </div>

           <div className="features-layout-grid">
              {[
                {
                  icon: <Ticket className="h-10 w-10" />,
                  title: "SMART TICKETING",
                  desc: "Precision dynamic pricing and bulk allocation systems for scale.",
                },
                {
                  icon: <Activity className="h-10 w-10" />,
                  title: "REAL-TIME INTEL",
                  desc: "Live sales tracking and audience behavior analytics.",
                },
                {
                  icon: <ShieldCheck className="h-10 w-10" />,
                  title: "IRONCLAD SECURITY",
                  desc: "Bank-grade encryption and secure secondary market controls.",
                },
                {
                  icon: <Globe className="h-10 w-10" />,
                  title: "GLOBAL NETWORK",
                  desc: "Reach audiences in over 150 countries with localized payments.",
                },
                {
                  icon: <Zap className="h-10 w-10" />,
                  title: "ZERO LATENCY",
                  desc: "High-concurrency infrastructure built for instant sold-out moments.",
                },
                {
                  icon: <Rocket className="h-10 w-10" />,
                  title: "VIP UPGRADES",
                  desc: "Integrated hospitality and premium experience management.",
                }
              ].map((f, i) => (
                <div key={i} className="feature-item-card group">
                  <div className="feature-accent-line" />
                  <div className="feature-icon-wrapper group-hover:text-white">
                    {f.icon}
                  </div>
                  <h3 className="feature-item-title">{f.title}</h3>
                  <p className="feature-item-desc group-hover:text-gray-300">
                    {f.desc}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Process Section (Added from Landing) */}
      <section id="about" className="py-40 bg-transparent">
        <div className="footer-inner-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-8 block">Our Process</span>
              <h2 className="text-5xl md:text-8xl font-black text-white leading-none mb-12">
                FROM CONCEPT<br />TO STAGE
              </h2>
              <div className="space-y-16">
                {[
                  { step: "01", title: "Curation", desc: "Build your event with our high-fidelity tools." },
                  { step: "02", title: "Activation", desc: "Launch marketing and open global sales channels." },
                  { step: "03", title: "Execution", desc: "Real-time entry management and live analytics." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-12 group">
                    <span className="text-4xl font-black text-white/10 group-hover:text-[#E11D48] transition-colors">{item.step}</span>
                    <div>
                      <h4 className="text-2xl font-black text-white mb-4">{item.title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-gray-900 rounded-2xl overflow-hidden relative group">
                 <img src={img3} alt="Process" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                 <div className="absolute bottom-12 left-12">
                    <p className="text-4xl font-black text-white leading-none">
                       THE STAGE<br />IS YOURS
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section (Added from Landing) */}
      <section id="feedback" className="py-40 bg-transparent border-t border-white/5">
         <UserFeedback />
      </section>

      {/* Experience Stats */}
      <section className="py-40 bg-transparent">
         <div className="footer-inner-container text-center">
            <h2 className="text-7xl md:text-[150px] font-black leading-none tracking-tighter uppercase opacity-10 mb-20 select-none">PERFORMANCE</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
               {[
                  { label: "Shows Attended", val: "14" },
                  { label: "Points Earned", val: "4.8K" },
                  { label: "VIP Passes", val: "3" },
                  { label: "Network Size", val: "842" }
               ].map((s, i) => (
                  <div key={i} className="group">
                     <div className="text-6xl font-black text-white group-hover:text-[#E11D48] transition-colors">{s.val}</div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-4">{s.label}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Cinematic Footer */}
      <footer className="cinematic-footer">
        <div className="footer-inner-container">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
               <h2 className="footer-brand-title">
                  THE HUB FOR<br /><span className="text-[#E11D48]">ELITE SHOWS</span>
               </h2>
               <div className="footer-social-row">
                  {['Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map(s => (
                    <a key={s} href="#" className="social-link">{s}</a>
                  ))}
               </div>
            </div>
            
            <div className="footer-links-grid">
               <div>
                  <h4 className="footer-link-group-title">User Console</h4>
                  <ul className="footer-link-list">
                    {['My Profile', 'Order History', 'Security', 'Preferences'].map(l => (
                      <li key={l}><a href="#" className="footer-nav-link">{l}</a></li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h4 className="footer-link-group-title">Global Support</h4>
                  <ul className="footer-link-list">
                    {['Concierge', 'Help Center', 'API Status', 'Security Center'].map(l => (
                      <li key={l}><a href="#" className="footer-nav-link">{l}</a></li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>

          {/* Contact Integration (Added from Landing) */}
          <div id="contactus" className="contact-integration-box">
             <div className="contact-header-row">
                <h3 className="text-4xl font-black">GET IN TOUCH</h3>
                <p className="text-gray-500 text-sm max-w-xs text-right uppercase font-bold tracking-widest">Our agents are available 24/7 for enterprise support.</p>
             </div>
             <div className="contact-form-wrapper">
                <ContactUs />
             </div>
          </div>

          <div className="footer-bottom-row">
            <p className="copyright-text">
              © 2025 EventEase. The Standard in Live Entertainment.
            </p>
            <div className="flex items-center gap-12">
               <Badge className="bg-white/5 border border-white/10 text-gray-400 text-[10px] uppercase font-black px-4 py-2">Ultra Member</Badge>
            </div>
          </div>
        </div>
      </footer>
      
      <ChatBot />
      <Outlet />
    </div>
  );
};

export default UserDashboard;
