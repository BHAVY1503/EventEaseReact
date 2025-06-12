import React, { useState } from 'react';
import { LandingPage } from './components/common/LandingPage'; 
import { OrganizerSignin } from './components/organizer/OrganizerSignin';


export const OrganizerSigninLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      
      <LandingPage/>
      {showModal && <OrganizerSignin onClose={() => setShowModal(false)} />}

     

    </div>
    
  );
};