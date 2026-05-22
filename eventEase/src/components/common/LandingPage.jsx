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
import '../../styles/pages/LandingPage.css';
import "@/styles/common/Common.css";

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
    <div className="landing-container">
      {/* Enhanced Navigation */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-content">
          <Link to="/" className="flex items-center space-x-4 group bg-transparent border-none">
            <div className="w-10 h-10 bg-[#E11D48] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.5)] group-hover:scale-110 transition-transform">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase text-slate-900 dark:text-white group-hover:text-[#E11D48] transition-colors">EventEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            {['Home', 'Events', 'Features', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all relative group no-underline"
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#E11D48] transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-8">
            <DarkModeToggle />
            <Link to="/signin" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
              Sign In
            </Link>
            <Button
              className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-black uppercase tracking-widest text-[10px] px-8 h-10 rounded-full border-none shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all hover:scale-105"
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
                      className="text-4xl font-black uppercase tracking-tighter hover:text-[#E11D48] transition-colors no-underline text-white"
                    >
                      {item}
                    </a>
                  ))}
                  <div className="flex flex-col space-y-4 pt-12 border-t border-white/10">
                    <Button variant="outline" className="w-full py-6 text-lg bg-transparent border-white/20 text-white hover:bg-white hover:text-black font-black uppercase tracking-widest" asChild>
                      <Link to="/signin">Sign In</Link>
                    </Button>
                    <Button className="w-full py-6 text-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-black uppercase tracking-widest border-none" asChild>
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
      <section className="hero-viewport-landing">
        {/* Dynamic Background */}
        <div className="hero-bg-layer">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: index === currentSlide ? 0.3 : 0,
                scale: index === currentSlide ? 1 : 1.1 
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="hero-slide-img dynamic-bg"
              style={{ '--bg-image': `url(${img})` }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </motion.div>
          ))}
          <div className="hero-vignette-overlay" />
          <div className="hero-gradient-layer" />
        </div>

        {/* Hero Content */}
        <div className="hero-content-landing">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="live-indicator-wrapper">
              <div className="live-indicator" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900/80 dark:text-white/80">Experience The Future of Events</span>
            </div>

            <h1 className="hero-title-landing">
              THE WORLD'S<br />
              <span className="text-slate-900 dark:text-white">PREMIER</span><br />
              <span className="text-[#E11D48] text-glow">EXPERIENCES</span>
            </h1>

            <p className="hero-subtitle-landing">
              From sold-out stadium tours to exclusive gala experiences. 
              Manage, market, and sell with the industry standard.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pb-32 sm:pb-0">
              <Button
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-black uppercase tracking-widest h-16 px-12 rounded-full border-none text-sm transition-all hover:scale-105 shadow-xl hover:shadow-[#E11D48]/20"
                asChild
              >
                <Link to="/organizersignup">
                  Host An Event
                </Link>
              </Button>
              <Button
                className="bg-transparent hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black text-slate-900 dark:text-white font-black uppercase tracking-widest h-16 px-12 rounded-full border border-slate-900/20 dark:border-white/20 text-sm transition-all hover:scale-105 shadow-xl"
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
                <div className="text-3xl font-black text-slate-900 dark:text-white">{eventStats.totalEvents || "500"}+</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Global Events</div>
              </div>
              <div className="w-px h-10 bg-slate-900/10 dark:bg-white/10" />
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">1M+</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tickets Sold</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-500 border-none cursor-pointer ${index === currentSlide ? 'w-12 bg-[#E11D48]' : 'w-6 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shows Section */}
      <section id="events" className="featured-section-landing">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <ViewEvents />
        </div>
      </section>

      {/* Features - The Edge */}
      <section id="features" className="edge-section">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
           <div className="text-center mb-32">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6 block">The Edge</span>
              <h2 className="text-5xl md:text-[100px] font-black text-slate-900 dark:text-white leading-none tracking-[-0.05em]">
                UNMATCHED<br />POWER
              </h2>
           </div>

           <div className="edge-grid">
              {[
                {
                  icon: <Ticket className="h-10 w-10" />,
                  title: "SMART TICKETING",
                  desc: "Precision dynamic pricing and bulk allocation systems for scale.",
                },
                {
                  icon: <BarChart3 className="h-10 w-10" />,
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
                <div key={i} className="edge-item group">
                  <div className="edge-accent-bar" />
                  <div className="edge-icon-box group-hover:text-white">
                    {f.icon}
                  </div>
                  <h3 className="edge-item-title">{f.title}</h3>
                  <p className="edge-item-desc group-hover:text-gray-300">
                    {f.desc}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="about" className="process-section">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="process-grid">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-8 block">Our Process</span>
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white leading-none mb-12">
                FROM CONCEPT<br />TO STAGE
              </h2>
              <div className="space-y-16">
                {[
                  { step: "01", title: "Curation", desc: "Build your event with our high-fidelity tools." },
                  { step: "02", title: "Activation", desc: "Launch marketing and open global sales channels." },
                  { step: "03", title: "Execution", desc: "Real-time entry management and live analytics." }
                ].map((item, i) => (
                  <div key={i} className="process-step group">
                    <span className="step-number group-hover:text-[#E11D48] transition-colors">{item.step}</span>
                    <div>
                      <h4 className="step-title">{item.title}</h4>
                      <p className="step-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="process-visual-wrapper">
              <div className="visual-container group">
                 <img src={img3} alt="Stage" className="visual-img group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                 <div className="visual-overlay-text">
                    THE STAGE<br />IS YOURS
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E11D48] rounded-full flex items-center justify-center -z-10 blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-20 bg-transparent border-t border-border">
         <UserFeedback />
      </section>

      {/* Cinematic Footer */}
      <footer className="landing-footer">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="footer-top-row">
            <div className="lg:col-span-2">
               <h2 className="footer-brand-heading">
                  JOIN THE<br /><span className="text-[#E11D48]">REVOLUTION</span>
               </h2>
               <div className="flex flex-wrap gap-8">
                  {['Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map(s => (
                    <a key={s} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors no-underline">{s}</a>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 lg:col-span-2">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-10">Platform</h4>
                  <ul className="space-y-6 list-none p-0">
                    {['Home', 'Shows', 'Analytics', 'Enterprise'].map(l => (
                      <li key={l}><a href="#" className="text-gray-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors no-underline">{l}</a></li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E11D48] mb-10">Support</h4>
                  <ul className="space-y-6 list-none p-0">
                    {['Help Center', 'API Docs', 'Status', 'Legal'].map(l => (
                      <li key={l}><a href="#" className="text-gray-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors no-underline">{l}</a></li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>

          {/* Contact Integration */}
          <div id="contactus" className="mb-20 scroll-mt-32">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <h3 className="text-4xl font-black">GET IN TOUCH</h3>
                <p className="text-gray-500 text-sm max-w-xs text-right uppercase font-bold tracking-widest">Our agents are available 24/7 for enterprise support.</p>
             </div>
             <div className="bg-card border border-border p-12 md:p-20">
                <ContactUs />
             </div>
          </div>

          <div className="footer-bottom-row-landing">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest m-0">
              © 2025 EventEase. The Standard in Live Entertainment.
            </p>
            <div className="badge-group">
              <span className="badge-item">
                <ShieldCheck className="h-4 w-4" /> Secure Platform
              </span>
              <span className="badge-item">
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
