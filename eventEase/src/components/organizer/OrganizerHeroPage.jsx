import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import axios from 'axios';

import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp';
import defaultprofile from '../../assets/img/testimonials-2.jpg';

import { AddEvent } from './AddEvent';
import { ViewMyEvent } from './ViewMyEvent';
import { UserFeedback } from '../user/UserFeedBack';
import { ViewEvents } from '../user/ViweEvents';
import { ContactUs } from '../common/ContactUs';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export const OrganizerHeroPage = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchOrganizer = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("organizer/organizer/self", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = res.data.data;
        setUserName(user.name);
      } catch (error) {
        console.error("Error fetching organizer:", error);
      }
    };

    fetchOrganizer();
  }, []);

  const signout = () => {
    if (window.confirm("Are you sure you want to SignOut?")) {
      localStorage.clear();
      window.location.href = "/organizersignin";
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
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
              <li className="nav-item"><a className="nav-link" href="#viewevent">MyEvents</a></li>
              <li className="nav-item"><a className="nav-link" href="#addevent">AddEvents</a></li>
              <li className="nav-item"><a className="nav-link" href="#contactus">ContactUs</a></li>
              <li className="nav-item"><Link to="/bookingofmyevents" className="nav-link">Tickets</Link></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  Menu
                </a>
                <ul className="dropdown-menu">
                  <li className="text-center">
                    <a className="dropdown-item" href="/bookedtickets">MyTickets</a>
                  </li>
                  <li className="text-center">
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
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" style={{ marginTop: "56px" }}>
        <div className="carousel-inner" style={{ height: '600px' }}>
          {[img3, img2, img1, img4].map((img, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '600px',
              }}
            >
              <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100">
                <h1 style={{ color: '#fff' }}>Welcome Back!</h1>
                <p>EventEase</p>
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

      {/* Events Section */}
      <div id='events'><ViewEvents /></div>
      <div id='viewevent'><ViewMyEvent /></div>
      <div id='addevent'><AddEvent /></div>
      <div><UserFeedback /></div>

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


// import React, { useEffect, useState } from 'react';
// import img1 from '../../assets/img/hero-bg.jpg';
// import img2 from '../../assets/img/page-title-bg.webp';
// import img3 from '../../assets/img/speaker.jpg';
// import img4 from '../../assets/img/event.webp'
// import defaultprofile from '../../assets/img/testimonials-2.jpg'
// import { Link, Outlet } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { AddEvent } from './AddEvent';
// import { ViewMyEvent } from './ViewMyEvent';
// import axios from 'axios';
// import { UpdateEvent } from './UpdateEvent';
// import { MyTickets } from './MyTickets';
// // import { BookedTickets } from '../BookedTickets';
// import { BookingsOfMyEvents } from './BookingOfMyEvents';
// import { UserFeedback } from '../user/UserFeedBack';
// import { ViewEvents } from '../user/ViweEvents';
// import { ContactUs } from '../common/ContactUs';

// export const OrganizerHeroPage = () => {

//   const [userName, setuserName] = useState()

//   useEffect(()=>{
//     const fatchUser = async ()=>{
//       // const userId = localStorage.getItem("organizerId") //for organizer Name on Navbar
//       const token = localStorage.getItem("token")
//       if(!token) return

//       try{
//         const res = await axios.get(`/organizer/${userId}`)
//         const user = res.data.data

//         const name = `${user.name}`
//         setuserName(name)
//     }catch(error){
//       console.error("error fatching user",error)

//     }
//   }
//   fatchUser();
// },[])

//   const signout = ()=>{
//     if (window.confirm("Are you sure you want to SignOut?")) {
//     localStorage.clear(); // OR just remove specific items
//     window.location.href = "/organizersignin";
//   }

//   }
//   return (
//     <div>
//       <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" id="navbar">
//         <div className="container-fluid">
//           <a className="navbar-brand" href="#">EventEase</a>
//           <button
//             className="navbar-toggler"
//             type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#navbarSupportedContent"
//             aria-controls="navbarSupportedContent"
//             aria-expanded="false"
//             aria-label="Toggle navigation"
//           >
//             <span className="navbar-toggler-icon"></span>
//           </button>
//           <div className="collapse navbar-collapse" id="navbarSupportedContent">
//             <ul className="nav nav-pills me-auto mb-2 mb-lg-0">
//               <li className="nav-item">
//                 <a className="nav-link" href="#">Home</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#viewevent">MyEvents</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#addevent">AddEvents</a>
//                 {/* <Link to="organizer/addevent" className="nav-link">Events</Link> */}
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="#contactus">ContactUs</a>
//               </li>
//               <li className="nav-item">
//                 <Link to="/bookingofmyevents" className="nav-link">Tickets</Link>
//                 {/* <a className="nav-link" href="/bookedtickets">Tickets</a> */}
//                 {/* <Link to="organizer/addevent" className="nav-link">Events</Link> */}
//               </li>
//               <li className="nav-item dropdown">
//                 <a
//                   className="nav-link dropdown-toggle"
//                   href="#"
//                   id="navbarDropdown"
//                   role="button"
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   Dropdown
//                 </a>
//                 <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
//                   <li style={{textAlign:'center'}}><a className="dropdown-item" href="/bookedtickets">MyTickets</a></li>
//                   {/* <li style={{textAlign:'center'}}><a className="dropdown-item" href="#">OrganizerList</a></li> */}
//                   <li style={{textAlign:'center'}}>
//                    <Link to="/" className="btn btn-danger btn-sm" onClick={signout}>SignOut</Link>
//                   </li>
//                 </ul>
//               </li>
//             </ul>
//             <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">
//               <li className="nav-item d-flex align-items-center">
//                  <img
//                    src={defaultprofile}
//                    alt="Profile"
//                    className="rounded-circle me-2"
//                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
//                      />
//                    <span className="fw-bold">{userName}</span>
//                  </li>
//               </ul>

//             <ul className="navbar-nav mb-2 mb-lg-0">
//               {/* <li className='nav-item'>
//                 <a><span className='d-none d-md-inline'>{userName}</span></a>
//               </li> */}
//               <li className="nav-item">
//                 {/* <Link to="/" className="btn btn-outline-danger" onClick={signout}>SignOut</Link> */}
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>
      
//          <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="2000" style={{marginTop:"50px"}}>
//         <div className="carousel-inner" style={{ height: '500px' }}>
//           {[img3, img2, img1,img4].map((img, index) => (
//             <div
//               key={index}
//               className={`carousel-item ${index === 0 ? 'active' : ''}`}
//               style={{
//                 backgroundImage: `url(${img})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 height: '600px',
//                 // backgroundRepeat: 'no-repeat'
//               }}
//             >
//               <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100">
//               <h1 style={{color:'#ffffff', float:"inline-start"}}>Welcome Back!</h1><p>EventEase</p>
//               {/* <p>Event</p><p>Ease</p> */}
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
         
//        <div id='events'>
//         <ViewEvents/>
//        </div>
//       {/* <MyTickets/> */}
//       {/* <BookingsOfMyEvents/> */}
//       <div id='viewevent'>
//       <ViewMyEvent/>
//       </div>
//       <div id='addevent'>
//       <AddEvent/>
//       </div>

      
//            <div>
//             <UserFeedback/>
//            </div>
      
//             {/* Footer */}
//             <footer
//                    className="text-white pt-5 pb-4"
//                    style={{
//                      background: 'linear-gradient(135deg, #1f1c2c, #928dab)',
//                      position: 'relative',
//                      zIndex: 1,
//                    }}
//                  >
//                    <div className="container">
//                      <div className="row align-items-center mb-4">
//                        <div className="col-lg-4 text-center text-lg-start mb-3 mb-lg-0">
//                          <h4 className="fw-bold" style={{color:"#ffffff"}}>EventEase</h4>
//                          <p className="text-light small mb-2">© 2025 EventEase. All rights reserved.</p>
//                        </div>
//                        <div className="col-lg-4 text-center">
//                          <ul className="list-inline mb-2">
//                            <li className="list-inline-item mx-2">
//                              <a href="#aboutus" className="text-light text-decoration-none fw-medium">About</a>
//                            </li>
//                            <li className="list-inline-item mx-2 text-light">⋅</li>
//                            <li className="list-inline-item mx-2">
//                              <a href="#contactus" className="text-light text-decoration-none fw-medium">Contact</a>
//                            </li>
//                          </ul>
//                        </div>
//                        <div className="col-lg-4 text-center text-lg-end">
//                          <ul className="list-inline mb-0">
//                            <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-facebook"></i></a></li>
//                            <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-twitter"></i></a></li>
//                            <li className="list-inline-item mx-2"><a href="#" className="text-light fs-4"><i className="bi bi-instagram"></i></a></li>
//                          </ul>
//                        </div>
//                      </div>
           
//                      {/* ContactUs Form */}
//                      <div className="mt-5" id="contactus">
//                        <ContactUs />
//                      </div>
//                    </div>
//                  </footer>
//       {/* <UpdateEvent/> */}
//       <Outlet></Outlet>
//     </div>
//   );
// };
