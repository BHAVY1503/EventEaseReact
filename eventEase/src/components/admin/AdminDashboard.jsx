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
  User,
  Inbox,
  ChevronLeft,
  ChevronRight,
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
import { DarkModeToggle } from "@/contexts/DarkModeContext";

// Images
import img1 from "../../assets/img/hero-bg.jpg";
import img2 from "../../assets/img/page-title-bg.webp";
import img3 from "../../assets/img/speaker.jpg";
import img4 from "../../assets/img/event.webp";
import defaultprofile from "../../assets/img/testimonials-2.jpg";
import ViewEvents from "../user/ViweEvents";
import { GroupedByEvents } from "./GroupedByEvents";
import { AdminEvents } from "./AdminEvents";
import { AddEvent } from "../organizer/AddEvent";
import AddStadiumForm from "./AddStadiumForm";
import ViewStadiums from "./ViewStadiums";
import { UserFeedback } from "../user/UserFeedBack";

export const AdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    }
  };

  // Hero navigation
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const sidebarItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "events", label: "All Events", icon: Calendar },
    { id: "groupbyevent", label: "Grouped Events", icon: BarChart3 },
    { id: "adminevents", label: "Admin Events", icon: Shield },
    { id: "addevent", label: "Add Event", icon: Plus },
    { id: "addstadium", label: "Add Stadium", icon: Building2 },
    { id: "viewstadiums", label: "Manage Stadiums", icon: Settings },
    { id: "feedback", label: "User Feedback", icon: Star },
  ];

  const quickLinks = [
    { to: "/allusers", label: "Users", icon: UserCircle2 },
    { to: "/allorganizer", label: "Organizers", icon: Users },
    { to: "/alleventsticket", label: "Tickets", icon: Ticket },
    { to: "/admininbox", label: "Inbox", icon: Inbox },
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
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                      EventEase
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
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
                  Manage your platform with ease
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
                      <Avatar className="h-10 w-10 ring-2 ring-red-100 dark:ring-red-900">
                        <AvatarImage  />
                        <AvatarFallback className="bg-gradient-to-r from-red-500 to-purple-500 text-white font-semibold">
                          {userName ? userName.charAt(0).toUpperCase() : "A"}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">System Administrator</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/admininbox" className="flex items-center cursor-pointer">
                        <Inbox className="w-4 h-4 mr-3 text-blue-600" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signout}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-800 cursor-pointer"
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
                  Manage your platform with full control – EventEase Admin Portal
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
                    onClick={() => scrollToSection("events")}
                  >
                    <Calendar className="w-5 h-5 mr-2" /> View Events
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

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white shadow-lg scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* MAIN SECTIONS */}
        <section
          id="events"
          className="py-0 bg-gradient-to-b from-gray-50 to-gary-50 dark:bg-gray-800"
        >
            <ViewEvents/>
        </section>

        <section
          id="groupbyevent"
          className="py-0 bg-gradient-to-b from-gray-50 to-gray-50  dark:bg-gray-800"
        >
          <GroupedByEvents/>
        </section>

        <section
          id="adminevents"
          className="py-0 bg-gradient-to-b from-gray-50 to-gray-50  dark:bg-gray-800"
        >
          <AdminEvents/>
        </section>

        <section
          id="addevent"
          className="py-0 bg-gradient-to-b from-gray-50 to-gray-50  dark:bg-gray-800"
        >
         <AddEvent/>
        </section>

        <section
          id="addstadium"
          className="py-0 bg-gradient-to-b from-gray-50 to-gray-50  dark:bg-gray-800"
        >
         <AddStadiumForm/>
        </section>

        <section
          id="viewstadiums"
          className="py-0 bg-gradient-to-b from-gray-50 to-gray-50  dark:bg-gray-800"
        >
          <ViewStadiums/>
        </section>

        <section
          id="feedback"
          className="py-0 bg-gradient-to-b from-gray-50 to-gray-50 dark:bg-gray-800"
        >
          <UserFeedback/>
        </section>

        {/* FOOTER */}
        <footer className="relative bg-gradient-to-br from-slate-100 via-red-100 to-purple-100 dark:from-slate-900 dark:via-red-900 dark:to-purple-900 text-gray-900 dark:text-white overflow-hidden">
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
      </div>

      <Outlet />
    </div>
  );
};