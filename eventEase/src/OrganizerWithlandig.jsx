import React, { useState } from 'react';
import { LandingPage } from './components/common/LandingPage'; 
import { OrganizerSignup } from './components/organizer/OrganizerSignup';




export const OrganizerWithLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      
      <LandingPage/>
      {showModal && <OrganizerSignup onClose={() => setShowModal(false)} />}

     

    </div>
    
  );
};