import { api } from '~/utils/api';
import React, { useEffect, useRef, useCallback } from 'react';
import TeamCard from '~/components/TeamCard'; // Adjust path if needed

const SocialMediaPage: React.FC = () => {
  const isLogged = useRef(false); // Use a ref to persist the logged state
  const addLog = api.web.addLog.useMutation();
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const logIP = useCallback(async () => {
    if (isLogged.current) return; // Exit if already logged
    try {
      const initialPage = window.location.pathname; // Capture initial page name

      const response = await fetch('/api/get-ip');
      const data = await response.json() as { ip: string }; // Ensure data has the correct type
      console.log('IP:', data.ip);

      await delay(5000); // 5-second delay

      // Check if user is still on the same page
      const currentPage = window.location.pathname;
      if (initialPage === currentPage) {
        await addLog.mutateAsync({ ipAddress: data.ip, pageName: initialPage });
        console.log('IP logged successfully');
        isLogged.current = true; // Set to true after logging
      } else {
        console.log('User navigated to a different page. Logging aborted.');
      }
    } catch (error) {
      console.error('Failed to log IP:', error);
    }
  }, [addLog]);

  useEffect(() => {
    logIP().catch(console.error); // Handle promise to avoid no-floating-promises error
  }, [logIP]);

  const { data: teamMembers, isLoading, error } = api.team.getAllTeams.useQuery(); // Fetch data with tRPC

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500">Error loading media teams: {error.message}</div>;
  }
  if (!teamMembers || teamMembers.length === 0) {
    return <div className="text-white">No media team members found.</div>;
  }

  return (
    <div className="flex flex-col items-center bg-black">
      {/* Title Section */}
      <div className="relative w-full h-[50vh] md:h-[55vh] bg-cover bg-center" style={{ backgroundImage: "url('/images/socialmedia-bg.png')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">Social Media Team</h1>
          <p className="mt-2 text-base md:text-lg text-gray-300 max-w-2xl text-center">
            Engaging our audience and building community through strategic social media initiatives.
          </p>
        </div>
      </div>
      {/* Cards Section */}
      <div className="text-white py-6 md:py-12 px-4 md:px-6 flex flex-col md:flex-row flex-wrap justify-center gap-6 md:gap-8">
        {/* Render Card components for each team member */}
        {teamMembers.map((member, index) => (
          member.committee === 'socialmedia' && ( // Check if the committee is media
            <TeamCard
              key={index}
              imageSrc={member.image} // Assuming 'image' is the correct field from your database
              name={member.name.toUpperCase()}
              designation={member.designation.toUpperCase()}
              say={member.say}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default SocialMediaPage;
