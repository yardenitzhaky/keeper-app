import React, { useState } from 'react';

const CookieAlert = () => {
  const [selectedBrowser, setSelectedBrowser] = useState(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('chrome')) return 'chrome';
    return 'chrome';
  });

  return (
    <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
      <div className="flex items-start">
        <div className="w-full">
          <h2 className="text-xl font-bold mb-3 text-red-700">⚠️ Cookie Settings Required</h2>
          
          <p className="mb-4">
            To use Keeper App, you need to allow cookies and disable tracking prevention in your browser. 
            This is required for maintaining your login session and ensuring the app functions properly.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedBrowser('chrome')}
              className={`px-4 py-2 rounded ${
                selectedBrowser === 'chrome' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Chrome
            </button>
            <button
              onClick={() => setSelectedBrowser('safari')}
              className={`px-4 py-2 rounded ${
                selectedBrowser === 'safari' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Safari
            </button>
          </div>

          {selectedBrowser === 'chrome' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Chrome Desktop Instructions:</h3>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Click the three dots menu (⋮) in the top-right corner</li>
                  <li>Select "Settings"</li>
                  <li>Click "Privacy and security" in the left sidebar</li>
                  <li>Click "Cookies and other site data"</li>
                  <li>
                    Select "Allow all cookies" or ensure these settings:
                    <ul className="list-disc ml-5 mt-1">
                      <li>Enable "Allow sites to save and read cookie data"</li>
                      <li>Disable "Block third-party cookies"</li>
                    </ul>
                  </li>
                  <li>Refresh this page</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold mb-2">Chrome Mobile Instructions:</h3>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Tap the three dots menu (⋮)</li>
                  <li>Tap "Settings"</li>
                  <li>Tap "Privacy and security"</li>
                  <li>Tap "Cookies"</li>
                  <li>Select "Allow all cookies"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          )}

          {selectedBrowser === 'safari' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Safari Desktop Instructions:</h3>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Click Safari in the top menu</li>
                  <li>Select "Settings" (or press ⌘ + ,)</li>
                  <li>Go to "Privacy & Security"</li>
                  <li>
                    Under "Website tracking":
                    <ul className="list-disc ml-5 mt-1">
                      <li>Uncheck "Prevent cross-site tracking"</li>
                      <li>Select "Allow all cookies" under Cookies and website data</li>
                    </ul>
                  </li>
                  <li>Refresh this page</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold mb-2">Safari Mobile Instructions:</h3>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Open iPhone Settings</li>
                  <li>Scroll down and tap "Safari"</li>
                  <li>
                    Under "Privacy & Security":
                    <ul className="list-disc ml-5 mt-1">
                      <li>Turn off "Prevent Cross-Site Tracking"</li>
                      <li>Turn off "Block All Cookies"</li>
                    </ul>
                  </li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <strong>Note:</strong> After changing these settings, you may need to refresh the page or restart your browser for the changes to take effect.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieAlert;