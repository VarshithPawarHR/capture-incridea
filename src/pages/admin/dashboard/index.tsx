import React, { useEffect, useState } from 'react';
import TeamAdmin from '~/components/TeamAdmin/TeamAdmin';
import EventsAdmin from '~/components/EventsAdmin/EventsAdmin';
import CapturesAdmin from '~/components/CapturesAdmin/CapturesAdmin';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import RemovalRequest from '~/components/RemovalRequestAdmin/RemovalRequest';
import { api } from '~/utils/api';
import ManageRoles from '~/components/ManageRoles/ManageRoles';
import SMCUploads from '~/components/SMCUploads/SMCUploads';
import Stories from '~/components/Stories/Stories';
import ApproveCaptures from '~/components/ApproveCapture/ApproveCapture';
import ControlComponent from '~/components/ControlAdmin/ControlComponent';
import { Role } from '@prisma/client';
import { Aperture, Bell, BookCheck, CalendarCog, ChartNoAxesCombined, GalleryHorizontalEnd, ImageUp, Settings, UserCog, Users } from 'lucide-react';

const tabs = [
  {
    name: "events",
    sideBarContent: ({} : any) => <>Events <CalendarCog size={18}/></>,
    content: ()=><EventsAdmin />,
    permittedRoles: [Role.admin, Role.manager]
  },
  {
    name: "captures",
    sideBarContent: ({} : any) => <>Captures <Aperture size={18}/></>,
    content: ()=><CapturesAdmin />,
    permittedRoles: [Role.admin, Role.manager, Role.editor]
  },
  {
    name: "team",
    sideBarContent: ({} : any) => <>Teams <Users size={18}/></>,
    content: ()=><TeamAdmin />,
    permittedRoles: [Role.admin, Role.manager]
  },
  {
    name: "roles",
    sideBarContent: ({} : any) => <>User Roles <UserCog size={18}/></>,
    content: ()=><ManageRoles />,
    permittedRoles: [Role.admin]
  },
  {
    name: "removalrequest",
    sideBarContent: ({ pendingCount = 0 } = {}) => <>Request <Bell size={18}/> {pendingCount > 0 && (
      <span className="bg-yellow-300 text-black text-xs rounded-full aspect-square w-5 grid place-content-center">
        {pendingCount}
      </span>
    )}</>,
    content: ()=><RemovalRequest />,
    permittedRoles: [Role.admin, Role.manager, Role.editor]
  },
  {
    name: "controls",
    sideBarContent: ({} : any) => <>Settings <Settings size={18}/></>,
    content: ()=><ControlComponent />,
    permittedRoles: [Role.admin]
  },
  {
    name: "smc",
    sideBarContent: ({} : any) => <>SMC Uploads <ImageUp size={18}/></>,
    content: ()=><SMCUploads />,
    permittedRoles: [Role.admin, Role.editor, Role.smc]
  },
  {
    name: "stories",
    sideBarContent: ({} : any) => <>Capture Stories <GalleryHorizontalEnd  size={18}/></>,
    content: ()=><Stories />,
    permittedRoles: [Role.admin, Role.editor, Role.manager]
  },
  {
    name: "approvecap",
    sideBarContent: ({} : any) => <>Approve Captures <BookCheck size={18} /></>,
    content: ()=><ApproveCaptures />,
    permittedRoles: [Role.admin, Role.manager]
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: removalRequests } = api.request.getPendingCount.useQuery();

  useEffect(() => {
    setPendingCount(removalRequests || 0);
  }, [removalRequests]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      void router.push('/unauthorized');
    }

    if (status === 'authenticated' && session?.user?.role === 'user') {
      void router.push('/unauthorized');
    }
  }, [session, status, router]);

  const renderComponent = () => {
    const activeTabData = tabs.find(tab => tab.name === activeTab);
    if (activeTabData) {
      return activeTabData.content();
    } else {
      return (
        <div className="text-center mt-20 text-lg">
          <h1 className="text-center text-4xl font-bold mb-8 text-white">
            Hey {session?.user.name}
          </h1>
          <p className="text-blue-400">
            Use <span className="text-yellow-500">Tabs</span> to switch to your destination! 🚀
          </p>
          <p className="text-gray-300 mt-2">
            Don’t worry, we’ve got all your needs covered!
          </p>
          <p className="text-blue-400 mt-10">
            You are the <span className="text-yellow-500">&nbsp;{session?.user.role}&nbsp;</span>
            {session?.user.role === 'admin'
              ? ' and you have access to everything✌!'
              : session?.user.role === 'editor'
                ? 'and you can manage all media captures, story management and remove requests on this website✌!'
                : session?.user.role === 'manager'
                  ? 'and you can manage & update events and teams on this website✌!'
                  : 'keep up the great work!'}
          </p>
        </div>
      );
    }
  };

  const renderTabNavigation = () => (
    <div className="flex flex-col mb-4 gap-4">
      {
        tabs.map((tab) => {
          //happens string matching underthehood so not a problem
          //@ts-ignore
          if (tab.permittedRoles.includes(session?.user.role)) {
            return (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                }}
                className={`relative flex items-center justify-center gap-2 text-center p-2 rounded-lg text-lg ${activeTab === tab.name
                  ? 'bg-gradient-to-r from-blue-700 to-green-700 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gradient-to-r from-blue-700 to-green-700'
                  } transition duration-200`}
              >
                {tab.sideBarContent({pendingCount})}
              </button>
            );
          }
          return null;
        }
        )
      }
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-primary-950/50 text-white min-h-screen">
      {/* Sidebar */}
      <div className="md:w-48 w-full p-4 bg-primary-900">
        {renderTabNavigation()}
      </div>

      {/* Content Area */}
      <div className="md:w-5/6 w-full min-h-screen p-4">
        {renderComponent()}
      </div>
    </div>
  );
};

export default Dashboard;
