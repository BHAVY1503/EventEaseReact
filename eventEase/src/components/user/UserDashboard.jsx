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

import { ViewEvents } from '../user/ViweEvents';
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
            <DarkModeToggle />
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
