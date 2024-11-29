import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import CaptureCard from "~/components/CapturePage/CaptureCard";
import downloadImage from "~/utils/downloadUtils";
import Image from "next/image";
import UploadComponent from "~/components/UploadComponent";
import TitleDescription from "~/components/TitleDescription";
import FallingClipart from "~/components/BackgroundFallAnimation/FallingClipart";
import CameraLoading from "~/components/LoadingAnimation/CameraLoading";
import Cookies from "js-cookie";
import { generateUniqueId } from "~/utils/generateUniqueId";
import { useRouter } from "next/router";
import RequestRemovalModal from "~/components/RequestRemovalModal";
import CapturePopup from "~/components/CapturePopup";



const Pronight = () => {
  const { data: images, isLoading, error } = api.gallery.getAllGallery.useQuery();
  const logDownload = api.download.logDownload.useMutation();
  const submitRemovalRequest = api.request.submit.useMutation();
  const cookieId = Cookies.get("cookieId") || generateUniqueId();
  Cookies.set("cookieId", cookieId, { expires: 365 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [removalImage, setRemovalImage] = useState<string | null>(null);
  const filteredImages = images?.filter((image) => image.event_category === 'pronight') || [];
  const router = useRouter();
  const { data: cardState } = api.capturecard.getCardStateByName.useQuery(
    { cardName: "Pronight" }
  );
  useEffect(() => {
    if (cardState === "inactive") {
      router.push("/captures"); // Redirect to /capture if inactive
    }
  }, [cardState, router]);
  
  const handleImageClick = (imagePath: string) => setSelectedImage(imagePath);
  const handleClosePopup = () => setSelectedImage(null);

  const handleDownload = async (imagePath: string) => {
    await downloadImage(imagePath, "capture-incridea.png");
    await logDownload.mutateAsync({ file_path: imagePath , cookieId});
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openRemovalPopup = (imagePath: string) => {
    setRemovalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeRemovalPopup = () => {
    setRemovalImage(null);
    setIsModalOpen(false);
  };

  const handleRemovalSubmit = async (data: {
    name: string;
    email: string;
    description: string;
    uploadUrl: string;
    imagePath: string;
  }) => {
    try {
      // Replace with your API call to submit the removal request
      await submitRemovalRequest.mutateAsync({
        name: data.name,
        email: data.email,
        description: data.description,
        idcard: data.uploadUrl,
        image_path: data.imagePath,
      });
      console.log("Request submitted successfully");
    } catch (error) {
      console.error("Error submitting removal request:", error);
    }
  };

  if (isLoading) return <CameraLoading/>;
  if (error) return <p className="text-white text-center">Error loading images.</p>;

  return (
    <div>
    <TitleDescription 
        title="Pronight Captures" 
        description="Engaging our audience and building community through strategic social media initiatives"
        imagePath="https://utfs.io/f/0yks13NtToBitJchJ4NSCB2X9TSlbJxWYgG6rpN3n8swf4Fz"
      />
    <FallingClipart />
    <div
        className="grid gap-4 p-10"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gridAutoRows: "auto",
        }}
      >
        {filteredImages.map((image) => {
          return (
            <div key={image.id} className="relative overflow-hidden rounded-lg z-20">
              <CaptureCard
                imagePath={image.image_path}
                altText="Snaps image"
                onClick={() => handleImageClick(image.image_path)}
              />
            </div>
          );
        })}
      </div>

      <CapturePopup
        selectedImage={selectedImage}
        handleClosePopup={handleClosePopup}
        handleDownload={handleDownload}
        openRemovalPopup={openRemovalPopup}
        cookieId = {cookieId}
      />

      <RequestRemovalModal
        isOpen={isModalOpen}
        imagePath={removalImage}
        onClose={closeRemovalPopup}
        onSubmit={handleRemovalSubmit}
      />
    </div>
  )
}

export default Pronight
