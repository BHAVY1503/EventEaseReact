// src/pages/SignUpPageWithLanding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../src/components/common/LandingPage'; 
import { SignUpModal } from './components/user/SignupModal'; 




export const SignUpPageWithLanding = () => {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  return (
    <div>
      <LandingPage />
      {showModal && (
        <SignUpModal onClose={() => { setShowModal(false); navigate('/', { replace: true }); }} />
      )}

    </div>
    
  );
};
