import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { LandingPage } from './components/common/LandingPage'
import { SignUpPageWithLanding } from './SignupPagewithLanding'
import { SigninPageWithLanding } from './SiginPagewithLanding'
import axios from 'axios'
import { useAppSelector } from './store/hooks'
import { OrganizerWithLanding } from './OrganizerWithlandig'
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
import AdminLanding from './AdminLanding'
import { AdminEvents } from './components/admin/AdminEvents'
import { AdminInbox } from './components/admin/AdminInbox'
import { UserDashboard } from './components/user/UserDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { VerifyPage } from './components/common/VerifyPage'
import { VerifyOrganizer } from './components/common/VerifyOrganizer'
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard'
import { AdminRefundRequests } from './components/admin/AdminRefundRequests'
import StarBackground from './components/common/StarBackground'

function App() {
	axios.defaults.baseURL = "https://eventeasenode-js.onrender.com"
	// axios.defaults.baseURL = "http://localhost:3100"


	const navigate = useNavigate();
	const location = useLocation();
	const authToken = useAppSelector((s) => s.auth.token);
	const authRole = useAppSelector((s) => s.auth.user?.roleId?.name || null);

	useEffect(() => {
		// keep axios default header in sync
		if (authToken) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
		} else {
			delete axios.defaults.headers.common["Authorization"];
		}

		// navigate according to role ONLY when first logging in (no token before)
		// Don't redirect if user is already authenticated and navigating within their role
		if (authRole && authToken) {
			const currentPath = location.pathname;
			// Only redirect if they're at a non-protected page and not on a valid organizer/admin/user sub-route
			const isValidPath =
				(authRole === 'Organizer' && (currentPath.startsWith('/organizer') || currentPath.startsWith('/stadiumselect') || currentPath.startsWith('/bookedtickets') || currentPath.startsWith('/updateevent') || currentPath.startsWith('/mytickets') || currentPath.startsWith('/select-seats'))) ||
				(authRole === 'User' && (currentPath.startsWith('/user') || currentPath.startsWith('/select-seats') || currentPath.startsWith('/mytickets'))) ||
				(authRole === 'Admin' && (currentPath.startsWith('/admin') || currentPath.startsWith('/stadiumselect') || currentPath.startsWith('/alleventsticket') || currentPath.startsWith('/allusers') || currentPath.startsWith('/allorganizer') || currentPath.startsWith('/admininbox')));

			if (!isValidPath) {
				if (authRole === 'Organizer') navigate('/organizer');
				else if (authRole === 'User') navigate('/user');
				else if (authRole === 'Admin') navigate('/admin');
			}
		}
	}, [authToken, authRole, navigate, location.pathname]);

	return (
		<>
			<StarBackground />
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<LandingPage />} />
				<Route path="/signup" element={<SignUpPageWithLanding />} />
				<Route path="/signin" element={<SigninPageWithLanding />} />
				<Route path="/adminsignin" element={<AdminLanding />} />
				<Route path="/organizersignup" element={<OrganizerWithLanding />} />
				<Route path="/organizersignin" element={<OrganizerSigninLanding />} />
				<Route path='/mappicker' element={<MapPicker />} />
				<Route path="/verify/:token" element={<VerifyPage />} />
				<Route path="/organizer/verify/:token" element={<VerifyOrganizer />} />
				<Route path='/contactus' element={<ContactUs />} />

				{/* Protected Routes */}
				<Route element={<PrivateRoute />}>
					{/* Admin Routes */}
					<Route path='/admin' element={<AdminDashboard />}>
						<Route path='allevents' element={<ViewEvents />} />
						<Route path='groupedbyevent' element={<GroupedByEvents />} />
						<Route path='addstadium' element={<AddStadiumForm />} />
						<Route path='stadiums' element={<ViewStadiums />} />
						<Route path='adminevents' element={<AdminEvents />} />
						<Route path='addevent' element={<AddEvent />} />
						<Route path='feedback' element={<UserFeedback />} />
					</Route>
					<Route path='/admin/editstadium/:id' element={<UpdateStadium />} />
					<Route path='/alleventsticket' element={<AllEventBookings />} />
					<Route path='/allusers' element={<AllUsers />} />
					<Route path='/allorganizer' element={<AllOrganizers />} />
					<Route path='/admininbox' element={<AdminInbox />} />
					<Route path="/admin/refunds" element={<AdminRefundRequests />} />

					{/* Organizer Routes */}
					<Route path="/organizer" element={<OrganizerDashboard />}>
						<Route path="addevent" element={<AddEvent />} />
						<Route path="viewevent" element={<ViewMyEvent />} />
						<Route path="bookingofmyevents" element={<BookingsOfMyEvents />} />
					</Route>
					<Route path="/stadiumselect" element={<StadiumSelector />} />
					<Route path="/bookedtickets" element={<BookedTickets />} />
					<Route path="/updateevent/:id" element={<UpdateEvent />} />
					<Route path="/mytickets" element={<MyTickets />} />

					{/* User Routes */}
					<Route path='/user' element={<UserDashboard />}>
						<Route path='viewevents' element={<ViewEvents />} />
						<Route path='userfeedback' element={<UserFeedback />} />
					</Route>
					<Route path='/select-seats/:id' element={<SeatSelectionPage />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
