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
  Home
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

// Import your existing components
import { AddEvent } from './AddEvent';
import { ViewMyEvent } from './ViewMyEvent';
import { UserFeedback } from '../user/UserFeedBack';
import { ViewEvents } from '../user/ViweEvents';
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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-lg">
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
                className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => scrollToSection('home')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => scrollToSection('viewevent')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Events
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-green-50 hover:text-green-700 transition-colors"
                onClick={() => scrollToSection('addevent')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
                onClick={() => scrollToSection('contactus')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Link to="/bookingofmyevents">
                <Button 
                  variant="ghost" 
                  className="hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Tickets
                </Button>
              </Link>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-3">
              {/* Error Alert */}
              {error && (
                <Alert className="w-64 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="p-2 hover:shadow-md transition-shadow cursor-pointer border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9 ring-2 ring-blue-100">
                        <AvatarImage src={defaultprofile} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {loading ? 'Loading...' : userName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">Organizer</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-gray-500">Event Organizer</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/bookedtickets" className="flex items-center cursor-pointer">
                      <Ticket className="w-4 h-4 mr-3 text-blue-600" />
                      <span>My Tickets</span>
                      <Badge variant="secondary" className="ml-auto">New</Badge>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signout} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="outline" size="sm" className="border-gray-200">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white/95 backdrop-blur-sm">
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
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
                      className="text-white border-white/50 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm"
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
      </div>

      {/* Main Content Sections */}
      <div className="relative">
        {/* Events Section */}
        <section id="events" className="py-0 bg-gradient-to-b from-white to-slate-50">
                <ViewEvents />
            
        </section>

        {/* My Events Section */}
        <section id="viewevent" className="py-0 bg-gradient-to-b from-slate-50 to-blue-50">
                <ViewMyEvent />
        </section>

        {/* Add Event Section */}
        <section id="addevent" className="py-0 bg-gradient-to-b from-blue-50 to-purple-50">
                <AddEvent />
        </section>

        {/* User Feedback Section */}
        <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-pink-50 text-pink-700 border-pink-200">
                Community Feedback
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Read testimonials and feedback from our amazing event community
              </p>
            </div>
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <UserFeedback />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Modern Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
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
              <p className="text-gray-300 text-sm mb-4">
                Your trusted partner for seamless event management and unforgettable experiences.
              </p>
              <p className="text-gray-400 text-xs">
                © 2025 EventEase. All rights reserved.
              </p>
            </div>
            
            <div className="text-center">
              <h5 className="text-lg font-semibold mb-6 text-gray-200">Quick Links</h5>
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => scrollToSection('events')}
                >
                  Browse Events
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => scrollToSection('contactus')}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Privacy Policy
                </Button>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h5 className="text-lg font-semibold mb-6 text-gray-200">Connect With Us</h5>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:text-white hover:bg-blue-600/20 transition-colors rounded-full w-12 h-12"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:text-white hover:bg-sky-600/20 transition-colors rounded-full w-12 h-12"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:text-white hover:bg-pink-600/20 transition-colors rounded-full w-12 h-12"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Follow us for updates and event highlights
              </p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div id="contactus" className="border-t border-white/10 pt-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20">
                Get In Touch
              </Badge>
              <h3 className="text-3xl font-bold mb-4">
                Contact Us
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Have questions or need support? We're here to help you create amazing events.
              </p>
            </div>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
              <CardContent className="p-8">
                <ContactUs />
              </CardContent>
            </Card>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/10 mt-16 pt-8 text-center">
            <p className="text-gray-400 text-sm">
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

// import img1 from '../../assets/img/hero-bg.jpg';
// import img2 from '../../assets/img/page-title-bg.webp';
// import img3 from '../../assets/img/speaker.jpg';
// import img4 from '../../assets/img/event.webp';
// import defaultprofile from '../../assets/img/testimonials-2.jpg';

// import { AddEvent } from './AddEvent';
// import { ViewMyEvent } from './ViewMyEvent';
// import { UserFeedback } from '../user/UserFeedBack';
// import { ViewEvents } from '../user/ViweEvents';
// import { ContactUs } from '../common/ContactUs';

// export const OrganizerHeroPage = () => {
//   const [userName, setUserName] = useState("");

//   useEffect(() => {
//     const fetchOrganizer = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         const res = await axios.get("organizer/organizer/self", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const user = res.data.data;
//         setUserName(user.name);
//       } catch (error) {
//         console.error("Error fetching organizer:", error);
//       }
//     };

//     fetchOrganizer();
//   }, []);

//   const signout = () => {
//     if (window.confirm("Are you sure you want to SignOut?")) {
//       localStorage.clear();
//       window.location.href = "/organizersignin";
//     }
//   };

//   return (
//     <div>
//       {/* Navbar */}
//       <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
//         <div className="container-fluid">
//           <a className="navbar-brand" href="#">EventEase</a>
//           <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
//             data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
//             aria-expanded="false" aria-label="Toggle navigation">
//             <span className="navbar-toggler-icon" />
//           </button>

//           <div className="collapse navbar-collapse" id="navbarSupportedContent">
//             <ul className="nav nav-pills me-auto mb-2 mb-lg-0">
//               <li className="nav-item"><a className="nav-link" href="#">Home</a></li>
//               <li className="nav-item"><a className="nav-link" href="#viewevent">MyEvents</a></li>
//               <li className="nav-item"><a className="nav-link" href="#addevent">AddEvents</a></li>
//               <li className="nav-item"><a className="nav-link" href="#contactus">ContactUs</a></li>
//               <li className="nav-item"><Link to="/bookingofmyevents" className="nav-link">Tickets</Link></li>
//               <li className="nav-item dropdown">
//                 <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
//                   Menu
//                 </a>
//                 <ul className="dropdown-menu">
//                   <li className="text-center">
//                     <a className="dropdown-item" href="/bookedtickets">MyTickets</a>
//                   </li>
//                   <li className="text-center">
//                     <Link to="/" className="btn btn-danger btn-sm" onClick={signout}>SignOut</Link>
//                   </li>
//                 </ul>
//               </li>
//             </ul>

//             <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">
//               <li className="nav-item d-flex align-items-center">
//                 <img
//                   src={defaultprofile}
//                   alt="Profile"
//                   className="rounded-circle me-2"
//                   style={{ width: '40px', height: '40px', objectFit: 'cover' }}
//                 />
//                 <span className="fw-bold">{userName}</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Carousel */}
//       <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" style={{ marginTop: "56px" }}>
//         <div className="carousel-inner" style={{ height: '600px' }}>
//           {[img3, img2, img1, img4].map((img, index) => (
//             <div
//               key={index}
//               className={`carousel-item ${index === 0 ? 'active' : ''}`}
//               style={{
//                 backgroundImage: `url(${img})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 height: '600px',
//                 backgroundAttachment:'fixed'
//               }}
//             >
//               <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100">
//                 <h1 style={{ color: '#fff' }}>Welcome Back!</h1>
//                 <p>EventEase</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
//           <span className="carousel-control-prev-icon" aria-hidden="true" />
//           <span className="visually-hidden">Previous</span>
//         </button>
//         <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
//           <span className="carousel-control-next-icon" aria-hidden="true" />
//           <span className="visually-hidden">Next</span>
//         </button>
//       </div>

//       {/* Events Section */}
//       <div id='events'><ViewEvents /></div>
//       <div id='viewevent'><ViewMyEvent /></div>
//       <div id='addevent'><AddEvent /></div>
//       <div><UserFeedback /></div>

//       {/* Footer */}
//       <footer className="text-white pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #1f1c2c, #928dab)' }}>
//         <div className="container">
//           <div className="row align-items-center mb-4">
//             <div className="col-lg-4 text-center text-lg-start mb-3 mb-lg-0">
//               <h4 className="fw-bold">EventEase</h4>
//               <p className="text-light small mb-2">© 2025 EventEase. All rights reserved.</p>
//             </div>
//             <div className="col-lg-4 text-center">
//               <ul className="list-inline mb-2">
//                 <li className="list-inline-item mx-2"><a href="#aboutus" className="text-light text-decoration-none fw-medium">About</a></li>
//                 <li className="list-inline-item mx-2 text-light">⋅</li>
//                 <li className="list-inline-item mx-2"><a href="#contactus" className="text-light text-decoration-none fw-medium">Contact</a></li>
//               </ul>
//             </div>
//             <div className="col-lg-4 text-center text-lg-end">
//               <ul className="list-inline mb-0">
//                 <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-facebook"></i></a></li>
//                 <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-twitter"></i></a></li>
//                 <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-instagram"></i></a></li>
//               </ul>
//             </div>
//           </div>

//           {/* ContactUs Form */}
//           <div className="mt-5" id="contactus"><ContactUs /></div>
//         </div>
//       </footer>

//       <Outlet />
//     </div>
//   );
// };
