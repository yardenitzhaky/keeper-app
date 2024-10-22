import React, { useState, useEffect } from 'react';

const CookieAlert = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedBrowser, setSelectedBrowser] = useState(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('chrome')) return 'chrome';
    return 'chrome';
  });

  useEffect(() => {
    const hasAcknowledged = localStorage.getItem('cookieAlertAcknowledged');
    if (hasAcknowledged) {
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAlertAcknowledged', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span role="img" aria-label="warning" className="text-yellow-500">⚠️</span>
              Cookie Settings Required
            </h2>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              I've Enabled Cookies
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="mb-6 text-gray-600">
              To use Keeper App, you need to allow cookies and disable tracking prevention in your browser. 
              This is required for maintaining your login session and ensuring the app functions properly.
            </p>

            {/* Browser Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedBrowser('chrome')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedBrowser === 'chrome' 
                    ? 'bg-gray-100 border-gray-300 font-medium' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } border`}
              >
                Chrome
              </button>
              <button
                onClick={() => setSelectedBrowser('safari')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedBrowser === 'safari' 
                    ? 'bg-gray-100 border-gray-300 font-medium' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } border`}
              >
                Safari
              </button>
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              {selectedBrowser === 'chrome' ? (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Chrome Desktop Instructions:</h3>
                    <ol className="space-y-2 list-decimal ml-4 text-gray-700">
                      <li>Click the three dots menu (⋮) in the top-right corner</li>
                      <li>Select "Settings"</li>
                      <li>Click "Privacy and security" in the left sidebar</li>
                      <li>Click "Cookies and other site data"</li>
                      <li>Select "Allow all cookies"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Chrome Mobile Instructions:</h3>
                    <ol className="space-y-2 list-decimal ml-4 text-gray-700">
                      <li>Tap the three dots menu (⋮)</li>
                      <li>Tap "Settings"</li>
                      <li>Tap "Privacy and security"</li>
                      <li>Tap "Cookies"</li>
                      <li>Select "Allow all cookies"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Safari Desktop Instructions:</h3>
                    <ol className="space-y-2 list-decimal ml-4 text-gray-700">
                      <li>Click Safari in the top menu</li>
                      <li>Select "Settings" (or press ⌘ + ,)</li>
                      <li>Go to "Privacy & Security"</li>
                      <li>Under "Website tracking":</li>
                      <li>Uncheck "Prevent cross-site tracking"</li>
                      <li>Select "Allow all cookies" under Cookies and website data</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Safari Mobile Instructions:</h3>
                    <ol className="space-y-2 list-decimal ml-4 text-gray-700">
                      <li>Open iPhone Settings</li>
                      <li>Scroll down and tap "Safari"</li>
                      <li>Under "Privacy & Security":</li>
                      <li>Turn off "Prevent Cross-Site Tracking"</li>
                      <li>Turn off "Block All Cookies"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> After changing these settings, you may need to refresh the page or restart your browser for the changes to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieAlert;