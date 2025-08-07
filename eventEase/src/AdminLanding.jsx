import React, { useState } from 'react';
import { LandingPage } from './components/common/LandingPage'; 
// Import your admin signin component here when you create it
import { AdminSignIn } from './components/admin/AdminSignIn'; 

export const AdminLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      <LandingPage/>
      {/* Uncomment when you have AdminSignin component */}
      {showModal && <AdminSignIn onClose={() => setShowModal(false)} />}
    </div>
  );
};
// Default export
// export default AdminSignin;

// // src/pages/SignUpPageWithLanding.jsx
// import React, { useState } from 'react';
// import { LandingPage } from '../src/components/common/LandingPage'; 
// import { SignUpModal } from './components/user/SignupModal'; 
// import { AdminSignIn } from './components/admin/AdminSingIn'; 




// export const AdminLanding = () => {
//   const [showModal, setShowModal] = useState(true);

//   return (
//     <div>
      
//       <LandingPage/>
//       {showModal && <AdminSignIn onClose={() => setShowModal(false)} />}

     

//     </div>
    
//   );
// };