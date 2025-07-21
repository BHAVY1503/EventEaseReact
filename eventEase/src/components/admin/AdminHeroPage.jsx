import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import axios from 'axios';

import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import defaultprofile from '../../assets/img/testimonials-2.jpg';

import { AddEvent } from '../organizer/AddEvent';
import { ViewMyEvent } from '../organizer/ViewMyEvent';
import { UserFeedback } from '../user/UserFeedBack';
import { ViewEvents } from '../user/ViweEvents';
import { ContactUs } from '../common/ContactUs';

import { GroupedByEvents } from './GroupedByEvents';
import AddStadiumForm from './AddStadiumForm';
import ViewStadiums from './ViewStadiums';
import UpdateStadium from './UpdateStadium';

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu, User } from "lucide-react";

export const AdminHeroPage = () => {
  const [userName, setUserName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [img2, img3, img1, img4];

  // Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const fetchOrganizer = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("/user/getuserbytoken", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = res.data.data;
        const name = user.fullName || user.name || "Guest";
        setUserName(name)
        
      } catch (error) {
        console.error("Error fetching organizer:", error);
      }
    };

    fetchOrganizer();
  }, []);

  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      localStorage.clear();
      window.location.href = "/adminsignin";
    }
  };

  return (
    <div>
      {/* Modern Navigation with shadcn/ui */}
      <nav className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
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
                    <NavigationMenuTrigger className="text-gray-600 hover:text-primary">
                      MyEvents
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-primary">
                      AddEvents
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-primary">
                      AddStadium
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-600 hover:text-primary">
                      ContactUs
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/alleventsticket" className="text-gray-600 hover:text-primary">
                      Tickets
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Desktop Profile and Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full">
                    <img
                      src={defaultprofile}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <a href="/bookedtickets" className="w-full">MyTickets</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/allusers" className="w-full">UserList</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/allorganizer" className="w-full">OrganizerList</a>
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
                    <a href="#viewevent" className="text-lg font-medium">MyEvents</a>
                    <a href="#addevent" className="text-lg font-medium">AddEvents</a>
                    <a href="#addstadium" className="text-lg font-medium">AddStadium</a>
                    <a href="#contactus" className="text-lg font-medium">ContactUs</a>
                    <Link to="/alleventsticket" className="text-lg font-medium">Tickets</Link>
                    <hr className="my-4" />
                    <a href="/bookedtickets" className="text-lg font-medium">MyTickets</a>
                    <a href="/allusers" className="text-lg font-medium">UserList</a>
                    <a href="/allorganizer" className="text-lg font-medium">OrganizerList</a>
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

      {/* Hero Carousel - Updated for Tailwind */}
      <div className="relative mt-16" style={{ height: '600px' }}>
        <div className="h-full">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '600px',
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
                <h1 className="text-6xl font-bold text-white mb-4">Welcome Back!</h1>
                <p className="text-2xl text-white">EventEase</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div id='events' className="mt-16"><ViewEvents /></div>
      {/* <div id='viewevent'><ViewMyEvent /></div> */}
      <div id='groupbyevent' className="mt-32"><GroupedByEvents/></div>
      <div id='addevent' className="mt-32"><AddEvent /></div>
      <div id='addstadium' className="mt-32"><AddStadiumForm /></div>
      <div className="mt-32"><ViewStadiums /></div>
      <div className="mt-32"><UpdateStadium /></div>

      <div className="mt-32"><UserFeedback /></div>

      {/* Footer */}
      <footer className="text-white pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #1f1c2c, #928dab)' }}>
        <div className="container">
          <div className="row align-items-center mb-4">
            <div className="col-lg-4 text-center text-lg-start mb-3 mb-lg-0">
              <h4 className="fw-bold">EventEase</h4>
              <p className="text-light small mb-2">© 2025 EventEase. All rights reserved.</p>
            </div>
            <div className="col-lg-4 text-center">
              <ul className="list-inline mb-2">
                <li className="list-inline-item mx-2"><a href="#aboutus" className="text-light text-decoration-none fw-medium">About</a></li>
                <li className="list-inline-item mx-2 text-light">⋅</li>
                <li className="list-inline-item mx-2"><a href="#contactus" className="text-light text-decoration-none fw-medium">Contact</a></li>
              </ul>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <ul className="list-inline mb-0">
                <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-facebook"></i></a></li>
                <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-twitter"></i></a></li>
                <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-instagram"></i></a></li>
              </ul>
            </div>
          </div>

          {/* ContactUs Form */}
          <div className="mt-5" id="contactus"><ContactUs /></div>
        </div>
      </footer>

      <Outlet />
    </div>
  );
};

