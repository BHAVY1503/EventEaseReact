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
    <div className="min-h-screen bg-transparent text-white selection:bg-rose-500/30 overflow-x-hidden">
      {/* Cinematic Navigation */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4'
        : 'bg-transparent py-8'
        }`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between px-6 md:px-12">
          <Link to="/user-dashboard" className="flex items-center space-x-4 group">
            <div className="w-10 h-10 bg-[#E11D48] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.5)] group-hover:scale-110 transition-transform">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase text-white group-hover:text-[#E11D48] transition-colors">EventEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            {['Discovery', 'My Tickets', 'Live Feed', 'Network'].map((item) => (
              <Link
                key={item}
                to={item === 'My Tickets' ? '/mytickets' : '#'}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#E11D48] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* User Profile Action */}
          <div className="flex items-center space-x-8">
            <button className="relative text-gray-400 hover:text-white transition-colors">
               <Bell className="h-5 w-5" />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E11D48] rounded-full" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-4 group">
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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: index === currentSlide ? 0.3 : 0,
                scale: index === currentSlide ? 1 : 1.1 
              }}
              transition={{ duration: 2 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto px-6 md:px-12 w-full">
           <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
           >
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-12">
                <Sparkles className="h-4 w-4 text-[#E11D48]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Premium Access Activated</span>
              </div>

              <h1 className="text-6xl md:text-[120px] font-black leading-[0.85] tracking-tighter uppercase mb-12">
                 WELCOME BACK,<br />
                 <span className="text-[#E11D48] text-glow">{userName}</span>
              </h1>

              <div className="flex flex-wrap gap-12 mt-16 pt-16 border-t border-white/10">
                 <div>
                    <div className="text-4xl font-black">{eventStats.totalEvents || "120"}+</div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">New Shows This Week</p>
                 </div>
                 <div>
                    <div className="text-4xl font-black">24/7</div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Concierge Support</p>
                 </div>
                 <div>
                    <div className="text-4xl font-black">ULTRA</div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Member Tier</p>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Main Grid Interface */}
      <section className="py-24 bg-transparent border-y border-white/5">
         <div className="max-w-[1800px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/5 border border-white/5">
               {/* Quick Actions */}
               <div className="lg:col-span-4 p-16 bg-transparent border-r border-white/5 group hover:bg-white/5 transition-all">
                  <Activity className="h-12 w-12 text-[#E11D48] mb-12" />
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">QUICK ACTIONS</h3>
                  <div className="space-y-6">
                     <Button className="btn-primary w-full h-14 text-[10px]" asChild>
                        <Link to="/organizersignup">HOST NEW EVENT</Link>
                     </Button>
                     <Button className="btn-outline w-full h-14 text-[10px]" asChild>
                        <Link to="/mytickets">VIEW MY ORDERS</Link>
                     </Button>
                  </div>
               </div>

               {/* Discovery Feed Preview */}
               <div className="lg:col-span-8 p-0 bg-transparent overflow-hidden relative group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${img3})` }} />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                  <div className="relative p-16 h-full flex flex-col justify-end">
                     <h3 className="text-5xl font-black uppercase tracking-tighter mb-6">EXPLORE THE<br />DISCOVERY FEED</h3>
                     <p className="text-gray-300 max-w-md text-sm font-bold uppercase tracking-widest leading-relaxed mb-12">
                        Tailored live show recommendations based on your unique entertainment profile.
                     </p>
                     <Button className="w-fit btn-outline h-14 text-[10px] group-hover:bg-white group-hover:text-black transition-all" asChild>
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
      <section id="features" className="py-40 bg-transparent border-y border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
           <div className="text-center mb-32">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6 block">The Edge</span>
              <h2 className="text-5xl md:text-[100px] font-black text-white leading-none tracking-[-0.05em]">
                UNMATCHED<br />POWER
              </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
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
                <div key={i} className="p-16 bg-transparent group hover:bg-white/5 transition-colors duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-0 bg-[#E11D48] group-hover:h-full transition-all duration-500" />
                  <div className="mb-10 text-gray-600 group-hover:text-white transition-colors duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-6 text-white">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                    {f.desc}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Process Section (Added from Landing) */}
      <section id="about" className="py-40 bg-transparent">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
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
                 <img src={img3} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
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
         <div className="max-w-[1800px] mx-auto px-6 md:px-12 text-center">
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
      <footer className="bg-transparent text-white pt-40 pb-20 border-t border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-24 mb-40">
            <div className="lg:col-span-2">
               <h2 className="text-6xl md:text-9xl font-black mb-16 tracking-tighter uppercase leading-none">
                  THE HUB FOR<br /><span className="text-[#E11D48]">ELITE SHOWS</span>
               </h2>
               <div className="flex flex-wrap gap-8">
                  {['Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map(s => (
                    <a key={s} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors">{s}</a>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 lg:col-span-2">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-10">User Console</h4>
                  <ul className="space-y-6">
                    {['My Profile', 'Order History', 'Security', 'Preferences'].map(l => (
                      <li key={l}><a href="#" className="text-gray-500 hover:text-white font-bold transition-colors">{l}</a></li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-10">Global Support</h4>
                  <ul className="space-y-6">
                    {['Concierge', 'Help Center', 'API Status', 'Security Center'].map(l => (
                      <li key={l}><a href="#" className="text-gray-500 hover:text-white font-bold transition-colors">{l}</a></li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>

          {/* Contact Integration (Added from Landing) */}
          <div id="contactus" className="mb-40 scroll-mt-32">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <h3 className="text-4xl font-black">GET IN TOUCH</h3>
                <p className="text-gray-500 text-sm max-w-xs text-right uppercase font-bold tracking-widest">Our agents are available 24/7 for enterprise support.</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-12 md:p-20">
                <ContactUs />
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-white/10 gap-8">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
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
