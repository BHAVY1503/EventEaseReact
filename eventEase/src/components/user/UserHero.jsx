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
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { ViewEvents } from './ViweEvents';
import { UserFeedback } from './UserFeedBack';
import { ContactUs } from '../common/ContactUs';

export const UserHero = () => {

  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });

  const [userName, setuserName] = useState()

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
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" id="navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">EventEase</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="nav nav-pills me-auto mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="#">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#event">Events</a></li>
              <li className="nav-item"><a className="nav-link" href="#aboutus">About Us</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact Us</a></li>


               <li className="nav-item dropdown">
                   <a
                   className="nav-link dropdown-toggle"     
                   href="#"
                   id="navbarDropdown"
                   role="button"
                   data-bs-toggle="dropdown"
                   aria-expanded="false"
                   >
                    Dropdown
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li style={{textAlign:'center'}}><a className="dropdown-item" href="/mytickets">MyTickets</a></li>
                    <li style={{textAlign:'center'}}><a className="dropdown-item" href="#">OrganizerList</a></li>
                     <li style={{textAlign:'center'}}>
                         <Link to="/" className="btn btn-danger btn-sm" onClick={signout}>SignOut</Link>
                       </li>
                      </ul>
                   </li>
            </ul>
            
            <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">
                <li className="nav-item d-flex align-items-center">
                 <img
                    src={defaultprofile}
                    alt="Profile"
                   className="rounded-circle me-2"
                   style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                 <span className="fw-bold">{userName || "Guest"}</span>
              </li>
             </ul>
          </div>
        </div>
      </nav>

      {/* Carousel */}
      <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" style={{marginTop:"50px"}}>
  <div className="carousel-inner" style={{ height: '500px' }}>
    {[img2, img1, img4, img3].map((img, index) => (
      <div
        key={index}
        className={`carousel-item ${index === 0 ? 'active' : ''}`}
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '600px',
          // backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100">
              <h1 style={{color:'#ffffff', float:"inline-start"}}>Welcome to!</h1><p>EventEase</p>
              <h3 style={{color:'#ffffff'}}>DISCOVER AND BE PART OF SOMETHING AMAZING</h3>
          {/* <Link to="/organizersignup" className="btn btn-primary mt-3"><b>Organize The Event</b></Link> */}
        </div>
      </div>
    ))}
  </div>

  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true" />
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true" />
    <span className="visually-hidden">Next</span>
  </button>
</div>

 {/* view all events */}
<div id='event'>
    <ViewEvents/>
</div>
  
  {/* aboutus section */}
 <section className="features-icons bg-light text-center" id="aboutus">
  <div className="container">
    <h2 className="mb-4">About Us</h2>
    <p className="lead mb-5">
  <strong>EventEase</strong> is your all-in-one platform for discovering, organizing, and managing events with ease. 
  Whether you're a passionate attendee or a professional organizer, EventEase connects people through seamless, innovative event experiences.
  </p>
    <div className="row">
      <div className="col-lg-4">
        <div className="features-icons-item mx-auto mb-5">
          <h3>Total Events</h3>
          <p className="lead mb-0 display-6">{eventStats.totalEvents}</p>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="features-icons-item mx-auto mb-5">
          <h3>Active Events</h3>
          <p className="lead mb-0 display-6">{eventStats.activeEvents}</p>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="features-icons-item mx-auto mb-5">
          <h3>Community Growth</h3>
          <p className="lead mb-0">Join thousands of organizers!</p>
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