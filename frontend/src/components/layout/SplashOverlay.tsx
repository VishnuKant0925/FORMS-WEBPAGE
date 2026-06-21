'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading out after 4.2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4200);

    // Completely remove the overlay from the DOM after the fade-out completes (4.8 seconds total)
    const unmountTimer = setTimeout(() => {
      setVisible(false);
    }, 4800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`global-splash-overlay ${fadeOut ? 'fade-out' : ''}`} role="status" aria-label="Loading NRSC Smart Leave Management System">
      <div className="splash-content animate-fade-in">
        
        {/* Custom Logo */}
        <div className="splash-logo-container">
          <Image
            src="/nrsc_slms_logo.png"
            alt="NRSC SLMS Logo"
            width={100}
            height={100}
            className="splash-logo-img"
            priority
          />
        </div>

        {/* Text Branding Area */}
        <div className="splash-text-group">
          <h1 className="splash-title-text">
            NRSC Smart Leave Management System
          </h1>
          <h2 className="splash-hindi-text">
            राष्ट्रीय सुदूर संवेदन केन्द्र
          </h2>
          <p className="splash-subtitle-text">
            Digital Leave Management Portal
          </p>
          <div className="splash-tagline-divider" />
          <p className="splash-tagline-text">
            Secure • Fast • Bilingual • Enterprise
          </p>
        </div>

        {/* Progress bar */}
        <div className="splash-bar">
          <div className="splash-bar-fill" />
        </div>

      </div>
    </div>
  );
}
