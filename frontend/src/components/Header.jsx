const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles complete logout process
   * Cleans up all sessions, cookies, and state
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await logout();
      
      // Additional cleanup
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Logout failed. Please try again.");
      
      // Optional: Show error message to user
      // You could add a toast notification here
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header>
      <h1>
        <span className="app-title">
          <HighlightIcon />
          Keeper App
        </span>
      </h1>
      {user && (
        <>
          <LoadingButton
            onClick={handleLogout}
            loading={isLoggingOut}
            className="logout-button"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </LoadingButton>
          {error && (
            <span className="error-message" role="alert">
              {error}
            </span>
          )}
        </>
      )}
    </header>
  );
};