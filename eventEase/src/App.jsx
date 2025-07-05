import { useState } from 'react'
// import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { Routes , Route} from 'react-router-dom'
import { LandingPage } from './components/common/LandingPage'
import "./assets/animate.min.css"
// import "./assets/simplebar.min.css"
import "./assets/style.css"
import 'simplebar/dist/simplebar.min.css';
import './assets/main.css'
import './assets/styles.css'
import '../../startbootstrap-landing-page-gh-pages/js/scripts'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// main.jsx or main.tsx
import { SignUpModal } from './components/user/SignupModal'
import { SignUpPageWithLanding } from './SignupPagewithLanding'
// import { SignInModel } from './components/user/SignInModal'
import { SigninPageWithLanding } from './SiginPagewithLanding'
import axios from 'axios'
import { AdminLanding } from './AdminLanding'
import { OrganizerSignup } from './components/organizer/OrganizerSignup'
import { OrganizerWithLanding } from './organizerWithlandig'
import { OrganizerSigninLanding } from './OrganizerSiginLanding'
import { AdminHeroPage } from './components/admin/AdminHeroPage'
import { OrganizerHeroPage } from './components/organizer/OrganizerHeroPage'
import { AddEvent } from './components/organizer/AddEvent'
import { ViewMyEvent } from './components/organizer/ViewMyEvent'
import { UpdateEvent } from './components/organizer/UpdateEvent'
import { UserHero } from './components/user/UserHero'
import { ViewEvents } from './components/user/ViweEvents'
import { BookedTickets } from './components/organizer/BookedTickets'
import { MyTickets } from './components/organizer/MyTickets'
import { UserFeedback } from './components/user/UserFeedBack'
import { BookingsOfMyEvents } from './components/organizer/BookingOfMyEvents'
import MapPicker from './components/common/MapPicker'
import PrivateRoute from './components/common/PrivateRoute'
import { ContactUs } from './components/common/ContactUs'
import { GroupedByEvents } from './components/admin/GroupedByEvents'
import { AllEventBookings } from './components/admin/AllEventsBookings'
import { AllUsers } from './components/admin/AllUsers'
import { AllOrganizers } from './components/admin/AllOrganizers'
import AddStadiumForm from './components/admin/AddStadiumForm'
import ViewStadiums from './components/admin/ViewStadiums'
import { StadiumSelector } from './components/organizer/StadiumSelector'
import { SeatSelectionPage } from './components/user/SeatsSelection'
import UpdateStadium from './components/admin/UpdateStadium'



function App() {

   axios.defaults.baseURL = "http://localhost:3100"
  

  const [count, setCount] = useState(0)

  return (
    
    <Routes>
     <Route path="/" element={<LandingPage/>}></Route>
     {/* <Route path="/signup" element={<SignUpPageWithLanding/>}></Route> */}
     {/* <Route path='/signin' element={<SignUpPageWithLanding/>}></Route> */}
     <Route path="/signup" element={<SignUpPageWithLanding />} />
     <Route path="/signin" element={<SigninPageWithLanding  />} />
     <Route path="/adminsignin" element={<AdminLanding/>} />
     <Route path="/organizersignup" element={<OrganizerWithLanding/>} />
     <Route path="/organizersignin" element={<OrganizerSigninLanding/>} />
      <Route path='/mappicker' element={<MapPicker/>}></Route>

      {/* Admin  */}
      <Route element={<PrivateRoute/>}>
      <Route path='/admin' element={<AdminHeroPage/>}>
      <Route path='groupedbyevent' element={<GroupedByEvents/>}></Route>
      <Route path='addstadium' element={<AddStadiumForm/>}></Route>
      <Route path='stadiums' element={<ViewStadiums/>}></Route>
      <Route path='editstadium/:id' element={<UpdateStadium/>}></Route>



      </Route>
      {/* <Route path='/admin/stadium/edit/:id' element={<UpdateStadium/>}></Route> */}
      <Route path='/alleventsticket' element={<AllEventBookings/>}></Route>
      <Route path='/allusers' element={<AllUsers/>}></Route>
      <Route path='/allorganizer' element={<AllOrganizers/>}></Route>

      
      </Route>

     {/* organizer  */}
     {/* <Route element={<PrivateRoute/>} */}
      <Route element={<PrivateRoute />}>
    <Route path="/organizer" element={<OrganizerHeroPage />}>
      <Route path="addevent" element={<AddEvent />} />
      <Route path="viewevent" element={<ViewMyEvent />} />
    </Route>
      <Route path="/stadiumselect" element={<StadiumSelector />} />

    <Route path="/bookedtickets" element={<BookedTickets />} />
    <Route path="/bookingofmyevents" element={<BookingsOfMyEvents />} />
    <Route path="/updateevent/:id" element={<UpdateEvent />} />
    <Route path="/mytickets" element={<MyTickets />} />
  </Route>
       

    {/* user  */}
    <Route element={<PrivateRoute/>}>
      <Route path='/user' element={<UserHero/>}>
      <Route path='viewevents' element={<ViewEvents/>}></Route>
      <Route path='userfeedback' element={<UserFeedback/>}></Route>
      </Route>
      <Route path='/mytickets' element={<MyTickets/>}></Route>
      <Route path='/select-seats/:id' element={<SeatSelectionPage/>}></Route>


      </Route>

    <Route path='/contactus' element={<ContactUs/>}></Route>

    </Routes>

    
   
  )
}

export default App
