import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";
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
  User2Icon,
  InboxIcon,
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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// App components
import { AddEvent } from "../organizer/AddEvent";
import { ViewMyEvent } from "../organizer/ViewMyEvent";
import { UserFeedback } from "../user/UserFeedBack";
import  ViewEvents  from "../user/ViweEvents";
import { ContactUs } from "../common/ContactUs";
import { GroupedByEvents } from "./GroupedByEvents";
import AddStadiumForm from "./AddStadiumForm";
import ViewStadiums from "./ViewStadiums";
import UpdateStadium from "./UpdateStadium";
import { AdminEvents } from "./AdminEvents";
import { AdminInbox } from "./AdminInbox";
import { DarkModeToggle } from "@/contexts/DarkModeContext";

// Images
import img1 from "../../assets/img/hero-bg.jpg";
import img2 from "../../assets/img/page-title-bg.webp";
import img3 from "../../assets/img/speaker.jpg";
import img4 from "../../assets/img/event.webp";
import defaultprofile from "../../assets/img/testimonials-2.jpg";

export const AdminHeroPage = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const heroImages = [img2, img3, img1, img4];

  // Fetch admin details
  useEffect(() => {
    const fetchAdmin = async () => {
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
        setUserName(user.fullName || user.name || "Admin");
        setError("");
      } catch (err) {
        console.error("Error fetching admin:", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Signout
  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      localStorage.clear();
      window.location.href = "/adminsignin";
    }
  };

  // Scroll to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  };

  // Hero navigation
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const sidebarItems = [
    { id: "events", label: "All Events", icon: Calendar },
    { id: "groupbyevent", label: "Grouped Events", icon: BarChart3 },
    { id: "addevent", label: "Add Event", icon: Plus },
    { id: "addstadium", label: "Add Stadium", icon: Building2 },
    { id: "viewstadiums", label: "Manage Stadiums", icon: Settings },
    { id: "feedback", label: "User Feedback", icon: Star },
  ];

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
            {/* LOGO */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                EventEase Admin
              </h1>
            </div>

            {/* DESKTOP NAV LINKS */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant="ghost"
                className="hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400"
                onClick={() => scrollToSection("home")}
              >
                <Home className="w-4 h-4 mr-2" /> Home
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400"
                onClick={() => scrollToSection("contactus")}
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Contact
              </Button>
              <Link to="/allusers">
                <Button
                  variant="ghost"
                  className="hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  <UserCircle2 className="w-4 h-4 mr-2" /> Users
                </Button>
              </Link>
              <Link to="/allorganizer">
                <Button
                  variant="ghost"
                  className="hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400"
                >
                  <User2Icon className="w-4 h-4 mr-2" /> Organizers
                </Button>
              </Link>
               <Link to="/alleventsticket">
                  <Button 
                  variant="ghost" 
                  className="hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                  <Ticket className="w-4 h-4 mr-2" />
                   Tickets
                  </Button>
                   </Link>
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-center space-x-3">
              <DarkModeToggle />

              {/* SIDEBAR */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-80 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2 text-lg dark:text-white">
                      <Shield className="w-6 h-6 text-red-600" />
                      <span>Admin Panel</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-2">
                    {sidebarItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => scrollToSection(item.id)}
                        className="w-full justify-start h-auto p-4 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400"
                      >
                        <item.icon className="w-5 h-5 mr-3" /> {item.label}
                      </Button>
                    ))}

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        onClick={signout}
                        className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                      >
                        <LogOut className="w-5 h-5 mr-2" /> Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* ERROR ALERT */}
              {error && (
                <Alert className="w-64 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-800 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* USER DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="p-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={defaultprofile} />
                        <AvatarFallback className="bg-gradient-to-r from-red-500 to-purple-500 text-white font-semibold">
                          {userName ? userName.charAt(0).toUpperCase() : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {loading ? "Loading..." : userName || "Admin"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
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
                    <p className="text-sm font-medium dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">System Administrator</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/admininbox" className="flex items-center">
                      <InboxIcon className="w-4 h-4 mr-3 text-blue-600" />
                      Inbox
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
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

      {/* HERO SECTION */}
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
              <h1 className="text-5xl font-bold mb-4">
                Welcome Back, {userName || "Admin"}
              </h1>
              <p className="text-lg opacity-90 mb-8">
                Manage your platform with full control — EventEase Admin Portal
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => scrollToSection("addevent")}
                >
                  <Plus className="w-5 h-5 mr-2" /> Create Event
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white/50 hover:bg-white hover:text-gray-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Settings className="w-5 h-5 mr-2" /> Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HERO NAVIGATION */}
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

      {/* MAIN SECTIONS */}
      <section id="events" className="py-5 bg-gradient-to-b from-blue-50 to-blue-50  dark:from-black dark:to-black" >
        <ViewEvents />
      </section>

      <section id="groupbyevent" className="py-0 bg-gradient-to-b from-blue-50 to-blue-50  dark:from-black dark:to-black">
        <GroupedByEvents />
      </section>

      <section id="adminevents" className="py-0 bg-gradient-to-b from-blue-50 to-blue-50  dark:from-black dark:to-black">
        <AdminEvents />
      </section>

      <section id="addevent" className="py-0 bg-gradient-to-b from-blue-50 to-purple-50  dark:from-black dark:to-black">
        <AddEvent />
      </section>

      <section id="addstadium" className="py-5 bg-gradient-to-b from-purple-50 to-pink-50  dark:from-black dark:to-black">
        <AddStadiumForm />
      </section>

      <section id="viewstadiums" className="py-0 bg-gradient-to-b from-pink-50 to-orange-50  dark:from-black dark:to-black">
        <ViewStadiums />
      </section>

      <section id="feedback" className="py-5 bg-gradient-to-b from-yellow-50 to-green-50  dark:from-black dark:to-black">
        <UserFeedback />
      </section>

      {/* FOOTER */}
      <footer className="relative bg-gradient-to-br from-slate-100 via-red-100 to-purple-100 dark:from-slate-900 dark:via-red-900 dark:to-purple-900 text-gray-900 dark:text-white overflow-hidden ">
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-12 items-center mb-16">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
                  EventEase Admin
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Manage events, users, and organizers effortlessly.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                © 2025 EventEase. All rights reserved.
              </p>
            </div>

            <div className="text-center">
              <h5 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">
                Admin Links
              </h5>
              <div className="flex flex-col space-y-3">
                <Link to="/allusers">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition"
                  >
                    User Management
                  </Button>
                </Link>
                <Link to="/allorganizer">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition"
                  >
                    Organizer Management
                  </Button>
                </Link>
                <Link to="/admininbox">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition"
                  >
                    Support Center
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center md:text-right">
              <h5 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">
                Connect With Us
              </h5>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-600/20 dark:hover:bg-gray-700"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-gray-700 dark:text-gray-300 hover:bg-sky-600/20 dark:hover:bg-gray-700"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-gray-700 dark:text-gray-300 hover:bg-pink-600/20 dark:hover:bg-gray-700"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-white/10 mt-16 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Built with ❤️ for seamless event management | EventEase Admin Portal
            </p>
          </div>
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
//   DoorOpen,
//   Settings,
//   Users,
//   Building2,
//   Star,
//   BarChart3,
//   Bell,
//   Search,
//   X,
//   Shield,
//   UserCircle2,
//   User2Icon,
//   InboxIcon
// } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger,
//   DropdownMenuSeparator 
// } from '@/components/ui/dropdown-menu';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Card, CardContent } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
// import { Input } from "@/components/ui/input";

// // Import your existing components
// import { AddEvent }  from '../organizer/AddEvent';
// import { ViewMyEvent } from '../organizer/ViewMyEvent';
// import { UserFeedback } from '../user/UserFeedBack';
// import { ViewEvents } from '../user/ViweEvents';
// import { ContactUs } from '../common/ContactUs';
// import { GroupedByEvents } from './GroupedByEvents';
// import AddStadiumForm from './AddStadiumForm';
// import ViewStadiums from './ViewStadiums';
// import UpdateStadium from './UpdateStadium';

// // Import your existing images
// import img1 from '../../assets/img/hero-bg.jpg';
// import img2 from '../../assets/img/page-title-bg.webp';
// import img3 from '../../assets/img/speaker.jpg';
// import img4 from '../../assets/img/event.webp';
// import defaultprofile from '../../assets/img/testimonials-2.jpg';
// import { AdminEvents } from './AdminEvents';
// import { AdminInbox } from './AdminInbox';
// import { DarkModeToggle } from '@/contexts/DarkModeContext';

// export const AdminHeroPage = () => {
//   const [userName, setUserName] = useState("");
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
  

//   const heroImages = [img2, img3, img1, img4];

//   useEffect(() => {
//     const fetchAdmin = async () => {
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
//         const name = user.fullName || user.name || "Admin";
//         setUserName(name);
//         setError("");
//       } catch (error) {
//         console.error("Error fetching admin:", error);
//         setError("Failed to load admin data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAdmin();
//   }, []);

//    // Handle navbar scroll effect
//     useEffect(() => {
//       const handleScroll = () => {
//         setIsScrolled(window.scrollY > 50);
//       };
//       window.addEventListener('scroll', handleScroll);
//       return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

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
//       window.location.href = "/adminsignin";
//     }
//   };

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       setSidebarOpen(false); // Close sidebar after navigation
//     }
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % heroImages.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
//   };

//   // Sidebar navigation items
//   const sidebarItems = [
     
//     { 
//       id: 'events', 
//       label: 'All Events', 
//       icon: Calendar, 
//       description: 'View all platform events' 
//     },
 
//     { 
//       id: 'groupbyevent', 
//       label: 'Grouped Events', 
//       icon: BarChart3, 
//       description: 'Events organized by categories' 
//     },
//     { 
//       id: 'addevent', 
//       label: 'Add Event', 
//       icon: Plus, 
//       description: 'Create new events' 
//     },
//     { 
//       id: 'addstadium', 
//       label: 'Add Stadium', 
//       icon: Building2, 
//       description: 'Add new venues' 
//     },
//     { 
//       id: 'viewstadiums', 
//       label: 'Manage Stadiums', 
//       icon: Settings, 
//       description: 'View and edit venues' 
//     },
//     { 
//       id: 'updatestadium', 
//       label: 'Update Stadium', 
//       icon: Settings, 
//       description: 'Update venue details' 
//     },
//     { 
//       id: 'feedback', 
//       label: 'User Feedback', 
//       icon: Star, 
//       description: 'View user reviews' 
//     }
//   ];

//   return (
//     // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//     <div className="min-h-screen bg-white dark:bg-gray-900">
//        <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
//         isScrolled 
//           ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg' 
//           : 'bg-transparent'
//       }`}></header>
//       {/* Modern Navigation Header */}
//       {/* <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-lg"> */}
//       <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 z-50 shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
//                 <Shield className="w-5 h-5 text-white" />
//               </div>
//               {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent"> */}
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
//                 EventEase Admin
//               </h1>
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
//                 onClick={() => scrollToSection('about')}
//               >
//                 About Us
//               </Button>
//               <Button 
//                 variant="ghost" 
//                 className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
//                 onClick={() => scrollToSection('contactus')}
//               >
//                 <MessageCircle className="w-4 h-4 mr-2" />
//                 Contact Us
//               </Button>
//               <Link to ="/allusers">
//                <Button 
//                 variant="ghost" 
//                 className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
//               >
//                 <UserCircle2 className="w-4 h-4 mr-2" />
//                 Users
//               </Button>
//               </Link>
//               <Link to ="/allorganizer">
//                <Button 
//                 variant="ghost" 
//                 className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
//               >
//                 <User2Icon className="w-4 h-4 mr-2" />
//                 Organizers
//               </Button>
//               </Link>
//             </div>

//             {/* Right side actions */}
//             <div className="flex items-center space-x-3">
//               <DarkModeToggle/>
//               {/* Sidebar Toggle */}
//               <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
//                 <SheetTrigger asChild>
//                   <Button variant="outline" size="sm" className="border-gray-200">
//                     <Menu className="w-5 h-5" />
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="right" className="w-80 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
//                   <SheetHeader>
//                     <SheetTitle className="flex items-center space-x-2 text-lg dark:text-white">
//                       <Shield className="w-6 h-6 text-red-600" />
//                       <span>Admin Panel</span>
//                     </SheetTitle>
//                   </SheetHeader>
                  
//                   <div className="mt-8 space-y-2">
//                     {sidebarItems.map((item) => (
//                       <Button
//                         key={item.id}
//                         variant="ghost"
//                         // className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:text-blue-700 transition-colors"
//                         className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 dark:hover:text-blue-400 dark:text-gray-300 transition-colors"
//                         onClick={() => scrollToSection(item.id)}
//                       >
//                         <div className="flex items-start space-x-3 text-left w-full">
//                           <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <div className="font-medium">{item.label}</div>
//                             <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
//                           </div>
//                         </div>
//                       </Button>
//                     ))}
                    
//                     <div className="pt-4 border-t">
//                       <Button
//                         variant="ghost"
//                         className="w-full justify-start h-auto p-4 hover:bg-orange-50 hover:text-orange-700 transition-colors"
//                         asChild
//                       >
//                         <Link to="/alleventsticket">
//                           <Ticket className="w-5 h-5 mr-3" />
//                           <div>
//                             <div className="font-medium">All Tickets</div>
//                             <div className="text-xs text-gray-500 mt-1">Manage event tickets</div>
//                           </div>
//                         </Link>
//                       </Button>
                      
//                       <Button
//                         variant="ghost"
//                         className="w-full justify-start h-auto p-4 hover:bg-green-50 hover:text-green-700 transition-colors"
//                         asChild
//                       >
//                         <Link to="/allusers">
//                           <Users className="w-5 h-5 mr-3" />
//                           <div>
//                             <div className="font-medium">User Management</div>
//                             <div className="text-xs text-gray-500 mt-1">Manage platform users</div>
//                           </div>
//                         </Link>
//                       </Button>
                      
//                       <Button
//                         variant="ghost"
//                         className="w-full justify-start h-auto p-4 hover:bg-purple-50 hover:text-purple-700 transition-colors"
//                         asChild
//                       >
//                         <Link to="/allorganizer">
//                           <Settings className="w-5 h-5 mr-3" />
//                           <div>
//                             <div className="font-medium">Organizer Management</div>
//                             <div className="text-xs text-gray-500 mt-1">Manage event organizers</div>
//                           </div>
//                         </Link>
//                       </Button>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>

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
//                   <Card className="p-2 hover:shadow-md transition-shadow cursor-pointer border-gray-200/50 dark:border-gray-700 dark:bg-gray-800">
//                     <div className="flex items-center space-x-3">
//                       <Avatar className="w-9 h-9 ring-2 ring-red-100">
//                         <AvatarImage src={defaultprofile} />
//                         <AvatarFallback className="bg-gradient-to-r from-red-500 to-purple-500 text-white font-semibold">
//                           {userName ? userName.charAt(0).toUpperCase() : 'A'}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="hidden sm:block text-left">
//                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                           {loading ? 'Loading...' : userName || 'Admin'}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
//                       </div>
//                       <ChevronDown className="w-4 h-4 text-gray-500" />
//                     </div>
//                   </Card>
//                 </DropdownMenuTrigger>
//                 {/* <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm"> */}
//                 <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
//                   <div className="px-3 py-2 border-b dark:border-gray-700">
//                     <p className="text-sm font-medium dark:text-white">{userName}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">System Administrator</p>
//                   </div>
//                   <DropdownMenuItem asChild>
//                     <Link to="/bookedtickets" className="flex items-center cursor-pointer">
//                       <Ticket className="w-4 h-4 mr-3 text-blue-600" />
//                       <span>My Tickets</span>
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
                 
//                   <DropdownMenuItem asChild>
//                     <Link to="/admininbox" className="flex items-center cursor-pointer">
//                       <InboxIcon className="w-4 h-4 mr-3 text-blue-600" />
//                       <span>Inbox</span>
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator/>
//                   <DropdownMenuItem asChild  onClick={signout} 
//                     className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
//                     <Link to="/" className="flex items-center cursor-pointer ">
//                       <LogOut className="w-4 h-4 mr-3  text-red-600" />
//                       <span className=' hover:text-red-700'>SignOut</span>
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
//                 backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(220,38,127,0.3)), url(${img})`,
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
//                     Welcome Back, {userName}!
//                   </Badge>
//                   <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
//                     Admin Dashboard
//                   </h1>
//                   <p className="text-xl md:text-2xl font-light opacity-90 mb-8 max-w-2xl">
//                     Manage your platform with complete control - EventEase Admin Portal
//                   </p>
                  
//                   {/* Action Buttons */}
//                   <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                     <Button 
//                       size="lg" 
//                       className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
//                       onClick={() => scrollToSection('addevent')}
//                     >
//                       <Plus className="w-5 h-5 mr-2" />
//                       Create New Event
//                     </Button>
//                     <Button 
//                       size="lg" 
//                       variant="outline" 
//                       className="text-white border-white/50 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm"
//                       onClick={() => setSidebarOpen(true)}
//                     >
//                       <Settings className="w-5 h-5 mr-2" />
//                       Admin Panel
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
//         {/* All Events Section */}
//         <section id="events" className="py-0 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
//           <ViewEvents />
//         </section>

//         {/* Grouped Events Section */}
//         <section id="groupbyevent" className="py-0 bg-gradient-to-b from-blue-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
//             <GroupedByEvents />
//         </section>

//         {/* Admin Inbox Section */}
//       {/* <section id="inbox" className="py-8 bg-gradient-to-b from-green-50 to-green-100">
//        <div className="container mx-auto px-4">
//        <h2 className="text-3xl font-bold mb-6">Admin Inbox</h2>
//        <AdminInbox />
//         </div>
//        </section> */}


//         <section id="adminevents" className="py-0 bg-gradient-to-b from-blue-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
//             <AdminEvents />
//         </section>

//         {/* Add Event Section */}
//         <section id="addevent" className="py-0 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
//           <AddEvent />
//         </section>

//         {/* Add Stadium Section */}
//         <section id="addstadium" className="py-0 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
//           <AddStadiumForm />
//         </section>

//         {/* View Stadiums Section */}
//         <section id="viewstadiums" className="py-0 bg-gradient-to-b from-pink-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
//             <ViewStadiums />
//         </section>

//         {/* Update Stadium Section */}
//         {/* <section id="updatestadium" className="py-0 bg-gradient-to-b from-orange-50 to-yellow-50">
//           <div className="container mx-auto px-4 py-16">
//             <UpdateStadium />
//           </div>
//         </section> */}

//         {/* User Feedback Section */}
//         <section id="feedback" className="py-0 bg-gradient-to-b from-yellow-50 to-green-50 dark:from-gray-800 dark:to-gray-800">
//           <UserFeedback />
//         </section>
//       </div>

//       {/* Modern Footer */}
//       <footer className="relative bg-gradient-to-br from-slate-900 via-red-900 to-purple-900 text-white overflow-hidden">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute inset-0" style={{
//             backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 50%), 
//                              radial-gradient(circle at 75% 75%, #a855f7 0%, transparent 50%)`
//           }} />
//         </div>
        
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//           {/* Footer Header */}
//           <div className="grid md:grid-cols-3 gap-12 items-center mb-16">
//             <div className="text-center md:text-left">
//               <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
//                 <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-purple-500 rounded-xl flex items-center justify-center">
//                   <Shield className="w-6 h-6 text-white" />
//                 </div>
//                 <h4 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
//                   EventEase Admin
//                 </h4>
//               </div>
//               <p className="text-gray-300 text-sm mb-4">
//                 Comprehensive admin panel for managing events, users, and platform operations.
//               </p>
//               <p className="text-gray-400 text-xs">
//                 © 2025 EventEase. All rights reserved.
//               </p>
//             </div>
            
//             <div className="text-center">
//               <h5 className="text-lg font-semibold mb-6 text-gray-200">Admin Links</h5>
//               <div className="flex flex-col space-y-3">
//                 <Link to="/allusers">
//                   <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
//                     User Management
//                   </Button>
//                 </Link>
//                 <Link to="/allorganizer">
//                   <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
//                     Organizer Management
//                   </Button>
//                 </Link>
//                 <Link to="/admininbox">
//                   <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
//                     Support Center
//                   </Button>
//                 </Link>
//                 {/* <Button 
//                   variant="ghost" 
//                   className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
//                   onClick={() => scrollToSection('/admininbox')}
//                 >
//                   Support Center
//                 </Button> */}
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
//                 Follow us for platform updates
//               </p>
//             </div>
//           </div>

//           {/* Contact Form Section */}
//           {/* <div id="contactus" className="border-t border-white/10 pt-16">
//             <div className="text-center mb-12">
//               <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20">
//                 Get In Touch
//               </Badge>
//               <h3 className="text-3xl font-bold mb-4">
//                 Contact Support
//               </h3>
//               <p className="text-gray-300 max-w-2xl mx-auto">
//                 Need help managing the platform? Our support team is here to assist you.
//               </p>
//             </div>
//             <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
//               <CardContent className="p-8">
//                 <ContactUs />
//               </CardContent>
//             </Card>
//           </div> */}

//           {/* Footer Bottom */}
//           <div className="border-t border-white/10 mt-16 pt-8 text-center">
//             <p className="text-gray-400 text-sm">
//               Built with ❤️ for seamless event management | EventEase Admin Portal
//             </p>
//           </div>
//         </div>
//       </footer>

//       {/* Router Outlet */}
//       <Outlet />
//     </div>
//   );
// };



