
import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar, Users, Shield, Zap, Star, ArrowRight, CheckCircle, Clock, MapPin, Ticket, Badge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkModeToggle } from '@/contexts/DarkModeContext';

// Import images (make sure these paths are correct in your project)
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import { UserFeedback } from '../user/UserFeedBack';
import  ViewEvents  from '../user/ViweEvents';
import { ContactUs } from './ContactUs';

export const LandingPage = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const images = [img4, img2, img3, img1];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/event/geteventstats");
        const data = await res.json();
        setEventStats(data);
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
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Enhanced Navigation */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className={`font-bold text-2xl transition-colors ${
              isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
            }`}>EventEase</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Features', 'Events', 'About'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className={`text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  isScrolled 
                    ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 bg-white dark:bg-gray-900">
                <nav className="flex flex-col space-y-6 mt-8">
                  {['Home', 'Features', 'Events', 'About'].map((item) => (
                    <a 
                      key={item}
                      href={`#${item.toLowerCase()}`} 
                      className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                  <div className="flex flex-col space-y-3 pt-6 border-t dark:border-gray-700">
                    <Button variant="outline" size="lg" asChild className="dark:border-gray-700 dark:hover:bg-gray-800">
                      <Link to="/signin">Sign In</Link>
                    </Button>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
            <Button 
              variant="ghost" 
              size="lg"
              className={`font-medium transition-all ${
                isScrolled 
                  ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800' 
                  : 'text-white hover:text-blue-200 hover:bg-white/10'
              }`}
              asChild
            >
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              asChild
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            </div>
          ))}
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 dark:bg-white/20 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Star className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">Trusted by 10,000+ event organizers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Events,
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Simplified</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            From intimate gatherings to massive concerts - create, manage, and sell tickets for any event with our all-in-one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-lg"
              asChild
            >
              <Link to="/organizersignup">
                Create Your Event
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-gray-700 hover:bg-white/10 backdrop-blur-md font-semibold px-8 py-4 rounded-full text-lg dark:text-gray-100 "
              asChild
            >
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-400 mr-2" />
              <span>Real-time analytics</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-purple-400 mr-2" />
              <span>Data protection</span>
            </div>
          </div>
        </div>

        
        
        {/* Carousel Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

        <section className="py-3 bg-gray-50 dark:bg-gray-800" >
        <ViewEvents/>
        </section>

      {/* Features Section */}
      <section className="py-24 mb-0 bg-gray-50 dark:bg-gray-800" id="features">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful tools and features designed to make event management effortless and ticket sales seamless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Ticket className="h-8 w-8" />,
                title: "Smart Ticketing",
                description: "Dynamic pricing, bulk discounts, and customizable ticket types for every event size.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Audience Insights",
                description: "Detailed analytics and attendee data to help you understand and grow your audience.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure Payments",
                description: "Bank-level security with multiple payment options and instant payouts.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Event Management",
                description: "Comprehensive tools for planning, promoting, and managing events of any scale.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: "Venue Integration",
                description: "Seamless venue booking and management with our partner network.",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Real-time Updates",
                description: "Live notifications, instant updates, and real-time sales tracking.",
                color: "from-indigo-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 text-white" id="about">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by event creators worldwide
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of successful event organizers who have chosen EventEase as their go-to platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                number: eventStats.totalEvents || "500+", 
                label: "Events Created",
                icon: <Calendar className="h-8 w-8" />
              },
              { 
                number: eventStats.activeEvents || "150+", 
                label: "Active Events",
                icon: <Zap className="h-8 w-8" />
              },
              { 
                number: "1M+", 
                label: "Tickets Sold",
                icon: <Ticket className="h-8 w-8" />
              },
              { 
                number: "10K+", 
                label: "Happy Organizers",
                icon: <Users className="h-8 w-8" />
              }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* How It Works Section */}
      {/* <section className="py-24 bg-white dark:bg-gray-800" id="events"> */}
      <section className="py-00 bg-gray-50 dark:bg-gray-800" id="about">
      {/* <section className="py-20 bg-gradient-to-br  via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 text-white" id="events"> */}

        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get started in 3 simple steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From concept to sold-out event, our platform guides you through every step of the journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Event",
                description: "Set up your event in minutes with our intuitive event builder. Add details, upload images, and configure your ticket types.",
                image: img4,
                features: ["Event customization", "Ticket configuration", "Venue selection"]
              },
              {
                step: "02", 
                title: "Promote & Sell",
                description: "Share your event across social media, embed tickets on your website, and track sales with real-time analytics.",
                image: img3,
                features: ["Social media integration", "Sales tracking", "Marketing tools"]
              },
              {
                step: "03",
                title: "Manage & Execute",
                description: "Check-in attendees, manage your event day operations, and analyze post-event metrics for future success.",
                image: img1,
                features: ["Mobile check-in", "Live dashboard", "Event analytics"]
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-gray-100 dark:border-gray-700">
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{step.description}</p>
                  
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Connecting line */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-24 -right-6 w-12 h-px bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-600 dark:to-purple-600 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
        <section id="feedback" className="py-00 bg-gradient-to-b from-gray-850  dark:from-gray-800 dark:to-gray-800 overflow-hidden">
                      <UserFeedback/>
                    </section>
      </section>

<footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-950 dark:via-gray-900 dark:to-black text-white py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Ticket className="h-7 w-7 text-white" />
                </div>
                <span className="font-bold text-2xl">EventEase</span>
              </div>
              <p className="text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
                The modern platform for creating, managing, and selling tickets to unforgettable events.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 bg-gray-800 dark:bg-gray-900 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Platform</h4>
              <ul className="space-y-3">
                {['Create Events', 'Sell Tickets', 'Event Analytics', 'Mobile App'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact Us', 'API Documentation', 'System Status'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Stay Updated</h4>
              <p className="text-gray-400 dark:text-gray-500 mb-4">Get the latest updates and event tips.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 rounded-l-lg focus:outline-none focus:border-blue-500 text-white"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-r-lg">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
            
             {/* Contact Form Section */}
          <div id="contactus" className="border-t border-white/10 dark:border-gray-700 pt-0 scroll-mt-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20 dark:bg-transparent dark:border-gray-700">
                Get In Touch
              </Badge>
              <h3 className="text-3xl font-bold mb-4 text-white dark:text-gray-100">
                Contact Us
              </h3>
              <p className="text-gray-300 dark:text-gray-400 max-w-2xl mx-auto">
                Have questions or need support? We're here to help you create amazing events.
              </p>
            </div>
            <Card className="bg-white/5 dark:bg-gray-800/60 backdrop-blur-md border-white/10 dark:border-gray-700 shadow-2xl">
              <CardContent className="p-8">
                <ContactUs />
              </CardContent>
            </Card>
          </div>

          
          <div className="border-t border-gray-800 dark:border-gray-900 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4 md:mb-0">
                © 2025 EventEase. All rights reserved. | Privacy Policy | Terms of Service
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400 dark:text-gray-500">
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure Platform
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  99.9% Uptime
                </span>
              </div>
               
            </div>
          </div>
        </div>
        
      </footer>

      <Outlet />
    </div>
  );
};






