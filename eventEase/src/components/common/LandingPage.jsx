import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Link, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar, Users, Shield, Zap, Star, ArrowRight, CheckCircle, Clock, MapPin, Ticket, Badge, Sparkles, Globe, ShieldCheck, BarChart3, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkModeToggle } from '@/contexts/DarkModeContext';
import { motion, useScroll, useTransform } from 'framer-motion';

// Assets
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import { UserFeedback } from '../user/UserFeedBack';
import { ViewEvents } from '../user/ViweEvents';
import { ContactUs } from './ContactUs';
import ChatBot from './ChatBot';

export const LandingPage = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const images = [img4, img2, img3, img1];

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/event/geteventstats');
        setEventStats(res.data || { totalEvents: 0, activeEvents: 0 });
      } catch (err) {
        console.error('Failed to fetch event stats', err);
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

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-rose-500/30 selection:text-rose-200 overflow-x-hidden">
      {/* Enhanced Navigation */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4'
        : 'bg-transparent py-8'
        }`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between px-6 md:px-12">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-10 h-10 bg-[#E11D48] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.5)] group-hover:scale-110 transition-transform">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase text-white group-hover:text-[#E11D48] transition-colors">EventEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            {['Home', 'Events', 'Features', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#E11D48] transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-8">
            <DarkModeToggle />
            <Link to="/signin" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Button
              className="btn-primary"
              asChild
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-black border-white/10 text-white w-full">
                <nav className="flex flex-col space-y-12 mt-20">
                  {['Home', 'Events', 'Features', 'About'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="text-4xl font-black uppercase tracking-tighter hover:text-[#E11D48] transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                  <div className="flex flex-col space-y-4 pt-12 border-t border-white/10">
                    <Button variant="outline" className="btn-outline w-full py-6 text-lg" asChild>
                      <Link to="/signin">Sign In</Link>
                    </Button>
                    <Button className="btn-primary w-full py-6 text-lg" asChild>
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: index === currentSlide ? 0.3 : 0,
                scale: index === currentSlide ? 1 : 1.1 
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-12">
              <div className="live-indicator" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Experience The Future of Events</span>
            </div>

            <h1 className="text-6xl md:text-[120px] font-black text-white mb-12 leading-[0.85] tracking-[-0.05em]">
              THE WORLD'S<br />
              <span className="text-white">PREMIER</span><br />
              <span className="text-[#E11D48] text-glow">EXPERIENCES</span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
              From sold-out stadium tours to exclusive gala experiences. 
              Manage, market, and sell with the industry standard.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                className="btn-primary text-sm h-16 px-12"
                asChild
              >
                <Link to="/organizersignup">
                  Host An Event
                </Link>
              </Button>
              <Button
                className="btn-outline text-sm h-16 px-12"
                asChild
              >
                <Link to="/events">Explore Shows</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Hero Footer Stats */}
        <div className="absolute bottom-12 left-0 w-full px-6 md:px-12 z-20">
          <div className="max-w-[1800px] mx-auto flex flex-wrap justify-between items-end gap-8">
            <div className="flex items-center gap-12">
              <div>
                <div className="text-3xl font-black text-white">{eventStats.totalEvents || "500"}+</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Global Events</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-3xl font-black text-white">1M+</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tickets Sold</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-500 ${index === currentSlide ? 'w-12 bg-[#E11D48]' : 'w-6 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shows Section */}
      <section id="events" className="relative py-40 bg-transparent">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-[#E11D48]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48]">Now Showing</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white leading-none">
                CURATED<br />SHOWS
              </h2>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-xs text-right">
              Discover the most anticipated events across the globe, from music to industry conferences.
            </p>
          </div>

          <div className="mb-20">
            <ViewEvents />
          </div>

          <div className="flex justify-center">
             <Button className="btn-outline group h-14" asChild>
                <Link to="/events" className="flex items-center">
                   View All Shows <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </Link>
             </Button>
          </div>
        </div>
      </section>

      {/* Features - The Edge */}
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
                  accent: "border-blue-500/20"
                },
                {
                  icon: <BarChart3 className="h-10 w-10" />,
                  title: "REAL-TIME INTEL",
                  desc: "Live sales tracking and audience behavior analytics.",
                  accent: "border-[#E11D48]/20"
                },
                {
                  icon: <ShieldCheck className="h-10 w-10" />,
                  title: "IRONCLAD SECURITY",
                  desc: "Bank-grade encryption and secure secondary market controls.",
                  accent: "border-emerald-500/20"
                },
                {
                  icon: <Globe className="h-10 w-10" />,
                  title: "GLOBAL NETWORK",
                  desc: "Reach audiences in over 150 countries with localized payments.",
                  accent: "border-purple-500/20"
                },
                {
                  icon: <Zap className="h-10 w-10" />,
                  title: "ZERO LATENCY",
                  desc: "High-concurrency infrastructure built for instant sold-out moments.",
                  accent: "border-orange-500/20"
                },
                {
                  icon: <Rocket className="h-10 w-10" />,
                  title: "VIP UPGRADES",
                  desc: "Integrated hospitality and premium experience management.",
                  accent: "border-pink-500/20"
                }
              ].map((f, i) => (
                <div key={i} className="p-16 bg-black group hover:bg-white/5 transition-colors duration-500 relative overflow-hidden">
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

      {/* Process Section */}
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
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E11D48] rounded-full flex items-center justify-center -z-10 blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-40 bg-transparent border-t border-white/5">
         <UserFeedback />
      </section>

      {/* Cinematic Footer */}
      <footer className="bg-transparent text-white pt-40 pb-20 border-t border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-24 mb-40">
            <div className="lg:col-span-2">
               <h2 className="text-6xl md:text-9xl font-black mb-16 tracking-tighter uppercase leading-none">
                  JOIN THE<br /><span className="text-[#E11D48]">REVOLUTION</span>
               </h2>
               <div className="flex flex-wrap gap-8">
                  {['Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map(s => (
                    <a key={s} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors">{s}</a>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 lg:col-span-2">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-10">Platform</h4>
                  <ul className="space-y-6">
                    {['Home', 'Shows', 'Analytics', 'Enterprise'].map(l => (
                      <li key={l}><a href="#" className="text-gray-500 hover:text-white font-bold transition-colors">{l}</a></li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-10">Support</h4>
                  <ul className="space-y-6">
                    {['Help Center', 'API Docs', 'Status', 'Legal'].map(l => (
                      <li key={l}><a href="#" className="text-gray-500 hover:text-white font-bold transition-colors">{l}</a></li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>

          {/* Contact Integration */}
          <div id="contactus" className="mb-40 scroll-mt-32">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <h3 className="text-4xl font-black">GET IN TOUCH</h3>
                <p className="text-gray-500 text-sm max-w-xs text-right uppercase font-bold tracking-widest">Our agents are available 24/7 for enterprise support.</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-12 md:p-20">
                <ContactUs />
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-white/5 gap-8">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
              © 2025 EventEase. The Standard in Live Entertainment.
            </p>
            <div className="flex items-center gap-12">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                <ShieldCheck className="h-4 w-4" /> Secure Platform
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                <Zap className="h-4 w-4" /> Ultra-Low Latency
              </span>
            </div>
          </div>
        </div>
      </footer>
      
      <ChatBot />
      <Outlet />
    </div>
  );
};
