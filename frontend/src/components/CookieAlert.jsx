import React, { useState } from 'react';
import { AlertTriangle, Chrome, Safari } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CookieAlert = () => {
  const [selectedBrowser, setSelectedBrowser] = useState(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('chrome')) return 'chrome';
    return 'chrome'; // Default to Chrome instructions
  });

  const chromeInstructions = (
    <div className="space-y-4">
      <h3 className="font-medium mb-2">Chrome Desktop Instructions:</h3>
      <ol className="list-decimal list-inside space-y-2">
        <li>Click the three dots menu (⋮) in the top-right corner</li>
        <li>Select "Settings"</li>
        <li>Click "Privacy and security" in the left sidebar</li>
        <li>Click "Cookies and other site data"</li>
        <li>Select "Allow all cookies" or ensure the following settings:
          <ul className="list-disc list-inside ml-6 mt-1 text-sm">
            <li>Enable "Allow sites to save and read cookie data"</li>
            <li>Disable "Block third-party cookies"</li>
          </ul>
        </li>
        <li>Refresh this page</li>
      </ol>

      <h3 className="font-medium mt-4 mb-2">Chrome Mobile Instructions:</h3>
      <ol className="list-decimal list-inside space-y-2">
        <li>Tap the three dots menu (⋮)</li>
        <li>Tap "Settings"</li>
        <li>Tap "Privacy and security"</li>
        <li>Tap "Cookies"</li>
        <li>Select "Allow all cookies"</li>
        <li>Refresh this page</li>
      </ol>
    </div>
  );

  const safariInstructions = (
    <div className="space-y-4">
      <h3 className="font-medium mb-2">Safari Desktop Instructions:</h3>
      <ol className="list-decimal list-inside space-y-2">
        <li>Click Safari in the top menu</li>
        <li>Select "Settings" (or press ⌘ + ,)</li>
        <li>Go to "Privacy & Security"</li>
        <li>Under "Website tracking":
          <ul className="list-disc list-inside ml-6 mt-1 text-sm">
            <li>Uncheck "Prevent cross-site tracking"</li>
            <li>Select "Allow all cookies" under Cookies and website data</li>
          </ul>
        </li>
        <li>Refresh this page</li>
      </ol>

      <h3 className="font-medium mt-4 mb-2">Safari Mobile Instructions:</h3>
      <ol className="list-decimal list-inside space-y-2">
        <li>Open iPhone Settings</li>
        <li>Scroll down and tap "Safari"</li>
        <li>Under "Privacy & Security":
          <ul className="list-disc list-inside ml-6 mt-1 text-sm">
            <li>Turn off "Prevent Cross-Site Tracking"</li>
            <li>Turn off "Block All Cookies"</li>
          </ul>
        </li>
        <li>Refresh this page</li>
      </ol>
    </div>
  );

  return (
    <Alert variant="destructive" className="max-w-3xl mx-auto mt-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mt-1" />
        <div className="ml-3 w-full">
          <AlertTitle className="text-lg font-semibold mb-2">Cookie Settings Required</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              To use Keeper App, you need to allow cookies and disable tracking prevention in your browser. 
              This is required for maintaining your login session and ensuring the app functions properly.
            </p>
            
            <Tabs defaultValue={selectedBrowser} className="w-full" onValueChange={setSelectedBrowser}>
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="chrome" className="flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  Chrome
                </TabsTrigger>
                <TabsTrigger value="safari" className="flex items-center gap-2">
                  <Safari className="h-4 w-4" />
                  Safari
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chrome" className="mt-4">
                {chromeInstructions}
              </TabsContent>
              <TabsContent value="safari" className="mt-4">
                {safariInstructions}
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-sm bg-red-100/10 p-3 rounded">
              <strong>Note:</strong> After changing these settings, you may need to refresh the page or restart your browser for the changes to take effect.
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default CookieAlert;