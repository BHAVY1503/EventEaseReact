import React, { useEffect, useState } from 'react';
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import defaultprofile from '../../assets/img/testimonials-2.jpg'
import { Link, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AddEvent } from './AddEvent';
import { ViewMyEvent } from './ViewMyEvent';
import axios from 'axios';
import { UpdateEvent } from './UpdateEvent';
import { MyTickets } from './MyTickets';
// import { BookedTickets } from '../BookedTickets';
import { BookingsOfMyEvents } from './BookingOfMyEvents';
import { UserFeedback } from '../user/UserFeedBack';
import { ViewEvents } from '../user/ViweEvents';

export const OrganizerHeroPage = () => {

  const [userName, setuserName] = useState()

  useEffect(()=>{
    const fatchUser = async ()=>{
      const userId = localStorage.getItem("organizerId") //for organizer Name on Navbar
      if(!userId) return

      try{
        const res = await axios.get(`/organizer/${userId}`)
        const user = res.data.data

        const name = `${user.name}`
        setuserName(name)
    }catch(error){
      console.error("error fatching user",error)

    }
  }
  fatchUser();
},[])

  const signout = ()=>{
    if (window.confirm("Are you sure you want to SignOut?")) {
    localStorage.clear(); // OR just remove specific items
    window.location.href = "/organizersignin";
  }

  }
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" id="navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">EventEase</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="nav nav-pills me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#viewevent">MyEvents</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#addevent">AddEvents</a>
                {/* <Link to="organizer/addevent" className="nav-link">Events</Link> */}

              </li>
              <li className="nav-item">
                <Link to="/bookingofmyevents" className="nav-link">Tickets</Link>
                {/* <a className="nav-link" href="/bookedtickets">Tickets</a> */}
                {/* <Link to="organizer/addevent" className="nav-link">Events</Link> */}
              </li>
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
                  <li style={{textAlign:'center'}}><a className="dropdown-item" href="/bookedtickets">MyTickets</a></li>
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
                   <span className="fw-bold">{userName}</span>
                 </li>
              </ul>

            <ul className="navbar-nav mb-2 mb-lg-0">
              {/* <li className='nav-item'>
                <a><span className='d-none d-md-inline'>{userName}</span></a>
              </li> */}
              <li className="nav-item">
                {/* <Link to="/" className="btn btn-outline-danger" onClick={signout}>SignOut</Link> */}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
         <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="2000">
        <div className="carousel-inner" style={{ height: '500px' }}>
          {[img2, img1, img3].map((img, index) => (
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
              <h1 style={{color:'#ffffff', float:"inline-start"}}>Welcome Back!</h1><p>EventEase</p>
              {/* <p>Event</p><p>Ease</p> */}
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
         
       <div id='events'>
        <ViewEvents/>
       </div>
      {/* <MyTickets/> */}
      {/* <BookingsOfMyEvents/> */}
      <div id='viewevent'>
      <ViewMyEvent/>
      </div>
      <div id='addevent'>
      <AddEvent/>
      </div>

      
           <div>
            <UserFeedback/>
           </div>
      
            {/* Footer */}
            <footer className="footer bg-light py-4">
              <div className="container">
                <div className="row">
                  <div className="col-lg-6 text-center text-lg-start">
                    <ul className="list-inline mb-2">
                      <li className="list-inline-item"><a href="#aboutus">About</a></li>
                      <li className="list-inline-item">⋅</li>
                      <li className="list-inline-item"><a href="#!">Contact</a></li>
                    </ul>
                    <p className="text-muted small mb-0">© EventEase 2025. All rights reserved.</p>
                  </div>
                  <div className="col-lg-6 text-center text-lg-end">
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item me-3"><a href="#"><i className="bi-facebook fs-3" /></a></li>
                      <li className="list-inline-item me-3"><a href="#"><i className="bi-twitter fs-3" /></a></li>
                      <li className="list-inline-item"><a href="#"><i className="bi-instagram fs-3" /></a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </footer>
      {/* <UpdateEvent/> */}
      <Outlet></Outlet>
    </div>
  );
};
