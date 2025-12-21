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
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Building2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Dark Mode Toggle
import { DarkModeToggle } from "@/contexts/DarkModeContext";

// Import components
import { AddEvent } from './AddEvent';
import { ViewMyEvent } from './ViewMyEvent';
import { UserFeedback } from '../user/UserFeedBack';
import ViewEvents from '../user/ViweEvents';
import { ContactUs } from '../common/ContactUs';

// Import images
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import defaultprofile from '../../assets/img/testimonials-2.jpg';
import ViewEventsOrg from './ViewEventsOrg';

export const OrganizerDashboard = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const sidebarItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "events", label: "Browse Events", icon: Eye },
    { id: "addevent", label: "Add Event", icon: Plus },
    { id: "viewevent", label: "My Events", icon: Calendar },
    { id: "feedback", label: "User Feedback", icon: Star },
    { id: "contactus", label: "Contact Us", icon: MessageCircle },
  ];

  const quickLinks = [
    { to: "/bookingofmyevents", label: "Event Tickets", icon: Ticket },
    { to: "/bookedtickets", label: "My Tickets", icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* FIXED LEFT SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 overflow-y-auto ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      EventEase
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organizer Panel</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full ${
                    sidebarCollapsed ? "justify-center px-2" : "justify-start px-4"
                  } h-12 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 transition-colors group`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <item.icon className={`w-5 h-5 ${sidebarCollapsed ? "" : "mr-3"} flex-shrink-0`} />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Button>
              ))}
            </div>

            {/* Quick Links Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {!sidebarCollapsed && (
                <p className="px-4 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quick Links
                </p>
              )}
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant="ghost"
                      className={`w-full ${
                        sidebarCollapsed ? "justify-center px-2" : "justify-start px-4"
                      } h-12 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400 transition-colors`}
                      title={sidebarCollapsed ? link.label : ""}
                    >
                      <link.icon className={`w-5 h-5 ${sidebarCollapsed ? "" : "mr-3"} flex-shrink-0`} />
                      {!sidebarCollapsed && <span className="text-sm font-medium">{link.label}</span>}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={signout}
              className={`w-full ${
                sidebarCollapsed ? "justify-center px-2" : "justify-start px-4"
              } h-12 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700`}
              title={sidebarCollapsed ? "Sign Out" : ""}
            >
              <LogOut className={`w-5 h-5 ${sidebarCollapsed ? "" : "mr-3"}`} />
              {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* NAVBAR */}
        <nav
          className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 shadow-md"
              : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          }`}
          style={{ 
            left: sidebarCollapsed ? "5rem" : "18rem",
            width: sidebarCollapsed ? "calc(100% - 5rem)" : "calc(100% - 18rem)"
          }}
        >
          <div className="px-6">
            <div className="flex justify-between items-center h-16">
              {/* Page Title */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome Back, {userName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your events with ease
                </p>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                <DarkModeToggle />

                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900">
                        <AvatarImage />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700"
                  >
                    <div className="px-3 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-medium dark:text-white">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Event Organizer</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/bookedtickets" className="flex items-center cursor-pointer">
                        <Ticket className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                        My Tickets
                        <Badge variant="secondary" className="ml-auto">New</Badge>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signout}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <div id="home" className="relative h-screen mt-16 overflow-hidden">
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
            <Card className="bg-white/10 dark:bg-gray-900/70 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-12 text-center text-white">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                  Welcome Back, {userName}!
                </Badge>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Welcome Back!
                </h1>
                <p className="text-lg opacity-90 mb-8 max-w-2xl">
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
                    className="text-black border-white/50 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white bg-white"
                    onClick={() => scrollToSection('viewevent')}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Manage Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Carousel Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={prevSlide}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm"
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

        {/* MAIN SECTIONS */}
        <section id="events" className="py-0 bg-gradient-to-b from-gray-50 to-gray-50 dark:bg-gray-800">
          <ViewEventsOrg/>
        </section>

        <section id="addevent" className="py-0 bg-gradient-to-b from-gray-50 to-gray-50 dark:bg-gray-800">
          <AddEvent />
        </section>

        <section id="viewevent" className="py-0 bg-gradient-to-b from-gray-50 to-gray-50 dark:bg-gray-800">
          <ViewMyEvent />
        </section>

        <section id="feedback" className="py-0 bg-gradient-to-b from-gray-50 to-gray-50 dark:bg-gray-800">
          <UserFeedback />
        </section>

        {/* FOOTER */}
        <footer id="contactus" className="relative bg-gradient-to-br from-slate-100 via-blue-100 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 text-gray-900 dark:text-white overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 py-20">
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
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Your trusted partner for seamless event management and unforgettable experiences.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  © 2025 EventEase. All rights reserved.
                </p>
              </div>
              
              <div className="text-center">
                <h5 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Quick Links</h5>
                <div className="flex flex-col space-y-3">
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => scrollToSection('events')}
                  >
                    Browse Events
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => scrollToSection('contactus')}
                  >
                    Contact Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                  >
                    Privacy Policy
                  </Button>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <h5 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Connect With Us</h5>
                <div className="flex justify-center md:justify-end space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-blue-600/20 dark:hover:bg-gray-700 transition-colors rounded-full w-12 h-12"
                  >
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-sky-600/20 dark:hover:bg-gray-700 transition-colors rounded-full w-12 h-12"
                  >
                    <Twitter className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-pink-600/20 dark:hover:bg-gray-700 transition-colors rounded-full w-12 h-12"
                  >
                    <Instagram className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
                  Follow us for updates and event highlights
                </p>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="border-t border-gray-300 dark:border-white/10 pt-16">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 bg-white/10 text-gray-800 dark:text-white border-gray-300 dark:border-white/20">
                  Get In Touch
                </Badge>
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Contact Us
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Have questions or need support? We're here to help you create amazing events.
                </p>
              </div>
              <Card className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-md border-gray-200 dark:border-white/10 shadow-2xl">
                <CardContent className="p-8">
                  <ContactUs />
                </CardContent>
              </Card>
            </div>

            <div className="border-t border-gray-300 dark:border-white/10 mt-16 pt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Built with ❤️ for event organizers worldwide | EventEase Platform
              </p>
            </div>
          </div>
        </footer>
      </div>

      <Outlet />
    </div>
  );
};