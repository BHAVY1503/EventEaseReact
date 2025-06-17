import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import img1 from '../../assets/img/hero-bg.jpg';
import img2 from '../../assets/img/page-title-bg.webp';
import img3 from '../../assets/img/speaker.jpg';
import user1 from '../../assets/img/testimonials-1.jpg';
import user2 from '../../assets/img/testimonials-2.jpg';
import user3 from '../../assets/img/testimonials-3.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';

export const LandingPage = () => {

  const [eventStats, setEventStats] = useState({ totalEvents: 0, activeEvents: 0 });

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
              <li className="nav-item"><a className="nav-link" href="#aboutus">About Us</a></li>
              <li className="nav-item"><a className="nav-link" href="#events">Events</a></li>
            </ul>
            <div className="d-flex">
              <Link to="/signup" className="btn btn-outline-primary me-2">SignUp</Link>
              <Link to="/signin" className="btn btn-outline-primary">SignIn</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Carousel */}
      <div id="carouselExample" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000">
  <div className="carousel-inner" style={{ height: '500px' }}>
    {[img1, img2, img3].map((img, index) => (
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
          <Link to="/organizersignup" className="btn btn-primary mt-3"><b>Organize The Event</b></Link>
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

      {/* About Us Section */}
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

      {/* <section className="features-icons bg-light text-center" id="aboutus">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="features-icons-item mx-auto mb-5">
                <div className="features-icons-icon d-flex">
                  <i className="bi-window m-auto text-primary" />
                </div>
                <h3>Fully Responsive</h3>
                <p className="lead mb-0">Looks great on all screen sizes!</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="features-icons-item mx-auto mb-5">
                <div className="features-icons-icon d-flex">
                  <i className="bi-layers m-auto text-primary" />
                </div>
                <h3>Bootstrap 5 Ready</h3>
                <p className="lead mb-0">Built with the latest Bootstrap 5 framework!</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="features-icons-item mx-auto mb-5">
                <div className="features-icons-icon d-flex">
                  <i className="bi-terminal m-auto text-primary" />
                </div>
                <h3>Easy to Use</h3>
                <p className="lead mb-0">Simple to customize and deploy!</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Events Showcase */}
      <section className="showcase" id="events">
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

      {/* Testimonials */}
      <section className="testimonials text-center bg-light">
        <div className="container">
          <h2 className="mb-5">What People Are Saying</h2>
          <div className="row">
            {[{ img: user3, name: "Margaret E.", text: "This is fantastic!" },
              { img: user2, name: "Fred S.", text: "Amazing event platform." },
              { img: user1, name: "Sarah W.", text: "Great experience!" }
            ].map((t, i) => (
              <div className="col-lg-4" key={i}>
                <div className="testimonial-item mx-auto mb-5">
                  <img className="img-fluid rounded-circle mb-3" src={t.img} alt={t.name} />
                  <h5>{t.name}</h5>
                  <p className="font-weight-light mb-0">"{t.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="call-to-action text-white text-center bg-primary">
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <h2 className="mb-4">Ready to get started? Sign up now!</h2>
              <Link to="/signup" className="btn btn-light"><b>Sign Up Now</b></Link>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
};


// import React from 'react'
// import img1 from '../../assets/img/hero-bg.jpg'
// import img2 from '../../assets/img/page-title-bg.webp'
// import img3 from '../../assets/img/speaker.jpg'
// import user1 from '../../assets/img/testimonials-1.jpg'
// import user2 from '../../assets/img/testimonials-2.jpg'
// import user3 from '../../assets/img/testimonials-3.jpg'
// import { Link } from 'react-router-dom'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // This is REQUIRED for carousel to work




// export const LandingPage = () => {

  
//   return (
//     <div>
//       <>
//   <meta charSet="utf-8" />
//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1, shrink-to-fit=no"
//   />
//   <meta name="description" content="" />
//   <meta name="author" content="" />
//   <title>Landing Page - Start Bootstrap Theme</title>
//   {/* Favicon*/}
//   <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
//   {/* Bootstrap icons*/}
//   <link
//     href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css"
//     rel="stylesheet"
//     type="text/css"
//   />
//   {/* Google fonts*/}
//   <link
//     href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic"
//     rel="stylesheet"
//     type="text/css"
//   />
//   {/* Core theme CSS (includes Bootstrap)*/}
//   <link href="css/styles.css" rel="stylesheet" />
//   {/* Navigation*/}
  
//   <body data-bs-spy="scroll" data-bs-target="#navbar" data-offset="150px">
//    <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" id="navbar">
//   <div class="container-fluid">
//     <a class="navbar-brand" href="#">EventEase</a>
//     <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
//       <span class="navbar-toggler-icon"></span>
//     </button>
//     <div class="collapse navbar-collapse" id="navbarSupportedContent">
//       {/* <ul className="navbar-nav me-auto mb-2 mb-lg-0 nav nav-pills"> */}
//         <ul className="nav nav-pills me-auto mb-2 mb-lg-0">

//         <li class="nav-item">
//           <a class="nav-link" href="#">Home</a>
//         </li>
//         <li class="nav-item">
//           <a class="nav-link" href="#aboutus">AboutUs</a>
//         </li>
//         <li class="nav-item">
//           <a class="nav-link" href="#events">Events</a>
//         </li>
//         {/* <li class="nav-item">
//           <a class="nav-link" href="#footer">footer</a>
//         </li> */}
//       </ul>

//       <form class="d-flex" role="search">
       
//     <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//       <li className="nav-item">
//     <Link to="/signup" className="btn btn-outline-primary me-2">SignUp</Link>
//      </li>
//       <li className="nav-item">
//       <Link to="/signin" className="btn btn-outline-primary">SignIn</Link>
//      </li>
//      </ul>

//       </form>
//     </div>
//   </div>
// </nav>
//   {/* Masthead */}
//   <div
//         id="carouselExampleSlidesOnly"
//         className="carousel slide"
//         data-bs-ride="carousel"
//         data-bs-interval="2000"
//       >
//         <div className="carousel-inner" style={{ height: '600px' }}>
//           <div className="carousel-item active">
//             <img src={img1} className="d-block w-100" alt="..." />
//             <div className="carousel-caption d-none d-md-block">
//             <Link to="/organizersignup" className="btn btn-primary" style={{height:"35px", width:"200px", size:"120px"}}><b>Organize TheEvent</b></Link>
//              </div>
//           </div>
//           <div className="carousel-item">
//             <img src={img2} className="d-block w-100" alt="..." />
//           </div>
//           <div className="carousel-item">
//             <img src={img3} className="d-block w-100" alt="..." />
//           </div>
//         </div>
//       </div>


//   {/* <header className="masthead">
//     <div className="container position-relative" id='jumbotron'>
//       <div className="row justify-content-center">
//         <div className="col-xl-6">
//           <div className="text-center text-white">
//              Page heading
//             <h1 className="mb-5">
//               Generate more leads with a professional landing page!
//             </h1>
//             <Link to="/organizersignup" className="btn btn-primary" style={{height:"35px", width:"200px", size:"120px"}}><b>Organize TheEvent</b></Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   </header> */}
//   {/* Icons Grid*/}
//   <section className="features-icons bg-light text-center">
//     <div className="container" id='aboutus'>
//       <div className="row">
//         <div className="col-lg-4">
//           <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
//             <div className="features-icons-icon d-flex">
//               <i className="bi-window m-auto text-primary" />
//             </div>
//             <h3>Fully Responsive</h3>
//             <p className="lead mb-0">
//               This theme will look great on any device, no matter the size!
//             </p>
//           </div>
//         </div>
//         <div className="col-lg-4">
//           <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
//             <div className="features-icons-icon d-flex">
//               <i className="bi-layers m-auto text-primary" />
//             </div>
//             <h3>Bootstrap 5 Ready</h3>
//             <p className="lead mb-0">
//               Featuring the latest build of the new Bootstrap 5 framework!
//             </p>
//           </div>
//         </div>
//         <div className="col-lg-4">
//           <div className="features-icons-item mx-auto mb-0 mb-lg-3">
//             <div className="features-icons-icon d-flex">
//               <i className="bi-terminal m-auto text-primary" />
//             </div>
//             <h3>Easy to Use</h3>
//             <p className="lead mb-0">
//               Ready to use with your own content, or customize the source files!
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
//   {/* Image Showcases*/}
//   <section className="showcase">
//     <div className="container-fluid p-0" id='events'>
//       <div className="row g-0">
//         <div
//           className="col-lg-6 order-lg-2 text-white showcase-img"
//          style={{ backgroundImage: `url(${img1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
//           >        </div>

//         <div className="col-lg-6 order-lg-1 my-auto showcase-text">
//           <h2>Fully Responsive Design</h2>
//           <p className="lead mb-0">
//             When you use a theme created by Start Bootstrap, you know that the
//             theme will look great on any device, whether it's a phone, tablet,
//             or desktop the page will behave responsively!
//           </p>
//         </div>
//       </div>
//       <div className="row g-0">
//         <div
//           className="col-lg-6 text-white showcase-img"
//          style={{ backgroundImage: `url(${img2})`, backgroundSize: 'cover', backgroundPosition: 'center' }}

//           // style={{ backgroundImage: 'url("assets/img/bg-showcase-2.jpg")' }}
//         />
//         <div className="col-lg-6 my-auto showcase-text">
//           <h2>Updated For Bootstrap 5</h2>
//           <p className="lead mb-0">
//             Newly improved, and full of great utility classes, Bootstrap 5 is
//             leading the way in mobile responsive web development! All of the
//             themes on Start Bootstrap are now using Bootstrap 5!
//           </p>
//         </div>
//       </div>
//       <div className="row g-0">
//         <div
//           className="col-lg-6 order-lg-2 text-white showcase-img"
//          style={{ backgroundImage: `url(${img3})`, backgroundSize: 'cover', backgroundPosition: 'center' }}

//           // style={{ backgroundImage: 'url("assets/img/bg-showcase-3.jpg")' }}
//         />
//         <div className="col-lg-6 order-lg-1 my-auto showcase-text">
//           <h2>Easy to Use &amp; Customize</h2>
//           <p className="lead mb-0">
//             Landing Page is just HTML and CSS with a splash of SCSS for users
//             who demand some deeper customization options. Out of the box, just
//             add your content and images, and your new landing page will be ready
//             to go!
//           </p>
//         </div>
//       </div>
//     </div>
//   </section>
//   {/* Testimonials*/}
//   <section className="testimonials text-center bg-light">
//     <div className="container">
//       <h2 className="mb-5">What people are saying...</h2>
//       <div className="row">
//         <div className="col-lg-4">
//           <div className="testimonial-item mx-auto mb-5 mb-lg-0">
//             <img
//               className="img-fluid rounded-circle mb-3"
//               src={user3}
//               // src="assets/img/testimonials-1.jpg"
//               alt="..."
//             />
//             <h5>Margaret E.</h5>
//             <p className="font-weight-light mb-0">
//               "This is fantastic! Thanks so much guys!"
//             </p>
//           </div>
//         </div>
//         <div className="col-lg-4">
//           <div className="testimonial-item mx-auto mb-5 mb-lg-0">
//             <img
//               className="img-fluid rounded-circle mb-3"
//               src={user2}
//               // src="assets/img/testimonials-2.jpg"
//               alt="..."
//             />
//             <h5>Fred S.</h5>
//             <p className="font-weight-light mb-0">
//               "Bootstrap is amazing. I've been using it to create lots of super
//               nice landing pages."
//             </p>
//           </div>
//         </div>
//         <div className="col-lg-4">
//           <div className="testimonial-item mx-auto mb-5 mb-lg-0">
//             <img
//               className="img-fluid rounded-circle mb-3"
//               // src="assets/img/testimonials-3.jpg"
//               src={user1}
//               alt="..."
//             />
//             <h5>Sarah W.</h5>
//             <p className="font-weight-light mb-0">
//               "Thanks so much for making these free resources available to us!"
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
//   {/* Call to Action*/}
//   <section className="call-to-action text-white text-center" id="signup">
//     <div className="container position-relative">
//       <div className="row justify-content-center">
//         <div className="col-xl-6">
//           <h2 className="mb-4">Ready to get started? Signup now! and partisipates at Events around you</h2>
//             <Link to="/signup" className="btn btn-primary" style={{height:"35px", width:"200px", size:"120px"}}><b>Sign Up now</b></Link>
           
// {/*          
//               <div className="col-auto">
//                 <button
//                   className="btn btn-primary btn-lg disabled"
//                   id="submitButton"
//                   type="submit"
//                 >
//                   Submit
//                 </button>
//               </div> */}
//             </div>
           
           
          
//         </div>
//       </div>
//     {/* </div> */}
//   </section>
//   {/* Footer*/}
//   <footer className="footer bg-light">
//     <div className="container" id='footer'>
//       <div className="row">
//         <div className="col-lg-6 h-100 text-center text-lg-start my-auto">
//           <ul className="list-inline mb-2">
//             <li className="list-inline-item">
//               <a href="#!">About</a>
//             </li>
//             <li className="list-inline-item">⋅</li>
//             <li className="list-inline-item">
//               <a href="#!">Contact</a>
//             </li>
//             <li className="list-inline-item">⋅</li>
//             <li className="list-inline-item">
//               <a href="#!">Terms of Use</a>
//             </li>
//             <li className="list-inline-item">⋅</li>
//             <li className="list-inline-item">
//               <a href="#!">Privacy Policy</a>
//             </li>
//           </ul>
//           <p className="text-muted small mb-4 mb-lg-0">
//             © Your Website 2023. All Rights Reserved.
//           </p>
//         </div>
//         <div className="col-lg-6 h-100 text-center text-lg-end my-auto">
//           <ul className="list-inline mb-0">
//             <li className="list-inline-item me-4">
//               <a href="#!">
//                 <i className="bi-facebook fs-3" />
//               </a>
//             </li>
//             <li className="list-inline-item me-4">
//               <a href="#!">
//                 <i className="bi-twitter fs-3" />
//               </a>
//             </li>
//             <li className="list-inline-item">
//               <a href="#!">
//                 <i className="bi-instagram fs-3" />
//               </a>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   </footer>
//   </body>
  
// </>
//     </div>
//   )
// }



