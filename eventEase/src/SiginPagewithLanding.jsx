import React, { useState } from 'react';
import { LandingPage } from '../src/components/common/LandingPage'; 
import { SignInModal } from './components/user/SignInModal'; 



export const SigninPageWithLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      <LandingPage />
      {showModal && <SignInModal onClose={() => setShowModal(false)} />}
     

    </div>
    
  );
};