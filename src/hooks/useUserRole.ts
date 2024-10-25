import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react'; // Import from NextAuth.js

const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const session = await getSession(); // Get the current session
        if (session) {
          setUserRole(session.user.role); // Set user role from session
        } else {
          setUserRole(null); // No session found
        }
      } catch (error) {
        console.error(error);
        setUserRole(null); // Handle error appropriately
      }
    };

    void fetchUserRole(); // Call the function to fetch user role directly

    // Optional: Subscribe to session changes (if your library supports it)
    const intervalId = setInterval(() => {
      fetchUserRole().catch(console.error); // Handle promise inside setInterval
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  return userRole;
};

export default useUserRole;
