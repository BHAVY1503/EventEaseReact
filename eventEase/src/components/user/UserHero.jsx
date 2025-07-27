import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp'
import user1 from '../../assets/img/testimonials-1.jpg';
import user2 from '../../assets/img/testimonials-2.jpg';
import user3 from '../../assets/img/testimonials-3.jpg';
import defaultprofile from '../../assets/profile.jpg'
import axios from 'axios';
import { ViewEvents } from './ViweEvents';
import { UserFeedback } from './UserFeedBack';
import { ContactUs } from '../common/ContactUs';

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu, User, Calendar, Activity, Users, Facebook, Twitter, Instagram } from "lucide-react";
import { NavigationMenuContent, NavigationMenuLink } from '@radix-ui/react-navigation-menu';

export const UserHero = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [userName, setuserName] = useState()
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const images = [img1, img2, img3, img4];

  // Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(()=>{
    const fatchUser = async ()=>{
      // const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")

      console.log("Fetched userId from localStorage:", token);
      if(!token) return

      try{
        // const res = await axios.get(`/user/${token}`)
        // const user = res.data.data
      const res = await axios.get("/user/getuserbytoken", {
      headers: {
     Authorization: `Bearer ${token}`,
     },
    });
    const user = res.data.data; // ✅ define user properly
    const name = user.fullName || user.name || "Guest";
    setuserName(name);

        // setuserName(name)
    }catch(error){
      console.error("error fatching user",error)

    }
  }
  fatchUser();
},[])

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const signout = () => {
  if (window.confirm("Are you sure you want to SignOut?")) {
    localStorage.clear(); // OR just remove specific items
    window.location.href = "/signin";
  }
};


useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get("/event/geteventstats"); // change if your endpoint is different
      // console.log("api response",res.data)
      setEventStats(res.data);
    } catch (err) {
      console.error("Failed to fetch event stats", err);
    }
  };

  fetchStats();
}, []);

 

  return (
    <div>
      {/* Modern Navigation with shadcn/ui */}
      {/* <nav className="bg-white shadow-sm border-b fixed top-0 w-full z-50"> */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-black/20 backdrop-blur shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">EventEase</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavigationMenu>
                <NavigationMenuList className="flex space-x-6">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-primary">
                      Home
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a href="#event" className="text-gray-600 hover:text-primary">
                      Events
                    </a>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a href="#aboutus" className="text-gray-600 hover:text-primary">
                      About Us
                    </a>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a href="#contactus" className="text-gray-600 hover:text-primary">
                      Contact Us
                    </a>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a href="/mytickets" className="text-gray-600 hover:text-primary">
                      My Tickets
                    </a>
                  </NavigationMenuItem>
                   <NavigationMenuItem className={"hidden md:block"}>
                    <a href="/" onClick={signout} className="text-red-600 hover:text-primary">
                      Logout
                    </a>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Desktop Profile and Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 flex items-center space-x-2">
                    <img
                      src={defaultprofile}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-600">{userName || "Guest"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <a href="/mytickets" className="w-full">MyTickets</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="#" className="w-full">OrganizerList</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/" onClick={signout} className="w-full text-red-600">
                      SignOut
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    <a href="#" className="text-lg font-medium">Home</a>
                    <a href="#event" className="text-lg font-medium">Events</a>
                    <a href="#aboutus" className="text-lg font-medium">About Us</a>
                    <a href="#contact" className="text-lg font-medium">Contact Us</a>
                    <hr className="my-4" />
                    <a href="/mytickets" className="text-lg font-medium">MyTickets</a>
                    <a href="#" className="text-lg font-medium">OrganizerList</a>
                    <Button variant="destructive" onClick={signout} className="mt-4">
                      SignOut
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative mt-16">
        <div className="h-[600px] relative overflow-hidden">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 transform ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
              
              {/* Background Image */}
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Content */}
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-white">
                <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
                  <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    Welcome to EventEase
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200">
                    DISCOVER AND BE PART OF SOMETHING AMAZING
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                      asChild
                    >
                      <a href="#event">Explore Events</a>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white"
                      asChild
                    >
                      <a href="#aboutus">Learn More</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

 {/* view all events */}
<div id='event'>
    <ViewEvents/>
</div>
  
 {/* About Us Section */}
<section className="bg-gradient-to-b from-white to-gray-50 py-24" id="aboutus">
{/* <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 sm:px-6" id="aboutus"> */}

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        About Us
      </h2>
      <div className="mt-6 text-xl text-gray-600 max-w-4xl mx-auto">
        <strong className="text-primary">EventEase</strong> is your all-in-one platform for discovering, organizing, 
        and managing events with ease. Whether you're a passionate attendee or a professional organizer, 
        EventEase connects people through seamless, innovative event experiences.
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Stats Cards */}
      <div className="group">
        <div className="bg-light rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Total Events</h3>
            <p className="text-5xl font-bold text-primary">{eventStats.totalEvents}</p>
          </div>
        </div>
      </div>

      <div className="group">
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Active Events</h3>
            <p className="text-5xl font-bold text-green-600">{eventStats.activeEvents}</p>
          </div>
        </div>
      </div>

      <div className="group">
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Community</h3>
            <p className="text-lg text-gray-600">Join thousands of organizers!</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="#event">Browse Events</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Features Showcase */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
      {/* <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 sm:px-6"> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {[
            { 
              img: img1, 
              heading: "Empowering Events",
              text: "Connecting communities and making events effortless through innovative solutions."
            },
            { 
              img: img2, 
              heading: "Unforgettable Experiences",
              text: "A vibrant platform where ideas transform into memorable moments."
            },
            { 
              img: img3, 
              heading: "Your Journey Begins",
              text: "Start your journey to organize or attend the perfect event right here."
            }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 mb-24 last:mb-0`}>
              <div className="w-full md:w-1/2">
                <div className="relative rounded-2xl overflow-hidden shadow-xl  hover:shadow-x2 transition-all duration-300 hover:-translate-y-2">
                  <div className="aspect-w-16 aspect-h-9 ">
                    <img
                      src={item.img}
                      alt={item.heading}
                      className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">{item.heading}</h2>
                <p className="text-xl text-gray-600 leading-relaxed">{item.text}</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="#event">Learn More</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

     <div>
      <UserFeedback/>
     </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          {/* Contact Us Section */}
          <div className="bg-gray-800/50 py-16 px-4 sm:px-6 lg:px-8" id="contactus">
            <ContactUs />
          </div>

          {/* Main Footer Content */}
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">EventEase</h3>
                <p className="text-gray-400 text-sm">
                  Making event management and booking simple and efficient.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                <nav className="flex flex-col space-y-2">
                  <a href="#event" className="text-gray-400 hover:text-white transition-colors">Events</a>
                  <a href="#aboutus" className="text-gray-400 hover:text-white transition-colors">About</a>
                  <a href="#contactus" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </nav>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Connect With Us</h4>
                <div className="flex space-x-4">
                  {/* Using shadcn Button for social links */}
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} EventEase. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
      <Outlet></Outlet>
    </div>
  );
};