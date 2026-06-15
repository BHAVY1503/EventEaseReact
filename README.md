# 🎟️ EventEase — The Premier Live Experience Ticketing Platform

EventEase is a state-of-the-art, high-performance web platform designed to handle live event curation, booking, and stadium seat allocation. Built with modern web design philosophies (responsive glassmorphic layouts, fluid animations, and dark mode support), it provides seamless workflows for Users, Organizers, and Administrators.

---

## 🚀 Key Features by User Role

### 👤 User Portal
* **Live Show Discovery:** Explore global trending events, stadium concerts, galas, and theatrical shows.
* **Interactive Map Selector:** Locate nearby events using integrated Mapbox and React Leaflet map pins.
* **Cinematic Seat Selection:** Real-time visual seat booking grids allowing users to pick individual seat tiers (VIP, premium, standard).
* **Secure Payment Integration:** Integrated with Razorpay SDK for instant checkout protocols.
* **Personal Ticket Hub:** View, print, or manage ticket bookings with unique digital ticketing badges.
* **Feedback Engine:** Submit reviews and ratings directly for events.

### 🏢 Organizer Portal
* **Event Builder:** Create and host events with rich content details, custom media banners, and pricing structures.
* **Stadium Selector & Layout Allocation:** Map events to specific stadium configurations.
* **Live Booking Manifests:** Track real-time ticket sales, quantities remaining, and attendee listings.
* **Interactive Dashboard:** High-level metrics showing active events, ticket logs, and generated revenue.

### 👑 Admin Control Center
* **User & Organizer Registry:** View, manage, and suspend user accounts or organizer credentials.
* **Stadium Configuration Builder:** Design custom stadium seating blueprints and seating capacities.
* **Refund Request Processing:** Dedicated dashboard for auditing, approving, or rejecting booking refund requests.
* **Inbox System:** Read and respond to contact inquiries or feedback from guests.
* **Overall Event Metrics:** Access consolidated visual data of all event bookings grouped by ticket type.

---

## 🛠️ Technology Stack

* **Core & Routing:** [React 18](https://react.dev/), [Vite](https://vite.dev/), [React Router DOM](https://reactrouter.com/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & [React Redux](https://react-redux.js.org/)
* **Styling & Components:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Maps & Geolocation:** [Mapbox GL](https://www.mapbox.com/), [React Leaflet](https://react-leaflet.js.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Payment Gateway:** [Razorpay Web SDK](https://razorpay.com/)

---

## 📂 Project Structure

```text
eventEase/
├── eventEase/                 # Frontend Source Code
│   ├── public/                # Static assets & icons
│   ├── src/
│   │   ├── assets/            # Project images and graphics
│   │   ├── components/
│   │   │   ├── admin/         # Admin views (Dashboards, Users, Stadiums, Refunds)
│   │   │   ├── common/        # Shared components (Landing, Navbar, ChatBot, MapPicker)
│   │   │   ├── organizer/     # Organizer portal (Dashboard, Event builder, Ticket manifests)
│   │   │   ├── ui/            # Shadcn UI primitives (Buttons, Dialogs, Cards)
│   │   │   └── user/          # User screens (Dashboard, Seat selections, Feedback)
│   │   ├── contexts/          # React Contexts (Dark Mode toggle, etc.)
│   │   ├── store/             # Redux Store slices & actions
│   │   ├── styles/            # Core CSS stylesheets (global overrides, page-specific modules)
│   │   ├── App.jsx            # Routing and core logic
│   │   └── main.jsx           # Entry point
│   ├── tailwind.config.js     # Tailwind Configuration
│   └── vite.config.js         # Vite Bundler Configuration
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 2. Clone and Setup Environment Variables
Create a `.env` file inside the `eventEase/eventEase/` folder with the following keys:

```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key_id
VITE_NAME_FOR_RP=your_name_for_rp
VITE_EMAIL_FOR_RP=your_email_for_rp
VITE_PHONE_NO_RP=your_phone_number_for_rp
```

### 3. Install Dependencies
Navigate to the frontend directory and install the packages:

```bash
cd eventEase/eventEase
npm install
```

### 4. Running the Development Server

```bash
npm run dev
```
The server will start locally, typically at `http://localhost:5173`.

### 5. Building for Production

```bash
npm run build
```
The production bundle will be generated in the `dist/` directory.

---

## 🌐 API Server
The application interfaces with a hosted Node.js server on Render:
* **Production Base URL:** `https://eventeasenode-js.onrender.com`
* **Local Fallback:** `http://localhost:3100` (can be configured in `App.jsx` for local development)
