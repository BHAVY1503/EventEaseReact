import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp'
import axios from 'axios';
import { UserFeedback } from '../user/UserFeedBack';
import { ContactUs } from './ContactUs';

export const LandingPage = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [img4, img2, img3, img1];

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

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">EventEase</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </a>
            <a href="#aboutus" className="text-sm font-medium transition-colors hover:text-primary">
              About Us
            </a>
            <a href="#events" className="text-sm font-medium transition-colors hover:text-primary">
              Events
            </a>
            <a href="#contactus" className="text-sm font-medium transition-colors hover:text-primary">
              Contact Us
            </a>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-6">
                  <a href="#" className="text-sm font-medium transition-colors hover:text-primary">
                    Home
                  </a>
                  <a href="#aboutus" className="text-sm font-medium transition-colors hover:text-primary">
                    About Us
                  </a>
                  <a href="#events" className="text-sm font-medium transition-colors hover:text-primary">
                    Events
                  </a>
                  <a href="#contactus" className="text-sm font-medium transition-colors hover:text-primary">
                    Contact Us
                  </a>
                  <div className="flex flex-col space-y-2 mt-4">
                    <Button variant="outline" asChild>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/signin">Sign In</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
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
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to!</h1>
              <p className="text-2xl md:text-4xl mb-8">EventEase</p>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full"
              >
                <Link to="/organizersignup">Organize The Events</Link>
              </Button>
            </div>
          </div>
        ))}
        
        {/* Carousel Navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* About Us */}
      <section className="py-20 bg-muted/50 text-center" id="aboutus">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About Us</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            <strong>EventEase</strong> is your all-in-one platform for discovering, organizing, and managing events with ease.
            Whether you're a passionate attendee or a professional organizer, EventEase connects people through seamless, innovative event experiences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-4">Total Events</h3>
              <p className="text-4xl font-bold text-primary">{eventStats.totalEvents}</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-4">Active Events</h3>
              <p className="text-4xl font-bold text-primary">{eventStats.activeEvents}</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-4">Community Growth</h3>
              <p className="text-lg text-muted-foreground">Join thousands of organizers!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Showcase */}
      <section className="py-20" id="events">
        <div className="w-full">
          {[{ img: img1, text: "Empowering organizers. Connecting communities. Making events effortless." },
          { img: img2, text: "A vibrant platform where ideas turn into unforgettable experiences." },
          { img: img3, text: "Your journey to organize or attend the perfect event begins here." }
          ].map((item, i) => (
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]" key={i}>
              <div 
                className={`${i % 2 === 0 ? "lg:order-2" : ""} bg-cover bg-center`}
                style={{ backgroundImage: `url(${item.img})` }}
              >
                <div className="w-full h-full bg-black/20" />
              </div>
              <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
                <div className="max-w-lg">
                  <p className="text-lg leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <div>
        <UserFeedback />
      </div>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto backdrop-blur-sm bg-white/10 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Make Your Event Unforgettable!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join EventEase and be part of the most exciting event community!
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg"
            >
              <Link to="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
            <div className="text-center lg:text-left">
              <h4 className="text-2xl font-bold mb-2">EventEase</h4>
              <p className="text-gray-300 text-sm">© 2025 EventEase. All rights reserved.</p>
            </div>
            <div className="text-center">
              <nav className="flex justify-center space-x-6">
                <a href="#aboutus" className="text-gray-300 hover:text-white transition-colors">
                  About
                </a>
                <a href="#contactus" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </nav>
            </div>
            <div className="text-center lg:text-right">
              <div className="flex justify-center lg:justify-end space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <i className="bi bi-facebook text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <i className="bi bi-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <i className="bi bi-instagram text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          {/* ContactUs Form */}
          <div className="mt-12" id="contactus">
            <ContactUs />
          </div>
        </div>
      </footer>

      <Outlet />
    </div>
  );
};
