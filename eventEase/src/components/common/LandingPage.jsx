import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import img4 from '../../assets/img/event.webp'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { UserFeedback } from '../user/UserFeedBack';
import { ContactUs } from './ContactUs';

export const LandingPage = () => {
  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });

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
              <li className="nav-item"><a className="nav-link" href="#aboutus">About Us</a></li>
              <li className="nav-item"><a className="nav-link" href="#events">Events</a></li>
              <li className="nav-item"><a className="nav-link" href="#contactus">Contact Us</a></li>

            </ul>
            <div className="d-flex">
              <Link to="/signup" className="btn btn-outline-primary sm me-2">SignUp</Link>
              <Link to="/signin" className="btn btn-outline-primary sm">SignIn</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Carousel */}
      <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" style={{marginTop:"50px"}}>
        <div className="carousel-inner" style={{ height: '500px',  }}>
          {[img4, img2, img3, img1].map((img, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '600px',
                backgroundAttachment:'fixed'
              }}
            >
              <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100">
                <h1 style={{ color: '#ffffff' }}>Welcome to!</h1>
                <p>EventEase</p>
                {/* <Link to="/organizersignup" className="btn btn-primary mt-3"><b>Organize The Event</b></Link> */}
                 <Link to="/organizersignup" className="btn btn-lg" style={{backgroundColor: '#ffffff', color: '#4e54c8',
                  fontWeight: 'bold',
                  padding: '12px 30px',
                  borderRadius: '50px',
                  transition: '0.3s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#8f94fb';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#4e54c8';
            }}
          >
            Organize The Events
          </Link>
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

      {/* About Us */}
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
      <section className="showcase" id="events">
        <div className="container-fluid p-0">
          {[{ img: img1, text: "Empowering organizers. Connecting communities. Making events effortless." },
          { img: img2, text: "A vibrant platform where ideas turn into unforgettable experiences." },
          { img: img3, text: "Your journey to organize or attend the perfect event begins here." }
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

      {/* Testimonials */}
      <div>
        <UserFeedback />
      </div>

      {/* Call to Action */}
      <section
        className="text-white text-center"
        style={{
          background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
          padding: '80px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="container d-flex justify-content-center align-items-center flex-column"
          style={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '40px 20px',
            maxWidth: '600px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h2 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
            Let’s Make Your Event Unforgettable!
          </h2>
          <p className="mb-4" style={{ fontSize: '1.2rem' }}>
            Join EventEase and be part of the most exciting event community!
          </p>
          <Link
            to="/signup"
            className="btn btn-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#4e54c8',
              fontWeight: 'bold',
              padding: '12px 30px',
              borderRadius: '50px',
              transition: '0.3s ease-in-out',
              backgroundAttachment:'fixed'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#8f94fb';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#4e54c8';
            }}
          >
            Sign Up Now
          </Link>
        </div>
      </section>

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

      <Outlet />
    </div>
  );
};



// import React, { useEffect, useState } from 'react';
// import { Link, Outlet } from 'react-router-dom';
// import img1 from '../../assets/img/hero-bg.jpg';
// import img2 from '../../assets/img/page-title-bg.webp';
// import img3 from '../../assets/img/speaker.jpg';
// import user1 from '../../assets/img/testimonials-1.jpg';
// import user2 from '../../assets/img/testimonials-2.jpg';
// import user3 from '../../assets/img/testimonials-3.jpg';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import axios from 'axios';
// import { UserFeedback } from '../user/UserFeedBack';
// import { ContactUs } from './ContactUs';

// export const LandingPage = () => {

//   const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });

// useEffect(() => {
//   const fetchStats = async () => {
//     try {
//       const res = await axios.get("/event/geteventstats"); // change if your endpoint is different
//       // console.log("api response",res.data)
//       setEventStats(res.data);
//     } catch (err) {
//       console.error("Failed to fetch event stats", err);
//     }
//   };

//   fetchStats();
// }, []);


//   return (
//     <div>
//       {/* Navigation */}
//       <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" id="navbar">
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
//               <li className="nav-item"><a className="nav-link" href="#aboutus">About Us</a></li>
//               <li className="nav-item"><a className="nav-link" href="#events">Events</a></li>
//             </ul>
//             <div className="d-flex">
//               <Link to="/signup" className="btn btn-outline-primary me-2">SignUp</Link>
//               <Link to="/signin" className="btn btn-outline-primary">SignIn</Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Carousel */}
//       <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000">
//   <div className="carousel-inner" style={{ height: '500px' }}>
//     {[img1, img2, img3].map((img, index) => (
//       <div
//         key={index}
//         className={`carousel-item ${index === 0 ? 'active' : ''}`}
//         style={{
//           backgroundImage: `url(${img})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           height: '600px',
//           // backgroundRepeat: 'no-repeat'
//         }}
//       >
//         <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100">
//               <h1 style={{color:'#ffffff', float:"inline-start"}}>Welcome to!</h1><p>EventEase</p>
//           <Link to="/organizersignup" className="btn btn-primary mt-3"><b>Organize The Event</b></Link>
//         </div>
//       </div>
//     ))}
//   </div>

//   <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
//     <span className="carousel-control-prev-icon" aria-hidden="true" />
//     <span className="visually-hidden">Previous</span>
//   </button>
//   <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
//     <span className="carousel-control-next-icon" aria-hidden="true" />
//     <span className="visually-hidden">Next</span>
//   </button>
// </div>

//       {/* About Us Section */}
//       <section className="features-icons bg-light text-center" id="aboutus">
//   <div className="container">
//     <h2 className="mb-4">About Us</h2>
//     <p className="lead mb-5">
//   <strong>EventEase</strong> is your all-in-one platform for discovering, organizing, and managing events with ease. 
//   Whether you're a passionate attendee or a professional organizer, EventEase connects people through seamless, innovative event experiences.
//   </p>
//     <div className="row">
//       <div className="col-lg-4">
//         <div className="features-icons-item mx-auto mb-5">
//           <h3>Total Events</h3>
//           <p className="lead mb-0 display-6">{eventStats.totalEvents}</p>
//         </div>
//       </div>
//       <div className="col-lg-4">
//         <div className="features-icons-item mx-auto mb-5">
//           <h3>Active Events</h3>
//           <p className="lead mb-0 display-6">{eventStats.activeEvents}</p>
//         </div>
//       </div>
//       <div className="col-lg-4">
//         <div className="features-icons-item mx-auto mb-5">
//           <h3>Community Growth</h3>
//           <p className="lead mb-0">Join thousands of organizers!</p>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

//       {/* <section className="features-icons bg-light text-center" id="aboutus">
//         <div className="container">
//           <div className="row">
//             <div className="col-lg-4">
//               <div className="features-icons-item mx-auto mb-5">
//                 <div className="features-icons-icon d-flex">
//                   <i className="bi-window m-auto text-primary" />
//                 </div>
//                 <h3>Fully Responsive</h3>
//                 <p className="lead mb-0">Looks great on all screen sizes!</p>
//               </div>
//             </div>
//             <div className="col-lg-4">
//               <div className="features-icons-item mx-auto mb-5">
//                 <div className="features-icons-icon d-flex">
//                   <i className="bi-layers m-auto text-primary" />
//                 </div>
//                 <h3>Bootstrap 5 Ready</h3>
//                 <p className="lead mb-0">Built with the latest Bootstrap 5 framework!</p>
//               </div>
//             </div>
//             <div className="col-lg-4">
//               <div className="features-icons-item mx-auto mb-5">
//                 <div className="features-icons-icon d-flex">
//                   <i className="bi-terminal m-auto text-primary" />
//                 </div>
//                 <h3>Easy to Use</h3>
//                 <p className="lead mb-0">Simple to customize and deploy!</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section> */}

//       {/* Events Showcase */}
//       <section className="showcase" id="events">
//         <div className="container-fluid p-0">
//           {[{ img: img1, heading: "", text: "Empowering organizers. Connecting communities. Making events effortless." },
//             { img: img2, heading: "", text:  "A vibrant platform where ideas turn into unforgettable experiences." },
//             { img: img3, heading: "", text: "Your journey to organize or attend the perfect event begins here." }
//           ].map((item, i) => (
//             <div className="row g-0" key={i}>
//               <div className={`col-lg-6 ${i % 2 === 0 ? "order-lg-2" : ""} text-white showcase-img`}
//                 style={{ backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
//               <div className="col-lg-6 my-auto showcase-text">
//                 <h2>{item.heading}</h2>
//                 <p className="lead mb-0">{item.text}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Testimonials */}
//       <div>
//        <UserFeedback/>
//        </div>
//       {/* <section className="testimonials text-center bg-light">
//         <div className="container">
//           <h2 className="mb-5">What People Are Saying</h2>
//           <div className="row">
//             {[{ img: user3, name: "Margaret E.", text: "This is fantastic!" },
//               { img: user2, name: "Fred S.", text: "Amazing event platform." },
//               { img: user1, name: "Sarah W.", text: "Great experience!" }
//             ].map((t, i) => (
//               <div className="col-lg-4" key={i}>
//                 <div className="testimonial-item mx-auto mb-5">
//                   <img className="img-fluid rounded-circle mb-3" src={t.img} alt={t.name} />
//                   <h5>{t.name}</h5>
//                   <p className="font-weight-light mb-0">"{t.text}"</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section> */}

//       {/* Call to Action */}
//      <section
//   className="text-white text-center"
//   style={{
//     background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
//     padding: '80px 0',
//     position: 'relative',
//     overflow: 'hidden',
//   }}
// >
//   <div
//     className="container d-flex justify-content-center align-items-center flex-column"
//     style={{
//       backdropFilter: 'blur(10px)',
//       backgroundColor: 'rgba(255, 255, 255, 0.1)',
//       borderRadius: '20px',
//       padding: '40px 20px',
//       maxWidth: '600px',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
//     }}
//   >
//     <h2 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
//       Let’s Make Your Event Unforgettable!
//     </h2>
//     <p className="mb-4" style={{ fontSize: '1.2rem' }}>
//       Join EventEase and be part of the most exciting event community!
//     </p>
//     <Link
//       to="/signup"
//       className="btn btn-lg"
//       style={{
//         backgroundColor: '#ffffff',
//         color: '#4e54c8',
//         fontWeight: 'bold',
//         padding: '12px 30px',
//         borderRadius: '50px',
//         transition: '0.3s ease-in-out',
//       }}
//       onMouseEnter={(e) => {
//         e.target.style.backgroundColor = '#8f94fb';
//         e.target.style.color = '#fff';
//       }}
//       onMouseLeave={(e) => {
//         e.target.style.backgroundColor = '#ffffff';
//         e.target.style.color = '#4e54c8';
//       }}
//     >
//       Sign Up Now
//     </Link>
//   </div>
// </section>

//       {/* Footer */}
//       <footer
//   className="text-white pt-5 pb-4"
//   style={{
//     background: 'linear-gradient(135deg, #1f1c2c, #928dab)',
//     position: 'relative',
//     zIndex: 1,
//   }}
// >
//   <div className="container">
//     <div className="row align-items-center mb-4">
//       <div className="col-lg-4 text-center text-lg-start mb-3 mb-lg-0">
//         <h4 className="fw-bold">EventEase</h4>
//         <p className="text-light small mb-2">© 2025 EventEase. All rights reserved.</p>
//       </div>

//       <div className="col-lg-4 text-center">
//         <ul className="list-inline mb-2">
//           <li className="list-inline-item mx-2">
//             <a href="#aboutus" className="text-light text-decoration-none fw-medium">
//               About
//             </a>
//           </li>
//           <li className="list-inline-item mx-2 text-light">⋅</li>
//           <li className="list-inline-item mx-2">
//             <a href="#contactus" className="text-light text-decoration-none fw-medium">
//               Contact
//             </a>
//           </li>
//         </ul>
//       </div>

//       <div className="col-lg-4 text-center text-lg-end">
//         <ul className="list-inline mb-0">
//           <li className="list-inline-item mx-2">
//             <a href="#" className="text-light fs-4">
//               <i className="bi bi-facebook"></i>
//             </a>
//           </li>
//           <li className="list-inline-item mx-2">
//             <a href="#" className="text-light fs-4">
//               <i className="bi bi-twitter"></i>
//             </a>
//           </li>
//           <li className="list-inline-item mx-2">
//             <a href="#" className="text-light fs-4">
//               <i className="bi bi-instagram"></i>
//             </a>
//           </li>
//         </ul>
//       </div>
//     </div>

   
  




//       <Outlet></Outlet>
//     </div>
    
//   );
// };



  





