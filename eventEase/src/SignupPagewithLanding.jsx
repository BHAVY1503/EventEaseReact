// src/pages/SignUpPageWithLanding.jsx
import React, { useState } from 'react';
import { LandingPage } from '../src/components/common/LandingPage'; // Adjust the path if needed
import { SignUpModal } from '../src/components/user/SignupModel'; // Adjust path

export const SignUpPageWithLanding = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div>
      <LandingPage />
      {showModal && <SignUpModal onClose={() => setShowModal(false)} />}
    </div>
  );
};
