// src/pages/SignUpPageWithLanding.jsx
import React, { useState } from 'react';
import { LandingPage } from '../src/components/common/LandingPage'; 
import { SignUpModal } from './components/user/SignupModal'; 
import { AdminSignIn } from './components/admin/AdminSingIn'; 




export const AdminLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      
      <LandingPage/>
      {showModal && <AdminSignIn onClose={() => setShowModal(false)} />}

     

    </div>
    
  );
};