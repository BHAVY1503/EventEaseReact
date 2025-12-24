import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { LandingPage } from './components/common/LandingPage'
import { SignUpPageWithLanding } from './SignupPagewithLanding'
import { SigninPageWithLanding } from './SiginPagewithLanding'
import axios from 'axios'
import { useAppSelector } from './store/hooks'
import { OrganizerWithLanding } from './organizerWithlandig'
import { OrganizerSigninLanding } from './OrganizerSiginLanding'
import { AddEvent } from './components/organizer/AddEvent'
import { ViewMyEvent } from './components/organizer/ViewMyEvent'
import { UpdateEvent } from './components/organizer/UpdateEvent'
import ViewEvents from './components/user/ViweEvents'
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
import { AdminLanding } from './AdminLanding'
import { AdminEvents } from './components/admin/AdminEvents'
import { AdminInbox } from './components/admin/AdminInbox'
import { UserDashboard } from './components/user/UserDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { VerifyPage } from './components/common/VerifyPage'
import { VerifyOrganizer } from './components/common/VerifyOrganizer'
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard'
import { AdminRefundRequests } from './components/admin/AdminRefundRequests'

function App() {
	axios.defaults.baseURL = "http://localhost:3100"

	const navigate = useNavigate();
	const authToken = useAppSelector((s) => s.auth.token);
	const authRole = useAppSelector((s) => s.auth.user?.roleId?.name || null);

	useEffect(() => {
		// keep axios default header in sync
		if (authToken) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
		} else {
			delete axios.defaults.headers.common["Authorization"];
		}

		// navigate according to role when token changes
		if (authRole === 'Organizer') navigate('/organizer');
		else if (authRole === 'User') navigate('/user');
		else if (authRole === 'Admin') navigate('/admin');
	}, [authToken, authRole, navigate]);

	return (
		<Routes>
			{/* Public Routes */}
			<Route path="/" element={<LandingPage/>} />
			<Route path="/signup" element={<SignUpPageWithLanding />} />
			<Route path="/signin" element={<SigninPageWithLanding />} />
			<Route path="/adminsignin" element={<AdminLanding/>} />
			<Route path="/organizersignup" element={<OrganizerWithLanding/>} />
			<Route path="/organizersignin" element={<OrganizerSigninLanding/>} />
			<Route path='/mappicker' element={<MapPicker/>} />
			<Route path="/verify/:token" element={<VerifyPage />} />
			<Route path="/organizer/verify/:token" element={<VerifyOrganizer />} />
			<Route path='/contactus' element={<ContactUs/>} />

			{/* Protected Routes */}
			<Route element={<PrivateRoute/>}>
				{/* Admin Routes */}
				<Route path='/admin' element={<AdminDashboard/>}>
					<Route path='groupedbyevent' element={<GroupedByEvents/>} />
					<Route path='addstadium' element={<AddStadiumForm/>} />
					<Route path='stadiums' element={<ViewStadiums/>} />
					<Route path='adminevents' element={<AdminEvents/>} />
				</Route>
				<Route path='/admin/editstadium/:id' element={<UpdateStadium/>} />
				<Route path='/alleventsticket' element={<AllEventBookings/>} />
				<Route path='/allusers' element={<AllUsers/>} />
				<Route path='/allorganizer' element={<AllOrganizers/>} />
				<Route path='/admininbox' element={<AdminInbox/>} />
				<Route path="/admin/refunds" element={<AdminRefundRequests />} />

				{/* Organizer Routes */}
				<Route path="/organizer" element={<OrganizerDashboard />}>
					<Route path="addevent" element={<AddEvent />} />
					<Route path="viewevent" element={<ViewMyEvent />} />
				</Route>
				<Route path="/stadiumselect" element={<StadiumSelector />} />
				<Route path="/bookedtickets" element={<BookedTickets />} />
				<Route path="/bookingofmyevents" element={<BookingsOfMyEvents />} />
				<Route path="/updateevent/:id" element={<UpdateEvent />} />
				<Route path="/mytickets" element={<MyTickets />} />

				{/* User Routes */}
				<Route path='/user' element={<UserDashboard/>}>
					<Route path='viewevents' element={<ViewEvents/>} />
					<Route path='userfeedback' element={<UserFeedback/>} />
				</Route>
				<Route path='/select-seats/:id' element={<SeatSelectionPage/>} />
			</Route>
		</Routes>
	)
}

export default App
