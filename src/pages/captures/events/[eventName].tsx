import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import downloadImage from "~/utils/downloadUtils";
import Image from "next/image";
import UploadComponent from "~/components/UploadComponent";
import Cookies from "js-cookie";
import { generateUniqueId } from "~/utils/generateUniqueId";
import { Box, ImageList, ImageListItem } from "@mui/material";
import CameraLoading from "~/components/LoadingAnimation/CameraLoading";

const EventCaptures = () => {
  const router = useRouter();
  const { eventName } = router.query;
  const safeEventName = Array.isArray(eventName) ? eventName[0] : eventName || "Event";
  const formattedEventName = (safeEventName || "").replace(/-/g, " ");

  const { data: event } = api.events.getEventByName.useQuery({ name: formattedEventName });
  const { data: images, isLoading, error } = api.gallery.getAllGallery.useQuery();
  const logDownload = api.download.logDownload.useMutation();
  const submitRemovalRequest = api.request.submit.useMutation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [removalImage, setRemovalImage] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const filteredImages = images?.filter((image) => image.event_name === formattedEventName) || [];
  const cookieId = Cookies.get("cookieId") || generateUniqueId();
  Cookies.set("cookieId", cookieId, { expires: 365 });

  const handleImageClick = (imagePath: string) => setSelectedImage(imagePath);
  const handleClosePopup = () => setSelectedImage(null);

  const handleDownload = async (imagePath: string, cookieId: string) => {
    await downloadImage(imagePath, "capture-incridea.png");
    await logDownload.mutateAsync({ file_path: imagePath, cookieId });
  };

  const openRemovalPopup = (imagePath: string) => setRemovalImage(imagePath);
  const closeRemovalPopup = () => setRemovalImage(null);

  const handleUploadComplete = (url: string) => setUploadUrl(url);

  const handleSubmit = async () => {
    if (!name || !email || !description) {
      alert("Please fill all the fields and upload the ID card image.");
      return;
    }

    if (!uploadUrl) {
      alert("Select Upload Image after selecting the Image");
      return;
    }

    if (!removalImage) {
      alert("No Selected image to submit");
      return;
    }

    try {
      await submitRemovalRequest.mutateAsync({
        name,
        idcard: uploadUrl,
        description,
        image_path: removalImage || "",
        email,
      });
      closeRemovalPopup(); 
    
      // Reset form fields
      setName("");
      setDescription("");
      setEmail("");
      setUploadUrl("");
      setRemovalImage(null);
    } catch (error) {
      console.error("Error submitting removal request:", error);
    }
  };

  const devicecol = isMobile ? 3 : isTablet ? 3 : isDesktop ? 5 : 5;

  // Prefetch images when the component is mounted
  useEffect(() => {
    filteredImages.forEach((image) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = `${image.image_path}?w=248&fit=crop&auto=format`; // Prefetch image URL
      link.as = "image"; // Specify the resource type
      document.head.appendChild(link); // Append the <link> to the document head
    });

    // Cleanup: Remove prefetch links when the component is unmounted
    return () => {
      const links = document.querySelectorAll('link[rel="prefetch"]');
      links.forEach((link) => link.remove());
    };
  }, [filteredImages]); // Re-run the effect if `filteredImages` changes

  if (isLoading) return <CameraLoading />;
  if (error) return <p className="text-white text-center">Error loading images.</p>;

  return (
    <div className="p-6 bg-black min-h-screen">
      <h1 className="text-3xl md:text-7xl font-Hunters text-white text-center mb-8 mt-4 md:mb-4 md:mt-8 z-20">
        {formattedEventName} Captures
      </h1>
      {/* Display event description if it exists */}
      <div className="flex justify-center z-20">
        {event?.description && <p className="text-center text-gray-400 mb-16 w-3/4">{event.description}</p>}
      </div>
      <main className="flex justify-center items-center">
        <Box
          sx={{
            width: "100vw", // Full width of the viewport
            overflowY: "visible", // Let the content overflow naturally
            scrollbarWidth: "none", // Hide scrollbar in Firefox
            "&::-webkit-scrollbar": {
              display: "none", // Hide scrollbar in Chrome, Safari, Edge
            },
            WebkitOverflowScrolling: "touch", // Enable smooth scrolling for touch devices
          }}
        >
          <ImageList variant="masonry" cols={devicecol} gap={8}>
            {filteredImages.map((image) => (
              <ImageListItem key={image.id}>
                <Image
                  src={`${image.image_path}?w=248&fit=crop&auto=format`}
                  alt={image.event_name}
                  loading="lazy"
                  width={248}
                  height={0}
                  quality={20}
                  onClick={() => handleImageClick(image.image_path)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </main>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col items-center justify-center z-30" role="dialog" aria-modal="true">
          <div className="relative bg-black p-6 rounded-lg shadow-lg max-w-xs sm:max-w-md w-full z-30">
            <div className="flex">
              <h2 className="text-2xl w-full text-center font-bold text-white">Add Capture</h2>
              <button onClick={handleClosePopup} className="absolute top-0 right-5 text-white text-4xl p-5">&times;</button>
            </div>
            <div className="flex justify-center py-8">
              <Image src={selectedImage} alt="Selected" width={200} height={200} className="rounded mb-4" />
            </div>
            <div className="flex justify-center items-center space-x-4 py-5">
              <button
                className="bg-white hover:bg-black hover:text-white text-black px-2 py-2 rounded flex items-center transition-all"
                onClick={() => handleDownload(selectedImage, cookieId)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v12m8-8l-8 8-8-8"
                  />
                </svg>
                Download
              </button>
            </div>
            <p className="text-xs text-center py-5 w-full z-30">
              Note: If you prefer this capture not to be public or have any issues.<br /> Please {" "}
              <a
                className="text-blue-500 cursor-pointer"
                onClick={() => {
                  setSelectedImage(null);
                  openRemovalPopup(selectedImage);
                }}
              >
                click here to Request Removal
              </a>.<br />
              We’ll verify your request and work on it soon.
            </p>
          </div>
        </div>
      )}
      {removalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-30" role="dialog" aria-modal="true">
          <div className="relative bg-black p-6 rounded-lg shadow-lg max-w-xs sm:max-w-md w-full z-30">
            <h2 className="text-2xl text-white font-bold text-center mb-4 z-30">Request Removal</h2>
            <button onClick={closeRemovalPopup} className="absolute top-1 right-6 text-2xl text-white p-5">&times;</button>
            <div className="flex justify-center z-30">
              <Image src={removalImage} alt="Removal Image" width={90} height={90} className="rounded mb-4" />
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white"
              />
              <input
                type="email"
                placeholder="Preferred College Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white"
              />
              <input
                type="description"
                placeholder="Describe your issue with this image"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white"
              />
              <UploadComponent onUploadComplete={handleUploadComplete} resetUpload={() => setUploadUrl("")} />
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded z-40"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCaptures;
