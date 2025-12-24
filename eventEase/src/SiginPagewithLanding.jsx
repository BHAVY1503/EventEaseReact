import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../src/components/common/LandingPage'; 
import SignInModal from './components/user/SignInModal'; 

export const SigninPageWithLanding = () => {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  return (
    <div>
      <LandingPage />
      {showModal && (
        <SignInModal onClose={() => { setShowModal(false); navigate('/', { replace: true }); }} />
      )}
    </div>
  );
};