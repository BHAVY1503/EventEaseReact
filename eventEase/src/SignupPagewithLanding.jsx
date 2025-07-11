// src/pages/SignUpPageWithLanding.jsx
import React, { useState } from 'react';
import { LandingPage } from '../src/components/common/LandingPage'; 
import { SignUpModal } from './components/user/SignupModal'; 




export const SignUpPageWithLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      <LandingPage />
      {showModal && <SignUpModal onClose={() => setShowModal(false)} />}
     

    </div>
    
  );
};
