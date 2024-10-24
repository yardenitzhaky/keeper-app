// import React, { useState, useEffect } from 'react';

// const CookieAlert = () => {
//   const [isVisible, setIsVisible] = useState(true);
//   const [selectedBrowser, setSelectedBrowser] = useState(() => {
//     const userAgent = navigator.userAgent.toLowerCase();
//     if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
//     if (userAgent.includes('chrome')) return 'chrome';
//     return 'chrome';
//   });

//   useEffect(() => {
//     const hasAcknowledged = localStorage.getItem('cookieAlertAcknowledged');
//     if (hasAcknowledged) {
//       setIsVisible(false);
//     }
//   }, []);

//   const handleAccept = () => {
//     localStorage.setItem('cookieAlertAcknowledged', 'true');
//     setIsVisible(false);
//   };

//   if (!isVisible) return null;

//   return (
//     <div className="cookie-alert-overlay">
//       <div className="cookie-alert-modal">
//         <div className="cookie-alert-header">
//           <h2 className="cookie-alert-title">
//             <span role="img" aria-label="warning">⚠️</span>
//             Cookie Settings Required
//           </h2>
//           <button className="cookie-alert-accept" onClick={handleAccept}>
//             I've Enabled Cookies
//           </button>
//         </div>

//         <div className="cookie-alert-content">
//           <p className="cookie-alert-description">
//             To use Keeper App, you need to allow cookies and disable tracking prevention in your browser. 
//             This is required for maintaining your login session and ensuring the app functions properly.
//           </p>

//           <div className="cookie-alert-browser-toggle">
//             <button
//               className={`cookie-alert-browser-button ${selectedBrowser === 'chrome' ? 'active' : ''}`}
//               onClick={() => setSelectedBrowser('chrome')}
//             >
//               Chrome
//             </button>
//             <button
//               className={`cookie-alert-browser-button ${selectedBrowser === 'safari' ? 'active' : ''}`}
//               onClick={() => setSelectedBrowser('safari')}
//             >
//               Safari
//             </button>
//           </div>

//           {selectedBrowser === 'chrome' ? (
//             <>
//               <div className="cookie-alert-instructions">
//                 <h3>Chrome Desktop Instructions:</h3>
//                 <ol>
//                   <li>Click the three dots menu (⋮) in the top-right corner</li>
//                   <li>Select "Settings"</li>
//                   <li>Click "Privacy and security" in the left sidebar</li>
//                   <li>Click "Cookies and other site data"</li>
//                   <li>Select "Allow all cookies"</li>
//                   <li>Refresh this page</li>
//                 </ol>
//               </div>

//               <div className="cookie-alert-instructions">
//                 <h3>Chrome Mobile Instructions:</h3>
//                 <ol>
//                   <li>Tap the three dots menu (⋮)</li>
//                   <li>Tap "Settings"</li>
//                   <li>Tap "Privacy and security"</li>
//                   <li>Tap "Cookies"</li>
//                   <li>Select "Allow all cookies"</li>
//                   <li>Refresh this page</li>
//                 </ol>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="cookie-alert-instructions">
//                 <h3>Safari Desktop Instructions:</h3>
//                 <ol>
//                   <li>Click Safari in the top menu</li>
//                   <li>Select "Settings" (or press ⌘ + ,)</li>
//                   <li>Go to "Privacy"</li>
//                   <li>Under "Website tracking":</li>
//                   <li>Uncheck "Prevent cross-site tracking"</li>
//                   <li>Refresh this page</li>
//                 </ol>
//               </div>

//               <div className="cookie-alert-instructions">
//                 <h3>Safari Mobile Instructions:</h3>
//                 <ol>
//                   <li>Open iPhone Settings</li>
//                   <li>Scroll down and tap "Safari"</li>
//                   <li>Under "Privacy & Security":</li>
//                   <li>Turn off "Prevent Cross-Site Tracking"</li>
//                   <li>Refresh this page</li>
//                 </ol>
//               </div>
//             </>
//           )}
//         </div>

//         <div className="cookie-alert-footer">
//           <strong>Note:</strong> After changing these settings, you may need to refresh the page or restart your browser for the changes to take effect.
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CookieAlert;

import React, { useState, useEffect } from 'react';

/**
 * CookieAlert Component
 * Displays instructions for enabling cookies based on user's browser
 * Persists acknowledgment in localStorage
 */
const CookieAlert = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Controls visibility of the alert
  const [isVisible, setIsVisible] = useState(true);
  
  // Detect and set browser type for instructions
  const [selectedBrowser, setSelectedBrowser] = useState(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    return 'chrome'; // Default to Chrome instructions
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Check if user has previously acknowledged the alert
  useEffect(() => {
    const hasAcknowledged = localStorage.getItem('cookieAlertAcknowledged');
    if (hasAcknowledged) {
      setIsVisible(false);
    }
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  // Handle user acceptance of cookie settings
  const handleAccept = () => {
    localStorage.setItem('cookieAlertAcknowledged', 'true');
    setIsVisible(false);
  };

  // Early return if alert shouldn't be visible
  if (!isVisible) return null;

  // ============================================================================
  // BROWSER-SPECIFIC INSTRUCTIONS
  // ============================================================================
  
  // Instructions for Chrome browsers
  const ChromeInstructions = () => (
    <>
      <div className="cookie-alert-instructions">
        <h3>Chrome Desktop Instructions:</h3>
        <ol>
          <li>Click the three dots menu (⋮) in the top-right corner</li>
          <li>Select "Settings"</li>
          <li>Click "Privacy and security" in the left sidebar</li>
          <li>Click "Cookies and other site data"</li>
          <li>Select "Allow all cookies"</li>
          <li>Refresh this page</li>
        </ol>
      </div>

      <div className="cookie-alert-instructions">
        <h3>Chrome Mobile Instructions:</h3>
        <ol>
          <li>Tap the three dots menu (⋮)</li>
          <li>Tap "Settings"</li>
          <li>Tap "Privacy and security"</li>
          <li>Tap "Cookies"</li>
          <li>Select "Allow all cookies"</li>
          <li>Refresh this page</li>
        </ol>
      </div>
    </>
  );

  // Instructions for Safari browsers
  const SafariInstructions = () => (
    <>
      <div className="cookie-alert-instructions">
        <h3>Safari Desktop Instructions:</h3>
        <ol>
          <li>Click Safari in the top menu</li>
          <li>Select "Settings" (or press ⌘ + ,)</li>
          <li>Go to "Privacy"</li>
          <li>Under "Website tracking":</li>
          <li>Uncheck "Prevent cross-site tracking"</li>
          <li>Refresh this page</li>
        </ol>
      </div>

      <div className="cookie-alert-instructions">
        <h3>Safari Mobile Instructions:</h3>
        <ol>
          <li>Open iPhone Settings</li>
          <li>Scroll down and tap "Safari"</li>
          <li>Under "Privacy & Security":</li>
          <li>Turn off "Prevent Cross-Site Tracking"</li>
          <li>Refresh this page</li>
        </ol>
      </div>
    </>
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="cookie-alert-overlay">
      <div className="cookie-alert-modal">
        {/* Header Section */}
        <div className="cookie-alert-header">
          <h2 className="cookie-alert-title">
            <span role="img" aria-label="warning">⚠️</span>
            Cookie Settings Required
          </h2>
          <button className="cookie-alert-accept" onClick={handleAccept}>
            I've Enabled Cookies
          </button>
        </div>

        {/* Content Section */}
        <div className="cookie-alert-content">
          <p className="cookie-alert-description">
            To use Keeper App, you need to allow cookies and disable tracking prevention in your browser. 
            This is required for maintaining your login session and ensuring the app functions properly.
          </p>

          {/* Browser Selection Buttons */}
          <div className="cookie-alert-browser-toggle">
            <button
              className={`cookie-alert-browser-button ${selectedBrowser === 'chrome' ? 'active' : ''}`}
              onClick={() => setSelectedBrowser('chrome')}
            >
              Chrome
            </button>
            <button
              className={`cookie-alert-browser-button ${selectedBrowser === 'safari' ? 'active' : ''}`}
              onClick={() => setSelectedBrowser('safari')}
            >
              Safari
            </button>
          </div>

          {/* Conditional Browser Instructions */}
          {selectedBrowser === 'chrome' ? <ChromeInstructions /> : <SafariInstructions />}
        </div>

        {/* Footer Section */}
        <div className="cookie-alert-footer">
          <strong>Note:</strong> After changing these settings, you may need to refresh the page or restart your browser for the changes to take effect.
        </div>
      </div>
    </div>
  );
};

export default CookieAlert;