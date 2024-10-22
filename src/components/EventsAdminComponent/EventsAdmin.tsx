import React, { useState } from 'react';
import { FaSearch, FaSync } from 'react-icons/fa'; // Import the reload icon
import UploadComponent from '../UploadComponent';
import { api } from '~/utils/api';
import { Day, EventType } from '@prisma/client';

const EventsAdmin: React.FC = () => {
  const addEvent = api.events.addEvent.useMutation();
  const updateVisibility = api.events.updateEventVisibility.useMutation();
  const { data: events, isLoading, isError, refetch } = api.events.getAllEvents.useQuery(); // Get refetch method

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [visibilityPopup, setVisibilityPopup] = useState<{
    id: number;
    name: string;
    currentVisibility: string;
    newVisibility: string;
  } | null>(null);
  
  const [newEvent, setNewEvent] = useState<{
    name: string;
    description: string;
    type: EventType;
    day: Day;
  }>({
    name: '',
    description: '',
    type: 'core',
    day: 'day1',
  });

  const [uploadUrl, setUploadUrl] = useState<string>('');

  const handleUploadComplete = (url: string) => {
    setUploadUrl(url);
  };

  const handleAddEventClick = () => {
    setIsPopupOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadUrl) {
      console.log('No URL to submit');
      return;
    }

    if (!newEvent.name || !newEvent.description || !newEvent.type || !newEvent.day) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const result = await addEvent.mutateAsync({ ...newEvent, uploadKey: uploadUrl });
      console.log('Event added:', result);
      setIsPopupOpen(false);
      setNewEvent({ name: '', description: '', type: 'core', day: 'day1' });
      setUploadUrl('');
      refetch(); // Refetch events after adding
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDoubleClickVisibility = (event: any) => {
    setVisibilityPopup({
      id: event.id,
      name: event.name,
      currentVisibility: event.visibility,
      newVisibility: event.visibility === 'active' ? 'inactive' : 'active',
    });
  };

  const handleVisibilityChange = async (id: number, name: string, currentState: string) => {
    const newState = currentState === "active" ? "inactive" : "active";    
      try {
        await updateVisibility.mutateAsync({ id });
        console.log(`Visibility updated to ${newState}`);
        setVisibilityPopup(null)
        refetch(); // Refetch events after visibility change
      } catch (error) {
        console.error('Error updating visibility:', error);
      }
  };
  const filteredEvents = events?.filter(event => {
    const matchesSearchTerm = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType = selectedEventType === 'all' || event.type === selectedEventType;
    const matchesDay = selectedDay === 'all' || event.day === selectedDay;

    return matchesSearchTerm && matchesEventType && matchesDay;
  });

  return (
    <div className="p-4">   
      <div className="mb-4 flex gap-2 flex-wrap">
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Search..."
            className="font-silkscreen text-white p-2 pl-10 border border-slate-700 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-white h-12 bg-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-6 transform -translate-y-1/2 text-gray-600">
            <FaSearch />
          </div>
        </div>

        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="p-2 rounded-xl bg-black h-12 font-silkscreen"
        >
          <option className='font-silkscreen' value="all">All</option>
          <option className='font-silkscreen' value="core">Core</option>
          <option className='font-silkscreen' value="technical">Technical</option>
          <option className='font-silkscreen' value="nontechnical">Non Technical</option>
          <option className='font-silkscreen' value="special">Special</option>
        </select>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="p-2 rounded-xl bg-black h-12 font-silkscreen"
        >
          <option className='font-silkscreen' value="all">All</option>
          <option className='font-silkscreen' value="day1">Day 1</option>
          <option className='font-silkscreen' value="day2">Day 2</option>
          <option className='font-silkscreen' value="day3">Day 3</option>
        </select>

        <button
          onClick={handleAddEventClick}
          className="bg-black text-white p-2 rounded-xl h-12 font-silkscreen" 
        >
          Add
        </button>

        {/* Reload Button */}
        <button
          onClick={() => refetch()} // Wrap refetch in an arrow function
          className="flex items-center bg-black text-white p-2 rounded-xl font-silkscreen"
        >
          <FaSync />
        </button>

      </div>

      {/* Events Table */}
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className='font-silkscreen'>Error loading events. Please try again later.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-black">
            <thead className="bg-white">
              <tr>
                <th className="font-silkscreen text-black border border-gray-300 p-2">Name</th>
                <th className="font-silkscreen text-black border border-gray-300 p-2">Description</th>                
                <th className="font-silkscreen text-black border border-gray-300 p-2">Type</th>
                <th className="font-silkscreen text-black border border-gray-300 p-2">Day</th>
                <th className="font-silkscreen text-black border border-gray-300 p-2">Visibility</th>
                <th className="font-silkscreen text-black border border-gray-300 p-2">Image</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents?.map((event) => (
                <tr key={event.id} className='hover:bg-gray-50 hover:text-black'>
                  <td className="font-silkscreen py-2 px-4 border-b border-slate-700 text-center">{event.name.toUpperCase()}</td>
                  <td className="font-silkscreen py-2 px-4 border-b border-slate-700 text-center">{event.description.toUpperCase()}</td>                  
                  <td className="font-silkscreen py-2 px-4 border-b border-slate-700 text-center">{event.type.toUpperCase()}</td>
                  <td className="font-silkscreen py-2 px-4 border-b border-slate-700 text-center">{event.day.toUpperCase()}</td>
                  <td
                    className="font-silkscreen py-2 px-4 border-b border-slate-700 text-center cursor-pointer"
                    onDoubleClick={() => handleDoubleClickVisibility(event)}
                  >
                    {event.visibility.toUpperCase()}
                  </td>
                  <td className="font-silkscreen py-2 px-4 border-b border-slate-700 text-center">
                    <img src={event.image} alt={event.name} className="h-16 w-16 object-cover" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup for Adding Event */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur z-50">
          <div className="bg-black p-4 rounded shadow-lg w-96">
            <div className='flex justify-end'>
              <h2 className="text-lg font-bold mb-2 text-center px-10" >Add Event</h2>
              <button onClick={() => setIsPopupOpen(false)} className="mb-2 text-white px-10 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Event Name"
                value={newEvent.name}
                onChange={handleFormChange}
                required
                className="border p-2 mb-2 w-full bg-black text-white"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newEvent.description}
                onChange={handleFormChange}
                required
                className="border p-2 mb-2 w-full bg-black text-white"
              />
              <select
                name="type"
                value={newEvent.type}
                onChange={handleFormChange}
                required
                className="border p-2 mb-2 w-full bg-black text-white"
              >
                <option value="core">Core</option>
                <option value="technical">Technical</option>
                <option value="nontechnical">Non Technical</option>
                <option value="special">Special</option>
              </select>
              <select
                name="day"
                value={newEvent.day}
                onChange={handleFormChange}
                required
                className="border p-2 mb-2 w-full bg-black text-white"
              >
                <option value="day1">Day 1</option>
                <option value="day2">Day 2</option>
                <option value="day3">Day 3</option>
              </select>
              <UploadComponent onUploadComplete={handleUploadComplete} />
              <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">Submit</button>
            </form>
            
          </div>
        </div>
      )}

      {/* Popup for Visibility Change */}
      {visibilityPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur z-50">
          <div className="flex-col justify-center bg-black p-14 rounded-3xl shadow-lg w-[40vw] h-auto ">
            <h2 className="text-lg font-bold mb-2 text-center">Change Visibility</h2>
            <div>
              <p className='text-center'>Current Visibility: {visibilityPopup.currentVisibility.toUpperCase()}</p>
              <p className='text-center'>Change to: {visibilityPopup.newVisibility.toUpperCase()}</p>
              <div className='flex justify-center gap-5 p-5'>
                <button onClick={() => handleVisibilityChange(visibilityPopup.id, visibilityPopup.name, visibilityPopup.currentVisibility)} className="  bg-white text-black p-2 rounded mt-2">Confirm ✓</button>
                <button onClick={() => setVisibilityPopup(null)} className="  bg-white text-black p-2 rounded mt-2">Cancel ✕</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsAdmin;
