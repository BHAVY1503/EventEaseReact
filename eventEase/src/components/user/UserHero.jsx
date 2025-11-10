import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  Calendar,
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
  Users,
  Activity,
  DoorOpen,
  Shield,
  MapPin,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "@/contexts/DarkModeContext";

// Custom Components
import { ViewEvents } from "./ViweEvents";
import { UserFeedback } from "./UserFeedBack";
import { ContactUs } from "../common/ContactUs";

// Assets
import img1 from "../../assets/img/hero-bg.jpg";
import img2 from "../../assets/img/page-title-bg.webp";
import img3 from "../../assets/img/speaker.jpg";
import img4 from "../../assets/img/event.webp";
import defaultprofile from "../../assets/profile.jpg";

export const UserHero = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [isScrolled, setIsScrolled] = useState(false);

  const heroImages = [img1, img2, img3, img4];

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/user/getuserbytoken", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.data;
        const name = user.fullName || user.name || "Guest";
        setUserName(name);
        setError("");
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch event stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/event/geteventstats");
        setEventStats(res.data);
      } catch (err) {
        console.error("Failed to fetch event stats", err);
      }
    };
    fetchStats();
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Navbar scroll animation
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      localStorage.clear();
      window.location.href = "/signin";
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                EventEase
              </h1>
              <DarkModeToggle />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant="ghost"
                className="hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => scrollToSection("home")}
              >
                <Home className="w-4 h-4 mr-2" /> Home
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400"
                onClick={() => scrollToSection("events")}
              >
                <Calendar className="w-4 h-4 mr-2" /> Events
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-400"
                onClick={() => scrollToSection("aboutus")}
              >
                <Users className="w-4 h-4 mr-2" /> About Us
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-700 dark:hover:text-pink-400"
                onClick={() => scrollToSection("contactus")}
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Contact
              </Button>
              <Link to="/mytickets">
                <Button
                  variant="ghost"
                  className="hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Ticket className="w-4 h-4 mr-2" /> My Tickets
                </Button>
              </Link>
              {/* <Button
                variant="ghost"
                className="text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 dark:text-red-400 hover:text-red-700"
                onClick={signout}
              >
                <DoorOpen className="w-4 h-4 mr-2" />
                LogOut
              </Button> */}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3">
              {error && (
                <Alert className="w-64 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-800 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="p-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={defaultprofile} />
                        <AvatarFallback className="bg-gradient-to-r from-red-500 to-purple-500 text-white font-semibold">
                          {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {loading ? "Loading..." : userName || "Guest"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Event Explorer
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700"
                >
                  <div className="px-3 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-medium dark:text-white">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Event Explorer
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/mytickets"
                      className="flex items-center hover:bg-red-50 dark:hover:bg-gray-800"
                    >
                      <Ticket className="w-4 h-4 mr-3 text-red-600" />
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={signout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-600" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div id="home" className="relative h-screen mt-16 overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(220,38,127,0.3)), url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Card className="bg-white/10 dark:bg-gray-900/70 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-12 text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Welcome, {userName || "User"}</h1>
              <p className="text-lg opacity-90 mb-8">
                Discover and enjoy incredible events with EventEase
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => scrollToSection("events")}
              >
                <Calendar className="w-5 h-5 mr-2" /> Explore Events
              </Button>
            </CardContent>
          </Card>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={prevSlide}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
          onClick={nextSlide}
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>

      {/* SECTIONS */}
      <section id="events" className="py-0 bg-gradient-to-b from-red-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 mt-2">
        <ViewEvents />
      </section>

      <section id="aboutus" className="py-20 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">About EventEase</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            EventEase is your gateway to finding and experiencing world-class events effortlessly.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="p-6 shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-black">
            <Activity className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Total Events</h3>
            <p className="text-3xl font-bold">{eventStats.totalEvents}</p>
          </Card>
          <Card className="p-6 shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-black">
            <Calendar className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Active Events</h3>
            <p className="text-3xl font-bold">{eventStats.activeEvents}</p>
          </Card>
          <Card className="p-6 shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-black">
            <Users className="w-10 h-10 text-pink-500 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Community</h3>
            <p className="text-lg">Join thousands of event enthusiasts!</p>
          </Card>
        </div>
      </section>
      <section id="features" className="py-20 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
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

      <section id="feedback" className="py-20 bg-gradient-to-b from-pink-50 to-red-50 dark:from-gray-800 dark:to-gray-800">
        <UserFeedback />
      </section>

      {/* <section id="contactus" className="py-20 bg-gradient-to-b from-white to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions or need support? We're here to help!
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-8">
              <ContactUs />
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* FOOTER */}
      <footer className="relative bg-gradient-to-br from-slate-100 via-red-100 to-purple-100 dark:from-slate-900 dark:via-red-900 dark:to-purple-900 text-gray-900 dark:text-white mt-1">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12 items-center mb-10">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
                  EventEase
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Discover and enjoy events effortlessly.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                © 2025 EventEase. All rights reserved.
              </p>
            </div>
            <div className="text-center">
              <h5 className="text-lg font-semibold mb-6">Quick Links</h5>
              <Button
                variant="ghost"
                className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition"
                onClick={() => scrollToSection("events")}
              >
                Browse Events
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition"
                onClick={() => scrollToSection("contactus")}
              >
                Contact Us
              </Button>
            </div>
            <div className="text-center md:text-right">
              <h5 className="text-lg font-semibold mb-6">Connect With Us</h5>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button variant="ghost" size="sm" className="rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-600/20 dark:hover:bg-gray-700">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-gray-700 dark:text-gray-300 hover:bg-sky-600/20 dark:hover:bg-gray-700">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-gray-700 dark:text-gray-300 hover:bg-pink-600/20 dark:hover:bg-gray-700">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 dark:border-white/10 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-10">
              Built with ❤️ for event lovers | EventEase
            </p>
          </div>
          <section id="contactus" className="py-20 bg-gradient-to-b from-white to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions or need support? We're here to help!
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-8">
              <ContactUs />
            </CardContent>
          </Card>
        </div>
      </section>
        </div>
      </footer>
      <Outlet />
    </div>
  );
};






// import React, { useEffect, useState } from 'react';
// import { Link, Outlet } from 'react-router-dom';
// import axios from 'axios';
// import { 
//   Menu, 
//   User, 
//   Calendar, 
//   Plus, 
//   MessageCircle, 
//   Ticket, 
//   LogOut,
//   ChevronDown,
//   Facebook,
//   Twitter,
//   Instagram,
//   ArrowLeft,
//   ArrowRight,
//   Home,
//   Activity,
//   Users,
//   Star,
//   DoorClosed,
//   DoorOpen
// } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from '@/components/ui/dropdown-menu';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Card, CardContent } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';

// // Import your existing components
// import { ViewEvents } from './ViweEvents';
// import { UserFeedback } from './UserFeedBack';
// import { ContactUs } from '../common/ContactUs';

// // Import your existing images
// import img1 from '../../assets/img/hero-bg.jpg';
// import img2 from '../../assets/img/page-title-bg.webp';
// import img3 from '../../assets/img/speaker.jpg';
// import img4 from '../../assets/img/event.webp';
// import defaultprofile from '../../assets/profile.jpg';
// import { DarkModeToggle } from '@/contexts/DarkModeContext';

// export const UserHero = () => {
//   const [userName, setUserName] = useState("");
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });

//   const heroImages = [img1, img2, img3, img4];

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No authentication token found");
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await axios.get("/user/getuserbytoken", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const user = res.data.data;
//         const name = user.fullName || user.name || "Guest";
//         setUserName(name);
//         setError("");
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         setError("Failed to load user data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await axios.get("/event/geteventstats");
//         setEventStats(res.data);
//       } catch (err) {
//         console.error("Failed to fetch event stats", err);
//       }
//     };

//     fetchStats();
//   }, []);

//   // Auto-slide carousel
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroImages.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [heroImages.length]);

//   const signout = () => {
//     if (window.confirm("Are you sure you want to SignOut?")) {
//       localStorage.clear();
//       window.location.href = "/signin";
//     }
//   };

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % heroImages.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//       {/* Modern Navigation Header */}
//       <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <div className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
//                 <Calendar className="w-5 h-5 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 EventEase
//               </h1>
//               <DarkModeToggle/>
//             </div>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-1">
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
//                 onClick={() => scrollToSection('home')}
//               >
//                 <Home className="w-4 h-4 mr-2" />
//                 Home
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
//                 onClick={() => scrollToSection('events')}
//               >
//                 <Calendar className="w-4 h-4 mr-2" />
//                 Events
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-green-50 hover:text-green-700 transition-colors"
//                 onClick={() => scrollToSection('aboutus')}
//               >
//                 <Users className="w-4 h-4 mr-2" />
//                 About Us
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
//                 onClick={() => scrollToSection('contactus')}
//               >
//                 <MessageCircle className="w-4 h-4 mr-2" />
//                 Contact
//               </Button>
//               <Link to="/mytickets">
//                 <Button 
//                   variant="ghost" 
//                   className="hover:bg-orange-50 hover:text-orange-700 transition-colors"
//                 >
//                   <Ticket className="w-4 h-4 mr-2" />
//                   My Tickets
//                 </Button>
//               </Link>
//                <Link to="/" onClick={signout}>
//                 <Button 
//                   variant="ghost" 
//                   className="text-red-400 hover:bg-orange-50 hover:text-orange-700 transition-colors"
//                 >
//                   <DoorOpen className='w-4 h-4 mr-2'/>
//                   {/* <Ticket className="w-4 h-4 mr-2" /> */}
//                   LogOut
//                 </Button>
//               </Link>
//             </div>

//             {/* User Profile & Actions */}
//             <div className="flex items-center space-x-3">
//               {/* Error Alert */}
//               {error && (
//                 <Alert className="w-64 border-red-200 bg-red-50">
//                   <AlertDescription className="text-red-800 text-sm">
//                     {error}
//                   </AlertDescription>
//                 </Alert>
//               )}
              
//               {/* User Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Card className="p-2 hover:shadow-md transition-shadow cursor-pointer border-gray-200/50">
//                     <div className="flex items-center space-x-3">
//                       <Avatar className="w-9 h-9 ring-2 ring-blue-100">
//                         <AvatarImage src={defaultprofile} />
//                         <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
//                           {userName ? userName.charAt(0).toUpperCase() : 'U'}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="hidden sm:block text-left">
//                         <p className="text-sm font-semibold text-gray-900">
//                           {loading ? 'Loading...' : userName || 'Guest'}
//                         </p>
//                         <p className="text-xs text-gray-500">Event Explorer</p>
//                       </div>
//                       <ChevronDown className="w-4 h-4 text-gray-500" />
//                     </div>
//                   </Card>
//                 </DropdownMenuTrigger>
                
//                 {/* Dropdown Menu Content - Shows when avatar is clicked */}
//                 <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50">
//                   {/* User Info Header */}
//                   <div className="px-3 py-2 border-b border-gray-200/50">
//                     <p className="text-sm font-medium text-gray-900">{userName}</p>
//                     <p className="text-xs text-gray-500">Event Explorer</p>
//                   </div>
                  
//                   {/* Menu Items */}
//                   <DropdownMenuItem asChild>
//                     <Link to="/mytickets" className="flex items-center cursor-pointer w-full px-3 py-2 hover:bg-blue-50">
//                       <Ticket className="w-4 h-4 mr-3 text-blue-600" />
//                       <span>My Tickets</span>
//                       <Badge variant="secondary" className="ml-auto text-xs">New</Badge>
//                     </Link>
//                   </DropdownMenuItem>
                  
//                   <DropdownMenuItem asChild>
//                     <button className="flex items-center cursor-pointer w-full px-3 py-2 hover:bg-gray-50">
//                       <User className="w-4 h-4 mr-3 text-gray-600" />
//                       <span>Profile Settings</span>
//                     </button>
//                   </DropdownMenuItem>
                  
//                   {/* Logout Button - Red styling for emphasis */}
//                   <DropdownMenuItem 
//                     onClick={signout} 
//                     className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer w-full px-3 py-2 flex items-center"
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     <span className="font-medium">Sign Out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Mobile Menu */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild className="md:hidden">
//                   <Button variant="outline" size="sm" className="border-gray-200">
//                     <Menu className="w-5 h-5" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-52 bg-white/95 backdrop-blur-sm">
//                   <DropdownMenuItem onClick={() => scrollToSection('home')}>
//                     <Home className="w-4 h-4 mr-3" />
//                     Home
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollToSection('events')}>
//                     <Calendar className="w-4 h-4 mr-3" />
//                     Events
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollToSection('aboutus')}>
//                     <Users className="w-4 h-4 mr-3" />
//                     About Us
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollToSection('contactus')}>
//                     <MessageCircle className="w-4 h-4 mr-3" />
//                     Contact
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link to="/mytickets" className="flex items-center">
//                       <Ticket className="w-4 h-4 mr-3" />
//                       My Tickets
//                     </Link>
//                   </DropdownMenuItem>
                  
//                   {/* Separator */}
//                   <div className="border-t border-gray-200 my-1"></div>
                  
//                   {/* Mobile Logout Button */}
//                   <DropdownMenuItem 
//                     onClick={signout} 
//                     className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     Sign Out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Carousel Section */}
//       <div id="home" className="relative h-screen mt-16 overflow-hidden">
//         {/* Carousel Background */}
//         <div className="relative w-full h-full">
//           {heroImages.map((img, index) => (
//             <div
//               key={index}
//               className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
//                 index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
//               }`}
//               style={{
//                 backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(59,130,246,0.4)), url(${img})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 backgroundAttachment: 'fixed'
//               }}
//             />
//           ))}
          
//           {/* Hero Content Overlay */}
//           <div className="absolute inset-0 flex items-center justify-center z-10">
//             <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
//               <CardContent className="p-12 text-center text-white">
//                 <div className="space-y-6">
//                   <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
//                     Welcome, {userName}!
//                   </Badge>
//                   <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
//                     Discover Amazing Events
//                   </h1>
//                   <p className="text-xl md:text-2xl font-light opacity-90 mb-8 max-w-2xl">
//                     Connect with your community and create unforgettable memories at events near you
//                   </p>
                  
//                   {/* Action Buttons */}
//                   <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                     <Button 
//                       size="lg" 
//                       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
//                       onClick={() => scrollToSection('events')}
//                     >
//                       <Calendar className="w-5 h-5 mr-2" />
//                       Explore Events
//                     </Button>
//                     <Button 
//                       size="lg" 
//                       variant="outline" 
//                       className="text-white border-white/50 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm"
//                       onClick={() => scrollToSection('aboutus')}
//                     >
//                       <Users className="w-5 h-5 mr-2" />
//                       Learn More
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
          
//           {/* Carousel Navigation */}
//           <Button
//             variant="ghost"
//             size="sm"
//             className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm"
//             onClick={prevSlide}
//           >
//             <ArrowLeft className="w-6 h-6" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm"
//             onClick={nextSlide}
//           >
//             <ArrowRight className="w-6 h-6" />
//           </Button>

//           {/* Slide Indicators */}
//           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
//             {heroImages.map((_, index) => (
//               <button
//                 key={index}
//                 className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                   index === currentSlide 
//                     ? 'bg-white shadow-lg scale-125' 
//                     : 'bg-white/50 hover:bg-white/75'
//                 }`}
//                 onClick={() => setCurrentSlide(index)}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Content Sections */}
//       <div className="relative">
//         {/* Events Section */}
//         <section id="events" className="py-0 bg-gradient-to-b from-white to-slate-50">
//           <ViewEvents />
//         </section>

//         {/* About Us Section */}
//         <section id="aboutus" className="py-20 bg-gradient-to-b from-slate-50 to-blue-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//               <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
//                 About EventEase
//               </Badge>
//               <h2 className="text-4xl font-bold text-gray-900 mb-4">
//                 Your Gateway to Amazing Events
//               </h2>
//               <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                 EventEase is your all-in-one platform for discovering, organizing, and managing events with ease. 
//                 Whether you're a passionate attendee or a professional organizer, EventEase connects people through 
//                 seamless, innovative event experiences.
//               </p>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
//               <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
//                 <CardContent className="p-8 text-center">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6">
//                     <Calendar className="w-8 h-8" />
//                   </div>
//                   <h3 className="text-2xl font-semibold text-gray-900 mb-2">Total Events</h3>
//                   <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                     {eventStats.totalEvents}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
//                 <CardContent className="p-8 text-center">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-6">
//                     <Activity className="w-8 h-8" />
//                   </div>
//                   <h3 className="text-2xl font-semibold text-gray-900 mb-2">Active Events</h3>
//                   <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
//                     {eventStats.activeEvents}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
//                 <CardContent className="p-8 text-center">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white mb-6">
//                     <Users className="w-8 h-8" />
//                   </div>
//                   <h3 className="text-2xl font-semibold text-gray-900 mb-2">Community</h3>
//                   <p className="text-lg text-gray-600">Join thousands of event enthusiasts!</p>
//                   <Button 
//                     variant="outline" 
//                     className="mt-4 hover:bg-orange-50 hover:text-orange-700 transition-colors"
//                     onClick={() => scrollToSection('events')}
//                   >
//                     Browse Events
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Features Showcase */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//               {[
//                 { 
//                   img: img1, 
//                   heading: "Empowering Events",
//                   text: "Connecting communities and making events effortless through innovative solutions."
//                 },
//                 { 
//                   img: img2, 
//                   heading: "Unforgettable Experiences",
//                   text: "A vibrant platform where ideas transform into memorable moments."
//                 },
//                 { 
//                   img: img3, 
//                   heading: "Your Journey Begins",
//                   text: "Start your journey to discover and attend the perfect events right here."
//                 }
//               ].map((item, i) => (
//                 <div key={i} className={`${i === 2 ? 'lg:col-span-2 flex justify-center' : ''}`}>
//                   <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 max-w-lg">
//                     <CardContent className="p-0">
//                       <div className="relative h-48 overflow-hidden rounded-t-lg">
//                         <img
//                           src={item.img}
//                           alt={item.heading}
//                           className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                       </div>
//                       <div className="p-6">
//                         <h3 className="text-xl font-bold text-gray-900 mb-3">{item.heading}</h3>
//                         <p className="text-gray-600 mb-4">{item.text}</p>
//                         <Button 
//                           variant="outline" 
//                           size="sm" 
//                           className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
//                           onClick={() => scrollToSection('events')}
//                         >
//                           Learn More
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* User Feedback Section */}
//         <section className="py-20 bg-gradient-to-b from-blue-50 to-purple-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             {/* <div className="text-center mb-16">
//               <Badge variant="outline" className="mb-4 bg-purple-50 text-purple-700 border-purple-200">
//                 Community Voices
//               </Badge>
//               <h2 className="text-4xl font-bold text-gray-900 mb-4">
//                 What Our Community Says
//               </h2>
//               <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                 Hear from event organizers and attendees who trust EventEase for their event needs
//               </p>
//             </div> */}
//             <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
//               <CardContent className="p-8">
//                 <UserFeedback />
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       </div>

//       {/* Modern Footer */}
//       <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute inset-0" style={{
//             backgroundImage: `radial-gradient(circle at 25% 25%, #60a5fa 0%, transparent 50%), 
//                              radial-gradient(circle at 75% 75%, #a855f7 0%, transparent 50%)`
//           }} />
//         </div>
        
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//           {/* Footer Header */}
//           <div className="grid md:grid-cols-3 gap-12 items-center mb-16">
//             <div className="text-center md:text-left">
//               <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
//                   <Calendar className="w-6 h-6 text-white" />
//                 </div>
//                 <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//                   EventEase
//                 </h4>
//               </div>
//               <p className="text-gray-300 text-sm mb-4">
//                 Your trusted partner for discovering amazing events and creating unforgettable experiences.
//               </p>
//               <p className="text-gray-400 text-xs">
//                 © 2025 EventEase. All rights reserved.
//               </p>
//             </div>
            
//             <div className="text-center">
//               <h5 className="text-lg font-semibold mb-6 text-gray-200">Quick Links</h5>
//               <div className="flex flex-col space-y-3">
//                 <Button 
//                   variant="ghost" 
//                   className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//                   onClick={() => scrollToSection('events')}
//                 >
//                   Browse Events
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//                   onClick={() => scrollToSection('aboutus')}
//                 >
//                   About Us
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//                   onClick={() => scrollToSection('contactus')}
//                 >
//                   Contact Support
//                 </Button>
//               </div>
//             </div>
            
//             <div className="text-center md:text-right">
//               <h5 className="text-lg font-semibold mb-6 text-gray-200">Connect With Us</h5>
//               <div className="flex justify-center md:justify-end space-x-4">
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-gray-300 hover:text-white hover:bg-blue-600/20 transition-colors rounded-full w-12 h-12"
//                 >
//                   <Facebook className="w-5 h-5" />
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-gray-300 hover:text-white hover:bg-sky-600/20 transition-colors rounded-full w-12 h-12"
//                 >
//                   <Twitter className="w-5 h-5" />
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-gray-300 hover:text-white hover:bg-pink-600/20 transition-colors rounded-full w-12 h-12"
//                 >
//                   <Instagram className="w-5 h-5" />
//                 </Button>
//               </div>
//               <p className="text-gray-400 text-sm mt-4">
//                 Follow us for the latest events and updates
//               </p>
//             </div>
//           </div>

//           {/* Contact Form Section */}
//           <div id="contactus" className="border-t border-white/10 pt-16">
//             <div className="text-center mb-12">
//               <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20">
//                 Get In Touch
//               </Badge>
//               <h3 className="text-3xl font-bold mb-4">
//                 Contact Us
//               </h3>
//               <p className="text-gray-300 max-w-2xl mx-auto">
//                 Have questions about events or need support? We're here to help you discover amazing experiences.
//               </p>
//             </div>
//             <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
//               <CardContent className="p-8">
//                 <ContactUs />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Footer Bottom */}
//           <div className="border-t border-white/10 mt-16 pt-8 text-center">
//             <p className="text-gray-400 text-sm">
//               Built with ❤️ for event enthusiasts worldwide | EventEase Platform
//             </p>
//           </div>
//         </div>
//       </footer>

//       {/* Router Outlet */}
//       <Outlet />
//     </div>
//   );
// };

