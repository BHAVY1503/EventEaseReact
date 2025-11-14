// The issue: All sections have py-0 (no padding), so they stack without separation
// Solution: Add proper padding and ensure each section takes full viewport or is properly spaced

// Key changes needed:
// 1. Change py-0 to proper padding (py-16 or py-20)
// 2. Make sure each section is distinctly separated
// 3. Fix the scroll behavior to account for the fixed navbar

import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { 
  Menu, 
  User, 
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
  DoorOpen
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Dark Mode Toggle (same context used by Admin)
import { DarkModeToggle } from "@/contexts/DarkModeContext";

// Import your existing components
import { AddEvent } from './AddEvent';
import { ViewMyEvent } from './ViewMyEvent';
import { UserFeedback } from '../user/UserFeedBack';
import  ViewEvents  from '../user/ViweEvents';
import { ContactUs } from '../common/ContactUs';

// Import your existing images
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import defaultprofile from '../../assets/img/testimonials-2.jpg';

export const OrganizerHeroPage = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const heroImages = [img3, img2, img1, img4];

  useEffect(() => {
    const fetchOrganizer = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("organizer/organizer/self", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = res.data.data;
        setUserName(user.name);
        setError("");
      } catch (error) {
        console.error("Error fetching organizer:", error);
        setError("Failed to load organizer data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      localStorage.clear();
      window.location.href = "/organizersignin";
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Account for fixed navbar height (64px = 16 * 4)
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-black">
      {/* Modern Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700 z-50 shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EventEase
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                className="hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={() => scrollToSection('home')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={() => scrollToSection('viewevent')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Events
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                onClick={() => scrollToSection('addevent')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                onClick={() => scrollToSection('contactus')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Link to="/bookingofmyevents">
                <Button 
                  variant="ghost" 
                  className="hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Tickets
                </Button>
              </Link>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Error Alert */}
              {error && (
                <Alert className="w-64 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="p-2 hover:shadow-md transition-shadow cursor-pointer border-gray-200/50 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9 ring-2 ring-blue-100 dark:ring-gray-700">
                        <AvatarImage src={defaultprofile} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {loading ? 'Loading...' : userName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Organizer</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                    </div>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm dark:border-gray-700">
                  <div className="px-3 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-medium dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Event Organizer</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/bookedtickets" className="flex items-center cursor-pointer">
                      <Ticket className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-300" />
                      <span>My Tickets</span>
                      <Badge variant="secondary" className="ml-auto">New</Badge>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signout} 
                    className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm dark:border-gray-700">
                  <DropdownMenuItem onClick={() => scrollToSection('home')}>
                    <Home className="w-4 h-4 mr-3" />
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection('viewevent')}>
                    <Calendar className="w-4 h-4 mr-3" />
                    My Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection('addevent')}>
                    <Plus className="w-4 h-4 mr-3" />
                    Add Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection('contactus')}>
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookingofmyevents" className="flex items-center">
                      <Ticket className="w-4 h-4 mr-3" />
                      Tickets
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel Section */}
      <div id="home" className="relative h-screen mt-16 overflow-hidden">
        {/* Carousel Background */}
        <div className="relative w-full h-full">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(59,130,246,0.3)), url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            />
          ))}
          
          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Card className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md border-white/20 dark:border-gray-700 shadow-2xl">
              <CardContent className="p-12 text-center text-white">
                <div className="space-y-6">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                    Welcome Back, {userName}!
                  </Badge>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Welcome Back!
                  </h1>
                  <p className="text-xl md:text-2xl font-light opacity-90 mb-8 max-w-2xl">
                    Manage your events with ease on EventEase - Your complete event management platform
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      onClick={() => scrollToSection('addevent')}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Event
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="text-black border-white/50 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      onClick={() => scrollToSection('viewevent')}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Manage Events
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Carousel Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm dark:hover:bg-gray-700"
            onClick={prevSlide}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm dark:hover:bg-gray-700"
            onClick={nextSlide}
          >
            <ArrowRight className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Sections - FIXED: Added proper padding */}
      <div className="relative">
        {/* Events Section */}
        <section id="events" className="py-0 bg-gradient-to-b from-white to-slate-50 dark:from-gray-700 dark:to-black">
          <ViewEvents />
        </section>

        {/* My Events Section - FIXED: Added scroll-mt for navbar offset */}
        {/* <section id="viewevent" className="py-16 scroll-mt-16 bg-gradient-to-b from-slate-50 to-blue-50 dark:from-black dark:to-black">
          <ViewMyEvent />
        </section> */}

        {/* Add Event Section - FIXED: Added scroll-mt for navbar offset */}
        <section id="addevent" className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-black">
          <AddEvent />
        </section>


        {/* My Events Section - FIXED: Added scroll-mt for navbar offset */}
        <section id="viewevent" className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-black">
          <ViewMyEvent />
        </section>

        {/* User Feedback Section */}
        <section className="py-16 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-black dark:to-black">
          <UserFeedback />
        </section>
      </div>

      {/* Modern Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden dark:bg-gray-900 dark:text-gray-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #60a5fa 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #a855f7 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Footer Header */}
          <div className="grid md:grid-cols-3 gap-12 items-center mb-16">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EventEase
                </h4>
              </div>
              <p className="text-gray-300 dark:text-gray-400 text-sm mb-4">
                Your trusted partner for seamless event management and unforgettable experiences.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                © 2025 EventEase. All rights reserved.
              </p>
            </div>
            
            <div className="text-center">
              <h5 className="text-lg font-semibold mb-6 text-gray-200 dark:text-gray-300">Quick Links</h5>
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => scrollToSection('events')}
                >
                  Browse Events
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => scrollToSection('contactus')}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                >
                  Privacy Policy
                </Button>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h5 className="text-lg font-semibold mb-6 text-gray-200 dark:text-gray-300">Connect With Us</h5>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-blue-600/20 dark:hover:bg-gray-800 transition-colors rounded-full w-12 h-12"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-sky-600/20 dark:hover:bg-gray-800 transition-colors rounded-full w-12 h-12"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-pink-600/20 dark:hover:bg-gray-800 transition-colors rounded-full w-12 h-12"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-gray-400 dark:text-gray-400 text-sm mt-4">
                Follow us for updates and event highlights
              </p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div id="contactus" className="border-t border-white/10 dark:border-gray-700 pt-16 scroll-mt-16">
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

          {/* Footer Bottom */}
          <div className="border-t border-white/10 dark:border-gray-700 mt-16 pt-8 text-center">
            <p className="text-gray-400 dark:text-gray-400 text-sm">
              Built with ❤️ for event organizers worldwide | EventEase Platform
            </p>
          </div>
        </div>
      </footer>

      {/* Router Outlet */}
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

// // Dark Mode Toggle (same context used by Admin)
// import { DarkModeToggle } from "@/contexts/DarkModeContext";

// // Import your existing components
// import { AddEvent } from './AddEvent';
// import { ViewMyEvent } from './ViewMyEvent';
// import { UserFeedback } from '../user/UserFeedBack';
// import { ViewEvents } from '../user/ViweEvents';
// import { ContactUs } from '../common/ContactUs';

// // Import your existing images
// import img1 from '../../assets/img/hero-bg.jpg';
// import img2 from '../../assets/img/page-title-bg.webp';
// import img3 from '../../assets/img/speaker.jpg';
// import img4 from '../../assets/img/event.webp';
// import defaultprofile from '../../assets/img/testimonials-2.jpg';

// export const OrganizerHeroPage = () => {
//   const [userName, setUserName] = useState("");
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const heroImages = [img3, img2, img1, img4];

//   useEffect(() => {
//     const fetchOrganizer = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No authentication token found");
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await axios.get("organizer/organizer/self", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const user = res.data.data;
//         setUserName(user.name);
//         setError("");
//       } catch (error) {
//         console.error("Error fetching organizer:", error);
//         setError("Failed to load organizer data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrganizer();
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
//       window.location.href = "/organizersignin";
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
//     // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900 dark:text-gray-100 text-gray-900 transition-colors">
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-black">
//       {/* Modern Navigation Header */}
//       <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700 z-50 shadow-lg transition-colors">
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
//             </div>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-1">
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
//                 onClick={() => scrollToSection('home')}
//               >
//                 <Home className="w-4 h-4 mr-2" />
//                 Home
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
//                 onClick={() => scrollToSection('viewevent')}
//               >
//                 <Calendar className="w-4 h-4 mr-2" />
//                 My Events
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 dark:hover:text-green-300 transition-colors"
//                 onClick={() => scrollToSection('addevent')}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Event
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
//                 onClick={() => scrollToSection('contactus')}
//               >
//                 <MessageCircle className="w-4 h-4 mr-2" />
//                 Contact
//               </Button>
//               <Link to="/bookingofmyevents">
//                 <Button 
//                   variant="ghost" 
//                   className="hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
//                 >
//                   <Ticket className="w-4 h-4 mr-2" />
//                   Tickets
//                 </Button>
//               </Link>
//                 {/* <Link to="/" onClick={signout}>
//                    <Button variant="ghost" className="text-red-400 dark:text-red-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
//                               >
//                    <DoorOpen className='w-4 h-4 mr-2'/>
//                                 LogOut
//                   </Button>
//                  </Link> */}
//             </div>

//             {/* User Profile & Actions */}
//             <div className="flex items-center space-x-3">
//               {/* Dark Mode Toggle */}
//               <DarkModeToggle />

//               {/* Error Alert */}
//               {error && (
//                 <Alert className="w-64 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
//                   <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
//                     {error}
//                   </AlertDescription>
//                 </Alert>
//               )}
              
//               {/* User Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Card className="p-2 hover:shadow-md transition-shadow cursor-pointer border-gray-200/50 dark:border-gray-700 dark:bg-gray-800">
//                     <div className="flex items-center space-x-3">
//                       <Avatar className="w-9 h-9 ring-2 ring-blue-100 dark:ring-gray-700">
//                         <AvatarImage src={defaultprofile} />
//                         <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
//                           {userName ? userName.charAt(0).toUpperCase() : 'U'}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="hidden sm:block text-left">
//                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                           {loading ? 'Loading...' : userName || 'User'}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Organizer</p>
//                       </div>
//                       <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300" />
//                     </div>
//                   </Card>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm dark:border-gray-700">
//                   <div className="px-3 py-2 border-b dark:border-gray-700">
//                     <p className="text-sm font-medium dark:text-white">{userName}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Event Organizer</p>
//                   </div>
//                   <DropdownMenuItem asChild>
//                     <Link to="/bookedtickets" className="flex items-center cursor-pointer">
//                       <Ticket className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-300" />
//                       <span>My Tickets</span>
//                       <Badge variant="secondary" className="ml-auto">New</Badge>
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem 
//                     onClick={signout} 
//                     className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     Sign Out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Mobile Menu */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild className="md:hidden">
//                   <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
//                     <Menu className="w-5 h-5" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm dark:border-gray-700">
//                   <DropdownMenuItem onClick={() => scrollToSection('home')}>
//                     <Home className="w-4 h-4 mr-3" />
//                     Home
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollToSection('viewevent')}>
//                     <Calendar className="w-4 h-4 mr-3" />
//                     My Events
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollToSection('addevent')}>
//                     <Plus className="w-4 h-4 mr-3" />
//                     Add Event
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => scrollToSection('contactus')}>
//                     <MessageCircle className="w-4 h-4 mr-3" />
//                     Contact
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link to="/bookingofmyevents" className="flex items-center">
//                       <Ticket className="w-4 h-4 mr-3" />
//                       Tickets
//                     </Link>
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
//                 backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(59,130,246,0.3)), url(${img})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 backgroundAttachment: 'fixed'
//               }}
//             />
//           ))}
          
//           {/* Hero Content Overlay */}
//           <div className="absolute inset-0 flex items-center justify-center z-10">
//             <Card className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md border-white/20 dark:border-gray-700 shadow-2xl">
//               <CardContent className="p-12 text-center text-white">
//                 <div className="space-y-6">
//                   <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
//                     Welcome Back, {userName}!
//                   </Badge>
//                   <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
//                     Welcome Back!
//                   </h1>
//                   <p className="text-xl md:text-2xl font-light opacity-90 mb-8 max-w-2xl">
//                     Manage your events with ease on EventEase - Your complete event management platform
//                   </p>
                  
//                   {/* Action Buttons */}
//                   <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                     <Button 
//                       size="lg" 
//                       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
//                       onClick={() => scrollToSection('addevent')}
//                     >
//                       <Plus className="w-5 h-5 mr-2" />
//                       Create New Event
//                     </Button>
//                     <Button 
//                       size="lg" 
//                       variant="outline" 
//                       className="text-black border-white/50 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
//                       onClick={() => scrollToSection('viewevent')}
//                     >
//                       <Calendar className="w-5 h-5 mr-2" />
//                       Manage Events
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
//             className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm dark:hover:bg-gray-700"
//             onClick={prevSlide}
//           >
//             <ArrowLeft className="w-6 h-6" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm dark:hover:bg-gray-700"
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
//         <section id="events" className="py-0 bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-black ">
//                 <ViewEvents />
            
//         </section>

//         {/* My Events Section */}
//         <section id="viewevent" className="py-0 bg-gradient-to-b from-slate-50 to-blue-50  dark:from-black dark:to-black">
//                 <ViewMyEvent />
//         </section>

//         {/* Add Event Section */}
//         <section id="addevent" className="py-0 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-black dark:to-black">
//                 <AddEvent />
//         </section>

//         {/* User Feedback Section */}
//         <section className="py-0 bg-gradient-to-b from-purple-50 to-pink-50  dark:from-black dark:to-black">
//                 <UserFeedback />
//           {/* </div> */}
//         </section>
//       </div>

//       {/* Modern Footer */}
//       <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden dark:bg-gray-900 dark:text-gray-300">
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
//               <p className="text-gray-300 dark:text-gray-400 text-sm mb-4">
//                 Your trusted partner for seamless event management and unforgettable experiences.
//               </p>
//               <p className="text-gray-400 dark:text-gray-500 text-xs">
//                 © 2025 EventEase. All rights reserved.
//               </p>
//             </div>
            
//             <div className="text-center">
//               <h5 className="text-lg font-semibold mb-6 text-gray-200 dark:text-gray-300">Quick Links</h5>
//               <div className="flex flex-col space-y-3">
//                 <Button 
//                   variant="ghost" 
//                   className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
//                   onClick={() => scrollToSection('events')}
//                 >
//                   Browse Events
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
//                   onClick={() => scrollToSection('contactus')}
//                 >
//                   Contact Support
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
//                 >
//                   Privacy Policy
//                 </Button>
//               </div>
//             </div>
            
//             <div className="text-center md:text-right">
//               <h5 className="text-lg font-semibold mb-6 text-gray-200 dark:text-gray-300">Connect With Us</h5>
//               <div className="flex justify-center md:justify-end space-x-4">
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-blue-600/20 dark:hover:bg-gray-800 transition-colors rounded-full w-12 h-12"
//                 >
//                   <Facebook className="w-5 h-5" />
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-sky-600/20 dark:hover:bg-gray-800 transition-colors rounded-full w-12 h-12"
//                 >
//                   <Twitter className="w-5 h-5" />
//                 </Button>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   className="text-gray-300 dark:text-gray-300 hover:text-white hover:bg-pink-600/20 dark:hover:bg-gray-800 transition-colors rounded-full w-12 h-12"
//                 >
//                   <Instagram className="w-5 h-5" />
//                 </Button>
//               </div>
//               <p className="text-gray-400 dark:text-gray-400 text-sm mt-4">
//                 Follow us for updates and event highlights
//               </p>
//             </div>
//           </div>

//           {/* Contact Form Section */}
//           <div id="contactus" className="border-t border-white/10 dark:border-gray-700 pt-16">
//             <div className="text-center mb-12">
//               <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20 dark:bg-transparent dark:border-gray-700">
//                 Get In Touch
//               </Badge>
//               <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
//                 Contact Us
//               </h3>
//               <p className="text-gray-300 dark:text-gray-400 max-w-2xl mx-auto">
//                 Have questions or need support? We're here to help you create amazing events.
//               </p>
//             </div>
//             <Card className="bg-white/5 dark:bg-gray-800/60 backdrop-blur-md border-white/10 dark:border-gray-700 shadow-2xl">
//               <CardContent className="p-8">
//                 <ContactUs />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Footer Bottom */}
//           <div className="border-t border-white/10 dark:border-gray-700 mt-16 pt-8 text-center">
//             <p className="text-gray-400 dark:text-gray-400 text-sm">
//               Built with ❤️ for event organizers worldwide | EventEase Platform
//             </p>
//           </div>
//         </div>
//       </footer>

//       {/* Router Outlet */}
//       <Outlet />
//     </div>
//   );
// };





