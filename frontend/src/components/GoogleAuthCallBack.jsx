import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * GoogleAuthCallback Component
 * This component is responsible for handling the user's session after a successful
 * Google authentication and then redirecting them to the main application.
 */
function GoogleAuthCallback() {
    const { handleGoogleAuthSuccess } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // As soon as this component loads, try to establish the user's session.
        handleGoogleAuthSuccess()
            .then(() => {
                // On success, navigate to the main notes page.
                navigate('/');
            })
            .catch((error) => {
                // If there's an error, log it and send the user to the login page with an error message.
                console.error("Google authentication callback failed:", error);
                navigate('/login?error=google_auth_failed');
            });
    }, [handleGoogleAuthSuccess, navigate]);

    // Display a loading spinner while the authentication is being processed.
    return <LoadingSpinner />;
}

export default GoogleAuthCallback;
