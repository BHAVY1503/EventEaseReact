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
import { Menu, User } from "lucide-react";

export const UserHero = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [userName, setuserName] = useState()
  const [currentSlide, setCurrentSlide] = useState(0);
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
                    <a href="#contact" className="text-gray-600 hover:text-primary">
                      Contact Us
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
                    <span className="font-medium">{userName || "Guest"}</span>
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
                <h1 className="text-6xl font-bold text-white mb-2">Welcome to!</h1>
                <p className="text-4xl text-white mb-4">EventEase</p>
                <h3 className="text-2xl text-white text-center max-w-4xl">
                  DISCOVER AND BE PART OF SOMETHING AMAZING
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

 {/* view all events */}
<div id='event'>
    <ViewEvents/>
</div>
  
  {/* aboutus section */}
 <section className="bg-gray-50 text-center py-16" id="aboutus">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-4xl font-bold mb-6">About Us</h2>
    <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto">
      <strong>EventEase</strong> is your all-in-one platform for discovering, organizing, and managing events with ease. 
      Whether you're a passionate attendee or a professional organizer, EventEase connects people through seamless, innovative event experiences.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-4">Total Events</h3>
          <p className="text-5xl font-bold text-primary">{eventStats.totalEvents}</p>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-4">Active Events</h3>
          <p className="text-5xl font-bold text-primary">{eventStats.activeEvents}</p>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-4">Community Growth</h3>
          <p className="text-lg text-gray-600">Join thousands of organizers!</p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Events Showcase */}
      <section className="showcase" id="" >
        <div className="container-fluid p-0">
          {[{ img: img1, heading: "", text: "Empowering organizers. Connecting communities. Making events effortless." },
            { img: img2, heading: "", text:  "A vibrant platform where ideas turn into unforgettable experiences." },
            { img: img3, heading: "", text: "Your journey to organize or attend the perfect event begins here." }
          ].map((item, i) => (
            <div className="row g-0" key={i}>
              <div className={`col-lg-6 ${i % 2 === 0 ? "order-lg-2" : ""} text-white showcase-img`}
                style={{ backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="col-lg-6 my-auto showcase-text">
                <h2>{item.heading}</h2>
                <p className="lead mb-0">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

     <div>
      <UserFeedback/>
     </div>

      {/* Footer */}
        <footer
               className="text-white pt-5 pb-4"
               style={{
                 background: 'linear-gradient(135deg, #1f1c2c, #928dab)',
                 position: 'relative',
                 zIndex: 1,
               }}
             >
               <div className="container">
                 <div className="row align-items-center mb-4">
                   <div className="col-lg-4 text-center text-lg-start mb-3 mb-lg-0">
                     <h4 className="fw-bold" style={{color:"#ffffff"}}>EventEase</h4>
                     <p className="text-light small mb-2">© 2025 EventEase. All rights reserved.</p>
                   </div>
                   <div className="col-lg-4 text-center">
                     <ul className="list-inline mb-2">
                       <li className="list-inline-item mx-2">
                         <a href="#aboutus" className="text-light text-decoration-none fw-medium">About</a>
                       </li>
                       <li className="list-inline-item mx-2 text-light">⋅</li>
                       <li className="list-inline-item mx-2">
                         <a href="#contactus" className="text-light text-decoration-none fw-medium">Contact</a>
                       </li>
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
                 <div className="mt-5" id="contactus">
                   <ContactUs />
                 </div>
               </div>
             </footer>
      <Outlet></Outlet>
    </div>
  );
};