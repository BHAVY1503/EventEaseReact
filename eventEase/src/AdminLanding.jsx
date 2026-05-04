import React, { useState } from 'react';
import { LandingPage } from './components/common/LandingPage'; 
import { AdminSignIn } from './components/admin/AdminSignIn'; 

export const AdminLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="relative min-h-screen bg-black">
      <LandingPage />
      {showModal && (
        <AdminSignIn 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default AdminLanding;